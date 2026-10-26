I want an animated explainer made in the "Tech Glow Explainer" visual style (Popular Explainer Looks). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter, Space Grotesk
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@400;700&display=block">
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
Name: Tech Glow Explainer
Family: Popular Explainer Looks
Look: The polished AI / tech YouTube motion-graphics look: deep navy-to-indigo space with drifting electric glows and a perspective grid, gradient-stroked icon tiles wired into node diagrams with light pulses racing along the connectors, dark cards with thin neon borders, gradient headline type and bloom on everything bright.
Motion: Smooth eased build: glows bloom up, icon tiles pop in with an overshoot and their line icons draw on, connectors trace out and start carrying light pulses, the headline rises word by word and the stat counts up, all under a slow camera push and drifting particles.
How it explains: One continuous camera: the title shrinks to a header while the brain tile flies into place, labelled examples ride glowing lanes into the model, the camera pushes through the brain into its network (light-speed streaks), Guess/Check/Adjust chips light up as light pulses run forward and a red error pulse runs back, then the camera pans to a glowing accuracy chart and pulls back for the takeaway; numbers count up in gradient Space Grotesk with bloom.

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

REFERENCE STYLE SOURCE (styles/tech-glow.js; W/H_ are always 1280x720)
```js
// Tech Glow Explainer: the polished AI / tech YouTube motion-graphics look. Deep navy-to-indigo space, drifting
// electric glows, a perspective floor grid, gradient-stroked icon tiles, node diagrams with light pulses running
// along the connectors, dark cards with thin neon borders, gradient headline type and a bloom pass on everything bright.
{
  const E = H.ease, cl = H.clamp, lerp = H.lerp;
  const seg = (a, b, t) => cl((t - a) / (b - a));
  const eo = (a, b, t) => E.out(seg(a, b, t));
  const eio = (a, b, t) => E.inOut(seg(a, b, t));
  const ebk = (a, b, t) => (t <= a ? 0 : t >= b ? 1 : E.back(seg(a, b, t)));
  const fract = (x) => x - Math.floor(x);
  const rgb = (c, a) => H.rgba(c, a);
  const HEAD = '"Space Grotesk"', UI = '"Inter"';
  const F = (w, s, fam) => `${w} ${s}px ${fam || HEAD}`;
  const C = {
    cyan: '#3fe3ff', blue: '#3d7bff', violet: '#8f5bff', magenta: '#e04dff', indigo: '#4b3bff',
    red: '#ff4f7a', green: '#3cf0b4', white: '#eef2ff', muted: '#9aa3d8',
  };
  const GRAD_HEAD = ['#ffffff', '#c8f4ff', '#7fdcff', '#9a78ff'];
  const GRAD_NUM = ['#7ff0ff', '#5d9bff', '#a77bff'];
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const bump = (t, t0, k = 6) => (t < t0 ? 0 : Math.exp(-(t - t0) * k)); // decaying flash after t0

  // ---------------------------------------------------------------- icons (line art in a -1..1 box scaled by u)
  const dot = (c, x, y, r) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); };
  const ICONS = {
    brain(c, u) {
      for (const sx of [-1, 1]) {
        const X = (v) => v * u * sx, Y = (v) => v * u;
        c.moveTo(X(0.04), Y(-0.78));
        c.bezierCurveTo(X(0.3), Y(-0.98), X(0.64), Y(-0.84), X(0.64), Y(-0.52));
        c.bezierCurveTo(X(0.95), Y(-0.42), X(0.98), Y(-0.02), X(0.74), Y(0.08));
        c.bezierCurveTo(X(0.95), Y(0.32), X(0.82), Y(0.7), X(0.5), Y(0.68));
        c.bezierCurveTo(X(0.4), Y(0.92), X(0.12), Y(0.92), X(0.04), Y(0.74));
        c.lineTo(X(0.04), Y(-0.78));
        c.moveTo(X(0.64), Y(-0.52)); c.quadraticCurveTo(X(0.46), Y(-0.5), X(0.36), Y(-0.34));
        c.moveTo(X(0.74), Y(0.08)); c.quadraticCurveTo(X(0.52), Y(0.1), X(0.42), Y(-0.08));
        c.moveTo(X(0.5), Y(0.68)); c.quadraticCurveTo(X(0.5), Y(0.42), X(0.3), Y(0.34));
        c.moveTo(X(0.04), Y(-0.16)); c.quadraticCurveTo(X(0.22), Y(-0.18), X(0.26), Y(0.02));
      }
    },
    chip(c, u) {
      c.roundRect(-0.58 * u, -0.58 * u, 1.16 * u, 1.16 * u, 0.16 * u);
      c.roundRect(-0.26 * u, -0.26 * u, 0.52 * u, 0.52 * u, 0.06 * u);
      for (const k of [-0.3, 0, 0.3]) {
        c.moveTo(k * u, -0.58 * u); c.lineTo(k * u, -0.86 * u); c.moveTo(k * u, 0.58 * u); c.lineTo(k * u, 0.86 * u);
        c.moveTo(-0.58 * u, k * u); c.lineTo(-0.86 * u, k * u); c.moveTo(0.58 * u, k * u); c.lineTo(0.86 * u, k * u);
      }
    },
    database(c, u) {
      c.moveTo(0.64 * u, -0.56 * u); c.ellipse(0, -0.56 * u, 0.64 * u, 0.2 * u, 0, 0, Math.PI * 2);
      c.moveTo(-0.64 * u, -0.56 * u); c.lineTo(-0.64 * u, 0.56 * u); c.moveTo(0.64 * u, -0.56 * u); c.lineTo(0.64 * u, 0.56 * u);
      c.moveTo(0.64 * u, 0.56 * u); c.ellipse(0, 0.56 * u, 0.64 * u, 0.2 * u, 0, 0, Math.PI);
      c.moveTo(0.64 * u, 0); c.ellipse(0, 0, 0.64 * u, 0.2 * u, 0, 0, Math.PI);
    },
    chat(c, u) {
      c.moveTo(-0.5 * u, -0.66 * u); c.lineTo(0.5 * u, -0.66 * u); c.quadraticCurveTo(0.82 * u, -0.66 * u, 0.82 * u, -0.34 * u);
      c.lineTo(0.82 * u, 0.12 * u); c.quadraticCurveTo(0.82 * u, 0.44 * u, 0.5 * u, 0.44 * u); c.lineTo(-0.1 * u, 0.44 * u);
      c.lineTo(-0.48 * u, 0.8 * u); c.lineTo(-0.44 * u, 0.44 * u); c.quadraticCurveTo(-0.82 * u, 0.44 * u, -0.82 * u, 0.12 * u);
      c.lineTo(-0.82 * u, -0.34 * u); c.quadraticCurveTo(-0.82 * u, -0.66 * u, -0.5 * u, -0.66 * u);
      for (const x of [-0.36, 0, 0.36]) dot(c, x * u, -0.11 * u, 0.05 * u);
    },
    sparkle(c, u) {
      const star = (x, y, r) => { c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); };
      star(-0.14 * u, 0.12 * u, 0.72 * u); star(0.56 * u, -0.56 * u, 0.26 * u);
    },
    eye(c, u) {
      c.moveTo(-0.88 * u, 0); c.quadraticCurveTo(0, -0.84 * u, 0.88 * u, 0); c.quadraticCurveTo(0, 0.84 * u, -0.88 * u, 0);
      dot(c, 0, 0, 0.3 * u); dot(c, 0, 0, 0.07 * u);
    },
    check(c, u) { c.moveTo(-0.58 * u, 0.02 * u); c.lineTo(-0.16 * u, 0.44 * u); c.lineTo(0.62 * u, -0.42 * u); },
    cross(c, u) { c.moveTo(-0.45 * u, -0.45 * u); c.lineTo(0.45 * u, 0.45 * u); c.moveTo(0.45 * u, -0.45 * u); c.lineTo(-0.45 * u, 0.45 * u); },
    cat(c, u) {
      c.moveTo(-0.6 * u, -0.08 * u); c.lineTo(-0.62 * u, -0.78 * u); c.lineTo(-0.24 * u, -0.48 * u);
      c.quadraticCurveTo(0, -0.56 * u, 0.24 * u, -0.48 * u); c.lineTo(0.62 * u, -0.78 * u); c.lineTo(0.6 * u, -0.08 * u);
      c.bezierCurveTo(0.62 * u, 0.52 * u, 0.3 * u, 0.72 * u, 0, 0.72 * u); c.bezierCurveTo(-0.3 * u, 0.72 * u, -0.62 * u, 0.52 * u, -0.6 * u, -0.08 * u);
      dot(c, -0.25 * u, 0.02 * u, 0.06 * u); dot(c, 0.25 * u, 0.02 * u, 0.06 * u);
      c.moveTo(-0.08 * u, 0.22 * u); c.lineTo(0.08 * u, 0.22 * u); c.lineTo(0, 0.32 * u); c.closePath();
      for (const s of [-1, 1]) { c.moveTo(s * 0.36 * u, 0.28 * u); c.lineTo(s * 0.86 * u, 0.2 * u); c.moveTo(s * 0.36 * u, 0.38 * u); c.lineTo(s * 0.84 * u, 0.46 * u); }
    },
    dog(c, u) {
      c.moveTo(0, -0.6 * u); c.bezierCurveTo(0.46 * u, -0.6 * u, 0.54 * u, -0.2 * u, 0.5 * u, 0.2 * u);
      c.bezierCurveTo(0.46 * u, 0.6 * u, 0.2 * u, 0.76 * u, 0, 0.76 * u); c.bezierCurveTo(-0.2 * u, 0.76 * u, -0.46 * u, 0.6 * u, -0.5 * u, 0.2 * u);
      c.bezierCurveTo(-0.54 * u, -0.2 * u, -0.46 * u, -0.6 * u, 0, -0.6 * u);
      for (const s of [-1, 1]) { c.moveTo(s * 0.38 * u, -0.5 * u); c.bezierCurveTo(s * 0.86 * u, -0.56 * u, s * 0.98 * u, 0, s * 0.76 * u, 0.32 * u); c.bezierCurveTo(s * 0.6 * u, 0.36 * u, s * 0.52 * u, 0.1 * u, s * 0.5 * u, -0.1 * u); }
      dot(c, -0.2 * u, -0.06 * u, 0.06 * u); dot(c, 0.2 * u, -0.06 * u, 0.06 * u);
      c.moveTo(0.12 * u, 0.3 * u); c.ellipse(0, 0.3 * u, 0.12 * u, 0.08 * u, 0, 0, Math.PI * 2);
      c.moveTo(0, 0.38 * u); c.quadraticCurveTo(-0.04 * u, 0.52 * u, -0.16 * u, 0.5 * u); c.moveTo(0, 0.38 * u); c.quadraticCurveTo(0.04 * u, 0.52 * u, 0.16 * u, 0.5 * u);
    },
    chart(c, u) {
      c.moveTo(-0.76 * u, -0.72 * u); c.lineTo(-0.76 * u, 0.7 * u); c.lineTo(0.8 * u, 0.7 * u);
      c.moveTo(-0.52 * u, 0.36 * u); c.lineTo(-0.18 * u, 0.02 * u); c.lineTo(0.1 * u, 0.2 * u); c.lineTo(0.58 * u, -0.42 * u);
      c.moveTo(0.3 * u, -0.44 * u); c.lineTo(0.6 * u, -0.44 * u); c.lineTo(0.6 * u, -0.14 * u);
    },
    loop(c, u) {
      c.moveTo(0.62 * u, -0.1 * u); c.arc(0, 0, 0.62 * u, -0.16, -2.6, true);
      c.moveTo(-0.62 * u, 0.1 * u); c.arc(0, 0, 0.62 * u, Math.PI - 0.16, Math.PI - 2.6, true);
      c.moveTo(0.36 * u, -0.22 * u); c.lineTo(0.62 * u, -0.08 * u); c.lineTo(0.76 * u, -0.36 * u);
      c.moveTo(-0.36 * u, 0.22 * u); c.lineTo(-0.62 * u, 0.08 * u); c.lineTo(-0.76 * u, 0.36 * u);
    },
  };

  // ---------------------------------------------------------------- background: gradient space, drifting glows, perspective grid, particles
  const GLOWS = [
    { c: C.blue, x: 0.16, y: 0.24, r: 520, a: 0.24 },
    { c: C.violet, x: 0.82, y: 0.18, r: 560, a: 0.3 },
    { c: C.cyan, x: 0.6, y: 0.95, r: 440, a: 0.17 },
    { c: C.magenta, x: 1.0, y: 0.72, r: 380, a: 0.17 },
    { c: C.indigo, x: 0.42, y: 0.62, r: 560, a: 0.12 },
  ];
  const PARTS = (() => { const r = H.rng(77); return Array.from({ length: 90 }, () => ({ x: r(), y: r(), s: r.range(0.6, 2.1), sp: r.range(0.004, 0.018), ph: r() * 6.28, c: r.pick([C.cyan, C.violet, '#ffffff', C.blue]), z: r.range(0.3, 1) })); })();

  function background(ctx, W, Hh, t, camX = 0, lvl = 1) {
    const g = ctx.createLinearGradient(0, 0, W * 0.5, Hh);
    g.addColorStop(0, '#03041a'); g.addColorStop(0.55, '#080a2d'); g.addColorStop(1, '#120b3c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    GLOWS.forEach((b, i) => {
      const x = (b.x + 0.05 * Math.sin(t * 0.21 + i * 1.9)) * W - camX * 0.1, y = (b.y + 0.06 * Math.cos(t * 0.17 + i * 2.7)) * Hh;
      const r = b.r * (1 + 0.07 * Math.sin(t * 0.3 + i)), rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, rgb(b.c, b.a * lvl)); rg.addColorStop(0.4, rgb(b.c, b.a * 0.38 * lvl)); rg.addColorStop(1, rgb(b.c, 0));
      ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    });
    ctx.restore();
    // faint dot field up top (fades upward)
    ctx.save();
    const ox = ((-camX * 0.3) % 40 + 40) % 40;
    for (let y = 20; y < Hh * 0.56; y += 40) {
      const a = 0.09 * lvl * (y / (Hh * 0.56));
      ctx.fillStyle = `rgba(150,170,255,${a})`;
      for (let x = ox; x < W; x += 40) ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    ctx.restore();
    // perspective floor grid, lines rolling toward the camera
    const hy = Hh * 0.6, vx = W / 2 - camX * 0.25;
    ctx.save(); ctx.lineWidth = 1;
    const sg = ctx.createLinearGradient(0, hy, 0, Hh);
    sg.addColorStop(0, 'rgba(110,140,255,0)'); sg.addColorStop(0.3, `rgba(110,140,255,${0.07 * lvl})`); sg.addColorStop(1, `rgba(140,170,255,${0.22 * lvl})`);
    ctx.strokeStyle = sg; ctx.beginPath();
    const sh = fract(camX / 900) * 1;
    for (let i = -34; i <= 34; i++) { const k = i - sh; ctx.moveTo(vx + k * 12, hy); ctx.lineTo(vx + k * 190, Hh + 260); }
    const roll = fract(t * 0.35);
    for (let k = 0; k < 26; k++) { const d = k + 1 - roll, y = hy + 230 / d; if (y > Hh + 2) continue; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    // horizon haze line
    const hz = ctx.createLinearGradient(0, 0, W, 0);
    hz.addColorStop(0, 'rgba(90,140,255,0)'); hz.addColorStop(0.5, `rgba(120,180,255,${0.18 * lvl})`); hz.addColorStop(1, 'rgba(90,140,255,0)');
    ctx.fillStyle = hz; ctx.fillRect(0, hy - 1, W, 2);
    ctx.restore();
    // particles
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of PARTS) {
      const x = fract(p.x + 0.006 * Math.sin(t * 0.5 + p.ph) - camX * 0.0003 * p.z) * W, y = fract(p.y - t * p.sp) * Hh;
      const a = (0.2 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.7 + p.ph * 3))) * lvl * p.z;
      if (p.s > 1.7) { const rg = ctx.createRadialGradient(x, y, 0, x, y, p.s * 6); rg.addColorStop(0, rgb(p.c, a * 0.35)); rg.addColorStop(1, rgb(p.c, 0)); ctx.fillStyle = rg; ctx.fillRect(x - p.s * 6, y - p.s * 6, p.s * 12, p.s * 12); }
      ctx.fillStyle = rgb(p.c, a); ctx.beginPath(); ctx.arc(x, y, p.s * 0.7, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- bloom: threshold-ish downsample, two blur radii, added back
  let BL = null;
  function bloom(ctx, amt = 1) {
    const cv = ctx.canvas;
    if (!BL) BL = { a: H.layer(320, 180), b: H.layer(320, 180), c: H.layer(160, 90) };
    const a = BL.a.getContext('2d'), b = BL.b.getContext('2d'), c = BL.c.getContext('2d');
    a.globalCompositeOperation = 'copy'; a.filter = 'brightness(0.9) contrast(2.6) saturate(1.4)'; a.drawImage(cv, 0, 0, 320, 180); a.filter = 'none';
    b.globalCompositeOperation = 'copy'; b.filter = 'blur(2.5px)'; b.drawImage(BL.a, 0, 0); b.filter = 'none';
    c.globalCompositeOperation = 'copy'; c.filter = 'blur(4px)'; c.drawImage(BL.a, 0, 0, 160, 90); c.filter = 'none';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.45 * amt; ctx.drawImage(BL.b, 0, 0, cv.width, cv.height);
    ctx.globalAlpha = 0.5 * amt; ctx.drawImage(BL.c, 0, 0, cv.width, cv.height);
    ctx.restore();
  }

  // ---------------------------------------------------------------- building blocks
  function glowDot(ctx, x, y, col, r, a = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgb('#ffffff', a)); g.addColorStop(0.16, rgb(col, 0.9 * a)); g.addColorStop(0.45, rgb(col, 0.22 * a)); g.addColorStop(1, rgb(col, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  function ring(ctx, x, y, r, col, a, lw = 2) {
    if (a <= 0.001) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgb(col, a); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); ctx.restore();
  }
  // dark translucent card, inner glow, thin gradient border
  function card(ctx, x, y, w, h, o = {}) {
    const r = o.r ?? 22, acc = o.acc || [C.cyan, C.violet];
    ctx.save(); ctx.globalAlpha *= o.a ?? 1;
    ctx.shadowColor = 'rgba(0,0,12,0.6)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 18;
    const fg = ctx.createLinearGradient(x, y, x, y + h);
    fg.addColorStop(0, 'rgba(22,26,72,0.8)'); fg.addColorStop(1, 'rgba(8,9,32,0.86)');
    ctx.fillStyle = fg; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    const ig = ctx.createRadialGradient(x + w * 0.25, y, 0, x + w * 0.25, y, Math.max(w, h) * 0.8);
    ig.addColorStop(0, rgb(acc[0], 0.17)); ig.addColorStop(1, rgb(acc[0], 0)); ctx.fillStyle = ig; ctx.fillRect(x, y, w, h);
    const ig2 = ctx.createRadialGradient(x + w, y + h, 0, x + w, y + h, Math.max(w, h) * 0.7);
    ig2.addColorStop(0, rgb(acc[1], 0.14)); ig2.addColorStop(1, rgb(acc[1], 0)); ctx.fillStyle = ig2; ctx.fillRect(x, y, w, h);
    ctx.restore();
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, rgb(acc[0], 0.95)); bg.addColorStop(0.4, rgb(acc[1], 0.4)); bg.addColorStop(0.72, 'rgba(255,255,255,0.07)'); bg.addColorStop(1, rgb(acc[1], 0.6));
    ctx.strokeStyle = bg; ctx.lineWidth = 1.5; rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.stroke();
    // top edge highlight
    const hl = ctx.createLinearGradient(x, 0, x + w, 0);
    hl.addColorStop(0, 'rgba(255,255,255,0)'); hl.addColorStop(0.3, 'rgba(200,240,255,0.5)'); hl.addColorStop(0.65, 'rgba(255,255,255,0)');
    ctx.strokeStyle = hl; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + r, y + 1.5); ctx.lineTo(x + w - r, y + 1.5); ctx.stroke();
    if (o.flash > 0.01) {
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgb(o.flashCol || C.cyan, o.flash); ctx.lineWidth = 3;
      rr(ctx, x + 1, y + 1, w - 2, h - 2, r); ctx.stroke();
      ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip(); ctx.fillStyle = rgb(o.flashCol || C.cyan, o.flash * 0.08); ctx.fillRect(x, y, w, h); ctx.restore();
    }
    ctx.restore();
  }
  // rounded icon tile with gradient stroke + glowing line icon
  function tile(ctx, cx, cy, s, icon, o = {}) {
    const a = o.a ?? 1, sc = o.sc ?? 1, col = o.col || [C.cyan, C.violet], glow = o.glow ?? 1, draw = o.draw ?? 1;
    if (a <= 0.003 || sc <= 0.003) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha *= a;
    const r = s * 0.26, h = s / 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const hg = ctx.createRadialGradient(0, 0, s * 0.25, 0, 0, s * 1.15);
    hg.addColorStop(0, rgb(col[0], Math.min(0.5, 0.2 * glow))); hg.addColorStop(0.5, rgb(col[1], Math.min(0.25, 0.07 * glow))); hg.addColorStop(1, rgb(col[1], 0));
    ctx.fillStyle = hg; ctx.fillRect(-s * 1.15, -s * 1.15, s * 2.3, s * 2.3);
    ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(0,0,10,0.55)'; ctx.shadowBlur = s * 0.3; ctx.shadowOffsetY = s * 0.1;
    const bg = ctx.createLinearGradient(0, -h, 0, h); bg.addColorStop(0, '#171b4d'); bg.addColorStop(1, '#090a28');
    ctx.fillStyle = bg; rr(ctx, -h, -h, s, s, r); ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -h, -h, s, s, r); ctx.clip();
    const ig = ctx.createRadialGradient(-h * 0.5, -h * 0.7, 0, -h * 0.5, -h * 0.7, s);
    ig.addColorStop(0, rgb(col[0], 0.3)); ig.addColorStop(1, rgb(col[0], 0)); ctx.fillStyle = ig; ctx.fillRect(-h, -h, s, s);
    const ig2 = ctx.createRadialGradient(h * 0.6, h * 0.8, 0, h * 0.6, h * 0.8, s * 0.8);
    ig2.addColorStop(0, rgb(col[1], 0.26)); ig2.addColorStop(1, rgb(col[1], 0)); ctx.fillStyle = ig2; ctx.fillRect(-h, -h, s, s);
    if (glow > 1.05) { ctx.fillStyle = rgb(col[0], Math.min(0.25, (glow - 1) * 0.12)); ctx.fillRect(-h, -h, s, s); }
    ctx.restore();
    const sg = ctx.createLinearGradient(-h, -h, h, h); sg.addColorStop(0, H.rgba(H.mix(col[0], '#ffffff', 0.2), 1)); sg.addColorStop(1, col[1]);
    ctx.strokeStyle = sg; ctx.lineWidth = Math.max(1.6, s * 0.022); rr(ctx, -h + 1, -h + 1, s - 2, s - 2, r); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1; rr(ctx, -h + 6, -h + 6, s - 12, s - 12, r * 0.75); ctx.stroke();
    if (draw > 0) {
      const icg = ctx.createLinearGradient(-h * 0.5, -h * 0.5, h * 0.5, h * 0.5);
      icg.addColorStop(0, H.rgba(H.mix(col[0], '#ffffff', 0.45), 1)); icg.addColorStop(1, H.rgba(H.mix(col[1], '#ffffff', 0.15), 1));
      ctx.strokeStyle = icg; ctx.lineWidth = Math.max(1.8, s * 0.042); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (draw < 1) ctx.setLineDash([draw * s * 2.4, 1e4]);
      ctx.beginPath(); ICONS[icon](ctx, s * 0.3); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
  }
  // pill label centred at (x, y)
  function pill(ctx, x, y, text, o = {}) {
    const a = o.a ?? 1; if (a <= 0.003) return;
    const size = o.size || 24, col = o.col || [C.cyan, C.violet];
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(o.sc ?? 1, o.sc ?? 1);
    ctx.font = F(600, size, UI); const tw = ctx.measureText(text).width, dotW = o.dot ? size * 0.75 : 0;
    const w = tw + size * 1.3 + dotW, h = size * 1.62;
    ctx.fillStyle = o.fill || 'rgba(10,12,42,0.88)'; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, rgb(col[0], 0.9)); g.addColorStop(1, rgb(col[1], 0.7));
    ctx.strokeStyle = g; ctx.lineWidth = 1.4; rr(ctx, -w / 2 + 0.7, -h / 2 + 0.7, w - 1.4, h - 1.4, h / 2); ctx.stroke();
    if (o.dot) { ctx.fillStyle = col[0]; ctx.beginPath(); ctx.arc(-w / 2 + size * 0.75, 0, size * 0.17, 0, 6.283); ctx.fill(); }
    ctx.fillStyle = o.textCol || C.white; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(text, -w / 2 + size * 0.65 + dotW, size * 0.04);
    ctx.restore();
  }
  // gradient-filled text; returns width
  function gtext(ctx, s, x, y, size, o = {}) {
    ctx.font = F(o.w || 700, size, o.fam); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = o.ls || '0px';
    const w = ctx.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    const cols = o.cols || GRAD_HEAD, g = ctx.createLinearGradient(x0, y - size, x0 + w, y);
    cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c));
    ctx.fillStyle = g; ctx.fillText(s, x0, y); ctx.letterSpacing = '0px';
    return w;
  }
  // words revealed one by one (rise + fade), one gradient across the whole line
  function revealLine(ctx, s, x, y, size, prog, o = {}) {
    ctx.font = F(o.w || 700, size, o.fam); ctx.letterSpacing = o.ls || '0px';
    const words = s.split(' '), full = ctx.measureText(s).width, x0 = o.align === 'center' ? x - full / 2 : x;
    const cols = o.cols || GRAD_HEAD, g = ctx.createLinearGradient(x0, y - size, x0 + full, y);
    cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c));
    ctx.save(); ctx.fillStyle = g; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    let cx = x0; const n = words.length;
    words.forEach((wd, i) => {
      const p = E.out(cl(prog * (n + 1.5) - i * 1.0, 0, 1)), ww = ctx.measureText(wd + (i < n - 1 ? ' ' : '')).width;
      if (p > 0) { ctx.globalAlpha = p * (o.a ?? 1); ctx.fillText(wd, cx, y + (1 - p) * size * 0.45); }
      cx += ww;
    });
    ctx.restore(); ctx.letterSpacing = '0px';
    return { x0, w: full };
  }
  function eyebrow(ctx, s, x, y, o = {}) {
    const a = o.a ?? 1; if (a <= 0.003) return;
    const size = o.size || 18, col = o.col || C.cyan;
    ctx.save(); ctx.globalAlpha *= a; ctx.font = F(600, size, UI); ctx.letterSpacing = '3px';
    const w = ctx.measureText(s).width + 22, x0 = o.align === 'center' ? x - w / 2 : x;
    ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x0 + 5, y - size * 0.36, col, 12); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + 5, y - size * 0.36, 3.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = rgb(H.mix(col, '#ffffff', 0.25), 1); ctx.textAlign = 'left'; ctx.fillText(s, x0 + 22, y);
    ctx.letterSpacing = '0px'; ctx.restore();
  }

  // ---------------------------------------------------------------- connectors (sampled curves) + light pulses
  function bez(x0, y0, x1, y1, x2, y2, x3, y3, n = 48) {
    const P = []; let L = 0, px = x0, py = y0;
    for (let i = 0; i <= n; i++) {
      const u = i / n, m = 1 - u;
      const x = m * m * m * x0 + 3 * m * m * u * x1 + 3 * m * u * u * x2 + u * u * u * x3;
      const y = m * m * m * y0 + 3 * m * m * u * y1 + 3 * m * u * u * y2 + u * u * u * y3;
      if (i) L += Math.hypot(x - px, y - py);
      P.push({ x, y, l: L }); px = x; py = y;
    }
    P.L = L; return P;
  }
  const seg2 = (x0, y0, x1, y1) => bez(x0, y0, lerp(x0, x1, 0.33), lerp(y0, y1, 0.33), lerp(x0, x1, 0.66), lerp(y0, y1, 0.66), x1, y1, 8);
  function ptAt(P, f) {
    const tl = cl(f) * P.L;
    for (let i = 1; i < P.length; i++) if (P[i].l >= tl) { const a = P[i - 1], b = P[i], k = (tl - a.l) / Math.max(1e-6, b.l - a.l); return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }; }
    return P[P.length - 1];
  }
  function sub(ctx, P, a, b) {
    a = cl(a); b = cl(b); ctx.beginPath(); if (b <= a) return;
    const s = ptAt(P, a); ctx.moveTo(s.x, s.y);
    const la = a * P.L, lb = b * P.L;
    for (const p of P) if (p.l > la && p.l < lb) ctx.lineTo(p.x, p.y);
    const e = ptAt(P, b); ctx.lineTo(e.x, e.y);
  }
  function pulseOn(ctx, P, p, col, len = 0.16, a = 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a0 = p - len * (i + 1) / n, a1 = p - len * i / n;
      if (a1 <= 0 || a0 >= 1) continue;
      ctx.strokeStyle = rgb(col, 0.85 * a * (1 - i / n)); ctx.lineWidth = 3.4 - i * 0.3; sub(ctx, P, a0, a1); ctx.stroke();
    }
    if (p >= 0 && p <= 1) { const h = ptAt(P, p); glowDot(ctx, h.x, h.y, col, 18, a); }
    ctx.restore();
  }
  function connector(ctx, P, o = {}) {
    const d = o.draw ?? 1, a = o.a ?? 1; if (d <= 0 || a <= 0.003) return;
    const c0 = (o.col || [])[0] || C.cyan, c1 = (o.col || [])[1] || C.violet;
    ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
    const s = P[0], e = P[P.length - 1], g = ctx.createLinearGradient(s.x, s.y, e.x, e.y);
    g.addColorStop(0, rgb(c0, 0.75)); g.addColorStop(1, rgb(c1, 0.75));
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgb(c0, 0.08); ctx.lineWidth = 9; sub(ctx, P, 0, d); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = g; ctx.lineWidth = o.lw || 1.8; sub(ctx, P, 0, d); ctx.stroke();
    if (!o.noEnds) {
      ctx.fillStyle = '#0b0d30'; ctx.strokeStyle = c0; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, 6.283); ctx.fill(); ctx.stroke();
      if (d >= 1) { ctx.strokeStyle = c1; ctx.beginPath(); ctx.arc(e.x, e.y, 4, 0, 6.283); ctx.fill(); ctx.stroke(); }
    }
    if (d < 1) { const hpt = ptAt(P, d); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, hpt.x, hpt.y, c0, 16); }
    ctx.restore();
    for (const p of o.pulses || []) if (p > 0 && p - 0.16 < d) pulseOn(ctx, P, Math.min(p, d), o.pc || '#9ff0ff', o.pl || 0.16, a);
  }

  // =====================================================================================================
  // STILL + CLIP: "From data to answers": headline at left, node diagram (inputs -> brain hub -> outputs) at right
  // =====================================================================================================
  const HUB0 = { x: 912, y: 360, s: 156 };
  const INS = [
    { x: 668, y: 196, icon: 'database', label: 'Data', col: [C.cyan, C.blue] },
    { x: 668, y: 360, icon: 'eye', label: 'Vision', col: [C.cyan, C.violet] },
    { x: 668, y: 524, icon: 'chat', label: 'Text', col: [C.blue, C.violet] },
  ];
  const OUTS = [
    { x: 1150, y: 262, icon: 'sparkle', label: 'Ideas', col: [C.violet, C.magenta] },
    { x: 1150, y: 458, icon: 'check', label: 'Answers', col: [C.cyan, C.green] },
  ];
  const IN_P = INS.map((n) => bez(n.x + 48, n.y, n.x + 120, n.y, HUB0.x - 150, HUB0.y + (n.y - HUB0.y) * 0.25, HUB0.x - 82, HUB0.y + (n.y - HUB0.y) * 0.18));
  const OUT_P = OUTS.map((n) => bez(HUB0.x + 82, HUB0.y + (n.y - HUB0.y) * 0.2, HUB0.x + 140, HUB0.y + (n.y - HUB0.y) * 0.3, n.x - 120, n.y, n.x - 48, n.y));

  function drawStill(ctx, W, Hh, t) {
    const lvl = 0.35 + 0.65 * eo(0, 1.0, t);
    const camX = -30 * eo(0, 5, t);
    background(ctx, W, Hh, t, camX, lvl);
    // slow camera push
    const z = 1.06 - 0.06 * eo(0, 4.4, t);
    ctx.save(); ctx.translate(W / 2, Hh / 2); ctx.scale(z, z); ctx.translate(-W / 2 + 3 * Math.sin(t * 0.6), -Hh / 2 + 2 * Math.cos(t * 0.5));

    // ---- diagram
    const hubIn = ebk(0.3, 0.95, t);
    // floor glow + orbit ring behind hub
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const fg = ctx.createRadialGradient(HUB0.x, HUB0.y, 0, HUB0.x, HUB0.y, 260);
    fg.addColorStop(0, rgb(C.violet, 0.24 * hubIn)); fg.addColorStop(0.5, rgb(C.blue, 0.09 * hubIn)); fg.addColorStop(1, rgb(C.violet, 0));
    ctx.fillStyle = fg; ctx.fillRect(HUB0.x - 260, HUB0.y - 260, 520, 520);
    ctx.restore();
    const ringA = eo(0.7, 1.4, t), rot = -0.22;
    const orbit = (from, to) => {
      ctx.save(); ctx.globalAlpha = ringA; ctx.lineWidth = 1.4;
      const g = ctx.createLinearGradient(HUB0.x - 130, 0, HUB0.x + 130, 0); g.addColorStop(0, rgb(C.cyan, 0.7)); g.addColorStop(1, rgb(C.violet, 0.7));
      ctx.strokeStyle = g; ctx.beginPath(); ctx.ellipse(HUB0.x, HUB0.y, 132, 40, rot, from, to); ctx.stroke();
      ctx.strokeStyle = rgb(C.blue, 0.25); ctx.beginPath(); ctx.ellipse(HUB0.x, HUB0.y, 150, 48, rot, from, to); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const th = t * 0.9 + i * 2.094; const n = ((th % 6.283) + 6.283) % 6.283;
        if ((from === Math.PI && n >= Math.PI) || (from === 0 && n < Math.PI)) {
          const ex = 132 * Math.cos(n), ey = 40 * Math.sin(n);
          const x = HUB0.x + ex * Math.cos(rot) - ey * Math.sin(rot), y = HUB0.y + ex * Math.sin(rot) + ey * Math.cos(rot);
          ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, i === 1 ? C.magenta : C.cyan, 14); ctx.globalCompositeOperation = 'source-over';
        }
      }
      ctx.restore();
    };
    orbit(Math.PI, Math.PI * 2);

    // connectors + pulses
    IN_P.forEach((P, i) => {
      const d = eio(0.95 + i * 0.12, 1.5 + i * 0.12, t);
      const pulses = t > 1.6 ? [0, 1].map((k) => fract((t - 1.6) * 0.55 + i * 0.31 + k * 0.5)) : [];
      connector(ctx, P, { draw: d, col: INS[i].col, pulses });
    });
    OUT_P.forEach((P, i) => {
      const d = eio(1.25 + i * 0.12, 1.8 + i * 0.12, t);
      const pulses = t > 1.9 ? [fract((t - 1.9) * 0.6 + i * 0.45)] : [];
      connector(ctx, P, { draw: d, col: [C.violet, OUTS[i].col[1]], pulses, pc: i ? '#a6ffe0' : '#f0b8ff' });
    });

    // hub: absorbs pulses -> breathing glow
    const hubGlow = 1.3 + 0.5 * Math.sin(t * 2.4) + 1.6 * bump(t, 0.75, 5);
    tile(ctx, HUB0.x, HUB0.y, HUB0.s, 'brain', { sc: hubIn, a: cl(hubIn * 2), glow: hubGlow, col: [C.cyan, C.violet], draw: eo(0.45, 1.3, t) });
    orbit(0, Math.PI);
    pill(ctx, HUB0.x, HUB0.y + 122, 'AI model', { a: eo(1.1, 1.5, t), size: 18, dot: true });

    INS.forEach((n, i) => {
      const t0 = 0.55 + i * 0.13, p = ebk(t0, t0 + 0.5, t);
      tile(ctx, n.x, n.y, 92, n.icon, { sc: p, a: cl(p * 2), col: n.col, glow: 1 + 1.4 * bump(t, t0 + 0.3, 5), draw: eo(t0 + 0.1, t0 + 0.7, t) });
      ctx.save(); ctx.globalAlpha = eo(t0 + 0.5, t0 + 0.9, t); ctx.font = F(600, 16, UI); ctx.fillStyle = C.muted; ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + 74); ctx.restore();
    });
    OUTS.forEach((n, i) => {
      const t0 = 1.75 + i * 0.15, p = ebk(t0, t0 + 0.5, t);
      tile(ctx, n.x, n.y, 92, n.icon, { sc: p, a: cl(p * 2), col: n.col, glow: 1 + 1.4 * bump(t, t0 + 0.3, 5) + 0.3 * Math.sin(t * 3 + i), draw: eo(t0 + 0.1, t0 + 0.7, t) });
      ctx.save(); ctx.globalAlpha = eo(t0 + 0.5, t0 + 0.9, t); ctx.font = F(600, 16, UI); ctx.fillStyle = C.muted; ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + 74); ctx.restore();
    });

    // ---- headline block
    const ex = eo(1.15, 1.6, t);
    eyebrow(ctx, 'AI EXPLAINED', 84 - (1 - ex) * 24, 198, { a: ex, size: 17 });
    revealLine(ctx, 'From data', 80, 284, 78, seg(1.3, 2.1, t));
    revealLine(ctx, 'to answers.', 80, 366, 78, seg(1.55, 2.35, t));
    ctx.save(); ctx.globalAlpha = eo(2.1, 2.6, t); ctx.font = F(400, 22, UI); ctx.fillStyle = '#b3bbec';
    ctx.fillText('How a model turns patterns into replies', 82, 420 + (1 - eo(2.1, 2.6, t)) * 10); ctx.restore();

    // ---- stat card with counting number
    const cp = eo(2.35, 2.9, t);
    if (cp > 0) {
      ctx.save(); ctx.translate(0, (1 - cp) * 24); ctx.globalAlpha = cp;
      card(ctx, 80, 470, 330, 140, { r: 20, flash: 0.9 * bump(t, 3.85, 4) });
      eyebrow(ctx, 'ACCURACY', 104, 508, { size: 14 });
      const v = 97.4 * E.out(seg(2.5, 3.85, t));
      gtext(ctx, v.toFixed(1) + '%', 102, 576, 54, { cols: GRAD_NUM });
      // sparkline
      const sp = eo(2.6, 3.85, t), xs = 268, ys = 585;
      ctx.save(); ctx.beginPath();
      for (let i = 0; i <= 20 * sp; i++) { const u = i / 20, y = ys - 54 * (1 - Math.exp(-3 * u)) / (1 - Math.exp(-3)) - 4 * Math.sin(u * 17) * (1 - u); i ? ctx.lineTo(xs + u * 118, y) : ctx.moveTo(xs, y); }
      const lg = ctx.createLinearGradient(xs, 0, xs + 118, 0); lg.addColorStop(0, C.blue); lg.addColorStop(1, C.cyan);
      ctx.strokeStyle = lg; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
      if (sp > 0.02) { const u = cl(Math.floor(20 * sp) / 20); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, xs + u * 118, ys - 54 * (1 - Math.exp(-3 * u)) / (1 - Math.exp(-3)) - 4 * Math.sin(u * 17) * (1 - u), C.cyan, 14); }
      ctx.restore();
    }
    ctx.restore();
    bloom(ctx, 1);
    H.vignette(ctx, W, Hh, 0.45, '2,3,16');
  }

  // =====================================================================================================
  // EXPLAINER: "How does AI learn?" (15 s)
  // =====================================================================================================
  const X = {
    D: 15,
    shrink: [1.85, 2.55],           // title -> corner header
    hubFly: [1.95, 2.7],            // brain tile flies to the model spot
    dbIn: 2.3, lanes: [2.55, 3.1],
    countA: 2.85, countB: 5.4,      // examples counter
    spawn0: 2.95, spawnGap: 0.21, spawnN: 12, travel: 1.7,
    zoom: [5.9, 6.55],              // push through the brain into the network
    netIn: [6.25, 6.85],
    chips: 6.55, inputIn: [6.5, 6.85], inLines: [6.75, 7.0],
    fwd1: [7.0, 7.5], outLines: [7.42, 7.62], ansIn: [7.35, 7.65], ans1: 7.68,
    check: 8.05, truth: 8.18,
    errBack: [8.45, 8.75], backWave: [8.72, 9.2], morph: [8.85, 9.45], updated: 9.05,
    loopBack: [9.28, 9.5], fwd2: [9.5, 9.92], ans2: 10.0,
    pan: [10.45, 11.0],
    acc: [11.0, 12.4], hit: 12.45,
    pull: [13.0, 13.5], tkTiles: [13.2, 13.35], tkText: [13.35, 13.8], underline: [13.85, 14.25],
  };
  const HUB = { x: 1010, y: 420, s: 170 }, DB = { x: 170, y: 420, s: 110 };
  const LANES = [-160, 0, 160].map((dy) => bez(DB.x + 62, 420, 310, 420 + dy * 1.2, 650, 420 + dy, HUB.x - 92, 420));
  const EXAMPLES = (() => {
    const kinds = ['cat', 'dog', 'dog', 'cat', 'cat', 'dog', 'cat', 'dog', 'cat', 'dog', 'dog', 'cat'];
    return Array.from({ length: X.spawnN }, (_, i) => ({ s: X.spawn0 + i * X.spawnGap, lane: [1, 0, 2][i % 3], kind: kinds[i] }));
  })();
  // network inside the model card
  const NET = { x: 250, y: 225, w: 480, h: 390 };
  const LAYERS = (() => {
    const xs = [325, 450, 575, 680], ns = [3, 4, 4, 2], cy = 435, sp = 78;
    return xs.map((x, li) => Array.from({ length: ns[li] }, (_, k) => ({ x, y: cy + (k - (ns[li] - 1) / 2) * sp })));
  })();
  const EDGES = (() => {
    const r = H.rng(31), out = [];
    for (let l = 0; l < 3; l++) for (const a of LAYERS[l]) for (const b of LAYERS[l + 1]) {
      const w1 = r.range(-1, 1), w2 = cl(w1 + r.range(-0.9, 0.9) + (Math.abs(w1) < 0.3 ? 0.5 : 0), -1, 1);
      out.push({ a, b, l, w1, w2 });
    }
    return out;
  })();
  const INPUT = { x: 132, y: 430, s: 116 };
  const ANS = { x: 830, y: 285, w: 360, h: 290 };
  const IN_LINES = LAYERS[0].map((n) => bez(INPUT.x + 60, INPUT.y, INPUT.x + 120, INPUT.y, n.x - 70, n.y, n.x - 13, n.y, 24));
  const OUT_LINES = LAYERS[3].map((n) => bez(n.x + 13, n.y, n.x + 70, n.y, ANS.x - 70, 430, ANS.x, 430, 24));
  const CHIPS = [{ x: 400, label: 'Guess', n: '1' }, { x: 640, label: 'Check', n: '2' }, { x: 880, label: 'Adjust', n: '3' }];
  const CHIP_Y = 140;
  const CHIP_LINES = [seg2(400 + 104, CHIP_Y, 640 - 104, CHIP_Y), seg2(640 + 104, CHIP_Y, 880 - 104, CHIP_Y)];
  const LOOP_LINE = bez(880, CHIP_Y - 29, 830, 66, 450, 66, 400, CHIP_Y - 29, 40);
  // accuracy curve
  const accAt = (f) => 61 + 36 * (1 - Math.exp(-3.2 * f)) / (1 - Math.exp(-3.2));
  const CH = { x: 560, y: 205, w: 560, h: 360 };

  function chip(ctx, c, active, a) {
    if (a <= 0.003) return;
    const w = 204, h = 58, x = c.x - w / 2, y = CHIP_Y - h / 2;
    ctx.save(); ctx.globalAlpha *= a;
    if (active > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(c.x, CHIP_Y, 0, c.x, CHIP_Y, 130); g.addColorStop(0, rgb(C.cyan, 0.3 * active)); g.addColorStop(1, rgb(C.cyan, 0));
      ctx.fillStyle = g; ctx.fillRect(c.x - 130, CHIP_Y - 130, 260, 260); ctx.restore();
    }
    const fg = ctx.createLinearGradient(x, 0, x + w, 0);
    fg.addColorStop(0, H.rgba(H.mix('#0c0e34', '#1d4fd8', active), 0.92)); fg.addColorStop(1, H.rgba(H.mix('#0c0e34', '#6a2fe0', active), 0.92));
    ctx.fillStyle = fg; rr(ctx, x, y, w, h, h / 2); ctx.fill();
    const bg = ctx.createLinearGradient(x, 0, x + w, 0); bg.addColorStop(0, rgb(C.cyan, 0.5 + 0.5 * active)); bg.addColorStop(1, rgb(C.violet, 0.5 + 0.5 * active));
    ctx.strokeStyle = bg; ctx.lineWidth = 1.5 + active; rr(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, h / 2); ctx.stroke();
    // number disc
    ctx.fillStyle = H.rgba(H.mix('#1a1f5c', '#ffffff', active * 0.9), 1); ctx.beginPath(); ctx.arc(x + 31, CHIP_Y, 17, 0, 6.283); ctx.fill();
    ctx.fillStyle = active > 0.5 ? '#1b2a8a' : C.white; ctx.font = F(700, 20, HEAD); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.n, x + 31, CHIP_Y + 1);
    ctx.fillStyle = H.rgba(H.mix('#aab2e6', '#ffffff', active), 1); ctx.font = F(600, 30, UI); ctx.textAlign = 'left'; ctx.fillText(c.label, x + 60, CHIP_Y + 1);
    ctx.restore();
  }
  const winAct = (t, wins) => Math.max(0, ...wins.map(([a, b]) => Math.min(eo(a - 0.05, a + 0.15, t), 1 - eo(b - 0.1, b + 0.1, t))));
  // a node-lighting wave front: dir +1 forward (left->right), -1 backward
  function waveDots(ctx, X0, col, dir) {
    for (const e of EDGES) {
      const xa = e.a.x, xb = e.b.x, u = (X0 - xa) / (xb - xa);
      if (u <= 0 || u >= 1) continue;
      const w = Math.abs(dir > 0 ? e.w1 : e.w2);
      if (w < 0.28) continue;
      glowDot(ctx, lerp(e.a.x, e.b.x, u), lerp(e.a.y, e.b.y, u), col, 8 + 7 * w, 0.8);
    }
  }
  function network(ctx, t) {
    const m = eio(X.morph[0], X.morph[1], t);
    const f1 = seg(X.fwd1[0], X.fwd1[1], t), f2 = seg(X.fwd2[0], X.fwd2[1], t), bw = seg(X.backWave[0], X.backWave[1], t);
    const x0 = LAYERS[0][0].x, x3 = LAYERS[3][0].x;
    const fwdX = t < X.fwd2[0] ? lerp(x0 - 20, x3 + 20, f1) : lerp(x0 - 20, x3 + 20, f2);
    const fwdOn = (t > X.fwd1[0] && t < X.fwd1[1] + 0.05) || (t > X.fwd2[0] && t < X.fwd2[1] + 0.05);
    const backX = lerp(x3 + 20, x0 - 20, bw), backOn = t > X.backWave[0] && t < X.backWave[1] + 0.05;
    const adjGlow = Math.sin(Math.PI * seg(X.morph[0], X.morph[1], t));
    // edges
    ctx.save(); ctx.lineCap = 'round';
    for (const e of EDGES) {
      const w = lerp(e.w1, e.w2, m), aw = Math.abs(w);
      const col = w >= 0 ? H.mix(C.cyan, C.blue, 0.3) : H.mix(C.violet, C.magenta, 0.35);
      const hot = backOn ? Math.exp(-Math.pow((backX - (e.a.x + e.b.x) / 2) / 70, 2)) : 0;
      ctx.strokeStyle = H.rgba(H.mix(col, C.red, hot * 0.8), 0.18 + 0.55 * aw + 0.3 * adjGlow * aw);
      ctx.lineWidth = 0.6 + 2.6 * aw + adjGlow * 0.8;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (fwdOn) waveDots(ctx, fwdX, C.cyan, 1);
    if (backOn) waveDots(ctx, backX, C.red, -1);
    ctx.restore();
    // nodes
    LAYERS.forEach((L, li) => L.forEach((n, k) => {
      const lf = fwdOn ? Math.exp(-Math.pow((fwdX - n.x) / 45, 2)) : 0, lb = backOn ? Math.exp(-Math.pow((backX - n.x) / 45, 2)) : 0;
      const pop = ebk(X.netIn[0] + 0.15 + li * 0.08 + k * 0.03, X.netIn[0] + 0.55 + li * 0.08 + k * 0.03, t);
      if (pop <= 0) return;
      ctx.save(); ctx.translate(n.x, n.y); ctx.scale(pop, pop);
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, lb > lf ? C.red : C.cyan, 30, 0.25 + 0.75 * Math.max(lf, lb)); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0d1040'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 6.283); ctx.fill();
      const g = ctx.createLinearGradient(-13, -13, 13, 13); g.addColorStop(0, C.cyan); g.addColorStop(1, C.violet);
      ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.fillStyle = H.rgba(H.mix(lb > lf ? C.red : C.cyan, '#ffffff', 0.4), 0.35 + 0.65 * Math.max(lf, lb)); ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, 6.283); ctx.fill();
      ctx.restore();
    }));
  }

  function explainer(ctx, W, Hh, t) {
    // camera x for background parallax (pans with the beat-4 move)
    const panE = eio(X.pan[0], X.pan[1], t);
    const camX = 60 * eo(2, 6, t) + 900 * panE + 40 * eo(11, 15, t);
    const lvl = 0.45 + 0.55 * eo(0, 0.8, t);
    background(ctx, W, Hh, t, camX, lvl);
    const sway = (k) => { ctx.translate(W / 2, Hh / 2); ctx.scale(k, k); ctx.translate(-W / 2 + 4 * Math.sin(t * 0.55), -Hh / 2 + 3 * Math.cos(t * 0.47)); };

    // ------------------------------------------------ beat 1: hook (title in the middle, brain tile above)
    const shr = eio(X.shrink[0], X.shrink[1], t);
    const fly = eio(X.hubFly[0], X.hubFly[1], t);
    if (t < X.hubFly[1]) {
      ctx.save(); sway(1.04 - 0.04 * eo(0, 2.5, t));
      const pop = ebk(0.15, 0.7, t);
      const hx = lerp(640, HUB.x, fly), hy = lerp(250, HUB.y, fly), hs = lerp(150, HUB.s, fly);
      // ring pulses around the tile while it waits
      for (let i = 0; i < 2; i++) { const q = fract((t - 0.5) * 0.8 + i * 0.5); if (t > 0.5) ring(ctx, hx, hy, hs * 0.6 + q * 120, i ? C.violet : C.cyan, 0.35 * (1 - q) * (1 - fly)); }
      tile(ctx, hx, hy, hs, 'brain', { sc: pop, a: cl(pop * 2), glow: 1.5 + 1.8 * bump(t, 0.5, 4) + 0.4 * Math.sin(t * 3), draw: eo(0.3, 1.1, t) });
      eyebrow(ctx, 'AI EXPLAINED', 640, 380, { a: eo(0.45, 0.8, t) * (1 - eo(1.7, 2.0, t)), align: 'center', size: 20 });
      ctx.restore();
    }

    // ------------------------------------------------ beat 2: data streams into the model
    const zoomP = E.in(seg(X.zoom[0], X.zoom[1], t)), zA = 1 - seg(X.zoom[0] + 0.32, X.zoom[1] - 0.02, t);
    if (t >= X.dbIn - 0.05 && t < X.zoom[1]) {
      ctx.save(); sway(1.03 + 0.03 * eo(2.5, 5.9, t));
      ctx.translate(HUB.x, HUB.y); ctx.scale(1 + 9 * zoomP, 1 + 9 * zoomP); ctx.translate(-HUB.x, -HUB.y);
      ctx.globalAlpha = zA;
      // lanes + pulses
      LANES.forEach((P, i) => {
        const d = eio(X.lanes[0] + i * 0.08, X.lanes[1] + i * 0.08, t);
        const pulses = t > 3.0 ? [0, 1, 2].map((k) => fract((t - 3.0) * 0.7 + i * 0.21 + k / 3)) : [];
        connector(ctx, P, { draw: d, col: [C.cyan, C.violet], pulses, lw: 2 });
      });
      // database source
      const dbp = ebk(X.dbIn, X.dbIn + 0.45, t);
      tile(ctx, DB.x, DB.y, DB.s, 'database', { sc: dbp, a: cl(dbp * 2), col: [C.cyan, C.blue], glow: 1.3 + 1.5 * bump(t, X.dbIn + 0.25, 5), draw: eo(X.dbIn + 0.1, X.dbIn + 0.7, t) });
      pill(ctx, DB.x, DB.y + 100, 'Data', { size: 30, a: eo(2.8, 3.1, t), sc: 0.9 + 0.1 * eo(2.8, 3.1, t), dot: true });
      // examples flowing along the lanes (drawn before the hub so they slide into it)
      for (const ex of EXAMPLES) {
        const f = (t - ex.s) / X.travel; if (f <= 0 || f >= 1) continue;
        const u = lerp(0.14, 1, E.inOut(f) * 0.4 + f * 0.6), pt = ptAt(LANES[ex.lane], u);
        const sc = (0.45 + 0.55 * E.out(cl((u - 0.14) / 0.16))) * (1 - 0.65 * E.in(cl((f - 0.78) / 0.22)));
        const a = cl(f / 0.08) * (1 - cl((f - 0.9) / 0.1)) * (1 - seg(X.zoom[0], X.zoom[0] + 0.2, t));
        const col = ex.kind === 'cat' ? [C.cyan, C.blue] : [C.violet, C.magenta];
        tile(ctx, pt.x, pt.y, 84, ex.kind, { sc, a, col, glow: 1.2 });
        pill(ctx, pt.x, pt.y + 64 * sc, ex.kind, { a: a * cl((u - 0.27) / 0.08), sc: sc, col, size: 28 });
      }
      // model hub (absorb flashes)
      let flash = 0; for (const ex of EXAMPLES) flash += bump(t, ex.s + X.travel * 0.95, 7);
      const hubGlow = 1.4 + Math.min(1.6, flash * 1.2) + 0.3 * Math.sin(t * 2.6);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createRadialGradient(HUB.x, HUB.y, 0, HUB.x, HUB.y, 260); fg.addColorStop(0, rgb(C.blue, 0.3 * fly)); fg.addColorStop(1, rgb(C.violet, 0));
      ctx.fillStyle = fg; ctx.fillRect(HUB.x - 260, HUB.y - 260, 520, 520); ctx.restore();
      for (let i = 0; i < 2; i++) { const q = fract((t - 2.7) * 0.6 + i * 0.5); ring(ctx, HUB.x, HUB.y, 96 + q * 90, i ? C.violet : C.cyan, 0.3 * (1 - q) * seg(2.7, 3.0, t)); }
      if (t >= X.hubFly[1]) tile(ctx, HUB.x, HUB.y, HUB.s, 'brain', { glow: hubGlow });
      pill(ctx, HUB.x, HUB.y + 138, 'Model', { size: 30, a: eo(2.85, 3.15, t), dot: true, col: [C.violet, C.magenta] });
      // counter
      const ca = eo(2.6, 2.95, t);
      if (ca > 0) {
        ctx.save(); ctx.globalAlpha *= ca; ctx.translate(0, (1 - ca) * 18);
        eyebrow(ctx, 'TRAINING DATA', 640, 112, { align: 'center', size: 28 });
        const p = seg(X.countA, X.countB, t), val = Math.round(1e6 * Math.pow(p, 2.2));
        const done = bump(t, X.countB, 4);
        ctx.font = F(700, 80, HEAD); const wN = ctx.measureText('1,000,000').width;
        ctx.font = F(600, 30, UI); const wE = ctx.measureText('examples').width;
        const x0 = 640 - (wN + 16 + wE) / 2;
        ctx.save(); ctx.translate(x0 + wN, 196); ctx.scale(1 + 0.06 * done, 1 + 0.06 * done);
        if (done > 0.02) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, -wN / 2, -28, C.cyan, 240, 0.25 * done); ctx.globalCompositeOperation = 'source-over'; }
        gtext(ctx, val.toLocaleString('en-US'), 0, 0, 80, { align: 'right', cols: done > 0.05 ? ['#ffffff', '#b6f6ff', '#c3b2ff'] : GRAD_NUM });
        ctx.restore();
        ctx.fillStyle = '#b8c0f0'; ctx.font = F(600, 30, UI); ctx.textAlign = 'left'; ctx.fillText('examples', x0 + wN + 16, 196);
        ctx.restore();
      }
      ctx.restore();
      // speed streaks + flash while pushing through the brain
      const st = Math.sin(Math.PI * seg(X.zoom[0] + 0.05, X.zoom[1] + 0.1, t));
      if (st > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = H.rng(5);
        for (let i = 0; i < 46; i++) {
          const ang = r() * 6.283, r0 = 60 + r() * 200 + zoomP * 400, len = 80 + r() * 260 * (0.3 + zoomP);
          const c = r.pick([C.cyan, C.violet, C.blue]);
          const g = ctx.createLinearGradient(HUB.x + Math.cos(ang) * r0, HUB.y + Math.sin(ang) * r0, HUB.x + Math.cos(ang) * (r0 + len), HUB.y + Math.sin(ang) * (r0 + len));
          g.addColorStop(0, rgb(c, 0)); g.addColorStop(1, rgb(c, 0.5 * st));
          ctx.strokeStyle = g; ctx.lineWidth = 1 + r() * 2; ctx.beginPath();
          ctx.moveTo(HUB.x + Math.cos(ang) * r0, HUB.y + Math.sin(ang) * r0); ctx.lineTo(HUB.x + Math.cos(ang) * (r0 + len), HUB.y + Math.sin(ang) * (r0 + len)); ctx.stroke();
        }
        const fl = Math.exp(-Math.pow((t - 6.38) / 0.12, 2));
        glowDot(ctx, HUB.x, HUB.y, C.cyan, 700, 0.5 * fl);
        ctx.restore();
      }
    }

    // ------------------------------------------------ beat 3: guess -> check -> adjust
    const b3x = -1350 * panE;
    if (t >= X.netIn[0] && t < X.pan[1]) {
      ctx.save(); sway(1 + 0.02 * eo(6.5, 10.4, t)); ctx.translate(b3x, 0);
      const nin = eo(X.netIn[0], X.netIn[1], t);
      const ncx = NET.x + NET.w / 2, ncy = NET.y + NET.h / 2;
      ctx.save();
      ctx.translate(lerp(HUB.x, ncx, nin), lerp(HUB.y, ncy, nin)); ctx.scale(lerp(0.2, 1, nin), lerp(0.2, 1, nin)); ctx.translate(-ncx, -ncy);
      ctx.globalAlpha = seg(X.netIn[0], X.netIn[0] + 0.25, t);
      const adjFlash = Math.sin(Math.PI * seg(X.morph[0], X.morph[1], t));
      card(ctx, NET.x, NET.y, NET.w, NET.h, { acc: [C.cyan, C.violet], flash: 0.5 * adjFlash, flashCol: C.magenta });
      eyebrow(ctx, 'MODEL', NET.x + 26, NET.y + 48, { size: 28, col: C.violet });
      ctx.restore();
      if (t > X.netIn[0] + 0.15) network(ctx, t);
      // weights pill lands on the network card
      const up = ebk(X.updated, X.updated + 0.35, t);
      pill(ctx, NET.x + NET.w / 2, NET.y + NET.h + 2, 'weights adjusted', { a: cl(up * 2), sc: up, col: [C.magenta, C.violet], dot: true, size: 28 });
      // input tile + its fan of connectors
      const ip = eo(X.inputIn[0], X.inputIn[1], t);
      tile(ctx, lerp(-120, INPUT.x, ip), INPUT.y, INPUT.s, 'cat', { a: ip, col: [C.cyan, C.blue], glow: 1.3 + 1.2 * bump(t, X.inputIn[1], 5) });
      eyebrow(ctx, 'NEW PHOTO', lerp(-120, INPUT.x, ip), INPUT.y - 86, { a: ip, size: 28, align: 'center' });
      IN_LINES.forEach((P, i) => {
        const pul = [];
        if (t > X.inLines[1] - 0.1 && t < X.fwd1[0] + 0.15) pul.push(seg(X.inLines[1] - 0.1, X.fwd1[0] + 0.15, t) * 1.15);
        if (t > X.fwd2[0] - 0.25 && t < X.fwd2[0] + 0.05) pul.push(seg(X.fwd2[0] - 0.25, X.fwd2[0] + 0.05, t) * 1.15);
        connector(ctx, P, { draw: eio(X.inLines[0] + i * 0.03, X.inLines[1] + i * 0.03, t), col: [C.cyan, C.blue], pulses: pul, noEnds: true });
      });
      // output fan into the answer card (forward pulses, then the error pulse running back in red)
      OUT_LINES.forEach((P, i) => {
        const pul = [];
        if (t > X.fwd1[1] - 0.12 && t < X.ans1 + 0.1) pul.push(seg(X.fwd1[1] - 0.12, X.ans1 + 0.05, t) * 1.15);
        if (t > X.fwd2[1] - 0.12 && t < X.ans2 + 0.1) pul.push(seg(X.fwd2[1] - 0.12, X.ans2 + 0.05, t) * 1.15);
        connector(ctx, P, { draw: eio(X.outLines[0], X.outLines[1], t), col: [C.violet, C.cyan], pulses: pul, noEnds: true });
        if (t > X.errBack[0] && t < X.errBack[1] + 0.12) pulseOn(ctx, P, 1 - seg(X.errBack[0], X.errBack[1], t) * 1.1, C.red, 0.3);
      });
      // answer card
      const ap = eo(X.ansIn[0], X.ansIn[1], t);
      if (ap > 0) {
        const wrong = t >= X.check && t < X.ans2, right = t >= X.ans2;
        const shake = t > X.check ? 9 * Math.sin((t - X.check) * 55) * Math.exp(-(t - X.check) * 9) : 0;
        ctx.save(); ctx.globalAlpha = ap; ctx.translate(shake + (1 - ap) * 40, 0);
        const fl = wrong ? 0.9 * bump(t, X.check, 3) + 0.25 : right ? 0.9 * bump(t, X.ans2, 3) + 0.2 : 0;
        card(ctx, ANS.x, ANS.y, ANS.w, ANS.h, { acc: right ? [C.green, C.cyan] : [C.violet, C.cyan], flash: fl, flashCol: right ? C.green : C.red });
        eyebrow(ctx, 'OUTPUT', ANS.x + 26, ANS.y + 50, { size: 28, col: right ? C.green : C.cyan });
        // the guess
        const g1 = ebk(X.ans1, X.ans1 + 0.3, t), g2 = ebk(X.ans2, X.ans2 + 0.3, t);
        const word = right ? 'cat' : 'dog?', gp = right ? g2 : g1;
        if (gp > 0) {
          ctx.save(); ctx.translate(ANS.x + 40, ANS.y + 150); ctx.scale(0.7 + 0.3 * gp, 0.7 + 0.3 * gp); ctx.globalAlpha *= cl(gp * 2);
          gtext(ctx, word, 0, 0, 70, { cols: right ? ['#ffffff', '#9ffbe0', C.green] : wrong ? ['#ffffff', '#ffc2d2', C.red] : GRAD_HEAD });
          ctx.restore();
        }
        // verdict badge
        const bx = ANS.x + ANS.w - 70, by = ANS.y + 128;
        const bp = right ? ebk(X.ans2 + 0.05, X.ans2 + 0.4, t) : ebk(X.check, X.check + 0.3, t);
        if ((wrong || right) && bp > 0) {
          const col = right ? C.green : C.red;
          ctx.save(); rr(ctx, ANS.x + 1, ANS.y + 1, ANS.w - 2, ANS.h - 2, 21); ctx.clip(); // keep the shock ring inside the card
          ring(ctx, bx, by, 34 + (1 - bump(t, right ? X.ans2 : X.check, 3)) * 62, col, 0.8 * bump(t, right ? X.ans2 : X.check, 3), 3);
          ctx.restore();
          ctx.save(); ctx.translate(bx, by); ctx.scale(bp, bp);
          ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 0, 0, col, 70, 0.5); ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = H.rgba(H.mix(col, '#0a0b2a', 0.55), 1); ctx.beginPath(); ctx.arc(0, 0, 32, 0, 6.283); ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ICONS[right ? 'check' : 'cross'](ctx, 26); ctx.stroke();
          ctx.restore();
        }
        // the true label lands under the guess
        const tp = eo(X.truth, X.truth + 0.35, t);
        if (tp > 0) {
          ctx.save(); ctx.globalAlpha *= tp; ctx.translate(0, (1 - tp) * -24);
          ctx.font = F(600, 30, UI); ctx.fillStyle = '#e3e7ff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(right ? 'Correct:' : 'Answer:', ANS.x + 34, ANS.y + 236);
          const lw = ctx.measureText(right ? 'Correct:' : 'Answer:').width;
          ctx.restore();
          pill(ctx, ANS.x + 34 + lw + 64, ANS.y + 226 + (1 - tp) * -24, 'cat', { a: tp, col: [C.green, C.cyan], dot: true, size: 30 });
        }
        ctx.restore();
      }
      // loop chips (top), connectors between them, return arc Adjust -> Guess
      const chipA = (i) => eo(X.chips + i * 0.1, X.chips + 0.35 + i * 0.1, t);
      CHIP_LINES.forEach((P, i) => {
        const pul = [];
        if (t > X.check - 0.25 && t < X.check + 0.05 && i === 0) pul.push(seg(X.check - 0.25, X.check, t));
        if (t > X.errBack[0] - 0.05 && t < X.errBack[0] + 0.25 && i === 1) pul.push(seg(X.errBack[0] - 0.05, X.errBack[0] + 0.2, t));
        if (t > X.ans2 - 0.2 && t < X.ans2 + 0.1 && i === 0) pul.push(seg(X.ans2 - 0.2, X.ans2 + 0.05, t));
        connector(ctx, P, { draw: eio(X.chips + 0.2 + i * 0.1, X.chips + 0.5 + i * 0.1, t), pulses: pul, noEnds: true });
      });
      connector(ctx, LOOP_LINE, { draw: eio(X.chips + 0.4, X.chips + 0.9, t), a: 0.75, col: [C.violet, C.cyan], noEnds: true,
        pulses: t > X.loopBack[0] && t < X.loopBack[1] + 0.12 ? [seg(X.loopBack[0], X.loopBack[1], t) * 1.15] : [], pc: '#d9b8ff' });
      // arrowhead on the return arc
      if (eio(X.chips + 0.4, X.chips + 0.9, t) >= 1) { ctx.save(); ctx.globalAlpha = 0.85; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(390, CHIP_Y - 41); ctx.lineTo(400, CHIP_Y - 29); ctx.lineTo(413, CHIP_Y - 39); ctx.stroke(); ctx.restore(); }
      const actG = winAct(t, [[X.fwd1[0] - 0.1, X.check], [X.loopBack[1], X.ans2]]);
      const actC = winAct(t, [[X.check, X.errBack[0]], [X.ans2, X.pan[1] + 1]]);
      const actA = winAct(t, [[X.errBack[0], X.loopBack[1]]]);
      [actG, actC, actA].forEach((ac, i) => chip(ctx, CHIPS[i], ac, chipA(i)));
      ctx.restore();
    }

    // ------------------------------------------------ beat 4: accuracy climbs (pans in from the right), then 5: pull back + takeaway
    if (t >= X.pan[0]) {
      const pull = eio(X.pull[0], X.pull[1], t);
      ctx.save(); sway(1 + 0.02 * eo(11, 13, t) - 0.02 * pull);
      ctx.translate(1350 * (1 - panE), 0);
      // pull-back: shrink the chart card to the top
      const cs = lerp(1, 0.62, pull), ccx = 640, ccy = lerp(380, 244, pull);
      ctx.save(); ctx.translate(ccx, ccy); ctx.scale(cs, cs); ctx.translate(-640, -380); ctx.globalAlpha = 1 - 0.06 * pull;
      const up = (a, b) => lerp(a, b, pull); // counter-scale type as the card shrinks so it stays legible on screen
      const hitB = bump(t, X.hit, 3.2);
      card(ctx, 110, 140, 1060, 480, { r: 26, flash: 0.9 * hitB, flashCol: C.cyan });
      eyebrow(ctx, 'ACCURACY', 160, up(214, 222), { size: up(28, 45) });
      const f = E.out(seg(X.acc[0], X.acc[1], t)), val = Math.round(accAt(f));
      // big number
      ctx.save(); ctx.translate(156, 345); const sc = 1 + 0.1 * hitB; ctx.scale(sc, sc);
      if (hitB > 0.02) { ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, 120, -40, C.cyan, 260, 0.35 * hitB); ctx.globalCompositeOperation = 'source-over'; }
      gtext(ctx, val + '%', 0, 0, 132, { cols: hitB > 0.05 ? ['#ffffff', '#c4f8ff', '#a8ffe4'] : GRAD_NUM });
      ctx.restore();
      if (t > X.hit) for (let i = 0; i < 2; i++) { const q = 1 - bump(t, X.hit + i * 0.12, 2.5); ring(ctx, 300, 300, 80 + q * 260, i ? C.violet : C.cyan, 0.7 * (1 - q), 3); }
      // round counter pill + loop tile
      const rounds = Math.round(Math.pow(f, 1.4) * 10000);
      const gx = up(0, -24); // the round-counter group slides left a touch to make room for the larger type
      tile(ctx, 190 + gx, 440, 70, 'loop', { col: [C.cyan, C.violet], glow: 1.2 + 0.4 * Math.sin(t * 6) });
      ctx.font = F(600, up(30, 45), UI); ctx.fillStyle = rgb(H.mix('#c2c9f5', '#e3e7ff', pull), 1); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('training round', 244 + gx, up(430, 422));
      gtext(ctx, rounds.toLocaleString('en-US'), 244 + gx, up(476, 494), up(42, 64), { cols: GRAD_NUM });
      ctx.font = F(400, up(24, 32), UI); ctx.fillStyle = rgb(H.mix('#8890c4', '#b9c0ec', pull), 1); ctx.fillText('guess → check → adjust', 160, up(566, 606));
      // chart (slides right a touch during the pull-back so the larger counter-scaled labels clear the tick column)
      const CHp = { x: CH.x + 48 * pull, y: CH.y, w: CH.w - 48 * pull, h: CH.h };
      ctx.save();
      ctx.strokeStyle = 'rgba(150,170,255,0.12)'; ctx.lineWidth = 1; ctx.font = F(500, up(22, 28), UI); ctx.fillStyle = rgb(H.mix('#7c84b8', '#a7aedd', pull), 1); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let v = 50; v <= 100; v += 10) { const y = CHp.y + CHp.h - (v - 50) / 50 * CHp.h; ctx.beginPath(); ctx.moveTo(CHp.x, y); ctx.lineTo(CHp.x + CHp.w, y); ctx.stroke(); ctx.fillText(v + '%', CHp.x - up(12, 8), y); }
      ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.font = F(600, up(28, 44), UI); ctx.fillStyle = rgb(H.mix('#9aa3d8', '#c7cdf2', pull), 1); ctx.fillText('training rounds →', CHp.x + CHp.w, CHp.y + CHp.h + up(40, 50));
      const N = 60, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N; const wig = 2.2 * Math.sin(u * 37) * (1 - u) * (u > 0 ? 1 : 0); pts.push({ x: CHp.x + u * CHp.w, y: CHp.y + CHp.h - (accAt(u) + wig - 50) / 50 * CHp.h }); }
      const nShow = f * N;
      if (nShow > 0) {
        const last = Math.floor(nShow), fr = nShow - last, end = last < N ? { x: lerp(pts[last].x, pts[last + 1].x, fr), y: lerp(pts[last].y, pts[last + 1].y, fr) } : pts[N];
        // area
        const ag = ctx.createLinearGradient(0, CHp.y, 0, CHp.y + CHp.h); ag.addColorStop(0, rgb(C.cyan, 0.28)); ag.addColorStop(1, rgb(C.violet, 0));
        ctx.beginPath(); ctx.moveTo(pts[0].x, CHp.y + CHp.h); for (let i = 0; i <= last; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.lineTo(end.x, end.y); ctx.lineTo(end.x, CHp.y + CHp.h); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
        const lg = ctx.createLinearGradient(CHp.x, 0, CHp.x + CHp.w, 0); lg.addColorStop(0, C.violet); lg.addColorStop(0.5, C.blue); lg.addColorStop(1, C.cyan);
        ctx.beginPath(); for (let i = 0; i <= last; i++) i ? ctx.lineTo(pts[i].x, pts[i].y) : ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, end.x, end.y, C.cyan, 26 + 40 * hitB, 1);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(end.x, end.y, 5, 0, 6.283); ctx.fill();
        // start marker label
        ctx.font = F(600, up(28, 44), UI); ctx.fillStyle = rgb(H.mix('#c2c9f5', '#e3e7ff', pull), 1); ctx.textAlign = 'left'; ctx.fillText('61%', pts[0].x + 16, pts[0].y + up(42, 52));
      }
      ctx.restore();
      ctx.restore();

      // takeaway
      if (t > X.pull[0]) {
        ctx.font = F(700, 64, HEAD);
        const sL = 'More examples', sA = ' → ', sR = 'better guesses';
        const wL = ctx.measureText(sL).width, wA = ctx.measureText(sA).width, wR = ctx.measureText(sR).width;
        const x0 = 640 - (wL + wA + wR) / 2, ty = 646;
        const lx = x0 + wL / 2, rx = x0 + wL + wA + wR / 2;
        const p1 = ebk(X.tkTiles[0], X.tkTiles[0] + 0.45, t), p2 = ebk(X.tkTiles[1], X.tkTiles[1] + 0.45, t);
        const TP = seg2(lx + 72, 494, rx - 72, 494);
        connector(ctx, TP, { draw: eio(X.tkTiles[0] + 0.2, X.tkTiles[1] + 0.35, t), col: [C.cyan, C.green], lw: 2.4,
          pulses: t > 13.75 ? [0, 1].map((k) => fract((t - 13.75) * 0.8 + k * 0.5)) : [], pc: '#b8fff0' });
        tile(ctx, lx, 494, 130, 'database', { sc: p1, a: cl(p1 * 2), col: [C.cyan, C.blue], glow: 1.4 + 1.2 * bump(t, X.tkTiles[0] + 0.25, 4) });
        tile(ctx, rx, 494, 130, 'check', { sc: p2, a: cl(p2 * 2), col: [C.cyan, C.green], glow: 1.5 + 1.6 * bump(t, 13.9, 3) + 0.3 * Math.sin(t * 3) });
        const pa = seg(X.tkText[0], X.tkText[1], t);
        const wp = (k) => E.out(cl(pa * 3 - k));
        ctx.save(); ctx.font = F(700, 64, HEAD); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        const g = ctx.createLinearGradient(x0, ty - 64, x0 + wL + wA + wR, ty); g.addColorStop(0, '#ffffff'); g.addColorStop(0.2, '#e4f8ff'); g.addColorStop(0.55, '#9fe6ff'); g.addColorStop(1, '#8ff5d0');
        ctx.fillStyle = g;
        [[sL, x0, 0], [sA, x0 + wL, 1], [sR, x0 + wL + wA, 2]].forEach(([s, x, k]) => { const p = wp(k); if (p > 0) { ctx.globalAlpha = p; ctx.fillText(s, x, ty + (1 - p) * 26); } });
        ctx.restore();
        // underline sweep
        const ul = eio(X.underline[0], X.underline[1], t);
        if (ul > 0) {
          ctx.save(); const ug = ctx.createLinearGradient(x0, 0, x0 + wL + wA + wR, 0); ug.addColorStop(0, rgb(C.cyan, 0)); ug.addColorStop(0.3, C.cyan); ug.addColorStop(0.7, C.violet); ug.addColorStop(1, rgb(C.violet, 0));
          ctx.strokeStyle = ug; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); const cx = 640, hw = (wL + wA + wR) / 2 * ul; ctx.moveTo(cx - hw, ty + 22); ctx.lineTo(cx + hw, ty + 22); ctx.stroke();
          ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, cx + hw, ty + 22, C.cyan, 20, 1 - ul * 0.6); glowDot(ctx, cx - hw, ty + 22, C.violet, 20, 1 - ul * 0.6);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // ------------------------------------------------ title -> header (always on top, outside the camera)
    {
      const words = 'How does AI learn?';
      ctx.font = F(700, 80, HEAD); const w = ctx.measureText(words).width;
      const sx0 = 640 - w / 2, sy0 = 470;
      const k = lerp(1, 0.45, shr), x = lerp(sx0, 56, shr), y = lerp(sy0, 70, shr);
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      revealLine(ctx, words, 0, 0, 80, seg(0.4, 1.25, t));
      ctx.restore();
      if (shr > 0.5) {
        ctx.save(); ctx.globalAlpha = eo(X.shrink[1] - 0.2, X.shrink[1] + 0.2, t);
        const hg = ctx.createLinearGradient(56, 0, 56 + w * 0.45, 0); hg.addColorStop(0, C.cyan); hg.addColorStop(1, rgb(C.violet, 0));
        ctx.fillStyle = hg; ctx.fillRect(56, 86, w * 0.45 * eo(X.shrink[1] - 0.1, X.shrink[1] + 0.4, t), 2);
        ctx.restore();
      }
    }
    bloom(ctx, 1);
    H.vignette(ctx, W, Hh, 0.45, '2,3,16');
  }


  // =====================================================================================================
  // SOUND: clean motion-graphics design. Timings come straight from X (the explainer's own constants).
  // =====================================================================================================
  function explainerSound(k) {
    const D = X.D;
    // soft clean whoosh (filtered pink noise, low top so it stays gentle)
    const whoosh = (t, dur, g = 1, top = 1500, o = {}) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 260], [dur * 0.55, top], [dur, 420]], q: 0.8, gain: 0.16 * g, a: dur * 0.5, verb: 0.2, pan: o.pan || 0, minor: o.minor });
    // glassy low blip for an icon landing: sine + soft octave + a short triangle body, all under 2 kHz
    const glass = (t, f, g = 1, o = {}) => {
      k.tone(t, { f, dur: 0.5, gain: 0.13 * g, a: 0.003, verb: 0.35, pan: o.pan || 0, minor: o.minor });
      k.tone(t, { f: f * 2, dur: 0.18, gain: 0.035 * g, a: 0.002, verb: 0.3, pan: o.pan || 0, minor: o.minor });
      k.tone(t, { f: f / 2, type: 'triangle', dur: 0.12, gain: 0.08 * g, a: 0.002, pan: o.pan || 0, minor: o.minor });
    };
    // gentle digital tick for counters
    const tick = (t, g = 1, f = 1700) => {
      k.noise(t, { dur: 0.016, filter: 'bandpass', f, q: 3, gain: 0.36 * g, a: 0.001, pan: 0.15, minor: true });
      k.tone(t, { f: f * 0.55, dur: 0.035, gain: 0.065 * g, a: 0.001, pan: 0.15, minor: true });
    };
    // a signal travelling through the network: a soft sine glide
    const glide = (t, dur, f0, f1, g = 1, type = 'sine') => k.tone(t, { f: [[0, f0], [dur, f1]], type, dur: dur + 0.08, gain: 0.05 * g, a: dur * 0.4, hold: dur * 0.3, filter: 'lowpass', f2: 1400, verb: 0.25, minor: true });
    // throttled ticks on every value change of val(t), never closer than gap
    const counter = (val, a, b, gap, g, f) => { let last = -1, prev = val(a); for (let t = a; t <= b; t += 0.002) { const v = val(t); if (v !== prev && t - last >= gap) { tick(t, g, f); last = t; } prev = v; } };

    // ---- quiet ambient synth pad bed (minor-key loop, resolves to A major under the takeaway)
    k.music('pad', 0, 13.6, { bpm: 64, gain: 0.5, chords: [['A2', 'E3', 'B3', 'C4'], ['F2', 'C3', 'E3', 'A3'], ['D3', 'A3', 'C4', 'E4'], ['E2', 'B2', 'E3', 'G#3']] });
    k.music('pad', 13.6, D, { bpm: 64, gain: 0.5, chords: [['A2', 'E3', 'A3', 'C#4']] });

    // ---- beat 1: brain tile pops (back-ease 0.15-0.7), title rises word by word (0.4-1.25)
    whoosh(0.08, 0.4, 0.6);
    glass(0.36, 'A4', 1.1);
    whoosh(0.42, 0.75, 0.8, 1300);
    // title shrinks to the corner while the brain flies to the model spot
    k.noise(X.shrink[0], { dur: 0.7, color: 'pink', filter: 'lowpass', f: [[0, 300], [0.4, 900], [0.7, 300]], gain: 0.16, a: 0.3 });

    // ---- beat 2: data source + lanes + counter
    glass(X.dbIn + 0.2, 'E4', 1, { pan: -0.6 });
    whoosh(X.lanes[0], 0.6, 0.5, 1100, { minor: true });
    glass(2.92, 'C5', 0.6, { pan: 0.5, minor: true });                                   // "Model" pill
    counter((t) => Math.round(1e6 * Math.pow(seg(X.countA, X.countB, t), 2.2) / 2500), X.countA + 0.05, X.countB - 0.02, 0.09, 0.8, 1700);
    glass(X.countB, 'E5', 1.0); tick(X.countB, 1.2, 1500);                            // locks on 1,000,000
    // examples sliding into the model (only those absorbed before the push-in)
    EXAMPLES.forEach((ex, i) => { const ta = ex.s + X.travel * 0.95; if (ta < X.zoom[0]) k.tone(ta, { f: i % 2 ? 'A3' : 'E3', dur: 0.22, gain: 0.07, a: 0.004, verb: 0.3, pan: 0.6, minor: true }); });

    // ---- push through the brain (5.9-6.55): long whoosh, soft low thump at the flash
    whoosh(X.zoom[0] - 0.05, 0.75, 1.3, 1700);
    k.play('thud', 6.36, { f: 85, gain: 0.45 });

    // ---- beat 3: network assembles, input slides in
    k.withMinor(() => { [0, 1, 2, 3].forEach((i) => glass(X.netIn[0] + 0.3 + i * 0.08, ['E4', 'A4', 'B4', 'E5'][i], 0.35, { pan: -0.3 + i * 0.1 })); });
    whoosh(X.inputIn[0], 0.35, 0.6, 1200, { pan: -0.6, minor: true });
    glide(X.fwd1[0], X.fwd1[1] - X.fwd1[0], 260, 620);                                  // forward pass
    glass(X.ans1 + 0.06, 'C5', 0.9, { pan: 0.5 });                                       // "dog?"
    // wrong: a soft low two-note drop + body thud
    k.tone(X.check, { f: 'G4', type: 'triangle', dur: 0.2, gain: 0.12, a: 0.003, hold: 0.06, filter: 'lowpass', f2: 1200, pan: 0.5, verb: 0.2 });
    k.tone(X.check + 0.13, { f: 'D#4', type: 'triangle', dur: 0.36, gain: 0.12, a: 0.003, hold: 0.1, filter: 'lowpass', f2: 1000, pan: 0.5, verb: 0.25 });
    k.play('thud', X.check, { f: 110, gain: 0.5, pan: 0.4 });
    glass(X.truth + 0.12, 'A4', 0.5, { pan: 0.5, minor: true });                         // "Answer: cat" lands
    // error signal runs back: falling filtered saw
    k.tone(X.errBack[0], { f: [[0, 640], [X.backWave[1] - X.errBack[0], 180]], type: 'sawtooth', dur: X.backWave[1] - X.errBack[0], gain: 0.034, a: 0.05, hold: 0.4, filter: 'lowpass', f2: 900, verb: 0.2 });
    // weights re-dial: a little run of ticks while the edges morph
    for (let i = 0; i < 7; i++) tick(X.morph[0] + i * 0.085, 1.0, 1100 + i * 60);
    glass(X.updated + 0.15, 'B4', 0.5, { pan: -0.2, minor: true });                       // "weights adjusted"
    whoosh(X.loopBack[0], 0.3, 0.4, 1000, { minor: true });                              // pulse runs the loop arc
    glide(X.fwd2[0], X.fwd2[1] - X.fwd2[0], 300, 720);                                   // second forward pass
    // correct: rising glass pair
    glass(X.ans2 + 0.04, 'C5', 1.0, { pan: 0.5 }); glass(X.ans2 + 0.12, 'G5', 0.9, { pan: 0.5 }); glass(X.ans2 + 0.2, 'C6', 0.5, { pan: 0.5 });

    // ---- beat 4: pan to the chart, accuracy counts up (E.out, so the ticks slow as it settles)
    whoosh(X.pan[0], 0.6, 1.1, 1500);
    counter((t) => Math.round(accAt(E.out(seg(X.acc[0], X.acc[1], t)))), X.acc[0] + 0.02, X.acc[1], 0.085, 0.8, 1600);
    // soft low riser into the key moment
    k.noise(X.hit - 0.85, { dur: 0.85, color: 'pink', filter: 'bandpass', f: [[0, 180], [0.85, 1300]], q: 1, gain: 0.2, a: 0.8, verb: 0.2 });
    k.tone(X.hit - 0.85, { f: [[0, 110], [0.85, 220]], type: 'triangle', dur: 0.85, gain: 0.05, a: 0.8, filter: 'lowpass', f2: 900 });
    // 97%: deep sub hit + shimmer
    k.tone(X.hit, { f: [[0, 72], [0.6, 38]], dur: 1.3, gain: 0.7, a: 0.004 });
    k.play('thud', X.hit, { f: 105, gain: 0.8 });
    k.noise(X.hit, { dur: 0.5, color: 'brown', filter: 'lowpass', f: 320, gain: 0.3 });
    ['E5', 'B5', 'E6', 'G#6'].forEach((n, i) => k.tone(X.hit + 0.03 + i * 0.045, { f: n, dur: 1.6, gain: 0.032, a: 0.02, verb: 0.55, pan: (i - 1.5) * 0.35 }));
    k.noise(X.hit + 0.02, { dur: 1.1, color: 'pink', filter: 'highpass', f: [[0, 3000], [1.1, 6000]], gain: 0.035, a: 0.06, verb: 0.4 });

    // ---- beat 5: pull back, tiles land, takeaway resolves
    whoosh(X.pull[0], 0.5, 0.8, 1200);
    glass(X.tkTiles[0] + 0.2, 'E4', 0.8, { pan: -0.4 });
    glass(X.tkTiles[1] + 0.2, 'A4', 0.8, { pan: 0.4 });
    whoosh(X.tkText[0], 0.45, 0.6, 1300, { minor: true });
    ['A3', 'E4', 'A4', 'C#5'].forEach((n, i) => k.tone(X.tkText[0] + 0.32 + i * 0.03, { f: n, type: i ? 'sine' : 'triangle', dur: 1.7, gain: 0.085, a: 0.015, verb: 0.45, pan: (i - 1.5) * 0.25 }));
    k.noise(X.underline[0], { dur: 0.45, filter: 'bandpass', f: [[0, 900], [0.45, 1800]], q: 1.2, gain: 0.05, a: 0.2, minor: true });
  }

  registerStyle({
    id: 'tech-glow',
    name: 'Tech Glow Explainer',
    category: 'Popular Explainer Looks',
    description: 'The polished AI / tech YouTube motion-graphics look: deep navy-to-indigo space with drifting electric glows and a perspective grid, gradient-stroked icon tiles wired into node diagrams with light pulses racing along the connectors, dark cards with thin neon borders, gradient headline type and bloom on everything bright.',
    motion: 'Smooth eased build: glows bloom up, icon tiles pop in with an overshoot and their line icons draw on, connectors trace out and start carrying light pulses, the headline rises word by word and the stat counts up, all under a slow camera push and drifting particles.',
    duration: 5,
    frameT: 4.6,
    fonts: ['700 80px "Space Grotesk"', '500 18px "Space Grotesk"', '600 26px "Inter"', '500 18px "Inter"', '400 22px "Inter"'],
    readsPixels: false,
    draw: drawStill,
    explainerDuration: X.D,
    explainerNote: 'One continuous camera: the title shrinks to a header while the brain tile flies into place, labelled examples ride glowing lanes into the model, the camera pushes through the brain into its network (light-speed streaks), Guess/Check/Adjust chips light up as light pulses run forward and a red error pulse runs back, then the camera pans to a glowing accuracy chart and pulls back for the takeaway; numbers count up in gradient Space Grotesk with bloom.',
    explainer,
    explainerSound,
  });
}
```
