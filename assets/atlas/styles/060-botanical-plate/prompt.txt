I want an animated explainer made in the "Botanical Plate" visual style (Illustration). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Cormorant Garamond, Libre Baskerville
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=block">
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
Name: Botanical Plate
Family: Illustration
Look: A hand-coloured copperplate natural-history plate: swelling engraved hatching that follows every form, loose transparent watercolour tints laid over the print, numbered figures, Latin italic captions and foxed rag paper with a pressed plate mark.
Motion: The circuit-flower sways on its stem while the copper beetle flexes its antennae; tints bleed in a beat after the engraved lines appear.
How it explains: Three plates from a naturalist's folio, each pulled fresh under the press roller: engraved specimens of cats and dogs feed the circuit-lily "model", a life-cycle plate with fletched engraved arrows shows Guess, Check and Adjust, and a growth-stage plate counts accuracy in an engraved cartouche, with the colourist's red wash ringing the key moments.

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

REFERENCE STYLE SOURCE (styles/botanical-plate.js; W/H_ are always 1280x720)
```js
{
  // ---------- 19th-century hand-coloured natural-history engraving ----------
  const TAU = Math.PI * 2;

  // tapered engraving line(s) -> filled ribbons. lines: [[x,y,shade],...]
  function ribbonPath(ctx, run) {
    const n = run.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = run[Math.max(0, i - 1)], b = run[Math.min(n - 1, i + 1)];
      const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1, nx = -ty / m, ny = tx / m;
      let w = run[i][2] / 2; if (i === 0 || i === n - 1) w *= 0.35;
      L.push([run[i][0] + nx * w, run[i][1] + ny * w]); R.push([run[i][0] - nx * w, run[i][1] - ny * w]);
    }
    const poly = L.concat(R.reverse());
    let area = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; area += p[0] * q[1] - q[0] * p[1]; }
    if (area < 0) poly.reverse();
    ctx.moveTo(poly[0][0], poly[0][1]); for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]); ctx.closePath();
  }
  function engrave(ctx, lines, maxW = 1.2, thr = 0.3, gamma = 0.8) {
    ctx.beginPath();
    for (const ln of lines) {
      let run = [];
      for (const p of ln) {
        const w = maxW * Math.pow(H.clamp((p[2] - thr) / (1 - thr)), gamma);
        if (w > 0.14) run.push([p[0], p[1], w]); else { if (run.length > 1) ribbonPath(ctx, run); run = []; }
      }
      if (run.length > 1) ribbonPath(ctx, run);
    }
    ctx.fill();
  }
  function surfLines(S, sh, n, m, along = 'u', a0 = -1, a1 = 1) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const line = [];
      if (along === 'u') { const v = a0 + (a1 - a0) * (i + 0.5) / n; for (let k = 0; k <= m; k++) { const u = k / m, p = S(u, v); line.push([p[0], p[1], sh(u, v)]); } }
      else { const u = a0 + (a1 - a0) * (i + 0.5) / n; for (let k = 0; k <= m; k++) { const v = -1 + 2 * k / m, p = S(u, v); line.push([p[0], p[1], sh(u, v)]); } }
      out.push(line);
    }
    return out;
  }
  function outline(S, n = 48) { const o = []; for (let k = 0; k <= n; k++) o.push(S(k / n, -1)); for (let k = n; k >= 0; k--) o.push(S(k / n, 1)); return o; }
  function poly(ctx, pts, close = true) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
  function erase(ctx, pts) { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; poly(ctx, pts); ctx.fill(); ctx.restore(); }
  // variable-weight outline (thicker on shadow side = lower-right)
  function contour(ctx, pts, w0 = 0.7, w1 = 1.7, close = true) {
    const run = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
      // outward normal approx (-ty, tx) ; light from upper-left -> heavier where normal points down-right
      const k = H.clamp(0.5 + 0.5 * ((-ty / m) * 0.6 + (tx / m) * 0.8));
      run.push([pts[i][0], pts[i][1], w0 + (w1 - w0) * k]);
    }
    if (close) run.push(run[0]);
    ctx.beginPath(); ribbonPath(ctx, run); ctx.fill();
  }
  function stipple(ctx, clipPts, n, dens, r, rad = 0.6) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of clipPts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    ctx.save(); poly(ctx, clipPts); ctx.clip(); ctx.beginPath();
    for (let i = 0; i < n; i++) { const x = r.range(x0, x1), y = r.range(y0, y1); if (r() < dens(x, y)) { const rr = rad * r.range(0.6, 1.3); ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, TAU); } }
    ctx.fill(); ctx.restore();
  }
  // watercolour wash on tint layer
  // (explainer plates set BX_WASH: the colourist's tints dry with a darker pooled edge)
  let BX_WASH = false;
  function wash(tc, pts, col, a, mis = [1.5, -1], edge) {
    if (edge === undefined) edge = BX_WASH ? 0.9 : 0.5;
    tc.save(); tc.translate(mis[0], mis[1]);
    poly(tc, pts); tc.fillStyle = H.rgba(col, a); tc.fill();
    tc.strokeStyle = H.rgba(col, a * edge); tc.lineWidth = BX_WASH ? 3 : 2.2; tc.stroke();
    tc.restore();
  }
  function bez(p0, p1, p2, p3, t) { const m = 1 - t; return [m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]; }

  // petal / leaf surface: base point, direction angle, length, width, bend
  function bladeS(bx, by, ang, len, wid, bend, shapeP = 0.75, tipBlunt = 0) {
    const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
    const C = (u) => [bx + dx * len * u + px * bend * len * u * u, by + dy * len * u + py * bend * len * u * u];
    return (u, v) => {
      const c = C(u), c2 = C(Math.min(1, u + 0.01)), c1 = C(Math.max(0, u - 0.01));
      let tx = c2[0] - c1[0], ty = c2[1] - c1[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
      const w = wid * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(u, 0.999), shapeP)), 0.85) * (1 - tipBlunt * 0) ;
      return [c[0] - ty * w * v, c[1] + tx * w * v];
    };
  }

  // ===== EXPLAINER HELPERS =====
  let BX_PAPER = null, BX_WASHTEX = null;
  function bxPaper(W, H_) {
    if (BX_PAPER) return BX_PAPER;
    const L = H.layer(W, H_), c = L.getContext('2d'), r = H.rng(1847);
    H.paper(c, W, H_, '#efe5cf', 19, 0.04);
    const eg = c.createRadialGradient(W / 2, H_ / 2, 300, W / 2, H_ / 2, 800); eg.addColorStop(0, 'rgba(170,130,70,0)'); eg.addColorStop(1, 'rgba(160,115,50,0.30)');
    c.fillStyle = eg; c.fillRect(0, 0, W, H_);
    const PM = [44, 30, W - 44, H_ - 26];
    c.fillStyle = 'rgba(150,120,80,0.06)'; c.fillRect(PM[0], PM[1], PM[2] - PM[0], PM[3] - PM[1]);
    c.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 110; i++) { let x = r() * W, y = r() * H_; if (r.chance(0.55)) x = r.chance(0.5) ? r() * 200 : W - r() * 200; const rad = r.range(1, r.chance(0.12) ? 12 : 4); const fg = c.createRadialGradient(x, y, 0, x, y, rad); fg.addColorStop(0, `rgba(160,100,45,${r.range(0.2, 0.5)})`); fg.addColorStop(1, 'rgba(170,110,55,0)'); c.fillStyle = fg; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = 'rgba(110,80,40,0.35)'; c.lineWidth = 1.5; c.strokeRect(PM[0], PM[1], PM[2] - PM[0], PM[3] - PM[1]);
    c.strokeStyle = 'rgba(255,250,235,0.55)'; c.lineWidth = 2; c.strokeRect(PM[0] - 2, PM[1] - 2, PM[2] - PM[0] + 4, PM[3] - PM[1] + 4);
    BX_PAPER = L; return L;
  }
  function bxWashTex(W, H_) {
    if (BX_WASHTEX) return BX_WASHTEX;
    // full-res pigment granulation with the still's formula (0.7 + 0.42 fbm(0.018) + 0.14 n2(0.35)); the smooth fbm term is
    // sampled on a 3px grid and interpolated, the granulation is per pixel
    const nz = H.makeNoise(31), B = H.layer(W, H_), b = B.getContext('2d'), img = b.createImageData(W, H_), d = img.data;
    const st = 3, gw = Math.ceil(W / st) + 2, gh = Math.ceil(H_ / st) + 2, G = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) G[j * gw + i] = nz.fbm2(i * st * 0.018, j * st * 0.018, 3);
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const fx = x / st, fy = y / st, i = fx | 0, j = fy | 0, u = fx - i, v = fy - j, o = j * gw + i;
      const f = (G[o] * (1 - u) + G[o + 1] * u) * (1 - v) + (G[o + gw] * (1 - u) + G[o + gw + 1] * u) * v;
      d[(y * W + x) * 4 + 3] = H.clamp(0.7 + 0.42 * f + 0.14 * nz.n2(x * 0.35, y * 0.35)) * 255;
    }
    b.putImageData(img, 0, 0); BX_WASHTEX = B; return B;
  }
  const bxEll = (cx, cy, rx, ry, n = 48) => { const o = []; for (let k = 0; k < n; k++) { const a = k / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  // engraved hatching across a shape: parallel lines whose weight follows a shade function
  function bxHatch(c, shape, ang, gap, shade, maxW = 1.15) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; shape.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 2, dx = Math.cos(ang), dy = Math.sin(ang), lines = [];
    for (let o = -R; o < R; o += gap) { const ln = []; for (let k = 0; k <= 24; k++) { const u = -R + 2 * R * k / 24, x = cx - dy * o + dx * u, y = cy + dx * o + dy * u; ln.push([x, y, shade(x, y)]); } lines.push(ln); }
    c.save(); poly(c, shape); c.clip(); engrave(c, lines, maxW, 0.25); c.restore();
  }
  // engraved specimen vignette: oval frame, animal head, caption
  function bxSpecimen(c, tc, x, y, isCat, s = 1, fig = '', prog = 1) {
    if (prog <= 0) return;
    c.save(); tc.save(); [c, tc].forEach((k) => { k.translate(x, y); k.scale(s, s); });
    const oval = bxEll(0, 0, 54, 64);
    erase(c, oval); contour(c, oval, 0.6, 1.4); c.lineWidth = 0.6; poly(c, bxEll(0, 0, 50, 60)); c.stroke();
    bxHatch(c, bxEll(0, 0, 50, 60), 0, 3.2, (px, py) => 0.3 + 0.35 * ((px + py) / 80 + 0.5) * 0.6);
    let head;
    if (isCat) { // one clean outline: jaw arc from the right ear round the chin to the left ear, then the two ears
      head = []; for (let k = 0; k <= 30; k++) { const a = -0.62 + (Math.PI + 1.24) * k / 30; head.push([Math.cos(a) * 30, 6 + Math.sin(a) * 26]); }
      head.push([-22, -36], [-6, -18], [0, -19.5], [6, -18], [22, -36]);
    }
    else head = bxEll(0, 4, 30, 30, 36);
    if (!isCat) [-1, 1].forEach((sg) => { const ear = bxEll(sg * 30, 10, 11, 24, 24); erase(c, ear); wash(tc, ear, '#5e3f28', 0.65, [1.5, -1]); bxHatch(c, ear, Math.PI / 2, 2.4, () => 0.75); contour(c, ear, 0.5, 1.3); });
    erase(c, head); wash(tc, head, isCat ? '#c99a4e' : '#a8784e', 0.6, [1.5, -1]);
    const hsh = (px, py) => H.clamp(0.22 + 0.5 * ((px * 0.6 + py) / 40) + 0.25 * Math.pow(Math.hypot(px / 30, (py - 5) / 28), 4));
    bxHatch(c, head, 0.15, 2.4, (px, py) => hsh(px, py) - 0.04, 0.9);
    { // form-following contour lines round the skull (engravers model a sphere with rings that swell on the shadow side)
      const cy0 = isCat ? 6 : 4, ry0 = isCat ? 26 : 30, rings = [];
      for (let k = 0; k < 7; k++) { const r = 0.92 - k * 0.11, ln = []; for (let q = 0; q <= 40; q++) { const a = q / 40 * TAU; const px = Math.cos(a) * 30 * r, py = cy0 + Math.sin(a) * ry0 * r; ln.push([px, py, H.clamp(hsh(px, py) + 0.12 - 0.25 * (1 - r))]); } rings.push(ln); }
      c.save(); poly(c, head); c.clip(); engrave(c, rings, 0.95, 0.3); c.restore();
    }
    bxHatch(c, head, 1.05, 2.4, (px, py) => hsh(px, py) - 0.3, 0.85); // engraver's cross-hatch in the shadowed half
    contour(c, head, 0.6, 1.6);
    c.fillStyle = '#000';
    [-1, 1].forEach((sg) => { c.beginPath(); c.ellipse(sg * 11, 0, 3.4, isCat ? 4.2 : 3.4, 0, 0, TAU); c.fill(); });
    if (isCat) { c.beginPath(); c.moveTo(-3, 10); c.lineTo(3, 10); c.lineTo(0, 14); c.closePath(); c.fill(); c.lineWidth = 0.7; c.beginPath(); [-1, 1].forEach((sg) => { c.moveTo(sg * 6, 15); c.lineTo(sg * 30, 12); c.moveTo(sg * 6, 17); c.lineTo(sg * 28, 22); }); c.stroke(); }
    else { const sn = bxEll(0, 16, 12, 9, 24); erase(c, sn); contour(c, sn, 0.5, 1.2); c.beginPath(); c.ellipse(0, 12, 5, 3.4, 0, 0, TAU); c.fill(); }
    c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = 'italic 600 32px "Cormorant Garamond"'; c.fillText(isCat ? 'cat.' : 'dog.', 0, 96);
    if (fig) { c.font = 'italic 400 15px "Libre Baskerville"'; c.fillText(fig, -46, -56); }
    c.restore(); tc.restore();
  }
  // engraved arrow (tapered shaft, barbed head, fletched tail)
  function bxArrow(c, pts, p, w = 2.4, label, lx, ly) {
    if (p <= 0) return; const n = Math.max(2, Math.round(pts.length * Math.min(1, p))), P = pts.slice(0, n);
    c.beginPath(); ribbonPath(c, P.map((q, i) => [q[0], q[1], w * (0.5 + 0.5 * i / (P.length - 1))])); c.fill();
    const a = pts[0], b = pts[2]; const an0 = Math.atan2(b[1] - a[1], b[0] - a[0]);
    c.lineWidth = 1; c.beginPath(); [0, 6].forEach((o) => [-1, 1].forEach((sg) => { const bx = a[0] + Math.cos(an0) * o, by = a[1] + Math.sin(an0) * o; c.moveTo(bx, by); c.lineTo(bx - Math.cos(an0 + sg * 0.6) * 9, by - Math.sin(an0 + sg * 0.6) * 9); })); c.stroke();
    if (p >= 1) { const q = pts[pts.length - 1], o = pts[pts.length - 3], an = Math.atan2(q[1] - o[1], q[0] - o[0]); c.beginPath(); c.moveTo(q[0] + Math.cos(an) * 6, q[1] + Math.sin(an) * 6); c.lineTo(q[0] + Math.cos(an + 2.7) * 18, q[1] + Math.sin(an + 2.7) * 18); c.lineTo(q[0] - Math.cos(an) * 4, q[1] - Math.sin(an) * 4); c.lineTo(q[0] + Math.cos(an - 2.7) * 18, q[1] + Math.sin(an - 2.7) * 18); c.closePath(); c.fill(); }
    if (label && p > 0.5) { c.font = 'italic 600 32px "Cormorant Garamond"'; c.textAlign = 'center'; c.fillText(label, lx, ly); }
  }
  const bxQ = (a, m, b, n = 32) => { const o = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]); } return o; };
  // the circuit-lily (the "model"), base of stem at (x,y)
  function bxLily(c, tc, x, y, s, tilt = 0, grow = 1) {
    const H0 = 230 * s * grow, hx = x + Math.sin(tilt) * 40 * s, hy = y - H0;
    const SP = (u) => [H.lerp(x, hx, u) + Math.sin(u * Math.PI) * 14 * s, H.lerp(y, hy, u)];
    const S = (u, v) => { const p = SP(u), w = (5 - 1.5 * u) * s; return [p[0] + w * v, p[1]]; };
    [[0.42, -2.5, 1], [0.6, -0.55, -1]].forEach(([u0, an, sd], i) => {
      const b = SP(u0), L = bladeS(b[0], b[1], an, 120 * s * Math.max(0.5, grow), 24 * s, an < -1.5 ? -0.15 : 0.15, 0.62), o = outline(L, 40);
      erase(c, o); wash(tc, o, '#6d8c45', 0.55, [2, -1.5]);
      const lsh = (u, v) => H.clamp(0.33 + 0.4 * (v * sd > 0 ? 1 : 0) + 0.3 * Math.pow(Math.abs(v), 3) + 0.2 * Math.pow(1 - u, 4));
      engrave(c, surfLines(L, lsh, Math.max(9, Math.round(9 * s * 1.4)), 30, 'u'), 0.95, 0.3);
      if (s > 0.7) engrave(c, surfLines(L, (u, v) => lsh(u, v) - 0.35, Math.round(16 * s), 12, 'v', 0.04, 0.96), 0.7, 0.3);
      stipple(c, o, Math.round(260 * s * s), (px, py) => H.clamp(0.75 - Math.hypot(px - b[0], py - b[1]) / (60 * s)), H.rng(700 + i), 0.5 + 0.15 * s);
      const mr = []; for (let k = 0; k <= 20; k++) { const q = L(k / 20 * 0.95, 0); mr.push([q[0], q[1], 1.6 * (1 - k / 20) + 0.4]); } c.beginPath(); ribbonPath(c, mr); c.fill();
      contour(c, o, 0.5, 1.5);
    });
    const so = outline(S, 40); erase(c, so); wash(tc, so, '#6a8a42', 0.6, [2, -1]); engrave(c, surfLines(S, (u, v) => H.clamp(0.3 + 0.6 * v), 6, 40, 'u'), 0.8, 0.35);
    [0.3, 0.55].forEach((u) => { if (u > grow) return; const a = S(u, -1.2), b = S(u, 1.2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = 0.6 + 0.5 * s; c.stroke(); }); // nodes
    contour(c, so, 0.5, 1.3);
    const offs = [-1.05, 1.05, -0.52, 0.52, 0], base = -Math.PI / 2 + tilt;
    offs.forEach((d, i) => {
      const P = bladeS(hx, hy, base + d, (i === 4 ? 78 : 96) * s, 30 * s, d * 0.14, 0.72), o = outline(P, 40);
      erase(c, o); wash(tc, o, i < 2 ? '#a83a52' : '#c94f66', 0.55, [2.5, -1.5]);
      // the still's darker tint pooled at the petal base
      const pb = []; for (let k = 0; k <= 16; k++) pb.push(P(k / 16 * 0.45, -1)); for (let k = 16; k >= 0; k--) pb.push(P(k / 16 * 0.45, 1));
      wash(tc, pb, '#7a2a48', 0.26, [2.5, -1.5], 0.1);
      // engraving density follows the plate scale, so the big lilies get the still's close-set swelling lines
      const sh = (u, v) => H.clamp(0.2 + 0.36 * v * (d > 0 ? -1 : 1) + 0.5 * Math.pow(1 - u, 3.5) + 0.25 * Math.pow(Math.abs(v), 4) + (i < 2 ? 0.22 : 0.16) + 0.06 * Math.sin(u * 9 + i * 2.1 + v * 1.7) - 0.12 * Math.pow(u, 3));
      const nl = Math.max(13, Math.round(20 * s));
      engrave(c, surfLines(P, sh, nl, 30, 'u'), s > 1 ? 1.05 : 1.1, 0.25);
      engrave(c, surfLines(P, (u, v) => sh(u, v) - 0.3, Math.round(nl * 1.1), 18, 'v', 0.02, 0.98), 0.8, 0.3); // cross-hatch in the deepest shadow
      const mr = []; for (let k = 0; k <= 20; k++) { const q = P(k / 20 * 0.9, 0); mr.push([q[0], q[1], (1.1 * (1 - k / 20) + 0.3) * Math.min(1.3, s)]); } c.beginPath(); ribbonPath(c, mr); c.fill();
      stipple(c, o, Math.round(420 * s * s), (px, py) => H.clamp(0.8 - Math.hypot(px - hx, py - hy) / (34 * s)), H.rng(720 + i), 0.45 + 0.15 * s);
      // gold circuit trace
      const a0 = P(0.25, 0.3), a1 = P(0.5, 0.3), a2 = P(0.68, 0.55);
      c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.lineWidth = 2.4 * s + 0.6; c.stroke(); c.beginPath(); c.arc(a2[0], a2[1], 2.8 * s + 0.6, 0, TAU); c.fill();
      // engraved as a hollow double line (as in the still), so the gilt tint shows through it
      c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.lineWidth = (2.4 * s + 0.6) * 0.45; c.stroke(); c.beginPath(); c.arc(a2[0], a2[1], (2.8 * s + 0.6) * 0.6, 0, TAU); c.fill(); c.restore();
      tc.save(); tc.strokeStyle = 'rgba(214,160,70,0.85)'; tc.lineWidth = 3 * s + 1; tc.beginPath(); tc.moveTo(a0[0] + 1, a0[1]); tc.lineTo(a1[0] + 1, a1[1]); tc.lineTo(a2[0] + 1, a2[1]); tc.stroke(); tc.restore();
      contour(c, o, 0.6, 1.7);
    });
    return [hx, hy];
  }
  function bxDial(c, tc, x, y, R, ang) {
    const o = bxEll(x, y, R, R, 40); erase(c, o); wash(tc, o, '#c8a25a', 0.55, [1.5, -1]);
    bxHatch(c, o, Math.PI / 4, 2.6, (px, py) => H.clamp(0.3 + 0.5 * ((px - x) + (py - y)) / R / 1.4 + 0.3));
    const f = bxEll(x, y, R * 0.72, R * 0.72, 40); erase(c, f); contour(c, f, 0.6, 1.1); contour(c, o, 0.8, 2);
    c.lineWidth = 0.9; c.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.moveTo(x + Math.cos(a) * R * 0.58, y + Math.sin(a) * R * 0.58); c.lineTo(x + Math.cos(a) * R * 0.7, y + Math.sin(a) * R * 0.7); } c.stroke();
    c.beginPath(); ribbonPath(c, [[x - Math.cos(ang) * 6, y - Math.sin(ang) * 6, 3], [x, y, 4], [x + Math.cos(ang) * R * 0.6, y + Math.sin(ang) * R * 0.6, 0.6]]); c.fill();
    c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill();
  }
  function bxCartouche(c, tc, x, y, w, h, lines, sizes) {
    const o = []; for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, sx = Math.cos(a), sy = Math.sin(a); o.push([x + sx * w / 2 * (1 - 0.06 * Math.pow(Math.abs(sy), 6)), y + sy * h / 2 * (1 + 0.05 * Math.cos(a * 4))]); }
    erase(c, o); wash(tc, o, '#e9d9a8', 0.5, [1.5, -1]);
    contour(c, o, 0.8, 2.2); c.lineWidth = 0.6; poly(c, bxEll(x, y, w / 2 - 6, h / 2 - 6, 60)); c.stroke();
    [-1, 1].forEach((sg) => { c.beginPath(); ribbonPath(c, bxQ([x + sg * w / 2, y], [x + sg * (w / 2 + 30), y - 26], [x + sg * (w / 2 + 14), y - 40], 14).map((q, i) => [q[0], q[1], 2.4 * (1 - i / 14) + 0.4])); c.fill(); c.beginPath(); c.arc(x + sg * (w / 2 + 14), y - 40, 3, 0, TAU); c.fill(); });
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const tot = sizes.reduce((a, b) => a + b, 0); let yy = y - tot / 2;
    lines.forEach((l, i) => { yy += sizes[i] / 2; c.font = i === 0 && lines.length > 1 ? `italic 400 ${sizes[i]}px "Cormorant Garamond"` : `600 ${sizes[i]}px "Cormorant Garamond"`; c.fillText(l, x, yy); yy += sizes[i] / 2; });
    c.textBaseline = 'alphabetic';
  }
  function bxCompose(W, H_, fn, T, plateNo) {
    const out = H.layer(W, H_), o = out.getContext('2d');
    o.drawImage(bxPaper(W, H_), 0, 0);
    const ink = H.layer(W, H_), c = ink.getContext('2d'), tint = H.layer(W, H_), tc = tint.getContext('2d');
    c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = 1.4; c.strokeRect(62, 42, W - 124, H_ - 76); c.lineWidth = 0.6; c.strokeRect(67, 47, W - 134, H_ - 86);
    c.font = '400 13px "Libre Baskerville"'; c.textAlign = 'right'; c.fillText(plateNo, W - 74, 62); c.textAlign = 'left'; c.fillText('Vol. III.', 74, 62);
    fn(c, tc, T);
    tc.globalCompositeOperation = 'destination-in'; tc.drawImage(bxWashTex(W, H_), 0, 0);
    o.globalCompositeOperation = 'multiply'; o.filter = 'blur(0.8px)'; o.drawImage(tint, 0, 0); o.filter = 'none';
    o.globalAlpha = 0.25; o.filter = 'blur(0.9px)'; o.drawImage(ink, 0, 0); o.filter = 'none'; o.globalAlpha = 0.92; o.drawImage(ink, 0, 0);
    o.globalCompositeOperation = 'lighten'; o.globalAlpha = 1; o.fillStyle = 'rgb(38,30,24)'; o.fillRect(0, 0, W, H_);
    return out;
  }
  // watercolour bloom (red-ochre emphasis ring painted by the colourist)
  function bxRing(tc, x, y, rx, ry, p, col = '#b8382c') {
    if (p <= 0) return; tc.save(); tc.strokeStyle = H.rgba(col, 0.75); tc.lineCap = 'round';
    [9, 4].forEach((w, k) => { tc.lineWidth = w; tc.beginPath(); const a0 = -0.6; for (let i = 0; i <= 48 * p; i++) { const a = a0 + i / 48 * TAU * 1.08; const wob = 1 + 0.03 * Math.sin(a * 5 + k); const px = x + Math.cos(a) * rx * wob, py = y + Math.sin(a) * ry * wob; i ? tc.lineTo(px, py) : tc.moveTo(px, py); } tc.stroke(); });
    tc.restore();
  }

  // ===== END EXPLAINER HELPERS =====
  registerStyle({
    id: 'botanical-plate',
    name: 'Botanical Plate',
    category: 'Illustration',
    description: 'A hand-coloured copperplate natural-history plate: swelling engraved hatching that follows every form, loose transparent watercolour tints laid over the print, numbered figures, Latin italic captions and foxed rag paper with a pressed plate mark.',
    motion: 'The circuit-flower sways on its stem while the copper beetle flexes its antennae; tints bleed in a beat after the engraved lines appear.',
    fonts: ['italic 400 30px "Cormorant Garamond"', 'italic 400 16px "Cormorant Garamond"', '600 14px "Cormorant Garamond"', '400 14px "Libre Baskerville"', 'italic 400 15px "Libre Baskerville"'],
    frameT: 5.4,
    duration: 5.5,
    readsPixels: true,
    draw(ctx, W, H_, t) {
      BX_WASH = false;
      const r = H.rng(1847), nz = H.makeNoise(31);
      // ---------- paper ----------
      H.paper(ctx, W, H_, '#efe5cf', 19, 0.04);
      const eg = ctx.createRadialGradient(W / 2, H_ / 2, 300, W / 2, H_ / 2, 800);
      eg.addColorStop(0, 'rgba(170,130,70,0)'); eg.addColorStop(1, 'rgba(160,115,50,0.30)');
      ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H_);
      // plate tone inside plate mark
      const PM = [44, 30, W - 44, H_ - 26];
      ctx.fillStyle = 'rgba(150,120,80,0.06)'; ctx.fillRect(PM[0], PM[1], PM[2] - PM[0], PM[3] - PM[1]);

      const ink = H.layer(W, H_), c = ink.getContext('2d');
      const tint = H.layer(W, H_), tc = tint.getContext('2d');
      c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineJoin = 'round';
      const sway = Math.sin(t * 1.1) * 0.025;

      // ================= FIG. 1 — Silicoflora =================
      c.save(); tc.save(); c.translate(28, 0); tc.translate(28, 0);
      const S0 = [292, 586], S1 = [300, 470], S2 = [356, 340], S3 = [336 + sway * 300, 236];
      const stemAt = (u) => bez(S0, S1, S2, S3, u);
      const F = stemAt(1);

      // --- leaves (drawn before stem) ---
      const leaf = (u0, ang, len, wid, bend, sd, seed) => {
        const b = stemAt(u0);
        const S = bladeS(b[0], b[1], ang + sway, len, wid, bend, 0.62);
        const out = outline(S, 60);
        erase(c, out);
        wash(tc, out, '#6d8c45', 0.55, [2, -1.5]);
        // darker re-wash on shadow half
        const half = []; for (let k = 0; k <= 40; k++) half.push(S(k / 40, 0)); for (let k = 40; k >= 0; k--) half.push(S(k / 40, sd));
        wash(tc, half, '#3e5a2c', 0.32, [2, -1.5], 0.2);
        // vein-following engraving
        const sh = (u, v) => H.clamp(0.22 + 0.5 * (v * sd > 0 ? 1 : 0) * (0.6 + 0.4 * Math.abs(v)) + 0.3 * Math.pow(Math.abs(v), 3) + 0.25 * Math.pow(1 - u, 4) + 0.08 * nz.n2(u * 9 + seed, v * 3));
        const lines = [];
        const nk = 34;
        for (let k = 0; k < nk; k++) {
          const u0k = k / nk;
          [-1, 1].forEach((sg) => {
            const ln = [];
            for (let j = 0; j <= 10; j++) { const v = sg * j / 10, u = Math.min(0.995, u0k + 0.22 * Math.abs(v) * (1 - u0k * 0.5)); const p = S(u, v); ln.push([p[0], p[1], sh(u, v)]); }
            lines.push(ln);
          });
        }
        engrave(c, lines, 1.05, 0.3);
        // midrib
        const mr = []; for (let k = 0; k <= 30; k++) { const p = S(k / 30 * 0.97, 0); mr.push([p[0], p[1], 2.6 * (1 - k / 30) + 0.5]); }
        c.beginPath(); ribbonPath(c, mr); c.fill();
        // circuit traces as veins
        c.save(); c.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const uu = 0.18 + k * 0.15, sg = k % 2 ? 1 : -1;
          const a = S(uu, 0), m1 = S(uu + 0.06, sg * 0.35), e = S(uu + 0.14, sg * 0.78);
          const tr = [a, m1, e];
          c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(m1[0], m1[1]); c.lineTo(e[0], e[1]); c.lineWidth = 3.4; c.stroke();
          c.beginPath(); c.arc(e[0], e[1], 3.6, 0, TAU); c.fill();
          c.save(); c.globalCompositeOperation = 'destination-out';
          c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(m1[0], m1[1]); c.lineTo(e[0], e[1]); c.lineWidth = 1.6; c.stroke();
          c.beginPath(); c.arc(e[0], e[1], 2.3, 0, TAU); c.fill(); c.restore();
          c.beginPath(); c.arc(e[0], e[1], 0.9, 0, TAU); c.fill();
          tc.save(); tc.strokeStyle = 'rgba(206,150,60,0.75)'; tc.lineWidth = 3; tc.beginPath(); tc.moveTo(a[0] + 1, a[1]); tc.lineTo(m1[0] + 1, m1[1]); tc.lineTo(e[0] + 1, e[1]); tc.stroke();
          tc.fillStyle = 'rgba(206,150,60,0.8)'; tc.beginPath(); tc.arc(e[0] + 1, e[1], 3.5, 0, TAU); tc.fill(); tc.restore();
        }
        c.restore();
        contour(c, out, 0.6, 1.7);
      };
      leaf(0.30, -2.55, 205, 40, -0.16, 1, 1);
      leaf(0.50, -0.42, 182, 36, 0.18, -1, 7);
      leaf(0.70, -2.25, 120, 26, -0.2, 1, 3);

      // --- side bud ---
      {
        const b = stemAt(0.62), tip = [470 + sway * 200, 300];
        const bs = [[b[0], b[1]], [b[0] + 40, b[1] - 30], [tip[0] - 40, tip[1] + 50], [tip[0], tip[1]]];
        const ped = []; for (let k = 0; k <= 30; k++) { const p = bez(bs[0], bs[1], bs[2], bs[3], k / 30); ped.push([p[0], p[1], 3.2 - k / 30 * 1.0]); }
        c.beginPath(); ribbonPath(c, ped); c.fill();
        tc.save(); tc.strokeStyle = 'rgba(100,130,60,0.6)'; tc.lineWidth = 3; poly(tc, ped, false); tc.stroke(); tc.restore();
        const BS = bladeS(tip[0], tip[1], -1.05 + sway, 78, 17, 0.08, 0.55);
        const bo = outline(BS, 40);
        erase(c, bo); wash(tc, bo, '#b8475e', 0.5, [2, -1]);
        engrave(c, surfLines(BS, (u, v) => H.clamp(0.25 + 0.55 * (v + 1) / 2 + 0.3 * Math.pow(1 - u, 3)), 9, 30, 'u'), 1.05, 0.3);
        // sepals
        [-0.5, 0.4].forEach((da, i) => {
          const SS = bladeS(tip[0], tip[1], -1.05 + da + sway, 34, 8, i ? 0.25 : -0.25, 0.6);
          const so = outline(SS, 24); erase(c, so); wash(tc, so, '#55753a', 0.6, [2, -1]);
          engrave(c, surfLines(SS, (u, v) => 0.5 + 0.3 * v, 4, 20, 'u'), 0.9, 0.3); contour(c, so, 0.6, 1.3);
        });
        contour(c, bo, 0.6, 1.5);
      }

      // --- stem (tube) ---
      {
        const S = (u, v) => { const p = stemAt(u), p2 = stemAt(Math.min(1, u + 0.01)), p1 = stemAt(Math.max(0, u - 0.01)); let tx = p2[0] - p1[0], ty = p2[1] - p1[1]; const m = Math.hypot(tx, ty); const w = 5.5 - u * 1.8; return [p[0] - ty / m * w * v, p[1] + tx / m * w * v]; };
        const o = outline(S, 60); erase(c, o); wash(tc, o, '#6a8a42', 0.6, [2, -1]);
        engrave(c, surfLines(S, (u, v) => H.clamp(0.3 + 0.6 * v), 4, 60, 'u'), 1.0, 0.35);
        // nodes
        [0.3, 0.5, 0.62, 0.7].forEach((u) => { const a = S(u, -1.2), b = S(u, 1.2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = 1.2; c.stroke(); });
        contour(c, o, 0.6, 1.5);
      }

      // --- bulb + wire roots ---
      {
        const bc = [S0[0] - 2, S0[1] + 8];
        const roots = H.rng(8);
        c.lineCap = 'round';
        for (let k = 0; k < 13; k++) {
          let x = bc[0] + roots.range(-18, 18), y = bc[1] + 14, a = Math.PI / 2 + roots.range(-1.1, 1.1);
          const ln = [[x, y, 1.6]];
          const steps = roots.int(6, 11);
          for (let j = 0; j < steps; j++) { a += roots.range(-0.35, 0.35); x += Math.cos(a) * 4.2; y += Math.sin(a) * 3.2; ln.push([x, y, 1.6 - j / steps * 1.1]); }
          c.beginPath(); ribbonPath(c, ln); c.fill();
          if (roots.chance(0.6)) { c.beginPath(); c.arc(x, y, 1.5, 0, TAU); c.fill(); }
        }
        const bo = []; for (let k = 0; k <= 50; k++) { const a = k / 50 * TAU; const rr = 1 - 0.18 * Math.pow(Math.max(0, -Math.sin(a)), 3); bo.push([bc[0] + Math.cos(a) * 26 * rr, bc[1] + Math.sin(a) * 19 - Math.max(0, -Math.sin(a)) * 6]); }
        erase(c, bo); wash(tc, bo, '#b88a4a', 0.55, [2, -1]);
        // scale arcs
        const sl = [];
        for (let k = -3; k <= 3; k++) { const ln = []; for (let j = 0; j <= 20; j++) { const v = -1 + j / 10; const x = bc[0] + k * 7 + Math.sin(v * 1.4) * 2, y = bc[1] + v * 18 * Math.cos(k * 0.22); ln.push([x, y, H.clamp(0.35 + 0.08 * k + 0.25 * Math.abs(v))]); } sl.push(ln); }
        c.save(); poly(c, bo); c.clip(); engrave(c, sl, 1.0, 0.3); c.restore();
        // capacitor stripe band
        c.save(); poly(c, bo); c.clip(); c.fillStyle = 'rgba(0,0,0,0)';
        tc.save(); poly(tc, bo); tc.clip(); tc.fillStyle = 'rgba(70,90,120,0.45)'; tc.fillRect(bc[0] + 10, bc[1] - 30, 9, 60); tc.restore();
        c.fillStyle = '#000'; for (let k = 0; k < 3; k++) c.fillRect(bc[0] + 12, bc[1] - 9 + k * 7, 5, 1.2);
        c.restore();
        contour(c, bo, 0.7, 1.7);
      }

      // --- flower head ---
      {
        const petals = [
          { a: -1.62, len: 128, wid: 44, bend: 0.12, sd: -1, back: 1 },
          { a: -2.55, len: 150, wid: 46, bend: -0.2, sd: 1, back: 1 },
          { a: -0.62, len: 152, wid: 46, bend: 0.2, sd: -1, back: 1 },
          { a: 2.75, len: 130, wid: 44, bend: -0.28, sd: 1, back: 0 },
          { a: 0.42, len: 136, wid: 44, bend: 0.28, sd: -1, back: 0 },
          { a: 1.62, len: 72, wid: 40, bend: 0.05, sd: 1, back: 0 },
        ];
        petals.forEach((p, i) => {
          const S = bladeS(F[0], F[1], p.a + sway * 0.6, p.len, p.wid, p.bend, 0.72);
          const o = outline(S, 60);
          erase(c, o);
          wash(tc, o, p.back ? '#a83a52' : '#c94f66', 0.52, [2.5, -1.5]);
          const base = []; for (let k = 0; k <= 20; k++) base.push(S(k / 20 * 0.45, -1)); for (let k = 20; k >= 0; k--) base.push(S(k / 20 * 0.45, 1));
          wash(tc, base, '#7a2a48', 0.28, [2.5, -1.5], 0.1);
          const sh = (u, v) => H.clamp(0.2 + 0.36 * v * p.sd + 0.5 * Math.pow(1 - u, 3.5) + 0.25 * Math.pow(Math.abs(v), 4) + p.back * 0.12 + 0.07 * nz.n2(u * 7 + i * 3, v * 2));
          engrave(c, surfLines(S, sh, 22, 46, 'u'), 1.35, 0.25);
          // cross-hatch in deepest shadow
          engrave(c, surfLines(S, (u, v) => sh(u, v) - 0.3, 26, 22, 'v', 0.02, 0.98), 0.9, 0.3);
          // midrib
          const mr = []; for (let k = 0; k <= 24; k++) { const q = S(k / 24 * 0.92, 0.0); mr.push([q[0], q[1], 1.3 * (1 - k / 24) + 0.3]); }
          c.beginPath(); ribbonPath(c, mr); c.fill();
          // circuit traces along the petal
          [-0.42, 0.42].forEach((vv, j) => {
            if (p.len < 100 && j) return;
            const a0 = S(0.18, vv * 0.5), a1 = S(0.42, vv * 0.5), a2 = S(0.55, vv), a3 = S(0.7 + 0.06 * j, vv);
            const tr = [a0, a1, a2, a3];
            c.beginPath(); poly(c, tr, false); c.lineWidth = 3.3; c.stroke();
            c.beginPath(); c.arc(a3[0], a3[1], 3.4, 0, TAU); c.fill();
            c.save(); c.globalCompositeOperation = 'destination-out'; poly(c, tr, false); c.lineWidth = 1.5; c.stroke(); c.beginPath(); c.arc(a3[0], a3[1], 2.2, 0, TAU); c.fill(); c.restore();
            c.beginPath(); c.arc(a3[0], a3[1], 0.8, 0, TAU); c.fill();
            tc.save(); tc.strokeStyle = 'rgba(214,160,70,0.85)'; tc.lineWidth = 3; tc.translate(1.5, -1); poly(tc, tr, false); tc.stroke(); tc.beginPath(); tc.arc(a3[0], a3[1], 3.4, 0, TAU); tc.fillStyle = 'rgba(214,160,70,0.85)'; tc.fill(); tc.restore();
          });
          contour(c, o, 0.6, 1.8);
        });
        // stamens with solder-ball anthers
        const st = [[-1.95, 70], [-1.55, 82], [-1.2, 74], [-2.35, 60], [-0.85, 62], [-1.75, 56]];
        st.forEach(([a, len], i) => {
          const aa = a + sway + Math.sin(t * 2 + i) * 0.03;
          const e = [F[0] + Math.cos(aa) * len, F[1] + Math.sin(aa) * len];
          const m = [F[0] + Math.cos(aa + 0.25) * len * 0.5, F[1] + Math.sin(aa + 0.25) * len * 0.5];
          const fl = []; for (let k = 0; k <= 16; k++) { const tt = k / 16, x = (1 - tt) * (1 - tt) * F[0] + 2 * (1 - tt) * tt * m[0] + tt * tt * e[0], y = (1 - tt) * (1 - tt) * F[1] + 2 * (1 - tt) * tt * m[1] + tt * tt * e[1]; fl.push([x, y, 1.5 - tt * 0.6]); }
          c.beginPath(); ribbonPath(c, fl); c.fill();
          tc.save(); tc.strokeStyle = 'rgba(190,170,60,0.55)'; tc.lineWidth = 2.5; poly(tc, fl, false); tc.stroke(); tc.restore();
          const R = 5.2;
          const ball = []; for (let k = 0; k < 24; k++) ball.push([e[0] + Math.cos(k / 24 * TAU) * R, e[1] + Math.sin(k / 24 * TAU) * R]);
          erase(c, ball);
          wash(tc, ball, '#9aa0a6', 0.6, [1, -0.5]);
          // crescent shading lines
          const cl = []; for (let k = 0; k < 5; k++) { const ln = []; for (let j = 0; j <= 10; j++) { const a2 = -0.6 + j / 10 * 2.6; const rr = R * (0.95 - k * 0.15); ln.push([e[0] + Math.cos(a2) * rr, e[1] + Math.sin(a2) * rr, H.clamp(0.9 - k * 0.12 - Math.abs(a2 - 0.7) * 0.25)]); } cl.push(ln); }
          engrave(c, cl, 0.9, 0.3);
          contour(c, ball, 0.6, 1.4);
        });
        // pistil: tiny die with legs
        {
          const ang = -1.6 + sway, ca = Math.cos(ang), sa = Math.sin(ang);
          const T = (x, y) => [F[0] + x * -sa + y * ca, F[1] + x * ca + y * sa];
          // style column
          const col = [T(-3, 0), T(3, 0), T(3, 38), T(-3, 38)];
          erase(c, col); wash(tc, col, '#a9b34e', 0.6, [1, -1]);
          engrave(c, [0, 1, 2].map((k) => { const ln = []; for (let j = 0; j <= 10; j++) { const p = T(-1.5 + k * 1.5, j * 3.8); ln.push([p[0], p[1], 0.4 + k * 0.25]); } return ln; }), 0.9, 0.3);
          contour(c, col, 0.6, 1.2);
          const die = [T(-9, 38), T(9, 38), T(9, 54), T(-9, 54)];
          c.lineWidth = 1.1;
          for (let k = 0; k < 4; k++) { [[-9, -13], [9, 13]].forEach(([x0, x1]) => { const a = T(x0, 41 + k * 3.8), b = T(x1, 41 + k * 3.8); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }); }
          erase(c, die); wash(tc, die, '#3d3a3a', 0.45, [1, -1]);
          engrave(c, [0, 1, 2, 3, 4, 5].map((k) => [T(-8, 39.5 + k * 2.6), T(8, 39.5 + k * 2.6)].map((p, j) => [p[0], p[1], 0.65 + j * 0.2])), 0.9, 0.3);
          contour(c, die, 0.8, 1.4);
          const dot = T(-5.5, 50.5); c.beginPath(); c.arc(dot[0], dot[1], 1.4, 0, TAU); c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore();
        }
      }

      // ================= FIG. 2 — Scarabaeus machinalis =================
      c.restore(); tc.restore();
      c.save(); tc.save();
      [c, tc].forEach((k) => { k.translate(958, 300); k.scale(0.86, 0.86); k.translate(-948, -300); });
      {
        const bx = 948, by = 112;
        const L = (x, y) => [bx + x, by + y];
        const legPhase = Math.sin(t * 3) * 0.04;
        // legs first (explicit joint chains: coxa, femur, tibia, tarsi)
        const legDefs = [
          [[40, 128], [92, 112], [118, 58], [124, 40], [128, 26], [131, 12]],
          [[50, 188], [116, 196], [158, 244], [168, 262], [176, 278], [182, 294]],
          [[44, 236], [110, 282], [128, 356], [131, 376], [134, 394], [137, 412]],
        ];
        [-1, 1].forEach((sg) => legDefs.forEach((def, li) => {
          const wob = Math.sin(t * 3 + li * 2 + sg) * 3;
          const pts = def.map(([x, y], k) => L(sg * (x + (k > 1 ? wob * 0.5 : 0)), y + (k > 1 ? wob : 0)));
          const widths = [15, 11, 5.6, 5, 4.4];
          for (let k = 0; k < pts.length - 1; k++) {
            const p0 = pts[k], p1 = pts[k + 1], len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), w = widths[k];
            const px = -(p1[1] - p0[1]) / len, py = (p1[0] - p0[0]) / len;
            const S = (u, v) => { const ww = w * (k === 0 ? (0.75 + 0.35 * Math.sin(Math.PI * u)) : (1 - 0.3 * u)) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * u - 1, 10))); return [p0[0] + (p1[0] - p0[0]) * u + px * ww * v / 2, p0[1] + (p1[1] - p0[1]) * u + py * ww * v / 2]; };
            const o = outline(S, 24);
            erase(c, o); wash(tc, o, k < 2 ? '#4a5a4a' : '#6a5532', 0.6, [1.5, -1]);
            engrave(c, surfLines(S, (u, v) => H.clamp(0.3 + 0.55 * v * sg * Math.sign(py || 1) + 0.1), k < 2 ? 6 : 2, 24, 'u'), 1.0, 0.3);
            contour(c, o, 0.6, 1.5);
            // tibial spines
            if (k === 1) for (let j = 1; j < 6; j++) { const q = S(j / 6, 1), q2 = [q[0] + px * 5 + (p1[0] - p0[0]) / len * 3, q[1] + py * 5 + (p1[1] - p0[1]) / len * 3]; c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q2[0], q2[1]); c.lineWidth = 1.1; c.stroke(); }
            if (k < 2) { const j = p1; c.beginPath(); c.arc(j[0], j[1], 3.6, 0, TAU); c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore(); c.lineWidth = 1; c.stroke(); c.beginPath(); c.moveTo(j[0] - 2.2, j[1] - 1); c.lineTo(j[0] + 2.2, j[1] + 1); c.stroke(); wash(tc, [[j[0] - 3, j[1] - 3], [j[0] + 3, j[1] - 3], [j[0] + 3, j[1] + 3], [j[0] - 3, j[1] + 3]], '#b9893e', 0.6, [0, 0]); }
          }
          // claws
          const e = pts[pts.length - 1], d = pts[pts.length - 2], a = Math.atan2(e[1] - d[1], e[0] - d[0]);
          [-0.7, 0.7].forEach((da) => { c.beginPath(); c.moveTo(e[0], e[1]); c.quadraticCurveTo(e[0] + Math.cos(a + da * 0.4) * 7, e[1] + Math.sin(a + da * 0.4) * 7, e[0] + Math.cos(a + da * 1.6) * 7, e[1] + Math.sin(a + da * 1.6) * 7); c.lineWidth = 1.1; c.stroke(); });
        }));
        // antennae: chain of beads
        [-1, 1].forEach((sg) => {
          const pts = [];
          for (let k = 0; k < 11; k++) {
            const tt = k / 10, aw = Math.sin(t * 1.7 + sg) * 0.08;
            pts.push(L(sg * (12 + tt * 70 + Math.sin(tt * 3) * 10), 30 - tt * 72 + tt * tt * 30 + Math.sin(tt * 4 + aw * 10) * 4));
          }
          pts.forEach((p, k) => {
            const rr = k > 7 ? 5.2 : 3.2;
            const bo = []; for (let j = 0; j < 18; j++) bo.push([p[0] + Math.cos(j / 18 * TAU) * rr, p[1] + Math.sin(j / 18 * TAU) * rr * 0.8]);
            erase(c, bo); wash(tc, bo, '#6d5530', 0.6, [1, -0.5]);
            engrave(c, [[0.4, 0.5], [0.7, 0.8]].map(([s0]) => { const ln = []; for (let j = 0; j <= 8; j++) { const a2 = -0.3 + j / 8 * 2; ln.push([p[0] + Math.cos(a2) * rr * s0, p[1] + Math.sin(a2) * rr * 0.8 * s0, 0.8]); } return ln; }), 0.8, 0.3);
            contour(c, bo, 0.5, 1.1);
          });
        });
        // head
        const head = []; for (let k = 0; k <= 40; k++) { const a = Math.PI + k / 40 * Math.PI; head.push(L(Math.cos(a) * 40, 52 + Math.sin(a) * 34)); }
        head.push(L(40, 62)); head.push(L(-40, 62));
        erase(c, head); wash(tc, head, '#2f6f6a', 0.55, [2, -1]);
        const HS = (u, v) => { const a = Math.PI + u * Math.PI; return L(Math.cos(a) * 40 * (0.2 + 0.8 * (v + 1) / 2), 56 + Math.sin(a) * 34 * (0.2 + 0.8 * (v + 1) / 2)); };
        engrave(c, surfLines(HS, (u, v) => H.clamp(0.25 + 0.55 * u * (v + 1) / 2 + 0.15 * (1 - (v + 1) / 2)), 9, 30, 'v', 0.02, 0.98), 1.0, 0.3);
        // mandibles (sickle-shaped, tapered)
        [-1, 1].forEach((sg) => {
          const m0 = L(sg * 15, 26), m1 = L(sg * 34, 2), m2 = L(sg * 5, -12);
          const run = []; for (let k = 0; k <= 16; k++) { const tt = k / 16, x = (1 - tt) * (1 - tt) * m0[0] + 2 * (1 - tt) * tt * m1[0] + tt * tt * m2[0], y = (1 - tt) * (1 - tt) * m0[1] + 2 * (1 - tt) * tt * m1[1] + tt * tt * m2[1]; run.push([x, y, 11 * (1 - tt) + 0.6]); }
                    c.beginPath(); ribbonPath(c, run); c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore();
          tc.save(); tc.translate(1.5, -1); tc.beginPath(); ribbonPath(tc, run); tc.fillStyle = 'rgba(80,60,34,0.6)'; tc.fill(); tc.restore();
          engrave(c, [0.2, -0.1, -0.4].map((o) => run.map((q, k) => { const a = run[Math.max(0, k - 1)], b = run[Math.min(16, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1; return [q[0] - ty / m * q[2] * o * sg, q[1] + tx / m * q[2] * o * sg, 0.55 + o * 0.6 * -1]; })), 0.9, 0.3);
          const edge1 = run.map((q, k) => { const a = run[Math.max(0, k - 1)], b = run[Math.min(16, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1; return [q[0] - ty / m * q[2] / 2, q[1] + tx / m * q[2] / 2, 1.3]; });
          const edge2 = run.map((q, k) => { const a = run[Math.max(0, k - 1)], b = run[Math.min(16, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1; return [q[0] + ty / m * q[2] / 2, q[1] - tx / m * q[2] / 2, 1.3]; });
          c.beginPath(); ribbonPath(c, edge1); ribbonPath(c, edge2); c.fill();
        });
        // lens eyes
        [-1, 1].forEach((sg) => {
          const ec = L(sg * 24, 40);
          const eo = []; for (let k = 0; k < 30; k++) eo.push([ec[0] + Math.cos(k / 30 * TAU) * 9, ec[1] + Math.sin(k / 30 * TAU) * 9]);
          erase(c, eo); wash(tc, eo, '#b0442c', 0.6, [1, -0.5]);
          [9, 6.4, 3.6].forEach((rr, k) => { const ln = []; for (let j = 0; j <= 30; j++) { const a = j / 30 * TAU; ln.push([ec[0] + Math.cos(a) * rr, ec[1] + Math.sin(a) * rr, H.clamp(0.45 + 0.4 * Math.sin(a + 0.8) + k * 0.1)]); } engrave(c, [ln], k ? 0.9 : 1.6, 0.05); });
          c.beginPath(); c.arc(ec[0] - 2.5, ec[1] - 2.5, 1.6, 0, TAU); c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore();
        });
        contour(c, head, 0.7, 1.8);
        // pronotum
        const PN = (u, v) => { const y = 56 + u * 90; const hw = H.lerp(50, 82, Math.pow(u, 0.7)) * (1 - 0.1 * Math.pow(2 * u - 1, 6)); return L(v * hw, y + 10 * Math.pow(Math.abs(v), 3) * (u < 0.5 ? 1 : -0.4)); };
        const pno = outline(PN, 40);
        erase(c, pno); wash(tc, pno, '#2b7a72', 0.55, [2, -1.5]);
        const pnsh = (u, v) => H.clamp(0.18 + 0.6 * Math.pow(Math.abs(v + 0.25), 2) + 0.2 * u + 0.12 * (v > 0 ? 1 : 0));
        engrave(c, surfLines(PN, pnsh, 30, 30, 'u'), 1.1, 0.3);
        engrave(c, surfLines(PN, (u, v) => pnsh(u, v) - 0.3, 14, 30, 'v', 0.02, 0.98), 0.8, 0.3);
        // vents on pronotum
        [-1, 1].forEach((sg) => { for (let k = 0; k < 4; k++) { const a = L(sg * 22, 92 + k * 9), b = L(sg * 44, 94 + k * 9); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = 2.4; c.stroke(); } });
        { const a = L(0, 68), b = L(0, 144); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = 0.9; c.stroke(); }
        contour(c, pno, 0.7, 1.9);
        // elytra
        [-1, 1].forEach((sg) => {
          const EL = (u, v) => {
            const y = 152 + u * 218; const vv = (v + 1) / 2;
            const hw = 84 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.32 + u * 0.68)), 0.55) * (u < 0.08 ? 0.93 + u : 1);
            return L(sg * (2 + vv * hw), y - Math.pow(vv, 2) * Math.pow(u, 6) * 40 + Math.pow(vv, 3) * (1 - u) * 6);
          };
          const eo = outline(EL, 60);
          erase(c, eo);
          // iridescent wash: green->blue->copper
          tc.save(); tc.translate(2, -1.5); poly(tc, eo);
          const gr = tc.createLinearGradient(bx, by + 150, bx + sg * 40, by + 380);
          gr.addColorStop(0, 'rgba(40,128,110,0.6)'); gr.addColorStop(0.5, 'rgba(48,96,140,0.55)'); gr.addColorStop(1, 'rgba(172,98,52,0.6)');
          tc.fillStyle = gr; tc.fill(); tc.strokeStyle = 'rgba(30,70,90,0.35)'; tc.lineWidth = 2.2; tc.stroke(); tc.restore();
          const esh = (u, v) => { const vv = (v + 1) / 2; return H.clamp(0.12 + 1.6 * Math.pow(vv - (sg < 0 ? 0.38 : 0.3), 2) * 2.2 + 0.25 * Math.pow(u, 2) + (sg > 0 ? 0.1 : 0) + 0.05 * nz.n2(u * 12, vv * 4)); };
          engrave(c, surfLines(EL, esh, 26, 60, 'u'), 1.25, 0.26);
          engrave(c, surfLines(EL, (u, v) => esh(u, v) - 0.36, 40, 26, 'v', 0.01, 0.99), 0.85, 0.3);
          // striae: rows of punctures
          c.beginPath();
          for (let k = 1; k <= 5; k++) { const v = -1 + k * 0.33; for (let j = 2; j < 36; j++) { const p = EL(j / 40, v); c.moveTo(p[0] + 1.1, p[1]); c.arc(p[0], p[1], 1.1, 0, TAU); } }
          c.fill();
          // rivets along the seam
          for (let j = 1; j < 9; j++) { const p = EL(j / 10, -0.86); c.beginPath(); c.arc(p[0], p[1], 2.6, 0, TAU); c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore(); c.lineWidth = 0.9; c.stroke(); c.beginPath(); c.arc(p[0] + 0.8, p[1] + 0.8, 1.6, 0.2, 2.2); c.stroke(); }
          contour(c, eo, 0.8, 2.1);
        });
        // scutellum
        const sc = [L(-12, 150), L(12, 150), L(0, 176)]; erase(c, sc); wash(tc, sc, '#2b7a72', 0.6); contour(c, sc, 0.7, 1.4);
        engrave(c, [[L(-6, 154), L(0, 168)].map((p) => [p[0], p[1], 0.8])], 0.9, 0.3);
      }
      c.restore(); tc.restore();
      // ================= FIG. 5 — anthera aucta =================
      {
        const cx = 652, cy = 300, R = 31;
        const f0 = [cx - 58, cy + 118], f1 = [cx - 40, cy + 60], f2 = [cx - 6, cy + R - 2];
        const fl = []; for (let k = 0; k <= 24; k++) { const tt = k / 24, x = (1 - tt) * (1 - tt) * f0[0] + 2 * (1 - tt) * tt * f1[0] + tt * tt * f2[0], y = (1 - tt) * (1 - tt) * f0[1] + 2 * (1 - tt) * tt * f1[1] + tt * tt * f2[1]; fl.push([x, y, 9 - tt * 3]); }
        c.beginPath(); ribbonPath(c, fl); c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(); c.restore();
        tc.save(); tc.translate(1.5, -1); tc.beginPath(); ribbonPath(tc, fl); tc.fillStyle = 'rgba(170,165,70,0.55)'; tc.fill(); tc.restore();
        const fe = (o) => fl.map((q, k) => { const a = fl[Math.max(0, k - 1)], b = fl[Math.min(24, k + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1; return [q[0] - ty / m * q[2] * o, q[1] + tx / m * q[2] * o, 0.3 + 0.9 * (o + 0.5)]; });
        engrave(c, [-0.25, -0.05, 0.15, 0.32].map(fe), 0.9, 0.3);
        c.beginPath(); ribbonPath(c, fe(-0.5).map((q) => [q[0], q[1], 0.9])); ribbonPath(c, fe(0.5).map((q) => [q[0], q[1], 1.5])); c.fill();
        { const a = fe(-0.5)[0], b = fe(0.5)[0]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineWidth = 1; c.stroke(); }
        const so = []; for (let k = 0; k < 64; k++) so.push([cx + Math.cos(k / 64 * TAU) * R, cy + Math.sin(k / 64 * TAU) * R]);
        erase(c, so); wash(tc, so, '#8f9aa2', 0.55, [2, -1.5]);
        tc.save(); poly(tc, so); tc.clip(); const rg = tc.createRadialGradient(cx + 18, cy + 18, 2, cx + 18, cy + 18, 22); rg.addColorStop(0, 'rgba(205,160,90,0.55)'); rg.addColorStop(1, 'rgba(205,160,90,0)'); tc.fillStyle = rg; tc.fillRect(cx - R, cy - R, 2 * R, 2 * R); tc.restore();
        const fam = (dx, dy, n, off) => {
          const out = [], px = -dy, py = dx;
          for (let i = 0; i < n; i++) {
            const o = -R + (i + 0.5) * 2 * R / n, half = Math.sqrt(Math.max(0, R * R - o * o)), ln = [];
            for (let j = 0; j <= 24; j++) {
              const sv = -half + 2 * half * j / 24, bow = 0.22 * half * (1 - Math.pow(sv / (half || 1), 2));
              const x = cx + dx * (o + bow) + px * sv, y = cy + dy * (o + bow) + py * sv;
              const lx = (x - cx) / R, ly = (y - cy) / R, z = Math.sqrt(Math.max(0, 1 - lx * lx - ly * ly));
              const lit = -0.55 * lx - 0.6 * ly + 0.58 * z;
              const refl = H.smooth(0.55, 1, (lx + ly) / 1.414) * 0.35;
              ln.push([x, y, H.clamp(0.75 - 0.75 * lit - refl + off)]);
            }
            out.push(ln);
          }
          return out;
        };
        engrave(c, fam(0.6, 0.8, 26, 0.12), 1.3, 0.12, 1.1);
        engrave(c, fam(0.8, -0.6, 24, -0.22), 0.95, 0.3);
        contour(c, so, 0.7, 2.0);
      }

      // ================= FIG. 3 — semen (seed chip) =================
      {
        const cx = 672, cy = 566;
        const so = []; for (let k = 0; k < 50; k++) { const a = k / 50 * TAU; so.push([cx + Math.cos(a) * 38, cy + Math.sin(a) * 25 * (1 + 0.15 * Math.cos(a))]); }
        // legs
        for (let k = 0; k < 6; k++) { [-1, 1].forEach((sg) => { const x = cx - 22 + k * 9; c.beginPath(); c.moveTo(x, cy + sg * 18); c.lineTo(x, cy + sg * 32); c.lineWidth = 2.6; c.stroke(); }); }
        erase(c, so); wash(tc, so, '#8a6a3c', 0.55, [2, -1]);
        const SS = (u, v) => [cx + (u * 2 - 1) * 38 * Math.sqrt(1 - v * v * 0.0), cy + v * 25 * Math.sqrt(Math.max(0, 1 - Math.pow(u * 2 - 1, 2)))];
        engrave(c, surfLines(SS, (u, v) => H.clamp(0.2 + 0.55 * (v + 1) / 2 + 0.3 * Math.pow(u, 3)), 14, 30, 'u'), 1.1, 0.3);
        const dz = [[cx - 13, cy - 9], [cx + 13, cy - 9], [cx + 13, cy + 9], [cx - 13, cy + 9]];
        erase(c, dz); wash(tc, dz, '#c69a48', 0.7, [1, -1]);
        c.lineWidth = 0.8; c.beginPath(); for (let k = 1; k < 4; k++) { c.moveTo(cx - 13, cy - 9 + k * 4.5); c.lineTo(cx + 13, cy - 9 + k * 4.5); c.moveTo(cx - 13 + k * 6.5, cy - 9); c.lineTo(cx - 13 + k * 6.5, cy + 9); } c.stroke();
        contour(c, dz, 0.7, 1.2); contour(c, so, 0.7, 1.8);
      }
      // ================= FIG. 4 — caulis sectio transversa =================
      {
        const cx = 1150, cy = 548, R = 46;
        const ring = (rr, n = 64) => { const o = []; for (let k = 0; k < n; k++) o.push([cx + Math.cos(k / n * TAU) * rr, cy + Math.sin(k / n * TAU) * rr]); return o; };
        wash(tc, ring(R), '#7d9a52', 0.5, [2, -1]);
        wash(tc, ring(R - 9), '#d6d29a', 0.45, [2, -1]);
        stipple(c, ring(R - 1), 2600, (x, y) => { const d = Math.hypot(x - cx, y - cy); return d > R - 9 ? 0.55 : 0.12 + 0.15 * ((x - cx + y - cy) / R + 1); }, H.rng(4), 0.55);
        contour(c, ring(R), 0.9, 2); contour(c, ring(R - 9), 0.5, 0.9);
        // vascular bundles = insulated wires
        for (let k = 0; k < 7; k++) {
          const a = k / 7 * TAU + 0.3, wx = cx + Math.cos(a) * (R - 20), wy = cy + Math.sin(a) * (R - 20);
          const ob = ring(0).map(() => 0);
          const outer = []; for (let j = 0; j < 24; j++) outer.push([wx + Math.cos(j / 24 * TAU) * 7.5, wy + Math.sin(j / 24 * TAU) * 7.5]);
          erase(c, outer); wash(tc, outer, '#5d6b78', 0.45, [1, -0.5]);
          c.save(); poly(c, outer); c.clip(); c.beginPath(); for (let j = -10; j <= 10; j++) { c.moveTo(wx - 10, wy + j * 2.2 - 10); c.lineTo(wx + 10, wy + j * 2.2 + 10); } c.lineWidth = 0.6; c.stroke(); c.restore();
          const core = []; for (let j = 0; j < 18; j++) core.push([wx + Math.cos(j / 18 * TAU) * 3.6, wy + Math.sin(j / 18 * TAU) * 3.6]);
          erase(c, core); wash(tc, core, '#c7782e', 0.85, [0.5, 0]);
          contour(c, core, 0.6, 1.0); contour(c, outer, 0.6, 1.3);
        }
        const core = ring(9, 30); erase(c, core); wash(tc, core, '#c7782e', 0.8, [0.5, 0]);
        c.save(); poly(c, core); c.clip(); c.beginPath(); for (let j = -6; j <= 6; j++) { c.moveTo(cx - 10, cy + j * 2.4 - 10); c.lineTo(cx + 10, cy + j * 2.4 + 10); } c.lineWidth = 0.7; c.stroke(); c.restore();
        contour(c, core, 0.6, 1.2);
      }

      // ---------- lettering ----------
      c.textBaseline = 'alphabetic';
      c.font = 'italic 400 17px "Libre Baskerville"'; c.textAlign = 'center';
      c.fillText('1.', 196, 470); c.fillText('2.', 1150, 150); c.fillText('3.', 672, 628); c.fillText('4.', 1150, 618); c.fillText('5.', 652, 252);
      c.font = '400 13px "Libre Baskerville"'; c.textAlign = 'right'; c.fillText('Pl. XXIV.', W - 74, 62);
      c.textAlign = 'left'; c.fillText('Vol. III.', 74, 62);
      c.textAlign = 'center'; c.font = '600 15px "Cormorant Garamond"';
      c.fillText('F  L  O  R  A     E  L  E  C  T  R  I  C  A', W / 2, 62);
      c.font = 'italic 400 31px "Cormorant Garamond"'; c.fillText('Silicoflora mirabilis, & Scarabaeus machinalis.', W / 2, 658);
      c.font = 'italic 400 16px "Cormorant Garamond"';
      c.fillText('1. Flos, caulis et bulbus.   2. Scarabaeus, a dorso visus.   3. Semen.   4. Caulis sectio transversa.   5. Anthera, aucta.', W / 2, 682);
      c.font = 'italic 400 12px "Libre Baskerville"'; c.textAlign = 'left'; c.fillText('E. Marlowe del.', 74, 682);
      c.textAlign = 'right'; c.fillText('T. Grieve sculp.', W - 74, 682);
      // ruled border inside plate mark
      c.lineWidth = 1.4; c.strokeRect(62, 42, W - 124, H_ - 76);
      c.lineWidth = 0.6; c.strokeRect(67, 47, W - 134, H_ - 86);
      // rule under caption heading
      c.lineWidth = 0.6; c.beginPath(); c.moveTo(W / 2 - 60, 666); c.lineTo(W / 2 + 60, 666); c.stroke();

      // ---------- watercolour grain/variation on tint layer ----------
      {
        const img = tc.getImageData(0, 0, W, H_), d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          const p = i >> 2, x = p % W, y = (p / W) | 0;
          const v = 0.7 + 0.42 * nz.fbm2(x * 0.018, y * 0.018, 3) + 0.14 * nz.n2(x * 0.35, y * 0.35);
          d[i + 3] = H.clamp(d[i + 3] * v / 255) * 255;
        }
        tc.putImageData(img, 0, 0);
      }
      // ---------- composite ----------
      // build 1: the print is pulled — ink appears behind the press roller sweeping left to right
      const front = H.lerp(-80, W + 80, H.ease.inOut(H.clamp((t - 0.1) / 1.7)));
      if (front < W + 60) {
        ink.getContext('2d').save();
        const ic = ink.getContext('2d'); ic.globalCompositeOperation = 'destination-in';
        const mg = ic.createLinearGradient(front - 70, 0, front, 0); mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
        ic.fillStyle = mg; ic.fillRect(0, 0, W, H_); ic.restore();
      }
      // build 2: the colourist's washes bloom out figure by figure (noisy wet edge)
      const blooms = [[350, 250, 1.7, 240], [300, 430, 2.0, 230], [505, 295, 2.15, 70], [958, 300, 2.35, 290], [652, 300, 2.7, 80], [672, 566, 2.9, 64], [1150, 548, 3.05, 64], [292, 595, 2.2, 50]];
      if (t < 4.2) {
        const mw = 320, mh = 180, m = H.layer(mw, mh), mc = m.getContext('2d'), mi = mc.createImageData(mw, mh), md = mi.data;
        const rads = blooms.map(([, , t0, R]) => R * 1.25 * H.ease.out(H.clamp((t - t0) / 1.0)));
        for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
          const X = x * 4, Y = y * 4, nn = nz.fbm2(X * 0.012, Y * 0.012, 3) * 34;
          let a = 0;
          for (let k = 0; k < blooms.length; k++) { if (!rads[k]) continue; const dd = Math.hypot(X - blooms[k][0], Y - blooms[k][1]); a = Math.max(a, H.clamp((rads[k] + nn - dd) / 14)); }
          md[(y * mw + x) * 4 + 3] = a * 255;
        }
        mc.putImageData(mi, 0, 0);
        tc.save(); tc.globalCompositeOperation = 'destination-in'; tc.imageSmoothingEnabled = true; tc.drawImage(m, 0, 0, W, H_); tc.restore();
      }
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.filter = 'blur(0.8px)'; ctx.drawImage(tint, 0, 0); ctx.filter = 'none';
      ctx.globalAlpha = 0.25; ctx.filter = 'blur(0.9px)'; ctx.drawImage(ink, 0, 0); ctx.filter = 'none';
      ctx.globalAlpha = 0.92; ctx.drawImage(ink, 0, 0);
      ctx.restore();
      // ink tone: warm brown-black
      ctx.save(); ctx.globalCompositeOperation = 'lighten'; ctx.fillStyle = 'rgb(38,30,24)'; ctx.fillRect(0, 0, W, H_); ctx.restore();

      // ---------- foxing ----------
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      for (let i = 0; i < 110; i++) {
        let x = r() * W, y = r() * H_;
        if (r.chance(0.55)) { x = r.chance(0.5) ? r() * 200 : W - r() * 200; }
        const rad = r.range(1, r.chance(0.12) ? 12 : 4);
        const fg = ctx.createRadialGradient(x, y, 0, x, y, rad);
        fg.addColorStop(0, `rgba(160,100,45,${r.range(0.2, 0.5)})`); fg.addColorStop(0.5, 'rgba(170,110,55,0.15)'); fg.addColorStop(1, 'rgba(170,110,55,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
      }
      ctx.restore();
      // plate mark (pressed edge)
      ctx.save();
      ctx.strokeStyle = 'rgba(110,80,40,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(PM[0], PM[1], PM[2] - PM[0], PM[3] - PM[1]);
      ctx.strokeStyle = 'rgba(255,250,235,0.55)'; ctx.lineWidth = 2; ctx.strokeRect(PM[0] - 2, PM[1] - 2, PM[2] - PM[0] + 4, PM[3] - PM[1] + 4);
      ctx.strokeStyle = 'rgba(110,80,40,0.12)'; ctx.lineWidth = 4; ctx.strokeRect(PM[0] + 3, PM[1] + 3, PM[2] - PM[0] - 6, PM[3] - PM[1] - 6);
      ctx.restore();
      // press roller passing over the sheet during the pull
      if (front > -60 && front < W + 60) {
        const rg2 = ctx.createLinearGradient(front - 90, 0, front + 30, 0);
        rg2.addColorStop(0, 'rgba(60,40,20,0)'); rg2.addColorStop(0.6, 'rgba(60,40,20,0.16)'); rg2.addColorStop(0.8, 'rgba(255,250,235,0.18)'); rg2.addColorStop(1, 'rgba(60,40,20,0)');
        ctx.fillStyle = rg2; ctx.fillRect(front - 90, 0, 120, H_);
      }
      H.grain(ctx, W, H_, 0.045, 5 + Math.floor(t * 12));
    },
    // ===== EXPLAINER =====
    explainerDuration: 14.5,
    explainerNote: 'Three plates from a naturalist\'s folio, each pulled fresh under the press roller: engraved specimens of cats and dogs feed the circuit-lily "model", a life-cycle plate with fletched engraved arrows shows Guess, Check and Adjust, and a growth-stage plate counts accuracy in an engraved cartouche, with the colourist\'s red wash ringing the key moments.',
    explainer(ctx, W, H_, t) {
      BX_WASH = true;
      const cl = H.clamp, ease = H.ease.inOut;
      // ---------- PLATE XXV: the examples ----------
      const plateA = (c, tc, T) => {
        // title: engraved large, then set as the running head
        const k = ease(cl((T - 1.6) / 0.6));
        const y = H.lerp(380, 72, k), fs = H.lerp(96, 28, k);
        c.font = `italic 400 ${fs}px "Cormorant Garamond"`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        const txt = 'How does AI learn?', tw = c.measureText(txt).width;
        c.save(); c.beginPath(); c.rect(W / 2 - tw / 2 - 10, y - fs, (tw + 20) * cl((T - 0.15) / 1.0), fs * 1.4); c.clip(); c.fillText(txt, W / 2, y); c.restore();
        if (k < 1 && T > 1.0) { c.lineWidth = 0.8; c.beginPath(); c.moveTo(W / 2 - tw * 0.3, y + 22); c.lineTo(W / 2 + tw * 0.3, y + 22); c.stroke(); }
        if (T < 2.2) return;
        // specimens grid
        const G = []; for (let i = 0; i < 9; i++) G.push([180 + (i % 3) * 150, 170 + Math.floor(i / 3) * 172, [1, 0, 1, 1, 0, 1, 0, 1, 0][i]]);
        G.forEach(([x, y2, cat], i) => { if (T > 2.3 + i * 0.12) bxSpecimen(c, tc, x, y2, !!cat, 1.0, `${i + 1}.`); });
        // the model
        const [hx, hy] = bxLily(c, tc, 1010, 610, 1.6, Math.sin(T * 1.1) * 0.04);
        c.font = 'italic 600 40px "Cormorant Garamond"'; c.textAlign = 'center'; c.fillText('the model', 1110, 664);
        c.lineWidth = 0.9; c.beginPath(); c.moveTo(1090, 640); c.quadraticCurveTo(1050, 610, 1030, 560); c.stroke();
        // arrow from the specimens into the model
        const path = bxQ([520, 330], [690, 190], [880, 330], 40);
        bxArrow(c, path, cl((T - 2.9) / 0.5), 3.4, 'training data', 690, 216);
        // specimens travelling along the arrow
        for (let k2 = 0; k2 < 8; k2++) { const u = ((T - 3.2) * 0.9 - k2 * 0.18); if (u < 0 || u > 1 || T > 5.9) continue; const q = path[Math.min(40, Math.floor(u * 40))]; bxSpecimen(c, tc, q[0], q[1], k2 % 3 !== 1, 0.42 * (1 - 0.5 * u)); }
        // counter cartouche
        if (T > 3.0) { const e = ease(cl((T - 3.0) / 2.6)), v = T >= 5.6 ? 1000000 : Math.round(Math.pow(10, 1 + 5 * e)); bxCartouche(c, tc, 740, 600, 330, 160, ['examples', v.toLocaleString('en-US')], [36, 72]); }
        
      };
      // ---------- PLATE XXVI: the cycle ----------
      const plateB = (c, tc, T) => {
        const right = T > 9.35;
        c.font = 'italic 400 28px "Cormorant Garamond"'; c.textAlign = 'center'; c.fillText('How does AI learn?  —  the cycle of learning.', W / 2, 72);
        [c, tc].forEach((k) => { k.save(); k.translate(0, 0); });
        // Fig 1 GUESS
        bxSpecimen(c, tc, 160, 300, true, 1.2, 'a.');
        c.font = 'italic 400 28px "Cormorant Garamond"'; c.textAlign = 'center'; c.fillText('a new picture', 160, 450);
        bxArrow(c, bxQ([240, 290], [290, 250], [330, 300], 16), cl((T - 6.75) / 0.3), 2.8);
        const [hx, hy] = bxLily(c, tc, 420, 580, 1.1, right ? 0.0 : -0.12);
        c.font = '600 44px "Cormorant Garamond"'; c.fillText('GUESS', 420, 640);
        if (T > 7.0) {
          // banner (ribbon scroll) with the guess
          const bxp = 580, byp = 150, pr = cl((T - (right ? 9.35 : 7.0)) / 0.35);
          const rib = [[bxp - 90, byp - 26], [bxp + 90, byp - 26], [bxp + 76, byp], [bxp + 90, byp + 26], [bxp - 90, byp + 26], [bxp - 76, byp]];
          erase(c, rib); wash(tc, rib, right ? '#9fbf7a' : '#efe0b0', 0.6); contour(c, rib, 0.7, 1.8);
          c.save(); c.beginPath(); c.rect(bxp - 80, byp - 30, 160 * pr, 60); c.clip(); c.font = 'italic 600 40px "Cormorant Garamond"'; c.textBaseline = 'middle'; c.fillText(right ? 'cat ✓' : 'dog?', bxp, byp + 2); c.restore(); c.textBaseline = 'alphabetic';
          c.lineWidth = 0.8; c.beginPath(); c.moveTo(bxp - 70, byp + 26); c.quadraticCurveTo(500, 220, hx + 20, hy - 40); c.stroke();
        }
        // Fig 2 CHECK: lens over the specimen
        bxSpecimen(c, tc, 980, 250, true, 1.0);
        if (T > 7.4) {
          const lens = bxEll(980, 250, 104, 104, 60); c.lineWidth = 7; c.beginPath(); poly(c, lens); c.stroke(); c.lineWidth = 1; poly(c, bxEll(980, 250, 96, 96, 60)); c.stroke();
          const hd = [[1054, 324], [1150, 420], [1134, 436], [1038, 340]]; erase(c, hd); wash(tc, hd, '#7a5a34', 0.7); bxHatch(c, hd, Math.PI / 4, 2.2, () => 0.75); contour(c, hd, 0.7, 1.8);
          c.lineWidth = 1.2; c.beginPath(); c.arc(946, 214, 52, Math.PI * 1.05, Math.PI * 1.45); c.stroke();
          c.font = '600 44px "Cormorant Garamond"'; c.fillText('CHECK', 960, 440);
          c.font = 'italic 600 34px "Cormorant Garamond"'; c.fillText("answer: cat.", 960, 478);
        }
        // Fig 3 ADJUST: dials
        const tq = Math.floor(T * 12) / 12;
        [[620, 540, 46], [724, 566, 40], [826, 532, 44]].forEach(([x, y, R], i) => { const a0 = [-2.4, -0.8, -1.7][i], a1 = [-0.9, -2.3, -0.3][i]; bxDial(c, tc, x, y, R, a0 + (a1 - a0) * ease(cl((tq - 8.65 - i * 0.12) / 0.6))); });
        c.font = '600 44px "Cormorant Garamond"'; c.fillText('ADJUST', 724, 662);
        // cycle arrows
        bxArrow(c, bxQ([680, 130], [800, 70], [880, 150]), cl((T - 7.3) / 0.35), 2.8);
        bxArrow(c, bxQ([1030, 500], [1020, 590], [890, 570]), cl((T - 8.2) / 0.35), 2.8, 'error', 1070, 600);
        bxArrow(c, bxQ([570, 560], [500, 600], [480, 470]), cl((T - 9.05) / 0.3), 2.8);
        [c, tc].forEach((k) => k.restore());
        // colourist's emphasis: red wash cross over the wrong guess, ring around it
        if (T > 7.8 && !right) { const p = cl((T - 7.8) / 0.25); tc.save(); tc.strokeStyle = 'rgba(184,46,36,1)'; tc.lineCap = 'round'; tc.lineWidth = 13; tc.beginPath(); tc.moveTo(520, 125); tc.lineTo(520 + 120 * p, 125 + 50 * p); tc.moveTo(640, 125); tc.lineTo(640 - 120 * cl(p * 2 - 1), 125 + 50 * cl(p * 2 - 1)); tc.stroke(); tc.restore(); bxRing(tc, 580, 150, 125, 55, cl((T - 7.95) / 0.35)); }
        if (right) bxRing(tc, 580, 150, 125, 55, cl((T - 9.6) / 0.35), '#4f8a3c');
      };
      // ---------- PLATE XXVII: growth by training rounds ----------
      const plateC = (c, tc, T) => {
        c.font = 'italic 400 28px "Cormorant Garamond"'; c.textAlign = 'center'; c.fillText('How does AI learn?  —  growth by rounds of training.', W / 2, 72);
        const accs = [61, 74, 88, 97], xs = [180, 360, 540, 730], sc = [0.55, 0.75, 0.95, 1.15];
        c.lineWidth = 1.2; c.beginPath(); c.moveTo(110, 560); c.lineTo(820, 560); c.stroke();
        bxHatch(c, [[110, 560], [820, 560], [820, 574], [110, 574]], Math.PI / 4, 3, () => 0.6);
        xs.forEach((x, i) => {
          const t0 = 10.9 + i * 0.42; if (T < t0) return;
          const g = H.ease.out(cl((T - t0) / 0.45));
          bxLily(c, tc, x, 560, sc[i], Math.sin(T + i) * 0.03, g);
          c.font = 'italic 400 28px "Cormorant Garamond"'; c.textAlign = 'center'; c.fillText(`round ${i + 1}`, x, 600);
          c.font = '600 40px "Cormorant Garamond"'; c.fillText(accs[i] + '%', x, 642);
        });
        if (T > 11.0) bxArrow(c, bxQ([120, 380], [420, 300], [640, 110], 40), cl((T - 11.0) / 1.5), 2.8, 'better & better', 300, 270);
        const pr = cl((T - 10.95) / 1.55), v = Math.round(61 + 36 * (1 - Math.pow(1 - pr, 2.3)));
        if (T > 10.95) bxCartouche(c, tc, 1040, 250, 330, 230, ['Accuracy', v + '%'], [44, 110]);
        if (T > 12.5) { bxRing(tc, 1040, 250, 196, 140, cl((T - 12.5) / 0.35)); bxRing(tc, 730, 400, 120, 260, cl((T - 12.7) / 0.35)); }
        if (T > 13.0) { c.font = 'italic 600 52px "Cormorant Garamond"'; c.textAlign = 'center'; c.save(); c.beginPath(); c.rect(820, 420, 440 * cl((T - 13.0) / 0.45), 200); c.clip(); c.fillText('More examples →', 1040, 480); c.fillText('better guesses.', 1040, 540); c.restore(); }
      };
      // ---------- press-roller transitions between plates ----------
      const pull = (A, B, p) => {
        const front = H.lerp(-80, W + 80, ease(p));
        ctx.drawImage(A, 0, 0);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, front), H_); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
        const rg = ctx.createLinearGradient(front - 90, 0, front + 30, 0); rg.addColorStop(0, 'rgba(60,40,20,0)'); rg.addColorStop(0.6, 'rgba(60,40,20,0.2)'); rg.addColorStop(0.8, 'rgba(255,250,235,0.25)'); rg.addColorStop(1, 'rgba(60,40,20,0)');
        ctx.fillStyle = rg; ctx.fillRect(front - 90, 0, 120, H_);
      };
      const A = (T) => bxCompose(W, H_, plateA, T, 'Pl. XXV.'), B = (T) => bxCompose(W, H_, plateB, T, 'Pl. XXVI.'), C = (T) => bxCompose(W, H_, plateC, T, 'Pl. XXVII.');
      if (t < 0.4) pull(bxPaper(W, H_), A(t), t / 0.4);
      else if (t < 6.0) ctx.drawImage(A(t), 0, 0);
      else if (t < 6.55) pull(A(5.99), B(t), (t - 6.0) / 0.55);
      else if (t < 10.3) ctx.drawImage(B(t), 0, 0);
      else if (t < 10.85) pull(B(10.29), C(t), (t - 10.3) / 0.55);
      else ctx.drawImage(C(t), 0, 0);
      H.grain(ctx, W, H_, 0.045, 5 + Math.floor(t * 12));
    },
    // Sound: a printer's study. Each plate is pulled under the press roller (a heavy rolling drum + the damp sheet
    // lifting); lines that engrave themselves on are a burin cutting copper (dry, gritty, low-mid, never squeaky);
    // the colourist's red and green rings are a soft wet brush; brass dials click; the cartouche counter ticks like a
    // numbering wheel. A very quiet pad sits under it (calm, painterly). Times copied from explainer() above.
    explainerSound(k) {
      // Chrome glitch: a noise buffer that starts within ~1e-8 s of a sample boundary (float error like 4.15 + 0.1 * 1 + 0.11)
      // spikes far above its gain. Put every start a quarter sample past the 48 kHz grid so none land there.
      { const k0 = k, sn = (t) => (Math.round(t * 48000) + 0.25) / 48000; k = { ...k0, play: (n, t, o) => k0.play(n, sn(t), o), tone: (t, o) => k0.tone(sn(t), o), noise: (t, o) => k0.noise(sn(t), o) }; }
      const D = 14.5, cl = H.clamp, ease = H.ease.inOut;
      const pan = (x) => cl(x / 640 - 1, -1, 1) * 0.6;
      let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      // burin: short gritty cuts through copper, a grain every ~30 ms, with a little low body
      const burin = (a, d, g = 1, p = 0, minor = true) => {
        for (let x = 0; x < d; x += 0.026 + rnd() * 0.02) k.noise(a + x, { dur: 0.04, filter: 'bandpass', f: 1700 + rnd() * 900, q: 1.8, gain: 0.13 * g * (0.7 + rnd() * 0.5), a: 0.006, pan: p, minor });
        k.noise(a, { dur: d + 0.03, color: 'pink', filter: 'bandpass', f: 700, q: 1, gain: 0.05 * g, a: 0.01, hold: d * 0.7, pan: p, minor });
      };
      // colourist's brush laying a wash (rings, the red cross)
      const wash = (a, d, g = 1, p = 0, minor = false) => { k.noise(a, { dur: 0.04, color: 'pink', filter: 'bandpass', f: 1000, q: 0.8, gain: 0.16 * g, a: 0.004, pan: p, minor }); k.play('stroke', a, { material: 'brush', dur: d, gain: 2.2 * g, pan: p, minor }); }; // wet bristles touch down, then drag
      // press pull: the roller crosses the bed left -> right on an inOut ease, the damp sheet peels off at the start
      const pull = (a, d, g = 1) => {
        k.play('paper', a, { dur: 0.22, gain: 0.35 * g });
        k.play('roller', a + 0.04, { dur: d - 0.04, gain: 0.55 * g });
        [0.25, 0.5, 0.75].forEach((u) => { const tu = a + d * u; k.noise(tu - 0.08, { dur: 0.22, color: 'brown', filter: 'lowpass', f: 260, gain: 0.32 * g, a: 0.06, pan: (ease(u) * 2 - 1) * 0.6 }); });
        k.play('thud', a + d - 0.02, { f: 85, gain: 0.25 * g, pan: 0.5 }); // roller runs off the bed onto its stop
      };
      // numbering wheel tick for the cartouche counters
      const wheel = (t, g, p, f = 1500) => k.withMinor(() => { k.noise(t, { dur: 0.025, filter: 'bandpass', f, q: 2, gain: 0.26 * g, a: 0.001, pan: p }); k.tone(t, { f: f * 0.18, type: 'triangle', dur: 0.035, gain: 0.06 * g, pan: p }); });

      k.bed('room', 0, D, { gain: 0.35 });
      k.music('pad', 0.4, D, { bpm: 64, gain: 0.35, chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['C3', 'E3', 'G3', 'Bb3']] });

      // ---- Plate XXV: pulled (0 -> 0.4), title engraved left to right (0.15 -> 1.15), rule appears at 1.0
      pull(0, 0.4, 0.8);
      [[0, 3], [4, 8], [9, 11], [12, 18]].forEach(([s, e], i) => burin(0.15 + s / 18 * 1.0, (e - s) / 18 * 1.0, 1, [-0.3, -0.1, 0.08, 0.28][i], i > 0));
      burin(1.0, 0.1, 1.3, 0, false);
      k.noise(1.6, { dur: 0.6, color: 'brown', filter: 'bandpass', f: [[0, 260], [0.3, 520], [0.6, 300]], q: 0.6, gain: 0.16, a: 0.25, minor: true }); // title slides up into the head
      // the model lily and the specimen grid print in (2.2, then 2.3 + i*0.12)
      k.play('press', 2.2, { gain: 0.2, pan: pan(1010) });
      for (let i = 0; i < 9; i++) burin(2.3 + i * 0.12, 0.06, 0.85, pan(180 + (i % 3) * 150));
      burin(2.9, 0.5, 0.9, pan(700)); // fletched arrow cut along (2.9 -> 3.4)
      // specimens ride the arrow, landing in the model at 4.31 + 0.2k (k = 0..7)
      for (let j = 0; j < 8; j++) k.noise(4.31 + j * 0.2, { dur: 0.05, filter: 'bandpass', f: 900, q: 1, gain: 0.12, a: 0.004, pan: pan(880), minor: true });
      // examples cartouche: 10 -> 1,000,000 over 3.0..5.6 (inOut); wheel ticks follow the speed, at most 12/s
      for (let t = 3.05; t < 5.55;) { const e = cl((t - 3.0) / 2.6), sp = 6 * e * (1 - e); wheel(t, 0.6 + 0.4 * Math.min(1, sp), pan(740)); t += 1 / (4 + 8 * Math.min(1, sp)); }
      k.play('tock', 5.6, { f: 560, gain: 0.6, pan: pan(740) }); k.play('thud', 5.6, { f: 120, gain: 0.25, pan: pan(740) }); // 1,000,000 lands

      // ---- Plate XXVI pulled (6.0 -> 6.55)
      pull(6.0, 0.55, 1);
      burin(6.75, 0.3, 0.8, pan(290)); // arrow into the lily
      k.play('paper', 7.0, { dur: 0.12, gain: 0.25, pan: pan(580), minor: true }); // ribbon unfurls
      burin(7.02, 0.33, 0.9, pan(580)); // "dog?" engraved into the ribbon (7.0 -> 7.35)
      burin(7.3, 0.35, 0.8, pan(780)); // arrow to the lens
      k.play('tock', 7.4, { f: 380, gain: 0.45, pan: pan(980) }); // the lens is set down over the specimen
      // WRONG: two red brushed slashes (7.8 -> 7.925 -> 8.05), then a red ring (7.95 -> 8.3)
      wash(7.8, 0.12, 1.4, pan(580)); wash(7.925, 0.12, 1.4, pan(580));
      k.play('error', 7.8, { f: 'E3', gain: 0.5, pan: pan(580) });
      wash(7.95, 0.35, 1.1, pan(580), true);
      burin(8.2, 0.35, 0.8, pan(1000)); // error arrow
      // dials turn (quantized to 12 fps, 8.65 + i*0.12, 0.6 s each): a brass detent per frame
      for (let f = Math.ceil(8.66 * 12); f / 12 < 9.49; f++) k.play('click', f / 12, { f: 850 + (f % 3) * 80, gain: 0.5, pan: pan(620 + (f % 3) * 103), minor: true });
      burin(9.05, 0.3, 0.8, pan(520)); // arrow back to the guess
      // CORRECTION: "cat ✓" engraved into a green-washed ribbon (9.35 -> 9.7), green ring (9.6 -> 9.95)
      k.play('paper', 9.35, { dur: 0.12, gain: 0.25, pan: pan(580) });
      burin(9.37, 0.33, 1.0, pan(580), false);
      wash(9.6, 0.35, 0.9, pan(580));
      k.play('success', 9.62, { f: 'F5', gain: 0.55, pan: pan(580) });

      // ---- Plate XXVII pulled (10.3 -> 10.85)
      pull(10.3, 0.55, 1);
      // four lilies grow (10.9 + 0.42i, 0.45 s ease-out): a soft wash bloom with a low plucked note rising
      ['F4', 'A4', 'C5', 'F5'].forEach((n, i) => { const t0 = 10.9 + i * 0.42; wash(t0, 0.4, 0.5, pan([180, 360, 540, 730][i]), true); k.tone(t0 + 0.05, { f: n, type: 'triangle', dur: 0.6, gain: 0.07, a: 0.02, verb: 0.3, pan: pan([180, 360, 540, 730][i]), minor: true }); });
      burin(11.0, 1.5, 0.45, pan(380)); // 'better & better' arrow cut slowly (11.0 -> 12.5)
      { let last = 61, lastT = -1; // Accuracy cartouche 61 -> 97 over 10.95..12.5, a tick per new value, <= 12/s
        for (let t = 10.95; t < 12.5; t += 1 / 120) { const v = Math.round(61 + 36 * (1 - Math.pow(1 - cl((t - 10.95) / 1.55), 2.3))); if (v !== last && t - lastT >= 1 / 12) { wheel(t, 0.9, pan(1040), 1300 + (v - 61) * 12); last = v; lastT = t; } } }
      // 97% lands and the colourist rings it red (12.5): the big hit; then the round-4 lily (12.7)
      k.play('impact', 12.5, { gain: 1.3, pan: pan(1040) });
      k.play('ding', 12.5, { f: 'C5', gain: 0.45, pan: pan(1040) });
      wash(12.52, 0.35, 1.2, pan(1040));
      wash(12.7, 0.35, 0.8, pan(730), true);
      // takeaway engraved (13.0 -> 13.45), resolves
      burin(13.0, 0.45, 1.0, pan(1040), false);
      ['F4', 'C5', 'A5'].forEach((f, i) => k.play('ding', 13.47 + i * 0.08, { f, gain: 0.4 - i * 0.07, pan: (i - 1) * 0.25 }));
    },

    // ===== END EXPLAINER =====
  });
}
```
