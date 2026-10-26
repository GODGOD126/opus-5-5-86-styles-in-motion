I want an animated explainer made in the "Punk Zine Collage" visual style (Paper & Craft). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Abril Fatface, Anton, Archivo Black, Bebas Neue, Black Ops One, Courier Prime, DM Serif Display, Fraunces, Inter, Limelight, Oswald, Permanent Marker, Playfair Display, Rubik Mono One, Shrikhand, Special Elite, UnifrakturMaguntia
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Black+Ops+One&family=Courier+Prime&family=DM+Serif+Display:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@300;400;600;800&family=Limelight&family=Oswald:wght@400;700&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,400;0,800;1,400&family=Rubik+Mono+One&family=Shrikhand&family=Special+Elite&family=UnifrakturMaguntia&display=block">
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
Name: Punk Zine Collage
Family: Paper & Craft
Look: A photocopied cut-and-paste zine spread: torn halftone scraps, ransom-note letters cut from mismatched magazines, masking tape and staples, crushed to high-contrast black toner with one fluoro-pink spot ink overprinted off-register.
Motion: Scraps slam onto the page one per beat with a copier-flash flicker, ransom letters jitter in stop-motion, toner noise boils every frame.
How it explains: Shot on 8 fps steps, each beat is a new photocopied sheet slapped down over the last (copier flash on impact); arrows are marker scrawls, labels are typed strips and ransom letters pasted onto the thing they name, the counter is re-cut from magazine letters every time it ticks, and the wrong guess gets slashed with the pink spot ink.

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

REFERENCE STYLE SOURCE (styles/collage-zine.js; W/H_ are always 1280x720)
```js
{
  const TAU = Math.PI * 2;
  const SPOT = [255, 47, 109]; // fluoro pink, the one spot ink

  const RANSOM_FONTS = [
    '400 S "Anton"', '400 S "Abril Fatface"', '400 S "Bebas Neue"', '400 S "Archivo Black"', '800 S "Playfair Display"',
    'italic 400 S "Playfair Display"', '400 S "Special Elite"', '400 S "Courier Prime"', '400 S "UnifrakturMaguntia"',
    '400 S "Rubik Mono One"', '400 S "Shrikhand"', '400 S "DM Serif Display"', '700 S "Oswald"', '400 S "Black Ops One"',
    '900 S "Fraunces"', '800 S "Inter"', '400 S "Limelight"',
  ];

  // rectangle -> polygon with torn (noisy) or scissor-cut edges
  const scrapPoly = (r, nz, cx, cy, w, h, rot, torn = [1, 1, 1, 1], amp = 4) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    const corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    const out = [];
    const seed = r() * 100;
    for (let e = 0; e < 4; e++) {
      const [ax, ay] = corners[e], [bx, by] = corners[(e + 1) % 4];
      const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
      const step = torn[e] ? 3 : 18;
      for (let d = 0; d < len; d += step) {
        const u = d / len;
        let off = 0;
        if (torn[e]) off = nz.fbm2(seed + e * 10 + d * 0.035, seed, 4) * amp * 2.2 + (r() - 0.5) * 1.6;
        else off = (r() - 0.5) * 1.2 + (d === 0 ? 0 : 0);
        const px = ax + (bx - ax) * u + nx * off, py = ay + (by - ay) * u + ny * off;
        out.push([cx + px * c - py * s, cy + px * s + py * c]);
      }
    }
    return out;
  };
  const pathPoly = (c, p) => { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.closePath(); };

  // masking tape (drawn after the copier crush so it stays translucent grey); knocks the spot plate back a little
  const maskTape = (b, sp, r, nz, cx, cy, w, h, rot) => {
    const p = scrapPoly(r, nz, cx, cy, w, h, rot, [0, 1, 0, 1], 2.2);
    b.save(); b.translate(2, 2); pathPoly(b, p); b.strokeStyle = 'rgba(0,0,0,0.5)'; b.lineWidth = 1.5; b.stroke(); b.restore();
    b.save(); pathPoly(b, p); b.fillStyle = 'rgba(120,116,105,0.42)'; b.fill(); b.clip();
    const tr = H.rng(Math.round(cx * 7 + cy));
    { // fibre speckle, batched into one light and one dark path
      const lt = new Path2D(), dk = new Path2D();
      for (let i = 0; i < 900; i++) { const pth = tr() < 0.5 ? lt : dk; pth.rect(cx - w / 1.4 + tr() * w * 1.4, cy - w / 1.4 + tr() * w * 1.4, 1.2, 1.2); }
      b.fillStyle = 'rgba(255,255,255,0.35)'; b.fill(lt); b.fillStyle = 'rgba(0,0,0,0.35)'; b.fill(dk);
    }
    for (let i = 0; i < 14; i++) { b.fillStyle = `rgba(255,255,255,${tr.range(0.05, 0.12)})`; b.save(); b.translate(cx, cy); b.rotate(rot); b.fillRect(-w, -h / 2 + tr() * h, w * 2, tr.range(1, 3)); b.restore(); }
    b.restore();
    sp.save(); sp.globalAlpha = 0.35; sp.globalCompositeOperation = 'destination-out'; pathPoly(sp, p); sp.fill(); sp.restore();
    return p;
  };

  // halftone render of a greyscale function g(u,v)->0..1 (1=white)
  const halftone = (w, h, cell, ang, g) => {
    const cv = H.layer(w, h), x = cv.getContext('2d'), img = x.createImageData(w, h), d = img.data;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const rx = px * ca + py * sa, ry = -px * sa + py * ca;
      const gx = (Math.floor(rx / cell) + 0.5) * cell, gy = (Math.floor(ry / cell) + 0.5) * cell;
      const dist = Math.hypot(rx - gx, ry - gy);
      const D = 1 - g(px / w, py / h);
      const rad = cell * 0.74 * Math.sqrt(Math.max(0, D));
      const ink = H.clamp(rad - dist + 0.5);
      const k = (py * w + px) * 4, v = 255 * (1 - ink);
      d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return cv;
  };

  // =====================================================================
  // EXPLAINER: each beat is a new photocopied sheet slapped down over the
  // last (stop-motion at 8 fps). Arrows are marker, labels are typed strips
  // or ransom letters, numbers are re-cut ransom digits.
  // =====================================================================
  const ZC = {};
  const faceHT = (kind) => ZC['ht' + kind] || (ZC['ht' + kind] = halftone(200, 200, 5.5, 0.785, (u, v) => {
    const x = u - 0.5, y = v - 0.52;
    let g = 0.78 - 0.2 * v;
    const cat = kind === 'cat';
    const head = (x * x) / 0.1 + (y * y) / 0.085;
    if (cat) {
      const ear = (ex) => { const dx = x - ex, dy = y + 0.28; return dy < 0 && dy > -0.2 && Math.abs(dx) < (dy + 0.2) * 0.7; };
      if (ear(-0.2) || ear(0.2)) g = 0.35;
    } else {
      const ear = (ex) => ((x - ex) * (x - ex)) / 0.006 + ((y - 0.02) * (y - 0.02)) / 0.05 < 1;
      if (ear(-0.3) || ear(0.3)) g = 0.18;
    }
    if (head < 1) {
      g = (cat ? 0.64 : 0.72) + 0.12 * Math.sin(u * 40 + v * 13) * 0.3 - 0.25 * Math.max(0, x + y) ;
      if (((x + 0.12) ** 2) / 0.003 + ((y + 0.02) ** 2) / 0.004 < 1 || ((x - 0.12) ** 2) / 0.003 + ((y + 0.02) ** 2) / 0.004 < 1) g = 0.04;
      if (Math.hypot(x + 0.11, y + 0.04) < 0.018 || Math.hypot(x - 0.13, y + 0.04) < 0.018) g = 1;
      if (!cat && (x * x) / 0.02 + ((y - 0.13) ** 2) / 0.012 < 1) g = 0.9;
      if ((x * x) / 0.002 + ((y - 0.1) ** 2) / 0.0012 < 1) g = 0.05;
      if (cat && Math.abs(y - 0.12 - Math.abs(x) * 0.1) < 0.006 && Math.abs(x) > 0.07 && Math.abs(x) < 0.3) g = 0.1;
    }
    return H.clamp(g);
  }));

  // coarse 45-degree halftone screen (light dots) used to make solid fills read as printed matter
  const barScreen = (c) => {
    if (!ZC.scr) { const cv = H.layer(10, 10), x = cv.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); x.arc(5, 5, 1.45, 0, TAU); x.fill(); x.beginPath(); [[0, 0], [10, 0], [0, 10], [10, 10]].forEach(([a, bb]) => { x.moveTo(a + 1.45, bb); x.arc(a, bb, 1.45, 0, TAU); }); x.fill(); ZC.scr = cv; }
    return c.createPattern(ZC.scr, 'repeat'); // centre + corner dots = a 45-degree screen
  };
  const EXPLAIN = (ctx, W, H_, t) => {
    const nz = ZC.nz || (ZC.nz = H.makeNoise(13));
    const ts = Math.floor(t * 8) / 8, fr = Math.floor(t * 8), jr = H.rng(1000 + fr);
    const BW = ZC.BW || (ZC.BW = H.layer(W, H_)), SPL = ZC.SPL || (ZC.SPL = H.layer(W, H_));
    const b = BW.getContext('2d'), sp = SPL.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0); sp.setTransform(1, 0, 0, 1, 0, 0);
    sp.clearRect(0, 0, W, H_);
    const spotCol = H.rgba(SPOT, 1);
    const stepIn = (st) => ts + 1e-6 >= st;
    const prog = (a, d) => H.clamp((ts - a) / d);
    const occlude = (poly) => { sp.save(); sp.globalCompositeOperation = 'destination-out'; pathPoly(sp, poly); sp.fill(); sp.restore(); };
    // masking tape is laid on after the copier pass (like the still); a piece is dropped if a later scrap covers it
    const tapes = [];
    const pip = (x, y, P) => { let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins; } return ins; };
    const cull = (poly) => {
      if (!tapes.length) return;
      const m = b.getTransform(), P = poly.map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      for (let i = tapes.length - 1; i >= 0; i--) if (pip(tapes[i].dx, tapes[i].dy, P)) tapes.splice(i, 1);
    };
    const tape = (cx, cy, w, rot, seed, h = 30) => { const m = b.getTransform(); tapes.push({ m, cx, cy, w, h, rot, seed, dx: m.a * cx + m.c * cy + m.e, dy: m.b * cx + m.d * cy + m.f }); };
    const shadowP = (poly, dx = 2.5, dy = 2, a = 0.7) => { cull(poly); b.save(); b.translate(dx, dy); pathPoly(b, poly); b.fillStyle = `rgba(0,0,0,${a})`; b.fill(); b.restore(); };
    const both = (f) => { f(b); f(sp); };
    const slap = (st, cx, cy) => { const first = ts - st < 0.12, s1 = first ? 1.08 : 1, k = first ? 0.04 : 0; both((c) => { c.save(); c.translate(cx, cy); c.rotate(k); c.scale(s1, s1); c.translate(-cx, -cy); }); };
    const unslap = () => both((c) => c.restore());
    const scrap = (seed, cx, cy, w, h, rot, torn, fill) => { const r = H.rng(seed); const p = scrapPoly(r, nz, cx, cy, w, h, rot, torn, 4); shadowP(p); occlude(p); b.save(); pathPoly(b, p); b.fillStyle = fill || '#f4f2ec'; b.fill(); b.strokeStyle = 'rgba(0,0,0,0.75)'; b.lineWidth = 1.6; b.stroke(); b.restore(); return p; };
    const typed = (str, x, y, px = 26, rot = 0, seed = 1) => {
      b.save(); b.font = `400 ${px}px "Special Elite"`; const w = b.measureText(str).width; b.restore();
      const p = scrap(seed, x + w / 2 + 10, y - px * 0.3, w + 26, px * 1.5, rot, [0, 0, 0, 0], '#ece9e1');
      b.save(); b.translate(x + w / 2 + 10, y - px * 0.3); b.rotate(rot); b.fillStyle = '#151515'; b.font = `400 ${px}px "Special Elite"`; b.textBaseline = 'middle'; b.fillText(str, -w / 2, 2); b.restore();
      return p;
    };
    const ransom = (str, x, y, size, seed, stepStart = null) => {
      const rl = H.rng(seed); let cx = x, idx = 0;
      for (const ch0 of str) {
        if (ch0 === ' ') { cx += size * 0.35; continue; }
        const fnt = rl.pick(RANSOM_FONTS).replace('S', Math.round(size * rl.range(0.82, 1.1)) + 'px');
        const ch = rl.chance(0.25) && /[A-Z]/.test(ch0) ? ch0.toLowerCase() : ch0;
        b.font = fnt;
        const m = b.measureText(ch), gw = m.width, asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
        const padX = rl.range(5, 10), padY = rl.range(5, 9), tw = gw + padX * 2, th = asc + desc + padY * 2;
        const style = rl.pick(['white', 'white', 'black', 'spot', 'white', 'black']);
        const rot = rl.range(-0.12, 0.12) + (jr() - 0.5) * 0.04;
        const tcx = cx + tw / 2 + (jr() - 0.5) * 2, tcy = y + rl.range(-6, 6) + (jr() - 0.5) * 2;
        const tile = scrapPoly(rl, nz, tcx, tcy, tw, th, rot, [0, 0, 0, 0]);
        const vis = stepStart == null || stepIn(stepStart + idx * 0.0625);
        idx++;
        if (vis) {
          shadowP(tile, 2, 2, 0.75);
          b.save(); pathPoly(b, tile); b.fillStyle = style === 'black' ? '#141414' : '#f6f4ee'; b.fill(); b.clip();
          b.translate(tcx, tcy); b.rotate(rot); b.fillStyle = style === 'black' ? '#f6f4ee' : '#111'; b.textBaseline = 'alphabetic';
          b.font = fnt; b.fillText(ch, -gw / 2, (asc - desc) / 2); b.restore();
          if (style === 'spot') { pathPoly(sp, tile); sp.fillStyle = spotCol; sp.fill(); } else occlude(tile);
        }
        cx += tw + rl.range(-3, 4);
      }
      return cx;
    };
    const marker = (c, pts, p, col, wdt = 7, head = true) => { // hand-drawn marker line, revealed in steps
      if (p <= 0) return;
      const n = Math.max(2, Math.ceil(pts.length * p));
      c.save(); c.strokeStyle = col; c.lineWidth = wdt; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = pts[i]; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      if (head && p >= 1) { const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[Math.max(0, pts.length - 3)], a = Math.atan2(y1 - y0, x1 - x0); c.beginPath(); c.moveTo(x1 + Math.cos(a + 2.5) * 26, y1 + Math.sin(a + 2.5) * 26); c.lineTo(x1, y1); c.lineTo(x1 + Math.cos(a - 2.5) * 26, y1 + Math.sin(a - 2.5) * 26); c.stroke(); }
      c.restore();
    };
    const curve = (ax, ay, cx, cy, bx, by, seed) => { const r = H.rng(seed), pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx + (r() - 0.5) * 2, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by + (r() - 0.5) * 2]); } return pts; };
    const scrawl = (str, x, y, px, rot, col = '#111') => { b.save(); b.translate(x, y); b.rotate(rot); b.fillStyle = col; b.font = `400 ${px}px "Permanent Marker"`; b.fillText(str, 0, 0); b.restore(); };
    const photo = (kind, cx, cy, s, rot, seed, label = true) => {
      const p = scrap(seed, cx, cy, 170 * s, 170 * s, rot, [1, 0, 1, 0]);
      b.save(); pathPoly(b, p); b.clip(); b.translate(cx, cy); b.rotate(rot); b.drawImage(faceHT(kind), -100 * s, -100 * s, 200 * s, 200 * s); b.restore();
      tape(cx + 86 * s * Math.sin(rot), cy - 86 * s * Math.cos(rot), 80 * s, rot + ((seed % 5) - 2) * 0.07, seed * 3 + 1, 26 * Math.max(1, s * 0.9));
      if (label) typed(kind, cx - 34, cy + 92 * s, 30, -rot * 0.6, seed + 1);
    };
    const circuit = (cx, cy, w, h, rot, knobAng) => {
      const p = scrap(77, cx, cy, w, h, rot, [0, 1, 0, 1], '#111');
      b.save(); pathPoly(b, p); b.clip(); b.translate(cx, cy); b.rotate(rot);
      b.strokeStyle = '#eee'; b.lineWidth = 3; b.lineJoin = 'round';
      const rr = H.rng(5);
      for (let i = 0; i < 12; i++) {
        let x = rr.range(-w * 0.45, w * 0.45), y = rr.range(-h * 0.45, h * 0.45); b.beginPath(); b.moveTo(x, y);
        for (let k = 0; k < 3; k++) { const L = rr.range(15, 50), dir = rr.int(0, 3); if (dir === 0) x += L; else if (dir === 1) y += L; else if (dir === 2) { x += L * 0.7; y += L * 0.7; } else { x -= L * 0.7; y += L * 0.7; } b.lineTo(x, y); }
        b.stroke(); b.fillStyle = '#eee'; b.beginPath(); b.arc(x, y, 4, 0, TAU); b.fill();
      }
      b.fillStyle = '#eee'; b.fillRect(-36, -40, 72, 52); b.fillStyle = '#111'; b.fillRect(-29, -33, 58, 38);
      if (knobAng) knobAng.forEach((a, i) => { const kx = -60 + i * 60, ky = h * 0.3; b.fillStyle = '#eee'; b.beginPath(); b.arc(kx, ky, 17, 0, TAU); b.fill(); b.strokeStyle = '#111'; b.lineWidth = 5; b.beginPath(); b.moveTo(kx, ky); b.lineTo(kx + Math.sin(a) * 14, ky - Math.cos(a) * 14); b.stroke(); });
      b.restore();
      const cc = Math.cos(rot), ss = Math.sin(rot), at = (lx, ly) => [cx + lx * cc - ly * ss, cy + lx * ss + ly * cc];
      const [ax, ay] = at(-w / 2 + 8, -h / 2 + 6), [bx, by] = at(w / 2 - 8, h / 2 - 6);
      tape(ax, ay, 112, rot - 0.75, Math.round(cx) + 7);
      tape(bx, by, 104, rot - 0.62, Math.round(cx) + 8);
    };
    let flash = false;
    const sheet = (st, top, seed, rot) => {
      if (!stepIn(st)) return false;
      if (ts - st < 0.12) flash = true;
      slap(st, 640, 400);
      const p = scrapPoly(H.rng(seed), nz, 640, (top + 760) / 2, 1360, 760 - top, rot, [1, 0, 0, 0], 7);
      shadowP(p, 3, 4, 0.6); occlude(p);
      b.save(); pathPoly(b, p); b.fillStyle = '#f4f2ec'; b.fill(); b.clip();
      if (seed === 12) { b.fillStyle = '#555'; for (let y = top; y < 760; y += 11) for (let x = (y % 22 ? 0 : 5.5); x < W; x += 11) { b.beginPath(); b.arc(x, y, 1.25, 0, TAU); b.fill(); } }
      if (seed === 13) { b.strokeStyle = '#6a6a6a'; b.lineWidth = 1.5; for (let y = top + 40; y < 760; y += 30) { b.beginPath(); b.moveTo(0, y); b.lineTo(W, y); b.stroke(); } b.strokeStyle = '#555'; b.beginPath(); b.moveTo(52, top); b.lineTo(52, 760); b.stroke(); }
      b.restore();
      b.save(); pathPoly(b, p); b.strokeStyle = '#111'; b.lineWidth = 3; b.stroke(); b.restore();
      return true;
    };

    // ---- page 0: the question ----
    b.fillStyle = '#f4f2ec'; b.fillRect(0, 0, W, H_);
    {
      const p = scrapPoly(H.rng(3), nz, 640, 330, 1500, 230, -0.12, [1, 0, 1, 0], 6);
      // the band is a pink-printed strip: its copier shadow falls on the page, the strip itself is clean paper under the spot
      if (stepIn(0.0)) { shadowP(p, 3, 3, 0.5); b.save(); pathPoly(b, p); b.fillStyle = '#f4f2ec'; b.fill(); b.restore(); pathPoly(sp, p); sp.fillStyle = spotCol; sp.fill(); tape(112, 280, 100, 1.32, 31, 40); tape(1186, 380, 100, 1.66, 32, 40); }
      ransom('HOW DOES', 250, 250, 104, 4242, 0.125);
      ransom('AI LEARN?', 210, 410, 118, 4343, 0.625);
    }
    // ---- page 1: data (slapped at 2.0) ----
    if (sheet(2.0, -20, 11, -0.006)) {
      typed('how does AI learn?', 36, 46, 28, -0.02, 5);
      tape(30, 22, 54, -0.7, 15, 22);
      // counter: digits re-cut from magazines every time they change
      const n = Math.round(1e6 * Math.pow(prog(2.5, 2.6), 2)), str = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const end = ransom(str, 70, 150, 74, 900 + n % 997);
      typed('examples', end + 8, 160, 34, 0.02, 6);
      // photos travel along the marker arrow into the model
      marker(b, curve(90, 600, 450, 640, 840, 560, 3), prog(2.3, 0.5), '#111', 8);
      const kinds = ['cat', 'dog', 'cat', 'dog', 'dog', 'cat', 'dog', 'cat'];
      kinds.forEach((k, i) => {
        const s0 = 2.3 + i * 0.4, x = -80 + (ts - s0) * 420;
        if (ts < s0 || x > 900) return;
        const bob = (Math.floor((ts - s0) * 8) % 2) * 4;
        photo(k, x, 380 + bob + ((i * 37) % 30) - 15, 0.9, ((i * 53) % 20) / 100 - 0.1, 200 + i);
      });
      // model is drawn last so photos disappear into it
      circuit(1040, 420, 320, 280, 0.05, [0.3, -0.8, 1.2]);
      ransom('MODEL', 900, 220, 46, 77, 2.25);
      unslap();
    }
    // ---- page 2: guess / check / adjust (slapped at 6.0) ----
    if (sheet(6.0, 96, 12, 0.008)) {
      if (stepIn(6.25)) photo('cat', 200, 390, 1.25, -0.05, 301, false);
      if (stepIn(6.25)) typed('new photo', 110, 540, 28, 0.03, 302);
      marker(b, curve(320, 390, 380, 370, 450, 385, 4), prog(6.5, 0.25), '#111');
      const adj = prog(8.9, 0.5);
      if (stepIn(6.375)) { circuit(610, 390, 260, 230, -0.04, [0.3 + adj * 1.6, -0.8 - adj * 1.2, 1.2 + adj * 2]); typed('model', 555, 285, 30, -0.04, 303); }
      marker(b, curve(760, 380, 820, 340, 880, 370, 5), prog(6.875, 0.25), '#111');
      if (stepIn(7.0)) scrawl('guess', 770, 330, 34, -0.12);
      if (stepIn(7.25)) {
        const bp = scrap(310, 1060, 380, 330, 210, 0.04, [0, 0, 0, 0], '#f6f4ee');
        b.save(); b.beginPath(); b.moveTo(950, 460); b.lineTo(915, 520); b.lineTo(1000, 470); b.closePath(); b.fillStyle = '#f6f4ee'; b.fill(); b.strokeStyle = '#111'; b.lineWidth = 2; b.stroke(); b.restore();
        void bp;
        tape(1056, 276, 112, 0.11, 312);
        ransom('DOG?', 945, 385, 92, 311, 7.25);
      }
      // wrong! big spot-ink X slashed over the guess + rubber stamp
      if (ts < 9.6) {
        marker(sp, curve(940, 290, 1060, 380, 1190, 480, 6), prog(7.875, 0.25), spotCol, 22, false);
        marker(sp, curve(1190, 280, 1070, 380, 930, 480, 7), prog(8.0, 0.25), spotCol, 22, false);
        if (stepIn(8.125)) { b.save(); b.translate(1080, 560); b.rotate(-0.12); b.strokeStyle = '#111'; b.lineWidth = 5; b.strokeRect(-95, -34, 190, 64); b.font = '400 46px "Black Ops One"'; b.fillStyle = '#111'; b.textAlign = 'center'; b.fillText('CHECK', 0, 14); b.restore(); }
        marker(b, curve(980, 610, 820, 690, 650, 540, 8), prog(8.375, 0.375), '#111');
        if (stepIn(8.625)) scrawl('adjust!', 720, 680, 38, -0.05);
      } else {
        // a fresh scrap with the right answer is pasted over the wrong one
        scrap(320, 1060, 375, 300, 180, -0.05, [1, 1, 1, 1], '#f6f4ee');
        tape(1202, 456, 92, -0.68, 322);
        ransom('CAT', 975, 385, 100, 321, 9.625);
        marker(b, [[1190, 380], [1210, 410], [1250, 330]], prog(9.875, 0.125), '#111', 12, false);
      }
      unslap();
    }
    // ---- page 3: progress (slapped at 10.375) ----
    if (sheet(10.375, 96, 13, -0.01)) {
      // photocopied graph paper scrap
      const gp = scrap(400, 560, 420, 760, 400, 0.02, [1, 0, 1, 0], '#f1efe8');
      b.save(); pathPoly(b, gp); b.clip(); b.strokeStyle = 'rgba(0,0,0,0.35)'; b.lineWidth = 1;
      for (let x = 160; x < 960; x += 24) { b.beginPath(); b.moveTo(x, 200); b.lineTo(x, 640); b.stroke(); }
      for (let y = 210; y < 640; y += 24) { b.beginPath(); b.moveTo(160, y); b.lineTo(960, y); b.stroke(); }
      b.restore();
      tape(176, 228, 112, -0.7, 402);
      tape(942, 236, 112, 0.7, 403);
      const accs = [61, 72, 80, 86, 90, 93, 95, 97];
      let shown = 61;
      accs.forEach((a, i) => {
        const st = 10.75 + i * 0.25, u = prog(st, 0.25);
        if (u <= 0) return;
        const hgt = a * 3.4 * u, x = 230 + i * 86;
        // each bar is a strip torn from printed matter: ragged on all sides, screened with a coarse halftone
        const p = scrapPoly(H.rng(500 + i), nz, x, 590 - hgt / 2, 58, hgt, ((i * 37) % 10) / 200 - 0.025, [1, 1, 1, 1], 2.2);
        shadowP(p, 2, 2, 0.6);
        const scr = barScreen(b);
        if (i % 2 || i === 7) {
          pathPoly(sp, p); sp.fillStyle = spotCol; sp.fill();
          sp.save(); pathPoly(sp, p); sp.clip(); sp.globalCompositeOperation = 'destination-out'; sp.globalAlpha = 0.9; sp.fillStyle = scr; sp.fillRect(x - 60, 150, 120, 460); sp.restore();
          b.save(); pathPoly(b, p); b.fillStyle = '#f4f2ec'; b.fill(); b.restore();
        } else {
          occlude(p); b.save(); pathPoly(b, p); b.fillStyle = '#151515'; b.fill(); b.clip(); b.fillStyle = scr; b.fillRect(x - 60, 150, 120, 460); b.restore();
        }
        shown = H.lerp(i ? accs[i - 1] : 61, a, u);
      });
      marker(b, [[180, 600], [960, 596]], prog(10.625, 0.25), '#111', 6);
      if (stepIn(10.75)) typed('training rounds', 600, 640, 28, 0.01, 401);
      ransom('ACCURACY', 60, 160, 58, 410, 10.5);
      const v = Math.round(shown), endX = ransom(v + '%', 640, 160, 96, 950 + v);
      if (stepIn(12.75)) marker(sp, (() => { const pts = []; for (let i = 0; i <= 26; i++) { const a = -2.4 + (i / 26) * (TAU + 0.5); pts.push([(640 + endX) / 2 + Math.cos(a) * ((endX - 640) / 2 + 40 + i * 0.6), 160 + Math.sin(a) * 72]); } return pts; })(), prog(12.75, 0.375), spotCol, 9, false);
      void endX;
      unslap();
    }
    // ---- takeaway strip (13.0) ----
    if (stepIn(13.0)) {
      slap(13.0, 640, 600);
      const p = scrapPoly(H.rng(600), nz, 660, 600, 1020, 210, -0.02, [1, 1, 1, 1], 5);
      shadowP(p, 4, 5, 0.75); occlude(p); b.save(); pathPoly(b, p); b.fillStyle = '#f6f4ee'; b.fill(); b.strokeStyle = '#111'; b.lineWidth = 2; b.stroke(); b.restore();
      const e1 = ransom('MORE EXAMPLES', 200, 548, 54, 610, 13.0);
      marker(b, [[e1 + 14, 548], [e1 + 90, 548]], prog(13.5, 0.125), '#111', 9);
      ransom('BETTER GUESSES', 300, 648, 54, 620, 13.625);
      tape(150, 506, 104, -0.7, 601);
      tape(1166, 488, 104, 0.66, 602);
      // the finished zine gets stapled (the stapler hit in the score at 14.5)
      if (stepIn(14.5)) [[180, 602, -0.08], [1118, 588, 0.1]].forEach(([x, y, a]) => {
        b.save(); b.translate(x, y); b.rotate(a); b.scale(1.25, 1.25);
        b.fillStyle = 'rgba(0,0,0,0.7)'; b.fillRect(-21, 3, 42, 5);
        const g = b.createLinearGradient(0, -2, 0, 3); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#9a9a9a'); g.addColorStop(1, '#333');
        b.fillStyle = g; b.fillRect(-20, -2, 40, 6);
        b.fillStyle = '#111'; b.fillRect(-22, -3, 4, 8); b.fillRect(18, -3, 4, 8);
        b.restore();
      });
      unslap();
    }

    // ---- photocopier crush + spot grain (as in the still) ----
    b.setTransform(1, 0, 0, 1, 0, 0);
    { // toner smudges on the copier glass (same as the still)
      const rs = H.rng(909);
      for (let i = 0; i < 5; i++) {
        const x = rs.range(0, W), y = rs.range(0, H_), R0 = rs.range(30, 90);
        const g = b.createRadialGradient(x, y, 0, x, y, R0);
        g.addColorStop(0, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        b.fillStyle = g; b.fillRect(x - R0, y - R0, R0 * 2, R0 * 2);
      }
    }
    {
      const img = b.getImageData(0, 0, W, H_), d = img.data, rn = H.rng(31 + fr);
      // static part of the copier: low-frequency toner mottle, drum streaks, dark lead edges (cached once)
      const bias = ZC.bias && ZC.biasW === W ? ZC.bias : (ZC.biasW = W, ZC.bias = (() => {
        const s = new Float32Array(W), rs = H.rng(77); for (let i = 0; i < 9; i++) { const x0 = rs.int(0, W - 1), wdt = rs.int(1, 4), a = rs.range(0.05, 0.16); for (let k = 0; k < wdt; k++) if (x0 + k < W) s[x0 + k] += a; }
        const out = new Float32Array(W * H_);
        for (let y = 0; y < H_; y++) {
          const edge = Math.max(0, 1 - y / 40) * 0.25 + Math.max(0, (y - H_ + 50) / 50) * 0.2;
          for (let x = 0; x < W; x++) out[y * W + x] = nz.n2(x * 0.012, y * 0.012) * 0.06 - s[x] - edge - Math.max(0, 1 - x / 30) * 0.3;
        }
        return out;
      })());
      for (let i = 0, k = 0, n = W * H_; i < n; i++, k += 4) {
        const L = d[k] / 255 + (rn() - 0.5) * 0.22 + bias[i];
        let v = H.smooth(0.32, 0.62, L);
        if (v > 0.6 && rn() < 0.0025) v = 0.1;
        if (v < 0.4 && rn() < 0.01) v = 0.7;
        v = 0.06 + v * 0.9;
        d[k] = 255 * v; d[k + 1] = 255 * v * 0.995; d[k + 2] = 255 * v * 0.975;
      }
      b.putImageData(img, 0, 0);
      const si = sp.getImageData(0, 0, W, H_), sd = si.data, rs2 = H.rng(55 + fr);
      for (let i = 3; i < sd.length; i += 4) { if (!sd[i]) continue; const x = ((i - 3) / 4) % W, y = ((i - 3) / 4 / W) | 0; sd[i] *= H.clamp(0.82 + nz.n2(x * 0.02 + 40, y * 0.02) * 0.2 + (rs2() - 0.5) * 0.35); }
      sp.putImageData(si, 0, 0);
    }
    // tape goes on last, over the copy, so it keeps its translucent grey
    // each piece is rendered once into a small sprite (cached by its seed and shape) and stamped where its owner is
    const TS = ZC.tapeS || (ZC.tapeS = {}), dummy = ZC.tapeDummy || (ZC.tapeDummy = H.layer(2, 2).getContext('2d'));
    for (const tp of tapes) {
      const key = tp.seed + '|' + tp.w + '|' + tp.h + '|' + tp.rot;
      let spr = TS[key];
      if (!spr) {
        const S2 = Math.ceil(tp.w + tp.h + 24), cv = H.layer(S2, S2), c = cv.getContext('2d');
        const poly = maskTape(c, dummy, H.rng(tp.seed), nz, S2 / 2, S2 / 2, tp.w, tp.h, tp.rot);
        spr = TS[key] = { cv, S2, poly: poly.map(([x, y]) => [x - S2 / 2, y - S2 / 2]) };
      }
      b.setTransform(tp.m); b.drawImage(spr.cv, tp.cx - spr.S2 / 2, tp.cy - spr.S2 / 2);
      sp.setTransform(tp.m); sp.translate(tp.cx, tp.cy);
      sp.save(); sp.globalAlpha = 0.35; sp.globalCompositeOperation = 'destination-out'; pathPoly(sp, spr.poly); sp.fill(); sp.restore();
    }
    b.setTransform(1, 0, 0, 1, 0, 0); sp.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(BW, 0, 0);
    const wob = H.rng(300 + fr);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(SPL, 4 + Math.round((wob() - 0.5) * 2), -3 + Math.round((wob() - 0.5) * 2)); ctx.restore();
    if (flash) { ctx.fillStyle = 'rgba(255,255,250,0.22)'; ctx.fillRect(0, 0, W, H_); }
  };

  registerStyle({
    id: 'collage-zine',
    name: 'Punk Zine Collage',
    category: 'Paper & Craft',
    description: 'A photocopied cut-and-paste zine spread: torn halftone scraps, ransom-note letters cut from mismatched magazines, masking tape and staples, crushed to high-contrast black toner with one fluoro-pink spot ink overprinted off-register.',
    motion: 'Scraps slam onto the page one per beat with a copier-flash flicker, ransom letters jitter in stop-motion, toner noise boils every frame.',
    fonts: [...RANSOM_FONTS.map((f) => f.replace('S', '64px')), '400 17px "Special Elite"', '400 30px "Permanent Marker"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Shot on 8 fps steps, each beat is a new photocopied sheet slapped down over the last (copier flash on impact); arrows are marker scrawls, labels are typed strips and ransom letters pasted onto the thing they name, the counter is re-cut from magazine letters every time it ticks, and the wrong guess gets slashed with the pink spot ink.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: a zine made at the copy shop. Everything lives on the 8 fps step grid (an event at time s shows on the first
    // frame >= s), so every sound is quantised the same way. New pages are copies slapped down with the copier's
    // ka-chunk; ransom letters are glued on with a pat; the counter digits are re-cut with scissors (one snip per change);
    // photos are taped on; arrows are marker; CHECK is a rubber stamp; the finished zine gets stapled.
    // Times mirror EXPLAIN() above (sheets 2.0 / 6.0 / 10.375 / 13.0, ransom letters stepStart + idx*0.0625).
    explainerSound(k) {
      const q = (s) => Math.ceil(s * 8 - 1e-6) / 8; // first 8 fps frame that shows an event scheduled at s
      const pan = (x) => H.clamp((x / 1280) * 2 - 1, -1, 1) * 0.6;
      const pat = (t, g = 1, p = 0, minor = true) => { // glued scrap pressed down
        k.noise(t, { dur: 0.025, filter: 'bandpass', f: 1400, q: 1, gain: 0.22 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.06, color: 'brown', filter: 'lowpass', f: 520, gain: 0.3 * g, a: 0.002, pan: p, minor });
      };
      const snip = (t, g = 1, p = 0) => { // scissors through magazine paper
        k.noise(t, { dur: 0.018, filter: 'bandpass', f: 2100, q: 2, gain: 0.22 * g, a: 0.001, pan: p, minor: true });
        k.noise(t + 0.022, { dur: 0.03, filter: 'bandpass', f: 1500, q: 1.6, gain: 0.2 * g, a: 0.001, pan: p, minor: true });
      };
      const tapeOn = (t, p = 0) => { // a strip of tape pulled off the roll and smoothed down over a photo
        k.play('tape', t, { dur: 0.2, gain: 1.5, pan: p, minor: true });
        k.noise(t, { dur: 0.16, filter: 'bandpass', f: [[0, 1100], [0.16, 1700]], q: 0.7, gain: 0.12, a: 0.01, hold: 0.07, pan: p, minor: true });
      };
      // ransom letters: glue pats on the frames where new letters appear (two letters per frame at 0.0625 spacing)
      const letters = (st, n, x0, x1, g = 0.7) => {
        const frames = [...new Set(Array.from({ length: n }, (_, i) => q(st + i * 0.0625)))];
        frames.forEach((t, j) => pat(t, g, pan(x0 + ((x1 - x0) * j) / Math.max(1, frames.length - 1))));
      };
      // a copied page slapped onto the pile, copier flash: slap + low ka-chunk + a short lamp/roller tail
      const page = (t, g = 1) => {
        k.play('slap', t, { gain: 1.05 * g });
        k.play('thud', t, { f: 105, gain: 0.75 * g });
        k.noise(t + 0.03, { dur: 0.35, color: 'brown', filter: 'bandpass', f: 260, q: 1.2, gain: 0.16 * g, a: 0.04, hold: 0.15 });
      };

      k.bed('room', 0, 15, { gain: 0.3 });
      k.bed('hum', 0, 15, { gain: 0.1 }); // the copier idling

      // ---- page 0: pink band, then the question pasted letter by letter
      pat(0.0, 1.0, 0, false);
      letters(0.125, 7, 250, 980, 0.75);
      letters(0.625, 8, 210, 1060, 0.8);

      // ---- page 1: data
      page(2.0);
      letters(2.25, 5, 900, 1180, 0.6); // MODEL
      k.play('stroke', 2.3, { material: 'marker', dur: 0.5, gain: 1.2, pan: pan(450), minor: true }); // arrow (stepped reveal)
      [2.3, 2.7, 3.1, 3.5, 3.9, 4.3, 4.7, 5.1].forEach((s0) => tapeOn(q(s0), pan(0))); // photos taped on
      // counter re-cut on every frame it changes (n = 1e6 * prog(2.5, 2.6)^2): 2.625 .. 5.0, then 1,000,000 glued down
      for (let t = 2.625; t < 5.1; t += 0.125) snip(t, 0.75, pan(250));
      pat(5.125, 1.4, pan(250), false);
      k.play('tock', 5.125, { f: 300, gain: 0.35, pan: pan(250) });

      // ---- page 2: guess / check / adjust
      page(6.0);
      tapeOn(6.25, pan(200)); // new photo
      pat(6.375, 0.8, pan(610)); // model scrap
      k.play('stroke', 6.5, { material: 'marker', dur: 0.25, gain: 1.0, pan: pan(380), minor: true });
      k.play('stroke', 6.875, { material: 'marker', dur: 0.25, gain: 0.7, pan: pan(820), minor: true });
      k.play('stroke', 7.0, { material: 'marker', dur: 0.12, gain: 0.9, pan: pan(800), minor: true }); // 'guess' scrawl
      pat(7.25, 0.9, pan(1060)); letters(7.25, 4, 945, 1180, 0.6); // bubble scrap + DOG?
      // wrong: two fat spot-ink slashes, then the CHECK rubber stamp
      k.play('stroke', 7.875, { material: 'sharpie', dur: 0.25, gain: 1.5, pan: pan(1060) });
      k.play('stroke', 8.0, { material: 'sharpie', dur: 0.25, gain: 1.5, pan: pan(1060) });
      k.tone(7.88, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 });
      k.tone(8.04, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.22, filter: 'lowpass', f2: 600 });
      k.play('stamp', 8.125, { gain: 0.85, pan: pan(1080) });
      k.play('stroke', 8.375, { material: 'marker', dur: 0.375, gain: 0.8, pan: pan(820), minor: true }); // arrow back
      k.play('stroke', 8.625, { material: 'marker', dur: 0.15, gain: 0.9, pan: pan(720), minor: true }); // 'adjust!'
      for (let t = 9.0; t < 9.45; t += 0.125) k.play('click', t, { f: 900, gain: 0.5, pan: pan(610), minor: true }); // knobs turned (prog(8.9, 0.5) steps)
      // correction: fresh scrap pasted over, CAT glued, marker tick
      pat(9.625, 1.3, pan(1060), false);
      letters(9.75, 2, 1000, 1080, 0.6);
      k.play('stroke', 9.875, { material: 'marker', dur: 0.13, gain: 1.0, pan: pan(1220), minor: true });
      k.play('success', 9.875, { f: 'G5', gain: 0.45, pan: pan(1200) });

      // ---- page 3: progress
      page(10.375);
      letters(10.5, 8, 60, 520, 0.55); // ACCURACY
      k.play('stroke', 10.625, { material: 'marker', dur: 0.25, gain: 0.9, minor: true }); // axis
      pat(10.75, 0.6, pan(600)); // training rounds strip
      for (let i = 0; i < 8; i++) { const st = 10.75 + i * 0.25; k.noise(q(st), { dur: 0.12, filter: 'bandpass', f: 1300, q: 0.8, gain: 0.12, a: 0.01, pan: pan(230 + i * 86), minor: true }); } // torn bar strips
      for (let t = 10.875; t < 12.75; t += 0.125) snip(t, 0.6, pan(700)); // % re-cut each frame
      // 97% (12.75): spot-ink circle slashed round it, slammed with the copier (biggest hit)
      k.play('impact', 12.75, { gain: 1.1 });
      k.play('stamp', 12.75, { gain: 0.7, pan: pan(700) });
      k.play('stroke', 12.76, { material: 'sharpie', dur: 0.375, gain: 1.0, pan: pan(700), minor: true });

      // ---- takeaway strip slapped on, glued, stapled
      page(13.0, 0.85);
      letters(13.0, 12, 200, 900, 0.55);
      k.play('stroke', 13.5, { material: 'marker', dur: 0.125, gain: 0.6, minor: true });
      letters(13.625, 13, 300, 1000, 0.55);
      k.play('press', 14.5, { gain: 0.32 }); // stapler
      k.noise(14.51, { dur: 0.02, filter: 'bandpass', f: 1900, q: 3, gain: 0.25 });
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 14.6 + i * 0.07, { f, gain: 0.34 - i * 0.03, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const r = H.rng(666), nz = H.makeNoise(13);
      const BW = H.layer(W, H_), SPL = H.layer(W, H_);
      const realB = BW.getContext('2d'), realSp = SPL.getContext('2d');
      const dumB = H.layer(2, 2).getContext('2d'), dumSp = H.layer(2, 2).getContext('2d');
      let b = realB, sp = realSp;
      // stop-motion build on 8 fps steps: each piece slaps down (oversized + kicked on its first step), then sits
      const ts = Math.floor(t * 8) / 8;
      const flashes = [];
      const show = (st, cx, cy, big) => {
        if (ts + 1e-6 < st) { b = dumB; sp = dumSp; return; }
        b = realB; sp = realSp;
        const first = ts - st < 0.12, s1 = first ? 1.1 : 1, k = first ? 0.05 * (((st * 8) % 2) ? 1 : -1) : 0;
        if (first && big) flashes.push(1);
        [b, sp].forEach((c) => { c.save(); c.translate(cx, cy); c.rotate(k); c.scale(s1, s1); c.translate(-cx, -cy); });
      };
      const hide = () => { if (b === realB) { realB.restore(); realSp.restore(); } b = realB; sp = realSp; };
      const spotCol = H.rgba(SPOT, 1);
      // stop-motion jitter: changes every 1/8 s
      const fr = Math.floor(t * 8), jr = H.rng(1000 + fr);

      // ---------- paper ----------
      b.fillStyle = '#f4f2ec'; b.fillRect(0, 0, W, H_);

      const occlude = (poly) => { sp.save(); sp.globalCompositeOperation = 'destination-out'; pathPoly(sp, poly); sp.fill(); sp.restore(); };
      const copierShadow = (poly, dx = 2.5, dy = 2, a = 0.7) => {
        b.save(); b.translate(dx, dy); pathPoly(b, poly); b.fillStyle = `rgba(0,0,0,${a})`; b.fill(); b.restore();
      };

      // ---------- spot: big torn pink strip ----------
      {
        show(0.125, 560, 420, true);
        const p = scrapPoly(r, nz, 560, 420, 1500, 210, -0.32, [1, 0, 1, 0], 6);
        copierShadow(p, 3, 3, 0.5);
        b.save(); pathPoly(b, p); b.fillStyle = '#f4f2ec'; b.fill(); b.restore();
        pathPoly(sp, p); sp.fillStyle = spotCol; sp.fill();
        hide();
      }

      // ---------- circuit scrap (black with white traces) ----------
      {
        const cx = 1090, cy = 130, w = 330, h = 230, rot = 0.09;
        show(0.625, cx, cy, true);
        const p = scrapPoly(r, nz, cx, cy, w, h, rot, [0, 1, 0, 1], 4);
        copierShadow(p);
        occlude(p);
        b.save(); pathPoly(b, p); b.clip();
        b.fillStyle = '#111'; b.fillRect(cx - 250, cy - 200, 500, 400);
        b.translate(cx, cy); b.rotate(rot);
        b.strokeStyle = '#eee'; b.lineWidth = 3; b.lineJoin = 'round';
        const rr = H.rng(5);
        for (let i = 0; i < 16; i++) {
          let x = rr.range(-170, 170), y = rr.range(-120, 120);
          b.beginPath(); b.moveTo(x, y);
          for (let k = 0; k < 4; k++) {
            const L = rr.range(20, 70), dir = rr.int(0, 3);
            if (dir === 0) x += L; else if (dir === 1) y += L; else if (dir === 2) { x += L * 0.7; y += L * 0.7; } else { x -= L * 0.7; y += L * 0.7; }
            b.lineTo(x, y);
          }
          b.stroke();
          b.fillStyle = '#eee'; b.beginPath(); b.arc(x, y, 5, 0, TAU); b.fill();
          b.fillStyle = '#111'; b.beginPath(); b.arc(x, y, 2, 0, TAU); b.fill();
        }
        b.fillStyle = '#eee'; b.fillRect(-40, -30, 80, 60); b.fillStyle = '#111'; b.fillRect(-32, -22, 64, 44);
        for (let i = -3; i <= 3; i++) { b.fillStyle = '#eee'; b.fillRect(i * 10 - 2, -42, 4, 12); b.fillRect(i * 10 - 2, 30, 4, 12); }
        b.restore();
        hide();
      }

      // ---------- lens scrap: halftone photo of a camera eye ----------
      const lens = { cx: 905, cy: 420, w: 520, h: 450, rot: -0.07 };
      {
        const { cx, cy, w, h, rot } = lens;
        show(0.375, cx, cy, true);
        const p = scrapPoly(r, nz, cx, cy, w, h, rot, [1, 0, 1, 1], 5);
        copierShadow(p, 3, 2.5, 0.75);
        occlude(p);
        const img = halftone(w + 40, h + 40, 6.5, 0.785, (u, v) => {
          const x = (u - 0.47) * (w + 40), y = (v - 0.5) * (h + 40), d = Math.hypot(x, y) / 185, a = Math.atan2(y, x);
          let gv;
          if (d > 1.12) gv = 0.78 - 0.25 * (v) + 0.08 * Math.sin(x * 0.02);
          else if (d > 0.98) gv = 0.2 + 0.25 * (Math.sin(a * 60) > 0 ? 1 : 0);
          else if (d > 0.84) gv = 0.55 + 0.25 * Math.cos(a - 2.2);
          else if (d > 0.7) gv = 0.12;
          else if (d > 0.62) gv = 0.38 + 0.2 * Math.cos(a + 1);
          else {
            gv = 0.05 + 0.18 * (1 - d / 0.62);
            const hex = Math.cos(Math.PI / 6) / Math.cos(((a % (TAU / 6)) + TAU) % (TAU / 6) - Math.PI / 6);
            if (d < 0.26 * hex) gv = 0.02;
            // glass reflections
            const hl = Math.hypot(x + 55, y + 60) / 185;
            if (Math.abs(hl - 0.3) < 0.05 && a < -1.2 && a > -2.9) gv = 0.96;
            if (Math.hypot(x + 40, y + 45) < 16) gv = 1;
            if (Math.hypot(x - 52, y - 40) < 8) gv = 0.9;
          }
          return H.clamp(gv);
        });
        b.save(); pathPoly(b, p); b.clip();
        b.translate(cx, cy); b.rotate(rot); b.drawImage(img, -(w + 40) / 2, -(h + 40) / 2);
        // caption strip printed on the photo
        b.fillStyle = '#111'; b.fillRect(-w / 2 + 18, h / 2 - 58, 230, 30);
        b.fillStyle = '#f4f2ec'; b.font = '400 17px "Special Elite"'; b.fillText('FIG. 1 — IT SEES YOU', -w / 2 + 28, h / 2 - 37);
        b.restore();
        hide();
      }

      // ---------- typewritten manifesto scrap ----------
      {
        const cx = 255, cy = 560, w = 380, h = 250, rot = 0.05;
        show(0.875, cx, cy, true);
        const p = scrapPoly(r, nz, cx, cy, w, h, rot, [0, 0, 1, 0], 4);
        copierShadow(p);
        occlude(p);
        b.save(); pathPoly(b, p); b.clip();
        b.fillStyle = '#ece9e1'; b.fillRect(cx - 260, cy - 200, 520, 400);
        b.translate(cx - w / 2 + 22, cy - h / 2 + 36); b.rotate(rot);
        b.fillStyle = '#151515'; b.font = '400 17px "Special Elite"';
        const lines = ['the feed never sleeps.', 'every click is counted.', 'every face is a dataset.', 'who signed the terms?', 'not you. not me.', ''];
        lines.forEach((ln, i) => { b.globalAlpha = 0.85 + 0.15 * Math.sin(i * 7); b.fillText(ln, 0, i * 27); });
        b.globalAlpha = 1;
        b.fillRect(0, 5 * 27 - 15, 120, 19); b.fillRect(130, 5 * 27 - 15, 70, 19); b.fillRect(210, 5 * 27 - 15, 100, 19);
        // strike-through
        b.fillRect(-2, 3 * 27 - 6, 200, 2.5);
        b.restore();
        hide();
        // staples
        [[cx - w / 2 + 26, cy - h / 2 + 14, -0.1], [cx + w / 2 - 40, cy - h / 2 + 22, 0.15]].forEach(([x, y, a], si) => {
          show(3.875 + si * 0.125, x + 20, y);
          b.save(); b.translate(x, y); b.rotate(a);
          b.fillStyle = 'rgba(0,0,0,0.7)'; b.fillRect(-1, 3, 42, 5);
          const g = b.createLinearGradient(0, -2, 0, 3); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#9a9a9a'); g.addColorStop(1, '#333');
          b.fillStyle = g; b.fillRect(0, -2, 40, 6);
          b.fillStyle = '#111'; b.fillRect(-2, -3, 4, 8); b.fillRect(38, -3, 4, 8);
          b.restore();
          hide();
        });
      }

      // ---------- spot marker: circle + arrow over the lens ----------
      {
        sp.save(); sp.strokeStyle = spotCol; sp.lineCap = 'round'; sp.lineJoin = 'round';
        const ccx = lens.cx - 10, ccy = lens.cy - 5;
        sp.lineWidth = 9;
        sp.beginPath();
        const prog = H.clamp((ts - 3.0) / 0.5);
        for (let i = 0; i <= 80 * prog; i++) {
          const u = i / 80, a = -2.6 + u * (TAU + 0.6), rr = 238 + Math.sin(u * 9) * 6 + u * 14;
          const x = ccx + Math.cos(a) * rr * 1.05, y = ccy + Math.sin(a) * rr * 0.93;
          i ? sp.lineTo(x, y) : sp.moveTo(x, y);
        }
        sp.stroke();
        sp.lineWidth = 8;
        if (ts >= 3.625) {
          sp.beginPath(); sp.moveTo(470, 300); sp.quadraticCurveTo(560, 250, 640, 300); sp.stroke();
          sp.beginPath(); sp.moveTo(612, 270); sp.lineTo(644, 302); sp.lineTo(604, 314); sp.stroke();
        }
        sp.restore();
        // marker scrawl in black toner
        if (ts >= 3.75) b.save(); else b = dumB;
        b.save(); b.translate(380, 318); b.rotate(-0.12); b.fillStyle = '#111'; b.font = '400 30px "Permanent Marker"'; b.fillText('wake up', 0, 0); b.restore();
        if (b === realB) b.restore(); b = realB;
      }

      // ---------- ransom-note title ----------
      {
        const lines = [{ s: 'WHO OWNS', x: 64, y: 58, size: 76 }, { s: 'THE ALGORITHM?', x: 46, y: 170, size: 66 }];
        const rl = H.rng(4242);
        let li2 = 0;
        lines.forEach((ln, li) => {
          let x = ln.x;
          for (const ch0 of ln.s) {
            if (ch0 === ' ') { x += ln.size * 0.35; continue; }
            const fnt = rl.pick(RANSOM_FONTS).replace('S', Math.round(ln.size * rl.range(0.78, 1.12)) + 'px');
            const ch = rl.chance(0.3) && ch0 !== '?' ? ch0.toLowerCase() : ch0;
            b.font = fnt;
            const m = b.measureText(ch), gw = m.width;
            const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
            const padX = rl.range(5, 12), padY = rl.range(5, 11);
            const tw = gw + padX * 2, th = asc + desc + padY * 2;
            const style = rl.pick(['white', 'white', 'black', 'spot', 'grey', 'white', 'spot', 'black']);
            const rot = rl.range(-0.13, 0.13) + (jr() - 0.5) * 0.04;
            const cx = x + tw / 2 + (jr() - 0.5) * 2, cy = ln.y + th / 2 + rl.range(-8, 8) + (jr() - 0.5) * 2;
            const tile = scrapPoly(rl, nz, cx, cy, tw, th, rot, [0, 0, 0, 0]);
            show(1.125 + li2 * 0.0625, cx, cy); li2++;
            copierShadow(tile, 2, 2, 0.75);
            b.save(); pathPoly(b, tile);
            b.fillStyle = style === 'black' ? '#141414' : '#f6f4ee'; b.fill();
            b.clip();
            if (style === 'grey') { b.fillStyle = '#111'; for (let yy = -60; yy < 60; yy += 6) for (let xx = -60; xx < 60; xx += 6) { b.beginPath(); b.arc(cx + xx + (yy % 12 ? 3 : 0), cy + yy, 1.5, 0, TAU); b.fill(); } }
            b.translate(cx, cy); b.rotate(rot);
            b.fillStyle = style === 'black' ? '#f6f4ee' : '#111';
            b.textBaseline = 'alphabetic';
            b.fillText(ch, -gw / 2, (asc - desc) / 2);
            b.restore();
            if (style === 'spot') { pathPoly(sp, tile); sp.fillStyle = spotCol; sp.fill(); }
            else occlude(tile);
            hide();
            x += tw + rl.range(-4, 5);
          }
        });
      }

      // ---------- masking tape ----------
      const tape = (cx, cy, w, h, rot) => maskTape(b, sp, r, nz, cx, cy, w, h, rot);

      // toner smudges
      {
        const rs = H.rng(909);
        for (let i = 0; i < 5; i++) {
          const x = rs.range(0, W), y = rs.range(0, H_), R0 = rs.range(30, 90);
          const g = b.createRadialGradient(x, y, 0, x, y, R0);
          g.addColorStop(0, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          b.fillStyle = g; b.fillRect(x - R0, y - R0, R0 * 2, R0 * 2);
        }
      }
      // ---------- photocopier: crush to toner ----------
      {
        const img = b.getImageData(0, 0, W, H_), d = img.data, rn = H.rng(31 + fr);
        // drum streaks (fixed columns)
        const streak = new Float32Array(W);
        const rs = H.rng(77);
        for (let i = 0; i < 9; i++) { const x0 = rs.int(0, W - 1), wdt = rs.int(1, 4), a = rs.range(0.05, 0.16); for (let k = 0; k < wdt; k++) if (x0 + k < W) streak[x0 + k] += a; }
        for (let y = 0; y < H_; y++) {
          const edge = Math.max(0, 1 - y / 40) * 0.25 + Math.max(0, (y - H_ + 50) / 50) * 0.2;
          for (let x = 0; x < W; x++) {
            const k = (y * W + x) * 4;
            let L = d[k] / 255;
            const n = (rn() - 0.5) * 0.22 + nz.n2(x * 0.012, y * 0.012) * 0.06;
            L = L + n - streak[x] - edge - Math.max(0, 1 - x / 30) * 0.3;
            // high-contrast toner curve, keeps a little grey for tape
            let v = H.smooth(0.32, 0.62, L);
            if (v > 0.6 && rn() < 0.0025) v = 0.1; // toner specks
            if (v < 0.4 && rn() < 0.01) v = 0.7;  // dropouts
            v = 0.06 + v * 0.9;
            d[k] = 255 * v; d[k + 1] = 255 * v * 0.995; d[k + 2] = 255 * v * 0.975;
          }
        }
        b.putImageData(img, 0, 0);
      }
      // ---------- spot ink: grainy coverage ----------
      {
        const img = sp.getImageData(0, 0, W, H_), d = img.data, rn = H.rng(55 + fr);
        for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
          const k = (y * W + x) * 4;
          if (!d[k + 3]) continue;
          const cov = 0.82 + nz.n2(x * 0.02 + 40, y * 0.02) * 0.2 + (rn() - 0.5) * 0.35;
          d[k + 3] = d[k + 3] * H.clamp(cov);
        }
        sp.putImageData(img, 0, 0);
      }
      [[668, 205, 150, 44, -0.75], [1150, 640, 160, 46, -0.6], [250, 432, 130, 40, 0.06], [1180, 250, 110, 38, 0.5]].forEach((a, i) => {
        show(2.625 + i * 0.125, a[0], a[1]); tape(...a); hide();
      });
      ctx.drawImage(BW, 0, 0);
      // spot plate slides into (mis)registration
      const reg = 1 - H.ease.out(H.clamp(ts / 2.5));
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; const wob = H.rng(300 + Math.floor(t * 8)); // plate wobbles a pixel per step
      ctx.drawImage(SPL, 4 + 12 * reg + Math.round((wob() - 0.5) * 2), -3 - 9 * reg + Math.round((wob() - 0.5) * 2)); ctx.restore();
      // copier-lamp flash on the frame a big scrap lands
      if (flashes.length) { ctx.fillStyle = 'rgba(255,255,250,0.22)'; ctx.fillRect(0, 0, W, H_); }
    },
  });
}
```
