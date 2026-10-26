I want an animated explainer made in the "Kinetic Type" visual style (Generative & Type). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Anton, Inter, Space Mono
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;800&family=Space+Mono:wght@400;700&display=block">
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
Name: Kinetic Type
Family: Generative & Type
Look: A typographic music-video frame: condensed words cropped edge to edge with zero leading, filled vs outlined, strobe echoes, a slice glitch and one word stretched and filled with a halftone dreamscape — strictly two colours.
Motion: One word per beat at 120 bpm: THE punches in, MACHINES whips in from the right trailing outline echoes, LEARNED slams up with a one-frame inverted flash, the TO tab wipes up, DREAM springs open and its halftone moon develops; then the slice glitch and echoes pulse on every beat.
How it explains: Words slam in on the beat and do the explaining; scenes change with a slice-glitch tear and a whip-pan, arrows are heavy rules with chevrons, labels are inverted mono tags that drop onto their targets, and the counters are huge Anton numerals with a strobe-flash on the key hits.

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

REFERENCE STYLE SOURCE (styles/kinetic-type.js; W/H_ are always 1280x720)
```js
{
  // Kinetic typography frame: oversized words stacked edge to edge with tight leading, mixed
  // weights, outline vs fill, strobe echoes, a slice-glitch, and one word stretched and masked
  // with a halftone image. Strict two-colour: near-black + acid yellow.
  const INK = '#e6ff2e', BG = '#0c0c0b';

  // fit a word so its ink spans exactly targetW (uses actual bounding box, not advance)
  function fit(ctx, font, size, text, targetW) {
    ctx.font = `${font.replace('{s}', size)}`;
    const m = ctx.measureText(text);
    const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const s = (size * targetW) / w;
    ctx.font = `${font.replace('{s}', s)}`;
    const m2 = ctx.measureText(text);
    return { size: s, left: m2.actualBoundingBoxLeft, asc: m2.actualBoundingBoxAscent, desc: m2.actualBoundingBoxDescent, w: m2.actualBoundingBoxLeft + m2.actualBoundingBoxRight };
  }


  // =====================================================================================
  // EXPLAINER — "How does AI learn?" told in kinetic type: words slam on the beat, cuts are
  // slice-glitches and whip-pans, arrows are heavy rules with chevrons, numbers are Anton.
  // =====================================================================================
  const XS = (t, a, b) => H.clamp((t - a) / (b - a));
  let ANTON_CAP = 0;
  function capRatio(ctx) {
    if (!ANTON_CAP) { ctx.font = '400 200px "Anton"'; ANTON_CAP = ctx.measureText('H').actualBoundingBoxAscent / 200; }
    return ANTON_CAP;
  }
  // Anton word at left x / baseline y with a given cap height; returns drawn width
  function aw(ctx, text, x, y, cap, o = {}) {
    let size = cap / capRatio(ctx);
    ctx.save();
    ctx.font = `400 ${size}px "Anton"`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    if (o.fitW) { const mw = ctx.measureText(text).width; if (mw > o.fitW) { size *= o.fitW / mw; ctx.font = `400 ${size}px "Anton"`; } }
    const m = ctx.measureText(text), w = m.width * (o.sx || 1);
    let ox = x; if (o.align === 'center') ox = x - w / 2; else if (o.align === 'right') ox = x - w;
    ctx.translate(ox, y); if (o.sx) ctx.scale(o.sx, 1);
    if (o.outline) { ctx.strokeStyle = o.color || INK; ctx.lineWidth = (o.lw || 3) / (o.sx || 1); ctx.lineJoin = 'miter'; ctx.strokeText(text, 0, 0); }
    else { ctx.fillStyle = o.color || INK; ctx.fillText(text, 0, 0); }
    ctx.restore();
    return w;
  }
  function tag(ctx, text, x, y, o = {}) { // inverted label block (ink box, black mono text)
    ctx.save();
    ctx.font = `700 ${o.size || 18}px "Space Mono"`; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width + 16, h = (o.size || 18) + 12;
    const ox = o.align === 'center' ? x - w / 2 : x;
    ctx.fillStyle = o.inv ? BG : INK; ctx.fillRect(ox, y - h / 2, w, h);
    if (o.inv) { ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(ox, y - h / 2, w, h); }
    ctx.fillStyle = o.inv ? INK : BG; ctx.fillText(text, ox + 8, y + 1);
    ctx.restore();
    return w;
  }
  // pet pictogram brightness for halftone (u,v in -1..1, y down): clean geometric shapes,
  // lit from the upper left so the dot portrait has some volume
  const inTri = (px, py, ax, ay, bx, by, cx, cy) => {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by), d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy), d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const inEll = (u, v, cx, cy, rx, ry) => { const a = (u - cx) / rx, b = (v - cy) / ry; return a * a + b * b < 1; };
  function petB(kind, u, v) {
    const lit = (cx, cy, r) => H.clamp(1.08 - 0.3 * Math.hypot(u - cx + r * 0.38, v - cy + r * 0.42) / r, 0.72, 1);
    if (kind === 'cat') {
      const hx = 0, hy = 0.16, hr = 0.56;
      const head = inEll(u, v, hx, hy, hr, hr * 0.92);
      let ear = 0;
      for (const s of [-1, 1]) {
        if (inTri(u, v, s * 0.56, 0.02, s * 0.5, -0.86, s * 0.08, -0.28)) ear = 1;
        if (inTri(u, v, s * 0.45, -0.1, s * 0.45, -0.62, s * 0.22, -0.3)) ear = ear ? 2 : ear;
      }
      for (const s of [-1, 1]) for (const dy of [-0.05, 0.07]) { // whiskers: straight bright strokes outside the face
        const x = u * s; if (x > 0.42 && x < 0.95) { const yy = 0.36 + dy + (x - 0.42) * dy * 1.6; if (Math.abs(v - yy) < 0.026) return 0.8; }
      }
      if (!head && !ear) return 0.035;
      if (ear === 2) return 0.5;
      if (ear && !head) return lit(hx, hy, hr) * 0.92;
      for (const s of [-1, 1]) { if (inEll(u, v, s * 0.23, 0.08, 0.1, 0.12)) return inEll(u, v, s * 0.23 - 0.03, 0.04, 0.035, 0.035) ? 0.9 : 0.03; }
      if (inTri(u, v, -0.08, 0.27, 0.08, 0.27, 0, 0.36)) return 0.03;
      if (Math.abs(u) < 0.022 && v > 0.35 && v < 0.43) return 0.1;
      return lit(hx, hy, hr);
    }
    // dog: round head, long floppy ears, pale muzzle, dark nose
    const hx = 0, hy = 0.04, hr = 0.5;
    for (const s of [-1, 1]) {
      const a = 0.32 * s, du = u - s * 0.52, dv = v - 0.14, ru = du * Math.cos(a) + dv * Math.sin(a), rv = -du * Math.sin(a) + dv * Math.cos(a);
      if ((ru / 0.17) ** 2 + (rv / 0.44) ** 2 < 1 && !inEll(u, v, hx, hy, hr * 0.98, hr * 1.06)) return 0.6;
      if ((ru / 0.24) ** 2 + (rv / 0.51) ** 2 < 1 && !inEll(u, v, hx, hy, hr * 0.92, hr)) return 0.02; // dark gap so the ear reads
    }
    const head = inEll(u, v, hx, hy, hr * 0.92, hr), muz = inEll(u, v, 0, 0.36, 0.3, 0.22);
    if (!head && !muz) return 0.035;
    if (inEll(u, v, 0, 0.27, 0.11, 0.075)) return inEll(u, v, -0.03, 0.25, 0.03, 0.022) ? 0.75 : 0.03;
    for (const s of [-1, 1]) { if (inEll(u, v, s * 0.2, -0.02, 0.08, 0.09)) return inEll(u, v, s * 0.2 - 0.025, -0.05, 0.03, 0.03) ? 0.9 : 0.03; }
    if (muz) { if (Math.abs(u) < 0.02 && v > 0.33 && v < 0.45) return 0.15; if (v > 0.43 && Math.abs(u) < 0.2 && Math.abs(v - 0.45 - u * u * 1.2) < 0.025) return 0.15; return 1; }
    return lit(hx, hy, hr) * 0.85;
  }
  // halftone portrait on a 45° screen, baked once per kind+size
  const PET_CACHE = {};
  function petTex(kind, size) {
    const key = kind + '|' + Math.round(size);
    if (PET_CACHE[key]) return PET_CACHE[key];
    const S = Math.ceil(size), cv = H.layer(S, S), c = cv.getContext('2d'), h = size / 2;
    const step = Math.max(3.4, Math.min(size / 28, 6.2)), ca = Math.SQRT1_2;
    c.fillStyle = INK; c.beginPath();
    for (let j = -S; j < S * 1.5; j += step) for (let i = -S; i < S * 1.5; i += step) {
      const x = (i - j) * ca + h, y = (i + j) * ca - h * 0.42;
      if (x < 1 || y < 1 || x > S - 1 || y > S - 1) continue;
      const b = petB(kind, ((x - h) / h) * 1.08, ((y - h) / h) * 1.08);
      const r = Math.sqrt(b) * step * 0.6;
      if (r < 0.45) continue;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2);
    }
    c.fill();
    return (PET_CACHE[key] = cv);
  }
  function halftonePet(ctx, kind, cx, cy, size) { const tx = petTex(kind, size); ctx.drawImage(tx, cx - size / 2, cy - size / 2); }
  // ink-block offset shadow (two-colour, like the hero's TO tab), black face, heavy rule
  function blockBox(ctx, x, y, w, h, lw, off) {
    ctx.fillStyle = INK; ctx.fillRect(x + off, y + off, w, h);
    ctx.fillStyle = BG; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h);
  }
  function card(ctx, kind, x, y, size, label) {
    ctx.save();
    const off = size > 150 ? 9 : 6;
    blockBox(ctx, x, y, size, size, 3, off);
    halftonePet(ctx, kind, x + size / 2, y + size / 2, size - 10);
    if (label) tag(ctx, label, x, y + size + 18, { size: 22 });
    ctx.restore();
  }
  function arrowLine(ctx, x0, y0, x1, y1, p, lw = 6, head = 22) {
    if (p <= 0) return;
    const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0);
    ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * head * 0.6, y - Math.sin(a) * head * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.5) * head, y - Math.sin(a - 0.5) * head); ctx.lineTo(x - Math.cos(a + 0.5) * head, y - Math.sin(a + 0.5) * head); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function modelBox(ctx, x, y, w, h, t, adjust, drawP = 1) {
    ctx.save();
    ctx.strokeStyle = INK; ctx.lineWidth = 4;
    // box draws on as a perimeter
    const per = 2 * (w + h), L = per * drawP;
    if (drawP >= 1) blockBox(ctx, x, y, w, h, 4, 10);
    else {
    ctx.beginPath(); ctx.moveTo(x, y);
    const pts = [[x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    let acc = 0, px = x, py = y;
    for (const [qx, qy] of pts) { const d = Math.hypot(qx - px, qy - py); if (acc + d <= L) { ctx.lineTo(qx, qy); acc += d; px = qx; py = qy; } else { const k = (L - acc) / d; ctx.lineTo(px + (qx - px) * k, py + (qy - py) * k); break; } }
    ctx.stroke();
    }
    if (drawP >= 1) {
      aw(ctx, 'MODEL', x + 16, y + 16 + h * 0.18, h * 0.18);
      // weights: bars that jiggle while processing and re-set when adjusted
      const r = H.rng(321), n = 9, bw = (w - 32) / n;
      for (let i = 0; i < n; i++) {
        const b0 = r.range(0.15, 0.95), b1 = r.range(0.35, 0.9);
        const k = adjust <= 0 ? 0 : H.ease.back(H.clamp(adjust));
        let hh = b0 + (b1 - b0) * k + 0.04 * Math.sin(t * 9 + i * 1.7);
        const bh = (h * 0.5) * H.clamp(hh, 0.05, 1.1);
        const bx = x + 16 + i * bw + 3, by = y + h - 16 - bh;
        ctx.fillStyle = INK;
        if (i % 2) { // alternate rounds: 3px stripe hatch inside a rule, like a print screen
          for (let yy = y + h - 16 - 3; yy > by; yy -= 6) ctx.fillRect(bx, Math.max(by, yy), bw - 6, Math.min(3, yy - by + 3));
          ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, by + 1, bw - 8, bh - 1);
        } else ctx.fillRect(bx, by, bw - 6, bh);
      }
      ctx.font = '700 24px "Space Mono"'; ctx.fillStyle = INK; ctx.fillText('WEIGHTS', x + 16, y + h * 0.44);
    }
    ctx.restore();
  }
  function header(ctx) {
    ctx.save(); ctx.font = '700 28px "Space Mono"'; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
    try { ctx.letterSpacing = '2px'; } catch (e) {}
    const w = ctx.measureText('HOW DOES AI LEARN?').width;
    ctx.fillText('HOW DOES AI LEARN?', 30, 34); ctx.fillRect(30, 57, w, 4); ctx.fillRect(30, 64, w * 0.38, 2); ctx.restore();
  }
  // ---------- the hero's typographic finishing, reused in the explainer ----------
  // a filled Anton word rendered through a scratch layer so it can carry the hero's signatures:
  // knocked-out speed lines through the lower third, a shoved slice band with thin rule ticks,
  // and an optional rotated-dot halftone fill (like DREAM) held together by an outline.
  let SCR = null, SCRB = null;
  const DOT_CACHE = {};
  function dotTex(key, w, h, top, capH) { // baked once per word: 45° dot screen, a glow rising from the baseline + drifting cloud bands
    if (DOT_CACHE[key]) return DOT_CACHE[key];
    const cv = H.layer(Math.ceil(w), Math.ceil(h)), c = cv.getContext('2d'), nz = H.makeNoise(31);
    const step = 8, ca = Math.SQRT1_2;
    c.fillStyle = INK; c.beginPath();
    for (let j = -h; j < w + h; j += step) for (let i = -h; i < w + h; i += step) {
      const x = (i - j) * ca, y = (i + j) * ca - w * 0.5;
      if (x < -6 || y < -6 || x > w + 6 || y > h + 6) continue;
      const v = H.clamp((y - top) / capH), cl = nz.fbm2(x * 0.004, y * 0.012, 4) * 0.5 + 0.5;
      const sun = Math.max(0, 0.5 - Math.hypot((x - w * 0.62) / 1.8, y - top - capH * 1.05) / (capH * 1.6));
      const b = H.clamp(0.24 + 0.62 * Math.pow(v, 1.4) + 0.35 * Math.pow(H.clamp(cl * 1.6 - 0.6), 1.2) + sun);
      const r = Math.sqrt(b) * step * 0.62;
      if (r < 0.5) continue;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2);
    }
    c.fill();
    return (DOT_CACHE[key] = cv);
  }
  function heroWord(ctx, text, x, y, cap, o = {}) {
    if (!SCR) { SCR = H.layer(1520, 600); SCRB = H.layer(1520, 80); }
    const c = SCR.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    let size = cap / capRatio(ctx);
    c.font = `400 ${size}px "Anton"`;
    if (o.fitW) { const mw = c.measureText(text).width; if (mw > o.fitW) { size *= o.fitW / mw; c.font = `400 ${size}px "Anton"`; } }
    const capH = size * capRatio(ctx), w = c.measureText(text).width;
    const PX = 80, PY = 40, sw = Math.min(SCR.width, Math.ceil(w + PX * 2)), sh = Math.min(SCR.height, Math.ceil(capH + PY * 2 + size * 0.12));
    const bx = PX, by = PY + capH;
    c.clearRect(0, 0, SCR.width, SCR.height);
    // echoes behind (outline copies fanning right/up, as on the hero's MACHINES)
    if (o.echo) for (let e = o.echo; e >= 1; e--) {
      ctx.save(); ctx.globalAlpha = 0.22 * (o.echo + 1 - e) / o.echo; ctx.font = `400 ${size}px "Anton"`; ctx.textBaseline = 'alphabetic';
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.strokeText(text, x + e * 24, y - e * 4); ctx.restore();
    }
    c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = INK;
    c.fillText(text, bx, by);
    if (o.dots) { c.globalCompositeOperation = 'source-in'; c.drawImage(dotTex(o.dots + '|' + Math.round(w), sw, sh, PY, capH), 0, 0); c.globalCompositeOperation = 'source-over'; }
    if (o.speed) { c.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 3; k++) c.fillRect(0, Math.round(by - capH * (0.2 + k * 0.045)), sw, Math.max(2, Math.round((4 - k) * capH / 240))); c.globalCompositeOperation = 'source-over'; }
    if (o.dots) { c.strokeStyle = INK; c.lineWidth = 2.6; c.lineJoin = 'miter'; c.strokeText(text, bx, by); }
    let sy = 0, sl = o.slice;
    if (sl) {
      sy = Math.round(by - capH * sl.at);
      const bc = SCRB.getContext('2d'); bc.clearRect(0, 0, SCRB.width, SCRB.height);
      bc.drawImage(SCR, 0, sy, sw, sl.h, 0, 0, sw, sl.h);
      c.clearRect(0, sy, sw, sl.h); c.drawImage(SCRB, 0, 0, sw, sl.h, sl.shift, sy, sw, sl.h);
    }
    ctx.drawImage(SCR, 0, 0, sw, sh, x - bx, y - by, sw, sh);
    if (sl) { // the thin rule ticks the hero draws beside its slice
      const yy = y - by + sy; ctx.fillStyle = INK;
      const tx = x - (sl.tick ?? 24); ctx.fillRect(tx, yy + sl.h + 5, sl.shift - 12, 2); ctx.fillRect(tx, yy - 7, sl.shift * 0.6, 2);
    }
    return w;
  }
  // heavy rule arrow as a polygon (so it can be filled, or stroked as a strobe echo)
  function arrowShape(ctx, x0, y, x1, lw, head) {
    ctx.beginPath();
    ctx.moveTo(x0, y - lw / 2); ctx.lineTo(x1 - head * 0.9, y - lw / 2); ctx.lineTo(x1 - head * 0.9, y - head * 0.55);
    ctx.lineTo(x1, y); ctx.lineTo(x1 - head * 0.9, y + head * 0.55); ctx.lineTo(x1 - head * 0.9, y + lw / 2); ctx.lineTo(x0, y + lw / 2); ctx.closePath();
  }
  function loopIcon(ctx, cx, cy, r, lw) { // ↻ drawn as a heavy circular arrow
    ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw; ctx.lineCap = 'butt';
    const a0 = -Math.PI * 0.35, a1 = Math.PI * 1.25;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
    const hx = cx + Math.cos(a1) * r, hy = cy + Math.sin(a1) * r, tg = a1 + Math.PI / 2, hs = lw * 1.7;
    ctx.beginPath(); ctx.moveTo(hx + Math.cos(tg) * hs * 1.3, hy + Math.sin(tg) * hs * 1.3);
    ctx.lineTo(hx + Math.cos(a1) * hs, hy + Math.sin(a1) * hs); ctx.lineTo(hx - Math.cos(a1) * hs, hy - Math.sin(a1) * hs); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- scenes ----------
  function ktHook(ctx, W, H_, t) {
    const sl = (c) => (t >= c ? 1 - H.ease.out(XS(t, c, c + 0.16)) : -1);
    const a = sl(0), b = sl(0.5), c = sl(1.0);
    if (a > -1) { ctx.save(); const s = 1 + a * 0.4; ctx.translate(40, 200); ctx.scale(s, s); aw(ctx, 'HOW DOES', 0, 0, 180); ctx.restore(); }
    if (b > -1) { const s = 1 + b * 0.5; ctx.save(); ctx.translate(40 + b * 600, 0); aw(ctx, 'AI', 0, 520, 300 * s, { outline: true, lw: 6 }); for (let e = 1; e <= 3; e++) { ctx.globalAlpha = 0.2 * (4 - e) / 3; aw(ctx, 'AI', e * 26, 520 - e * 4, 300, { outline: true, lw: 2 }); } ctx.restore(); }
    if (c > -1) { ctx.save(); ctx.translate(0, c * 300); heroWord(ctx, 'LEARN?', 420, 520, 300, { fitW: W - 460, speed: true, slice: t >= 1.5 ? { at: 0.6, h: 30, shift: 38 } : null }); ctx.restore(); }
  }
  function ktData(ctx, W, H_, t) {
    const MX = 900;
    modelBox(ctx, MX, 120, 340, 500, t, 0, H.ease.out(XS(t, 2.3, 2.7)));
    // conveyor arrows into the model
    const rows = [175, 335, 495];
    rows.forEach((y, i) => arrowLine(ctx, 20, y + 55, MX - 8, y + 55, H.ease.out(XS(t, 2.4 + i * 0.08, 2.8 + i * 0.08)), 3, 18));
    // labelled examples streaming in, faster and faster
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, MX - 4, H_); ctx.clip();
    const r = H.rng(77), K = 46;
    for (let k = 0; k < K; k++) {
      const kind = r() < 0.5 ? 'cat' : 'dog';
      const ts = 2.45 + 3.1 * Math.pow(k / K, 0.75);
      if (t < ts) continue;
      const x = -130 + (t - ts) * (620 + k * 22);
      if (x > MX + 10) continue;
      card(ctx, kind, x, rows[k % 3], 110, kind.toUpperCase());
    }
    ctx.restore();
    // counter
    if (t < 2.6) return;
    const p = XS(t, 2.6, 5.0);
    const n = p >= 1 ? 1e6 : Math.min(1e6, Math.floor(Math.pow(10, 6 * H.ease.inOut(p))) - 1);
    const w = aw(ctx, fmt(n), 30, 700, 64);
    for (let e = 2; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.24 * (3 - e) / 2; aw(ctx, 'EXAMPLES', 30 + w + 18 + e * 14, 700 - e * 3, 64, { outline: true, lw: 1.6 }); ctx.restore(); }
    aw(ctx, 'EXAMPLES', 30 + w + 18, 700, 64, { outline: true, lw: 2.5 });
  }
  function ktLoop(ctx, W, H_, t) {
    // test picture
    card(ctx, 'cat', 70, 150, 230, null);
    const truth = t >= 8.05;
    tag(ctx, truth ? 'ANSWER: CAT' : 'NEW PICTURE', 70, 410, { size: 26 });
    arrowLine(ctx, 315, 265, 465, 265, H.ease.out(XS(t, 6.55, 6.85)));
    const adjust = XS(t, 8.95, 9.35);
    modelBox(ctx, 475, 140, 330, 300, t, adjust, 1);
    arrowLine(ctx, 815, 265, 880, 265, H.ease.out(XS(t, 7.0, 7.2)));
    // data pulse travelling through on the second pass
    if (t > 9.3 && t < 9.6) { const k = XS(t, 9.3, 9.6), x = 315 + k * 565; ctx.fillStyle = INK; ctx.fillRect(x - 14, 252, 28, 26); }
    // output guess
    const right = t >= 9.6;
    if (t >= 7.25 && !right) {
      const s = 1 + 0.4 * Math.pow(1 - H.ease.out(XS(t, 7.25, 7.4)), 2);
      ctx.save(); ctx.translate(900, 330); ctx.scale(s, s);
      for (let e = 3; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.2 * (4 - e) / 3; aw(ctx, 'DOG?', e * 22, -e * 4, 150, { outline: true, lw: 2 }); ctx.restore(); }
      aw(ctx, 'DOG?', 0, 0, 150, { outline: true, lw: 5 }); ctx.restore();
    }
    if (right) {
      const s = 1 + 0.4 * Math.pow(1 - H.ease.out(XS(t, 9.6, 9.75)), 2);
      ctx.save(); ctx.translate(900, 330); ctx.scale(s, s); heroWord(ctx, 'CAT', 0, 0, 150, { speed: true, slice: t >= 10.0 ? { at: 0.58, h: 18, shift: 26 } : null }); ctx.restore();
      // tick drawn on
      const k = H.ease.out(XS(t, 9.75, 9.95));
      if (k > 0) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.lineCap = 'square'; ctx.beginPath(); ctx.moveTo(1170, 270);
        const p1 = [1195, 300], p2 = [1250, 220]; if (k < 0.4) { ctx.lineTo(1170 + (p1[0] - 1170) * k / 0.4, 270 + (p1[1] - 270) * k / 0.4); } else { ctx.lineTo(p1[0], p1[1]); const q = (k - 0.4) / 0.6; ctx.lineTo(p1[0] + (p2[0] - p1[0]) * q, p1[1] + (p2[1] - p1[1]) * q); } ctx.stroke(); ctx.restore(); }
    }
    // the big X on the wrong guess
    if (t >= 7.85 && !right) {
      const k1 = H.ease.out(XS(t, 7.85, 7.97)), k2 = H.ease.out(XS(t, 7.97, 8.09));
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 20; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(880, 170); ctx.lineTo(880 + 340 * k1, 170 + 200 * k1); ctx.stroke();
      if (k2 > 0) { ctx.beginPath(); ctx.moveTo(1220, 170); ctx.lineTo(1220 - 340 * k2, 170 + 200 * k2); ctx.stroke(); }
      ctx.restore();
    }
    // labels that land on what they label
    const drop = (t0) => (1 - H.ease.back(XS(t, t0, t0 + 0.25))) * -60;
    if (t >= 7.35) tag(ctx, 'GUESS', 900, 126 + drop(7.35), { size: 28 });
    if (t >= 8.0 && !right) tag(ctx, 'CHECK ✗ WRONG', 900, 400 + drop(8.0), { size: 28 });
    // error signal travels back to the model
    const e = XS(t, 8.45, 8.9);
    if (e > 0 && t < 9.6) {
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.setLineDash([16, 10]); ctx.lineDashOffset = t * 80;
      const path = [[1050, 420], [1050, 520], [640, 520], [640, 448]];
      let L = 0; for (let i = 1; i < path.length; i++) L += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
      let left = L * H.ease.inOut(e); ctx.beginPath(); ctx.moveTo(1050, 420); let end = path[0];
      for (let i = 1; i < path.length && left > 0; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]), k = Math.min(1, left / d); end = [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * k, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * k]; ctx.lineTo(end[0], end[1]); left -= d; }
      ctx.stroke(); ctx.setLineDash([]);
      if (e >= 1) arrowLine(ctx, 640, 470, 640, 446, 1, 5, 22);
      ctx.restore();
      if (t >= 8.6) tag(ctx, 'ADJUST WEIGHTS', 760, 556 + drop(8.6), { size: 28 });
    }
    // loop strip
    const words = ['GUESS', 'CHECK', 'ADJUST'];
    let act = t < 7.3 ? -1 : t < 7.9 ? 0 : t < 8.5 ? 1 : t < 9.4 ? 2 : t < 9.9 ? 0 : Math.floor((t - 9.9) / 0.12) % 3;
    let x = 30;
    const glyphW = (txt, cap) => { ctx.save(); ctx.font = `400 ${cap / capRatio(ctx)}px "Anton"`; const m = ctx.measureText(txt).width; ctx.restore(); return m; };
    words.forEach((wd, i) => {
      x += aw(ctx, wd, x, 690, 64, { outline: i !== act, lw: 2.5 }) + 14;
      if (i < 2) { const aW = glyphW('→', 64); ctx.fillStyle = INK; arrowShape(ctx, x + 4, 690 - 30, x + aW - 2, 7, 22); ctx.fill(); x += aW + 14; }
    });
    { const iW = glyphW('↻ ', 40); loopIcon(ctx, x + 10 + 19, 690 - 19, 15, 6); aw(ctx, '×1,000,000', x + 10 + Math.max(iW, 46), 690, 40, { outline: false }); }
  }
  function ktProgress(ctx, W, H_, t) {
    for (let e = 2; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.22 * (3 - e) / 2; aw(ctx, 'ACCURACY', 40 + e * 20, 190 - e * 4, 92, { outline: true, lw: 1.6 }); ctx.restore(); }
    aw(ctx, 'ACCURACY', 40, 190, 92, { outline: true, lw: 3 });
    const p = H.ease.inOut(XS(t, 10.85, 12.3));
    const v = Math.round(61 + 36 * p);
    const punch = t >= 12.3 ? 1 + 0.18 * Math.exp(-(t - 12.3) * 10) : 1;
    ctx.save(); ctx.translate(40, 540); ctx.scale(punch, punch); const w = heroWord(ctx, v + '%', 0, 0, 250, { speed: true, slice: t >= 12.55 ? { at: 0.64, h: 30, shift: 22, tick: 12 } : null }); ctx.restore();
    if (t >= 12.3) { // emphasis box draws around the number
      const k = H.ease.out(XS(t, 12.3, 12.55));
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath();
      ctx.rect(22, 262, (w + 40) * k, 306); ctx.stroke(); ctx.restore();
    }
    // bar chart of training rounds
    const x0 = 720, y0 = 600, cw = 520, ch = 360, n = 12;
    ctx.fillStyle = INK; ctx.fillRect(x0, y0, cw, 4);
    for (let i = 0; i < n; i++) {
      const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-(n - 1) / 3.2));
      const k = H.ease.out(XS(t, 10.85 + i * 0.12, 11.05 + i * 0.12));
      const bh = ((acc - 40) / 60) * ch * k, bx = x0 + i * (cw / n) + 4, bw = cw / n - 10;
      if (bh <= 0) continue;
      if (i % 2) { // alternate rounds: 3px stripe hatch held by a hairline rule
        for (let yy = y0 - 3; yy > y0 - bh; yy -= 6) ctx.fillRect(bx, Math.max(y0 - bh, yy - 3), bw, Math.min(3, yy - (y0 - bh)));
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, y0 - bh + 1, bw - 2, bh - 1);
      } else ctx.fillRect(bx, y0 - bh, bw, bh);
    }
    ctx.font = '700 28px "Space Mono"'; ctx.fillText('TRAINING ROUNDS →', x0, y0 + 40);
    if (t >= 12.3) tag(ctx, '97%', x0 + cw - 90, y0 - ch * (57 / 60) - 30, { size: 26 });
  }
  function ktTake(ctx, W, H_, t) {
    const sl = (c) => (t >= c ? 1 + 0.4 * Math.pow(1 - H.ease.out(XS(t, c, c + 0.16)), 2) : 0);
    const settled = (c) => t >= c + 0.16;
    let s = sl(13.0); if (s) { ctx.save(); ctx.translate(40, 270); ctx.scale(s, s);
      heroWord(ctx, 'MORE EXAMPLES', 0, 0, 230, { fitW: W - 80, echo: settled(13.0) ? 3 : 0 }); ctx.restore(); }
    s = sl(13.25); if (s) { ctx.save(); ctx.translate(40, 420); ctx.scale(s, s);
      if (settled(13.25)) for (let e = 3; e >= 1; e--) { ctx.globalAlpha = 0.22 * (4 - e) / 3; arrowShape(ctx, e * 26, -50 - e * 4, 300 + e * 26, 26, 70); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'miter'; ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.fillStyle = INK; arrowShape(ctx, 0, -50, 300, 26, 70); ctx.fill();
      ctx.fillStyle = BG; for (let k = 0; k < 2; k++) ctx.fillRect(0, -50 + 4 + k * 5, 240, 2); // knocked-out speed lines
      ctx.restore(); }
    s = sl(13.5); if (s) { ctx.save(); ctx.translate(40, 690); ctx.scale(s, s);
      if (t < 13.8) {
        if (settled(13.5)) for (let e = 2; e >= 1; e--) { ctx.save(); ctx.globalAlpha = 0.2 * (3 - e) / 2; aw(ctx, 'BETTER GUESSES', e * 24, -e * 4, 230, { fitW: W - 80, outline: true, lw: 2 }); ctx.restore(); }
        aw(ctx, 'BETTER GUESSES', 0, 0, 230, { fitW: W - 80, outline: true, lw: 5 });
      } else heroWord(ctx, 'BETTER GUESSES', 0, 0, 230, { fitW: W - 80, dots: 'bg', echo: 2 });
      ctx.restore(); }
  }
  function sceneLayer(W, H_, fn, t) { const c = H.layer(W, H_), x = c.getContext('2d'); fn(x, W, H_, t); return c; }

  function explainKT(ctx, W, H_, t) {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
    const slam = [0, 0.5, 1.0, 7.25, 7.97, 9.6, 12.3, 13.0, 13.5].reduce((a, c) => a + (t >= c ? Math.exp(-(t - c) * 14) : 0), 0);
    const sr = H.rng(Math.floor(t * 30) + 5);
    ctx.save(); ctx.translate((sr() - 0.5) * 12 * slam, (sr() - 0.5) * 12 * slam);
    if (t < 2.5) {
      // hook: the stack slams in, then shrinks into the corner header
      const k = H.ease.inOut(XS(t, 1.85, 2.45));
      ctx.save(); ctx.translate(30 * k, 20 * k); ctx.scale(1 - 0.93 * k, 1 - 0.93 * k); ktHook(ctx, W, H_, t); ctx.restore();
      if (t > 2.3) header(ctx);
      if (t > 2.3) ktData(ctx, W, H_, t);
    } else if (t < 6.0) {
      header(ctx); ktData(ctx, W, H_, t);
    } else if (t < 10.5) {
      header(ctx);
      if (t < 6.4) {
        // slice-glitch cut: the data scene is torn into bands that fly apart
        const p = H.ease.in(XS(t, 6.0, 6.4));
        const A = sceneLayer(W, H_, ktData, 5.99), B = sceneLayer(W, H_, ktLoop, t);
        ctx.drawImage(B, 0, 0);
        const bands = 9, bh = H_ / bands;
        for (let i = 0; i < bands; i++) {
          const dir = i % 2 ? 1 : -1, off = dir * p * W * (1.1 + (i % 3) * 0.35);
          ctx.fillStyle = BG; if (p < 0.98) ctx.fillRect(off, i * bh, W, bh);
          ctx.drawImage(A, 0, i * bh, W, bh, off, i * bh, W, bh);
        }
      } else ktLoop(ctx, W, H_, t);
    } else if (t < 13.0) {
      header(ctx);
      if (t < 10.8) {
        // whip-pan: scene smears off left with echo copies, next one arrives from the right
        const p = H.ease.inOut(XS(t, 10.5, 10.8));
        const A = sceneLayer(W, H_, ktLoop, 10.49), B = sceneLayer(W, H_, ktProgress, t);
        for (let e = 3; e >= 0; e--) { ctx.globalAlpha = e ? 0.18 : 1; ctx.drawImage(A, -p * W * 1.2 + e * 60 * p, 0); ctx.drawImage(B, W * (1 - p) + e * 60 * (1 - p) * (p > 0 ? 1 : 0), 0); }
        ctx.globalAlpha = 1;
      } else ktProgress(ctx, W, H_, t);
    } else {
      ktTake(ctx, W, H_, t);
    }
    ctx.restore();
    // one-frame inverted flashes on the key hits (wrong guess, 97%)
    if ((t >= 7.97 && t < 8.0) || (t >= 12.3 && t < 12.333)) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H_); ctx.restore(); }
    H.grain(ctx, W, H_, 0.04, 91 + Math.floor(t * 12));
  }

  registerStyle({
    id: 'kinetic-type',
    name: 'Kinetic Type',
    category: 'Generative & Type',
    description: 'A typographic music-video frame: condensed words cropped edge to edge with zero leading, filled vs outlined, strobe echoes, a slice glitch and one word stretched and filled with a halftone dreamscape — strictly two colours.',
    motion: 'One word per beat at 120 bpm: THE punches in, MACHINES whips in from the right trailing outline echoes, LEARNED slams up with a one-frame inverted flash, the TO tab wipes up, DREAM springs open and its halftone moon develops; then the slice glitch and echoes pulse on every beat.',
    fonts: ['400 200px "Anton"', '400 60px "Inter"', '800 60px "Inter"', '700 14px "Space Mono"', '400 14px "Space Mono"'],
    duration: 5,
    frameT: 4.9,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: 'Words slam in on the beat and do the explaining; scenes change with a slice-glitch tear and a whip-pan, arrows are heavy rules with chevrons, labels are inverted mono tags that drop onto their targets, and the counters are huge Anton numerals with a strobe-flash on the key hits.',
    explainer(ctx, W, H_, t) { explainKT(ctx, W, H_, t); },
    // Sound: a type-driven music video. A low 120 bpm pulse bed (the cut grid: beats at 0, 0.5, 1.0 ... 13.0, 13.5)
    // drops out for each hard cut; every word that slams in gets a punchy kick + snap (bigger with a synth stab on the
    // key hits); the slice-glitch cut is a real glitch tear, the whip-pan one fast whoosh, counters tick as short
    // filtered blips, the bars of the chart are pitched plucks. Timings mirror explainKT / kt* scenes (slam list etc).
    explainerSound(k) {
      const E = H.ease;
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // word slam: kick body + bright snap
      const slam = (t, g, p = 0) => { k.tone(t, { f: [[0, 160], [0.12, 46]], dur: 0.26, gain: 0.42 * g, a: 0.002, pan: p }); k.noise(t, { dur: 0.06, filter: 'bandpass', f: 1800, q: 0.8, gain: 0.22 * g, a: 0.001, pan: p }); k.noise(t, { dur: 0.12, color: 'brown', filter: 'lowpass', f: 400, gain: 0.2 * g, a: 0.002, pan: p }); };
      // detuned saw stab
      const stab = (t, notes, dur, g) => notes.forEach((n, i) => { for (const det of [-8, 8]) k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.03 * g, a: 0.004, hold: dur * 0.3, filter: 'lowpass', f2: [[0, 2200], [dur, 500]], q: 0.8, pan: (i - (notes.length - 1) / 2) * 0.3, verb: 0.2 }); });
      const blip = (t, f, g, p) => k.tone(t, { f, type: 'square', dur: 0.03, gain: 0.04 * g, a: 0.001, hold: 0.015, filter: 'lowpass', f2: 2000, pan: p, minor: true });
      const zip = (t, dur, p) => k.noise(t, { dur, filter: 'bandpass', f: [[0, 700], [dur, 2000]], q: 1.5, gain: 0.07, a: dur * 0.5, pan: p, minor: true });
      const tagIn = (t0, p) => k.play('tock', when(t0, t0 + 0.25, E.back, 1), { f: 650, gain: 0.32, pan: p, minor: true });

      // ---- music: low pulse on the 120 bpm grid, out for the cuts
      k.music('pulse', 0, 6.0, { bpm: 120, gain: 0.5, chords: [['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'A3', 'C4'], ['G2', 'D3', 'G3', 'B3']] });
      k.music('pulse', 6.5, 10.5, { bpm: 120, gain: 0.45, chords: [['D3', 'A3', 'C4', 'F4'], ['E3', 'B3', 'D4', 'G#4']] });
      k.music('pulse', 11.0, 12.3, { bpm: 120, gain: 0.45, chords: [['F2', 'C3', 'A3', 'E4']] });
      k.music('pulse', 13.0, 14.5, { bpm: 120, gain: 0.5, chords: [['C3', 'G3', 'C4', 'E4']] });

      // ---- hook: HOW DOES / AI / LEARN? slam on beats 0, 0.5, 1.0; the stack shrinks to the header (1.85-2.45)
      slam(0.0, 1, -0.3);
      slam(0.5, 0.9, 0.3); k.noise(0.42, { dur: 0.1, filter: 'highpass', f: [[0, 1500], [0.1, 3500]], gain: 0.06, a: 0.08, pan: 0.6, minor: true }); // AI whips in
      slam(1.0, 1.2, 0.2); stab(1.0, ['A3', 'C4', 'E4'], 0.4, 1);
      k.tone(1.85, { f: [[0, 300], [0.6, 90]], type: 'triangle', dur: 0.6, gain: 0.05, a: 0.1, minor: true }); // shrink away

      // ---- data: model box draws (2.3-2.7), arrows, counter, 1,000,000
      k.tone(2.3, { f: [[0, 120], [0.4, 420]], type: 'sawtooth', dur: 0.42, gain: 0.04, a: 0.05, hold: 0.3, filter: 'lowpass', f2: 900, pan: pan(1070), minor: true });
      [0, 1, 2].forEach((i) => zip(2.4 + i * 0.08, 0.38, -0.3));
      { let prev = 0, last = -1; for (let t = 2.62; t <= 4.98; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 2.6, 5.0)) * 32); if (s !== prev && t - last >= 1 / 10) { blip(t, 700 + 500 * XS(t, 2.6, 5.0), 1, -0.5); last = t; } prev = s; } }
      slam(5.0, 1, -0.5); stab(5.0, ['G3', 'B3', 'D4'], 0.3, 0.8);

      // ---- slice-glitch tear 6.0-6.4 (bands fly apart, ease in)
      k.play('glitch', 6.0, { gain: 1.1 });
      k.noise(6.05, { dur: 0.35, filter: 'bandpass', f: [[0, 600], [0.35, 3000]], q: 0.9, gain: 0.12, a: 0.3 });

      // ---- loop: arrows, DOG? slam, wrong X, error dashes, weights jump, pulse through, CAT ✓
      zip(6.55, 0.3, pan(390)); zip(7.0, 0.2, pan(850));
      slam(7.25, 1, pan(1050)); tagIn(7.35, pan(950));
      k.noise(7.85, { dur: 0.12, filter: 'bandpass', f: [[0, 900], [0.12, 2200]], q: 1, gain: 0.12, a: 0.08, pan: pan(1050) }); // first stroke of the X
      slam(7.97, 1.3, pan(1050)); stab(7.97, ['A#2', 'E3', 'A3'], 0.45, 1.2); // second stroke + flash: wrong
      // (the CHECK tag lands at 8.09 inside the wrong hit, so it stays silent)
      k.withMinor(() => { for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, tt = when(8.45, 8.9, E.inOut, u); blip(tt, 520 - i * 30, 1.2, pan(1050 - 410 * u)); } }); // error dashes run back
      tagIn(8.6, pan(760));
      k.tone(8.95, { f: [[0, 180], [0.12, 520]], type: 'sawtooth', dur: 0.14, gain: 0.05, a: 0.02, hold: 0.06, filter: 'lowpass', f2: 1200, pan: pan(640) }); // weights jump (back ease overshoot)
      k.play('click', when(8.95, 9.35, E.back, 1), { f: 1500, gain: 1.1, pan: pan(640), minor: true });
      k.tone(9.3, { f: [[0, 220], [0.3, 660]], type: 'square', dur: 0.3, gain: 0.03, a: 0.02, hold: 0.2, filter: 'lowpass', f2: 1400, pan: 0, minor: true }); // data pulse runs through
      slam(9.6, 1.1, pan(1030)); stab(9.6, ['C4', 'E4', 'G4'], 0.35, 1);
      stab(9.8, ['G4', 'C5'], 0.4, 0.6); // tick drawn

      // ---- whip-pan 10.5-10.8
      k.play('whoosh', 10.48, { dur: 0.34, top: 2200, gain: 0.8 });

      // ---- progress: bars rise (10.85 + i*0.12), counter, 97% slam
      k.withMinor(() => { for (let i = 0; i < 12; i++) { const acc = 61 + 36 * (1 - Math.exp(-i / 3.2)) / (1 - Math.exp(-11 / 3.2)); k.tone(10.85 + i * 0.12 + 0.04, { f: 110 * Math.pow(2, (acc - 61) / 36 * 1.2), type: 'triangle', dur: 0.15, gain: 0.12, a: 0.003, pan: pan(740 + i * 43) }); } });
      { let prev = 0, last = -1; for (let t = 10.86; t <= 12.28; t += 0.002) { const s = Math.floor(E.inOut(XS(t, 10.85, 12.3)) * 36), near = ((t - 10.89) % 0.12 + 0.12) % 0.12 < 0.04; if (s !== prev && !near && t - last >= 1 / 8) { k.noise(t, { dur: 0.015, filter: 'bandpass', f: 2200, q: 2, gain: 0.16, a: 0.001, pan: -0.5, minor: true }); last = t; } prev = s; } }
      slam(12.3, 1.6, -0.3); k.play('impact', 12.3, { gain: 0.9, pan: -0.3 });
      stab(12.3, ['A3', 'C#4', 'E4', 'A4'], 0.7, 1.4);
      k.noise(12.3, { dur: 0.25, filter: 'bandpass', f: [[0, 800], [0.25, 1800]], q: 1.2, gain: 0.05, a: 0.15, minor: true }); // box draws round it

      // ---- takeaway: three slams on the beat, resolve as BETTER GUESSES fills in (13.8)
      slam(13.0, 0.85, -0.2);
      slam(13.25, 0.7, -0.3); zip(13.22, 0.1, -0.3);
      slam(13.5, 0.95, 0); stab(13.5, ['C4', 'E4', 'G4'], 0.3, 0.7);
      stab(13.8, ['C3', 'G3', 'C4', 'E4', 'G4'], 0.65, 1);
    },
    draw(ctx, W, H_, t) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H_);
      const beat = (t * 2) % 1; // 120 bpm
      const kick = Math.exp(-beat * 6);
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      // per-word cue times (on the beat)
      const P = (t0, d) => H.clamp((t - t0) / d);
      const pThe = P(0.0, 0.16), pMac = P(0.5, 0.26), pLea = P(1.0, 0.2), pSlice = t >= 1.5 ? 1 : 0;
      const pTo = P(2.0, 0.18), pDr = P(2.5, 0.32), pDots = P(2.6, 0.5);
      // camera shake on each slam, decaying fast
      const slam = [0, 1.0, 2.5].reduce((a, c) => a + (t >= c ? Math.exp(-(t - c) * 14) : 0), 0);
      const sr = H.rng(Math.floor(t * 30) + 1);
      ctx.save();
      ctx.translate((sr() - 0.5) * 14 * slam, (sr() - 0.5) * 14 * slam);

      // ---------- ROW 1: "THE" light + "MACHINES" outline, with strobe echoes ----------
      const C1 = 128, C2 = 262, gap = 12, top = 16;
      ctx.font = '400 200px "Anton"';
      const aCap = ctx.measureText('MACHINES').actualBoundingBoxAscent / 200; // cap-height ratio
      const s1 = C1 / aCap;
      ctx.font = `400 ${s1}px "Anton"`;
      const mM = ctx.measureText('MACHINES');
      const mW = mM.actualBoundingBoxLeft + mM.actualBoundingBoxRight;
      ctx.font = '400 100px "Inter"';
      const iCap = ctx.measureText('THE').actualBoundingBoxAscent / 100;
      const sT = C1 / iCap;
      ctx.font = `400 ${sT}px "Inter"`;
      const mT = ctx.measureText('THE');
      const tW = mT.actualBoundingBoxLeft + mT.actualBoundingBoxRight;
      const inner = 22;
      const row1W = tW + inner + mW;
      const sx1 = (W + 12) / row1W;
      const base1 = top + C1;
      ctx.save(); ctx.translate(-4, 0); ctx.scale(sx1, 1);
      if (pThe > 0) {
        const sc = 1 + 0.35 * Math.pow(1 - H.ease.out(pThe), 2);
        ctx.save(); ctx.translate(tW / 2, base1 - C1 / 2); ctx.scale(sc, sc); ctx.translate(-tW / 2, -(base1 - C1 / 2));
        ctx.fillStyle = INK; ctx.fillText('THE', mT.actualBoundingBoxLeft, base1); ctx.restore();
      }
      const mx = tW + inner + mM.actualBoundingBoxLeft;
      ctx.font = `400 ${s1}px "Anton"`; ctx.lineJoin = 'miter'; ctx.strokeStyle = INK;
      if (pMac > 0) {
        // whip in from the right; echoes trail horizontally while moving, then fan upward
        const em = H.ease.out(pMac), offX = (1 - em) * 900;
        const settle = H.ease.inOut(P(0.76, 0.4));
        for (let e = 3; e >= 1; e--) {
          ctx.globalAlpha = 0.18 * (4 - e) * (0.6 + 0.4 * (t > 1.5 ? kick : 1)); ctx.lineWidth = 1.4 / sx1;
          const ex = offX + e * 70 * (1 - em) * 3, ey = -e * 30 * settle;
          ctx.strokeText('MACHINES', mx + ex, base1 + ey);
        }
        ctx.globalAlpha = 1; ctx.lineWidth = 3.2 / sx1;
        ctx.strokeText('MACHINES', mx + offX, base1);
      }
      ctx.restore();

      // ---------- ROW 2: "LEARNED" massive fill, stretched edge to edge, slice glitch ----------
      const s2 = C2 / aCap;
      ctx.font = `400 ${s2}px "Anton"`;
      const mL = ctx.measureText('LEARNED');
      const lW = mL.actualBoundingBoxLeft + mL.actualBoundingBoxRight;
      const sx2 = (W + 30) / lW;
      const base2 = base1 + gap + C2;
      const lay = H.layer(W, H_), lc = lay.getContext('2d');
      lc.save(); lc.translate(-15, 0); lc.scale(sx2, 1);
      lc.font = `400 ${s2}px "Anton"`; lc.fillStyle = INK; lc.textBaseline = 'alphabetic';
      lc.fillText('LEARNED', mL.actualBoundingBoxLeft, base2);
      lc.restore();
      // knocked-out speed lines through the lower third
      lc.globalCompositeOperation = 'destination-out';
      for (let k = 0; k < 3; k++) lc.fillRect(0, base2 - C2 * (0.2 + k * 0.045), W, 4 - k);
      // slice glitch: cut a band and shove it sideways on the beat
      const sy = Math.round(base2 - C2 * 0.6), sh = 28, shift = 22 + Math.round(kick * 26);
      if (pSlice) {
        const band = H.layer(W, sh); band.getContext('2d').drawImage(lay, 0, sy, W, sh, 0, 0, W, sh);
        lc.fillRect(0, sy, W, sh);
        lc.globalCompositeOperation = 'source-over'; lc.drawImage(band, shift, sy);
      }
      if (pLea > 0) {
        const el = H.ease.out(pLea), dy = (1 - el) * 420;
        // squash on impact (2 frames), then hold
        const sq = pLea >= 1 ? 1 + 0.06 * Math.exp(-(t - 1.2) * 20) : 1;
        ctx.save(); ctx.translate(0, base2); ctx.scale(1, 1 / sq); ctx.translate(0, -base2 + dy);
        ctx.drawImage(lay, 0, 0); ctx.restore();
        if (pSlice) { ctx.fillStyle = INK; ctx.fillRect(0, sy + sh + 5, shift - 12, 2); ctx.fillRect(0, sy - 7, shift * 0.6, 2); }
      }

      // ---------- ROW 3: "TO" tab + "DREAM" stretched with halftone image ----------
      const r3top = base2 + gap;
      const r3h = H_ - r3top - 6;
      // TO tab: filled block with knocked-out letters, rotated
      const tabW = 104;
      ctx.save();
      const tabH = r3h * H.ease.out(pTo);
      ctx.beginPath(); ctx.rect(0, r3top + r3h - tabH, tabW, tabH); ctx.clip();
      ctx.fillStyle = INK; ctx.fillRect(0, r3top, tabW, r3h);
      ctx.save();
      ctx.translate(tabW / 2 + 2, r3top + 14); ctx.rotate(Math.PI / 2);
      ctx.font = '800 92px "Inter"'; ctx.fillStyle = BG; ctx.textBaseline = 'middle';
      ctx.fillText('TO', 0, 2);
      ctx.restore();
      ctx.font = '700 14px "Space Mono"'; ctx.fillStyle = BG;
      ctx.save(); ctx.translate(20, H_ - 14); ctx.rotate(-Math.PI / 2); ctx.fillText('02:47', 0, 0); ctx.restore();
      ctx.save(); ctx.font = '700 13px "Space Mono"'; ctx.fillStyle = BG; ctx.textBaseline = 'alphabetic';
      ctx.translate(tabW - 16, H_ - 14); ctx.rotate(-Math.PI / 2); ctx.fillText('[VERSE 02]', 0, 0); ctx.restore();
      const chx = tabW / 2, chy = r3top + 150, cs = 9 + kick * 4;
      ctx.strokeStyle = BG; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(chx - cs, chy); ctx.lineTo(chx + cs, chy); ctx.moveTo(chx, chy - cs); ctx.lineTo(chx, chy + cs); ctx.stroke();
      ctx.beginPath(); ctx.arc(chx, chy, cs * 0.6, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // DREAM: stretched to fill the remaining box
      const dx0 = tabW + 14, dW = W - dx0 + 20, dH = r3h;
      ctx.font = '400 200px "Anton"';
      const mD = ctx.measureText('DREAM');
      const dWnat = mD.actualBoundingBoxLeft + mD.actualBoundingBoxRight, dHnat = mD.actualBoundingBoxAscent;
      const sxD = dW / dWnat, syD = ((dH - 6) / dHnat) * Math.max(0.02, pDr <= 0 ? 0 : H.ease.back(pDr));
      const dTop = r3top + (dH - 6) * (1 - syD / ((dH - 6) / dHnat));
      const mask = H.layer(W, H_), mk = mask.getContext('2d');
      mk.save(); mk.translate(dx0, dTop); mk.scale(sxD, syD);
      mk.font = '400 200px "Anton"'; mk.fillStyle = '#fff'; mk.textBaseline = 'alphabetic';
      mk.fillText('DREAM', mD.actualBoundingBoxLeft, dHnat);
      mk.restore();
      // halftone dreamscape: moon + drifting clouds rendered as rotated dot screen
      const img = H.layer(W, H_), ic = img.getContext('2d');
      const nz = H.makeNoise(31);
      const step = 9, ang = Math.PI / 4, ca = Math.cos(ang), sa = Math.sin(ang);
      ic.fillStyle = INK;
      const moonX = 860, moonY = r3top + dH * 0.42, moonR = 120;
      for (let v = -900; v < 1500; v += step) {
        for (let u = -900; u < 1900; u += step) {
          const x = u * ca - v * sa + 200, y = u * sa + v * ca - 200;
          if (x < dx0 - 10 || x > W + 10 || y < r3top - 10 || y > H_ + 10) continue;
          // image brightness
          const cl = nz.fbm2(x * 0.0035 + t * 0.08, y * 0.009, 4) * 0.5 + 0.5;
          const md = Math.hypot(x - moonX, y - moonY);
          // crescent moon: disc minus offset disc, soft glow around
          const md2 = Math.hypot(x - moonX - 46, y - moonY + 26);
          const disc = md < moonR ? 1 : 0, bite = md2 < moonR * 0.92 ? 1 : 0;
          const glow = Math.max(0, 0.42 - Math.max(0, md - moonR) / 260);
          const cloud = Math.pow(H.clamp(cl * 1.6 - 0.55), 1.3);       // banded drifting clouds
          const sky = 0.06 + 0.22 * H.smooth(r3top, H_, y);              // brighter toward horizon
          let b = disc && !bite ? 1 : Math.max(sky, glow * (1 - bite * 0.7), cloud * 0.9);
          b = H.clamp(b);
          const rad = Math.sqrt(b) * step * 0.62 * H.ease.out(H.clamp(pDots * 1.6 - (1 - b) * 0.6));
          if (rad < 0.5) continue;
          ic.beginPath(); ic.arc(x, y, rad, 0, Math.PI * 2); ic.fill();
        }
      }
      // mask image by DREAM letters
      ic.globalCompositeOperation = 'destination-in'; ic.drawImage(mask, 0, 0);
      if (pDr > 0) ctx.drawImage(img, 0, 0);
      // letter outline so the word holds its shape
      if (pDr > 0) { ctx.save(); ctx.translate(dx0, dTop); ctx.scale(sxD, syD);
      ctx.font = '400 200px "Anton"'; ctx.strokeStyle = INK; ctx.lineWidth = 2.4 / Math.min(sxD, syD);
      ctx.strokeText('DREAM', mD.actualBoundingBoxLeft, dHnat);
      ctx.restore(); }

      ctx.restore(); // camera shake
      // one-frame inverted flash on the LEARNED and DREAM impacts (music-video cut)
      if ((t >= 1.2 && t < 1.2 + 1 / 30) || (t >= 2.82 && t < 2.82 + 1 / 30)) {
        ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H_); ctx.restore();
      }

      // ---------- finish: subtle print/video grain ----------
      H.grain(ctx, W, H_, 0.04, 77 + Math.floor(t * 12));
    },
  });
}
```
