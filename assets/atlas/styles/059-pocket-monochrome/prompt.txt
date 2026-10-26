I want an animated explainer made in the "Pocket Monochrome" visual style (Retro Digital). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Inter, Press Start 2P
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Press+Start+2P&display=block">
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
Name: Pocket Monochrome
Family: Retro Digital
Look: An original DMG handheld frame: 160x144 pixels in exactly four pea-soup greens, a visible LCD pixel grid with each pixel casting a faint shadow on the reflective backing, motion ghosting, and the purple-grey bezel with its striped DOT MATRIX label.
Motion: A handheld boot: the logo scrolls down one LCD pixel per frame and smears, the palette steps to white, the overworld steps back in through the 4 shades, the hero walks on 1 px per frame with a 2-frame cycle, and the window pops up and prints text.
How it explains: Explains as a handheld monster-battle RPG in four LCD shades: the question text box slides up the window layer into a header, palette fades act as door transitions, labelled cards march an arrow-tile path into CHIP the model, a flash-and-stripes battle intro starts a GUESS/CHECK/ADJUST fight (hit flash, dotted error trail, weight bars), and a LEVEL UP stats screen counts accuracy to an inverted 97%.

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

REFERENCE STYLE SOURCE (styles/gameboy.js; W/H_ are always 1280x720)
```js
{
  // ---------- DMG handheld: 160x144 four-shade LCD, LCD pixel grid + drop shadows + ghosting, inside the bezel ----------
  const LW = 160, LH = 144;
  const SHADES = ['#a4ba30', '#7f9c22', '#3e6a2c', '#14381a'].map((h) => H.hex(h)); // lightest pulled toward DMG olive

  const HERO_A = [
    '.....33333......',
    '....3222223.....',
    '...322222223....',
    '...3333333333...',
    '...31100003.....',
    '...31000303.....',
    '...31000003.....',
    '....300003......',
    '....3333333.....',
    '...322222223....',
    '..32222222223...',
    '..30322222303...',
    '...333333333....',
    '...3223.3223....',
    '...3223.3223....',
    '..33333.33333...',
  ];
  const HERO_B = HERO_A.slice(0, 13).concat(['...3223..3223...', '..3223....3223..', '.33333....33333.']);
  const BOT = [
    '.......3........',
    '......303.......',
    '.......3........',
    '..33333333333...',
    '.3000000000003..',
    '.3033333333303..',
    '.3033033033303..',
    '.3033033033303..',
    '.3033300033303..',
    '.3033333333303..',
    '.3000000000003..',
    '..33333333333...',
    '....3211123.....',
    '...321111123....',
    '....3333333.....',
    '................',
  ];
  const TREE = [
    '.....333333.....',
    '...3311111133...',
    '..311001111113..',
    '.31100111111213.',
    '.31101111112213.',
    '3111111111122213',
    '3111111111222213',
    '3121111112222223',
    '3122111122222223',
    '.31222222222223.',
    '.33222222222233.',
    '..333222222333..',
    '....33322333....',
    '......3223......',
    '......3223......',
    '.....332233.....',
  ];

  // shared LCD + case pipeline (used by both draw and the explainer)
  const BX = 212, BY = 18, BW = 856, BH = 690, SC = 4;
  const SX = BX + (BW - LW * SC) / 2 + 20, SY = BY + 70;
  const bezPath = (ctx, inset) => { // bezel (grey-violet) with the big bottom-right radius
    const x = BX + inset, y = BY + inset, w = BW - inset * 2, h = BH - inset * 2, r1 = 22 - inset * 0.5, r2 = 120 - inset;
    ctx.beginPath(); ctx.moveTo(x + r1, y); ctx.lineTo(x + w - r1, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r1);
    ctx.lineTo(x + w, y + h - r2); ctx.quadraticCurveTo(x + w, y + h, x + w - r2, y + h); ctx.lineTo(x + r1, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r1);
    ctx.lineTo(x, y + r1); ctx.quadraticCurveTo(x, y, x + r1, y); ctx.closePath();
  };
  // static case + bezel + label + LED + LCD recess, built once per canvas size
  let CASE = null;
  function caseLayer(W, H_) {
    if (CASE && CASE.w === W && CASE.h === H_) return CASE.cv;
    const cv = H.layer(W, H_), ctx = cv.getContext('2d');
    // off-white ABS: diagonal light, low-frequency unevenness and a fine moulded stipple
    const img = ctx.createImageData(W, H_), d = img.data, nz = H.makeNoise(9), rr = H.rng(31);
    const c0 = H.hex('#dcd8d0'), c1 = H.hex('#b9b4aa');
    for (let y = 0, p = 0; y < H_; y++) for (let x = 0; x < W; x++, p++) {
      const g = H.clamp((x / W) * 0.55 + (y / H_) * 0.45), lo = nz.fbm2(x * 0.004, y * 0.004, 3) * 0.035;
      const st = (rr() - 0.5) * 0.035 + nz.n2(x * 0.6, y * 0.6) * 0.02;
      const m = 1 + lo + st, i = p * 4;
      d[i] = (c0[0] + (c1[0] - c0[0]) * g) * m; d[i + 1] = (c0[1] + (c1[1] - c0[1]) * g) * m; d[i + 2] = (c0[2] + (c1[2] - c0[2]) * g) * m; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    for (let i = 0; i < 7000; i++) { const r0 = H.rng(i); const x = r0() * W, y = r0() * H_; ctx.fillStyle = `rgba(${r0() < 0.5 ? '255,255,255' : '60,50,40'},0.06)`; ctx.fillRect(x, y, 2, 2); }
    // soft top-left key light on the flanks, falling to shade bottom-right
    const kl = ctx.createRadialGradient(60, 40, 0, 60, 40, 900); kl.addColorStop(0, 'rgba(255,252,245,0.22)'); kl.addColorStop(1, 'rgba(255,252,245,0)');
    ctx.fillStyle = kl; ctx.fillRect(0, 0, W, H_);
    const sh = ctx.createLinearGradient(W * 0.5, H_ * 0.4, W, H_); sh.addColorStop(0, 'rgba(70,60,50,0)'); sh.addColorStop(1, 'rgba(70,60,50,0.14)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H_);
    // bezel: cast shadow onto the case, then the grey-violet face
    ctx.save(); ctx.shadowColor = 'rgba(60,50,40,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; bezPath(ctx, 0); ctx.fillStyle = '#6f6d7f'; ctx.fill(); ctx.restore();
    const bg2 = ctx.createLinearGradient(0, BY, 0, BY + 700); bg2.addColorStop(0, '#7b798c'); bg2.addColorStop(1, '#5e5c6e');
    bezPath(ctx, 3); ctx.fillStyle = bg2; ctx.fill();
    // matte print texture + top-left light / bottom-right shade on the bezel face
    ctx.save(); bezPath(ctx, 3); ctx.clip();
    const bl = ctx.createLinearGradient(BX, BY, BX + BW, BY + BH); bl.addColorStop(0, 'rgba(255,255,255,0.07)'); bl.addColorStop(0.5, 'rgba(255,255,255,0)'); bl.addColorStop(1, 'rgba(10,8,20,0.12)');
    ctx.fillStyle = bl; ctx.fillRect(BX, BY, BW, BH);
    const r2 = H.rng(77);
    for (let i = 0; i < 9000; i++) { ctx.fillStyle = r2() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,10,0.07)'; ctx.fillRect(BX + r2() * BW, BY + r2() * BH, 1, 1); }
    ctx.restore();
    // moulded edge: lit along the top/left, shaded along the bottom/right
    const eg = ctx.createLinearGradient(BX, BY, BX + BW * 0.6, BY + BH); eg.addColorStop(0, 'rgba(255,255,255,0.28)'); eg.addColorStop(0.55, 'rgba(255,255,255,0.05)'); eg.addColorStop(1, 'rgba(20,15,35,0.35)');
    ctx.save(); bezPath(ctx, 1); ctx.strokeStyle = eg; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.save(); bezPath(ctx, 3); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    // label lines + DOT MATRIX text
    const ly = BY + 40;
    ctx.fillStyle = '#7a1f52'; ctx.fillRect(BX + 34, ly - 6, 200, 3); ctx.fillRect(BX + BW - 34 - 200, ly - 6, 200, 3);
    ctx.fillStyle = '#26276a'; ctx.fillRect(BX + 34, ly + 1, 200, 3); ctx.fillRect(BX + BW - 34 - 200, ly + 1, 200, 3);
    ctx.font = 'italic 700 13px "Inter"'; ctx.fillStyle = '#c9c7d6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('DOT MATRIX WITH NEURAL SOUND', BX + BW / 2, ly - 1);
    // battery LED
    const ledX = BX + 52, ledY = BY + 250;
    const lg = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, 18); lg.addColorStop(0, 'rgba(255,60,60,0.7)'); lg.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = lg; ctx.fillRect(ledX - 18, ledY - 18, 36, 36);
    ctx.fillStyle = '#ff5050'; ctx.beginPath(); ctx.arc(ledX, ledY, 5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(ledX - 1.5, ledY - 1.5, 1.6, 0, 7); ctx.fill();
    ctx.font = '600 11px "Inter"'; ctx.fillStyle = '#c9c7d6'; ctx.fillText('BATTERY', ledX, ledY + 22);
    // LCD recess: dark well with a 1px deeper lip, lit lower/right rim where the bezel steps down
    const rx = SX - 6, ry = SY - 6, rw = LW * SC + 12, rh = LH * SC + 12;
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(rx, ry + rh, rw + 1, 1); ctx.fillRect(rx + rw, ry, 1, rh + 1);
    ctx.fillStyle = 'rgba(20,18,30,0.35)'; ctx.fillRect(rx - 1, ry - 1, rw + 1, 1); ctx.fillRect(rx - 1, ry - 1, 1, rh + 1);
    ctx.fillStyle = '#3d3c48'; ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#2a2933'; ctx.lineWidth = 1; ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
    CASE = { w: W, h: H_, cv };
    return cv;
  }

  function gbCompose(ctx, W, H_, t, renderWorld) {
      // ghosting: blend current frame with two previous frames (slow LCD response)
      const F0 = renderWorld(t), F1 = renderWorld(t - 0.1), F2 = renderWorld(t - 0.2);
      const ink = new Float32Array(LW * LH);
      for (let i = 0; i < ink.length; i++) { const a = F0[i], b = Math.max(a, F1[i]), c = Math.max(a, F2[i]); ink[i] = a * 0.7 + b * 0.2 + c * 0.1; }

      // ---------- case + bezel (cached) ----------
      ctx.drawImage(caseLayer(W, H_), 0, 0);

      // ---------- LCD panel ----------
      const PW = LW * SC, PH = LH * SC;
      const img = ctx.createImageData(PW, PH), D = img.data;
      const paper = H.hex('#a9bd3a'), sh = H.hex('#8ea424').map((q) => q * 0.55);
      // per-cell colours: the cell itself and the gap around it (mostly backing colour, picks a bit of the pixel)
      const N = LW * LH, cr = new Float32Array(N), cg = new Float32Array(N), cb = new Float32Array(N);
      for (let k = 0; k < N; k++) { const v = ink[k], i = Math.min(2, Math.floor(v)), f = v - i, A = SHADES[i], B = SHADES[i + 1]; cr[k] = A[0] + (B[0] - A[0]) * f; cg[k] = A[1] + (B[1] - A[1]) * f; cb[k] = A[2] + (B[2] - A[2]) * f; }
      // backlight-less falloff + diagonal reflective sheen (+3% top-left -> -3% bottom-right), separable
      const colT = new Float32Array(PW), rowT = new Float32Array(PH);
      for (let x = 0; x < PW; x++) colT[x] = -0.08 * ((x / PW - 0.5) ** 2 * 4) - 0.03 * (x / PW);
      for (let y = 0; y < PH; y++) rowT[y] = 1.03 - 0.08 * ((y / PH - 0.5) ** 2 * 4) - 0.03 * (y / PH);
      for (let y = 0; y < PH; y++) {
        const ly2 = (y / SC) | 0, cy = y % SC, syp = y - 2, sy2 = syp >= 0 ? ((syp / SC) | 0) * LW : -1;
        for (let x = 0; x < PW; x++) {
          const lx = (x / SC) | 0, k = ly2 * LW + lx, v = ink[k];
          let r = cr[k], g = cg[k], b = cb[k];
          if (x % SC === SC - 1 || cy === SC - 1) { r = paper[0] + (r - paper[0]) * 0.45; g = paper[1] + (g - paper[1]) * 0.45; b = paper[2] + (b - paper[2]) * 0.45; }
          // drop shadow of the liquid-crystal layer onto the reflective backing (offset down-right ~2 px)
          const sxp = x - 2;
          if (sxp >= 0 && sy2 >= 0) { const vs = ink[sy2 + ((sxp / SC) | 0)]; if (vs > v) { const m = Math.min(0.3, (vs - v) * 0.11); r += (sh[0] - r) * m; g += (sh[1] - g) * m; b += (sh[2] - b) * m; } }
          const f = colT[x] + rowT[y], i = (y * PW + x) * 4;
          D[i] = r * f; D[i + 1] = g * f; D[i + 2] = b * f; D[i + 3] = 255;
        }
      }
      ctx.putImageData(img, SX, SY);
      // inner shadow (panel sits below the glass) + glass sheen
      ctx.save();
      const ish = ctx.createLinearGradient(0, SY, 0, SY + 26); ish.addColorStop(0, 'rgba(20,30,10,0.35)'); ish.addColorStop(1, 'rgba(20,30,10,0)');
      ctx.fillStyle = ish; ctx.fillRect(SX, SY, PW, 26);
      const ish2 = ctx.createLinearGradient(SX, 0, SX + 20, 0); ish2.addColorStop(0, 'rgba(20,30,10,0.3)'); ish2.addColorStop(1, 'rgba(20,30,10,0)');
      ctx.fillStyle = ish2; ctx.fillRect(SX, SY, 20, PH);
      // glare across the cover, kept inside the bezel
      bezPath(ctx, 3); ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath(); ctx.moveTo(BX + 120, BY); ctx.lineTo(BX + 420, BY); ctx.lineTo(BX + 120, BY + 520); ctx.lineTo(BX - 40, BY + 520); ctx.closePath();
      const gl = ctx.createLinearGradient(BX, BY, BX + 300, BY + 300); gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl; ctx.fill();
      ctx.restore();
  }

  // ================= EXPLAINER: "How does AI learn?" as a handheld monster-battle RPG =================
  const GB_CAT = ['3.........3', '33.......33', '313.....313', '31133333113', '31111111113', '31131113113', '31111211113', '30113131103', '.311111113.', '..3333333..'];
  const GB_DOG = ['..3333333..', '.300000003.', '32300000323', '32303030323', '32300000323', '32300300323', '.330000033.', '..3001003..', '...30003...', '....333....'];
  const GB_ARW = ['3....', '33...', '323..', '3223.', '323..', '33...', '3....'];
  function gbExplainer(ctx, W, H_, t) {
    const tlx = H.layer(LW, 24).getContext('2d', { willReadFrequently: true });
    const renderWorld = (tt) => {
      const S = new Uint8Array(LW * LH);
      const tq = Math.floor(tt * 60) / 60;
      const pr = (a, b) => H.clamp((tq - a) / (b - a));
      const put = (x, y, v) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < LW && y < LH) S[y * LW + x] = v; };
      const rect = (x, y, w, h, v) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, v); };
      const spr = (rows, ox, oy, flip, sc = 1) => rows.forEach((row, j) => [...row].forEach((c, i) => { if (c >= '0' && c <= '3') for (let a = 0; a < sc; a++) for (let b = 0; b < sc; b++) put(ox + (flip ? row.length - 1 - i : i) * sc + a, oy + j * sc + b, +c); }));
      const stamp = (str, x, y, v = 3, size = 8) => {
        tlx.clearRect(0, 0, LW, 24); tlx.font = size + 'px "Press Start 2P"'; tlx.textBaseline = 'top'; tlx.fillStyle = '#000'; tlx.fillText(str, 0, 0);
        const hh = size + 2, d = tlx.getImageData(0, 0, LW, hh).data;
        for (let j = 0; j < hh; j++) for (let i = 0; i < LW; i++) if (d[(j * LW + i) * 4 + 3] > 110) put(x + i, y + j, v);
      };
      const tbox = (x, y, w, h) => { rect(x, y, w, h, 0); rect(x, y, w, 1, 3); rect(x, y + h - 1, w, 1, 3); rect(x, y, 1, h, 3); rect(x + w - 1, y, 1, h, 3); rect(x + 2, y + 2, w - 4, 1, 3); rect(x + 2, y + h - 3, w - 4, 1, 3); rect(x + 2, y + 2, 1, h - 4, 3); rect(x + w - 3, y + 2, 1, h - 4, 3); };
      const typed = (str, a, cps = 30) => str.slice(0, Math.max(0, Math.floor((tq - a) * cps)));
      const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const remap = (m) => { for (let i = 0; i < S.length; i++) S[i] = m[S[i]]; };
      const grass = () => { for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) { const h = ((x * 73856093) ^ (y * 19349663)) >>> 0; S[y * LW + x] = (h % 29 === 0) ? 2 : (h % 13 === 0 ? 0 : 1); } };
      const header = () => { tbox(0, 0, LW, 16); stamp('HOW DOES AI LEARN?', 8, 4); };

      if (tq < 2.35) { // ---------- BEAT 1: the question as a text box, which then becomes the header ----------
        grass();
        rect(56, 40, 48, 40, 0); for (let x = 56; x < 104; x++) { put(x, 40, 3); put(x, 79, 3); } // a little clearing
        spr(BOT, 64, 44 + Math.round(Math.sin(tq * 4) * 2), false, 2);
        const up = Math.floor(pr(1.55, 1.95) * 4) / 4; // window layer slides up in 8-px steps
        const by = Math.round(H.lerp(98, 0, up) / 8) * 8, bh = up > 0 ? 16 : 46;
        tbox(0, by, LW, up >= 1 ? 16 : bh);
        if (up === 0) { stamp(typed('HOW DOES', 0.2, 20), 8, by + 8, 3, 16); stamp(typed('AI LEARN?', 0.6, 20), 8, by + 26, 3, 16); }
        else stamp('HOW DOES AI LEARN?', 8, by + 4);
        // door-style palette fade to white into the next scene
        const fo = [[0, 1, 2, 3], [0, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0]];
        remap(fo[H.clamp(Math.floor((tq - 2.1) / 0.06) + 1, 0, 3)]);
        return S;
      }
      if (tq < 6.5) { // ---------- BEAT 2: labelled cards walk the arrow path into CHIP (the model) ----------
        rect(0, 0, LW, LH, 0);
        for (let y = 20; y < 100; y++) for (let x = 0; x < LW; x++) if ((x + y) % 4 === 0 && y % 2 === 0) put(x, y, 1); // floor tiles
        // arrow-tile path
        for (let x = 0; x < 112; x += 8) spr(GB_ARW, x + ((Math.floor(tq * 8)) % 8 < 4 ? 0 : 1), 80, false);
        rect(0, 89, 116, 1, 2);
        stamp('TRAINING DATA', 4, 91, 3);
        // the model: CHIP at 2x on a pad, label landing under it
        rect(112, 74, 44, 6, 2); rect(112, 74, 44, 1, 3);
        const gulp = Math.floor((tq - 2.95) / 0.4) >= 0 && ((tq - 2.95) % 0.4) < 0.07 && tq < 6.0;
        spr(BOT, 118, 40 + (gulp ? -2 : 0), true, 2);
        tbox(112, 20, 46, 16); stamp('MODEL', 115, 24);
        // cards
        for (let i = 0; i < 9; i++) {
          const k = (tq - (2.55 + i * 0.4)) / 1.8; if (k < 0 || k >= 1) continue;
          const x = Math.round(-28 + k * 150), isCat = i % 3 !== 1;
          tbox(x, 44, 28, 22); spr(isCat ? GB_CAT : GB_DOG, x + 9, 50, false);
          rect(x, 66, 28, 11, 3); stamp(isCat ? 'CAT' : 'DOG', x + 2, 68, 0);
        }
        // counter text box
        tbox(0, 100, LW, 44); stamp('EXAMPLES SEEN', 8, 106); stamp(fmt(1e6 * Math.pow(pr(2.8, 5.8), 2.2)), 8, 120, 3, 16);
        header();
        const fi = [[0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 2], [0, 1, 2, 3]];
        remap(fi[H.clamp(Math.floor((tq - 2.35) / 0.06), 0, 3)]);
        // battle intro: flashes, then striped wipe
        if (tq > 6.0 && tq < 6.25 && Math.floor((tq - 6.0) / 0.05) % 2 === 0) remap([3, 2, 1, 0]);
        if (tq >= 6.25) { const k = pr(6.25, 6.5); for (let y = 0; y < LH; y++) { const w = Math.round(k * LW); if (Math.floor(y / 4) % 2) rect(0, y, w, 1, 3); else rect(LW - w, y, w, 1, 3); } }
        return S;
      }
      if (tq < 10.55) { // ---------- BEAT 3: battle — GUESS / CHECK / ADJUST ----------
        rect(0, 0, LW, LH, 0);
        const phase = tq < 7.4 ? 0 : tq < 8.3 ? 1 : tq < 9.4 ? 2 : 0;
        const shake = tq > 7.4 && tq < 7.7 ? (Math.floor(tq * 30) % 2 ? 2 : -2) : 0;
        // enemy: the picture (a cat) on its platform + name box
        for (let x = -24; x <= 24; x++) { const y = Math.round(Math.sqrt(Math.max(0, 1 - (x / 24) ** 2)) * 5); put(118 + x, 48 + y, 2); put(118 + x, 48 - y, 2); }
        if (!(tq > 7.4 && tq < 7.8 && Math.floor(tq * 15) % 2)) spr(GB_CAT, 107 + shake, 26, false, 2);
        tbox(4, 20, 70, 16); stamp('NEW PIC', 10, 24);
        // player: CHIP (the model) + weights panel
        for (let x = -28; x <= 28; x++) { const y = Math.round(Math.sqrt(Math.max(0, 1 - (x / 28) ** 2)) * 5); put(34 + x, 96 + y, 2); put(34 + x, 96 - y, 2); }
        spr(BOT, 18, 66 + Math.round(Math.sin(tq * 4)), false, 2);
        tbox(70, 56, 90, 48); stamp('MODEL', 76, 60);
        const adj = Math.floor(pr(8.55, 9.15) * 4) / 4;
        [[0.3, 0.8], [0.85, 0.45], [0.5, 0.95]].forEach(([a, b], i) => { const v = H.lerp(a, b, adj), y = 72 + i * 10; stamp('W' + (i + 1), 76, y - 1, 3); rect(94, y, 60, 4, 3); rect(95, y + 1, Math.round(58 * v), 2, adj > 0 && adj < 1 && Math.floor(tq * 15) % 2 ? 1 : 0); });
        // error trail: dotted line from the picture back to the model
        if (tq > 8.3 && tq < 9.4) { const k = pr(8.3, 8.75); for (let s2 = 0; s2 < k; s2 += 0.04) { const x = Math.round(H.lerp(104, 50, s2)), y = Math.round(H.lerp(44, 66, s2) - Math.sin(s2 * Math.PI) * 14); rect(x, y, 2, 2, 3); } }
        // message box + command menu
        tbox(0, 104, 98, 40); tbox(96, 104, 64, 40);
        ['GUESS', 'CHECK', 'ADJST'].forEach((nm, i) => stamp(nm, 110, 110 + i * 11));
        if (Math.floor(tq * 4) % 2 === 0 || true) spr(['3...', '33..', '333.', '33..', '3...'], 102, 111 + phase * 11, false);
        let m1 = '', m2 = '';
        if (tq < 7.4) { m1 = 'CHIP SAYS'; m2 = typed('DOG?', 6.75, 12); }
        else if (tq < 8.3) { m1 = 'WRONG!'; m2 = "IT'S A CAT"; }
        else if (tq < 9.4) { m1 = 'ERROR!'; m2 = 'ADJUSTING'; }
        else { m1 = 'CHIP SAYS'; m2 = typed('CAT!', 9.55, 12); }
        stamp(m1, 6, 110); const big = m2 === 'DOG?' || m2 === 'CAT!' || m2.length < 4; stamp(m2, 6, big ? 122 : 126, 3, big ? 16 : 8);
        if (tq > 9.9) { spr(['......33', '.....33.', '33..33..', '.3333...', '..33....'], 76, 126, false, 2); }
        header();
        if (tq > 7.4 && tq < 7.48) remap([3, 2, 1, 0]); // hit flash
        const fo = [[0, 1, 2, 3], [0, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0]];
        if (tq > 10.3) remap(fo[H.clamp(Math.floor((tq - 10.3) / 0.06) + 1, 0, 3)]);
        if (tq < 6.65) { const k = 1 - pr(6.5, 6.65); for (let y = 0; y < LH; y++) { const w = Math.round(k * LW); if (Math.floor(y / 4) % 2) rect(0, y, w, 1, 3); else rect(LW - w, y, w, 1, 3); } }
        return S;
      }
      // ---------- BEAT 4 + 5: level-up stats screen, then the takeaway ----------
      rect(0, 0, LW, LH, 0);
      const p = pr(10.8, 11.9), val = Math.round(61 + 36 * H.ease.out(p));
      tbox(0, 18, LW, 86);
      stamp('ACCURACY', 8, 26);
      const box97 = p >= 1 && (Math.floor(tq * 6) % 2 === 0 || tq > 12.9);
      if (box97) rect(6, 38, 66, 22, 3);
      stamp(val + '%', 8, 41, box97 ? 0 : 3, 16);
      stamp('61%>' + val + '%', 8, 64);
      stamp('EXP', 8, 78); rect(36, 78, 36, 7, 3); rect(37, 79, Math.round(34 * H.ease.out(p)), 5, 1);
      if (p >= 1) stamp('LEVEL UP!', 8, 90);
      // bar chart of rounds
      for (let y = 30; y <= 96; y++) put(84, y, 3); for (let x = 84; x < 154; x++) put(x, 96, 3);
      for (let i = 0; i < 8; i++) { const g = H.clamp(p * 8 - i); if (g <= 0) break; const h = Math.round(((97 - 36 * Math.exp(-i / 2.5)) / 100) * 60 * g); rect(88 + i * 8, 96 - h, 6, h, i === 7 && p >= 1 ? 3 : 2); }
      if (p >= 1) for (let k = 0; k < 4; k++) { const a = k * 1.57 + tq * 4, x = Math.round(150 + Math.cos(a) * 6), y = Math.round(34 + Math.sin(a) * 6); put(x, y, 3); put(x + 1, y, 2); }
      tbox(0, 104, LW, 40); stamp('TRAINING', 8, 112); stamp('ROUNDS: ' + String(Math.round(H.ease.out(p) * 500)), 8, 126);
      if (tq > 13.0) { // takeaway: full-screen ending card, one big word per line
        tbox(0, 16, LW, 128);
        stamp(typed('MORE', 13.0, 30), 48, 26, 3, 16); stamp(typed('EXAMPLES', 13.1, 30), 16, 46, 3, 16);
        if (tq > 13.35) spr(['3333333', '.32223.', '..323..', '...3...'], 76, 68, false, 2);
        stamp(typed('BETTER', 13.4, 30), 32, 84, 3, 16); stamp(typed('GUESSES!', 13.55, 30), 16, 104, 3, 16);
      }
      header();
      const fi = [[0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 2], [0, 1, 2, 3]];
      remap(fi[H.clamp(Math.floor((tq - 10.55) / 0.06), 0, 3)]);
      return S;
    };
    gbCompose(ctx, W, H_, t, renderWorld);
  }

  // ================= SOUND: the handheld's own 4 channels. Two square pulses for text blips, menus and jingles, the
  // wave channel for bass, and the crunchy noise channel for hits, doors and the battle intro. Mono-ish (small pans),
  // like the one tiny speaker. Times copied from gbExplainer (it runs on a 60 fps clock: tq = floor(t*60)/60).
  function gbSound(k) {
    const END = 14.5;
    const pu = (t, f, dur, gain, pan = 0, minor) => k.tone(t, { f, type: 'square', dur, gain, a: 0.001, hold: dur * 0.65, pan, minor });
    const wv = (t, f, dur, gain, pan = 0) => k.tone(t, { f, type: 'triangle', dur, gain, a: 0.002, hold: dur * 0.6, pan });
    const nz = (t, dur, gain, o) => k.noise(t, Object.assign({ dur, filter: 'lowpass', f: 3000, gain, rate: 0.22, a: 0.001 }, o)); // LFSR-ish crunch
    // dialog text: one low blip per printed letter
    const text = (t0, n, cps, pan = 0) => { for (let i = 0; i < n; i++) pu(t0 + i / cps, i % 2 ? 'A4' : 'D5', 0.03, 0.045, pan, true); };
    // door / palette fade: falling noise + pulse step down (out), rising (in)
    const door = (t, out) => { nz(t, 0.2, 0.12, { f: out ? [[0, 3000], [0.2, 600]] : [[0, 600], [0.2, 3000]] }); pu(t, out ? 'C5' : 'G4', 0.06, 0.05); pu(t + 0.06, out ? 'G4' : 'C5', 0.08, 0.05); };

    // ---- music: overworld while the data walks in, battle theme for the loop, light theme on the stats screen
    k.music('chip', 2.53, 6.0, { bpm: 132, gain: 0.4, chords: [['G3', 'B3', 'D4', 'G4'], ['E3', 'G3', 'B3', 'E4']] });
    k.music('chip', 6.65, 10.3, { bpm: 168, gain: 0.45, chords: [['E3', 'G3', 'B3', 'E4'], ['C3', 'E3', 'G3', 'C4'], ['D3', 'F#3', 'A3', 'D4']] });
    k.music('chip', 10.73, 11.85, { bpm: 132, gain: 0.3, chords: [['C4', 'E4', 'G4', 'C5']] });
    k.music('chip', 12.9, END, { bpm: 132, gain: 0.3, chords: [['F3', 'A3', 'C4', 'F4'], ['C4', 'E4', 'G4', 'C5']] });

    // ---- BEAT 1: question prints (0.2: 8 chars at 20 cps; 0.6: 9 chars), window steps up into the header (1.65-1.95)
    text(0.2, 8, 20, -0.1); text(0.6, 9, 20, -0.1);
    ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => pu(1.65 + i * 0.1, n, 0.05, 0.05, 0, true));
    door(2.1, true);                                                                          // fade to white 2.1-2.28
    door(2.35, false);                                                                        // fade in 2.35-2.53

    // ---- BEAT 2: CHIP gulps every 0.4 s from 2.95 (2-px hop), counter 2.8-5.8, lands on 1,000,000
    for (let i = 0; i < 8; i++) { const t = 2.95 + i * 0.4, b = 330 * Math.pow(2, i / 12); k.tone(t, { f: [[0, b], [0.06, b * 1.5]], type: 'square', dur: 0.07, gain: 0.04, a: 0.001, hold: 0.04, pan: 0.3, minor: true }); }
    for (let t = 2.85; t < 5.75;) { nz(t, 0.02, 0.07, { f: 6000, rate: 0.5, pan: -0.2, minor: true }); t += H.lerp(0.25, 1 / 12, (t - 2.8) / 3.0); }
    pu(5.8, 'G5', 0.08, 0.05); pu(5.88, 'C6', 0.2, 0.05); wv(5.8, 'C4', 0.28, 0.1);                 // item-get blip
    // battle intro: 5 inverted flashes (6.0-6.25, every 0.05) then stripes wipe (6.25-6.65)
    for (let i = 0; i < 5; i++) { pu(6.0 + i * 0.05, i % 2 ? 'E5' : 'B5', 0.04, 0.05); }
    for (let i = 0; i < 8; i++) pu(6.25 + i * 0.05, 200 * Math.pow(2, i / 4), 0.045, 0.045);   // stripes sweep up
    nz(6.25, 0.4, 0.1, { f: [[0, 800], [0.4, 4000]], a: 0.2 });

    // ---- BEAT 3: "CHIP SAYS DOG?" (6.75, 12 cps)
    text(6.75, 4, 12, 0.1);
    // CHECK (7.4): cursor, hit flash, shake and the cat blinking -> damage crunch + low falling pulse
    pu(7.4, 'A4', 0.03, 0.05, 0.2, true);
    nz(7.4, 0.35, 0.34, { f: [[0, 4000], [0.3, 700]] });
    k.tone(7.4, { f: [[0, 700], [0.28, 110]], type: 'square', dur: 0.3, gain: 0.1, a: 0.001, hold: 0.22, pan: 0.3 }); wv(7.4, 'E2', 0.3, 0.2);
    pu(7.75, 'D3', 0.14, 0.07); pu(7.9, 'A2', 0.25, 0.07);                                     // "WRONG! IT'S A CAT" buzzer
    // ADJUST (8.3): cursor, dotted error trail 8.3-8.75, weight bars step in 4 levels (8.7, 8.85, 9.0, 9.15)
    pu(8.3, 'A4', 0.03, 0.05, 0.2, true);
    k.withMinor(() => { for (let i = 0; i < 6; i++) { const f = i / 5; pu(8.3 + f * 0.45, 900 * Math.pow(2, -f * 1.2), 0.04, 0.04, 0.4 - f * 0.6); } });
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pu(8.7 + i * 0.15, n, i === 3 ? 0.14 : 0.06, 0.05, 0.2, true));
    // GUESS again (9.4), "CAT!" (9.55, 12 cps), check sprite (9.9): the correction
    pu(9.4, 'A4', 0.03, 0.05, 0.2, true);
    text(9.55, 4, 12, 0.1);
    ['C5', 'E5', 'G5'].forEach((n, i) => pu(9.9 + i * 0.06, n, 0.06, 0.05, -0.2)); pu(10.08, 'C6', 0.25, 0.045, -0.2); wv(9.9, 'C3', 0.35, 0.11);
    door(10.3, true); door(10.55, false);

    // ---- BEAT 4: EXP bar fills 10.8-11.9 (ease-out): the classic rising EXP-gain sweep, % ticks slowing as it settles
    k.tone(10.8, { f: [[0, 300], [0.4, 900], [1.1, 1250]], type: 'square', dur: 1.1, gain: 0.035, a: 0.01, hold: 1.0, pan: -0.2 });
    { let last = 61, lastT = -1; for (let f = Math.ceil(10.8 * 60); f < 11.88 * 60; f++) { const t = f / 60, v = Math.round(61 + 36 * H.ease.out(H.clamp((t - 10.8) / 1.1))); if (v > last && t - lastT >= 1 / 12) { nz(t, 0.02, 0.07, { f: 6000, rate: 0.5, minor: true }); last = v; lastT = t; } } }
    // 97% + LEVEL UP! (11.9): the biggest hit. level-up fanfare on both pulses over the wave bass, noise crash
    const L = 11.9;
    nz(L, 0.3, 0.16, { f: [[0, 5000], [0.3, 1500]] });
    [['C5', 0.1], ['C5', 0.1], ['C5', 0.1], ['G5', 0.55]].forEach(([n, d], i) => { const t = L + [0, 0.11, 0.22, 0.33][i]; pu(t, n, d, 0.085); pu(t, k.hz(n) * 0.75, d, 0.05); });
    wv(L, 'C3', 0.3, 0.28); wv(L + 0.33, 'G3', 0.55, 0.28);
    ['E6', 'G6', 'C6', 'E6', 'G6', 'C6'].forEach((n, i) => pu(L + 0.4 + i * 0.07, n, 0.04, 0.02, 0.5, true)); // sparkles orbiting
    // ---- BEAT 5: takeaway card types (MORE 13.0, EXAMPLES 13.1, BETTER 13.4, GUESSES! 13.55, all 30 cps), lands 13.82
    k.withMinor(() => { for (let t = 13.0; t < 13.8; t += 1 / 15) pu(t, Math.round((t - 13) * 15) % 2 ? 'A4' : 'D5', 0.03, 0.045); });
    pu(13.35, 'G4', 0.05, 0.04);                                                             // the down-arrow lands
    const TAKE = 13.82;
    pu(TAKE, 'B4', 0.1, 0.04); pu(TAKE + 0.1, 'C5', 0.6, 0.04); pu(TAKE + 0.1, 'G4', 0.6, 0.022); wv(TAKE, 'C3', 0.75, 0.12);
  }

  registerStyle({
    id: 'gameboy',
    name: 'Pocket Monochrome',
    category: 'Retro Digital',
    description: 'An original DMG handheld frame: 160x144 pixels in exactly four pea-soup greens, a visible LCD pixel grid with each pixel casting a faint shadow on the reflective backing, motion ghosting, and the purple-grey bezel with its striped DOT MATRIX label.',
    motion: 'A handheld boot: the logo scrolls down one LCD pixel per frame and smears, the palette steps to white, the overworld steps back in through the 4 shades, the hero walks on 1 px per frame with a 2-frame cycle, and the window pops up and prints text.',
    duration: 6.2,
    fonts: ['8px "Press Start 2P"', '16px "Press Start 2P"', 'italic 700 13px "Inter"', '600 11px "Inter"', '800 30px "Inter"'],
    frameT: 6.0,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Explains as a handheld monster-battle RPG in four LCD shades: the question text box slides up the window layer into a header, palette fades act as door transitions, labelled cards march an arrow-tile path into CHIP the model, a flash-and-stripes battle intro starts a GUESS/CHECK/ADJUST fight (hit flash, dotted error trail, weight bars), and a LEVEL UP stats screen counts accuracy to an inverted 97%.',
    explainer(ctx, W, H_, t) { gbExplainer(ctx, W, H_, t); },
    explainerSound(k) { gbSound(k); },
    draw(ctx, W, H_, t) {
      // ---------- LCD world renderer: returns shade indices (0..3) at time tt ----------
      const textLayer = H.layer(LW, 16), tlx = textLayer.getContext('2d', { willReadFrequently: true });
      const renderWorld = (tt) => {
        const S = new Uint8Array(LW * LH);
        const put = (x, y, v) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < LW && y < LH) S[y * LW + x] = v; };
        const rect = (x, y, w, h, v) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, v); };
        const spr = (rows, ox, oy, flip) => rows.forEach((row, j) => [...row].forEach((c, i) => { if (c >= '0' && c <= '3') put(ox + (flip ? 15 - i : i), oy + j, +c); }));
        const tq = Math.floor(tt * 60) / 60; // 60 Hz game tick
        const stamp = (str, x, y, v) => {
          tlx.clearRect(0, 0, LW, 16); tlx.font = '8px "Press Start 2P"'; tlx.textBaseline = 'top'; tlx.fillStyle = '#000'; tlx.fillText(str, 0, 0);
          const d = tlx.getImageData(0, 0, LW, 10).data;
          for (let j = 0; j < 10; j++) for (let i = 0; i < LW; i++) if (d[(j * LW + i) * 4 + 3] > 110) put(x + i, y + j, v);
        };
        const remap = (m) => { for (let i = 0; i < S.length; i++) S[i] = m[S[i]]; };
        // ---------- boot sequence ----------
        if (tt < 2.0) {
          if (tt >= 0.15) {
            const ly = Math.min(60, -10 + Math.floor((tq - 0.15) * 66));
            stamp('POCKET AI', 44, ly, 3);
            if (ly >= 60) { rect(44, ly + 11, 72, 1, 2); stamp('\u00ae', 119, ly - 5, 2); }
          }
          const fadeOut = [[0, 1, 2, 3], [0, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0]];
          remap(fadeOut[H.clamp(Math.floor((tt - 1.75) / 0.07) + 1, 0, 3)]);
          return S;
        }
        const rnd = H.rng(144);
        // grass base with sparse tufts
        for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) {
          const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
          put(x, y, (h % 29 === 0) ? 2 : (h % 13 === 0 ? 0 : 1));
        }
        for (let k = 0; k < 46; k++) { const x = rnd.int(0, LW - 3), y = rnd.int(0, 96); put(x, y, 2); put(x + 2, y, 2); put(x + 1, y - 1, 2); }
        // dirt path (from lab door down/left), with pebble dither
        const pathCells = [];
        for (let y = 50; y < 96; y++) for (let x = 84; x < 100; x++) pathCells.push([x, y]);
        for (let y = 66; y < 82; y++) for (let x = 20; x < 100; x++) pathCells.push([x, y]);
        pathCells.forEach(([x, y]) => put(x, y, ((x * 7 + y * 13) % 17 === 0) ? 1 : 0));
        // path edge lines
        for (let x = 20; x < 84; x++) { put(x, 65, 2); put(x, 82, 2); }
        for (let y = 50; y < 66; y++) { put(83, y, 2); put(100, y, 2); }
        for (let y = 82; y < 96; y++) { put(83, y, 2); put(100, y, 2); }
        // pond with animated wave glints
        for (let y = 40; y < 64; y++) for (let x = 4; x < 64; x++) {
          const dx = (x - 33) / 27, dy = (y - 52) / 10;
          if (dx * dx + dy * dy > 1) continue;
          const edge = dx * dx + dy * dy > 0.82;
          let v = edge ? 3 : 2;
          if (!edge && ((x + Math.floor(tt * 4) * 2 + (y % 4) * 5) % 12 < 4) && y % 3 === 1) v = 1; if (!edge && ((x + Math.floor(tt * 4) * 2) % 24 === 0) && y % 3 === 1) v = 0;
          put(x, y, v);
        }
        // tall grass patch (right)
        for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 4; tx++) {
          const ox = 112 + tx * 8, oy = 66 + ty * 8;
          const sway = Math.floor(tt * 3 + tx + ty) % 2;
          [[1, 6], [2, 3], [3, 6], [5, 6], [6, 2 + sway], [7, 6]].forEach(([a, b]) => { for (let q = b; q < 8; q++) put(ox + a, oy + q, q === b ? 3 : 2); });
        }
        // flowers
        [[10, 88], [22, 92], [48, 87], [70, 44], [106, 50], [146, 58], [62, 92], [140, 92], [34, 86], [6, 70]].forEach(([x, y], i) => {
          const bloom = (Math.floor(tt * 2) + i) % 2;
          put(x, y - 1, 0); put(x - 1, y, 0); put(x + 1, y, 0); put(x, y + 1, 0); put(x, y, bloom ? 3 : 2);
        });
        // lab building (with roof dish = "AI lab")
        const lx = 70, ly = 14, lw = 46, lh = 36;
        rect(lx, ly + 10, lw, lh - 10, 0);
        for (let y = ly; y < ly + 12; y++) { const inset = Math.max(0, 11 - (y - ly)) >> 2; rect(lx - 2 + inset, y, lw + 4 - inset * 2, 1, (y - ly) % 3 === 0 ? 3 : 2); }
        rect(lx - 3, ly + 12, lw + 6, 1, 3);
        for (let y = ly + 12; y < ly + lh; y++) { put(lx, y, 3); put(lx + lw - 1, y, 3); }
        rect(lx, ly + lh - 1, lw, 1, 3);
        for (let y = ly + 16; y < ly + lh - 1; y += 4) for (let x = lx + 1; x < lx + lw - 1; x++) if ((x + y) % 7 === 0) put(x, y, 1);
        // windows
        [[lx + 5, ly + 17], [lx + 31, ly + 17]].forEach(([wx, wy]) => { rect(wx, wy, 10, 8, 3); rect(wx + 1, wy + 1, 8, 6, 2); put(wx + 2, wy + 2, 0); put(wx + 3, wy + 2, 0); put(wx + 2, wy + 3, 0); rect(wx + 5, wy, 1, 8, 3); });
        // door
        rect(lx + 18, ly + 22, 10, 14, 3); rect(lx + 19, ly + 23, 8, 12, 2); put(lx + 25, ly + 29, 0);
        // sign above door: chip glyph
        rect(lx + 17, ly + 14, 12, 6, 3); rect(lx + 18, ly + 15, 10, 4, 0); rect(lx + 21, ly + 16, 4, 2, 3);
        for (let k = 0; k < 3; k++) { put(lx + 20 + k * 2, ly + 14, 0); put(lx + 20 + k * 2, ly + 19, 0); }
        // dish on roof
        const dx0 = lx + 36, dy0 = ly - 6;
        for (let a = 0; a < 10; a++) { put(dx0 + a, dy0 + Math.round(((a - 4.5) ** 2) / 6), 3); }
        rect(dx0 + 4, dy0 + 3, 2, 6, 3);
        const blink = Math.floor(tt * 3) % 2; put(dx0 + 4, dy0 - 2, blink ? 3 : 1); put(dx0 + 5, dy0 - 2, blink ? 3 : 1);
        // signal arcs from dish
        if (blink) for (let a = -0.9; a < 0.9; a += 0.08) { put(dx0 + 4 + Math.sin(a) * 6, dy0 - 3 - Math.cos(a) * 5, 2); }
        // fence
        for (let x = 2; x < 66; x++) { put(x, 32, 3); put(x, 36, 3); }
        for (let x = 2; x < 66; x += 6) { rect(x, 30, 2, 9, 3); put(x, 30, 2); }
        // trees: border top + left
        for (let x = -8; x < LW; x += 16) if (x < 60 || x > 120) spr(TREE, x, -6, false);
        spr(TREE, 0, 12, false); spr(TREE, 16, 10, true); spr(TREE, 142, 14, false); spr(TREE, 144, 36, true);
        spr(TREE, 124, 30, false);
        // signpost
        rect(126, 50, 12, 8, 3); rect(127, 51, 10, 6, 0); for (let x = 128; x < 136; x += 2) put(x, 53, 2); for (let x = 129; x < 135; x += 2) put(x, 55, 2); rect(131, 58, 2, 5, 3);
        // hero walking right along the path + robot hovering
        const walkD = H.clamp((tq - 2.3) * 60, 0, 80), walking = walkD > 0 && walkD < 80;
        const walkX = -16 + Math.floor(walkD);
        const frame = walking ? Math.floor(tq * 8) % 2 : 1;
        // shadows
        for (let i = 3; i < 13; i++) put(walkX + i, 82, 2);
        spr(frame ? HERO_A : HERO_B, Math.round(walkX), 66 + (frame ? 0 : -1), false);
        const bx = 84, by = 58 + Math.round(Math.sin(tq * 4) * 2.5);
        for (let i = 4; i < 11; i++) put(bx + i, 80, (i % 2) ? 2 : 1);
        spr(BOT, bx, by, true);
        // heart emote over the robot
        const HEART = ['.33.33.', '3003003', '3000003', '.30003.', '..303..', '...3...'];
        if (tt >= 3.7 && Math.floor(tt * 2) % 2 === 0) HEART.forEach((row, j2) => [...row].forEach((c, i2) => { if (c !== '.') put(bx + 4 + i2, by - 8 + j2, +c); }));

        // ---------- text box ----------
        const tby = 98;
        const fadeIn = [[0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 2], [0, 1, 2, 3]];
        if (tt < 3.75) { remap(fadeIn[H.clamp(Math.floor((tt - 2.0) / 0.08), 0, 3)]); return S; }
        rect(0, tby, LW, LH - tby, 0);
        rect(0, tby, LW, 1, 3); rect(0, LH - 1, LW, 1, 3); rect(0, tby, 1, LH - tby, 3); rect(LW - 1, tby, 1, LH - tby, 3);
        rect(2, tby + 2, LW - 4, 1, 3); rect(2, LH - 3, LW - 4, 1, 3); rect(2, tby + 2, 1, LH - tby - 4, 3); rect(LW - 3, tby + 2, 1, LH - tby - 4, 3);
        // corner pips
        [[3, tby + 3], [LW - 4, tby + 3], [3, LH - 4], [LW - 4, LH - 4]].forEach(([x, y]) => put(x, y, 2));
        const lines = ['MEET CHIP,', 'YOUR AI PAL!'];
        const total = lines.join('').length;
        let budget = Math.floor(Math.max(0, tt - 3.8) * 30);
        const text = (str, x, y) => {
          tlx.clearRect(0, 0, LW, 16); tlx.font = '8px "Press Start 2P"'; tlx.textBaseline = 'top'; tlx.fillStyle = '#000'; tlx.fillText(str, 0, 0);
          const d = tlx.getImageData(0, 0, LW, 10).data;
          for (let j = 0; j < 10; j++) for (let i = 0; i < LW; i++) if (d[(j * LW + i) * 4 + 3] > 110) put(x + i, y + j, 3);
        };
        lines.forEach((ln, i) => { const s = ln.slice(0, Math.max(0, budget)); budget -= ln.length; text(s, 10, tby + 12 + i * 16); });
        if (budget >= 0 && Math.floor(tt * 2.5) % 2 === 0) { const ax = LW - 14, ay = LH - 12; rect(ax, ay, 7, 1, 3); rect(ax + 1, ay + 1, 5, 1, 3); rect(ax + 2, ay + 2, 3, 1, 3); put(ax + 3, ay + 3, 3); }
        return S;
      };

      gbCompose(ctx, W, H_, t, renderWorld);
    },
  });
}
```
