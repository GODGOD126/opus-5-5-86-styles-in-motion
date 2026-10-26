I want an animated explainer made in the "Art Deco Foil" visual style (Art & Design Movements). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Limelight, Poiret One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Limelight&family=Poiret+One&display=block">
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
Name: Art Deco Foil
Family: Art & Design Movements
Look: A 1920s Art Deco poster in black lacquer and stamped gold foil: a symmetrical stepped ziggurat skyscraper built from server racks, sunburst fans radiating behind it, a stepped geometric border, and Limelight / Poiret One lettering with cream accents.
Motion: Like a gilded title sequence: the stepped border inscribes itself, the server ziggurat rises floor by floor with its LEDs waking, halo arcs close symmetrically and the sunburst fans open, the spire extends and its beacon ignites, the title is foil-stamped letter by letter, then one slow glint sweeps across the gold.
How it explains: A gilded picture-palace sequence: scenes change behind closing and opening gold elevator doors, cameos glide on a gold rail with cream name plaques, arrows are stepped chevron arrows, numbers roll on an odometer and fill a sunburst gauge, and the key moments get a spotlight ring or a beacon glint.

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

REFERENCE STYLE SOURCE (styles/art-deco.js; W/H_ are always 1280x720)
```js
{
  const CREAM = '#efe3c4';

  // metallic foil fill for an alpha mask
  const foil = (W, HH, mask, seed, t) => {
    const G = H.layer(W, HH), g = G.getContext('2d');
    const lin = g.createLinearGradient(0, 0, W * 0.55, HH * 1.3);
    const stops = ['#6b4a16', '#c99a3e', '#f6e2a0', '#fff6d2', '#d6a948', '#7d5719', '#b8863a', '#f3d98c', '#fff3c8', '#c08f36', '#6e4c16'];
    stops.forEach((s, i) => lin.addColorStop(i / (stops.length - 1), s));
    g.fillStyle = lin; g.fillRect(0, 0, W, HH);
    // moving sheen band
    const sx = H.lerp(-400, W + 400, H.ease.inOut(H.clamp((t - 3.1) / 1.3, 0, 1))); // one slow glint across the finished foil
    const sh = g.createLinearGradient(sx - 220, 0, sx + 220, HH * 0.4);
    sh.addColorStop(0, 'rgba(255,248,220,0)'); sh.addColorStop(0.5, 'rgba(255,248,220,0.45)'); sh.addColorStop(1, 'rgba(255,248,220,0)');
    g.fillStyle = sh; g.fillRect(0, 0, W, HH);
    // brushed micro-texture
    const img = g.getImageData(0, 0, W, HH), d = img.data, r = H.rng(seed), nz = H.makeNoise(seed);
    const rowN = new Float32Array(HH); for (let y = 0; y < HH; y++) rowN[y] = nz.n2(0.5, y * 0.35) * 0.06;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const y = (p / W) | 0; const s = 1 + rowN[y] + (r() - 0.5) * 0.09;
      d[i] *= s; d[i + 1] *= s; d[i + 2] *= s;
    }
    g.putImageData(img, 0, 0);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0);
    return G;
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // A gilded picture-palace sequence: scenes change behind closing/opening gold elevator doors, arrows are
  // stepped deco chevron arrows, numbers roll on an odometer, the key result gets a beacon glint.
  let FOILBASE = null;
  const exGild = (ctx, W, HH, mask, sheen) => {
    if (!FOILBASE) { FOILBASE = foil(W, HH, (() => { const m = H.layer(W, HH); m.getContext('2d').fillRect(0, 0, W, HH); return m; })(), 6, -99); }
    const G = H.layer(W, HH), g = G.getContext('2d');
    g.drawImage(FOILBASE, 0, 0);
    if (sheen > -1 && sheen < 2) { const sx = H.lerp(-400, W + 400, sheen), sh = g.createLinearGradient(sx - 220, 0, sx + 220, HH * 0.4); sh.addColorStop(0, 'rgba(255,248,220,0)'); sh.addColorStop(0.5, 'rgba(255,248,220,0.5)'); sh.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, HH); }
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0);
    const tint = (col) => { const T = H.layer(W, HH), tc = T.getContext('2d'); tc.drawImage(mask, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, HH); return T; };
    ctx.drawImage(tint('rgba(0,0,0,0.85)'), 1.5, 2);
    ctx.drawImage(G, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.3; ctx.drawImage(tint('#fff4cf'), -0.8, -0.8); ctx.restore();
  };
  const decoArrow = (m, x0, y0, x1, y1, p, k0 = 1) => { // shaft + stacked chevrons for a head
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p;
    m.save(); m.translate(x0, y0); m.rotate(a); m.fillRect(0, -2 * k0, Math.max(0, l - 18 * k0), 4 * k0);
    m.lineWidth = 3 * k0; for (let k = 0; k < 3; k++) { const x = l - k * 9 * k0; if (x < 0) continue; m.beginPath(); m.moveTo(x - 14 * k0, -12 * k0); m.lineTo(x, 0); m.lineTo(x - 14 * k0, 12 * k0); m.stroke(); }
    m.restore();
  };
  const cameo = (m, kind, x, y, r) => { // octagonal gold frame with a line-drawn animal
    m.save(); m.translate(x, y); m.lineWidth = 3;
    m.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; m.lineTo(Math.cos(a) * r, Math.sin(a) * r); } m.closePath(); m.stroke();
    m.lineWidth = 1.2; m.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; m.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86); } m.closePath(); m.stroke();
    const s = r * 0.62; m.lineWidth = Math.max(1.5, r * 0.06); m.lineJoin = 'miter';
    if (kind === 'cat') {
      m.beginPath(); m.moveTo(-s * 0.55, -s * 0.05); m.lineTo(-s * 0.5, -s * 0.75); m.lineTo(-s * 0.15, -s * 0.42); m.lineTo(s * 0.15, -s * 0.42); m.lineTo(s * 0.5, -s * 0.75); m.lineTo(s * 0.55, -s * 0.05); m.quadraticCurveTo(s * 0.5, s * 0.6, 0, s * 0.62); m.quadraticCurveTo(-s * 0.5, s * 0.6, -s * 0.55, -s * 0.05); m.stroke();
      m.beginPath(); m.moveTo(-s * 0.3, -s * 0.05); m.lineTo(-s * 0.12, -s * 0.12); m.moveTo(s * 0.3, -s * 0.05); m.lineTo(s * 0.12, -s * 0.12); m.stroke();
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { m.beginPath(); m.moveTo(sd * s * 0.12, s * 0.22 + k * s * 0.07); m.lineTo(sd * s * 0.7, s * 0.12 + k * s * 0.12); m.stroke(); }
    } else {
      m.beginPath(); m.arc(0, s * 0.05, s * 0.5, Math.PI * 1.1, Math.PI * 1.9); m.stroke();
      m.beginPath(); m.moveTo(-s * 0.42, -s * 0.2); m.lineTo(-s * 0.72, s * 0.3); m.lineTo(-s * 0.5, s * 0.42); m.lineTo(-s * 0.4, s * 0.1); m.stroke();
      m.beginPath(); m.moveTo(s * 0.42, -s * 0.2); m.lineTo(s * 0.72, s * 0.3); m.lineTo(s * 0.5, s * 0.42); m.lineTo(s * 0.4, s * 0.1); m.stroke();
      m.beginPath(); m.moveTo(-s * 0.4, s * 0.1); m.quadraticCurveTo(-s * 0.35, s * 0.62, 0, s * 0.65); m.quadraticCurveTo(s * 0.35, s * 0.62, s * 0.4, s * 0.1); m.stroke();
      m.beginPath(); m.arc(0, s * 0.3, s * 0.12, 0, 7); m.fill();
      m.beginPath(); m.arc(-s * 0.18, -s * 0.02, s * 0.06, 0, 7); m.arc(s * 0.18, -s * 0.02, s * 0.06, 0, 7); m.fill();
    }
    m.restore();
  };
  const plaque = (ctx, txt, x, y, size, p = 1, font = 'Poiret One', col = CREAM, back = font === 'Poiret One', ls = 0.18) => { // cream lettering on a black plaque with gold rule
    if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; ctx.font = `400 ${size}px "${font}"`; ctx.letterSpacing = (size * ls).toFixed(1) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (back) { // black lacquer plaque, double gold hairline, tiny diamond studs at the ends
      const w = ctx.measureText(txt).width - size * ls, bw = w + size * 1.15, bh = size * 1.25, x0 = Math.round(x - bw / 2) + 0.5, y0 = Math.round(y - bh / 2) + 0.5;
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x0 + 1.5, y0 + 2.5, bw, bh);
      const g = ctx.createLinearGradient(0, y0, 0, y0 + bh); g.addColorStop(0, '#1a140c'); g.addColorStop(0.5, '#0d0a06'); g.addColorStop(1, '#070504'); ctx.fillStyle = g; ctx.fillRect(x0, y0, bw, bh);
      ctx.strokeStyle = '#d9ab52'; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, bw, bh);
      ctx.strokeStyle = 'rgba(201,154,62,0.55)'; ctx.strokeRect(x0 + 3, y0 + 3, bw - 6, bh - 6);
      ctx.fillStyle = '#e2b860'; for (const ex of [x0, x0 + bw]) { ctx.beginPath(); ctx.moveTo(ex - 4, y0 + bh / 2); ctx.lineTo(ex, y0 + bh / 2 - 4); ctx.lineTo(ex + 4, y0 + bh / 2); ctx.lineTo(ex, y0 + bh / 2 + 4); ctx.closePath(); ctx.fill(); }
    }
    const tx = x + size * ls / 2, ty = y + 1;
    if (font === 'Poiret One') { ctx.strokeStyle = col; ctx.lineWidth = size * 0.035; ctx.lineJoin = 'round'; ctx.strokeText(txt, tx, ty); }
    ctx.fillStyle = col; ctx.fillText(txt, tx, ty); ctx.restore(); ctx.letterSpacing = '0px';
  };
  // the deco border of the hero still (stepped double frame + quarter-fan corners), built once as a mask layer
  let BORDER = null;
  const decoBorder = (W, HH) => {
    if (BORDER && BORDER.width === W && BORDER.height === HH) return BORDER;
    BORDER = H.layer(W, HH); const m = BORDER.getContext('2d'); m.fillStyle = m.strokeStyle = '#fff';
    const frame = (ins, lw) => {
      const s = 34; m.lineWidth = lw; m.beginPath();
      m.moveTo(ins + s, ins); m.lineTo(W - ins - s, ins); m.lineTo(W - ins - s, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s); m.lineTo(W - ins, ins + s);
      m.lineTo(W - ins, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins);
      m.lineTo(ins + s, HH - ins); m.lineTo(ins + s, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s); m.lineTo(ins, HH - ins - s);
      m.lineTo(ins, ins + s); m.lineTo(ins + s * 0.4, ins + s); m.lineTo(ins + s * 0.4, ins + s * 0.4); m.lineTo(ins + s, ins + s * 0.4); m.closePath(); m.stroke();
    };
    frame(20, 3); frame(30, 1.2);
    for (const [fx, fy, a0] of [[30, 30, 0], [W - 30, 30, Math.PI / 2], [W - 30, HH - 30, Math.PI], [30, HH - 30, Math.PI * 1.5]]) {
      m.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) { m.beginPath(); m.arc(fx, fy, 58 + k * 12, a0 + 0.12, a0 + Math.PI / 2 - 0.12); m.stroke(); }
      for (let k = 0; k < 7; k++) { const a = a0 + 0.2 + (k / 6) * (Math.PI / 2 - 0.4); m.beginPath(); m.moveTo(fx + Math.cos(a) * 58, fy + Math.sin(a) * 58); m.lineTo(fx + Math.cos(a) * 82, fy + Math.sin(a) * 82); m.stroke(); }
      // small stepped diamond at the corner inside the fan
      const dx = fx + Math.cos(a0 + Math.PI / 4) * 40, dy = fy + Math.sin(a0 + Math.PI / 4) * 40;
      m.beginPath(); m.moveTo(dx, dy - 6); m.lineTo(dx + 6, dy); m.lineTo(dx, dy + 6); m.lineTo(dx - 6, dy); m.closePath(); m.fill();
    }
    // centre studs on the side rules
    for (const [x, y] of [[W / 2, 20], [W / 2, HH - 20], [20, HH / 2], [W - 20, HH / 2]]) { m.beginPath(); m.moveTo(x, y - 7); m.lineTo(x + 7, y); m.lineTo(x, y + 7); m.lineTo(x - 7, y); m.closePath(); m.fill(); }
    return BORDER;
  };
  const odoFrame = (m, x, y, digits, ch) => { const cw = ch * 0.62; m.lineWidth = 2.5; m.strokeRect(x - 8, y - 8, digits * (cw + 6) + 42, ch + 16); m.lineWidth = 1; m.strokeRect(x - 14, y - 14, digits * (cw + 6) + 54, ch + 28); };
  const odometer = (ctx, n, x, y, digits, ch) => { // rolling digit wheels
    const cw = ch * 0.62;
    ctx.save(); ctx.font = `400 ${ch * 0.82}px "Limelight"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let k = 0; k < digits; k++) {
      const place = digits - 1 - k, v = n / Math.pow(10, place), dgt = Math.floor(v) % 10;
      let off = place === 0 ? v % 1 : H.smooth(0.9, 1, (n % Math.pow(10, place)) / Math.pow(10, place));
      const bx = x + k * (cw + 6) + (k >= 1 ? 16 : 0) + (k >= 4 ? 16 : 0);
      if (k === 1 || k === 4) { ctx.save(); ctx.fillStyle = CREAM; ctx.font = `400 ${ch * 0.6}px "Limelight"`; ctx.textAlign = 'center'; ctx.fillText(',', bx - 11, y + ch * 0.85); ctx.restore(); }
      ctx.fillStyle = '#16120c'; ctx.fillRect(bx, y, cw, ch);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, y, cw, ch); ctx.clip();
      const lead = Math.floor(n).toString().length < digits - k && dgt === 0 && off === 0;
      ctx.fillStyle = lead ? 'rgba(239,227,196,0.25)' : CREAM;
      ctx.fillText(String(dgt), bx + cw / 2, y + ch / 2 - off * ch); ctx.fillText(String((dgt + 1) % 10), bx + cw / 2, y + ch / 2 + ch - off * ch);
      ctx.restore();
      const g = ctx.createLinearGradient(0, y, 0, y + ch); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(bx, y, cw, ch);
    }
    ctx.restore();
  };
  const gaugeMask = (m, x, y, r) => { // semicircular dial: gold arc + ticks (needle drawn in cream later)
    m.lineWidth = 2.5; m.beginPath(); m.arc(x, y, r, Math.PI, 0); m.stroke();
    for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; m.beginPath(); m.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); m.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); m.stroke(); }
    m.fillRect(x - r - 6, y, r * 2 + 12, 3);
  };
  // compact server ziggurat (the model) drawn into the gold mask
  const miniZig = (m, ctx, cx, base, s, ledSeed) => {
    const tiers = [[5, 40], [4, 36], [3, 32], [2, 30], [1, 28]], bay = 36 * s; let y = base; const leds = [];
    tiers.forEach(([n, h]) => {
      const w = n * bay + 10 * s, x = cx - w / 2; h *= s; y -= h;
      m.globalCompositeOperation = 'destination-out'; m.fillRect(x, y, w, h + 1); m.globalCompositeOperation = 'source-over';
      m.lineWidth = 2.5; m.strokeRect(x + 1, y + 1, w - 2, h - 2);
      for (let b = 0; b < n; b++) { const bx = x + 5 * s + b * bay; if (b) m.fillRect(bx - 1.5, y + 3, 3, h - 6); m.lineWidth = 1; for (let u = y + 8 * s; u < y + h - 4; u += 7 * s) { m.beginPath(); m.moveTo(bx + 4, u); m.lineTo(bx + bay - 10, u); m.stroke(); leds.push([bx + bay - 6, u]); } }
      m.beginPath(); m.moveTo(cx - 16 * s, y); m.lineTo(cx, y - 10 * s); m.lineTo(cx + 16 * s, y); m.closePath(); m.fill();
    });
    m.beginPath(); m.moveTo(cx - 8 * s, y - 6 * s); m.lineTo(cx, y - 60 * s); m.lineTo(cx + 8 * s, y - 6 * s); m.closePath(); m.fill();
    return { leds, top: y - 60 * s };
  };

  const explainDeco = (ctx, W, HH, t) => {
    const E = H.ease, cl = H.clamp, S = (a, b) => cl((t - a) / (b - a), 0, 1), CX = W / 2;
    const DOORS = [5.55, 10.0, 12.5], mid = (d) => d + 0.55; // closed at mid
    const scene = t < mid(DOORS[0]) ? 1 : t < mid(DOORS[1]) ? 2 : t < mid(DOORS[2]) ? 3 : 4;
    const bg = ctx.createRadialGradient(CX, 420, 40, CX, 420, 820); bg.addColorStop(0, '#221a10'); bg.addColorStop(0.5, '#0f0c08'); bg.addColorStop(1, '#050403');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, HH);
    const M = H.layer(W, HH), m = M.getContext('2d'); m.fillStyle = m.strokeStyle = '#fff';
    const Md = H.layer(W, HH), md = Md.getContext('2d'); md.fillStyle = '#fff';
    const post = []; // cream drawing after the gilding: fns(ctx)
    const step = Math.floor(t * 5);
    const ledsDraw = (leds, seed) => post.push(() => leds.forEach(([x, y], i) => { const r = H.rng(seed + i * 977 + step * 13); if (r() < 0.7) { ctx.fillStyle = r() < 0.25 ? '#ffcf8a' : CREAM; ctx.fillRect(x - 1.2, y - 1.2, 2.6, 2.6); } }));
    const rays = (x, y, open, r0 = 120) => { md.save(); const f = md.createRadialGradient(x, y, r0, x, y, 700); f.addColorStop(0, 'rgba(255,255,255,0.5)'); f.addColorStop(1, 'rgba(255,255,255,0.03)'); md.fillStyle = f; for (let i = 0; i < 36; i++) { const a0 = Math.PI + (i / 36) * Math.PI, a1 = a0 + Math.PI / 36 * 0.42, aa = Math.PI * 1.5 + (a0 - Math.PI * 1.5) * open, ab = Math.PI * 1.5 + (a1 - Math.PI * 1.5) * open; md.beginPath(); md.moveTo(x, y); md.arc(x, y, 900, aa, ab); md.closePath(); md.fill(); } md.globalCompositeOperation = 'destination-out'; md.beginPath(); md.arc(x, y, r0, 0, 7); md.fill(); md.restore(); };

    // ---------- frame border (always) ----------
    m.drawImage(decoBorder(W, HH), 0, 0);

    // ---------- hook: title, then it shrinks into the top plaque ----------
    const hp = E.inOut(S(1.7, 2.4));
    if (hp < 1) rays(CX, 470, E.inOut(S(0.0, 1.2)) * (1 - hp), 160);
    {
      const ty = H.lerp(360, 62, hp), sz = H.lerp(84, 30, hp);
      post.push(() => {
        ctx.save(); ctx.font = `400 ${sz}px "Limelight"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = (sz * 0.08).toFixed(1) + 'px';
        const title = 'HOW DOES AI LEARN?', w = ctx.measureText(title).width, x0 = CX - w / 2;
        ctx.textAlign = 'left';
        for (let i = 0; i < title.length; i++) { const a = cl((t - 0.3 - i * 0.05) / 0.15, 0, 1); if (a <= 0) continue; ctx.globalAlpha = a; ctx.fillStyle = CREAM; ctx.fillText(title[i], x0 + ctx.measureText(title.slice(0, i)).width, ty); }
        ctx.restore(); ctx.letterSpacing = '0px';
      });
      const rw = H.lerp(420, 300, hp) * E.inOut(S(0.2, 1.0));
      m.fillRect(CX - rw, ty + sz * 0.62, rw * 2, 2); m.fillRect(CX - rw, ty - sz * 0.72, rw * 2, 1.5);
      if (hp >= 1) { m.beginPath(); m.moveTo(CX - 310, 62); m.lineTo(CX - 300, 54); m.lineTo(CX - 290, 62); m.lineTo(CX - 300, 70); m.closePath(); m.fill(); m.beginPath(); m.moveTo(CX + 310, 62); m.lineTo(CX + 300, 54); m.lineTo(CX + 290, 62); m.lineTo(CX + 300, 70); m.closePath(); m.fill(); }
    }

    // ---------- scene 1: data ----------
    if (scene === 1 && t > 2.1) {
      const zx = 1010, zb = 590, zp = E.out(S(2.1, 2.7));
      rays(zx, zb, zp * 0.9, 110);
      const z = miniZig(m, ctx, zx, zb + (1 - zp) * 300, 1.3, 1); ledsDraw(z.leds, 5);
      // the gold rail and the cameos gliding along it
      m.fillRect(60, 470, 700 * E.out(S(2.4, 2.9)), 3); m.fillRect(60, 476, 700 * E.out(S(2.4, 2.9)), 1);
      decoArrow(m, 760, 470, 880, 470, E.out(S(2.9, 3.3)));
      for (let i = 0; i < 10; i++) {
        const u = (t - 2.6 - i * 0.38) * 0.55; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 5 + 2)() < 0.5 ? 'cat' : 'dog', x = H.lerp(40, 820, u), fade = 1 - cl((u - 0.85) / 0.15, 0, 1), r = 66 * fade;
        if (r < 4) continue;
        cameo(m, kind, x, 390, r);
        m.fillRect(x - 1, 456, 2, 14 * fade);
        post.push(() => plaque(ctx, kind, x, 500, 30, fade));
      }
      post.push(() => plaque(ctx, 'TRAINING DATA', 410, 560, 30, S(3.2, 3.6)));
      const cp = S(3.0, 5.3), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      if (t > 2.9) { odoFrame(m, 120, 150, 7, 70); post.push(() => odometer(ctx, n, 120, 150, 7, 70)); post.push(() => plaque(ctx, 'EXAMPLES', 320, 272, 30, S(3.0, 3.3))); }
    }

    // ---------- scene 2: guess -> check -> adjust ----------
    if (scene === 2) {
      const t0 = mid(DOORS[0]) + 0.2, zx = 330, zb = 560;
      rays(zx, zb, 0.85, 110);
      const z = miniZig(m, ctx, zx, zb, 1.25, 2); ledsDraw(z.leds, 9);
      // three weight gauges on the plinth
      const adj = E.inOut(S(8.4, 9.2)), vals = [[0.2, 0.75], [0.8, 0.35], [0.45, 0.9]];
      vals.forEach((_, i) => gaugeMask(m, zx - 120 + i * 120, 640, 40));
      post.push(() => vals.forEach(([a, b], i) => { const v = H.lerp(a, b, adj) + (adj > 0 && adj < 1 ? Math.sin(t * 30 + i) * 0.03 : 0), x = zx - 120 + i * 120, y = 640, A = Math.PI + v * Math.PI; ctx.strokeStyle = adj > 0 && adj < 1 ? '#ffcf8a' : CREAM; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(A) * 34, y + Math.sin(A) * 34); ctx.stroke(); ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }));
      post.push(() => plaque(ctx, 'WEIGHTS', zx, 667, 30, S(t0 + 0.3, t0 + 0.6)));
      // the new picture
      const cs = E.back(S(t0 + 0.1, t0 + 0.45)); cameo(m, 'cat', 700, 330, 80 * cs);
      decoArrow(m, 610, 330, 460, 330, E.out(S(t0 + 0.4, t0 + 0.7)));
      post.push(() => plaque(ctx, 'NEW PICTURE', 700, 440, 30, S(t0 + 0.3, t0 + 0.6)));
      // guess plaque + check medallion
      if (t < 9.35) {
        post.push(() => plaque(ctx, 'dog?', 700, 175, 46, S(6.95, 7.2), 'Limelight'));
        const xp = E.back(S(7.5, 7.75));
        if (xp > 0) { m.save(); m.translate(820, 175); m.scale(xp, xp); m.lineWidth = 3; m.beginPath(); m.arc(0, 0, 26, 0, 7); m.stroke(); m.lineWidth = 5; m.beginPath(); m.moveTo(-11, -11); m.lineTo(11, 11); m.moveTo(11, -11); m.lineTo(-11, 11); m.stroke(); m.restore(); }
        const sp = S(7.55, 8.0); // emphasis: a spotlight ring sweeps round the wrong guess
        if (sp > 0) { m.lineWidth = 2; m.beginPath(); m.ellipse(745, 175, 140, 52, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sp); m.stroke(); }
        if (t > 7.8) post.push(() => plaque(ctx, 'WRONG — IT IS A CAT', 745, 244, 28, S(7.8, 8.0), 'Poiret One', '#ffcf8a'));
      } else {
        post.push(() => plaque(ctx, 'cat', 700, 175, 46, S(9.4, 9.6), 'Limelight'));
        const cp = E.back(S(9.65, 9.85)); if (cp > 0) { m.save(); m.translate(790, 175); m.scale(cp, cp); m.lineWidth = 3; m.beginPath(); m.arc(0, 0, 26, 0, 7); m.stroke(); m.lineWidth = 5; m.beginPath(); m.moveTo(-12, 0); m.lineTo(-3, 10); m.lineTo(13, -10); m.stroke(); m.restore(); }
      }
      // error signal: a bead of light runs back along a gold line to the gauges
      const ep = S(7.9, 8.45);
      m.lineWidth = 1.5; if (t > 7.9 && t < 9.35) { m.beginPath(); m.moveTo(820, 205); m.quadraticCurveTo(820, 640, zx + 170, 640); m.stroke(); }
      if (ep > 0 && ep < 1) post.push(() => { const u = E.inOut(ep), x = (1 - u) * (1 - u) * 820 + 2 * (1 - u) * u * 820 + u * u * (zx + 170), y = (1 - u) * (1 - u) * 205 + 2 * (1 - u) * u * 640 + u * u * 640; const g = ctx.createRadialGradient(x, y, 0, x, y, 26); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52); });
      // loop medallions: Guess -> Check -> Adjust arranged on an arc, chevron arrows between
      const MED = [['GUESS', 990, 190], ['CHECK', 1150, 370], ['ADJUST', 960, 540]], act = t < 7.45 ? 0 : t < 8.3 ? 1 : t < 9.35 ? 2 : Math.floor((t - 9.35) * 3) % 3;
      MED.forEach(([s, x, y], i) => { const p = E.back(S(t0 + 0.2 + i * 0.15, t0 + 0.5 + i * 0.15)); if (p <= 0) return; m.lineWidth = i === act && t > 6.9 ? 4 : 2; m.beginPath(); m.arc(x, y, 76 * p, 0, 7); m.stroke(); m.lineWidth = 1; m.beginPath(); m.arc(x, y, 68 * p, 0, 7); m.stroke(); post.push(() => plaque(ctx, s, x, y, 28, p, 'Poiret One', i === act && t > 6.9 ? '#ffcf8a' : CREAM, false, 0.1)); });
      decoArrow(m, 1050, 245, 1105, 300, E.out(S(7.2, 7.5)));
      decoArrow(m, 1100, 440, 1030, 490, E.out(S(7.9, 8.2)));
      decoArrow(m, 935, 465, 950, 268, E.out(S(9.0, 9.3)));
    }

    // ---------- scene 3: progress gauge ----------
    if (scene === 3) {
      const t0 = mid(DOORS[1]) + 0.2, gx = CX, gy = 530, R = 320, prog = E.inOut(S(t0 + 0.2, 12.0)), acc = H.lerp(61, 97, prog);
      // sunburst gauge: rays light up to the current accuracy
      const lit = (acc - 50) / 50;
      for (let i = 0; i < 30; i++) { const u = (i + 0.5) / 30, a0 = Math.PI + u * Math.PI; if (u > lit) { m.globalAlpha = 0.18; } m.beginPath(); m.moveTo(gx + Math.cos(a0 - 0.03) * 168, gy + Math.sin(a0 - 0.03) * 168); m.lineTo(gx + Math.cos(a0 - 0.045) * R, gy + Math.sin(a0 - 0.045) * R); m.lineTo(gx + Math.cos(a0 + 0.045) * R, gy + Math.sin(a0 + 0.045) * R); m.lineTo(gx + Math.cos(a0 + 0.03) * 168, gy + Math.sin(a0 + 0.03) * 168); m.closePath(); m.fill(); m.globalAlpha = 1; }
      m.lineWidth = 3; m.beginPath(); m.arc(gx, gy, R + 14, Math.PI, 0); m.stroke(); m.lineWidth = 1.5; m.beginPath(); m.arc(gx, gy, 156, Math.PI, 0); m.stroke();
      m.fillRect(gx - R - 40, gy, (R + 40) * 2, 3);
      [50, 75, 100].forEach((v) => { const a = Math.PI + (v - 50) / 50 * Math.PI, rr = v === 75 ? R + 66 : R + 62; post.push(() => plaque(ctx, v + '%', gx + Math.cos(a) * rr, gy + Math.sin(a) * rr + (v === 75 ? 0 : -30), 28)); });
      post.push(() => { ctx.save(); ctx.font = '400 96px "Limelight"'; ctx.textAlign = 'center'; ctx.fillStyle = CREAM; ctx.fillText(Math.round(acc) + '%', gx, gy - 24); ctx.restore(); { // one lacquer plaque carrying the three caption lines
          const bw = 470, bx = Math.round(gx - bw / 2) + 0.5, by = gy + 12.5, bh = 136; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx + 1.5, by + 2.5, bw, bh);
          const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, '#1a140c'); g.addColorStop(0.5, '#0d0a06'); g.addColorStop(1, '#070504'); ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#d9ab52'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh); ctx.strokeStyle = 'rgba(201,154,62,0.55)'; ctx.strokeRect(bx + 3, by + 3, bw - 6, bh - 6);
          ctx.fillStyle = 'rgba(201,154,62,0.6)'; ctx.fillRect(gx - 90, gy + 54, 180, 1); ctx.restore(); }
        plaque(ctx, 'ACCURACY', gx, gy + 34, 28, 1, 'Poiret One', CREAM, false); plaque(ctx, '61% → 97%', gx, gy + 76, 30, S(t0 + 0.3, t0 + 0.6), 'Poiret One', CREAM, false); plaque(ctx, 'OVER TRAINING ROUNDS', gx, gy + 120, 28, S(t0 + 0.3, t0 + 0.6), 'Poiret One', CREAM, false); });
      // emphasis: beacon flash and a ring when it reaches 97%
      const fl = S(12.0, 12.4);
      if (fl > 0) { m.lineWidth = 3; m.lineWidth = 4; m.beginPath(); m.arc(gx, gy, R + 34 + fl * 10, Math.PI, Math.PI + Math.PI * Math.min(1, fl * 1.5)); m.stroke();
        post.push(() => { const g = ctx.createRadialGradient(gx, gy - 52, 0, gx, gy - 52, 260); g.addColorStop(0, `rgba(255,236,190,${0.45 * (1 - Math.abs(fl - 0.4))})`); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(gx - 260, gy - 312, 520, 520); ctx.restore(); }); }
    }

    // ---------- scene 4: takeaway plaque ----------
    if (scene === 4) {
      const t0 = mid(DOORS[2]) + 0.2;
      rays(CX, 640, E.inOut(S(t0, t0 + 0.8)), 140);
      post.push(() => { plaque(ctx, 'MORE EXAMPLES', CX, 300, 60, S(t0, t0 + 0.3), 'Limelight'); plaque(ctx, 'BETTER GUESSES', CX, 470, 60, S(t0 + 0.35, t0 + 0.65), 'Limelight'); });
      decoArrow(m, CX, 340, CX, 428, E.out(S(t0 + 0.2, t0 + 0.45)), 1.8);
      const rw = 380 * E.inOut(S(t0, t0 + 0.6)); m.fillRect(CX - rw, 528, rw * 2, 2); m.fillRect(CX - rw, 240, rw * 2, 2);
    }

    // ---------- gild ----------
    const Gd = H.layer(W, HH), gd = Gd.getContext('2d'); gd.drawImage(Md, 0, 0); gd.globalCompositeOperation = 'source-in'; gd.fillStyle = '#c08a34'; gd.fillRect(0, 0, W, HH);
    ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(Gd, 0, 0); ctx.restore();
    const sheen = t < 6 ? (t - 3.4) / 1.3 : (t - 12.1) / 1.2;
    exGild(ctx, W, HH, M, sheen);
    post.forEach((f) => f());

    // ---------- the gold elevator doors ----------
    for (const d of DOORS) {
      const close = E.inOut(S(d, d + 0.5)), open = E.inOut(S(d + 0.65, d + 1.15)), k = close * (1 - open); if (k <= 0) continue;
      const DM = H.layer(W, HH), dm = DM.getContext('2d'); dm.fillStyle = dm.strokeStyle = '#fff';
      const wHalf = (W / 2) * k;
      ctx.fillStyle = '#0d0a06'; ctx.fillRect(0, 0, wHalf, HH); ctx.fillRect(W - wHalf, 0, wHalf, HH);
      for (const side of [-1, 1]) {
        const ex = side < 0 ? wHalf : W - wHalf; // leading edge
        const px = side < 0 ? ex - W / 2 : ex; // panel left
        dm.save(); dm.beginPath(); dm.rect(side < 0 ? 0 : W - wHalf, 0, wHalf, HH); dm.clip();
        dm.lineWidth = 3; dm.strokeRect(px + 20, 20, W / 2 - 40, HH - 40); dm.lineWidth = 1.2; dm.strokeRect(px + 32, 32, W / 2 - 64, HH - 64);
        const fx = side < 0 ? px + W / 2 - 32 : px + 32; // fan anchored at the meeting edge
        for (let i = 0; i < 9; i++) { const a = (side < 0 ? Math.PI / 2 : -Math.PI / 2) + (i + 0.5) / 9 * Math.PI; dm.beginPath(); dm.moveTo(fx, HH / 2); dm.lineTo(fx + Math.cos(a - 0.05) * 230, HH / 2 + Math.sin(a - 0.05) * 230); dm.lineTo(fx + Math.cos(a + 0.05) * 230, HH / 2 + Math.sin(a + 0.05) * 230); dm.closePath(); dm.fill(); }
        dm.lineWidth = 2; for (let k2 = 0; k2 < 3; k2++) { dm.beginPath(); dm.arc(fx, HH / 2, 250 + k2 * 16, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? Math.PI * 1.5 : Math.PI / 2); dm.stroke(); }
        for (let k2 = 0; k2 < 6; k2++) { const yy = 70 + k2 * 18; dm.beginPath(); dm.moveTo(px + W / 4 - 60, yy + 14); dm.lineTo(px + W / 4, yy); dm.lineTo(px + W / 4 + 60, yy + 14); dm.stroke(); const y2 = HH - 70 - k2 * 18; dm.beginPath(); dm.moveTo(px + W / 4 - 60, y2 - 14); dm.lineTo(px + W / 4, y2); dm.lineTo(px + W / 4 + 60, y2 - 14); dm.stroke(); }
        dm.restore();
      }
      exGild(ctx, W, HH, DM, -5);
    }
    H.grain(ctx, W, HH, 0.035, 3 + Math.floor(t * 12), true);
    H.vignette(ctx, W, HH, 0.45);
  };

  registerStyle({
    id: 'art-deco',
    name: 'Art Deco Foil',
    category: 'Art & Design Movements',
    description: 'A 1920s Art Deco poster in black lacquer and stamped gold foil: a symmetrical stepped ziggurat skyscraper built from server racks, sunburst fans radiating behind it, a stepped geometric border, and Limelight / Poiret One lettering with cream accents.',
    motion: 'Like a gilded title sequence: the stepped border inscribes itself, the server ziggurat rises floor by floor with its LEDs waking, halo arcs close symmetrically and the sunburst fans open, the spire extends and its beacon ignites, the title is foil-stamped letter by letter, then one slow glint sweeps across the gold.',
    fonts: ['400 76px "Limelight"', '400 30px "Poiret One"', '400 16px "Poiret One"'],
    frameT: 4.7,
    duration: 5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'A gilded picture-palace sequence: scenes change behind closing and opening gold elevator doors, cameos glide on a gold rail with cream name plaques, arrows are stepped chevron arrows, numbers roll on an odometer and fill a sunburst gauge, and the key moments get a spotlight ring or a beacon glint.',
    explainer(ctx, W, HH, t) { explainDeco(ctx, W, HH, t); },
    // Sound: a gilded picture palace. Heavy brass elevator doors roll shut on their track with a deep clunk, the lift
    // chime sounds and they roll open on the next scene; the sunbursts open on soft harp glissandi, the odometer wheels
    // tick, the guess/check moments are vibraphone and a muted brass stab, and a quiet jazz-age pad sits underneath.
    // Times copied from explainDeco().
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const backLand = (a, b) => a + (b - a) * 0.37; // back ease first reaches full size at 37%
      const DOORS = [5.55, 10.0, 12.5], mid = (d) => d + 0.55;
      const HARP = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'];
      // harp pluck: soft triangle with a quick decay
      const pluck = (t, n, g, p, minor = true) => { const f = k.hz(n);
        k.tone(t, { f, type: 'triangle', dur: 0.9, gain: 0.14 * g, a: 0.002, filter: 'lowpass', f2: 2200, pan: p, verb: 0.3, minor });
        k.tone(t, { f: f * 2, dur: 0.25, gain: 0.028 * g, a: 0.002, pan: p, minor }); };
      const gliss = (t0, t1, notes, g, p) => notes.forEach((n, i) => pluck(t0 + ((t1 - t0) * i) / Math.max(1, notes.length - 1), n, g, p));
      // vibraphone: sine with a slow shimmer, low register only
      const vibe = (t, n, g, p, minor) => { const f = k.hz(n);
        k.tone(t, { f, dur: 1.4, gain: 0.13 * g, a: 0.004, pan: p, verb: 0.35, minor });
        k.tone(t, { f: f * 1.003, dur: 1.2, gain: 0.07 * g, a: 0.004, pan: p, minor });
        k.tone(t, { f: f * 4, dur: 0.12, gain: 0.015 * g, a: 0.002, pan: p, minor }); };
      // muted brass stab
      const brass = (t, notes, dur, g, p) => notes.forEach((n, i) => { for (const det of [-6, 6])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.03 * g, a: 0.015, hold: dur * 0.5, filter: 'lowpass', f2: [[0, 500], [0.05, 1600], [dur, 600]], q: 1.2, pan: p + (i - 1) * 0.15, verb: 0.3 }); });
      // odometer wheel tick
      const odo = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 2400, q: 2, gain: 0.24 * g, a: 0.001, pan: p }); k.tone(t, { f: 420, type: 'triangle', dur: 0.03, gain: 0.05 * g, pan: p }); });
      // the elevator doors: roll shut on the track (inOut d..d+0.5), clunk, chime, roll open (d+0.65..d+1.15)
      const roll = (t, dur, g) => {
        k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 200], [dur * 0.5, 600], [dur, 250]], gain: 0.4 * g, a: dur * 0.4 });
        for (let x = 0.06; x < dur - 0.05; x += 0.055) k.noise(t + x, { dur: 0.03, filter: 'bandpass', f: 700, q: 3, gain: 0.06 * g * Math.sin((x / dur) * Math.PI), a: 0.002, minor: true });
      };
      const doors = (d) => {
        roll(d, 0.5, 1);
        k.play('thud', d + 0.5, { f: 85, gain: 0.45 });
        k.play('tock', d + 0.5, { f: 260, gain: 0.3 });
        k.tone(d + 0.5, { f: 340, dur: 0.5, gain: 0.04, a: 0.003, verb: 0.3 }); k.tone(d + 0.5, { f: 523, dur: 0.35, gain: 0.025, a: 0.003 });
        k.play('ding', d + 0.65, { f: 'E5', gain: 0.6 }); // the lift chime
        roll(d + 0.65, 0.5, 0.8);
      };

      k.bed('room', 0, D, { gain: 0.35 });
      k.music('pad', 0, D, { bpm: 76, gain: 0.45, chords: [['C3', 'E3', 'G3', 'B3'], ['A2', 'C3', 'E3', 'G3'], ['D3', 'F3', 'A3', 'C4'], ['G2', 'B2', 'D3', 'F3']] });

      // ---- hook: sunburst opens (inOut 0-1.2) as the title fades in letter by letter (0.3 + i*0.05)
      gliss(when(0, 1.2, E.inOut, 0.08), when(0, 1.2, E.inOut, 0.92), HARP, 0.9, 0);
      vibe(1.25, 'C4', 0.6, 0, true); vibe(1.25, 'G4', 0.5, 0, true); // title complete
      // title glides up into the top plaque (1.7-2.4): a soft slide
      k.noise(1.7, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.7, 900]], q: 0.7, gain: 0.06, a: 0.3, minor: true });

      // ---- scene 1: DATA
      k.noise(2.1, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 150], [0.6, 450]], gain: 0.25, a: 0.25, pan: pan(1010), minor: true }); // ziggurat rises
      gliss(2.15, 2.6, ['G3', 'C4', 'D4', 'G4'], 0.6, pan(1010));
      k.play('thud', when(2.1, 2.7, E.out, 0.95), { f: 90, gain: 0.35, pan: pan(1010), minor: true });
      k.noise(2.4, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 1200], [0.5, 1800]], q: 2, gain: 0.05, a: 0.1, pan: pan(400), minor: true }); // gold rail runs out
      k.play('tock', 2.9, { f: 300, gain: 0.4, pan: pan(320), minor: true }); // odometer frame set
      const chev = when(2.9, 3.3, E.out, 0.95); k.play('click', chev, { f: 900, gain: 0.8, pan: pan(880), minor: true }); // chevron arrow lands
      // cameos arrive on the rail at 2.6 + 0.38 i: a soft felt tap each
      const cams = []; for (let i = 0; 2.6 + i * 0.38 < mid(DOORS[0]) - 0.2; i++) cams.push(2.6 + i * 0.38);
      cams.forEach((tc) => k.noise(tc, { dur: 0.05, color: 'pink', filter: 'bandpass', f: 900, q: 1, gain: 0.24, a: 0.003, pan: pan(40), minor: true }));
      // odometer n = S(3.0,5.3)^3 * 1e6: wheel ticks speeding up, off the cameo taps
      for (let t = 3.08; t < 5.24; ) { const s = S(t, 3.0, 5.3); if (![...cams, chev].some((c) => t > c - 0.06 && t < c + 0.08)) odo(t, 0.7 + 0.4 * s, pan(330)); t += 0.16 - 0.075 * s; }
      k.play('tock', 5.3, { f: 280, gain: 0.6, pan: pan(330) }); vibe(5.31, 'G4', 0.8, pan(330)); // 1,000,000 locks

      // ---- the elevator doors between scenes
      DOORS.forEach(doors);

      // ---- scene 2: GUESS / CHECK / ADJUST (t0 = 6.3)
      const t0 = mid(DOORS[0]) + 0.2;
      pluck(backLand(t0 + 0.1, t0 + 0.45), 'E4', 0.8, pan(700)); // cat cameo
      [0, 1, 2].forEach((i) => pluck(backLand(t0 + 0.2 + i * 0.15, t0 + 0.5 + i * 0.15), ['G4', 'A4', 'C5'][i], 0.6, pan([990, 1150, 960][i]))); // medallions
      // the guess: "dog?" fades up (6.95-7.2) on a questioning vibe pair
      vibe(7.0, 'D4', 0.8, pan(700)); vibe(7.12, 'A4', 0.6, pan(700));
      // CHECK: the X medallion snaps on (back 7.5-7.75) — muted brass stab, wrong
      brass(backLand(7.5, 7.75), ['C3', 'Gb3', 'Bb3'], 0.45, 1.2, pan(820));
      k.play('thud', backLand(7.5, 7.75), { f: 100, gain: 0.5, pan: pan(820) });
      k.noise(7.6, { dur: 0.42, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.2, 1500], [0.42, 800]], q: 1.2, gain: 0.06, a: 0.08, pan: pan(745), minor: true }); // spotlight ring sweeps round
      // error bead runs back along the gold line (inOut 7.9-8.45): a soft falling glide
      k.tone(7.92, { f: [[0, 620], [0.5, 260]], type: 'triangle', dur: 0.55, gain: 0.05, a: 0.15, filter: 'lowpass', f2: 1200, pan: pan(600) });
      // weight gauges re-set (inOut 8.4-9.2): needle detents, at least 90 ms apart
      for (let i = 1, lt = 0; i <= 8; i++) { const t = when(8.4, 9.2, E.inOut, i / 8); if (t - lt < 0.09) continue; lt = t; odo(t, 1, pan(330)); }
      // the correction: "cat" fades up (9.4-9.6), the check medallion snaps on (back 9.65-9.85)
      pluck(9.45, 'C4', 0.6, pan(700));
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => vibe(backLand(9.65, 9.85) + i * 0.06, n, 0.8, pan(790)));

      // ---- scene 3: PROGRESS (t0 = 10.75): sunburst rays light one by one as accuracy rises (inOut 10.95-12.0)
      const t3 = mid(DOORS[1]) + 0.2;
      for (let i = 0, lt = 0; i < 30; i++) {
        const u = (i + 0.5) / 30, acc = 50 + 50 * u; if (acc <= 61 || acc > 97) continue;
        const t = when(t3 + 0.2, 12.0, E.inOut, (acc - 61) / 36); if (t - lt < 0.09) continue; lt = t;
        pluck(t, HARP[Math.min(9, Math.floor((i - 6) / 2.2))], 0.6, pan(640 + Math.cos(Math.PI + u * Math.PI) * 300));
        odo(t + 0.004, 0.6, pan(640));
      }
      // 97%: beacon flash and ring (12.0-12.4) — the biggest hit
      k.play('impact', 12.0, { gain: 1.7 }); k.play('thud', 12.0, { f: 70, gain: 0.7 });
      ['C3', 'G3', 'C4', 'E4', 'G4'].forEach((n, i) => vibe(12.0 + i * 0.015, n, 1.0, (i - 2) * 0.2));
      brass(12.02, ['C3', 'E3', 'G3'], 0.6, 1.0, 0);
      k.noise(12.0, { dur: 1.4, color: 'pink', filter: 'highpass', f: 5000, gain: 0.05, a: 0.25, verb: 0.4 }); // cymbal shimmer

      // ---- scene 4: TAKEAWAY (t0 = 13.25): rays open (13.25-14.05), MORE EXAMPLES, arrow, BETTER GUESSES (13.6-13.9)
      const t4 = mid(DOORS[2]) + 0.2;
      gliss(t4 + 0.05, t4 + 0.6, ['C4', 'E4', 'G4', 'C5', 'E5'], 0.7, 0);
      ['C3', 'G3', 'E4', 'B4', 'D5'].forEach((n, i) => vibe(t4 + 0.62 + i * 0.05, n, 0.75 - i * 0.07, (i - 2) * 0.2)); // resolves on BETTER GUESSES
    },
    draw(ctx, W, HH, t) {
      const CX = W / 2;
      const P = (d, dur = 0.8) => H.ease.out(H.clamp((t - d) / dur, 0, 1));

      // ---------- lacquer black ground ----------
      const bg = ctx.createRadialGradient(CX, 420, 40, CX, 420, 820);
      bg.addColorStop(0, '#221a10'); bg.addColorStop(0.5, '#0f0c08'); bg.addColorStop(1, '#050403');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, HH);

      const M = H.layer(W, HH), m = M.getContext('2d');   // full-strength gold
      const Md = H.layer(W, HH), md = Md.getContext('2d'); // dim gold (rays)
      m.fillStyle = m.strokeStyle = '#fff'; md.fillStyle = md.strokeStyle = '#fff';

      // ---------- sunburst behind the tower ----------
      const sy = 540, open = H.ease.inOut(H.clamp((t - 1.3) / 1.1, 0, 1));
      const N = 40;
      md.save(); md.beginPath(); md.rect(34, 34, W - 68, sy - 34); md.clip();
      const fall = md.createRadialGradient(CX, sy, 280, CX, sy, 760);
      fall.addColorStop(0, 'rgba(255,255,255,0.55)'); fall.addColorStop(0.6, 'rgba(255,255,255,0.22)'); fall.addColorStop(1, 'rgba(255,255,255,0.04)');
      md.fillStyle = fall;
      for (let i = 0; i < N; i++) {
        const a0 = Math.PI + (i / N) * Math.PI, a1 = a0 + (Math.PI / N) * 0.42;
        const aa = Math.PI * 1.5 + (a0 - Math.PI * 1.5) * open, ab = Math.PI * 1.5 + (a1 - Math.PI * 1.5) * open;
        md.beginPath(); md.moveTo(CX, sy); md.arc(CX, sy, 900, aa, ab); md.closePath(); md.fill();
      }
      md.restore(); md.fillStyle = '#fff';
      md.globalAlpha = 1;
      // black disc mask so rays start from a halo
      md.globalCompositeOperation = 'destination-out'; md.beginPath(); md.arc(CX, sy, 300, 0, 7); md.fill(); md.globalCompositeOperation = 'source-over';
      // concentric fan arcs (scalloped halo)
      // halo arcs inscribe from both ends and meet at the top (symmetry)
      const arcIn = (r, p) => { if (p <= 0) return; m.beginPath(); m.arc(CX, sy, r, Math.PI, Math.PI + Math.PI / 2 * p); m.stroke(); m.beginPath(); m.arc(CX, sy, r, -Math.PI / 2 * p, 0); m.stroke(); };
      m.lineWidth = 3;
      for (let k = 0; k < 4; k++) arcIn(250 + k * 18, H.ease.inOut(H.clamp((t - 1.0 - k * 0.08) / 0.8, 0, 1)));
      m.lineWidth = 1.5; arcIn(330, H.ease.inOut(H.clamp((t - 1.3) / 0.8, 0, 1)));
      // scallop fan blades in the halo (pop on in pairs from the outside in)
      for (let i = 0; i < 12; i++) {
        if (t < 1.6 + Math.min(i, 11 - i) * 0.07) continue;
        const a = Math.PI + (i + 0.5) / 12 * Math.PI;
        m.beginPath(); m.moveTo(CX + Math.cos(a) * 304, sy + Math.sin(a) * 304);
        m.lineTo(CX + Math.cos(a - 0.05) * 330, sy + Math.sin(a - 0.05) * 330); m.lineTo(CX + Math.cos(a + 0.05) * 330, sy + Math.sin(a + 0.05) * 330); m.closePath(); m.fill();
      }

      // ---------- ziggurat of server racks ----------
      const BAY = 74; const tiers = [[6 * BAY + 12, 84], [5 * BAY + 12, 78], [4 * BAY + 12, 72], [3 * BAY + 12, 68], [2 * BAY + 12, 62], [BAY + 12, 56]];
      let y = sy;
      const tierBoxes = [];
      for (const [w, h] of tiers) { tierBoxes.push([CX - w / 2, y - h, w, h]); y -= h; }
      const topY = y;
      // black body (knock out rays behind the tower)
      const body = new Path2D();
      // tiers rise floor by floor (stepped), bottom first
      const tierP = tierBoxes.map((_, ti) => H.ease.out(H.clamp((t - 0.45 - ti * 0.17) / 0.22, 0, 1)));
      tierBoxes.forEach(([x, yy, w, h], ti) => { if (tierP[ti] > 0) body.rect(x, yy + h * (1 - tierP[ti]), w, h * tierP[ti] + 1); });
      md.globalCompositeOperation = 'destination-out'; md.fill(body); md.globalCompositeOperation = 'source-over';
      m.globalCompositeOperation = 'destination-out'; m.fill(body); m.globalCompositeOperation = 'source-over';
      const leds = [];
      tierBoxes.forEach(([x, yy, w, h], ti) => {
        if (tierP[ti] <= 0) return;
        m.save(); m.beginPath(); m.rect(x - 60, yy - 30 + (h + 30) * (1 - tierP[ti]), w + 120, (h + 30) * tierP[ti] + 2); m.clip();
        m.lineWidth = 3; m.strokeRect(x + 1.5, yy + 1.5, w - 3, h - 3);
        // pilasters
        const nP = Math.round((w - 12) / BAY);
        const bayW = (w - 12) / nP;
        for (let b = 0; b < nP; b++) {
          const bx = x + 6 + b * bayW;
          // rack units
          m.lineWidth = 1.2;
          for (let u = yy + 12; u < yy + h - 6; u += 9) { m.beginPath(); m.moveTo(bx + 6, u); m.lineTo(bx + bayW - 6, u); m.stroke(); }
          if (b > 0) { m.fillRect(bx - 2, yy + 4, 4, h - 8); }
          // LEDs
          if (t > 0.75 + ti * 0.17) for (let u = yy + 16, k = 0; u < yy + h - 6; u += 9, k++) leds.push([bx + bayW - 14, u - 4, ti * 31 + b * 7 + k]);
        }
        // stepped crown on each setback
        const cw = Math.min(46, w * 0.18);
        m.beginPath(); m.moveTo(CX - cw, yy); m.lineTo(CX - cw * 0.6, yy - 8); m.lineTo(CX - cw * 0.2, yy - 8); m.lineTo(CX, yy - 16); m.lineTo(CX + cw * 0.2, yy - 8); m.lineTo(CX + cw * 0.6, yy - 8); m.lineTo(CX + cw, yy); m.closePath(); m.fill();
        // chevrons on the setback ledges
        if (ti < tiers.length - 1) {
          const nw = tiers[ti + 1][0];
          for (const side of [-1, 1]) {
            const lx = CX + side * (nw / 2 + (w - nw) / 4);
            for (let k = 0; k < 3; k++) { m.beginPath(); m.moveTo(lx - 12, yy - 2 - k * 5); m.lineTo(lx, yy - 9 - k * 5); m.lineTo(lx + 12, yy - 2 - k * 5); m.lineWidth = 1.6; m.stroke(); }
          }
        }
        m.restore();
      });
      // spire
      const spP = H.ease.out(H.clamp((t - 1.5) / 0.6, 0, 1)), spTop = topY - 14 - 66 * spP;
      m.beginPath(); m.moveTo(CX - 14, topY - 14); m.lineTo(CX, spTop); m.lineTo(CX + 14, topY - 14); m.closePath(); m.fill();
      m.lineWidth = 2; for (let k = 0; k < 4; k++) { const yy = topY - 26 - k * 14; if (yy < spTop + 6) continue; m.beginPath(); m.moveTo(CX - 10 + k * 2, yy); m.lineTo(CX + 10 - k * 2, yy); m.stroke(); }
      // beacon star
      const beacon = (0.6 + 0.4 * Math.sin(t * 3.0)) * H.clamp((t - 2.1) / 0.3, 0, 1);
      m.save(); m.translate(CX, spTop - 6); { const bs = H.ease.back(H.clamp((t - 2.0) / 0.35, 0, 1)); m.scale(bs, bs); }
      for (let i = 0; i < 8; i++) { m.rotate(Math.PI / 4); m.beginPath(); m.moveTo(0, 0); m.lineTo(2.5, -6); m.lineTo(0, -(i % 2 ? 12 : 22)); m.lineTo(-2.5, -6); m.closePath(); m.fill(); }
      m.restore();

      // ---------- geometric border frame ----------
      const frame = (ins, lw) => {
        const s = 34; m.lineWidth = lw; m.setLineDash([4400 * H.ease.inOut(H.clamp((t - (lw > 2 ? 0 : 0.15)) / 1.1, 0, 1)) + 0.01, 5000]); m.beginPath();
        m.moveTo(ins + s, ins); m.lineTo(W - ins - s, ins); m.lineTo(W - ins - s, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s * 0.4); m.lineTo(W - ins - s * 0.4, ins + s); m.lineTo(W - ins, ins + s);
        m.lineTo(W - ins, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s); m.lineTo(W - ins - s * 0.4, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins - s * 0.4); m.lineTo(W - ins - s, HH - ins);
        m.lineTo(ins + s, HH - ins); m.lineTo(ins + s, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s * 0.4); m.lineTo(ins + s * 0.4, HH - ins - s); m.lineTo(ins, HH - ins - s);
        m.lineTo(ins, ins + s); m.lineTo(ins + s * 0.4, ins + s); m.lineTo(ins + s * 0.4, ins + s * 0.4); m.lineTo(ins + s, ins + s * 0.4); m.closePath(); m.stroke();
      };
      frame(20, 3); frame(30, 1.2); m.setLineDash([]);
      // corner fans
      for (const [fx, fy, a0] of [[30, 30, 0], [W - 30, 30, Math.PI / 2], [W - 30, HH - 30, Math.PI], [30, HH - 30, Math.PI * 1.5]]) {
        const fp = H.ease.out(H.clamp((t - 0.9) / 0.5, 0, 1)); if (fp <= 0) continue;
        m.save(); m.translate(fx, fy); m.scale(fp, fp); m.translate(-fx, -fy);
        m.lineWidth = 1.4;
        for (let k = 0; k < 3; k++) { m.beginPath(); m.arc(fx, fy, 58 + k * 12, a0 + 0.12, a0 + Math.PI / 2 - 0.12); m.stroke(); }
        for (let k = 0; k < 7; k++) { const a = a0 + 0.2 + (k / 6) * (Math.PI / 2 - 0.4); m.beginPath(); m.moveTo(fx + Math.cos(a) * 58, fy + Math.sin(a) * 58); m.lineTo(fx + Math.cos(a) * 82, fy + Math.sin(a) * 82); m.stroke(); }
        m.restore();
      }
      // side pilasters: triple fluted lines, stepped capital and a fan crown (symmetric)
      for (const side of [-1, 1]) {
        const x = CX + side * 470;
        const pp = H.ease.inOut(H.clamp((t - 0.7) / 0.8, 0, 1)); // pilasters grow up from their bases
        m.save(); m.beginPath(); m.rect(x - 50, 510 - 420 * pp, 100, 420 * pp); m.clip();
        m.fillRect(x - 2, 170, 4, 330); m.fillRect(x - 12, 186, 1.5, 300); m.fillRect(x + 10.5, 186, 1.5, 300);
        m.fillRect(x - 20, 500, 40, 4); m.fillRect(x - 14, 492, 28, 4); m.fillRect(x - 20, 166, 40, 4); m.fillRect(x - 14, 174, 28, 3);
        m.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) { m.beginPath(); m.arc(x, 160, 18 + k * 10, Math.PI, 0); m.stroke(); }
        for (let k = 0; k < 7; k++) { const a = Math.PI + (k + 0.5) / 7 * Math.PI; m.beginPath(); m.moveTo(x, 160); m.lineTo(x + Math.cos(a) * 38, 160 + Math.sin(a) * 38); m.stroke(); }
        m.beginPath(); m.moveTo(x, 104); m.lineTo(x + 8, 116); m.lineTo(x, 128); m.lineTo(x - 8, 116); m.closePath(); m.fill();
        // dangling beads
        for (let k = 0; k < 5; k++) { m.beginPath(); m.arc(x, 214 + k * 64, 3.2, 0, 7); m.fill(); }
        m.restore();
      }
      // ---------- title plaque ----------
      const ty = 628;
      m.font = '400 76px "Limelight"'; m.textAlign = 'center'; m.textBaseline = 'alphabetic'; m.letterSpacing = '6px';
      { // foil-stamped letter by letter
        const title = 'THE GOLDEN AGE'; m.textAlign = 'left';
        const x0 = CX + 3 - m.measureText(title).width / 2 + 3;
        for (let i = 0; i < title.length; i++) {
          const a = H.clamp((t - 2.25 - i * 0.055) / 0.12, 0, 1); if (a <= 0) continue;
          m.globalAlpha = a; m.fillText(title[i], x0 + m.measureText(title.slice(0, i)).width, ty);
        }
        m.globalAlpha = 1; m.textAlign = 'center';
      }
      // rule lines with diamonds
      const rp = H.ease.inOut(H.clamp((t - 1.9) / 0.6, 0, 1));
      m.fillRect(CX - (CX - 150) * rp, sy + 8, (W - 300) * rp, 2.5);
      if (rp >= 1) for (const x of [150, W - 150]) { m.beginPath(); m.moveTo(x, sy + 9); m.lineTo(x + (x < CX ? -10 : 10), sy + 1); m.lineTo(x + (x < CX ? -20 : 20), sy + 9); m.lineTo(x + (x < CX ? -10 : 10), sy + 17); m.closePath(); m.fill(); }

      // ---------- composite foil with bevel ----------
      const G = foil(W, HH, M, 6, t);
      
      // bevel: dark offset under, light offset over edge
      const tint = (src, col) => { const T = H.layer(W, HH), tc = T.getContext('2d'); tc.drawImage(src, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, W, HH); return T; };
      { // dim warm-gold rays (flat ink, not foil)
        const Gd = tint(Md, '#c08a34'); ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(Gd, 0, 0); ctx.restore(); }
      ctx.drawImage(tint(M, 'rgba(0,0,0,0.85)'), 1.5, 2);
      ctx.drawImage(G, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35; ctx.drawImage(tint(M, '#fff4cf'), -0.8, -0.8); ctx.drawImage(G, 0, 0); ctx.restore();

      // ---------- cream accents ----------
      ctx.fillStyle = CREAM; ctx.font = '400 30px "Poiret One"'; ctx.textAlign = 'left'; ctx.letterSpacing = '20px';
      ctx.globalAlpha = H.clamp((t - 3.05) / 0.4, 0, 1);
      const sub = 'OF COMPUTE', sw = ctx.measureText(sub).width - 20;
      ctx.fillText(sub, CX - sw / 2, ty + 46);
      ctx.letterSpacing = '0px';
      for (const s2 of [-1, 1]) {
        const x0 = CX + s2 * (sw / 2 + 26), x1 = CX + s2 * (sw / 2 + 170);
        ctx.fillRect(Math.min(x0, x1), ty + 34, Math.abs(x1 - x0), 1.5);
        ctx.beginPath(); ctx.moveTo(x1, ty + 29); ctx.lineTo(x1 + s2 * 6, ty + 35); ctx.lineTo(x1, ty + 41); ctx.lineTo(x1 - s2 * 6, ty + 35); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // LEDs: cream with glow, twinkling
      const step = Math.floor(t * 5);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      leds.forEach(([x, yy, id]) => {
        const r = H.rng(id * 977 + step * 13);
        const on = r() < 0.72; if (!on) return;
        const warm = r() < 0.25;
        const g2 = ctx.createRadialGradient(x, yy, 0, x, yy, 7);
        g2.addColorStop(0, warm ? 'rgba(255,200,120,0.55)' : 'rgba(255,240,205,0.4)'); g2.addColorStop(1, 'rgba(255,220,160,0)');
        ctx.fillStyle = g2; ctx.fillRect(x - 7, yy - 7, 14, 14);
      });
      ctx.restore();
      leds.forEach(([x, yy, id]) => { const r = H.rng(id * 977 + step * 13); if (r() < 0.72) { ctx.fillStyle = r() < 0.25 ? '#ffcf8a' : CREAM; ctx.fillRect(x - 1.5, yy - 1.5, 3, 3); } });
      // beacon glow
      const bgl = ctx.createRadialGradient(CX, spTop - 6, 0, CX, spTop - 6, 60);
      bgl.addColorStop(0, `rgba(255,236,190,${0.55 * beacon})`); bgl.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = bgl; ctx.fillRect(CX - 60, spTop - 66, 120, 120); ctx.restore();

      // ---------- print finish: subtle lacquer grain ----------
      H.grain(ctx, W, HH, 0.035, 3 + Math.floor(t * 12), true);
      H.vignette(ctx, W, HH, 0.45);
    },
  });
}
```
