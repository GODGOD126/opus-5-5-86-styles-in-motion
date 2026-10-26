I want an animated explainer made in the "Neon Sign at Night" visual style (Light & Imaging). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Gloria Hallelujah, Poiret One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&family=Poiret+One&display=block">
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
Name: Neon Sign at Night
Family: Light & Imaging
Look: Hand-bent glass neon on an old brick wall after rain: white-hot tube cores, saturated colour halos, painted-out blockout tube, clips and electrodes, light spilling across the brickwork and smearing in the wet pavement.
Motion: Tubes buzz on letter by letter with a stutter, one failing letter keeps flickering, and the puddle reflection shivers as drops land.
How it explains: One long brick wall the camera whip-pans along: every beat is a new neon sign that buzzes on tube by tube, arrows are segmented chase-light tubes that ignite toward their target, numbers are neon digits re-lit as they change, and the emphasis is a blinking red tube with a ring.

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

REFERENCE STYLE SOURCE (styles/neon-sign.js; W/H_ are always 1280x720)
```js
{
  // ---------- neon sign on a night brick wall ----------
  const COL = {
    pink: { core: [255, 236, 246], tube: [255, 70, 165], glow: [255, 25, 125], dark: [52, 26, 40] },
    cyan: { core: [228, 255, 255], tube: [70, 228, 255], glow: [0, 150, 255], dark: [22, 38, 48] },
    warm: { core: [255, 250, 228], tube: [255, 196, 80], glow: [255, 120, 15], dark: [48, 38, 26] },
  };
  const WALL_BASE = 596;

  function mask(W, Hh, fn) {
    const c = H.layer(W, Hh), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round';
    fn(x); return c;
  }
  function colorize(m, rgb, a = 1) {
    const c = H.layer(m.width, m.height), x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-in';
    x.fillStyle = H.rgba(rgb, a); x.fillRect(0, 0, c.width, c.height); return c;
  }
  function erode(m, r) {
    const c = H.layer(m.width, m.height), x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'destination-in';
    for (let a = 0; a < 8; a++) x.drawImage(m, Math.round(Math.cos(a * Math.PI / 4) * r), Math.round(Math.sin(a * Math.PI / 4) * r));
    return c;
  }
  // cheap big blur: downsample, blur, return small canvas (caller scales it back up)
  function blurSmall(src, px, s = 0.25) {
    const w = Math.ceil(src.width * s), h = Math.ceil(src.height * s), c = H.layer(w, h), x = c.getContext('2d');
    x.filter = `blur(${Math.max(0.5, px * s)}px)`; x.drawImage(src, 0, 0, w, h); return c;
  }
  function addBlur(g, src, px, a, W, Hh) {
    const s = px > 24 ? 0.125 : px > 8 ? 0.25 : 0.5;
    g.globalAlpha = a; g.drawImage(blurSmall(src, px, s), 0, 0, W, Hh);
  }

  // ================= EXPLAINER: camera pans along one long wall of neon signs =================
  const NX = { pink: [255, 70, 165], cyan: [70, 228, 255], warm: [255, 190, 70], red: [255, 48, 36], green: [90, 255, 120], violet: [175, 110, 255] };
  let brickTile = null;
  function getBrickTile() {
    if (brickTile) return brickTile;
    const TW = 92 * 14, TH = 600, rowH = 30, brW = 92, mort = 5;
    const c = H.layer(TW, TH), x = c.getContext('2d'), img = x.createImageData(TW, TH), d = img.data;
    const R = H.rng(4401), nz = H.makeNoise(4402);
    const cols = [[230, 106, 76], [200, 90, 66], [245, 130, 92], [180, 96, 78], [220, 120, 90], [140, 76, 62]];
    const bh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    for (let y = 0; y < TH; y++) {
      const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2);
      for (let xx = 0; xx < TW; xx++) {
        const col = Math.floor((xx + off) / brW) % 14, lxp = (xx + off) % brW;
        const h1 = bh(row, col), h2 = bh(col + 9, row + 3), g = R() - 0.5;
        const ang = xx / TW * Math.PI * 2, st = nz.n3(Math.cos(ang) * 3, Math.sin(ang) * 3, y * 0.012) * 0.3;
        const ej = (bh(xx >> 2, row) - 0.5) * 2.2;
        let r, gg, b;
        if (ly < mort + ej * 0.5 || lxp < mort + ej * 0.6) { const m = 0.5 + g * 0.3; r = 190 * m; gg = 182 * m; b = 172 * m; }
        else {
          const c0 = cols[Math.floor(h1 * cols.length)];
          const k = (0.85 + h2 * 0.3 + st) * (1 + g * 0.3) * (bh(xx * 0.37 | 0, y * 0.41 | 0) > 0.985 ? 0.55 : 1) * (ly - mort < 3 ? 1.15 : rowH - ly < 3 ? 0.75 : 1);
          r = c0[0] * k; gg = c0[1] * k; b = c0[2] * k;
        }
        const i = (y * TW + xx) * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return (brickTile = c);
  }
  // brick-edge masks matching getBrickTile(): top-edge and bottom-edge alpha, so the sign light can catch brick arrises
  let edgeTiles = null;
  function getEdgeTiles() {
    if (edgeTiles) return edgeTiles;
    const TW = 92 * 14, TH = 600, rowH = 30, brW = 92, mort = 5;
    const bh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    const mk = () => { const c = H.layer(TW, TH), x = c.getContext('2d'); return [c, x, x.createImageData(TW, TH)]; };
    const [tc, tcx, ti] = mk(), [bc, bcx, bi] = mk(), td = ti.data, bd = bi.data;
    for (let y = 0; y < TH; y++) {
      const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2);
      for (let xx = 0; xx < TW; xx++) {
        const lxp = (xx + off) % brW, ej = (bh(xx >> 2, row) - 0.5) * 2.2;
        if (ly < mort + ej * 0.5 || lxp < mort + ej * 0.6) continue;
        const top = ly - (mort + ej * 0.5), bot = rowH - ly, i = (y * TW + xx) * 4;
        if (top < 3.5) { td[i] = td[i + 1] = td[i + 2] = 255; td[i + 3] = 255 * (1 - top / 3.5) * (lxp - mort < 2 ? 0.5 : 1); }
        if (bot < 3) { bd[i] = bd[i + 1] = bd[i + 2] = 255; bd[i + 3] = 255 * (1 - bot / 3); }
      }
    }
    tcx.putImageData(ti, 0, 0); bcx.putImageData(bi, 0, 0);
    tcx.globalAlpha = 0.55; tcx.drawImage(bc, 0, 0);
    return (edgeTiles = { both: tc });
  }
  // wet sidewalk tile (concrete, aggregate speckle) + puddle alpha, periodic in x so it pans with the wall
  let paveTile = null;
  function getPaveTile(W) {
    if (paveTile && paveTile.w === W) return paveTile;
    const PW = W * 2, PH = 120, nz = H.makeNoise(4410), R = H.rng(4411);
    const c = H.layer(PW, PH), x = c.getContext('2d'), img = x.createImageData(PW, PH), d = img.data;
    const p = H.layer(PW, PH), px = p.getContext('2d'), pimg = px.createImageData(PW, PH), pd = pimg.data;
    for (let y = 0; y < PH; y++) for (let xx = 0; xx < PW; xx++) {
      const a = xx / PW * Math.PI * 2, cx0 = Math.cos(a), sx0 = Math.sin(a);
      const g = R() - 0.5, st = nz.n3(cx0 * 9, sx0 * 9, y * 0.06) * 0.5 + nz.n3(cx0 * 40, sx0 * 40, y * 0.25) * 0.3;
      let base = 22 + g * 12 + st * 9;
      if (y < 4) base = 54 + g * 14 - y * 3; else if (y < 12) base = 40 + g * 14 - (y - 4) * 1.6; // curb lip
      base *= 1 - y / PH * 0.35;
      const i = (y * PW + xx) * 4; d[i] = base * 0.92; d[i + 1] = base * 0.95; d[i + 2] = base * 1.1; d[i + 3] = 255;
      const v = nz.n3(cx0 * 4.5, sx0 * 4.5, y * 0.03 + 20) + 0.4 * nz.n3(cx0 * 12, sx0 * 12, y * 0.08);
      pd[i] = pd[i + 1] = pd[i + 2] = 255; pd[i + 3] = 255 * H.smooth(-0.12, 0.08, v) * H.smooth(6, 16, y);
    }
    x.putImageData(img, 0, 0); px.putImageData(pimg, 0, 0);
    // aggregate speckle catching light
    for (let k = 0; k < 1400; k++) { x.fillStyle = `rgba(200,200,220,${R() * 0.16})`; x.fillRect(R() * PW, 12 + Math.pow(R(), 0.8) * (PH - 12), 1 + R(), 1); }
    return (paveTile = { w: W, c, p, PW });
  }
  function catPath(x, cx, cy, s) {
    x.beginPath();
    x.moveTo(cx - s * 0.95, cy - s * 0.1);
    x.lineTo(cx - s * 0.8, cy - s * 1.05); x.lineTo(cx - s * 0.35, cy - s * 0.72);
    x.quadraticCurveTo(cx, cy - s * 0.82, cx + s * 0.35, cy - s * 0.72);
    x.lineTo(cx + s * 0.8, cy - s * 1.05); x.lineTo(cx + s * 0.95, cy - s * 0.1);
    x.bezierCurveTo(cx + s * 1.0, cy + s * 0.75, cx - s * 1.0, cy + s * 0.75, cx - s * 0.95, cy - s * 0.1);
    x.moveTo(cx - s * 0.45, cy - s * 0.14); x.lineTo(cx - s * 0.2, cy - s * 0.1);
    x.moveTo(cx + s * 0.45, cy - s * 0.14); x.lineTo(cx + s * 0.2, cy - s * 0.1);
    x.moveTo(cx - s * 0.09, cy + s * 0.1); x.lineTo(cx + s * 0.09, cy + s * 0.1); x.lineTo(cx, cy + s * 0.2);
    x.quadraticCurveTo(cx - s * 0.1, cy + s * 0.34, cx - s * 0.24, cy + s * 0.28);
    x.moveTo(cx, cy + s * 0.2); x.quadraticCurveTo(cx + s * 0.1, cy + s * 0.34, cx + s * 0.24, cy + s * 0.28);
    x.moveTo(cx - s * 0.38, cy + s * 0.18); x.lineTo(cx - s * 1.05, cy + s * 0.06);
    x.moveTo(cx + s * 0.38, cy + s * 0.18); x.lineTo(cx + s * 1.05, cy + s * 0.06);
  }
  function dogPath(x, cx, cy, s) {
    x.beginPath();
    x.moveTo(cx - s * 0.55, cy - s * 0.7);
    x.quadraticCurveTo(cx, cy - s * 0.95, cx + s * 0.55, cy - s * 0.7);
    x.bezierCurveTo(cx + s * 0.78, cy - s * 0.1, cx + s * 0.55, cy + s * 0.78, cx, cy + s * 0.8);
    x.bezierCurveTo(cx - s * 0.55, cy + s * 0.78, cx - s * 0.78, cy - s * 0.1, cx - s * 0.55, cy - s * 0.7);
    x.moveTo(cx - s * 0.55, cy - s * 0.7); x.bezierCurveTo(cx - s * 1.2, cy - s * 0.6, cx - s * 1.15, cy + s * 0.3, cx - s * 0.8, cy + s * 0.25);
    x.moveTo(cx + s * 0.55, cy - s * 0.7); x.bezierCurveTo(cx + s * 1.2, cy - s * 0.6, cx + s * 1.15, cy + s * 0.3, cx + s * 0.8, cy + s * 0.25);
    x.moveTo(cx - s * 0.2, cy - s * 0.2); x.arc(cx - s * 0.26, cy - s * 0.2, s * 0.06, 0, 7);
    x.moveTo(cx + s * 0.32, cy - s * 0.2); x.arc(cx + s * 0.26, cy - s * 0.2, s * 0.06, 0, 7);
    x.moveTo(cx - s * 0.16, cy + s * 0.18); x.quadraticCurveTo(cx, cy + s * 0.06, cx + s * 0.16, cy + s * 0.18); x.quadraticCurveTo(cx, cy + s * 0.32, cx - s * 0.16, cy + s * 0.18);
    x.moveTo(cx, cy + s * 0.3); x.lineTo(cx, cy + s * 0.44);
    x.moveTo(cx - s * 0.22, cy + s * 0.48); x.quadraticCurveTo(cx, cy + s * 0.6, cx + s * 0.22, cy + s * 0.48);
  }
  function brainPath(x, cx, cy, s) {
    x.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * Math.PI * 2, r = 1 + 0.07 * Math.max(0, Math.cos(a * 9));
      const px = cx + Math.cos(a) * s * 1.15 * r, py = cy + Math.sin(a) * s * 0.85 * r;
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.moveTo(cx, cy - s * 0.8);
    for (let i = 1; i <= 20; i++) x.lineTo(cx + Math.sin(i * 1.3) * s * 0.06, cy - s * 0.8 + i / 20 * s * 1.55);
    [[-1, -0.35], [-1, 0.2], [1, -0.3], [1, 0.25]].forEach(([sd, oy]) => {
      x.moveTo(cx + sd * s * 0.2, cy + oy * s);
      for (let i = 1; i <= 16; i++) { const u = i / 16; x.lineTo(cx + sd * s * (0.2 + u * 0.7), cy + oy * s + Math.sin(u * Math.PI * 3) * s * 0.1); }
    });
  }

  function neonExplainer(ctx, W, Hh, t) {
    const hs = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); };
    const ign = (t0, len = 0.3) => t < t0 ? 0 : t - t0 > len ? 1 : (hs(Math.floor(t * 40) + t0 * 977) > 0.42 ? 1 : 0);
    const sm = H.smooth, E = H.ease;
    // ---- camera: whip-pans along the wall between beats ----
    const pans = [[2.0, 2.8], [5.8, 6.5], [10.4, 11.1], [12.9, 13.5]];
    let cam = 0; pans.forEach(([a, b]) => { cam += 1280 * E.inOut(sm(a, b, t)); });
    const col = H.layer(W, Hh), cx = col.getContext('2d');
    const txt = H.layer(W, Hh), tx = txt.getContext('2d');
    const txtB = H.layer(W, Hh), tbx = txtB.getContext('2d'); // fat script glyphs: eroded harder so the hot core stays thin
    const core = H.layer(W, Hh), kx = core.getContext('2d');
    const off = H.layer(W, Hh), ox = off.getContext('2d');
    [cx, tx, tbx, kx, ox].forEach((c) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.translate(-cam, 0); });
    // physical hardware (world coords): glass-tube clips, electrode housings, painted-out blockout runs
    const HW = { clips: [], elec: [] }, USED = { thin: null, fat: null };
    const clip = (x, y, a = 0) => HW.clips.push([x, y, a]);
    const elec = (x, y, a) => HW.elec.push([x, y, a]);
    const blockout = (pathFn, w = 7) => {
      ox.save(); ox.strokeStyle = 'rgb(13,11,14)'; ox.lineWidth = w; pathFn(ox); ox.stroke();
      ox.strokeStyle = 'rgba(150,110,130,0.28)'; ox.lineWidth = w * 0.28; ox.translate(-1, -1.5); pathFn(ox); ox.stroke(); ox.restore();
    };
    const quadPt = (x0, y0, qx, qy, x1, y1, u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1];
    const ellClip = (ex, ey, rx, ry, a) => clip(ex + Math.cos(a) * rx, ey + Math.sin(a) * ry, Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx));
    // blockout run between two words of a lettered line: dips under the baseline, electrodes where it enters the glass
    const wordGap = (s, cxw, y, font, splitAt, dip = 30) => {
      tx.font = font; const wd = tx.measureText(s).width, x0 = cxw - wd / 2;
      const xa = x0 + tx.measureText(s.slice(0, splitAt)).width - 10, xb = x0 + tx.measureText(s.slice(0, splitAt + 1)).width + 10;
      blockout((g) => { g.beginPath(); g.moveTo(xa, y - 4); g.bezierCurveTo(xa + 6, y + dip, xb - 6, y + dip, xb, y - 4); });
      elec(xa, y - 4, -1.9); elec(xb, y - 4, -1.25);
      return [x0, x0 + wd];
    };
    cx.globalCompositeOperation = 'lighter'; kx.globalCompositeOperation = 'lighter';
    const tube = (pathFn, c, k, w = 7) => {
      ox.strokeStyle = 'rgb(44,36,48)'; ox.lineWidth = w; pathFn(ox); ox.stroke();
      ox.strokeStyle = 'rgba(170,160,180,0.2)'; ox.lineWidth = w * 0.3; ox.save(); ox.translate(-1, -1.5); pathFn(ox); ox.stroke(); ox.restore();
      if (k <= 0) return;
      cx.strokeStyle = H.rgba(c, k); cx.lineWidth = w; pathFn(cx); cx.stroke();
      kx.strokeStyle = H.rgba(H.mix(c, [255, 255, 255], 0.82), k); kx.lineWidth = w * 0.36; pathFn(kx); kx.stroke();
    };
    const ntext = (s, x, y, font, c, k, align = 'center', lw = 3, ghost = true) => {
      if (ghost) { ox.font = font; ox.textAlign = align; ox.lineWidth = lw; ox.fillStyle = ox.strokeStyle = 'rgb(44,36,48)'; ox.fillText(s, x, y); ox.strokeText(s, x, y); }
      if (k <= 0) return;
      const fat = font.includes('Gloria');
      { // screen-space bbox of the lit text, so the core erosion only touches that region
        tx.font = font; const fsz = +(font.match(/(\d+)px/) || [0, 60])[1], w = tx.measureText(s).width, pad = lw + 8;
        const x0 = (align === 'center' ? x - w / 2 : x) - cam - pad, b = [x0, y - fsz * 1.15 - pad, x0 + w + 2 * pad, y + fsz * 0.55 + pad];
        const key = fat ? 'fat' : 'thin', o = USED[key];
        USED[key] = o ? [Math.min(o[0], b[0]), Math.min(o[1], b[1]), Math.max(o[2], b[2]), Math.max(o[3], b[3])] : b;
      }
      for (const [g, cc] of [[cx, c], [fat ? tbx : tx, H.mix(c, [255, 255, 255], 0.85)]]) {
        g.font = font; g.textAlign = align; g.lineWidth = fat && g === cx ? lw + 3 : lw; g.fillStyle = g.strokeStyle = H.rgba(cc, k);
        g.fillText(s, x, y); g.strokeText(s, x, y);
      }
    };
    const wordByLetter = (s, x, y, font, c, t0, dt, align = 'center') => {
      tx.font = font; const wd = tx.measureText(s).width; let x0 = align === 'center' ? x - wd / 2 : x;
      for (let i = 0; i < s.length; i++) { if (s[i] !== ' ') ntext(s[i], x0 + tx.measureText(s.slice(0, i)).width, y, font, c, ign(t0 + i * dt), 'left'); }
    };
    // segmented chase arrow along a quadratic; draws on segment by segment
    const arrow = (x0, y0, qx, qy, x1, y1, c, prog, n = 12, w = 6) => {
      const P = (u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1];
      for (let i = 0; i < n; i++) {
        const a = P(i / n + 0.012), b = P((i + 1) / n - 0.012);
        const lit = prog * n > i + 0.5 ? 0.45 + 0.55 * ((((i - t * 14) % 4) + 4) % 4 < 1.4 ? 1 : 0) : 0;
        tube((g) => { g.beginPath(); g.moveTo(...a); g.lineTo(...b); }, c, lit, w);
      }
      const e = P(1), pe = P(0.94), ang = Math.atan2(e[1] - pe[1], e[0] - pe[0]);
      tube((g) => { g.beginPath(); g.moveTo(e[0] + Math.cos(ang + 2.5) * 22, e[1] + Math.sin(ang + 2.5) * 22); g.lineTo(...e); g.lineTo(e[0] + Math.cos(ang - 2.5) * 22, e[1] + Math.sin(ang - 2.5) * 22); }, c, prog >= 1 ? 1 : 0, w);
    };
    const frame = (x, y, w, h, c, k) => tube((g) => { g.beginPath(); g.roundRect(x, y, w, h, 14); }, c, k, 6);
    const icon = (kind, x, y, s, c, k) => tube((g) => (kind === 'cat' ? catPath : dogPath)(g, x, y, s), c, k, 5);
    const seen = (X) => cam > X - 1400 && cam < X + 1400;

    // ---------------- A: HOOK ----------------
    if (seen(0)) {
      ntext('How does', 640, 250, '400 74px "Poiret One"', NX.cyan, ign(0.15, 0.35), 'center', 4.5);
      wordByLetter('AI learn', 600, 430, '400 160px "Gloria Hallelujah"', NX.pink, 0.55, 0.09);
      const q = t > 1.4 ? (t < 2.3 && hs(Math.floor(t * 12)) > 0.6 ? 0.25 : 1) : 0;
      ntext('?', 990, 430, '400 160px "Gloria Hallelujah"', NX.warm, q, 'left');
      tube((g) => { g.beginPath(); g.moveTo(330, 470); g.quadraticCurveTo(640, 500, 960, 466); }, NX.violet, ign(1.25), 6);
      wordGap('How does', 640, 250, '400 74px "Poiret One"', 3, 22);
      wordGap('AI learn', 600, 430, '400 160px "Gloria Hallelujah"', 2, 40);
      elec(330, 470, Math.PI); elec(960, 466, 0);
      for (const u of [0.2, 0.5, 0.8]) { const q = quadPt(330, 470, 640, 500, 960, 466, u); clip(q[0], q[1], 0); }
    }
    // ---------------- B: DATA ----------------
    const XB = 1280;
    if (seen(XB)) {
      for (let k = 0; k < 6; k++) {
        const c0 = k % 2, r0 = Math.floor(k / 2);
        const fx = XB + 110 + c0 * 200, fy = 70 + r0 * 170, t0 = 2.85 + k * 0.17;
        const cyc = Math.max(0, Math.floor((t - 3.6 - k * 0.11) * 2.6));
        const kind = (k + cyc) % 2 ? 'dog' : 'cat';
        const swapOff = t > 3.6 && ((t - 3.6 - k * 0.11) * 2.6) % 1 < 0.12 ? 0 : 1;
        const kk = ign(t0) * swapOff;
        frame(fx, fy, 160, 104, NX.violet, ign(t0));
        icon(kind, fx + 80, fy + 56, 34, NX.warm, kk);
        tube((g) => { g.beginPath(); g.moveTo(fx + 80, fy + 104); g.lineTo(fx + 80, fy + 116); }, NX.cyan, ign(t0 + 0.05), 3);
        tube((g) => { g.beginPath(); g.roundRect(fx + 36, fy + 115, 88, 38, 14); }, NX.cyan, ign(t0 + 0.05), 3.5);
        ntext(kind, fx + 80, fy + 144, '400 31px "Poiret One"', NX.warm, ign(t0 + 0.05) * swapOff, 'center', 2.2);
        clip(fx + 34, fy, 0); clip(fx + 126, fy, 0); clip(fx, fy + 52, Math.PI / 2); clip(fx + 160, fy + 52, Math.PI / 2);
      }
      elec(XB + 540, 320, Math.PI); clip(XB + 650, 309, 0);
      for (const a of [-2.3, -1.0, 0.5, 2.5]) ellClip(XB + 960, 290, 161, 119, a);
      arrow(XB + 540, 320, XB + 640, 300, XB + 760, 312, NX.warm, sm(3.05, 3.45, t), 10);
      const bk = ign(3.3) * (0.85 + 0.15 * Math.sin(t * 9));
      tube((g) => brainPath(g, XB + 960, 290, 140), NX.pink, bk, 7);
      const p = sm(3.4, 5.25, t), val = p >= 1 ? 1000000 : Math.round(Math.pow(10, 6 * p));
      ntext(val.toLocaleString('en-US'), XB + 960, 520, '400 66px "Poiret One"', NX.warm, ign(3.35), 'center', 4, false);
      ntext('examples', XB + 960, 572, '400 34px "Poiret One"', NX.cyan, ign(3.5), 'center', 2.4);
    }
    // ---------------- C: GUESS -> CHECK -> ADJUST loop ----------------
    const XC = 2560;
    if (seen(XC)) {
      frame(XC + 80, 222, 180, 132, NX.violet, ign(6.45));
      icon('cat', XC + 170, 292, 44, NX.warm, ign(6.5));
      arrow(XC + 280, 290, XC + 380, 284, XC + 455, 290, NX.cyan, sm(6.65, 6.95, t), 6);
      ntext('Guess', XC + 368, 246, '400 46px "Poiret One"', NX.warm, ign(6.7), 'center', 3);
      const adj = sm(8.85, 9.45, t);
      const bglow = ign(6.5) * (adj > 0 && adj < 1 ? 0.6 + 0.4 * hs(Math.floor(t * 20)) : 1);
      tube((g) => brainPath(g, XC + 600, 290, 112), adj >= 1 ? NX.pink : H.mix(NX.pink, NX.violet, adj), bglow, 7);
      arrow(XC + 745, 290, XC + 800, 284, XC + 862, 290, NX.cyan, sm(7.0, 7.25, t), 5);
      tube((g) => { g.beginPath(); g.roundRect(XC + 872, 222, 230, 132, 30); g.moveTo(XC + 900, 354); g.lineTo(XC + 884, 384); g.lineTo(XC + 940, 354); }, NX.warm, ign(7.2), 6);
      const wrong = t < 9.55 ? ign(7.4) : 0;
      ntext('dog?', XC + 987, 312, '400 78px "Gloria Hallelujah"', NX.pink, wrong, 'center', 2);
      const xOn = t >= 7.85 && t < 9.55 ? (t < 8.6 ? (Math.floor(t * 7) % 2 ? 1 : 0.15) : 1) : 0;
      tube((g) => { g.beginPath(); g.moveTo(XC + 1152, 252); g.lineTo(XC + 1212, 322); g.moveTo(XC + 1212, 252); g.lineTo(XC + 1152, 322); }, NX.red, xOn, 9);
      tube((g) => { g.beginPath(); g.arc(XC + 1182, 287, 58, 0, Math.PI * 2); }, NX.red, t < 9.55 ? ign(7.95) : 0, 5);
      ntext('Check', XC + 1160, 196, '400 46px "Poiret One"', NX.warm, ign(7.95), 'center', 3);
      // error signal travels back to the model
      arrow(XC + 1150, 360, XC + 980, 600, XC + 715, 470, NX.red, sm(8.2, 8.8, t), 14);
      // knobs (weights) step to new settings
      for (let i = 0; i < 3; i++) {
        const kx0 = XC + 520 + i * 70, ky0 = 482;
        const a0 = [-2.2, -0.6, -1.4][i], a1 = [-0.9, -1.9, -0.3][i];
        const st = Math.floor(adj * 3 + 0.0001) / 3; // stepped: tube banks switch
        const a = H.lerp(a0, a1, st);
        tube((g) => { g.beginPath(); g.arc(kx0, ky0, 22, 0, Math.PI * 2); }, NX.cyan, ign(6.6 + i * 0.05), 4);
        tube((g) => { g.beginPath(); g.moveTo(kx0, ky0); g.lineTo(kx0 + Math.cos(a) * 18, ky0 + Math.sin(a) * 18); }, NX.warm, ign(6.6 + i * 0.05), 4);
      }
      ntext('Adjust', XC + 600, 564, '400 46px "Poiret One"', NX.warm, ign(8.8), 'center', 3);
      clip(XC + 125, 222, 0); clip(XC + 215, 222, 0); clip(XC + 125, 354, 0); clip(XC + 215, 354, 0);
      elec(XC + 280, 290, Math.PI); elec(XC + 745, 290, Math.PI); elec(XC + 1150, 360, -2.2);
      for (const a of [-2.2, -0.8, 0.9, 2.4]) ellClip(XC + 600, 290, 129, 95, a);
      clip(XC + 935, 222, 0); clip(XC + 1040, 222, 0); clip(XC + 1040, 354, 0);
      clip(XC + 1182, 229, 0); clip(XC + 1182, 345, 0);
      for (let i = 0; i < 3; i++) clip(XC + 520 + i * 70, 504, 0);
      const right = ign(9.6);
      ntext('cat', XC + 987, 312, '400 78px "Gloria Hallelujah"', NX.green, right, 'center', 2);
      tube((g) => { g.beginPath(); g.moveTo(XC + 1150, 290); g.lineTo(XC + 1175, 318); g.lineTo(XC + 1220, 256); }, NX.green, ign(9.8), 9);
    }
    // ---------------- D: PROGRESS ----------------
    const XD = 3840;
    if (seen(XD)) {
      tube((g) => { g.beginPath(); g.moveTo(XD + 140, 110); g.lineTo(XD + 140, 500); g.lineTo(XD + 780, 500); }, NX.cyan, ign(10.95), 5);
      ntext('training rounds', XD + 460, 552, '400 38px "Poiret One"', NX.cyan, ign(11.05), 'center', 2.6);
      const pts = []; for (let r = 0; r <= 12; r++) { const acc = 0.97 - 0.36 * Math.exp(-r / 3.2) + (r > 0 && r < 12 ? (hs(r) - 0.5) * 0.03 : 0); pts.push([XD + 160 + r * 50, 500 - (acc - 0.5) / 0.5 * 380]); }
      const lp = sm(11.2, 12.45, t) * 12;
      tube((g) => { g.beginPath(); g.moveTo(...pts[0]); for (let r = 1; r <= Math.floor(lp); r++) g.lineTo(...pts[r]); const f = lp - Math.floor(lp); if (f > 0 && lp < 12) { const a = pts[Math.floor(lp)], b = pts[Math.floor(lp) + 1]; g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); } }, NX.warm, lp > 0 ? 1 : 0, 6);
      for (let r = 0; r <= 12; r += 2) if (lp >= r) tube((g) => { g.beginPath(); g.arc(pts[r][0], pts[r][1], 7, 0, Math.PI * 2); }, NX.pink, 1, 4);
      ntext('Accuracy', XD + 1010, 210, '400 50px "Poiret One"', NX.cyan, ign(11.0), 'center', 3);
      const pct = Math.round(61 + 36 * E.out(sm(11.2, 12.45, t)));
      const flash = t > 12.45 && t < 12.95 ? (Math.floor(t * 10) % 2 ? 1 : 0.2) : 1;
      ntext(pct + '%', XD + 1010, 390, '400 150px "Gloria Hallelujah"', pct >= 97 ? NX.green : NX.pink, ign(11.05) * flash, 'center', 3, false);
      tube((g) => { g.beginPath(); g.ellipse(XD + 1010, 335, 190, 105, -0.05, 0, Math.PI * 2); }, NX.warm, ign(12.55, 0.35), 6);
      elec(XD + 140, 110, -Math.PI / 2); elec(XD + 780, 500, 0);
      clip(XD + 140, 230, Math.PI / 2); clip(XD + 140, 400, Math.PI / 2); clip(XD + 300, 500, 0); clip(XD + 620, 500, 0);
      for (const a of [-2.0, -0.9, 0.9, 2.2]) ellClip(XD + 1010, 335, 190, 105, a);
    }
    // ---------------- E: TAKEAWAY ----------------
    const XE = 5120;
    if (seen(XE)) {
      ntext('More examples', XE + 640, 230, '400 82px "Poiret One"', NX.cyan, ign(13.4, 0.3), 'center', 4.5);
      arrow(XE + 640, 262, XE + 646, 300, XE + 640, 345, NX.warm, sm(13.6, 13.85, t), 4, 7);
      wordByLetter('better guesses', XE + 640, 470, '400 120px "Gloria Hallelujah"', NX.pink, 13.85, 0.04);
      wordGap('More examples', XE + 640, 230, '400 82px "Poiret One"', 4, 24);
      wordGap('better guesses', XE + 640, 470, '400 120px "Gloria Hallelujah"', 6, 36);
      elec(XE + 640, 262, -Math.PI / 2);
    }

    // ---------- compose: brick wall lit by the signs ----------
    kx.setTransform(1, 0, 0, 1, 0, 0); for (const [m, r, b] of [[txt, 2, USED.thin], [txtB, 5, USED.fat]]) { if (!b) continue; const x0 = Math.max(r, Math.floor(b[0])), y0 = Math.max(r, Math.floor(b[1])), x1 = Math.min(W - r, Math.ceil(b[2])), y1 = Math.min(Hh - r, Math.ceil(b[3])); if (x1 - x0 < 2 || y1 - y0 < 2) continue; const bw = x1 - x0, bh = y1 - y0, c = H.layer(bw, bh), e = c.getContext('2d'); e.drawImage(m, x0, y0, bw, bh, 0, 0, bw, bh); e.globalCompositeOperation = 'destination-in'; for (let a = 0; a < 8; a++) { const dx = Math.round(Math.cos(a * Math.PI / 4) * r), dy = Math.round(Math.sin(a * Math.PI / 4) * r); e.drawImage(m, x0 - dx, y0 - dy, bw, bh, 0, 0, bw, bh); } kx.drawImage(c, x0, y0); }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    const tile = getBrickTile(), tw = tile.width, tx0 = -(((cam % tw) + tw) % tw);
    for (let x = tx0; x < W; x += tw) ctx.drawImage(tile, x, 0);
    const LW8 = W / 8, LH8 = Hh / 8;
    const L = H.layer(LW8, LH8), lx = L.getContext('2d');
    lx.fillStyle = 'rgb(30,34,52)'; lx.fillRect(0, 0, LW8, LH8);
    lx.globalCompositeOperation = 'lighter';
    lx.filter = 'blur(10px)'; lx.drawImage(col, 0, 0, LW8, LH8); lx.drawImage(col, 0, 0, LW8, LH8);
    lx.filter = 'blur(3px)'; lx.globalAlpha = 0.9; lx.drawImage(col, 0, 0, LW8, LH8);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0, W, Hh); ctx.restore();
    { // brick arrises catch the sign light: top edges where the light is above, bottom edges where it is below
      const Ld = lx.getImageData(0, 0, LW8, LH8).data;
      const rimC = H.layer(LW8, LH8), ri = rimC.getContext('2d').createImageData(LW8, LH8);
      const lum = (x, y) => { const k = (H.clamp(y, 0, LH8 - 1) * LW8 + x) * 4; return Ld[k] + Ld[k + 1] + Ld[k + 2]; };
      for (let y = 0; y < LH8; y++) for (let x = 0; x < LW8; x++) {
        const k = (y * LW8 + x) * 4, dir = H.clamp((lum(x, y - 1) - lum(x, y + 1)) / 90, -1, 1);
        const up = 0.3 + Math.abs(dir) * 1.3;
        ri.data[k] = Math.max(0, Ld[k] - 30) * up; ri.data[k + 1] = Math.max(0, Ld[k + 1] - 34) * up; ri.data[k + 2] = Math.max(0, Ld[k + 2] - 52) * up; ri.data[k + 3] = 255;
      }
      rimC.getContext('2d').putImageData(ri, 0, 0);
      const et = getEdgeTiles(), rim = H.layer(W, 600), rx = rim.getContext('2d');
      for (let x = tx0; x < W; x += tw) rx.drawImage(et.both, x, 0);
      rx.globalCompositeOperation = 'source-in'; rx.drawImage(rimC, 0, 0, LW8, 600 / 8, 0, 0, W, 600);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(rim, 0, 0); ctx.restore();
    }
    // tubes stand ~4cm off the wall: soft contact shadow, then the glass itself
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6;
    ctx.drawImage(blurSmall(off, 4, 0.25), 5, 9, W, Hh); ctx.restore();
    ctx.drawImage(off, 0, 0);
    // electrode housings where runs dive into the wall
    ctx.save(); ctx.translate(-cam, 0);
    for (const [x, y, a] of HW.elec) {
      if (x - cam < -40 || x - cam > W + 40) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = '#0d0c0f'; ctx.beginPath(); ctx.roundRect(-7, -6, 22, 12, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-4, -5, 15, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(13, -4, 4, 8);
      ctx.restore();
    }
    ctx.restore();
    // wet sidewalk: concrete tile panned with the wall
    const pave = getPaveTile(W), px0 = -(((cam % pave.PW) + pave.PW) % pave.PW);
    for (let x = px0; x < W; x += pave.PW) ctx.drawImage(pave.c, x, 600);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 600, W, 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // halos are blurred at low res with extra saturation, so the glass rim stays deep colour around a thin hot core
    const blurSat = (src, px, sc, sat) => { const w = Math.ceil(src.width * sc), h = Math.ceil(src.height * sc), c = H.layer(w, h), x = c.getContext('2d'); x.filter = `blur(${Math.max(0.5, px * sc)}px) saturate(${sat})`; x.drawImage(src, 0, 0, w, h); return c; };
    ctx.globalAlpha = 0.55; ctx.drawImage(blurSat(col, 60, 0.125, 1.6), 0, 0, W, Hh);
    ctx.globalAlpha = 0.75; ctx.drawImage(blurSat(col, 18, 0.25, 1.8), 0, 0, W, Hh);
    ctx.globalAlpha = 0.6; ctx.drawImage(blurSat(col, 5, 0.5, 2.2), 0, 0, W, Hh);
    ctx.globalAlpha = 1; ctx.drawImage(col, 0, 0); ctx.drawImage(core, 0, 0);
    ctx.globalAlpha = 0.5; ctx.drawImage(blurSmall(core, 2.5, 0.5), 0, 0, W, Hh);
    ctx.restore();
    // mounting clips over the glass
    ctx.save(); ctx.translate(-cam, 0);
    for (const [x, y, a] of HW.clips) {
      if (x - cam < -20 || x - cam > W + 20) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = 'rgba(30,28,34,0.92)'; ctx.beginPath(); ctx.roundRect(-2.5, -8, 5, 16, 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(-1.5, -7, 1, 14);
      ctx.restore();
    }
    ctx.restore();
    // reflection in the wet pavement: rippled mirror rows, vertical streak smear, full mirror only inside puddles
    {
      const RS = 0.25, src = blurSmall(col, 6, RS), GH = Hh - 600, refl = H.layer(W, GH), rfx = refl.getContext('2d');
      for (let y = 604; y < Hh; y += 2) {
        const gy = y - 600, sy = 600 - gy / 0.3;
        if (sy < 0) break;
        const offx = Math.sin(y * 0.35 + t * 6) * (1.5 + gy * 0.035) + Math.sin(y * 0.11 - t * 2.3 + 1.7) * (1 + gy * 0.03);
        rfx.drawImage(src, 0, sy * RS, src.width, (2 / 0.3) * RS, offx, gy, W, 2);
      }
      const smear = H.layer(W, 10), smx = smear.getContext('2d');
      smx.filter = 'blur(1.5px)'; smx.drawImage(refl, 0, 4, W, GH - 4, 0, 0, W, 10);
      const rm = H.layer(W, GH), rmx = rm.getContext('2d');
      for (let x = px0; x < W; x += pave.PW) rmx.drawImage(pave.p, x, 0);
      rmx.globalCompositeOperation = 'source-in'; rmx.drawImage(refl, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.45; ctx.drawImage(smear, 0, 0, W, 10, 0, 604, W, GH - 4);
      ctx.globalAlpha = 0.22; ctx.drawImage(refl, 0, 600);
      ctx.globalAlpha = 0.6; ctx.drawImage(rm, 0, 600);
      ctx.restore();
    }
    H.vignette(ctx, W, Hh, 0.55, '4,2,10');
    H.grain(ctx, W, Hh, 0.045, 31 + Math.floor(t * 24), false);
  }

  // Sound: a night street after rain. Transformer hum and light drizzle underneath; every tube that lights makes the
  // real ignition noise (contactor click, then a 120 Hz buzz that stutters exactly with the on-screen flicker, then
  // settles); chase arrows tick relay by relay; whip-pans are a fast air smear with the passing sign hum bending past.
  // All times are copied from neonExplainer() above (same ign() flicker hash, same smooth/ease windows).
  // Voiceover mode (k.vo): beds drop out, letter-by-letter crackle, chase ticks, counter re-lights and the per-scene
  // ballast hum are minor (quieter); scene transitions, WRONG, the correction, the 97% hit and the resolve stay full.
  function neonSound(k) {
    const sm = H.smooth, E = H.ease, D = 15;
    const hs = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); }; // = neonExplainer hs
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // contactor / relay click as a sign's circuit closes: dull, low, no ring
    const relay = (t, g = 1, pan = 0) => {
      k.noise(t, { dur: 0.022, filter: 'bandpass', f: 1300, q: 1.4, gain: 0.32 * g, a: 0.001, pan });
      k.tone(t, { f: [[0, 190], [0.04, 75]], dur: 0.06, gain: 0.2 * g, pan });
    };
    // one stretch of lit tube: 120 Hz gas buzz (bright band + body) with a tiny spark at the strike
    const buzzRun = (t, dur, g, pan, f = 120) => {
      k.tone(t, { f, type: 'sawtooth', dur: dur + 0.012, gain: 0.075 * g, a: 0.002, hold: dur * 0.85, filter: 'bandpass', f2: 1700, q: 2, pan });
      k.tone(t, { f, type: 'sawtooth', dur: dur + 0.02, gain: 0.06 * g, a: 0.002, hold: dur * 0.85, filter: 'lowpass', f2: 480, pan });
      k.noise(t, { dur: 0.008, filter: 'highpass', f: 2600, gain: 0.12 * g, a: 0.001, pan });
    };
    // ign(t0, len) from the explainer, reproduced slot by slot (40 slots/s): buzz while lit, silence while dark,
    // then the latch tail where the tube holds and the buzz settles into the hum.
    const ignite = (t0, o = {}) => {
      const len = o.len || 0.3, g = o.gain == null ? 1 : o.gain, pan = o.pan || 0, f = o.f || 120;
      if (!o.noClick) relay(t0, g * (o.click || 1), pan);
      let s = Math.floor(t0 * 40), run = null;
      const flush = (end) => { if (run != null && end - run > 0.004) buzzRun(run, end - run, g, pan, f); run = null; };
      for (; s / 40 < t0 + len; s++) {
        const a = Math.max(t0, s / 40), b = Math.min((s + 1) / 40, t0 + len), on = hs(s + t0 * 977) > 0.42;
        if (on && run == null) run = a; else if (!on) flush(a);
        if (b >= t0 + len) break;
      }
      flush(t0 + len);
      k.tone(t0 + len, { f, type: 'sawtooth', dur: o.tail || 0.35, gain: 0.06 * g, a: 0.004, filter: 'bandpass', f2: 900, q: 1.5, pan });
    };
    // chase-light arrow: one relay tick per segment that latches (segment i lit when prog*n > i+0.5), throttled
    const chase = (a, b, n, pan, gap = 0.08) => {
      let last = -1;
      for (let i = 0; i < n; i++) { const ti = when((t) => sm(a, b, t) * n, i + 0.5 + 1e-6, a, b + 0.01);
        if (ti - last >= gap) { k.noise(ti, { dur: 0.016, filter: 'bandpass', f: 1500 + i * 25, q: 2, gain: 0.22, a: 0.001, pan, minor: true }); last = ti; } }
      ignite(b, { len: 0.06, gain: 0.55, pan, noClick: true, tail: 0.18 }); // arrowhead latches when prog hits 1
    };
    // neon digits re-lit as the number changes: a short dry relay tick per change, throttled
    const relight = (val, a, b, gap, avoid = []) => { let last = -1, prev = val(a);
      for (let t = a; t <= b; t += 0.002) { const v = val(t);
        if (v !== prev && t - last >= gap && !avoid.some((x) => t > x - 0.03 && t < x + 0.1)) {
          k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1150, q: 2.5, gain: 0.42, a: 0.001, pan: 0.35, minor: true });
          k.tone(t, { f: 120, type: 'sawtooth', dur: 0.03, gain: 0.03, filter: 'bandpass', f2: 1600, q: 2, pan: 0.35, minor: true });
          last = t; }
        prev = v; } };
    // whip-pan along the wall (eased inOut, fastest at the middle): an air smear plus the hum of the sign we pass
    const whip = (a, b) => { const d = b - a, m = d * 0.5;
      k.noise(a, { dur: d, color: 'pink', filter: 'bandpass', f: [[0, 260], [m, 1300], [d, 320]], q: 0.8, gain: 0.19, a: m * 0.9 });
      k.tone(a + d * 0.2, { f: [[0, 112], [d * 0.3, 138], [d * 0.6, 96]], type: 'sawtooth', dur: d * 0.6, gain: 0.05, a: d * 0.25, filter: 'lowpass', f2: 700 });
    };
    // ballast hum of the sign in view: rises when it lights, falls away during the pan off it (minor, low)
    const ballast = (t0, t1, f = 120) => k.tone(t0, { f, type: 'sawtooth', dur: t1 - t0, gain: 0.013, a: 0.3, hold: t1 - t0 - 0.7, filter: 'lowpass', f2: 380, bus: 'amb', minor: true });

    // ---- beds: transformer hum, drizzle on wet pavement, a little night air
    k.bed('hum', 0, D, { gain: 0.55 });
    k.bed('rain', 0, D, { gain: 0.18 });
    k.bed('room', 0, D, { gain: 0.35 });

    // ---- A: hook. "How does" (0.15, len .35), "AI learn" letter by letter at 0.55 + i*0.09, underline 1.25
    ignite(0.15, { len: 0.35, gain: 1.0, pan: 0, click: 1.3 });
    k.withMinor(() => [...'AI learn'].forEach((c, i) => { if (c !== ' ') ignite(0.55 + i * 0.09, { gain: 0.55, click: 0.6, pan: -0.45 + i * 0.1, tail: 0.15 }); }));
    ignite(1.25, { gain: 0.7, pan: 0 });
    // "?" lights at 1.4 and keeps cutting out (hs(floor(t*12)) > 0.6 until 2.3): a crackle each time it comes back
    ignite(1.4, { len: 0.05, gain: 0.8, pan: 0.5, f: 118 });
    k.withMinor(() => { for (let s = Math.floor(1.4 * 12); s / 12 < 2.3; s++) if (hs(s) > 0.6 && !(hs(s + 1) > 0.6) && (s + 1) / 12 < 2.3) buzzRun((s + 1) / 12, 0.05, 0.6, 0.5, 118); });
    ballast(0.15, 2.6);

    // ---- pan 1 (2.0–2.8)
    whip(2.0, 2.8);

    // ---- B: data. six frames at 2.85 + k*0.17 (labels +0.05), arrow 3.05–3.45, brain 3.3, counter 3.35, "examples" 3.5
    k.withMinor(() => { for (let c = 0; c < 6; c++) ignite(2.85 + c * 0.17, { gain: 0.5, click: 0.8, pan: -0.6 + (c % 2) * 0.2, tail: 0.2 }); });
    chase(3.05, 3.45, 10, 0);
    ignite(3.3, { gain: 1.0, pan: 0.4, f: 116, tail: 0.5 });   // the brain sign, the big one in this beat
    ignite(3.5, { gain: 0.45, pan: 0.4, tail: 0.15, noClick: true });
    // 10^(6p), p = sm(3.4, 5.25): digits re-light faster and faster, then lock at 1,000,000
    relight((t) => { const p = sm(3.4, 5.25, t); return p >= 1 ? 1e6 : Math.round(Math.pow(10, 6 * p)); }, 3.62, 5.2, 0.09, [3.69]);
    relay(5.25, 1.2, 0.35); ignite(5.25, { len: 0.08, gain: 0.7, pan: 0.35, noClick: true, tail: 0.3 });
    ballast(2.85, 6.1, 116);

    // ---- pan 2 (5.8–6.5)
    whip(5.8, 6.5);

    // ---- C: guess -> check -> adjust
    ignite(6.45, { gain: 0.85, pan: -0.5 });                                      // image frame + cat, brain (6.5)
    ignite(6.5, { gain: 0.6, pan: 0, noClick: true, f: 116 });
    k.withMinor(() => [6.6, 6.65, 6.7].forEach((t, i) => ignite(t, { gain: 0.3, click: 0.6, pan: -0.1 + i * 0.1, tail: 0.1 }))); // knobs, "Guess"
    chase(6.65, 6.95, 6, -0.25);
    chase(7.0, 7.25, 5, 0.2);
    ignite(7.2, { gain: 0.6, pan: 0.4 });                                          // speech bubble
    ignite(7.4, { gain: 1.0, pan: 0.45, f: 124 });                                 // the guess: "dog?"
    // WRONG: red X blinks on at 55/7, 57/7, 59/7 s (floor(t*7) odd), then holds from 8.6; ring + "Check" at 7.95
    relay(7.857, 1.6, 0.7); k.tone(7.857, { f: [[0, 140], [0.12, 55]], dur: 0.22, gain: 0.4, pan: 0.7 });
    [[55 / 7, 56 / 7], [57 / 7, 58 / 7], [59 / 7, 60 / 7], [8.6, 8.85]].forEach(([a, b], i) => {
      k.play('buzz', a, { f: 98, dur: b - a, gain: i === 0 ? 1.0 : 0.75, pan: 0.7 });
      if (i) relay(a, 0.7, 0.7);
    });
    ignite(7.95, { gain: 0.5, pan: 0.7, noClick: true, f: 98, tail: 0.15 });
    chase(8.2, 8.8, 14, 0.2, 0.1);                                                // error signal runs back to the model
    ignite(8.8, { gain: 0.4, pan: -0.1, tail: 0.15 });                            // "Adjust"
    // brain stutters while the weights change (8.85–9.45, hs(floor(t*20)))
    k.withMinor(() => { for (let s = Math.ceil(8.85 * 20); s / 20 < 9.45; s++) if (hs(s) > 0.55) buzzRun(s / 20, 0.04, 0.45, 0, 116); });
    // knob tube banks switch at adj = 1/3, 2/3, 1 (adj = sm(8.85, 9.45))
    for (let st = 1; st <= 3; st++) { const ts = when((t) => sm(8.85, 9.45, t) * 3 + 0.0001, st, 8.85, 9.46);
      k.play('tock', ts, { f: 300 + st * 30, gain: 0.55, pan: -0.15 }); relay(ts, 0.8, -0.15); }
    // RIGHT: green "cat" at 9.6, tick at 9.8; a low warm two-note answer under it
    ignite(9.6, { gain: 1.0, pan: 0.45, f: 120 });
    ignite(9.8, { gain: 0.8, pan: 0.7, noClick: false });
    k.play('success', 9.8, { f: 'G4', gain: 0.75, pan: 0.4 });
    ballast(6.45, 10.7, 98);

    // ---- pan 3 (10.4–11.1)
    whip(10.4, 11.1);

    // ---- D: progress. axes 10.95, "Accuracy" 11.0, % and caption 11.05; line 11.2–12.45 with dots every 2 rounds
    ignite(10.95, { gain: 0.7, pan: -0.4 });
    k.withMinor(() => ignite(11.0, { gain: 0.4, pan: 0.5, tail: 0.15 }));
    ignite(11.05, { gain: 0.8, pan: 0.5, noClick: true });
    // the plotted tube lights along its length: a low buzz that climbs as it goes
    k.tone(11.2, { f: 120, type: 'sawtooth', dur: 1.3, gain: 0.04, a: 0.15, hold: 1.0, filter: 'bandpass', f2: [[0, 500], [1.25, 1500]], q: 1.5, pan: -0.3, minor: true });
    const lp = (t) => sm(11.2, 12.45, t) * 12, dots = [];
    for (let r = 2; r <= 12; r += 2) { const td = when(lp, r, 11.2, 12.46); dots.push(td); buzzRun(td, 0.04, 0.5, -0.5 + r * 0.05); }
    // pct = round(61 + 36 * E.out(sm(11.2, 12.45))): re-lit digits, slowing until it locks on 97 (turns green)
    const pct = (t) => Math.round(61 + 36 * E.out(sm(11.2, 12.45, t)));
    const t97 = when(pct, 97, 11.2, 12.45);
    relight(pct, 11.21, t97 - 0.05, 0.085, dots);
    relay(t97, 1.2, 0.5); ignite(t97, { len: 0.1, gain: 0.8, pan: 0.5, noClick: true, f: 124, tail: 0.4 });
    // THE HIT: 97% flashes from 12.45 (on at 12.5, 12.7, 12.9) and the ring tube ignites at 12.55
    k.play('thud', 12.5, { f: 90, gain: 1.1 }); relay(12.5, 1.8, 0.4);
    [[12.5, 12.6], [12.7, 12.8], [12.9, 12.95]].forEach(([a, b], i) => k.tone(a, { f: 124, type: 'sawtooth', dur: b - a + 0.02, gain: 0.11 - i * 0.02, a: 0.002, hold: (b - a) * 0.8, filter: 'bandpass', f2: 1400, q: 1.2, pan: 0.4 }));
    ignite(12.55, { len: 0.35, gain: 1.2, pan: 0.4, f: 120, tail: 0.6 });
    [120, 240, 360].forEach((f, i) => k.tone(12.5, { f, type: 'sawtooth', dur: 1.2, gain: 0.03 / (i + 1), a: 0.02, hold: 0.3, filter: 'lowpass', f2: 900, verb: 0.3, pan: 0.3 }));
    ballast(10.95, 13.3, 124);

    // ---- pan 4 (12.9–13.5)
    whip(12.9, 13.5);

    // ---- E: takeaway. "More examples" 13.4 (len .3), arrow 13.6–13.85, "better guesses" letters 13.85 + i*0.04
    ignite(13.4, { gain: 0.9, pan: 0 });
    chase(13.6, 13.85, 4, 0);
    k.withMinor(() => [...'better guesses'].forEach((c, i) => { if (c !== ' ') ignite(13.85 + i * 0.04, { gain: 0.32, click: i % 3 ? 0 : 0.5, pan: -0.5 + i * 0.075, tail: 0.1 }); }));
    // resolve: as the last letters settle, the hum blooms (slow attack) into a chord on its own harmonics
    const tEnd = 13.85 + 13 * 0.04 + 0.12; // last letter (13 = index of the final 's') is mid-flicker, settling
    [240, 300, 360, 480].forEach((f, i) => k.tone(tEnd - 0.05, { f, type: i ? 'sine' : 'triangle', dur: D - tEnd + 0.05, gain: 0.075 - i * 0.01, a: 0.2, hold: 0.3, verb: 0.35, pan: (i - 1.5) * 0.25 }));
    k.tone(tEnd - 0.05, { f: 120, type: 'sawtooth', dur: D - tEnd + 0.05, gain: 0.04, a: 0.1, hold: 0.2, filter: 'lowpass', f2: 600 });
  }

  registerStyle({
    id: 'neon-sign',
    name: 'Neon Sign at Night',
    category: 'Light & Imaging',
    description: 'Hand-bent glass neon on an old brick wall after rain: white-hot tube cores, saturated colour halos, painted-out blockout tube, clips and electrodes, light spilling across the brickwork and smearing in the wet pavement.',
    motion: 'Tubes buzz on letter by letter with a stutter, one failing letter keeps flickering, and the puddle reflection shivers as drops land.',
    fonts: ['400 150px "Gloria Hallelujah"', '400 40px "Poiret One"'],
    frameT: 4.68,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'One long brick wall the camera whip-pans along: every beat is a new neon sign that buzzes on tube by tube, arrows are segmented chase-light tubes that ignite toward their target, numbers are neon digits re-lit as they change, and the emphasis is a blinking red tube with a ring.',
    explainer(ctx, W, Hh, t) { neonExplainer(ctx, W, Hh, t); },
    explainerSound(k) { neonSound(k); },
    draw(ctx, W, Hh, t) {
      const R = H.rng(1207), nz = H.makeNoise(77);
      // ---- flicker of the failing letter ----
      const hsh = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); };
      // ignition: a tube buzzes on/off for a moment, then latches on
      const ign = (t0, len = 0.34) => t < t0 ? 0 : t - t0 > len ? 1 : (hsh(Math.floor(t * 40) + t0 * 977) > 0.42 ? 1 : 0);
      const ON = {
        bulb: ign(0.12, 0.45), fil: ign(0.8),
        rays: rayIdx => ign(1.05 + rayIdx * 0.08, 0.22),
        letter: li => ign(1.45 + li * 0.16, 0.26),
        cyan: ign(2.75, 0.4),
      };
      // the failing letter: tries to strike, then lives with intermittent dropouts
      let flick = 0;
      if (t >= 2.45) {
        const r = hsh(Math.floor(t * 14) + 3);
        flick = t < 3.1 ? (r > 0.55 ? 1 : r > 0.3 ? 0.3 : 0) : (r > 0.74 ? 0.3 : 1);
      }
      const hum = 0.97 + 0.03 * hsh(Math.floor(t * 30) + 11);

      // ---------- geometry (masks) ----------
      const bx = 268, by = 262, BR = 104;
      const bulbPath = (x) => {
        x.beginPath();
        const nk = 0.42 * BR, ny = by + 1.28 * BR;
        x.moveTo(bx - nk, ny);
        x.bezierCurveTo(bx - nk, by + 0.95 * BR, bx - BR * 0.98, by + 0.62 * BR, bx - BR * 0.98, by);
        x.arc(bx, by, BR * 0.98, Math.PI, 0);
        x.bezierCurveTo(bx + BR * 0.98, by + 0.62 * BR, bx + nk, by + 0.95 * BR, bx + nk, ny);
        x.stroke();
      };
      const threads = (x) => {
        const ny = by + 1.28 * BR;
        [[0, 0.44], [22, 0.40], [44, 0.34]].forEach(([dy, w]) => {
          x.beginPath(); x.moveTo(bx - w * BR, ny + 16 + dy); x.lineTo(bx + w * BR, ny + 16 + dy); x.stroke();
        });
        x.beginPath(); x.moveTo(bx - 14, ny + 80); x.lineTo(bx + 14, ny + 80); x.stroke();
      };
      const filament = (x) => {
        const y0 = by + 0.16 * BR, ny = by + 1.28 * BR;
        x.beginPath();
        x.moveTo(bx - 0.26 * BR, ny - 8); x.lineTo(bx - 0.30 * BR, y0);
        const loops = 5, span = 0.6 * BR, rr = 11;
        for (let i = 0; i <= 120; i++) {
          const u = i / 120, th = u * loops * Math.PI * 2;
          x.lineTo(bx - 0.30 * BR + u * span + Math.sin(th) * rr * 0.9, y0 - (1 - Math.cos(th)) * rr * 0.9);
        }
        x.lineTo(bx + 0.26 * BR, ny - 8);
        x.stroke();
      };
      const rayAngles = [-158, -132, -108, -90, -72, -48, -22];
      const rays = (x, which) => {
        rayAngles.forEach((d, i) => {
          if (which === 'lit' && (i === 5 || !ON.rays(i))) return;
          if (which === 'off' && (i === 5 || ON.rays(i))) return;
          if (which === 'dead' && i !== 5) return;
          const a = d * Math.PI / 180;
          x.beginPath();
          x.moveTo(bx + Math.cos(a) * BR * 1.28, by + Math.sin(a) * BR * 1.28);
          x.lineTo(bx + Math.cos(a) * BR * (i === 3 ? 1.72 : 1.58), by + Math.sin(a) * BR * (i === 3 ? 1.72 : 1.58));
          x.stroke();
        });
      };

      const word = 'big ideas', FLK = 7; // flickering letter index ('a')
      const tx = 470, ty = 338;
      const wordMask = (x, which) => {
        x.font = '400 150px "Gloria Hallelujah"';
        for (let i = 0; i < word.length; i++) {
          if (word[i] === ' ') continue;
          if ((which === 'flk') !== (i === FLK)) continue;
          if (which === 'main' && !ON.letter(i)) continue;
          if (which === 'off' && ON.letter(i)) continue;
          const px = tx + x.measureText(word.slice(0, i)).width;
          x.lineWidth = 3.2; x.fillText(word[i], px, ty); x.strokeText(word[i], px, ty);
        }
      };
      const boxX = 586, boxY = 424, boxW = 432, boxH = 74;
      const cyanMask = (x) => {
        x.font = '400 40px "Poiret One"';
        x.letterSpacing = '9px';
        x.textAlign = 'center';
        x.lineWidth = 4.2;
        x.fillText('OPEN ALL NIGHT', boxX + boxW / 2 + 4, boxY + 51);
        x.strokeText('OPEN ALL NIGHT', boxX + boxW / 2 + 4, boxY + 51);
        x.lineWidth = 7;
        x.beginPath(); x.roundRect(boxX, boxY, boxW, boxH, 22); x.stroke();
      };

      const mPink = mask(W, Hh, (x) => wordMask(x, 'main'));
      const mFlk = mask(W, Hh, (x) => wordMask(x, 'flk'));
      const mCyan = mask(W, Hh, cyanMask);
      const mWarm = mask(W, Hh, (x) => { x.lineWidth = 8; if (ON.bulb) { bulbPath(x); threads(x); } rays(x, 'lit'); });
      const mFil = mask(W, Hh, (x) => { x.lineWidth = 5.5; filament(x); });
      const mDead = mask(W, Hh, (x) => { x.lineWidth = 8; rays(x, 'dead'); });
      // every tube that is currently dark (rendered as unlit glass)
      const mOff = mask(W, Hh, (x) => {
        x.lineWidth = 8; if (!ON.bulb) { bulbPath(x); threads(x); } rays(x, 'off');
        if (!ON.fil) { x.lineWidth = 5.5; filament(x); }
        wordMask(x, 'off'); if (!ON.cyan) cyanMask(x);
      });
      const anyLit = { pink: [...word].some((c, i) => c !== ' ' && i !== FLK && ON.letter(i)), cyan: !!ON.cyan, warm: true, fil: !!ON.fil };

      // blockout (painted black) tubes connecting the runs + electrode ends
      const blockout = (x) => {
        x.lineWidth = 9;
        x.beginPath(); // bulb neck -> under word
        x.moveTo(bx + 0.42 * BR, by + 1.28 * BR + 6);
        x.bezierCurveTo(bx + 120, by + 170, 400, 392, 478, 360);
        x.stroke();
        x.beginPath(); // 'g' to 'i' of ideas, behind
        x.moveTo(668, 372); x.bezierCurveTo(700, 398, 724, 392, 742, 330); x.stroke();
        x.beginPath(); // end of ideas down to box
        x.moveTo(1105, 330); x.bezierCurveTo(1112, 380, 1060, 410, 1018, 440); x.stroke();
      };

      // ---------- neon light layer (additive) ----------
      const neon = H.layer(W, Hh), g = neon.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh);
      g.globalCompositeOperation = 'lighter';
      const groups = [
        [mPink, COL.pink, anyLit.pink ? hum : 0], [mFlk, flick < 1 ? { core: [255, 150, 200], tube: [190, 25, 105], glow: [200, 10, 90] } : COL.pink, flick],
        [mCyan, COL.cyan, anyLit.cyan ? hum : 0], [mWarm, COL.warm, (ON.bulb || ON.rays(0)) ? hum : 0], [mFil, COL.pink, ON.fil ? 0.95 * hum : 0],
      ].filter((g0) => g0[2] > 0);
      // light map for the wall (very blurred colour)
      const light = H.layer(W / 4, Hh / 4), lx = light.getContext('2d');
      lx.fillStyle = '#000'; lx.fillRect(0, 0, W / 4, Hh / 4);
      lx.globalCompositeOperation = 'lighter';
      for (const [m, c, k] of groups) {
        const gs = colorize(m, c.glow);
        addBlur(g, gs, 70, 0.55 * k, W, Hh);
        addBlur(g, gs, 26, 0.75 * k, W, Hh);
        addBlur(g, colorize(m, c.tube), 7, 0.9 * k, W, Hh);
        g.globalAlpha = k; g.drawImage(colorize(m, c.tube), 0, 0);
        const core = colorize(erode(m, 2), c.core);
        g.globalAlpha = Math.min(1, k * k * 1.1); g.drawImage(core, 0, 0);
        addBlur(g, core, 2.5, 0.6 * k, W, Hh);
        // wall light contributions
        lx.globalAlpha = k; lx.filter = 'blur(40px)'; lx.drawImage(gs, 0, 0, W / 4, Hh / 4); lx.filter = 'blur(18px)'; lx.drawImage(gs, 0, 0, W / 4, Hh / 4);
        lx.filter = 'blur(7px)'; lx.globalAlpha = 0.8 * k; lx.drawImage(gs, 0, 0, W / 4, Hh / 4);
      }
      g.globalAlpha = 1;

      // ---------- wall + ground per-pixel pass ----------
      const Ld = lx.getImageData(0, 0, W / 4, Hh / 4).data, LW = W / 4, LH = Hh / 4;
      const sampleL = (x, y, o) => {
        const fx = H.clamp(x / 4 - 0.5, 0, LW - 1.001), fy = H.clamp(y / 4 - 0.5, 0, LH - 1.001);
        const ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i = (iy * LW + ix) * 4 + o;
        return (Ld[i] * (1 - ax) + Ld[i + 4] * ax) * (1 - ay) + (Ld[i + LW * 4] * (1 - ax) + Ld[i + LW * 4 + 4] * ax) * ay;
      };
      // low-res stain field
      const SW = 161, SH = 91, stain = new Float32Array(SW * SH);
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) stain[y * SW + x] = nz.fbm2(x * 0.09, y * 0.09, 4);
      const sampleS = (x, y) => {
        const fx = H.clamp(x / 8, 0, SW - 1.01), fy = H.clamp(y / 8, 0, SH - 1.01), ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i = iy * SW + ix;
        return (stain[i] * (1 - ax) + stain[i + 1] * ax) * (1 - ay) + (stain[i + SW] * (1 - ax) + stain[i + SW + 1] * ax) * ay;
      };
      const brickCols = [[122, 56, 40], [104, 46, 34], [138, 72, 50], [92, 50, 40], [116, 64, 48], [70, 38, 32]];
      const rowH = 30, brW = 92, mort = 5;
      const bhash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
      const img = ctx.createImageData(W, Hh), d = img.data;
      const amb = [16, 19, 30];
      for (let y = 0; y < Hh; y++) {
        const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2) + (row % 3 === 0 ? 7 : 0);
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const lr = sampleL(x, y, 0), lg = sampleL(x, y, 1), lb = sampleL(x, y, 2);
          const grain = R() - 0.5;
          if (y < WALL_BASE) {
            const col = Math.floor((x + off) / brW), lxp = x + off - col * brW;
            const h1 = bhash(row, col), h2 = bhash(col + 9, row + 3);
            const st = sampleS(x, y);
            let ar, ag, ab, shade = 1;
            // chipped / irregular mortar edges
            const edgeJit = (bhash(x >> 2, row) - 0.5) * 2.2 + (h2 - 0.5) * 1.5;
            const inMortar = ly < mort + edgeJit * 0.5 || lxp < mort + edgeJit * 0.6;
            if (inMortar) {
              ar = 96; ag = 90; ab = 84; shade = 0.5 + grain * 0.35;
            } else {
              const bc = brickCols[Math.floor(h1 * brickCols.length)];
              const k = 0.85 + h2 * 0.3 + st * 0.35;
              ar = bc[0] * k; ag = bc[1] * k; ab = bc[2] * k;
              // pitted surface
              shade = 1 + grain * 0.32 + (bhash(x * 0.37 | 0, y * 0.41 | 0) > 0.985 ? -0.45 : 0);
              // bevel: light comes from where the sign is (gradient of light map)
              const gL = (sampleL(x, y - 10, 0) + sampleL(x, y - 10, 2)) - (sampleL(x, y + 10, 0) + sampleL(x, y + 10, 2));
              const dir = H.clamp(gL / 60, -1, 1);
              const top = ly - mort, bot = rowH - ly;
              if (top < 3) shade *= 1 + 0.55 * dir;
              else if (bot < 3) shade *= 1 - 0.45 * dir;
              if (lxp - mort < 2) shade *= 0.85;
            }
            // soot streaks darken lower wall a bit
            const soot = 1 - H.smooth(380, WALL_BASE, y) * 0.25;
            shade *= soot;
            d[i] = ar * shade * (amb[0] + lr * 3.4) / 255;
            d[i + 1] = ag * shade * (amb[1] + lg * 3.4) / 255;
            d[i + 2] = ab * shade * (amb[2] + lb * 3.4) / 255;
          } else {
            // wet concrete sidewalk
            const gy = y - WALL_BASE;
            let base = 26 + grain * 14 + sampleS((x * 1.7) % 1280, (y * 3) % 720) * 10;
            if (gy < 12) base = 52 + grain * 18 - gy * 1.2; // footing/curb lip
            const fall = 1 / (1 + gy * 0.012);
            d[i] = base * 0.9 + lr * 0.9 * fall;
            d[i + 1] = base * 0.95 + lg * 0.9 * fall;
            d[i + 2] = base * 1.1 + lb * 0.9 * fall;
          }
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // ---------- physical hardware (unlit) ----------
      ctx.save();
      // cable from the bulb base down the wall to transformer
      ctx.strokeStyle = '#0b0a0c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx, by + 1.28 * BR + 84); ctx.bezierCurveTo(bx + 6, 470, bx - 30, 520, bx - 40, 560); ctx.lineTo(bx - 42, 566); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,150,90,0.25)'; ctx.lineWidth = 1; ctx.stroke();
      // transformer box
      const tbx = bx - 92, tby = 546;
      ctx.fillStyle = '#121216'; ctx.fillRect(tbx, tby, 110, 46);
      const tg = ctx.createLinearGradient(tbx, tby, tbx, tby + 46);
      tg.addColorStop(0, 'rgba(255,170,90,0.35)'); tg.addColorStop(0.1, 'rgba(255,170,90,0.04)'); tg.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = tg; ctx.fillRect(tbx, tby, 110, 46);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(tbx + 2, tby + 46, 110, 4);
      ctx.fillStyle = 'rgba(255,200,150,0.18)'; ctx.font = '600 8px monospace'; ctx.fillText('15kV  30mA', tbx + 10, tby + 28);
      // blockout tubes: painted black glass
      const mBlk = mask(W, Hh, blockout);
      ctx.drawImage(colorize(mBlk, [14, 12, 14]), 0, 0);
      ctx.globalAlpha = 0.5; ctx.drawImage(colorize(erode(mBlk, 3), [120, 70, 90]), -1, -2); ctx.globalAlpha = 1;
      // dead tube ray (unlit glass, catches some colour)
      ctx.drawImage(colorize(mDead, COL.warm.dark), 0, 0);
      ctx.globalAlpha = 0.55; ctx.drawImage(colorize(erode(mDead, 3), [200, 160, 110]), -1, -1); ctx.globalAlpha = 1;
      // all tubes not lit right now: pale unlit glass catching a little street light
      ctx.drawImage(colorize(mOff, [34, 30, 38]), 0, 0);
      ctx.globalAlpha = 0.22; ctx.drawImage(colorize(erode(mOff, 2), [170, 150, 170]), -1, -2); ctx.globalAlpha = 1;
      // unlit glass under the flickering letter
      ctx.drawImage(colorize(mFlk, COL.pink.dark), 0, 0);
      ctx.globalAlpha = 0.18; ctx.drawImage(colorize(erode(mFlk, 2), [190, 110, 150]), -1, -2); ctx.globalAlpha = 1;
      // electrode housings where runs dive into the wall
      const electrode = (x, y, a) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.fillStyle = '#0d0c0f'; ctx.beginPath(); ctx.roundRect(-7, -6, 22, 12, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-4, -5, 15, 2);
        ctx.restore();
      };
      electrode(478, 360, -0.4); electrode(1105, 330, 1.5); electrode(1018, 440, 2.5); electrode(742, 330, -1.4); electrode(668, 372, 0.6);
      ctx.restore();

      // shadow of tubes on wall (tubes stand ~4cm off the wall, lit by each other + street glow)
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.55;
      const shadowM = mask(W, Hh, (x) => { x.drawImage(mPink, 0, 0); x.drawImage(mFlk, 0, 0); x.drawImage(mCyan, 0, 0); x.drawImage(mWarm, 0, 0); });
      const sh = colorize(shadowM, [20, 10, 20]);
      ctx.filter = 'blur(3px)'; ctx.drawImage(sh, 5, 9); ctx.filter = 'none';
      ctx.restore();

      // ---------- add neon light ----------
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(neon, 0, 0);
      ctx.restore();

      // mounting clips (glass tube supports) over the tubes
      const clips = [[520, 300], [610, 270], [850, 262], [1000, 300], [1080, 318], [586, 462], [1018, 461], [800, 424], [bx - BR * 0.98, by - 10], [bx + BR * 0.98, by - 10], [bx, by - BR * 0.98]];
      for (const [cx, cy] of clips) {
                ctx.fillStyle = 'rgba(30,28,34,0.92)'; ctx.beginPath(); ctx.roundRect(cx - 2.5, cy - 8, 5, 16, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(cx - 1.5, cy - 7, 1, 14);
      }

      // ---------- wet-pavement reflection ----------
      const soft = H.layer(W, Hh), sfx = soft.getContext('2d');
      sfx.filter = 'blur(2.5px)'; sfx.drawImage(neon, 0, 0); sfx.filter = 'none';
      const refl = H.layer(W, Hh), rx = refl.getContext('2d');
      const squash = 0.36, srcTop = 40;
      // rippled mirror: 1px rows with wobbling offsets
      for (let y = WALL_BASE + 4; y < Hh; y++) {
        const gy = y - WALL_BASE;
        const sy = WALL_BASE - 14 - gy / squash;
        if (sy < srcTop) break;
        const off = nz.n2(y * 0.035, t * 1.2) * (4 + gy * 0.22) + nz.n2(y * 0.12, 9 + t * 2) * (1 + gy * 0.05);
        rx.drawImage(soft, 0, sy, W, 1 / squash, off, y, W, 1);
      }
      // vertical streak smear: squash rows hard, scale back up
      const smear = H.layer(W, 12), smx = smear.getContext('2d');
      smx.filter = 'blur(1.5px)'; smx.drawImage(refl, 0, WALL_BASE, W, Hh - WALL_BASE, 0, 0, W, 12);
      // puddle mask
      const pud = H.layer(W, Hh), px = pud.getContext('2d');
      const pimg = px.createImageData(W, Hh - WALL_BASE), pd = pimg.data;
      for (let y = 0; y < Hh - WALL_BASE; y++) for (let x = 0; x < W; x++) {
        const v = nz.fbm2(x * 0.0045, y * 0.02 + 20, 3);
        const a = H.smooth(-0.08, 0.1, v);
        const j = (y * W + x) * 4; pd[j] = pd[j + 1] = pd[j + 2] = 255; pd[j + 3] = a * 255 * H.smooth(3, 12, y);
      }
      px.putImageData(pimg, 0, WALL_BASE);
      // diffuse wet sheen everywhere (streaks), mirror only in puddles
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.95; ctx.drawImage(smear, 0, 0, W, 12, 0, WALL_BASE + 4, W, Hh - WALL_BASE - 4);
      const rm = H.layer(W, Hh), rmx = rm.getContext('2d');
      rmx.drawImage(refl, 0, 0);
      rmx.globalCompositeOperation = 'destination-in'; rmx.drawImage(pud, 0, 0);
      ctx.globalAlpha = 0.7; ctx.drawImage(rm, 0, 0);
      ctx.restore();
      // concrete aggregate speckle catching the light
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 900; k++) {
        const x = R() * W, y = WALL_BASE + 14 + Math.pow(R(), 0.8) * (Hh - WALL_BASE - 14);
        const near = x < 520 ? [255, 170, 80] : x < 1100 ? [255, 60, 150] : [60, 200, 255];
        ctx.fillStyle = H.rgba(near, R() * 0.18);
        ctx.fillRect(x, y, 1 + R(), 1);
      }
      ctx.restore();
      // expansion joint
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(150, Hh); ctx.lineTo(205, WALL_BASE + 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1210, Hh); ctx.lineTo(1120, WALL_BASE + 12); ctx.stroke();

      // rain drops / ripples rings in puddles
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 9; k++) {
        const x = R.range(80, 1200), y = R.range(WALL_BASE + 30, Hh - 10), ph = (t * 0.8 + R()) % 1;
        ctx.strokeStyle = `rgba(255,140,200,${0.18 * (1 - ph)})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, y, 4 + ph * 26, (4 + ph * 26) * 0.22, 0, 0, 7); ctx.stroke();
      }
      ctx.restore();

      // ---------- atmosphere: bloom haze, vignette, grain ----------
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35;
      ctx.drawImage(blurSmall(neon, 120, 0.0625), 0, 0, W, Hh); ctx.restore();
      H.vignette(ctx, W, Hh, 0.6, '4,2,10');
      H.grain(ctx, W, Hh, 0.05, 31 + Math.floor(t * 24), false);
    },
  });
}
```
