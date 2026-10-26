I want an animated explainer made in the "Ukiyo-e Woodblock" visual style (Art & Design Movements). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Noto Serif JP
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&display=block">
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
Name: Ukiyo-e Woodblock
Family: Art & Design Movements
Look: An Edo-period woodblock print in the manner of Hokusai: Prussian-blue bokashi gradients, a towering wave with claw-like foam whose spray breaks into data cubes, a cargo ship stacked with server racks in the trough, flat colour blocks with carved keyblock outlines, wood grain and washi fibre, a vertical-text cartouche and vermilion seal.
Motion: Printed like a real woodblock: the black keyblock lands first, then each colour block is pressed in turn (sky ochre, pale blue, mid blue, vermilion, Prussian) and the bokashi sky is wiped on last, while the wave swells, its claws lean and data-cube spray tumbles onto the rolling ship.
How it explains: An emaki handscroll unrolled right-to-left: golden kasumi clouds divide the scenes, a river of labelled prints floats to an Edo karakuri automaton, flow is drawn as currents with claw-foam heads, the learning loop is a Naruto whirlpool, numbers sit in paper cartouches and every judgement is a vermilion seal stamp.

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

REFERENCE STYLE SOURCE (styles/ukiyo-e.js; W/H_ are always 1280x720)
```js
{
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

  const C = {
    paper: '#ecdfc2', key: '#1b2236', prussD: '#16304f', pruss: '#24507e', mid: '#4d7ca6', light: '#93b4cc', pale: '#c9d6d6',
    foam: '#f1e8d2', sky: '#e3d2ab', fuji: '#6d84a0', hull: '#7d3f2c', ochre: '#d2a75c', grey: '#9aa8b0', red: '#c4432d', green: '#7a9a6a',
  };

  // Catmull-Rom sampling of a point list -> dense polyline
  const sample = (pts, per = 14) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const normals = (poly) => poly.map((p, i) => {
    const a = poly[Math.max(0, i - 1)], b = poly[Math.min(poly.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    return { tx, ty, nx: ty, ny: -tx }; // n = outward (left of travel)
  });
  const pathOf = (poly, close) => { const p = new Path2D(); poly.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); if (close) p.closePath(); return p; };

  // keyblock line: slightly uneven carved stroke
  const keyline = (c, path, w, col = C.key) => {
    c.save(); c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round';
    c.lineWidth = w; c.stroke(path);
    c.globalAlpha = 0.5; c.lineWidth = w * 0.6; c.translate(0.7, 0.5); c.stroke(path);
    c.restore();
  };

  // one foam claw: a hooked finger plus smaller fingers
  const claw = (c, x, y, nx, ny, tx, ty, L, r) => {
    const fingers = r.int(3, 4);
    for (let f = 0; f < fingers; f++) {
      const s = L * (1 - f * 0.2) * r.range(0.85, 1.1);
      const off = (f - (fingers - 1) / 2) * L * 0.24;
      const bx = x + tx * off, by = y + ty * off;
      const w = s * 0.22;
      // direction: outward then hooking forward and down (tangent)
      const cx1 = bx + nx * s * 0.9 + tx * s * 0.2, cy1 = by + ny * s * 0.9 + ty * s * 0.2;
      const ex = bx + nx * s * 0.75 + tx * s * 0.75, ey = by + ny * s * 0.75 + ty * s * 0.75;
      const cx2 = bx + nx * s * 0.45 + tx * s * 0.55, cy2 = by + ny * s * 0.45 + ty * s * 0.55;
      const p = new Path2D();
      p.moveTo(bx - tx * w, by - ty * w);
      p.quadraticCurveTo(cx1, cy1, ex, ey);
      p.quadraticCurveTo(cx2, cy2, bx + tx * w, by + ty * w);
      p.closePath();
      c.fillStyle = C.foam; c.fill(p);
      c.lineWidth = 1.6; c.strokeStyle = C.key; c.stroke(p);
    }
  };


  // broken, tapering vein lines + alternating lighter bands, following a contour (sign=-1 inward of outward normal)
  const veins = (c, poly, nn, o) => {
    const r = H.rng(o.seed), L = poly.length;
    for (let k = 0; k < o.count; k++) {
      const d = o.d0 + k * o.step + r.range(-3, 3);
      const tk = (o.toK || 0) * k, i0 = Math.floor(L * r.range(o.from[0], o.from[1])), i1 = Math.min(L - 1, Math.floor(L * (r.range(o.to[0], o.to[1]) - tk)));
      if (i1 - i0 < 4) continue;
      const pt = (i) => { const w = d + Math.sin(i * 0.07 + k) * 2.5; return [poly[i][0] + o.sign * nn[i].nx * w, poly[i][1] + o.sign * nn[i].ny * w]; };
      if (o.band && k % 2 === 0) {
        c.strokeStyle = o.band; c.lineWidth = o.step * 0.62; c.lineCap = 'round';
        c.beginPath(); for (let i = i0; i <= i1; i++) { const [x, y] = pt(i); i === i0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
      }
      c.strokeStyle = o.line; c.lineCap = 'round';
      const seg = 6;
      for (let a = i0; a < i1; a += seg) {
        const u = (a - i0) / (i1 - i0);
        c.lineWidth = H.lerp(o.w0, o.w1, u) * (u < 0.08 ? u / 0.08 : 1) + 0.3;
        c.beginPath(); for (let i = a; i <= Math.min(i1, a + seg); i++) { const [x, y] = pt(i); i === a ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
      }
    }
  };


  // keyblock-only context: key-coloured fills/strokes print; everything else carves the key away (occlusion)
  const keyOnly = (kc) => {
    const P = CanvasRenderingContext2D.prototype;
    const isKey = (st) => typeof st === 'string' && (st.startsWith('#1b2236') || st.startsWith('rgba(27, 34, 54'));
    const wrap = (name, prop) => { kc[name] = function (...a) { if (isKey(this[prop])) return P[name].apply(this, a); const g = this.globalCompositeOperation; this.globalCompositeOperation = 'destination-out'; P[name].apply(this, a); this.globalCompositeOperation = g; }; };
    wrap('fill', 'fillStyle'); wrap('fillRect', 'fillStyle'); wrap('fillText', 'fillStyle'); wrap('stroke', 'strokeStyle');
  };
  // finish-pass noise fields are deterministic -> compute once
  let FIELDS = null;
  const fields = (W, HH) => FIELDS || (FIELDS = { warp: fieldNoise(W, HH, 3, 30, 3), fine: fieldNoise(W, HH, 4, 2, 2, 0.15, 2.2), pap: fieldNoise(W, HH, 6, 3, 2, 2.5, 0.6), blot: fieldNoise(W, HH, 7, 40, 4) });

  // isometric data cube
  const cube = (c, x, y, s, rot) => {
    c.save(); c.translate(x, y); c.rotate(rot);
    const h = s * 0.58;
    const top = new Path2D(); top.moveTo(0, -s); top.lineTo(s * 0.87, -s + h); top.lineTo(0, -s + 2 * h); top.lineTo(-s * 0.87, -s + h); top.closePath();
    const left = new Path2D(); left.moveTo(-s * 0.87, -s + h); left.lineTo(0, -s + 2 * h); left.lineTo(0, s * 0.9); left.lineTo(-s * 0.87, s * 0.9 - h); left.closePath();
    const right = new Path2D(); right.moveTo(s * 0.87, -s + h); right.lineTo(0, -s + 2 * h); right.lineTo(0, s * 0.9); right.lineTo(s * 0.87, s * 0.9 - h); right.closePath();
    c.fillStyle = C.foam; c.fill(top); c.fillStyle = C.pale; c.fill(left); c.fillStyle = C.light; c.fill(right);
    c.lineWidth = Math.max(1, s * 0.12); c.strokeStyle = C.key; c.lineJoin = 'round';
    c.stroke(top); c.stroke(left); c.stroke(right);
    c.restore();
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // An emaki handscroll: the camera unrolls the scroll right-to-left, scenes are divided by golden kasumi
  // clouds, flow is shown by currents with claw-foam heads, labels are paper cartouches and tanzaku slips,
  // judgements are vermilion seal stamps.
  const fillKey = (c, path, col, w = 1.8) => { c.save(); c.translate(1.5, 1); c.fillStyle = col; c.fill(path); c.restore(); keyline(c, path, w); };
  const cartouche = (c, txt, x, y, size, p = 1, bg = '#e8d49a', align = 'center', fg = C.key) => {
    if (p <= 0) return; c.save(); c.font = `700 ${size}px "Noto Serif JP"`; c.textBaseline = 'middle';
    const w = c.measureText(txt).width + size * 1.1, h = size * 1.7, x0 = align === 'center' ? x - w / 2 : x;
    c.globalAlpha = Math.min(1, p * 1.5);
    const r = new Path2D(); r.rect(x0, y - h / 2, w, h);
    if (bg[0] === '#' && bg.length === 7) { const v = H.hex(bg), lt = v.map((q) => Math.round(q + (255 - q) * 0.35)), dk = v.map((q) => Math.round(q * 0.93)); c.fillStyle = vbok(c, y - h / 2, y + h / 2, [[0, `rgb(${lt})`], [0.45, bg], [1, `rgb(${dk})`]]); } else c.fillStyle = bg;
    c.fill(r); c.strokeStyle = C.key; c.lineWidth = 2; c.stroke(r); c.lineWidth = 1; c.strokeRect(x0 + 4, y - h / 2 + 4, w - 8, h - 8);
    c.fillStyle = fg; c.textAlign = 'center'; c.fillText(txt, x0 + w / 2, y + 1); c.restore();
  };
  const seal = (c, x, y, s, glyph, p, rot = 0.05) => { // vermilion seal stamped down
    if (p <= 0) return; const k = 1 + (1 - p) * 0.8; c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k); c.globalAlpha = Math.min(1, p * 2);
    c.fillStyle = C.red; c.fillRect(-s / 2, -s / 2, s, s); c.strokeStyle = '#efe2c6'; c.lineWidth = s * 0.06; c.strokeRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
    c.fillStyle = '#efe2c6'; c.strokeStyle = '#efe2c6'; c.lineCap = 'square'; c.lineWidth = s * 0.13;
    if (glyph === 'x') { c.beginPath(); c.moveTo(-s * 0.22, -s * 0.22); c.lineTo(s * 0.22, s * 0.22); c.moveTo(s * 0.22, -s * 0.22); c.lineTo(-s * 0.22, s * 0.22); c.stroke(); }
    else if (glyph === 'v') { c.beginPath(); c.moveTo(-s * 0.24, 0); c.lineTo(-s * 0.06, s * 0.18); c.lineTo(s * 0.24, -s * 0.2); c.stroke(); }
    else { c.font = `900 ${s * 0.62}px "Noto Serif JP"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(glyph, 0, s * 0.03); }
    c.restore();
  };
  const tanzaku = (c, txt, x, y, p = 1) => { // paper label slip hanging from a cord
    if (p <= 0) return; c.save(); c.globalAlpha = Math.min(1, p * 2); c.strokeStyle = C.key; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 16); c.lineTo(x, y - 4); c.stroke();
    c.font = '700 28px "Noto Serif JP"'; const w = c.measureText(txt).width + 20; const r = new Path2D(); r.rect(x - w / 2, y - 4, w, 40);
    const g = c.createLinearGradient(0, y - 4, 0, y + 36); g.addColorStop(0, '#f4ecd8'); g.addColorStop(1, '#e9dcbc'); c.fillStyle = g; c.fill(r); keyline(c, r, 1.4);
    c.fillStyle = C.key; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y + 16); c.restore();
  };
  const animal = (c, kind, x, y, s) => { // flat woodblock silhouette: grey cat / ochre shiba
    c.save(); c.translate(x, y); c.scale(s / 100, s / 100);
    const p = new Path2D();
    if (kind === 'cat') {
      p.ellipse(0, 18, 30, 34, 0, 0, 7); p.moveTo(22, -14); p.arc(0, -22, 24, 0, 7);
      const e = new Path2D(); e.moveTo(-22, -32); e.lineTo(-18, -58); e.lineTo(-4, -42); e.closePath(); e.moveTo(22, -32); e.lineTo(18, -58); e.lineTo(4, -42); e.closePath();
      fillKey(c, e, C.grey, 2); fillKey(c, p, C.grey, 2);
      c.strokeStyle = C.key; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(26, 40); c.quadraticCurveTo(58, 40, 50, 6); c.stroke(); c.strokeStyle = C.grey; c.lineWidth = 3; c.stroke();
      c.fillStyle = C.key; c.beginPath(); c.ellipse(-9, -24, 2.5, 4, 0, 0, 7); c.ellipse(9, -24, 2.5, 4, 0, 0, 7); c.fill();
    } else {
      p.ellipse(0, 18, 32, 32, 0, 0, 7); p.moveTo(26, -18); p.arc(0, -20, 26, 0, 7); p.moveTo(10, -6); p.ellipse(0, -8, 14, 10, 0, 0, 7);
      const e = new Path2D(); e.moveTo(-24, -26); e.lineTo(-22, -50); e.lineTo(-6, -40); e.closePath(); e.moveTo(24, -26); e.lineTo(22, -50); e.lineTo(6, -40); e.closePath();
      fillKey(c, e, C.ochre, 2); fillKey(c, p, C.ochre, 2);
      const m = new Path2D(); m.ellipse(0, -6, 12, 8, 0, 0, 7); c.fillStyle = '#f1e8d2'; c.fill(m);
      c.fillStyle = C.key; c.beginPath(); c.arc(-10, -24, 3, 0, 7); c.arc(10, -24, 3, 0, 7); c.arc(0, -10, 3.5, 0, 7); c.fill();
      c.strokeStyle = C.key; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(32, 0, 12, Math.PI * 0.6, Math.PI * 2.1); c.stroke(); c.strokeStyle = C.ochre; c.lineWidth = 3; c.stroke();
    }
    c.restore();
  };
  const print = (c, kind, x, y, s) => { const r = new Path2D(); r.rect(x - s / 2, y - s / 2, s, s * 1.15); fillKey(c, r, '#f1e8d2', 2); c.strokeStyle = C.key; c.lineWidth = 1; c.strokeRect(x - s / 2 + 5, y - s / 2 + 5, s - 10, s * 1.15 - 10); animal(c, kind, x, y + s * 0.12, s * 0.8); };
  const gear = (c, x, y, r, a, col) => { const p = new Path2D(); for (let i = 0; i < 24; i++) { const rr = i % 2 ? r : r * 1.2, aa = a + i / 24 * Math.PI * 2; p.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } p.closePath(); p.moveTo(x + r * 0.35, y); p.arc(x, y, r * 0.35, 0, 7, true); fillKey(c, p, col, 1.6); };
  const karakuri = (c, x, y, look, mood, gears, sc = 1.3) => { c.save(); c.translate(x, y); c.scale(sc, sc); karakuri0(c, 0, 0, look, mood, gears); c.restore(); };
  const karakuri0 = (c, x, y, look, mood, gears) => { // Edo automaton doll on a dais, with its gear cabinet (the weights)
    const dais = new Path2D(); dais.rect(x - 130, y + 70, 260, 36); fillKey(c, dais, vbok(c, y + 70, y + 106, [[0, '#94503a'], [1, '#5e2c1e']]));
    const cab = new Path2D(); cab.rect(x - 230, y - 40, 110, 140); fillKey(c, cab, vbok(c, y - 40, y + 100, [[0, '#5a4132'], [0.6, '#3b2a22'], [1, '#2a1d17']]));
    gears.forEach((a, i) => gear(c, x - 175 + (i % 2) * 22, y - 8 + i * 42, 17 - (i % 2) * 3, a, C.ochre));
    const body = new Path2D(); body.moveTo(x - 80, y + 70); body.lineTo(x - 50, y - 30); body.lineTo(x + 50, y - 30); body.lineTo(x + 80, y + 70); body.closePath(); fillKey(c, body, vbok(c, y - 30, y + 70, [[0, '#d65438'], [0.5, C.red], [1, '#a8331f']]));
    c.save(); c.clip(body); c.fillStyle = '#efe2c6'; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(x - 70 + i * 28 + (j % 2) * 14, y - 20 + j * 26, 4, 0, 7); c.fill(); } c.restore();
    const obi = new Path2D(); obi.rect(x - 58, y + 6, 116, 18); fillKey(c, obi, C.ochre, 1.4);
    const tray = new Path2D(); tray.rect(x + 20, y + 20, 90, 12); fillKey(c, tray, C.hull, 1.4);
    const head = new Path2D(); head.arc(x, y - 72, 40, 0, 7); fillKey(c, head, vbok(c, y - 112, y - 32, [[0, '#f7f0de'], [1, '#eaddc0']]), 2);
    c.save(); c.globalAlpha = 0.35; c.fillStyle = '#e8a08a'; c.beginPath(); c.ellipse(x - 24, y - 58, 8, 5, 0, 0, 7); c.ellipse(x + 24, y - 58, 8, 5, 0, 0, 7); c.fill(); c.restore();
    const hair = new Path2D(); hair.arc(x, y - 82, 41, Math.PI * 1.02, Math.PI * 1.98); hair.closePath(); hair.moveTo(x + 16, y - 128); hair.arc(x, y - 128, 16, 0, 7); c.fillStyle = C.key; c.fill(hair);
    const dx = (look - 0.5) * 10; c.strokeStyle = C.key; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 20 + dx, y - 70); c.lineTo(x - 8 + dx, y - 70); c.moveTo(x + 8 + dx, y - 70); c.lineTo(x + 20 + dx, y - 70); c.stroke();
    c.fillStyle = C.red; c.beginPath(); if (mood < 0) c.arc(x + dx * 0.5, y - 46, 5, Math.PI, 0); else c.arc(x + dx * 0.5, y - 50, 5, 0, Math.PI); c.fill();
  };
  // vertical bokashi: a colour block wiped darker at one end, as the printer grades the block with a damp cloth
  const vbok = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([u, col]) => g.addColorStop(u, col)); return g; };
  // a golden mist mass dividing two scenes: scalloped cloud bank printed as a gold bokashi (deep core wiping out
  // pale toward the scallops), dusted with mica, outlined by a fine keyline. Static per position -> cached.
  const KAS = {};
  const kasumi = (c, x, top, bot) => {
    const key = Math.round(x) + ':' + top + ':' + bot;
    let L = KAS[key];
    if (!L) {
      const r = H.rng(Math.round(x)), bumps = [];
      for (let y = top; y <= bot; y += 60) bumps.push([x - 90 + r.range(-20, 20), y + 30]);
      for (let y = bot; y >= top; y -= 60) bumps.push([x + 90 + r.range(-20, 20), y]);
      const ox = x - 160, oy = top - 50, lw = 320, lh = bot - top + 130;
      L = H.layer(lw, lh); L.ox = ox; L.oy = oy; const k = L.getContext('2d'); k.translate(-ox, -oy);
      const shape = new Path2D(); shape.rect(x - 90, top, 180, bot + 30 - top); bumps.forEach(([bx, by]) => { shape.moveTo(bx + 34, by); shape.arc(bx, by, 34, 0, Math.PI * 2); });
      // outline of the union: stroke every lobe, then fill every lobe over the inner halves
      k.strokeStyle = 'rgba(27,34,54,0.72)'; k.lineWidth = 2.6; k.lineJoin = 'round';
      bumps.forEach(([bx, by]) => { k.beginPath(); k.arc(bx, by, 34, 0, Math.PI * 2); k.stroke(); }); k.strokeRect(x - 90, top, 180, bot + 30 - top);
      const g = k.createLinearGradient(x - 126, 0, x + 126, 0);
      g.addColorStop(0, '#ece0bc'); g.addColorStop(0.2, '#e2cd92'); g.addColorStop(0.5, '#d4b25a'); g.addColorStop(0.8, '#e2cd92'); g.addColorStop(1, '#ece0bc');
      k.save(); k.translate(1.2, 0.8); k.fillStyle = g; k.fill(shape); k.restore();
      k.save(); k.clip(shape);
      // a second, horizontal wipe: the gold deepens toward the top of the bank
      const gv = k.createLinearGradient(0, top - 34, 0, bot + 64); gv.addColorStop(0, 'rgba(176,132,48,0.28)'); gv.addColorStop(0.45, 'rgba(176,132,48,0)'); gv.addColorStop(1, 'rgba(255,248,220,0.18)');
      k.fillStyle = gv; k.fillRect(x - 160, top - 50, 320, lh);
      // inner echo of each scallop (the carved line printed in a darker gold, as on Hiroshige's kasumi)
      k.strokeStyle = 'rgba(160,118,40,0.2)'; k.lineWidth = 1;
      bumps.forEach(([bx, by], i) => { const sgn = i < bumps.length / 2 ? -1 : 1; k.beginPath(); k.arc(bx - sgn * 7, by, 24, sgn < 0 ? Math.PI * 0.62 : -Math.PI * 0.38, sgn < 0 ? Math.PI * 1.38 : Math.PI * 0.38); k.stroke(); });
      // mica dust
      const mr = H.rng(Math.round(x) + 991);
      for (let i = 0; i < 1100; i++) { const px = mr.range(x - 130, x + 130), py = mr.range(top - 34, bot + 64), sz = mr.range(0.6, 1.6); k.fillStyle = mr() < 0.8 ? `rgba(255,248,222,${mr.range(0.35, 0.7)})` : `rgba(150,110,40,${mr.range(0.15, 0.3)})`; k.fillRect(px, py, sz, sz); }
      k.restore();
      KAS[key] = L;
    }
    c.drawImage(L, L.ox, L.oy);
  };
  const current = (c, pts, p, foam = true) => { // a stream line with claw-foam arrowhead
    if (p <= 0) return; const poly = sample(pts, 16), n = Math.max(2, Math.floor(poly.length * p)), part = poly.slice(0, n), nn = normals(part);
    for (const off of [-8, 0, 8]) { c.strokeStyle = off ? C.mid : C.pruss; c.lineWidth = off ? 2 : 5; c.lineCap = 'round'; c.beginPath(); part.forEach(([x, y], i) => { const X = x + nn[i].nx * off, Y = y + nn[i].ny * off; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke(); }
    if (foam) { const e = part[part.length - 1], q = nn[nn.length - 1], r = H.rng(7); claw(c, e[0], e[1], q.tx * 0.6 + q.nx * 0.4, q.ty * 0.6 + q.ny * 0.4, -q.nx, -q.ny, 26, r); }
  };
  const seaBand = (c, x0, x1, y, t) => { // water with wave lines along the foot of the scroll
    const g = c.createLinearGradient(0, y, 0, 720); g.addColorStop(0, C.light); g.addColorStop(0.18, C.mid); g.addColorStop(0.6, C.pruss); g.addColorStop(1, C.prussD); c.fillStyle = g; c.fillRect(x0, y, x1 - x0, 720 - y);
    c.strokeStyle = 'rgba(241,232,210,0.75)'; c.lineWidth = 1.6; for (let i = 0; i < 6; i++) { const yy = y + 14 + i * 18; c.beginPath(); for (let x = x0; x <= x1; x += 8) { const v = yy + Math.sin(x * 0.03 + i * 1.7 + t * 1.2) * 3; x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke(); }
    c.strokeStyle = C.key; c.lineWidth = 2; c.beginPath(); for (let x = x0; x <= x1; x += 8) { const v = y + Math.sin(x * 0.02 + t) * 4; x === x0 ? c.moveTo(x, v) : c.lineTo(x, v); } c.stroke();
    // little foam curls riding the waterline, anchored to the scroll
    for (let k = Math.ceil(x0 / 150); k * 150 <= x1; k++) { const fx = k * 150 + 40 * Math.sin(k * 2.3), fy = y + Math.sin(fx * 0.02 + t) * 4, r = H.rng(1000 + k * 7); claw(c, fx, fy, 0.25, -1, 1, 0.25, 15 + r.range(0, 5), r); }
  };

  // Fuji's snowcap (panel 0 shape); s scales it to narrower summits
  const fujiCap = (x, sx, sy, s) => { const cap = new Path2D(), P = (a, b) => [x + sx + (a - 905) * s, sy + (b - 400)];
    cap.moveTo(...P(905, 400)); cap.lineTo(...P(960, 398)); cap.lineTo(...P(990, 445)); [[970, 430], [955, 450], [935, 428], [918, 448], [895, 432], [880, 444]].forEach(([a, b]) => cap.lineTo(...P(a, b))); cap.closePath(); return cap; };
  // kozo fibres floating in the sheet (static -> cached)
  let FIB = null;
  const fibres = (W, HH) => { if (FIB) return FIB; FIB = H.layer(W, HH); const c = FIB.getContext('2d'), rf = H.rng(55);
    for (let i = 0; i < 300; i++) { const x = rf.range(0, W), y = rf.range(0, HH), l = rf.range(10, 40), a = rf.range(0, Math.PI * 2);
      c.strokeStyle = rf() < 0.5 ? 'rgba(255,250,235,0.24)' : 'rgba(120,95,60,0.13)'; c.lineWidth = rf.range(0.5, 1.1);
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + rf.range(-6, 6), y + Math.sin(a) * l * 0.5 + rf.range(-6, 6), x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    return FIB; };
  const explainUkiyo = (c0, W, HH, t) => {
    const E = H.ease, cl = H.clamp, S = (a, b) => cl((t - a) / (b - a), 0, 1);
    const keys = [[0, 0], [2.0, 0], [2.9, 1], [5.7, 1], [6.5, 2], [10.1, 2], [10.8, 3], [12.5, 3], [13.2, 4]];
    let pan = 0; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (t >= ta) pan = t >= tb ? b : H.lerp(a, b, E.inOut((t - ta) / (tb - ta))); }
    const camX = -pan * W; // the scroll unrolls right-to-left: later scenes lie to the left
    const c = c0;
    c.fillStyle = C.paper; c.fillRect(0, 0, W, HH);
    c.save(); c.translate(-camX, 0);
    const vis = (k) => Math.abs(pan - k) < 1.05, PX = (k) => -k * W; // panel k spans [PX(k), PX(k)+W]
    // continuous sky bokashi and top mist band along the whole scroll
    // the ochre sky plate printed over the whole scroll, paling to a light band at the horizon above the sea
    c.fillStyle = vbok(c, 0, 600, [[0, C.sky], [0.2, C.sky], [0.82, '#e7d8b4'], [1, '#efe5cc']]); c.fillRect(-5 * W, 0, 7 * W, 600);
    const sk = c.createLinearGradient(0, 0, 0, 200); sk.addColorStop(0, 'rgba(46,62,84,0.85)'); sk.addColorStop(1, 'rgba(90,100,110,0)'); c.fillStyle = sk; c.fillRect(-5 * W, 0, 7 * W, 200);
    seaBand(c, camX - 50, camX + W + 50, 600, t);

    // ---------- panel 0: hook ----------
    if (vis(0)) {
      const x = PX(0);
      const sun = new Path2D(); const sy = H.lerp(460, 250, E.out(S(0.1, 1.4))); sun.arc(x + 930, sy, 90, 0, 7); c.save(); c.globalAlpha = 0.95; c.fillStyle = C.red; c.fill(sun); c.restore();
      const fuji = new Path2D(); fuji.moveTo(x + 700, 600); fuji.quadraticCurveTo(x + 840, 520, x + 905, 400); fuji.lineTo(x + 960, 398); fuji.quadraticCurveTo(x + 1020, 520, x + 1170, 600); fuji.closePath(); fillKey(c, fuji, vbok(c, 398, 600, [[0, C.prussD], [0.55, C.fuji], [1, C.light]]));
      const cap = fujiCap(x, 905, 400, 1); fillKey(c, cap, C.foam, 1.4);
      current(c, [[x + 1250, 560], [x + 1000, 540], [x + 700, 560], [x + 420, 530]], E.inOut(S(0.4, 1.6)));
    }
    // ---------- panel 1: data — a river of labelled prints floats to the automaton ----------
    if (vis(1)) {
      const x = PX(1), kx = x + 430, ky = 410, K1 = 1.3;
      karakuri(c, kx, ky, 0.9, 1, [t * 0.5, -t * 0.7, t * 0.4]);
      tanzaku(c, 'model', kx + 150, ky + 150, S(2.6, 2.9));
      // river current (arrow) into the doll's tray
      current(c, [[x + 1250, 520], [x + 950, 490], [x + 720, 520], [x + 580, 470]], E.inOut(S(2.6, 3.3)));
      // boats, each carrying a print with a tanzaku label
      for (let i = 0; i < 9; i++) {
        const u = (t - 2.7 - i * 0.6) * 0.42; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 17 + 2)() < 0.5 ? 'cat' : 'dog', bx = H.lerp(x + 1330, x + 560, u), by = 500 + Math.sin(u * 9 + i) * 8, sh = 1 - E.in(cl((u - 0.82) / 0.18, 0, 1));
        if (sh < 0.05) continue;
        c.save(); c.translate(bx, by); c.scale(sh * 1.35, sh * 1.35); c.rotate(Math.sin(t * 2 + i) * 0.05);
        const hull = new Path2D(); hull.moveTo(-60, 0); hull.lineTo(60, 0); hull.lineTo(44, 20); hull.lineTo(-48, 20); hull.closePath(); fillKey(c, hull, vbok(c, 0, 20, [[0, '#94503a'], [1, '#5e2c1e']]), 1.6);
        print(c, kind, 0, -52, 70); tanzaku(c, kind, 0, 0, 1);
        c.restore();
      }
      // counter cartouche (numbers re-cut as they climb)
      const cp = S(3.0, 5.4), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      if (t > 2.9) { cartouche(c, Math.round(n).toLocaleString('en-US'), x + 830, 230, 66, S(2.9, 3.2)); cartouche(c, 'examples · training data', x + 830, 335, 26, S(3.1, 3.4), '#f1e8d2'); }
    }
    // ---------- panel 2: guess, check, adjust — the whirlpool loop ----------
    if (vis(2)) {
      const x = PX(2), kx = x + 430, ky = 410, adj = E.inOut(S(8.3, 9.1)), right = t >= 9.3;
      karakuri(c, kx, ky, 0.95, t < 7.4 ? 0 : right ? 1 : -1, [adj * 4, -adj * 5, adj * 3]);
      tanzaku(c, 'weights', kx - 228, ky + 150, S(6.5, 6.8));
      // new print on a stand
      const st = new Path2D(); st.rect(x + 695, 470, 10, 130); fillKey(c, st, C.hull, 1.4);
      print(c, 'cat', x + 700, 390, 120 * E.out(S(6.4, 6.8)));
      tanzaku(c, 'new picture', x + 700, 512, S(6.7, 7.0));
      // the guess, judged by a seal
      if (!right) {
        cartouche(c, 'dog?', x + 560, 150, 50, S(6.9, 7.1));
        seal(c, x + 675, 148, 70, 'x', S(7.45, 7.6));
        const rp = S(7.55, 7.95); if (rp > 0) { c.strokeStyle = C.red; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.ellipse(x + 605, 150, 145, 70, -0.05, -1.6, -1.6 + Math.PI * 1.9 * rp); c.stroke(); }
        if (t > 7.8) cartouche(c, 'wrong — it is a cat', x + 600, 250, 26, S(7.8, 8.0), '#f1e8d2', 'center', C.red);
        // ADJUST: the error runs back along a red thread to the gear cabinet
        const ep = S(7.9, 8.5); if (ep > 0) { const pts = sample([[x + 675, 185], [x + 560, 300], [x + 330, 250], [kx - 228, ky - 20]], 16), n = Math.floor(pts.length * ep); c.strokeStyle = C.red; c.lineWidth = 3.5; c.beginPath(); pts.slice(0, Math.max(2, n)).forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.stroke(); if (ep >= 1) cartouche(c, 'error', x + 470, 300, 24, 1, C.red, 'center', '#efe2c6'); }
      } else {
        cartouche(c, 'cat', x + 560, 150, 50, S(9.35, 9.55));
        seal(c, x + 672, 148, 70, 'v', S(9.65, 9.8));
      }
      // whirlpool diagram (the loop)
      const wx = x + 990, wy = 370, rot = t * 0.9;
      const wp = E.out(S(6.6, 7.2));
      if (wp > 0) {
        const disk = new Path2D(); disk.arc(wx, wy, 170 * wp, 0, 7); const dg = c.createRadialGradient(wx, wy, 0, wx, wy, 170 * wp); dg.addColorStop(0, C.prussD); dg.addColorStop(0.45, C.pruss); dg.addColorStop(1, C.mid); fillKey(c, disk, dg, 2);
        c.save(); c.clip(disk); c.strokeStyle = 'rgba(241,232,210,0.85)'; c.lineWidth = 3; c.beginPath(); for (let a = 0; a < 26; a += 0.05) { const r = 162 - a * 6; c.lineTo(wx + Math.cos(a + rot) * r, wy + Math.sin(a + rot) * r); } c.stroke();
        c.strokeStyle = C.pruss; c.lineWidth = 5; c.beginPath(); for (let a = 0; a < 26; a += 0.05) { const r = 155 - a * 6; c.lineTo(wx + Math.cos(a + rot) * r, wy + Math.sin(a + rot) * r); } c.stroke(); c.restore();
        const rc = H.rng(3); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + rot * 0.5; claw(c, wx + Math.cos(a) * 170 * wp, wy + Math.sin(a) * 170 * wp, Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 22 * wp, rc); }
      }
      const steps = [['Guess', -Math.PI / 2], ['Check', Math.PI / 6], ['Adjust', Math.PI * 5 / 6]], act = t < 7.45 ? 0 : t < 8.3 ? 1 : t < 9.3 ? 2 : Math.floor((t - 9.3) * 3) % 3;
      steps.forEach(([s, a], i) => cartouche(c, s, wx + Math.cos(a) * 100, wy + Math.sin(a) * 100, 27, S(6.9 + i * 0.15, 7.15 + i * 0.15), i === act && t > 6.9 ? '#e8b07a' : '#e8d49a'));
      // currents chase round the rim from step to step
      const arcPts = (a0, a1) => { const P = []; for (let k = 0; k <= 6; k++) { const a = H.lerp(a0, a1, k / 6); P.push([wx + Math.cos(a) * 212, wy + Math.sin(a) * 212]); } return P; };
      current(c, arcPts(-Math.PI / 2 + 0.45, Math.PI / 6 - 0.45), E.out(S(7.2, 7.5)));
      current(c, arcPts(Math.PI / 6 + 0.45, Math.PI * 5 / 6 - 0.45), E.out(S(7.9, 8.2)));
      current(c, arcPts(Math.PI * 5 / 6 + 0.45, Math.PI * 1.5 - 0.45), E.out(S(9.0, 9.3)));
      // a cube of data rides the whirlpool round the loop
      if (t > 7.0) { const a = -Math.PI / 2 + (t - 7.0) * 2.1; cube(c, wx + Math.cos(a) * 145, wy + Math.sin(a) * 145, 13, 0); }
    }
    // ---------- panel 3: progress — accuracy climbs like a mountain path ----------
    if (vis(3)) {
      const x = PX(3), gx = x + 150, gw = 680, base = 580, prog = E.inOut(S(10.8, 12.0));
      const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, acc = 61 + 36 * (1 - Math.pow(1 - u, 2.2)) + Math.sin(i * 1.7) * 1.5 * (1 - u); pts.push([gx + u * gw, base - (acc - 40) / 60 * 420]); }
      const ridge = new Path2D(); ridge.moveTo(gx, base); pts.forEach((p) => ridge.lineTo(...p)); ridge.lineTo(gx + gw, base); ridge.closePath();
      const sunY = H.lerp(520, 150, prog); const sun = new Path2D(); sun.arc(gx + gw * prog, sunY - 40, 42, 0, 7); c.fillStyle = C.red; c.fill(sun);
      c.save(); c.beginPath(); c.rect(gx - 5, 0, gw * prog + 6, HH); c.clip();
      const g = c.createLinearGradient(0, 150, 0, base); g.addColorStop(0, C.green); g.addColorStop(1, C.pruss); c.save(); c.translate(1.5, 1); c.fillStyle = g; c.fill(ridge); c.restore();
      c.strokeStyle = 'rgba(241,232,210,0.7)'; c.lineWidth = 1.5; for (let k = 1; k < 6; k++) { c.beginPath(); pts.forEach(([a, b], i) => (i ? c.lineTo(a, b + k * 26) : c.moveTo(a, b + k * 26))); c.stroke(); }
      keyline(c, ridge, 2.4); c.restore();
      c.strokeStyle = C.key; c.lineWidth = 2; c.beginPath(); c.moveTo(gx, base + 4); c.lineTo(gx + gw, base + 4); c.stroke();
      tanzaku(c, 'training rounds →', gx + gw / 2, base + 20, S(10.8, 11.1));
      const acc = Math.round(H.lerp(61, 97, prog));
      cartouche(c, 'accuracy', x + 990, 148, 30, S(10.7, 11.0));
      cartouche(c, acc + '%', x + 990, 270, 72, S(10.7, 11.0));
      cartouche(c, '61% → 97%', x + 990, 398, 30, S(11.0, 11.3), '#f1e8d2');
      seal(c, x + 1110, 470, 70, '優', S(12.05, 12.2), -0.08); // emphasis: "excellent" seal stamped on 97%
      const rp = S(12.1, 12.45); if (rp > 0) { c.strokeStyle = C.red; c.lineWidth = 5; c.beginPath(); c.ellipse(x + 990, 270, 158, 86, -0.04, -1.5, -1.5 + Math.PI * 1.9 * rp); c.stroke(); }
    }
    // ---------- panel 4: takeaway ----------
    if (vis(4)) {
      const x = PX(4);
      const fuji = new Path2D(); fuji.moveTo(x + 380, 600); fuji.quadraticCurveTo(x + 560, 500, x + 620, 380); fuji.lineTo(x + 660, 378); fuji.quadraticCurveTo(x + 720, 500, x + 900, 600); fuji.closePath(); fillKey(c, fuji, vbok(c, 378, 600, [[0, C.prussD], [0.55, C.fuji], [1, C.light]]));
      fillKey(c, fujiCap(x, 620, 380, 40 / 55), C.foam, 1.4);
      cartouche(c, 'More examples', x + 640, 190, 58, S(12.9, 13.2));
      current(c, [[x + 640, 245], [x + 615, 270], [x + 638, 294]], E.out(S(13.1, 13.4)), true);
      cartouche(c, 'better guesses', x + 640, 365, 58, S(13.2, 13.5));
      seal(c, x + 900, 440, 70, '学', S(13.5, 13.65));
    }
    // ---------- kasumi clouds divide the scenes ----------
    for (let k = 0; k <= 4; k++) { const bx = PX(k) + (k === 0 ? W : 0); if (bx < camX - 200 || bx > camX + W + 200) continue; kasumi(c, bx, 120, 560); }
    // mist bands top and bottom edge of the scroll
    c.fillStyle = vbok(c, 0, 30, [[0, '#cfac55'], [0.55, 'rgba(214,184,104,0.85)'], [1, 'rgba(220,194,122,0)']]); c.fillRect(camX - 10, 0, W + 20, 30);
    c.fillStyle = vbok(c, HH - 28, HH, [[0, 'rgba(220,194,122,0)'], [0.45, 'rgba(214,184,104,0.85)'], [1, '#cfac55']]); c.fillRect(camX - 10, HH - 28, W + 20, 28);
    c.restore();

    // ---------- pinned title cartouche (the hook shrinks into it) ----------
    const hp = E.inOut(S(1.6, 2.3));
    const tx = H.lerp(560, 1030, hp), ty = H.lerp(300, 58, hp), ts = H.lerp(1, 0.5, hp);
    c.save(); c.translate(tx, ty); c.scale(ts, ts);
    if (t > 0.15) { cartouche(c, 'How does AI learn?', 0, 0, 56, S(0.15, 0.5)); cartouche(c, 'AIはどう学ぶのか', 0, 92, 26 * H.lerp(1, 1.35, hp), S(0.5, 0.8), '#f1e8d2'); }
    c.restore();
    if (hp > 0.9) seal(c, 1250, 54, 30, '学', S(2.3, 2.45));

    // ---------- woodblock finish ----------
    const img = c.getImageData(0, 0, W, HH), d = img.data, { warp, fine, pap, blot } = fields(W, HH), rg = H.rng(2);
    for (let y = 0, p = 0; y < HH; y++) for (let x = 0; x < W; x++, p++) {
      const i = p * 4, lum = (d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15) / 255, inked = H.clamp((0.85 - lum) * 1.6, 0, 1), plate = H.clamp((0.94 - lum) * 1.3, 0, 1);
      const grain = Math.sin(y * 0.55 + warp[p] * 26 + x * 0.004) * 0.5 + fine[p] * 0.8;
      // wood grain and uneven take-up show in every printed block, pale plates included
      let s = 1 + grain * (0.07 + 0.07 * inked) * plate; s *= 1 + pap[p] * 0.035 + (rg() - 0.5) * 0.04; s *= 1 - Math.max(0, blot[p]) * 0.12 * plate;
      d[i] = d[i] * s + 6 * (1 - inked); d[i + 1] = d[i + 1] * s; d[i + 2] = d[i + 2] * s * 0.97 - 4 * (1 - inked);
    }
    c.putImageData(img, 0, 0);
    c.drawImage(fibres(W, HH), 0, 0);
    H.vignette(c, W, HH, 0.25, '90,60,30');
  };

  registerStyle({
    id: 'ukiyo-e',
    name: 'Ukiyo-e Woodblock',
    category: 'Art & Design Movements',
    description: 'An Edo-period woodblock print in the manner of Hokusai: Prussian-blue bokashi gradients, a towering wave with claw-like foam whose spray breaks into data cubes, a cargo ship stacked with server racks in the trough, flat colour blocks with carved keyblock outlines, wood grain and washi fibre, a vertical-text cartouche and vermilion seal.',
    motion: 'Printed like a real woodblock: the black keyblock lands first, then each colour block is pressed in turn (sky ochre, pale blue, mid blue, vermilion, Prussian) and the bokashi sky is wiped on last, while the wave swells, its claws lean and data-cube spray tumbles onto the rolling ship.',
    fonts: ['700 26px "Noto Serif JP"', '400 15px "Noto Serif JP"', '900 22px "Noto Serif JP"'],
    frameT: 5.2,
    duration: 5.5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'An emaki handscroll unrolled right-to-left: golden kasumi clouds divide the scenes, a river of labelled prints floats to an Edo karakuri automaton, flow is drawn as currents with claw-foam heads, the learning loop is a Naruto whirlpool, numbers sit in paper cartouches and every judgement is a vermilion seal stamp.',
    explainer(ctx, W, HH, t) { explainUkiyo(ctx, W, HH, t); },
    // Sound: an emaki handscroll and a woodblock workshop. The scroll unrolls between scenes (paper over a wooden
    // roller), water laps under the whole scroll, currents swish as they flow, counters are a carving chisel, the
    // karakuri's wooden gears ratchet, every judgement is a vermilion seal pressed down, and a koto answers each
    // guess (unresolved for "dog?", bent down for wrong, resolving for right). A taiko lands the 97%.
    // Times copied from explainUkiyo().
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const card = (a, b) => a + (b - a) / 1.5; // cartouches fade in fully at 2/3 of their S(a,b)
      // koto pluck: bright attack that darkens, a tiny pitch settle
      const koto = (t, n, g, p, minor, bend) => { const f = k.hz(n);
        k.tone(t, { f: bend ? [[0, f], [0.08, f], [0.5, f * 0.89]] : [[0, f * 1.012], [0.05, f]], type: 'sawtooth', dur: 1.3, gain: 0.05 * g, a: 0.002, filter: 'lowpass', f2: [[0, 2600], [0.25, 900], [1.3, 500]], q: 1.5, pan: p, verb: 0.3, minor });
        k.tone(t, { f, type: 'triangle', dur: 1.0, gain: 0.06 * g, a: 0.002, pan: p, minor }); };
      // seal pressed into the paper: a firm soft thump, the paper giving a little
      const sealP = (t, g, p, minor) => { k.play('stamp', t, { gain: 0.6 * g, pan: p, minor }); k.noise(t + 0.01, { dur: 0.12, color: 'pink', filter: 'bandpass', f: 1100, q: 0.7, gain: 0.08 * g, a: 0.01, pan: p, minor }); };
      // carving chisel knocking out a numeral
      const chisel = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1600, q: 2, gain: 0.3 * g, a: 0.001, pan: p }); k.tone(t, { f: 240, dur: 0.05, gain: 0.08 * g, pan: p }); });
      // hyoshigi: two dry wooden clappers struck once
      const clack = (t, g, p) => { k.noise(t, { dur: 0.06, filter: 'bandpass', f: 1250, q: 6, gain: 0.5 * g, a: 0.001, pan: p }); k.noise(t, { dur: 0.015, filter: 'highpass', f: 2500, gain: 0.15 * g, pan: p }); };
      // a current of water flowing along
      const swish = (t, dur, g, p) => k.noise(t, { dur: dur + 0.15, color: 'pink', filter: 'bandpass', f: [[0, 400], [dur * 0.6, 1100], [dur + 0.15, 500]], q: 1.1, gain: 0.08 * g, a: dur * 0.5, pan: p, minor: true });
      // the scroll unrolls: paper sliding off the wooden roller
      const unroll = (t, dur) => {
        k.noise(t, { dur, color: 'brown', filter: 'bandpass', f: [[0, 160], [dur * 0.5, 300], [dur, 160]], q: 1, gain: 0.18, a: dur * 0.4 });
        k.play('paper', t + 0.2, { dur: dur - 0.3, gain: 0.75 });
      };
      const IN = ['D4', 'Eb4', 'G4', 'A4', 'Bb4', 'D5'];

      k.bed('room', 0, D, { gain: 0.3 });
      k.noise(0, { dur: D, color: 'pink', filter: 'lowpass', f: 450, gain: 0.035, a: 1, hold: D - 2, minor: true }); // water under the scroll

      // ---- panel 0: the sun rises (0.1-1.4), a current flows (0.4-1.6), title cartouches fade in, seal (2.45)
      swish(0.4, 1.2, 1, 0.3);
      koto(card(0.15, 0.5), 'D4', 1, -0.2); koto(card(0.15, 0.5) + 0.12, 'A4', 0.8, -0.1);
      koto(card(0.5, 0.8), 'G4', 0.8, 0.1, true); koto(card(0.5, 0.8) + 0.16, 'D5', 0.6, 0.2, true);
      k.noise(1.6, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.7, 900]], q: 0.7, gain: 0.06, a: 0.3, pan: 0.5, minor: true }); // title slides to the corner
      sealP(2.45, 0.5, 0.9, true);

      // ---- the scroll unrolls between scenes
      [[2.0, 2.9], [5.7, 6.5], [10.1, 10.8], [12.5, 13.2]].forEach(([a, b]) => unroll(a, b - a));

      // ---- panel 1: DATA — a river of prints floats to the automaton
      swish(2.6, 0.7, 1, 0.2);  // river current
      const boats = []; for (let i = 0; 2.8 + i * 0.6 < 5.6; i++) boats.push(2.8 + i * 0.6);
      boats.forEach((tb) => k.noise(tb, { dur: 0.22, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.22, 300]], q: 1.4, gain: 0.12, a: 0.03, pan: 0.6, minor: true })); // each boat slides in on a lap of water
      k.play('paper', card(2.9, 3.2), { dur: 0.12, gain: 0.25, pan: pan(830), minor: true }); // cartouche
      // counter n = S(3.0,5.4)^3 * 1e6: the chisel re-cuts the numerals, faster as they climb
      for (let t = 3.12; t < 5.32; ) { const s = S(t, 3.0, 5.4); if (!boats.some((b) => t > b - 0.04 && t < b + 0.06)) chisel(t, 0.7 + 0.4 * s, pan(830)); t += 0.16 - 0.075 * s; }
      clack(5.4, 1, pan(830)); k.play('thud', 5.4, { f: 120, gain: 0.3, pan: pan(830) }); // 1,000,000

      // ---- panel 2: GUESS / CHECK / ADJUST — the whirlpool
      k.noise(6.6, { dur: 0.8, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.35, 900], [0.8, 500]], q: 2, gain: 0.12, a: 0.3, pan: 0.4 }); // whirlpool swirls open
      // the guess: "dog?" (6.9-7.1) — an unresolved koto pair
      koto(card(6.9, 7.1), 'G4', 1, pan(560)); koto(card(6.9, 7.1) + 0.14, 'Eb4', 0.9, pan(560));
      swish(7.2, 0.3, 0.8, 0.5);
      // CHECK: the X seal comes down (7.45 -> 7.6), red ring brushed round (7.55-7.95) — wrong
      sealP(7.6, 1.2, pan(675));
      k.play('thud', 7.6, { f: 75, gain: 0.5, pan: pan(675) });
      koto(7.64, 'Bb3', 1.1, pan(600), false, true); koto(7.64, 'Eb4', 0.8, pan(600), false, true);
      k.play('stroke', 7.62, { material: 'brush', dur: 0.36, gain: 0.7, pan: pan(605), minor: true });
      // ADJUST: the red thread runs back to the gear cabinet (7.9-8.5), "error" cartouche lands, gears ratchet (inOut 8.3-9.1)
      k.play('stroke', 7.92, { material: 'brush', dur: 0.55, gain: 0.8, pan: pan(450), minor: true });
      swish(7.9, 0.3, 0.7, 0.5);
      clack(8.5, 0.5, pan(470));
      for (let i = 1, lt = 8.5; i <= 9; i++) { const t = when(8.3, 9.1, E.inOut, i / 9); if (t - lt < 0.09) continue; lt = t; k.play('tock', t, { f: 380 + (i % 2) * 60, gain: 0.6, pan: pan(200), minor: true }); }
      swish(9.0, 0.3, 0.8, 0.5);
      // the correction: "cat" (9.35-9.55), the tick seal comes down (9.8) — the koto resolves
      koto(card(9.35, 9.55), 'D4', 0.9, pan(560));
      sealP(9.8, 0.9, pan(672));
      ['G4', 'A4', 'D5'].forEach((n, i) => koto(9.82 + i * 0.1, n, 0.9 - i * 0.1, pan(672) - 0.1 * i));

      // ---- panel 3: PROGRESS — the ridge is printed in as accuracy climbs (inOut 10.8-12.0)
      // baren rubbing the ridge print as it appears
      for (let x = 0; x < 1.15; x += 0.19) k.noise(10.82 + x, { dur: 0.2, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.1, 800], [0.2, 500]], q: 1, gain: 0.06, a: 0.08, pan: pan(200 + x * 500), minor: true });
      for (let t = 10.85, last = 61, lt = -1; t < 11.97; t += 1 / 120) {
        const v = Math.round(H.lerp(61, 97, E.inOut(S(t, 10.8, 12.0))));
        if (v !== last && t - lt >= 1 / 11) { chisel(t, 0.9, pan(990)); last = v; lt = t; }
      }
      // 97%: the 優 seal comes down (12.05 -> 12.2) and the ring is brushed round (12.1-12.45) — the biggest hit, a taiko
      k.play('impact', 12.2, { gain: 1.3, pan: pan(1110) });
      k.play('thud', 12.2, { f: 62, gain: 0.9 });
      sealP(12.2, 1.2, pan(1110));
      ['D3', 'A3', 'D4', 'G4'].forEach((n, i) => koto(12.22 + i * 0.03, n, 1.0, (i - 1.5) * 0.2));

      // ---- panel 4: TAKEAWAY: More examples (13.1), current, better guesses (13.4), the 学 seal (13.65)
      koto(card(12.9, 13.2), 'A4', 0.7, -0.1, true);
      swish(13.1, 0.3, 0.7, 0);
      koto(card(13.2, 13.5), 'G4', 0.7, 0.1, true);
      sealP(13.65, 0.9, pan(900));
      ['D3', 'A3', 'D4', 'Eb4', 'G4'].forEach((n, i) => koto(13.68 + i * 0.07, n, 0.85 - i * 0.08, (i - 2) * 0.2)); // resolves
    },
    draw(c0, W, HH, t) {
      const swell = Math.sin(t * 0.9) * 6;
      const scene = (c) => {
        // ---------- paper ----------
        c.fillStyle = C.paper; c.fillRect(0, 0, W, HH);

        // ---------- sky: bokashi from the top ----------
        c.fillStyle = C.sky; c.fillRect(0, 0, W, 560);
        const sk = c.createLinearGradient(0, 0, 0, 230);
      sk.addColorStop(0, 'rgba(46,62,84,0.92)'); sk.addColorStop(0.45, 'rgba(70,86,104,0.45)'); sk.addColorStop(1, 'rgba(90,100,110,0)');
      c.fillStyle = sk; c.fillRect(0, 0, W, 240); // bokashi (separated out and printed last in the build)
        // flat cloud bands
        c.fillStyle = 'rgba(236,224,196,0.85)';
        const cloud = (x, y, w) => { const p = new Path2D(); p.moveTo(x, y); p.bezierCurveTo(x + w * 0.2, y - 18, x + w * 0.45, y - 22, x + w * 0.6, y - 8); p.bezierCurveTo(x + w * 0.75, y - 20, x + w * 0.95, y - 10, x + w, y); p.closePath(); c.fill(p); keyline(c, p, 1.2, 'rgba(27,34,54,0.6)'); };
        cloud(700, 300, 260); cloud(980, 250, 200);

        // ---------- Mt Fuji (far) ----------
        const fx = 940, fb = 520;
        const fuji = new Path2D();
        fuji.moveTo(fx - 170, fb); fuji.quadraticCurveTo(fx - 70, fb - 40, fx - 22, fb - 104); fuji.lineTo(fx + 22, fb - 106); fuji.quadraticCurveTo(fx + 70, fb - 40, fx + 170, fb); fuji.closePath();
        c.save(); c.translate(1.5, 1); c.fillStyle = C.fuji; c.fill(fuji); c.restore();
        const cap = new Path2D(); cap.moveTo(fx - 22, fb - 104); cap.lineTo(fx + 22, fb - 106); cap.lineTo(fx + 48, fb - 70);
        [[34, -78], [22, -64], [10, -76], [-4, -60], [-16, -74], [-30, -62], [-44, -72]].forEach(([dx, dy]) => cap.lineTo(fx + dx, fb + dy));
        cap.closePath(); c.fillStyle = C.foam; c.fill(cap); keyline(c, cap, 1.2);
        keyline(c, fuji, 1.6);

        // ---------- distant sea ----------
        const sea = c.createLinearGradient(0, 500, 0, 720);
        sea.addColorStop(0, C.mid); sea.addColorStop(1, C.pruss);
        c.fillStyle = sea; c.fillRect(0, 510, W, 210);
        c.strokeStyle = 'rgba(241,232,210,0.7)'; c.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) { const y = 528 + i * 18; c.beginPath(); for (let x = 600; x < W; x += 6) { const yy = y + Math.sin(x * 0.03 + i + t) * 3; x === 600 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }

        // ---------- secondary wave (right foreground, a small Fuji-shaped crest) ----------
        {
          const pts = sample([[760, 720], [820, 640], [920, 590 + swell * 0.5], [1010, 576], [1080, 600], [1100, 630], [1080, 640]]);
          const back = [...pts, [1150, 650], [1300, 640], [1300, 720]];
          const body = pathOf(back, true);
          const g = c.createLinearGradient(0, 580, 0, 720); g.addColorStop(0, C.mid); g.addColorStop(1, C.prussD);
          c.save(); c.translate(1.5, 1); c.fillStyle = g; c.fill(body); c.restore();
          const nn = normals(pts);
          c.save(); c.clip(body);
          veins(c, pts, nn, { count: 6, d0: 14, step: 14, sign: -1, seed: 21, band: 'rgba(147,180,204,0.4)', line: 'rgba(241,232,210,0.9)', from: [0.02, 0.25], to: [0.8, 0.98], w0: 1, w1: 2.4 });
          c.restore();
          keyline(c, body, 2.2);
          const r = H.rng(5);
          for (let i = 20; i < pts.length - 2; i += 5) { const n = nn[i]; claw(c, pts[i][0], pts[i][1], n.nx, n.ny, n.tx, n.ty, 20 + r.range(0, 6), r); }
        }

        // ---------- the cargo ship of servers (in the trough, under the lip) ----------
        c.save(); c.translate(560, 520 + swell * 0.6); c.rotate(-0.17 + Math.sin(t * 0.9 + 1) * 0.02);
        // container stacks = server racks
        const rk = H.rng(9);
        for (let s = 0; s < 6; s++) {
          const x0 = -170 + s * 52, hgt = rk.int(2, 4);
          for (let k = 0; k < hgt; k++) {
            const p = new Path2D(); p.rect(x0, -28 - k * 26, 46, 24);
            c.fillStyle = [C.grey, C.ochre, C.pale, C.grey][(s + k) % 4]; c.fill(p);
            c.fillStyle = C.key; for (let u = 0; u < 3; u++) c.fillRect(x0 + 5, -28 - k * 26 + 5 + u * 6, 26, 1.6);
            c.fillStyle = (s + k) % 3 ? C.red : C.green; c.fillRect(x0 + 36, -28 - k * 26 + 6, 4, 4);
            keyline(c, p, 1.5);
          }
        }
        // bridge
        const br = new Path2D(); br.rect(150, -78, 44, 52); c.fillStyle = C.paper; c.fill(br); keyline(c, br, 1.5);
        c.fillStyle = C.key; for (let u = 0; u < 3; u++) c.fillRect(156 + u * 13, -70, 8, 8);
        const st = new Path2D(); st.rect(164, -104, 16, 26); c.fillStyle = C.red; c.fill(st); keyline(c, st, 1.4);
        // hull
        const hull = new Path2D(); hull.moveTo(-230, -30); hull.lineTo(230, -30); hull.lineTo(205, 22); hull.lineTo(-190, 22); hull.closePath();
        c.save(); c.translate(1.5, 1); c.fillStyle = C.hull; c.fill(hull); c.restore();
        c.fillStyle = C.ochre; c.fillRect(-222, -22, 446, 6);
        keyline(c, hull, 2);
        c.restore();

        // ---------- main great wave ----------
        const lean = Math.sin(t * 0.9) * 8;
        const backPts = [[-40, 600], [10, 440], [80, 310], [175, 205], [290, 132], [405, 98 + lean * 0.3], [510, 108], [598, 146 + lean * 0.5], [650, 205 + lean], [655, 262 + lean], [625, 300 + lean], [585, 306 + lean]];
        const back = sample(backPts, 16);
        const facePts = sample([[585, 306 + lean], [548, 284 + lean * 0.8], [505, 268], [470, 285], [452, 340], [462, 420], [500, 500], [560, 560], [650, 600], [760, 622], [800, 720]], 12);
        const body = pathOf([...back, ...facePts.slice(1), [-40, 720]], true);
        const bn = normals(back);
        // body fill with depth gradient
        const g = c.createLinearGradient(0, 90, 300, 640);
        g.addColorStop(0, C.pruss); g.addColorStop(0.5, C.prussD); g.addColorStop(1, '#10243c');
        c.save(); c.translate(2, 1.5); c.fillStyle = g; c.fill(body); c.restore();
        // lighter face inside the curl (bokashi from the face edge inward)
        c.save(); c.clip(body);
        const fg = c.createRadialGradient(560, 330, 20, 560, 330, 230);
        fg.addColorStop(0, C.light); fg.addColorStop(0.55, 'rgba(77,124,166,0.85)'); fg.addColorStop(1, 'rgba(36,80,126,0)');
        c.fillStyle = fg; c.fillRect(300, 100, 500, 560);
        // striations following the back of the wave: lighter bands + broken white veins
        veins(c, back, bn, { count: 13, d0: 30, step: 19, sign: -1, seed: 12, band: 'rgba(77,124,166,0.55)', line: 'rgba(241,232,210,0.92)', from: [0.08, 0.4], to: [0.92, 0.99], toK: 0.04, w0: 1.2, w1: 3.0 });
        // face veins (parallel to the hollow)
        const fnn = normals(facePts);
        veins(c, facePts, fnn, { count: 4, d0: 12, step: 15, sign: 1, seed: 13, band: null, line: 'rgba(241,232,210,0.7)', from: [0.1, 0.18], to: [0.5, 0.7], w0: 2.2, w1: 0.8 });
        c.restore();
        // foam crest band
        const crestStart = Math.floor(back.length * 0.32);
        const band = [];
        for (let i = crestStart; i < back.length; i++) band.push(back[i]);
        for (let i = back.length - 1; i >= crestStart; i--) { const w = 26 * Math.min(1, (i - crestStart) / 18) + Math.abs(Math.sin(i * 0.45)) * 7; band.push([back[i][0] - bn[i].nx * w, back[i][1] - bn[i].ny * w]); }
        const bandP = pathOf(band, true);
        c.fillStyle = C.foam; c.fill(bandP);
        // foam band inner edge carved as a keyline with little scalloped bumps
        { const edge = new Path2D(); let first = true;
          for (let i = crestStart; i < back.length; i++) { const w = 26 * Math.min(1, (i - crestStart) / 18) + Math.abs(Math.sin(i * 0.45)) * 7; const x = back[i][0] - bn[i].nx * w, y = back[i][1] - bn[i].ny * w; first ? edge.moveTo(x, y) : edge.lineTo(x, y); first = false; }
          c.save(); c.clip(body); c.strokeStyle = C.key; c.lineWidth = 1.6; c.stroke(edge); c.restore(); }
        keyline(c, body, 2.6);
        // claws along the crest and lip
        const rc = H.rng(31);
        for (let i = crestStart; i < back.length - 1; i += 7) {
          const n = bn[i], u = (i - crestStart) / (back.length - crestStart);
          const L = H.lerp(26, 52, Math.min(1, u * 1.6)) * rc.range(0.85, 1.1);
          claw(c, back[i][0], back[i][1], n.nx, n.ny, n.tx, n.ty, L, rc);
        }
        // lip-tip claws hanging down over the ship
        for (let k = 0; k < 6; k++) {
          const i = back.length - 1, x = back[i][0] - k * 22 + 8, y = back[i][1] - 4 + Math.sin(k) * 4;
          claw(c, x, y, -0.15, 1, -1, 0.2, 30 + rc.range(-4, 10), rc);
        }

        // ---------- data-cube spray ----------
        const rs = H.rng(77);
        for (let i = 0; i < 46; i++) {
          const u = rs();
          const sx = H.lerp(300, 820, u) + rs.gauss() * 30;
          const sy0 = H.lerp(70, 190, Math.abs(u - 0.6)) + rs.gauss() * 40;
          const fall = ((t * 0.25 + rs()) % 1) * 60;
          const s = rs.range(5, 14) * (1 - Math.abs(u - 0.55) * 0.6);
          const y = sy0 + fall + (u > 0.6 ? (u - 0.6) * 380 : 0);
          if (y > 470) continue;
          cube(c, sx, y, s, rs.range(-0.4, 0.4) + t * rs.range(-0.5, 0.5));
        }

        // ---------- foreground water in front of the hull ----------
        {
          const pts = sample([[420, 720], [480, 668], [580, 638 + swell * 0.4], [672, 612], [732, 618], [762, 644], [748, 662]], 12);
          const p = pathOf([...pts, [760, 720]], true);
          const gg = c.createLinearGradient(0, 570, 0, 720); gg.addColorStop(0, C.pruss); gg.addColorStop(1, C.prussD);
          c.save(); c.translate(1.5, 1); c.fillStyle = gg; c.fill(p); c.restore();
          const nn = normals(pts);
          c.save(); c.clip(p);
          veins(c, pts, nn, { count: 5, d0: 12, step: 13, sign: -1, seed: 22, band: 'rgba(147,180,204,0.4)', line: 'rgba(241,232,210,0.88)', from: [0.0, 0.2], to: [0.75, 0.95], w0: 1, w1: 2.2 });
          c.restore();
          keyline(c, p, 2.2);
          const r = H.rng(8);
          for (let i = 10; i < pts.length - 1; i += 6) { const n = nn[i]; claw(c, pts[i][0], pts[i][1], n.nx, n.ny, n.tx, n.ty, 16 + r.range(0, 6), r); }
        }

        // ---------- cartouche + signature + seal ----------
        const cx = 1150, cy = 40, cw = 52, ch = 228;
        const cart = new Path2D(); cart.rect(cx, cy, cw, ch);
        c.fillStyle = '#e8d49a'; c.fill(cart);
        c.strokeStyle = C.key; c.lineWidth = 2; c.stroke(cart); c.lineWidth = 1; c.strokeRect(cx + 4, cy + 4, cw - 8, ch - 8);
        c.fillStyle = C.key; c.font = '700 26px "Noto Serif JP"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        [...'データの大波'].forEach((chr, i) => { if (chr === 'ー') { c.save(); c.translate(cx + cw / 2, cy + 30 + i * 33); c.rotate(Math.PI / 2); c.fillText(chr, 0, 0); c.restore(); } else c.fillText(chr, cx + cw / 2, cy + 30 + i * 33); });
        // second, smaller cartouche with series title
        const c2 = new Path2D(); c2.rect(cx - 40, cy, 30, 120); c.fillStyle = '#d9c38a'; c.fill(c2); c.strokeStyle = C.key; c.lineWidth = 1.5; c.stroke(c2);
        c.fillStyle = C.key; c.font = '400 15px "Noto Serif JP"';
        [...'電脳百景'].forEach((chr, i) => c.fillText(chr, cx - 25, cy + 20 + i * 26));
        // signature + seal (lower left of cartouche area)
        c.font = '400 15px "Noto Serif JP"';
        [...'雲斎筆'].forEach((chr, i) => c.fillText(chr, cx - 25, cy + 160 + i * 20));
        c.save(); c.translate(cx - 25, cy + 236); c.rotate(0.02);
        c.fillStyle = C.red; c.fillRect(-15, -15, 30, 30);
        c.fillStyle = '#efe2c6'; c.font = '900 22px "Noto Serif JP"'; c.fillText('電', 0, 1);
        c.restore();

      };

      // ---------- printing build: keyblock first, then one colour block per impression, bokashi last ----------
      const COL = H.layer(W, HH), cc = COL.getContext('2d', { willReadFrequently: true });
      scene(cc);
      const KEY = H.layer(W, HH), kc = KEY.getContext('2d', { willReadFrequently: true });
      keyOnly(kc); scene(kc);
      const press = (t0) => H.clamp((t - t0) / 0.16, 0, 1); // an impression lands in ~5 frames
      // plates: 0 key, 1 warm (sky/ochre), 2 pale blue, 3 mid blue, 4 vermilion/brown, 5 Prussian
      const prog = [press(0.35), press(1.0), press(1.5), press(2.0), press(2.45), press(2.9)];
      const cd = cc.getImageData(0, 0, W, HH).data, kd = kc.getImageData(0, 0, W, HH).data;
      const out = c0.createImageData(W, HH), od = out.data;
      const PA = H.hex(C.paper), SKY = H.hex(C.sky), SL = [46, 62, 84], BL = Math.hypot(SKY[0] - SL[0], SKY[1] - SL[1], SKY[2] - SL[2]), BD = [(SKY[0] - SL[0]) / BL, (SKY[1] - SL[1]) / BL, (SKY[2] - SL[2]) / BL];
      // shifting registration: each fresh impression lands a couple of px off, then the printer's kento corrects it
      for (let y = 0, p = 0; y < HH; y++) for (let x = 0; x < W; x++, p++) {
        const i = p * 4, r = cd[i], g = cd[i + 1], b = cd[i + 2];
        let pl;
        if (kd[i + 3] > 110) pl = 0;
        else if (Math.abs(r - PA[0]) + Math.abs(g - PA[1]) + Math.abs(b - PA[2]) < 24 || (r > 228 && g > 220 && b > 196)) pl = -1;
        else if (g < r * 0.6 && r > b) pl = 4;
        else if (r >= b) pl = 1;
        else { const lum = (r * 0.3 + g * 0.55 + b * 0.15) / 255; pl = lum > 0.55 ? 2 : lum > 0.36 ? 3 : 5; }
        let R, G, B;
        // bokashi pixels lie on the sky->slate mixing line: print the sky plate, then wipe the gradation on top-down
        const qr = SKY[0] - r, qg = SKY[1] - g, qb = SKY[2] - b, proj = qr * BD[0] + qg * BD[1] + qb * BD[2], tl = proj / BL;
        const perp = Math.hypot(qr - BD[0] * proj, qg - BD[1] * proj, qb - BD[2] * proj);
        if (pl !== 0 && y < 245 && tl > 0.03 && tl < 0.94 && perp < 16) {
          const kb = H.smooth(0, 1, (t - 3.25 - y * 0.0018) / 0.45), ks = prog[1];
          R = PA[0] + (SKY[0] - PA[0]) * ks + (r - SKY[0]) * kb; G = PA[1] + (SKY[1] - PA[1]) * ks + (g - SKY[1]) * kb; B = PA[2] + (SKY[2] - PA[2]) * ks + (b - SKY[2]) * kb;
        } else {
          const k = pl < 0 ? prog[0] : prog[pl];
          R = PA[0] + (r - PA[0]) * k; G = PA[1] + (g - PA[1]) * k; B = PA[2] + (b - PA[2]) * k;
        }
        od[i] = R; od[i + 1] = G; od[i + 2] = B; od[i + 3] = 255;
      }
      c0.putImageData(out, 0, 0);
      const c = c0;
      // ---------- woodblock finish: wood grain in inked areas, fibres, ageing ----------
      const img = c.getImageData(0, 0, W, HH), d = img.data;
      const { warp, fine, pap, blot } = fields(W, HH);
      const rg = H.rng(2);
      for (let y = 0, p = 0; y < HH; y++) for (let x = 0; x < W; x++, p++) {
        const i = p * 4, lum = (d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15) / 255;
        const inked = H.clamp((0.85 - lum) * 1.6, 0, 1), plate = H.clamp((0.94 - lum) * 1.3, 0, 1);
        const grain = Math.sin(y * 0.55 + warp[p] * 26 + x * 0.004) * 0.5 + fine[p] * 0.8;
        let s = 1 + grain * (0.06 + 0.08 * inked) * plate; // wood grain shows in every printed block, the pale sky plate too
        s *= 1 + pap[p] * 0.035 + (rg() - 0.5) * 0.04;    // washi fibre + tooth
        s *= 1 - Math.max(0, blot[p]) * 0.12 * plate;     // uneven pigment take-up
        // age: warm the paper, slightly fade blues
        d[i] = d[i] * s * 1.0 + 6 * (1 - inked); d[i + 1] = d[i + 1] * s; d[i + 2] = d[i + 2] * s * 0.97 - 4 * (1 - inked);
      }
      c.putImageData(img, 0, 0);
      // kozo fibres
      const rf = H.rng(55);
      for (let i = 0; i < 260; i++) {
        const x = rf.range(0, W), y = rf.range(0, HH), l = rf.range(10, 40), a = rf.range(0, Math.PI * 2);
        c.strokeStyle = rf() < 0.5 ? 'rgba(255,250,235,0.22)' : 'rgba(120,95,60,0.12)'; c.lineWidth = rf.range(0.5, 1.1);
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + rf.range(-6, 6), y + Math.sin(a) * l * 0.5 + rf.range(-6, 6), x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
      }
      H.vignette(c, W, HH, 0.25, '90,60,30');
    },
  });
}
```
