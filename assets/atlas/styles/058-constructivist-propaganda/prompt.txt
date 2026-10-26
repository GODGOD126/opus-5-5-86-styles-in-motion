I want an animated explainer made in the "Constructivist Propaganda" visual style (Art & Design Movements). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Anton, Oswald, Russo One
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;700&family=Russo+One&display=block">
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
Name: Constructivist Propaganda
Family: Art & Design Movements
Look: A 1920s Rodchenko / El Lissitzky agitprop poster: red, black and cream only, a halftone photomontage robot bellowing through a megaphone, beams radiating from its voice, a red disc and hard diagonal bars, and heavy condensed lettering set on the slant — litho ink mottle on cheap paper.
Motion: Agitprop staccato: the red disc rolls in, the halftone robot slides up the diagonal, beams punch out of the megaphone two frames at a time, the slogan bars shoot across and the words slam down on the beat; in the hold the beam fan pulses with each shout.
How it explains: Agitprop sequence: Lissitzky's red wedge drives across the sheet between scenes, slogans and labels slam onto slanted bars on twos, arrows are heavy bars with wedge heads, the counter is stencil-tall Anton, and the key moments get a stamped red cross or a burst of beams.

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

REFERENCE STYLE SOURCE (styles/constructivist.js; W/H_ are always 1280x720)
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
  const inkify = (layer, seed, mottle, speck) => {
    const c = layer.getContext('2d'), w = layer.width, h = layer.height, img = c.getImageData(0, 0, w, h), d = img.data;
    const n1 = fieldNoise(w, h, seed, 4, 3), n2 = fieldNoise(w, h, seed + 9, 36, 3), r = H.rng(seed + 3);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (!d[i + 3]) continue;
      let a = 1 - mottle * Math.max(0, n1[p] * 1.7 + n2[p] * 1.1);
      if (r() < speck * (0.3 + Math.max(0, n2[p]) * 4)) a *= 0.2;
      d[i + 3] *= H.clamp(a, 0, 1);
    }
    c.putImageData(img, 0, 0);
  };

  let PHOTO = null;
  const CACHE = {}; const CF = (k, ...a) => CACHE[k] || (CACHE[k] = fieldNoise(...a));
  const RED = '#c8281e', BLACK = '#1d1a17', CREAM = '#e9dcbc';

  // grayscale "photograph" of a robot shouting into a megaphone (profile, facing right)
  const drawPhoto = (c, t) => {
    const lg = (x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, v]) => g.addColorStop(o, `rgb(${v},${v},${v})`)); return g; };
    const rg = (x, y, r0, r1, stops) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, v]) => g.addColorStop(o, `rgb(${v},${v},${v})`)); return g; };
    // torso / shoulders
    c.fillStyle = lg(150, 470, 560, 720, [[0, 70], [0.45, 150], [0.75, 210], [1, 120]]);
    c.beginPath(); c.moveTo(120, 760); c.lineTo(170, 520); c.quadraticCurveTo(200, 470, 290, 458); c.lineTo(470, 458); c.quadraticCurveTo(560, 470, 590, 540); c.lineTo(640, 760); c.closePath(); c.fill();
    // chest plate seams + rivets
    c.strokeStyle = 'rgb(40,40,40)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(380, 470); c.lineTo(390, 760); c.stroke();
    c.beginPath(); c.moveTo(200, 560); c.lineTo(600, 560); c.stroke();
    c.fillStyle = 'rgb(30,30,30)';
    for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(230 + i * 55, 585, 6, 0, 7); c.fill(); }
    c.fillStyle = rg(470, 640, 5, 90, [[0, 250], [1, 90]]); c.beginPath(); c.arc(470, 650, 70, 0, 7); c.fill(); // power core
    c.fillStyle = 'rgb(25,25,25)'; c.beginPath(); c.arc(470, 650, 38, 0, 7); c.fill();
    c.fillStyle = rg(462, 640, 2, 30, [[0, 255], [1, 120]]); c.beginPath(); c.arc(470, 650, 26, 0, 7); c.fill();
    // neck rings
    for (let i = 0; i < 4; i++) {
      c.fillStyle = lg(320, 0, 440, 0, [[0, 50], [0.6, 200], [1, 90]]);
      c.beginPath(); c.ellipse(380, 445 - i * 16, 58, 13, 0, 0, 7); c.fill();
    }
    // head (profile)
    c.fillStyle = lg(250, 160, 520, 420, [[0, 60], [0.35, 140], [0.7, 225], [1, 160]]);
    c.beginPath();
    c.moveTo(270, 400); c.lineTo(250, 250); c.quadraticCurveTo(250, 150, 360, 140); c.lineTo(450, 140);
    c.quadraticCurveTo(510, 145, 520, 210); c.lineTo(535, 300); c.lineTo(520, 345); c.lineTo(500, 400); c.closePath(); c.fill();
    // jaw shadow
    c.fillStyle = 'rgba(20,20,20,0.55)'; c.beginPath(); c.moveTo(270, 400); c.lineTo(500, 400); c.lineTo(515, 360); c.lineTo(290, 370); c.closePath(); c.fill();
    // visor
    c.fillStyle = lg(380, 200, 540, 260, [[0, 20], [0.7, 40], [1, 90]]);
    c.beginPath(); c.moveTo(380, 205); c.lineTo(522, 205); c.lineTo(530, 262); c.lineTo(390, 262); c.closePath(); c.fill();
    c.fillStyle = rg(480, 228, 2, 40, [[0, 255], [1, 40]]); c.beginPath(); c.ellipse(480, 230, 34, 14, 0, 0, 7); c.fill(); // glowing eye
    c.strokeStyle = 'rgb(250,250,250)'; c.lineWidth = 4; c.beginPath(); c.moveTo(395, 212); c.lineTo(515, 212); c.stroke(); // visor glint
    // ear disc
    c.fillStyle = rg(330, 270, 4, 52, [[0, 240], [0.5, 150], [1, 40]]); c.beginPath(); c.arc(330, 275, 48, 0, 7); c.fill();
    c.strokeStyle = 'rgb(30,30,30)'; c.lineWidth = 5; c.beginPath(); c.arc(330, 275, 30, 0, 7); c.stroke();
    c.fillStyle = 'rgb(20,20,20)'; c.beginPath(); c.arc(330, 275, 10, 0, 7); c.fill();
    // antenna bolts
    c.fillStyle = lg(300, 100, 330, 100, [[0, 60], [1, 220]]); c.fillRect(300, 92, 18, 52);
    c.fillStyle = rg(309, 88, 2, 18, [[0, 250], [1, 50]]); c.beginPath(); c.arc(309, 88, 16, 0, 7); c.fill();
    // mouth grille
    c.fillStyle = 'rgb(25,25,25)'; c.fillRect(440, 300, 70, 46);
    c.fillStyle = 'rgb(170,170,170)'; for (let i = 0; i < 4; i++) c.fillRect(444, 304 + i * 11, 62, 4);
    // megaphone cone (from mouth to upper right)
    const mx0 = 500, my0 = 322, mx1 = 690, my1 = 228, a = Math.atan2(my1 - my0, mx1 - mx0), nx = -Math.sin(a), ny = Math.cos(a);
    const r0 = 24, r1 = 92;
    c.fillStyle = lg(mx0 + nx * r1, my0 + ny * r1, mx0 - nx * r1, my0 - ny * r1, [[0, 50], [0.35, 140], [0.62, 245], [0.8, 190], [1, 80]]);
    c.beginPath(); c.moveTo(mx0 + nx * r0, my0 + ny * r0); c.lineTo(mx1 + nx * r1, my1 + ny * r1); c.lineTo(mx1 - nx * r1, my1 - ny * r1); c.lineTo(mx0 - nx * r0, my0 - ny * r0); c.closePath(); c.fill();
    // bell rim
    c.save(); c.translate(mx1, my1); c.rotate(a);
    c.fillStyle = 'rgb(35,35,35)'; c.beginPath(); c.ellipse(0, 0, 26, r1 + 4, 0, 0, 7); c.fill();
    c.fillStyle = rg(6, 0, 2, 70, [[0, 30], [1, 110]]); c.beginPath(); c.ellipse(4, 0, 18, r1 - 6, 0, 0, 7); c.fill();
    c.restore();
    // handle + raised arm
    c.fillStyle = lg(420, 360, 520, 460, [[0, 80], [0.5, 210], [1, 70]]);
    c.beginPath(); c.moveTo(560, 300); c.lineTo(588, 290); c.lineTo(560, 430); c.lineTo(520, 470); c.lineTo(470, 470); c.lineTo(530, 400); c.closePath(); c.fill();
    c.fillStyle = 'rgb(40,40,40)'; c.beginPath(); c.arc(560, 330, 16, 0, 7); c.fill();
    return { mx1, my1, a };
  };

  // cut out + halftone-screen a grayscale "photograph" (drawn by fn) once; returns photo, dot layer and cut-out rim
  const screenPhoto = (fn, W, HH, seed = 19, S = 6.2, gam = 1) => {
    const PH = H.layer(W, HH), pc = PH.getContext('2d');
    fn(pc);
    const pdat = pc.getImageData(0, 0, W, HH).data;
    const HT = H.layer(W, HH), hc = HT.getContext('2d');
    const th = Math.PI / 4, cs = Math.cos(th), sn = Math.sin(th);
    hc.fillStyle = BLACK; hc.beginPath();
    const ext = 1100;
    for (let v = -ext / S; v < ext / S; v++) for (let u = -ext / S; u < ext / S * 1.6; u++) {
      const x = (u * cs - v * sn) * S + 120, y = (u * sn + v * cs) * S - 400;
      if (x < 0 || y < 0 || x >= W || y >= HH) continue;
      const k = ((y | 0) * W + (x | 0)) * 4;
      const al = pdat[k + 3] / 255; if (al < 0.5) continue;
      const lum = gam === 1 ? pdat[k] / 255 : Math.pow(pdat[k] / 255, gam); // gam < 1 opens the midtones for small pastes
      const dk = Math.pow(1 - lum, 0.9);
      const rad = S * 0.62 * Math.sqrt(dk) + 0.35;
      hc.moveTo(x + rad, y); hc.arc(x, y, rad, 0, Math.PI * 2);
    }
    hc.fill();
    const SIL = H.layer(W, HH), sc = SIL.getContext('2d');
    sc.drawImage(PH, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#efe5cc'; sc.fillRect(0, 0, W, HH);
    inkify(HT, seed, 0.18, 0.004);
    return { PH, HT, SIL };
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // Agitprop sequence: Lissitzky's red wedge drives across the sheet between scenes, slogans slam on slanted
  // bars, arrows are heavy bars with wedge heads, numbers are stencil-tall Anton, photos are halftone cut-outs.
  const EXC = {};
  const exPaperC = (W, HH) => EXC.paper || (EXC.paper = (() => {
    const cv = H.layer(W, HH), x = cv.getContext('2d'), img = x.createImageData(W, HH), pd = img.data;
    const lo = CF('lo', W, HH, 41, 22, 4), fib = CF('fib', W, HH, 42, 2, 2, 4, 0.5), r0 = H.rng(5), base = H.hex(CREAM), tan = H.hex('#b99a62');
    for (let y = 0, p = 0; y < HH; y++) for (let xx = 0; xx < W; xx++, p++) {
      const ex = Math.min(xx, W - xx) / W, ey = Math.min(y, HH - y) / HH;
      const edge = Math.pow(1 - H.clamp(Math.min(ex * 4, ey * 3) + lo[p] * 0.2, 0, 1), 3), k = 0.4 * edge + 0.16 * Math.max(0, lo[p]);
      const s = 1 + fib[p] * 0.04 + (r0() - 0.5) * 0.05, i = p * 4;
      pd[i] = (base[0] + (tan[0] - base[0]) * k) * s; pd[i + 1] = (base[1] + (tan[1] - base[1]) * k) * s; pd[i + 2] = (base[2] + (tan[2] - base[2]) * k) * s; pd[i + 3] = 255;
    }
    x.putImageData(img, 0, 0); return cv;
  })());
  const exInk = (layer, seed, mottle, speck = 0) => { // cached-noise version of inkify (mottle + pinhole voids)
    const c = layer.getContext('2d'), w = layer.width, h = layer.height, img = c.getImageData(0, 0, w, h), d = img.data;
    const n1 = CF('ei1', w, h, seed, 4, 3), n2 = CF('ei2', w, h, seed + 9, 36, 3);
    const rnd = CACHE['rnd' + w] || (CACHE['rnd' + w] = (() => { const r = H.rng(seed + 3), a = new Float32Array(w * h); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })());
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (!d[i + 3]) continue;
      const m = n2[p] > 0 ? n2[p] : 0;
      let a = 1 - mottle * Math.max(0, n1[p] * 1.7 + n2[p] * 1.1);
      if (rnd[p] < speck * (0.3 + m * 4)) a *= 0.2;
      d[i + 3] *= a < 0 ? 0 : a > 1 ? 1 : a;
    }
    c.putImageData(img, 0, 0);
  };
  // grayscale studio "photos" of a cat and a dog, for the halftone screen
  const drawAnimal = (kind) => (c) => {
    const g = (x0, y0, x1, y1, st) => { const gr = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, v]) => gr.addColorStop(o, `rgb(${v},${v},${v})`)); return gr; };
    c.save(); c.translate(300, 300);
    if (kind === 'cat') {
      c.fillStyle = g(-120, -100, 120, 140, [[0, 60], [0.5, 150], [1, 230]]);
      c.beginPath(); c.ellipse(0, 70, 95, 110, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(0, -60, 72, 0, 7); c.fill();
      c.beginPath(); c.moveTo(-66, -80); c.lineTo(-58, -160); c.lineTo(-14, -118); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(66, -80); c.lineTo(58, -160); c.lineTo(14, -118); c.closePath(); c.fill();
      c.fillStyle = 'rgb(240,240,240)'; c.beginPath(); c.ellipse(-26, -64, 14, 10, 0, 0, 7); c.ellipse(26, -64, 14, 10, 0, 0, 7); c.fill();
      c.fillStyle = 'rgb(10,10,10)'; c.beginPath(); c.ellipse(-26, -64, 4, 9, 0, 0, 7); c.ellipse(26, -64, 4, 9, 0, 0, 7); c.fill();
      c.beginPath(); c.moveTo(-8, -38); c.lineTo(8, -38); c.lineTo(0, -28); c.closePath(); c.fill();
      c.strokeStyle = 'rgb(40,40,40)'; c.lineWidth = 12; c.beginPath(); c.moveTo(80, 150); c.quadraticCurveTo(170, 140, 140, 40); c.stroke();
    } else {
      c.fillStyle = g(-120, -100, 120, 140, [[0, 230], [0.5, 160], [1, 70]]);
      c.beginPath(); c.ellipse(0, 80, 100, 100, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(0, -55, 75, 0, 7); c.fill();
      c.fillStyle = 'rgb(50,50,50)'; c.beginPath(); c.ellipse(-78, -40, 26, 62, 0.35, 0, 7); c.ellipse(78, -40, 26, 62, -0.35, 0, 7); c.fill();
      c.fillStyle = 'rgb(225,225,225)'; c.beginPath(); c.ellipse(0, -18, 40, 30, 0, 0, 7); c.fill();
      c.fillStyle = 'rgb(10,10,10)'; c.beginPath(); c.arc(-28, -70, 9, 0, 7); c.arc(28, -70, 9, 0, 7); c.fill();
      c.beginPath(); c.ellipse(0, -30, 15, 10, 0, 0, 7); c.fill();
      c.fillStyle = 'rgb(120,40,40)'; c.beginPath(); c.ellipse(0, 4, 12, 16, 0, 0, Math.PI); c.fill();
    }
    c.restore();
  };
  const exPhotos = (W, HH) => EXC.ph || (EXC.ph = {
    robot: PHOTO || (PHOTO = screenPhoto((pc) => drawPhoto(pc, 0), W, HH)),
    cat: screenPhoto(drawAnimal('cat'), 600, 600, 23), dog: screenPhoto(drawAnimal('dog'), 600, 600, 29),
    catS: screenPhoto(drawAnimal('cat'), 600, 600, 23, 11, 0.7), dogS: screenPhoto(drawAnimal('dog'), 600, 600, 29, 11, 0.7),
  });
  // paste a screened photo: cream cut-out rim, faint tone, dots (all multiplied on paper)
  const paste = (ctx, P, x, y, s, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const ro = Math.max(1, 3.2 / Math.max(0.05, s) / 4);
    for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3], [3, -3], [-3, 3]]) ctx.drawImage(P.SIL, dx * ro, dy * ro);
    ctx.drawImage(P.SIL, 0, 0);
    ctx.globalAlpha = 0.18; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(P.PH, 0, 0);
    ctx.globalAlpha = 1; ctx.drawImage(P.HT, 1.5, -1);
    ctx.restore();
  };
  // heavy bar arrow with a wedge head
  const barArrow = (c, x0, y0, x1, y1, p, w, col) => {
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p;
    c.save(); c.translate(x0, y0); c.rotate(a); c.fillStyle = col; c.fillRect(0, -w / 2, Math.max(0, l - w * 2.2), w);
    c.beginPath(); c.moveTo(l, 0); c.lineTo(l - w * 2.6, -w * 1.4); c.lineTo(l - w * 2.6, w * 1.4); c.closePath(); c.fill(); c.restore();
  };
  const slab = (c, txt, x, y, ang, font, fg, bg, padX = 14, padY = 10, p = 1) => { // slanted bar with lettering
    if (p <= 0) return; c.save(); c.translate(x, y); c.rotate(ang); c.font = font; c.letterSpacing = '3px';
    const m = c.measureText(txt), w = m.width + padX * 2, h = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + padY * 2;
    if (bg) { c.fillStyle = bg; c.fillRect(-padX, -m.actualBoundingBoxAscent - padY, w * p, h); }
    if (p >= 1) { c.fillStyle = fg; c.fillText(txt, 0, 0); }
    c.restore(); c.letterSpacing = '0px';
  };
  const cog = (c, x, y, r, teeth, a) => {
    c.save(); c.translate(x, y); c.rotate(a); c.beginPath();
    for (let i = 0; i < teeth * 2; i++) { const rr = i % 2 ? r : r * 1.22, a0 = (i / (teeth * 2)) * Math.PI * 2; c.lineTo(Math.cos(a0 - 0.12) * rr, Math.sin(a0 - 0.12) * rr); c.lineTo(Math.cos(a0 + 0.12) * rr, Math.sin(a0 + 0.12) * rr); }
    c.closePath(); c.arc(0, 0, r * 0.38, 0, 7, true); c.fill(); c.restore();
  };

  // worn-print finish: fine cream scratches through the ink (same seed in the still and the explainer)
  const scratches = (ctx, W, HH) => {
    const rs = H.rng(88);
    ctx.save(); ctx.strokeStyle = 'rgba(250,244,228,0.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = rs.range(0, W), y = rs.range(0, HH), l = rs.range(4, 30), a2 = rs.range(0, 3); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a2) * l, y + Math.sin(a2) * l); ctx.stroke(); }
    ctx.restore();
  };

  const explainConstructivist = (ctx, W, HH, t) => {
    const E = H.ease, cl = H.clamp, S = (a, b) => cl((t - a) / (b - a), 0, 1);
    const tq = Math.floor(t * 15) / 15; // agitprop staccato: punches land on twos
    const Sq = (a, b) => cl((tq - a) / (b - a), 0, 1);
    const WEDGES = [5.6, 10.0, 12.55], swapAt = (w) => w + 0.5;
    const scene = t < swapAt(WEDGES[0]) ? 1 : t < swapAt(WEDGES[1]) ? 2 : t < swapAt(WEDGES[2]) ? 3 : 4;
    const PH = exPhotos(W, HH);
    ctx.drawImage(exPaperC(W, HH), 0, 0);
    const L = H.layer(W, HH), c = L.getContext('2d'); c.textBaseline = 'alphabetic';
    const pastes = []; // photos to paste after the flat plates
    const R0 = { x: 14, y: 66, s: 0.85 }, bell = [14 + 690 * 0.85, 66 + 228 * 0.85];

    // ---------- hook (scene 1 opening) ----------
    const hp = E.inOut(S(1.6, 2.3));
    if (hp < 1) {
      c.save(); c.globalAlpha = 1;
      const disc = E.out(Sq(0, 0.4)); c.fillStyle = RED; c.beginPath(); c.arc(980 - (1 - disc) * 600, 300, 230, 0, 7); c.fill();
      const beams = [[-2.6, 0.06], [-2.3, 0.1], [-1.95, 0.04], [-1.7, 0.12]];
      beams.forEach(([a, w], i) => { const p = Sq(0.2 + i * 0.08, 0.3 + i * 0.08); if (p <= 0) return; c.fillStyle = i % 2 ? RED : BLACK; c.beginPath(); c.moveTo(980, 300); c.lineTo(980 + Math.cos(a - w) * 1400 * p, 300 + Math.sin(a - w) * 1400 * p); c.lineTo(980 + Math.cos(a + w) * 1400 * p, 300 + Math.sin(a + w) * 1400 * p); c.closePath(); c.fill(); });
      c.restore();
    }
    // the slogan collapses into a slanted corner banner
    {
      const x = H.lerp(110, 30, hp), y = H.lerp(430, 52, hp), s = H.lerp(1, 0.3, hp), ang = H.lerp(-0.2, -0.06, hp);
      c.save(); c.translate(x, y); c.scale(s, s);
      slab(c, 'HOW DOES', 0, 0, ang, `400 ${H.lerp(64, 96, hp).toFixed(2)}px "Russo One"`, CREAM, BLACK, 20, 16, Sq(0.35, 0.5));
      if (tq >= 0.6) { c.save(); c.rotate(ang); const k = cl((tq - 0.6) / 0.2, 0, 1), sc = 1 + 0.6 * (1 - k); c.translate(0, 150); c.scale(sc, sc); c.fillStyle = RED; c.font = '400 170px "Anton"'; c.letterSpacing = '2px'; c.fillText('AI LEARN?', 0, 0); c.letterSpacing = '0px'; c.restore(); }
      c.restore();
    }

    // ---------- scene 1: data poured into the megaphone ----------
    if (scene === 1 && t > 2.0) {
      const k = E.out(S(2.0, 2.6));
      pastes.push(['robot', R0.x - (1 - k) * 500, R0.y + (1 - k) * 200, R0.s]);
      // conveyor: heavy diagonal bar from upper right down to the bell
      const cx0 = 1300, cy0 = 40, cx1 = bell[0] + 60, cy1 = bell[1] - 20;
      c.save(); c.fillStyle = BLACK; c.translate(cx1, cy1); c.rotate(Math.atan2(cy0 - cy1, cx0 - cx1)); c.fillRect(0, 70, Math.hypot(cx0 - cx1, cy0 - cy1) * E.out(S(2.4, 2.8)), 26); c.restore();
      // examples ride the bar into the bell (photos)
      for (let i = 0; i < 9; i++) {
        const u = (t - 2.7 - i * 0.42) * 0.55; if (u < 0 || u > 1) continue;
        const kind = H.rng(i * 11 + 3)() < 0.5 ? 'cat' : 'dog', sh = 1 - E.in(cl((u - 0.75) / 0.25, 0, 1));
        const x = H.lerp(cx0 - 60, cx1, u), y = H.lerp(cy0 + 40, cy1 + 20, u) - 80, s = 0.33 * sh;
        pastes.push([kind + 'S', x - 300 * s, y - 300 * s, s, -0.25]);
        if (sh > 0.6) slab(c, kind.toUpperCase(), x - 44, y + 72 * sh, -0.25, '700 28px "Oswald"', CREAM, RED, 8, 5); // label stamped on the card
      }
      // red arrow into the bell + label
      barArrow(c, 1000, 420, bell[0] + 30, bell[1] + 40, E.out(Sq(3.0, 3.3)), 22, RED);
      slab(c, 'TRAINING DATA', 840, 505, -0.24, '700 30px "Oswald"', CREAM, BLACK, 10, 6, Sq(3.2, 3.35));
      // counter: stencil numerals in a slanted black box
      const cp = S(3.0, 5.4), n = cp < 1 ? Math.pow(cp, 3) * 1e6 : 1e6;
      c.save(); c.translate(640, 640); c.rotate(-0.12);
      c.fillStyle = BLACK; c.fillRect(-20, -100, 600 * E.out(Sq(2.8, 3.0)), 118);
      if (tq >= 3.0) { c.fillStyle = CREAM; c.font = '400 100px "Anton"'; c.letterSpacing = '4px'; c.fillText(Math.round(n).toLocaleString('en-US'), 0, 0); c.letterSpacing = '0px'; c.fillStyle = RED; c.font = '400 30px "Russo One"'; c.fillText('EXAMPLES', 440, 40); }
      c.restore();
    }

    // ---------- scene 2: guess -> check -> adjust ----------
    if (scene === 2) {
      const t0 = swapAt(WEDGES[0]);
      pastes.push(['robot', R0.x, R0.y, R0.s]);
      // new picture pinned top right
      pastes.push(['catS', 760 - 300 * 0.28, 105 - 300 * 0.28 - (1 - E.out(Sq(t0, t0 + 0.3))) * 300, 0.28, 0.08]);
      slab(c, 'NEW PICTURE', 470, 74, 0.08, '700 28px "Oswald"', CREAM, BLACK, 8, 5, Sq(t0 + 0.3, t0 + 0.45));
      // the guess is shouted through the megaphone
      const shout = (txt, ts, col) => {
        const beams = [[-0.3, 0.1], [-0.08, 0.08], [0.16, 0.06]];
        beams.forEach(([a, w], i) => { const p = cl(Math.floor((t - ts - i * 0.07) * 15) / 2, 0, 1); if (p <= 0) return; c.fillStyle = i % 2 ? BLACK : RED; c.beginPath(); c.moveTo(bell[0] + 20, bell[1]); c.lineTo(bell[0] + Math.cos(a - w) * 700 * p, bell[1] + Math.sin(a - w) * 700 * p); c.lineTo(bell[0] + Math.cos(a + w) * 700 * p, bell[1] + Math.sin(a + w) * 700 * p); c.closePath(); c.fill(); });
        if (t > ts + 0.25) { c.save(); c.translate(720, 300); c.rotate(-0.2); const k = cl(Math.floor((t - ts - 0.25) * 15) / 3, 0, 1), sc = 1 + 0.5 * (1 - k); c.scale(sc, sc); c.font = '400 120px "Anton"'; c.fillStyle = BLACK; c.fillText(txt, 4, 4); c.fillStyle = col; c.fillText(txt, 0, 0); c.restore(); }
      };
      if (t < 9.3) {
        shout('DOG?', 6.75, CREAM);
        const xp = Sq(7.45, 7.6); // CHECK: a red cross is stamped over it
        if (xp > 0) { c.save(); c.translate(1040, 220); c.fillStyle = RED; c.rotate(0.785); c.fillRect(-70 * xp, -14, 140 * xp, 28); c.fillRect(-14, -70 * xp, 28, 140 * xp); c.restore(); }
        const rp = S(7.55, 7.85); if (rp > 0) { c.strokeStyle = BLACK; c.lineWidth = 12; c.beginPath(); c.ellipse(900, 250, 240, 120, -0.2, -2, -2 + Math.PI * 2 * rp); c.stroke(); }
        if (tq > 7.7) slab(c, 'WRONG! IT IS A CAT', 700, 440, -0.2, '400 28px "Russo One"', CREAM, RED, 12, 8);
      } else {
        shout('CAT!', 9.35, RED);
        const cp = Sq(9.7, 9.85); if (cp > 0) { c.save(); c.translate(1010, 210); c.rotate(-0.2); c.fillStyle = BLACK; c.fillRect(-16, -16, 30, 70 * cp); c.fillRect(-16, 38, 110 * cp, 30); c.restore(); }
      }
      // ADJUST: error bar flies back to the robot's gears; the cogs turn
      barArrow(c, 760, 470, 390, 560, E.inOut(S(7.9, 8.35)), 20, RED);
      if (t > 8.35 && t < 9.3) slab(c, 'ERROR', 545, 470, -0.24, '700 30px "Oswald"', CREAM, RED, 8, 5);
      const turn = E.inOut(S(8.35, 9.2)) * 2.4 + (t > 9.3 ? (t - 9.3) * 0.8 : 0);
      c.fillStyle = BLACK; cog(c, 300, 560, 40 * E.back(Sq(t0 + 0.2, t0 + 0.4)), 10, turn); cog(c, 368, 512, 26 * E.back(Sq(t0 + 0.3, t0 + 0.5)), 8, -turn * 1.5);
      c.fillStyle = RED; cog(c, 248, 500, 20 * E.back(Sq(t0 + 0.35, t0 + 0.55)), 7, -turn * 2);
      // the loop: three slanted bars wired into a circuit
      const steps = [['GUESS', 760, 610], ['CHECK', 960, 560], ['ADJUST', 1110, 660]], act = t < 7.45 ? 0 : t < 8.3 ? 1 : t < 9.3 ? 2 : Math.floor((t - 9.3) * 3) % 3;
      steps.forEach(([s, x, y], i) => slab(c, s, x, y, -0.2, '400 30px "Russo One"', CREAM, i === act && t > 6.7 ? RED : BLACK, 12, 8, Sq(t0 + 0.2 + i * 0.12, t0 + 0.32 + i * 0.12)));
      barArrow(c, 890, 590, 950, 575, Sq(t0 + 0.6, t0 + 0.7), 10, BLACK);
      barArrow(c, 1100, 575, 1150, 625, Sq(t0 + 0.7, t0 + 0.8), 10, BLACK);
      barArrow(c, 1090, 680, 900, 640, Sq(t0 + 0.8, t0 + 0.9), 10, BLACK);
    }

    // ---------- scene 3: progress ----------
    if (scene === 3) {
      const t0 = swapAt(WEDGES[1]), prog = E.inOut(S(t0 + 0.2, 12.0));
      // emphasis: beams burst behind the final number
      const burst = Sq(12.05, 12.25);
      if (burst > 0) { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.1; c.fillStyle = i % 2 ? RED : BLACK; c.beginPath(); c.moveTo(1010, 300); c.lineTo(1010 + Math.cos(a - 0.08) * 460 * burst, 300 + Math.sin(a - 0.08) * 460 * burst); c.lineTo(1010 + Math.cos(a + 0.08) * 460 * burst, 300 + Math.sin(a + 0.08) * 460 * burst); c.closePath(); c.fill(); } }
      c.save(); c.translate(90, 640); c.rotate(-0.12);
      c.fillStyle = BLACK; c.fillRect(0, 0, 700 * E.out(Sq(t0, t0 + 0.2)), 14);
      for (let i = 0; i < 9; i++) { const acc = 61 + 36 * (1 - Math.pow(1 - i / 8, 2)), bp = E.out(cl(prog * 9 - i, 0, 1)), h = (acc - 45) * 7.5 * bp; c.fillStyle = i === 8 ? RED : i % 2 ? BLACK : RED; c.fillRect(20 + i * 76, -h, 56, h); }
      slab(c, 'TRAINING ROUNDS →', 330, 62, 0, '700 30px "Oswald"', CREAM, BLACK, 8, 5, Sq(t0 + 0.2, t0 + 0.35));
      c.restore();
      c.save(); c.translate(820, 380); c.rotate(-0.12);
      c.fillStyle = BLACK; c.fillRect(-20, -200, 420, 240);
      c.fillStyle = burst > 0 ? RED : CREAM; c.font = '400 210px "Anton"'; c.fillText(Math.round(H.lerp(61, 97, prog)) + '%', 0, 0);
      c.restore();
      slab(c, 'ACCURACY', 820, 140, -0.12, '400 40px "Russo One"', CREAM, RED, 12, 8, Sq(t0 + 0.1, t0 + 0.25));
      slab(c, '61% → 97%', 860, 505, -0.12, '700 36px "Oswald"', CREAM, RED, 12, 8, Sq(t0 + 0.4, t0 + 0.5));
    }

    // ---------- scene 4: takeaway slogan ----------
    if (scene === 4) {
      const t0 = swapAt(WEDGES[2]);
      c.fillStyle = RED; c.beginPath(); c.arc(1080, 560, 260, 0, 7); c.fill();
      slab(c, 'MORE EXAMPLES', 90, 260, -0.15, '400 76px "Russo One"', CREAM, BLACK, 22, 16, Sq(t0, t0 + 0.15));
      barArrow(c, 200, 320, 300, 455, E.out(Sq(t0 + 0.2, t0 + 0.4)), 28, RED);
      if (tq >= t0 + 0.35) { c.save(); c.translate(320, 610); c.rotate(-0.15); const k = cl((tq - t0 - 0.35) / 0.2, 0, 1), sc = 1 + 0.5 * (1 - k); c.scale(sc, sc); c.font = '400 132px "Anton"'; c.fillStyle = RED; c.fillText('BETTER GUESSES', 7, 7); c.fillStyle = BLACK; c.fillText('BETTER GUESSES', 0, 0); c.restore(); }
    }

    // ---------- Lissitzky's red wedge drives across between scenes ----------
    const WL = H.layer(W, HH), wc = WL.getContext('2d'); let wedgeOn = false;
    for (const w of WEDGES) {
      const u = S(w, w + 0.95); if (u <= 0 || u >= 1) continue; wedgeOn = true; const c = wc;
      const tx = H.lerp(-100, 3900, E.inOut(u));
      c.fillStyle = RED; c.beginPath(); c.moveTo(tx, HH / 2); c.lineTo(tx - 2400, -1400); c.lineTo(tx - 2400, HH + 1400); c.closePath(); c.fill();
      c.fillStyle = BLACK; c.beginPath(); c.moveTo(tx + 60, HH / 2 + 30); c.lineTo(tx - 2400, -1360); c.lineTo(tx - 2400, -1330); c.closePath(); c.fill();
    }

    // ---------- print: plates multiply, then pasted photos, then grain ----------
    exInk(L, 7, 0.26, 0.006);
    const pasteAll = () => pastes.forEach(([k, x, y, s, rot]) => paste(ctx, PH[k], x, y, s, rot || 0));
    // photos sit under the slogans/wedge: paste first, then plates on top (multiply keeps dots visible under ink)
    pasteAll();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
    if (wedgeOn) { exInk(WL, 7, 0.12, 0.004); ctx.drawImage(WL, 0, 0); }
    scratches(ctx, W, HH);
    H.grain(ctx, W, HH, 0.08, 4 + Math.floor(t * 12), true);
    H.vignette(ctx, W, HH, 0.25, '50,30,10');
  };

  registerStyle({
    id: 'constructivist',
    name: 'Constructivist Propaganda',
    category: 'Art & Design Movements',
    description: 'A 1920s Rodchenko / El Lissitzky agitprop poster: red, black and cream only, a halftone photomontage robot bellowing through a megaphone, beams radiating from its voice, a red disc and hard diagonal bars, and heavy condensed lettering set on the slant — litho ink mottle on cheap paper.',
    motion: 'Agitprop staccato: the red disc rolls in, the halftone robot slides up the diagonal, beams punch out of the megaphone two frames at a time, the slogan bars shoot across and the words slam down on the beat; in the hold the beam fan pulses with each shout.',
    fonts: ['400 150px "Anton"', '400 40px "Russo One"', '700 18px "Oswald"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: true,
    explainerDuration: 14.5,
    explainerNote: "Agitprop sequence: Lissitzky's red wedge drives across the sheet between scenes, slogans and labels slam onto slanted bars on twos, arrows are heavy bars with wedge heads, the counter is stencil-tall Anton, and the key moments get a stamped red cross or a burst of beams.",
    explainer(ctx, W, HH, t) { explainConstructivist(ctx, W, HH, t); },
    // Sound: a print works on agitprop duty. Slogans and slabs slam down like a press, the red wedge is a heavy iron
    // ram driving through with a low roar, the megaphone shouts are short brass blasts through a horn, beams crack out,
    // the counter is stencil-stamped and the cogs ratchet. Times copied from explainConstructivist(); its slabs land
    // "on twos" (t quantised to 1/15 s), so q(b) gives the first frame a slab or slogan is actually complete.
    explainerSound(k) {
      const D = 14.5, E = H.ease, cl = H.clamp;
      const S = (t, a, b) => cl((t - a) / (b - a), 0, 1);
      const q = (b) => Math.ceil(b * 15 - 1e-6) / 15;
      const pan = (px) => cl((px / 1280) * 2 - 1, -1, 1) * 0.7;
      const when = (a, b, ease, u) => { for (let i = 0; i <= 400; i++) if (ease(i / 400) >= u - 1e-6) return a + ((b - a) * i) / 400; return b; };
      const WEDGES = [5.6, 10.0, 12.55], swapAt = (w) => w + 0.5;
      // a slab or slogan slammed down: paper slap with a press thump (big = louder, heavier)
      const slam = (t, g, p, minor) => { k.play('slap', t, { gain: 0.55 * g, pan: p, minor }); k.play('thud', t, { f: 110, gain: 0.5 * g, pan: p, minor }); };
      // megaphone shout: detuned saws honking through a horn-shaped band
      const horn = (t, notes, dur, g, p, minor) => notes.forEach((n, i) => { for (const det of [-9, 9])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur, gain: 0.035 * g, a: 0.02, hold: dur * 0.6, filter: 'bandpass', f2: [[0, 700], [0.05, 1500], [dur, 1000]], q: 0.9, pan: p + (i - (notes.length - 1) / 2) * 0.15, verb: 0.2, minor }); });
      // a beam cracking out: short punchy noise burst
      const beam = (t, g, p) => k.noise(t, { dur: 0.09, filter: 'bandpass', f: [[0, 600], [0.09, 1800]], q: 0.8, gain: 0.22 * g, a: 0.004, pan: p, minor: true });
      // stencil-stamped counter digit
      const numb = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1500, q: 1.2, gain: 0.32 * g, a: 0.001, pan: p }); k.tone(t, { f: 130, dur: 0.05, gain: 0.12 * g, pan: p }); });
      // the red wedge: an iron ram driving left to right (inOut over 0.95 s, fastest at the middle)
      const ram = (w) => {
        k.noise(w, { dur: 0.95, color: 'brown', filter: 'lowpass', f: [[0, 150], [0.47, 900], [0.95, 200]], gain: 0.45, a: 0.4, pan: -0.3 });
        k.noise(w + 0.2, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.27, 1300], [0.75, 400]], q: 0.8, gain: 0.16, a: 0.25, pan: 0.3 });
        k.tone(w, { f: [[0, 45], [0.47, 72], [0.95, 40]], type: 'sawtooth', dur: 0.95, gain: 0.1, a: 0.4, filter: 'lowpass', f2: 300 });
      };

      k.bed('hum', 0, D, { gain: 0.35 });  // the print works
      k.bed('room', 0, D, { gain: 0.4 });

      // ---- hook: disc drives in (0-0.4), four beams crack out, HOW DOES slab, AI LEARN? slams (0.6 -> 0.8)
      k.noise(0.0, { dur: 0.4, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.4, 700]], gain: 0.3, a: 0.3, pan: 0.2 });
      k.play('thud', q(0.4), { f: 90, gain: 0.6, pan: pan(980) });
      [0, 1, 2, 3].forEach((i) => beam(q(0.2 + i * 0.08) + 1 / 15, 1, pan(700 - i * 100)));
      slam(q(0.5), 0.8, -0.4, true);
      k.play('stamp', 0.8, { gain: 0.65, pan: -0.2 }); k.play('impact', 0.8, { gain: 0.3, pan: -0.2 });
      // slogan collapses into the corner banner (1.6-2.3): a soft sheet slide
      k.noise(1.6, { dur: 0.7, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.7, 900]], q: 0.7, gain: 0.08, a: 0.3, pan: -0.5, minor: true });

      // ---- scene 1: DATA poured into the megaphone
      k.noise(2.0, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.5, 600]], gain: 0.25, a: 0.15, pan: -0.5, minor: true }); // robot photo slides in
      k.play('thud', when(2.0, 2.6, E.out, 0.95), { f: 100, gain: 0.4, pan: -0.5, minor: true });
      k.noise(2.4, { dur: 0.4, color: 'brown', filter: 'bandpass', f: 350, q: 1.2, gain: 0.2, a: 0.05, pan: 0.4, minor: true }); // conveyor bar runs out
      slam(3.0, 0.6, pan(900), true); // counter box set
      const cards = []; for (let i = 0; 2.7 + i * 0.42 < swapAt(WEDGES[0]) - 0.1; i++) cards.push(2.7 + i * 0.42);
      cards.forEach((tc) => k.play('stamp', tc, { gain: 0.3, pan: pan(1200), minor: true })); // each card arrives with its label stamped on
      slam(q(3.3), 0.7, pan(820), true);      // red arrow into the bell; TRAINING DATA lands one frame later on the same slam
      // counter n = S(3.0,5.4)^3 * 1e6, stencil-stamped, speeding up, off the card stamps
      for (let t = 3.12; t < 5.32; ) { const s = S(t, 3.0, 5.4); if (!cards.some((c) => t > c - 0.06 && t < c + 0.08)) numb(t, 0.7 + 0.4 * s, pan(900)); t += 0.16 - 0.075 * s; }
      k.play('stamp', 5.4, { gain: 0.6, pan: pan(900) }); k.play('thud', 5.4, { f: 90, gain: 0.4, pan: pan(900) }); // 1,000,000

      // ---- the red wedge drives across: 5.6, 10.0, 12.55
      WEDGES.forEach(ram);

      // ---- scene 2: GUESS / CHECK / ADJUST (t0 = 6.1)
      const t0 = swapAt(WEDGES[0]);
      slam(q(t0 + 0.3), 0.7, pan(680), true);         // cat picture drops in
      k.play('tock', q(t0 + 0.4), { f: 300, gain: 0.4, pan: pan(300), minor: true }); // cogs bolt on
      slam(q(t0 + 0.45), 0.55, pan(800), true);       // NEW PICTURE + CHECK slabs land on the same frame (GUESS/ADJUST ride along)
      // the guess is shouted through the megaphone (beams 6.82+, DOG? slams at 7.2)
      horn(6.82, ['D3', 'Ab3'], 0.38, 1, pan(800));
      [0, 1, 2].forEach((i) => beam(6.75 + i * 0.07 + 1 / 15, 0.8, pan(800)));
      slam(7.2, 0.9, pan(800), false);
      // CHECK: red cross stamped on (7.47 -> 7.6), black ring brushed round it, WRONG slab
      k.play('stamp', 7.6, { gain: 1.0, pan: pan(1040) });
      horn(7.62, ['C3', 'Db3'], 0.45, 1.1, pan(1040));
      k.play('stroke', 7.58, { material: 'brush', dur: 0.3, gain: 0.8, pan: pan(900), minor: true });
      slam(q(7.71), 0.55, pan(800), true);
      // ADJUST: the error bar drives back to the cogs (inOut 7.9-8.35), cogs ratchet round (inOut 8.35-9.2)
      k.noise(7.9, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.25, 800], [0.45, 250]], gain: 0.3, a: 0.2, pan: -0.2 });
      k.play('thud', 8.35, { f: 120, gain: 0.5, pan: pan(390) });
      for (let i = 1, lt = 8.35; i <= 9; i++) { const t = when(8.35, 9.2, E.inOut, i / 9); if (t - lt < 0.09) continue; lt = t; k.play('tock', t, { f: 360 + (i % 2) * 70, gain: 0.45, pan: pan(300), minor: true }); k.play('click', t + 0.006, { f: 900, gain: 0.5, pan: pan(300), minor: true }); }
      // the correction: CAT! shouted (9.35) on a bright major blast, slams at 9.8, check mark at 9.87
      horn(9.42, ['C4', 'E4', 'G4'], 0.5, 1.1, pan(800));
      [0, 1, 2].forEach((i) => beam(9.35 + i * 0.07 + 1 / 15, 0.8, pan(800)));
      slam(9.8, 0.9, pan(800), false);
      k.play('stamp', q(9.85), { gain: 0.5, pan: pan(1010) }); // check mark stamped

      // ---- scene 3: PROGRESS (t0 = 10.5)
      const t3 = swapAt(WEDGES[1]);
      slam(q(t3 + 0.2), 0.5, -0.3, true);   // base bar
      slam(q(t3 + 0.25), 0.5, pan(820), true); // ACCURACY
      // bars rise as prog = inOut(S(10.7,12.0)) passes i/9: a heavy chunk each (at least 100 ms apart), rising a little
      const bars = []; for (let i = 1, lt = 0; i < 9; i++) { const t = when(t3 + 0.2, 12.0, E.inOut, i / 9); if (t - lt < 0.1) continue; lt = t; bars.push(t); k.play('thud', t, { f: 80 + i * 12, gain: 0.3, pan: pan(110 + i * 76), minor: true }); }
      for (let t = t3 + 0.25, last = 61, lt = -1; t < 11.97; t += 1 / 120) {
        const v = Math.round(H.lerp(61, 97, E.inOut(S(t, t3 + 0.2, 12.0))));
        if (v !== last && t - lt >= 1 / 11 && !bars.some((b) => Math.abs(t - b) < 0.05)) { numb(t, 0.9, pan(1000)); last = v; lt = t; }
      }
      // 97%: beams burst behind the number (from 12.067), the biggest hit
      const bt = q(12.05 + 1e-3);
      k.play('impact', bt, { gain: 1.7, pan: pan(1010) }); k.play('thud', bt, { f: 70, gain: 0.9 });
      k.play('stamp', bt, { gain: 0.9, pan: pan(1010) });
      horn(bt + 0.01, ['C3', 'G3', 'C4', 'E4'], 0.7, 1.2, pan(1010));

      // ---- scene 4: TAKEAWAY (t0 = 13.05): MORE EXAMPLES slab, arrow, BETTER GUESSES slams (13.4 -> 13.6)
      const t4 = swapAt(WEDGES[2]);
      slam(q(t4 + 0.15), 0.8, -0.4, false);
      k.noise(t4 + 0.2, { dur: 0.25, color: 'brown', filter: 'lowpass', f: [[0, 250], [0.2, 700]], gain: 0.2, a: 0.1, pan: -0.3, minor: true });
      k.play('stamp', 13.6, { gain: 0.6, pan: -0.1 }); k.play('thud', 13.6, { f: 80, gain: 0.35 });
      horn(13.62, ['F3', 'A3', 'C4'], 0.25, 0.8, 0, true);
      horn(13.9, ['C3', 'G3', 'C4', 'E4'], 0.55, 0.9, 0); // the resolve
    },
    draw(ctx, W, HH, t) {
      const P = (d, dur = 0.5) => H.ease.out(H.clamp((t - d) / dur, 0, 1));

      // ---------- paper ----------
      ctx.drawImage(exPaperC(W, HH), 0, 0); // same paper maths as before, built once and cached

      // ---------- flat ink plates ----------
      const L = H.layer(W, HH), c = L.getContext('2d');
      // megaphone geometry (needed for beams)
      const mx1 = 690, my1 = 228;
      // red disc behind the head
      // disc rolls in from the left edge and lands
      { const p = H.ease.out(H.clamp(t / 0.7, 0, 1)); c.fillStyle = RED; c.beginPath(); c.arc(360 - (1 - p) * 640, 300, 235, 0, 7); c.fill(); }
      // radiating beams from the bell
      const beams = [[-0.62, 0.05, BLACK], [-0.5, 0.16, RED], [-0.28, 0.035, BLACK], [-0.19, 0.12, RED], [-0.02, 0.03, BLACK], [0.06, 0.07, RED], [0.18, 0.02, BLACK]];
      beams.forEach(([ang, wid, col], i) => {
        wid = wid;
        // staccato: each beam punches out in two frames, then the whole fan "shouts" on a beat
        const p = H.clamp(Math.floor((t - (1.0 + i * 0.1)) * 15) / 2, 0, 1), len = 1500 * p;
        if (p <= 0) return;
        const beat = t > 2.8 ? Math.exp(-((t - 2.8) % 0.5) * 9) : 0;
        wid *= 1 + 0.22 * beat;
        c.fillStyle = col; c.beginPath(); c.moveTo(mx1 + 20, my1);
        c.lineTo(mx1 + Math.cos(ang - wid / 2) * len, my1 + Math.sin(ang - wid / 2) * len);
        c.lineTo(mx1 + Math.cos(ang + wid / 2) * len, my1 + Math.sin(ang + wid / 2) * len); c.closePath(); c.fill();
      });
      // heavy diagonal bars
      const ang = -0.24;
      c.save(); c.translate(650, 580); c.rotate(ang);
      c.fillStyle = BLACK; c.fillRect(-60, -54, 820 * P(1.55, 0.3), 92);
      c.fillStyle = RED; c.fillRect(-700, 62, 1500 * P(1.45, 0.35), 22);
      // lettering on the slant
      c.fillStyle = CREAM; c.font = '400 38px "Russo One"'; c.letterSpacing = '5px';
      if (t >= 1.95) c.fillText(t >= 2.1 ? 'BUILD THE' : 'BUILD', 6, 8);   // words punched in on the beat
      if (t >= 2.25) { // FUTURE slams down from oversize, stepped on twos
        const k = H.clamp(Math.floor((t - 2.25) * 15) / 3, 0, 1), sc = 1 + 0.6 * (1 - k);
        c.save(); c.translate(262 + 200, -10); c.scale(sc, sc); c.translate(-(262 + 200), 10);
        c.fillStyle = RED; c.font = '400 132px "Anton"'; c.letterSpacing = '2px';
        c.fillText('FUTURE', 262, 30); c.restore();
      }
      { const txt = 'ALL POWER TO THE MACHINES · 2026', n = H.clamp(Math.floor((t - 2.55) * 40), 0, txt.length); // typed like a ticker
        c.fillStyle = BLACK; c.font = '700 18px "Oswald"'; c.letterSpacing = '5px';
        if (n > 0) c.fillText(txt.slice(0, n), 4, 118); }
      c.restore();
      // small black square + circle (Lissitzky accent)
      c.letterSpacing = '0px';
      exInk(L, 7, 0.26, 0.006);

      // ---------- halftone photomontage ----------
      // the photograph is a fixed object (cut out once, screened once) that then slides in as a whole
      if (!PHOTO) PHOTO = screenPhoto((pc) => drawPhoto(pc, t), W, HH);
      const { PH, HT, SIL } = PHOTO;
      const slide = (1 - H.ease.out(H.clamp((t - 0.25) / 0.75, 0, 1))) * -420, ox = slide, oy = -slide * 0.4;
      // composite: rim (paper-coloured under-layer, covering beams), then ink plates multiply, then halftone multiply
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
      ctx.save();
      for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3], [3, -3], [-3, 3]]) ctx.drawImage(SIL, dx + ox, dy + oy);
      ctx.drawImage(SIL, ox, oy);
      ctx.restore();
      // light tonal wash under the dots so the photo reads as a print on toned paper
      ctx.save(); ctx.globalAlpha = 0.18; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(PH, ox, oy); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(HT, 1.5 + ox, -1 + oy); ctx.restore();

      // ---------- finish ----------
      scratches(ctx, W, HH);
      H.grain(ctx, W, HH, 0.08, 4 + Math.floor(t * 12), true);
      H.vignette(ctx, W, HH, 0.25, '50,30,10');
    },
  });
}
```
