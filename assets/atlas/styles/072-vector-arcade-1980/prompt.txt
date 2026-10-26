I want an animated explainer made in the "Vector Arcade 1980" visual style (Retro Digital). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
Name: Vector Arcade 1980
Family: Retro Digital
Look: An XY vector monitor cabinet game: hair-thin phosphor beams on pure black, additive bloom, brighter dwell dots where the beam pauses at vertices, dimmer long strokes, wireframe 3D in perspective and a hand-built stroke font.
Motion: Attract-mode build: the beam traces the horizon and mountains, wireframes draw on edge by edge, the AI core flies in from the distance spinning, the saucer slides in with phosphor trails, then the radar, score and title are stroked in letter by letter while everything flickers with beam load.
How it explains: Told as a vector-cabinet HUD: the question shrinks into a red corner readout, labelled wireframe cards stream into a spinning icosahedron core, a hyperspace-style zoom carries us into a lock-on loop (GUESS > CHECK > ADJUST with brackets, red error beam, turning weight dials), and the stroked accuracy graph climbs to a flashing 97%.

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

REFERENCE STYLE SOURCE (styles/vector-arcade.js; W/H_ are always 1280x720)
```js
{
  // ---------- 1980 XY vector monitor: thin beams on black, additive bloom, vertex dwell dots, stroke font ----------
  const GLYPH = {
    A: [[[0, 6], [0, 2], [2, 0], [4, 2], [4, 6]], [[0, 4], [4, 4]]],
    B: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
    C: [[[4, 0], [0, 0], [0, 6], [4, 6]]],
    D: [[[0, 0], [2, 0], [4, 2], [4, 4], [2, 6], [0, 6], [0, 0]]],
    E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
    F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
    G: [[[4, 1], [4, 0], [0, 0], [0, 6], [4, 6], [4, 3], [2, 3]]],
    H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
    I: [[[0, 0], [4, 0]], [[2, 0], [2, 6]], [[0, 6], [4, 6]]],
    J: [[[4, 0], [4, 6], [2, 6], [0, 4]]],
    K: [[[0, 0], [0, 6]], [[4, 0], [0, 3], [4, 6]]],
    L: [[[0, 0], [0, 6], [4, 6]]],
    M: [[[0, 6], [0, 0], [2, 2], [4, 0], [4, 6]]],
    N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
    O: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]]],
    P: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3]]],
    Q: [[[0, 0], [4, 0], [4, 4], [2, 6], [0, 6], [0, 0]], [[2, 4], [4, 6]]],
    R: [[[0, 6], [0, 0], [4, 0], [4, 3], [0, 3], [4, 6]]],
    S: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6]]],
    T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
    U: [[[0, 0], [0, 6], [4, 6], [4, 0]]],
    V: [[[0, 0], [2, 6], [4, 0]]],
    W: [[[0, 0], [0, 6], [2, 4], [4, 6], [4, 0]]],
    X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
    Y: [[[0, 0], [2, 2], [4, 0]], [[2, 2], [2, 6]]],
    Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
    0: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]]],
    1: [[[2, 0], [2, 6]]],
    2: [[[0, 0], [4, 0], [4, 3], [0, 3], [0, 6], [4, 6]]],
    3: [[[0, 0], [4, 0], [4, 6], [0, 6]], [[0, 3], [4, 3]]],
    4: [[[0, 0], [0, 3], [4, 3]], [[4, 0], [4, 6]]],
    5: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6]]],
    6: [[[0, 0], [0, 6], [4, 6], [4, 3], [0, 3]]],
    7: [[[0, 0], [4, 0], [4, 6]]],
    8: [[[0, 0], [4, 0], [4, 6], [0, 6], [0, 0]], [[0, 3], [4, 3]]],
    9: [[[4, 3], [0, 3], [0, 0], [4, 0], [4, 6]]],
    '-': [[[1, 3], [3, 3]]],
  };

  // ================= EXPLAINER: "How does AI learn?" as a vector-HUD sequence =================
  const EXG = Object.assign({}, GLYPH, {
    '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.5], [2, 4.6]], [[2, 5.7], [2, 6]]],
    '%': [[[0, 6], [4, 0]], [[0, 0], [1.2, 0], [1.2, 1.2], [0, 1.2], [0, 0]], [[2.8, 4.8], [4, 4.8], [4, 6], [2.8, 6], [2.8, 4.8]]],
    ',': [[[2, 5.2], [1.4, 7]]],
    '.': [[[2, 5.7], [2, 6]]],
    ':': [[[2, 1.5], [2, 2]], [[2, 4.5], [2, 5]]],
    '>': [[[0, 0], [4, 3], [0, 6]]],
    '~': [[[0, 3], [4, 3]], [[2.5, 1.4], [4, 3], [2.5, 4.6]]], // used as a right arrow glyph
  });
  // ---------- shared beam renderer (hero + explainer use the same passes) ----------
  // Beam core layer (1.7px + dwell dots), fat halo layer (5px). Wide halos are blurred at half resolution (cheaper,
  // identical look), then the tube glass is laid over: faint P31 face glow, a soft diagonal reflection of the cabinet,
  // rounded-tube corner falloff and the vignette.
  const glassCache = {};
  function glassLayer(W, H_) {
    const key = W + 'x' + H_;
    if (glassCache[key]) return glassCache[key];
    const G = H.layer(W, H_), g = G.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H_); // opaque, drawn in 'screen' mode so black = no change
    // faint glow of the phosphor face (the black is lit glass, not a void)
    const rg = g.createRadialGradient(W * 0.5, H_ * 0.52, 0, W * 0.5, H_ * 0.52, W * 0.62);
    rg.addColorStop(0, 'rgba(20,40,30,0.55)'); rg.addColorStop(0.6, 'rgba(12,26,20,0.3)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H_);
    // tube glare up-left (as the hero had) + a soft diagonal reflection band of the cabinet
    const gl = g.createRadialGradient(W * 0.3, H_ * 0.2, 0, W * 0.3, H_ * 0.2, W * 0.5); gl.addColorStop(0, 'rgba(120,160,140,0.05)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H_);
    g.save(); g.translate(W * 0.62, H_ * 0.3); g.rotate(-0.55);
    const band = g.createLinearGradient(0, -90, 0, 90);
    band.addColorStop(0, 'rgba(150,190,170,0)'); band.addColorStop(0.45, 'rgba(150,190,170,0.04)'); band.addColorStop(0.55, 'rgba(150,190,170,0.05)'); band.addColorStop(1, 'rgba(150,190,170,0)');
    g.fillStyle = band; g.fillRect(-W, -90, W * 2, 180); g.restore();
    // fine phosphor-screen grain (static, very faint)
    const gr = H.rng(1981), id = g.getImageData(0, 0, W, H_), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = gr() * 3.5; d[i] += v * 0.6; d[i + 1] += v; d[i + 2] += v * 0.8; }
    g.putImageData(id, 0, 0);
    // rounded tube corners: the curved faceplate falls off into the bezel
    const M = H.layer(W, H_), m = M.getContext('2d');
    m.fillStyle = '#000'; m.fillRect(0, 0, W, H_);
    m.globalCompositeOperation = 'destination-out'; m.filter = 'blur(18px)';
    m.beginPath(); m.roundRect(10, 8, W - 20, H_ - 16, 90); m.fill();
    m.globalCompositeOperation = 'source-over'; m.filter = 'none';
    H.vignette(m, W, H_, 0.6); // baked: same vignette the frame used to draw live
    const out = { glass: G, bezel: M };
    return (glassCache[key] = out);
  }
  let halfA = null, halfB = null, halfT = null;
  function renderBeams(ctx, W, H_, strokes, r, flick, jit = 0.2) {
    const gls = glassLayer(W, H_);
    ctx.drawImage(gls.glass, 0, 0); // opaque lit-glass base (black + faint face glow, glare, grain)
    const beam = H.layer(W, H_), b = beam.getContext('2d');
    b.lineCap = 'round'; b.lineJoin = 'round'; b.globalCompositeOperation = 'lighter';
    const fat = H.layer(W, H_), fb = fat.getContext('2d');
    fb.lineCap = 'round'; fb.lineJoin = 'round'; fb.globalCompositeOperation = 'lighter';
    strokes.forEach((s) => {
      // long strokes are swept faster -> dimmer; per-stroke beam jitter
      let L = 0; for (let i = 1; i < s.pts.length; i++) L += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]);
      const inten = s.a * flick * (1 - jit + jit * r()) * H.clamp(1.25 - L / 2600, 0.55, 1);
      const [cr, cg, cb] = s.col;
      b.strokeStyle = `rgba(${cr},${cg},${cb},${inten})`; b.lineWidth = 1.7;
      b.beginPath(); s.pts.forEach(([x, y], i) => (i ? b.lineTo(x + (r() - 0.5) * 0.4, y + (r() - 0.5) * 0.4) : b.moveTo(x, y))); b.stroke();
      // dwell dots at vertices (beam pauses = brighter)
      if (!s.ghost) {
        b.fillStyle = `rgba(${Math.min(255, cr + 60)},${Math.min(255, cg + 40)},${Math.min(255, cb + 60)},${inten * 0.9})`;
        s.pts.forEach(([x, y]) => { b.beginPath(); b.arc(x, y, 1.6, 0, 7); b.fill(); });
      }
      if (s.ghost) return; // decaying phosphor is too dim to feed the halo
      fb.strokeStyle = `rgba(${cr},${cg},${cb},${s.a * 0.55})`; fb.lineWidth = 5; fb.beginPath(); s.pts.forEach(([x, y], i) => (i ? fb.lineTo(x, y) : fb.moveTo(x, y))); fb.stroke();
    });
    // low-res copies for the wide halos: downsample first, then blur the small canvas (much cheaper than blurring
    // at full size; a 22px/14px halo has no detail to lose)
    const hw = W >> 2, hh = H_ >> 2;
    if (!halfA || halfA.width !== hw) { halfA = H.layer(hw, hh); halfB = H.layer(hw, hh); halfT = H.layer(hw, hh); }
    const ha = halfA.getContext('2d'), hb = halfB.getContext('2d'), ht = halfT.getContext('2d');
    ht.clearRect(0, 0, hw, hh); ht.drawImage(fat, 0, 0, hw, hh);
    ha.clearRect(0, 0, hw, hh); ha.filter = 'blur(5.5px)'; ha.drawImage(halfT, 0, 0); ha.filter = 'none';
    ht.clearRect(0, 0, hw, hh); ht.globalCompositeOperation = 'lighter'; ht.drawImage(beam, 0, 0, hw, hh); ht.drawImage(beam, 0, 0, hw, hh); ht.globalCompositeOperation = 'source-over';
    hb.clearRect(0, 0, hw, hh); hb.filter = 'blur(3.5px)'; hb.drawImage(halfT, 0, 0); hb.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75; ctx.drawImage(halfA, 0, 0, W, H_);
    ctx.filter = 'blur(8px)'; ctx.globalAlpha = 0.6; ctx.drawImage(fat, 0, 0);
    ctx.filter = 'none'; ctx.globalAlpha = 0.9; ctx.drawImage(halfB, 0, 0, W, H_);
    ctx.filter = 'blur(4px)'; ctx.globalAlpha = 1; ctx.drawImage(beam, 0, 0);
    ctx.filter = 'blur(1.5px)'; ctx.drawImage(beam, 0, 0);
    ctx.filter = 'none'; ctx.globalAlpha = 0.9; ctx.drawImage(beam, 0, 0);
    // white-hot centre on top of the core lines
    ctx.globalAlpha = 0.35; ctx.filter = 'brightness(1.6)'; ctx.drawImage(beam, 0, 0);
    ctx.restore();
    ctx.drawImage(gls.bezel, 0, 0);
  }
  const exBeams = (ctx, W, H_, strokes, r, flick) => renderBeams(ctx, W, H_, strokes, r, flick, 0.2);

  function vecExplainer(ctx, W, H_, t) {
    const r = H.rng(77 + Math.floor(t * 30));
    const GREEN = [110, 255, 120], RED = [255, 70, 50], WHITE = [210, 255, 220];
    const flick = 0.93 + 0.07 * r();
    const cx = W / 2, cyc = H_ / 2;
    const strokes = [];
    let REV = 1, ZOOM = 1, GHOST = false;
    const cut = (pts, f) => {
      if (f >= 1) return pts; if (f <= 0) return [];
      let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let left = L * f; const out = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (d >= left) { const k = d ? left / d : 0; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; }
        out.push(pts[i]); left -= d;
      }
      return out;
    };
    const poly = (pts, col = GREEN, a = 1) => {
      pts = cut(pts, REV);
      if (ZOOM !== 1) pts = pts.map(([x, y]) => [cx + (x - cx) * ZOOM, cyc + (y - cyc) * ZOOM]);
      if (pts.length > 1 && a > 0.01) strokes.push({ pts, col, a, ghost: GHOST });
    };
    // phosphor persistence (P31 decay): moving strokes leave a fading smear of copies over the last ~50 ms
    const LAGS = [[0.048, 0.07], [0.036, 0.12], [0.024, 0.2], [0.012, 0.32]];
    const trail = (fn) => { GHOST = true; LAGS.forEach(([lag, ga]) => fn(t - lag, ga)); GHOST = false; fn(t, 1); };
    const ph = (a, d) => H.ease.inOut(H.clamp((t - a) / d));
    const text = (str, x, y, sz, col, a = 1, track = 1.6) => {
      let px = x; const nC = REV * str.length, rev0 = REV;
      for (let ci = 0; ci < str.length; ci++) {
        const g = EXG[str[ci]]; REV = H.clamp(nC - ci);
        if (g && REV > 0) g.forEach((pl) => poly(pl.map(([gx, gy]) => [px + gx * sz, y + gy * sz]), col, a));
        px += sz * 4 + sz * track;
      }
      REV = rev0; return px - x;
    };
    const tw = (str, sz, track = 1.6) => str.length * (sz * 4 + sz * track) - sz * track;
    const ctext = (str, x, y, sz, col, a, track) => text(str, x - tw(str, sz, track) / 2, y, sz, col, a, track);
    const arrow = (x1, y1, x2, y2, col, a = 1) => {
      const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), f = REV;
      const ex = x1 + (x2 - x1) * f, ey = y1 + (y2 - y1) * f;
      const r0 = REV; REV = 1;
      poly([[x1, y1], [ex, ey]], col, a);
      if (f > 0.05) poly([[ex + Math.cos(ang + 2.6) * 16, ey + Math.sin(ang + 2.6) * 16], [ex, ey], [ex + Math.cos(ang - 2.6) * 16, ey + Math.sin(ang - 2.6) * 16]], col, a);
      REV = r0; return L;
    };
    const box = (x, y, w, h, col, a = 1) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], col, a);
    const brackets = (x, y, w, h, s, col, a = 1) => {
      poly([[x, y + s], [x, y], [x + s, y]], col, a); poly([[x + w - s, y], [x + w, y], [x + w, y + s]], col, a);
      poly([[x, y + h - s], [x, y + h], [x + s, y + h]], col, a); poly([[x + w - s, y + h], [x + w, y + h], [x + w, y + h - s]], col, a);
    };
    const shape = (pts, x, y, s, col, a = 1, close = true) => poly((close ? [...pts, pts[0]] : pts).map(([px, py]) => [x + px * s, y + py * s]), col, a);
    const cat = (x, y, s, col, a = 1) => {
      shape([[-1, -0.1], [-0.85, -1], [-0.35, -0.55], [0.35, -0.55], [0.85, -1], [1, -0.1], [0.8, 0.6], [0, 0.9], [-0.8, 0.6]], x, y, s, col, a);
      shape([[-0.45, -0.1], [-0.25, -0.1]], x, y, s, col, a, false); shape([[0.25, -0.1], [0.45, -0.1]], x, y, s, col, a, false);
      shape([[-0.1, 0.25], [0.1, 0.25], [0, 0.38], [-0.1, 0.25]], x, y, s, col, a, false);
      shape([[-0.3, 0.35], [-1.1, 0.2]], x, y, s, col, a, false); shape([[0.3, 0.35], [1.1, 0.2]], x, y, s, col, a, false);
    };
    const dog = (x, y, s, col, a = 1) => {
      shape([[-0.6, -0.75], [0.6, -0.75], [0.72, 0.3], [0.3, 0.85], [-0.3, 0.85], [-0.72, 0.3]], x, y, s, col, a);
      shape([[-0.6, -0.75], [-1.05, -0.45], [-0.95, 0.35], [-0.66, 0.1]], x, y, s, col, a, false);
      shape([[0.6, -0.75], [1.05, -0.45], [0.95, 0.35], [0.66, 0.1]], x, y, s, col, a, false);
      shape([[-0.3, -0.2], [-0.15, -0.2]], x, y, s, col, a, false); shape([[0.15, -0.2], [0.3, -0.2]], x, y, s, col, a, false);
      shape([[-0.15, 0.3], [0.15, 0.3], [0, 0.45]], x, y, s, col, a);
    };
    const check = (x, y, s, col, a = 1) => poly([[x - s, y], [x - s * 0.3, y + s * 0.7], [x + s, y - s * 0.9]], col, a);
    const cross = (x, y, s, col, a = 1) => { poly([[x - s, y - s], [x + s, y + s]], col, a); poly([[x + s, y - s], [x - s, y + s]], col, a); };
    // wireframe icosahedron "model core" in 2D (weak perspective), optional vertex wobble = weights moving
    const phi = (1 + Math.sqrt(5)) / 2;
    const icoV = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]];
    const icoE = []; for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const d = Math.hypot(icoV[i][0] - icoV[j][0], icoV[i][1] - icoV[j][1], icoV[i][2] - icoV[j][2]); if (Math.abs(d - 2) < 0.01) icoE.push([i, j]); }
    const core = (x, y, s, col, a = 1, wob = 0, rev = 1, tt = t) => {
      const ca = tt * 0.6, cb = tt * 0.37;
      const P = icoV.map((v, k) => {
        let [vx, vy, vz] = v.map((q) => q + (wob ? Math.sin(tt * 9 + k * 2.1) * wob : 0));
        let y1 = vy * Math.cos(cb) - vz * Math.sin(cb), z1 = vy * Math.sin(cb) + vz * Math.cos(cb);
        let x2 = vx * Math.cos(ca) - z1 * Math.sin(ca), z2 = vx * Math.sin(ca) + z1 * Math.cos(ca);
        const pz = 1 / (1 + z2 * 0.08);
        return [x + x2 * s * pz, y + y1 * s * pz];
      });
      const r0 = REV, k = rev * icoE.length;
      icoE.forEach(([i, j], e) => { REV = H.clamp(k - e); if (REV > 0) poly([P[i], P[j]], col, a); });
      REV = r0;
    };
    // the hero's mountain range (same seed and silhouette) standing on the y=520 ground line
    const MTN = []; { const rs = H.rng(42); for (let i = 0; i <= 26; i++) { const x = -200 + i * ((W + 400) / 26); const h = (i % 2 ? 10 + rs() * 30 : 40 + rs() * 70); MTN.push([x, 520 - h * (i > 9 && i < 15 ? 0.45 : 1)]); } }
    const fmt = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const streaks = (k, a) => { const rs = H.rng(5); for (let i = 0; i < 46; i++) { const ang = rs() * 6.283, d0 = 40 + rs() * 300; const d1 = d0 + 60 + k * 900; poly([[cx + Math.cos(ang) * d0 * (1 + k * 2), cyc + Math.sin(ang) * d0 * (1 + k * 2)], [cx + Math.cos(ang) * d1, cyc + Math.sin(ang) * d1]], GREEN, a); } };

    // ---------- persistent HUD: the question, once it has shrunk into the corner ----------
    const hdrK = ph(1.7, 0.6);
    {
      const sz = H.lerp(10, 4, hdrK), x = H.lerp(cx - tw('HOW DOES AI LEARN?', 10) / 2, 40, hdrK), y = H.lerp(290, 34, hdrK);
      REV = H.clamp((t - 0.15) / 0.9);
      text('HOW DOES AI LEARN?', x, y, sz, hdrK > 0.5 ? RED : GREEN, 1);
      REV = 1;
      if (hdrK >= 1) poly([[40, 70], [40 + tw('HOW DOES AI LEARN?', 4), 70]], RED, 0.6);
    }

    // ---------- BEAT 1 -> 2: the model core appears, then the DATA stream ----------
    if (t < 6.4) {
      ZOOM = t > 5.8 ? 1 + Math.pow((t - 5.8) / 0.6, 2) * 9 : 1;   // warp INTO the core
      const coreX = cx + 180, coreY = 360;
      REV = ph(0.9, 0.5); poly([[0, 520], [W, 520]], GREEN, 0.5);
      poly(MTN, GREEN, 0.2); REV = 1;
      trail((tt, ga) => core(coreX, coreY, 70, WHITE, ga, 0, ph(1.95, 1.0), tt));
      if (t > 2.4) { REV = ph(2.4, 0.4); poly([[coreX, coreY + 130], [coreX, coreY + 168]], GREEN, 0.8); REV = ph(2.6, 0.4); ctext('MODEL', coreX, coreY + 178, 6, GREEN, 1); REV = 1; }
      // the stream arrow
      if (t > 2.6) { REV = ph(2.6, 0.5); arrow(90, 520, coreX - 120, 470, GREEN, 0.7); REV = ph(2.9, 0.4); text('TRAINING DATA', 100, 540, 5, GREEN, 0.95); REV = 1; }
      // labelled examples fly along the arrow into the core
      for (let i = 0; i < 9; i++) {
        const t0 = 2.6 + i * 0.34;
        if (t < t0 || t > t0 + 1.5) continue;
        const isCat = (i * 7) % 3 !== 0;
        trail((tt, ga) => {
          const k = (tt - t0) / 1.5; if (k < 0 || k > 1) return;
          const x = H.lerp(-80, coreX - 40, k), y = H.lerp(400, coreY, Math.pow(k, 2)) - Math.sin(k * Math.PI) * 30;
          const s = 46 * (1 - Math.pow(k, 3) * 0.85);
          box(x - s * 1.25, y - s * 1.25, s * 2.5, s * 2.5, GREEN, 0.75 * ga);
          (isCat ? cat : dog)(x, y - s * 0.12, s * 0.8, GREEN, 0.95 * ga);
          if (s > 20 && ga === 1) text(isCat ? 'CAT' : 'DOG', x - tw('CAT', s / 9) / 2, y + s * 1.4, s / 9, isCat ? GREEN : WHITE, 1);
        });
      }
      // counter readout
      if (t > 2.8) {
        const n = 1e6 * Math.pow(H.clamp((t - 2.9) / 2.6), 2.2);
        REV = ph(2.8, 0.3); box(40, 90, 560, 130, RED, 0.7); text('EXAMPLES SEEN', 60, 104, 4.2, RED, 0.95); REV = 1;
        text(fmt(n), 60, 140, 11, GREEN, 1, 1.3);
      }
      if (t > 5.8) streaks((t - 5.8) / 0.6, 0.6);
      ZOOM = 1;
    }

    // ---------- BEAT 3: GUESS -> CHECK -> ADJUST loop ----------
    if (t >= 6.4 && t < 10.9) {
      ZOOM = t < 6.75 ? Math.pow((t - 6.4) / 0.35, 0.6) : t > 10.5 ? 1 - Math.pow((t - 10.5) / 0.4, 2) : 1;
      if (t < 6.8) streaks(1 - (t - 6.4) / 0.4, 0.4);
      const picX = 260, picY = 380, coreX = 840, coreY = 360;
      // loop indicator across the top: GUESS > CHECK > ADJUST, with return arrow
      const phase = t < 7.5 ? 0 : t < 8.4 ? 1 : t < 9.4 ? 2 : 0;
      const items = ['GUESS', 'CHECK', 'ADJUST'], ix = [400, 640, 890];
      items.forEach((s, i) => {
        const on = i === phase;
        ctext(s, ix[i], 104, 5, on ? WHITE : GREEN, on ? 1 : 0.5);
        if (on) brackets(ix[i] - tw(s, 5) / 2 - 16, 90, tw(s, 5) + 32, 58, 10, WHITE, 1);
        if (i < 2) { REV = 1; arrow(ix[i] + tw(s, 5) / 2 + 12, 120, ix[i + 1] - tw(items[i + 1], 5) / 2 - 12, 120, GREEN, 0.5); }
      });
      poly([[ix[2], 152], [ix[2], 172], [ix[0], 172]], GREEN, 0.45); arrow(ix[0], 172, ix[0], 154, GREEN, 0.45);
      // dim horizon + mountain range behind the loop (broken where the NEW PICTURE caption sits)
      poly([[0, 520], [picX - 140, 520]], GREEN, 0.2); poly([[picX + 140, 520], [W, 520]], GREEN, 0.2);
      poly(MTN, GREEN, 0.14);
      // the new picture (a cat) in a targeting frame
      box(picX - 110, picY - 110, 220, 220, GREEN, 0.8);
      cat(picX, picY, 70, GREEN, 1);
      REV = 1; text('NEW PICTURE', picX - tw('NEW PICTURE', 4.2) / 2, picY + 126, 4.2, GREEN, 0.9);
      // model core with dials
      trail((tt, ga) => core(coreX, coreY, 85, WHITE, ga, tt > 8.5 && tt < 9.4 ? 0.22 * (1 - (tt - 8.5) / 0.9) : 0, 1, tt));
      // GUESS beam from picture into model and out to readout
      const g1 = ph(6.8, 0.45);
      REV = g1; arrow(picX + 125, picY, coreX - 120, coreY, GREEN, 0.9); REV = 1;
      const g2 = t > 9.4 ? ph(9.45, 0.4) : 0;
      if (g2 > 0 && g2 < 1) { const px = H.lerp(picX + 125, coreX - 120, g2), py = H.lerp(picY, coreY, g2); cross(px, py, 6, WHITE, 1); }
      const rx = coreX + 175, ry = coreY - 40;
      if (t > 7.15 && t < 9.4) {
        REV = H.clamp((t - 7.15) / 0.3); text('DOG?', rx, ry, 7, t > 7.5 ? RED : GREEN, 1); REV = 1;
        if (t > 7.5) { // CHECK: wrong!
          const bl = Math.floor((t - 7.5) * 8) % 2 === 0 || t > 8.0;
          if (bl) cross(rx + 90, ry + 22, 46, RED, 1);
          if (bl) brackets(picX - 126, picY - 126, 252, 252, 26, RED, 1);
          REV = ph(7.6, 0.4); text('IT IS A CAT', picX - tw('IT IS A CAT', 5) / 2, picY - 160, 5, RED, 1); REV = 1;
        }
      }
      // ADJUST: error pulse travels back, dials turn, connections re-shape
      if (t > 8.3) {
        const ek = H.clamp((t - 8.35) / 0.55);
        const path = [[rx + 40, ry + 60], [rx + 40, coreY + 150], [coreX, coreY + 150]];
        REV = ek; poly(path, RED, 0.9); REV = 1;
        if (ek > 0 && ek < 1) { const p = cut(path, ek); const [ex, ey] = p[p.length - 1]; box(ex - 8, ey - 8, 16, 16, RED, 1); }
        if (t > 8.4 && t < 9.4) { REV = ph(8.4, 0.3); text('ERROR', rx + 54, coreY + 124, 5, RED, 1); REV = 1; }
      }
      // weight dials under the core (knobs)
      ['W1', 'W2', 'W3'].forEach((s, i) => {
        const dx = coreX - 150 + i * 150, dy = 600, R = 38;
        const circ = []; for (let a = 0; a <= 6.3; a += 0.3) circ.push([dx + Math.cos(a) * R, dy + Math.sin(a) * R]);
        poly(circ, GREEN, 0.7);
        const a0 = [-2.2, -0.6, -1.4][i], a1 = [-0.9, -1.9, 0.2][i];
        trail((tt, ga) => {
          const ang = H.lerp(a0, a1, H.ease.inOut(H.clamp((tt - 8.6 - i * 0.12) / 0.6)));
          poly([[dx, dy], [dx + Math.cos(ang) * (R - 6), dy + Math.sin(ang) * (R - 6)]], t > 8.6 && t < 9.5 ? WHITE : GREEN, ga);
        });
        ctext(s, dx, dy + R + 10, 4, GREEN, 0.9);
      });
      REV = 1; text('WEIGHTS', coreX - 360, 588, 4.2, GREEN, 0.8);
      // second GUESS: correct
      if (t > 9.75) {
        REV = H.clamp((t - 9.75) / 0.3); text('CAT', rx, ry, 7, GREEN, 1); REV = 1;
        if (t > 10.0) { check(rx + 150, ry + 22, 30, GREEN, 1); brackets(picX - 126, picY - 126, 252, 252, 26, GREEN, 1); }
      }
      ZOOM = 1;
    }

    // ---------- BEAT 4: PROGRESS chart ----------
    if (t >= 10.85) {
      ZOOM = t < 11.2 ? H.ease.out((t - 10.85) / 0.35) : 1;
      const ox = 110, oy = 660, aw = 780, ah = 400;
      REV = ph(10.9, 0.4); poly([[ox, oy - ah], [ox, oy], [ox + aw, oy]], GREEN, 0.8); REV = 1;
      for (let k = 1; k <= 4; k++) poly([[ox - 8, oy - (k / 4) * ah], [ox, oy - (k / 4) * ah]], GREEN, 0.6);
      REV = ph(11.0, 0.4); text('TRAINING ROUNDS', ox + aw - tw('TRAINING ROUNDS', 4.2), oy + 8, 4.2, GREEN, 0.9); REV = 1;
      const N = 24, prog = H.clamp((t - 11.1) / 1.7);
      const acc = (i) => 97 - 36 * Math.exp(-i / 5.5);
      const pts = []; for (let i = 0; i <= N * prog + 1e-6; i++) pts.push([ox + (i / N) * aw, oy - ((acc(i) - 50) / 50) * ah]);
      if (prog * N % 1 > 0.01 && pts.length <= N) { const i = N * prog, i0 = Math.floor(i); pts.push([ox + (i / N) * aw, oy - ((H.lerp(acc(i0), acc(i0 + 1), i - i0) - 50) / 50) * ah]); }
      poly(pts, WHITE, 1);
      pts.forEach(([x, y], k) => { if (k % 4 === 0) box(x - 3, y - 3, 6, 6, GREEN, 0.8); });
      const val = Math.round(61 + 36 * H.ease.out(prog));
      const last = pts[pts.length - 1] || [ox, oy];
      text('ACCURACY', 950, 330, 5, GREEN, 0.95);
      text(val + '%', 950, 376, 15, prog >= 1 ? WHITE : GREEN, 1, 1.3);
      // emphasis: lock-on brackets + ring at the 97% point
      if (prog >= 1) {
        const bl = t > 13.0 || Math.floor((t - 12.8) * 8) % 2 === 0;
        if (bl) brackets(930, 310, 330, 170, 24, RED, 1);
        const ring = []; const rr = 26 + Math.max(0, 0.4 - (t - 12.8)) * 80; for (let a = 0; a <= 6.3; a += 0.25) ring.push([last[0] + Math.cos(a) * rr, last[1] + Math.sin(a) * rr]); poly(ring, RED, 1);
      }
      // ---------- BEAT 5: takeaway ----------
      if (t > 13.1) {
        REV = H.clamp((t - 13.1) / 0.55);
        ctext('MORE EXAMPLES ~ BETTER GUESSES', cx, 132, 7, WHITE, 1, 1.4);
        REV = 1;
      }
      ZOOM = 1;
    }
    exBeams(ctx, W, H_, strokes, r, flick);
  }

  // ================= SOUND: a 1979-83 vector cabinet. Discrete analog circuits, no music: a low buzzing beam while
  // strokes draw, the two-note heartbeat thump that speeds up with the counter, laser pews, a hyperspace sweep for the
  // warps, a noise-circuit explosion and alarm warble for the miss, and saw-chord bonus tones for the hits.
  // Cabinet fan + mains hum underneath. Times copied from vecExplainer.
  function vecSound(k) {
    const END = 14.5;
    const px = (x) => H.clamp(x / 1280) * 1.4 - 0.7;
    // vector beam drawing: buzzy low saw through a band, pitch drifts from f0 to f1 over the draw
    const beam = (t, dur, f0, f1, p0 = 0, g = 1) => k.tone(t, { f: [[0, f0], [dur, f1]], type: 'sawtooth', dur, gain: 0.05 * g, a: Math.min(0.04, dur * 0.2), hold: dur * 0.7, filter: 'bandpass', f2: 900, q: 1.5, pan: p0, minor: true });
    const saw = (t, f, dur, gain, o) => k.tone(t, Object.assign({ f, type: 'sawtooth', dur, gain, a: 0.003, hold: dur * 0.5, filter: 'lowpass', f2: 2000 }, o));
    // heartbeat thump (alternating low notes)
    const beat = (t, hi, g = 1) => { k.tone(t, { f: [[0, hi ? 70 : 62], [0.09, 40]], type: 'square', dur: 0.12, gain: 0.085 * g, a: 0.002, hold: 0.04, filter: 'lowpass', f2: 300, minor: true }); };
    // laser pew: fast falling square sweep
    const pew = (t, dur, f0, f1, p = 0, g = 1) => k.tone(t, { f: [[0, f0], [dur, f1]], type: 'square', dur, gain: 0.06 * g, a: 0.002, hold: dur * 0.6, filter: 'lowpass', f2: 2200, pan: p });
    // noise-circuit explosion
    const boom = (t, dur, g = 1, p = 0) => { k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 1600], [dur, 120]], gain: 0.55 * g, a: 0.002, pan: p }); k.noise(t, { dur: dur * 0.5, filter: 'lowpass', f: 3000, gain: 0.12 * g, rate: 0.3, a: 0.001, pan: p }); };
    // hyperspace: rising (in) or falling (out) noise + saw sweep
    const warp = (t, dur, up, g = 1) => {
      k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: up ? [[0, 300], [dur, 3000]] : [[0, 3000], [dur, 300]], q: 1.4, gain: 0.16 * g, a: up ? dur * 0.85 : 0.01 });
      k.tone(t, { f: up ? [[0, 90], [dur, 700]] : [[0, 700], [dur, 90]], type: 'sawtooth', dur, gain: 0.05 * g, a: up ? dur * 0.8 : 0.01, filter: 'lowpass', f2: 1500 });
    };

    k.bed('hum', 0, END, { gain: 0.5 });
    k.bed('room', 0, END, { gain: 0.9 }); // cabinet fan

    // ---- BEAT 1: title draws letter by letter (0.15-1.05), horizon line (0.9-1.4)
    beam(0.15, 0.9, 120, 150, 0);
    for (let i = 0; i < 18; i += 2) k.noise(0.15 + (i / 18) * 0.9, { dur: 0.012, filter: 'bandpass', f: 1300, q: 3, gain: 0.12, a: 0.001, pan: px(440 + i * 22), minor: true });
    k.tone(0.9, { f: [[0, 150], [0.5, 260]], type: 'sawtooth', dur: 0.5, gain: 0.04, a: 0.05, hold: 0.35, filter: 'lowpass', f2: 800, pan: 0 });
    // title shrinks into the corner (1.7-2.3): soft low slide, small tone as it turns red (~2.0)
    k.noise(1.7, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 600], [0.6, 200]], gain: 0.09, a: 0.25, pan: -0.4 });
    saw(2.0, 'E3', 0.12, 0.035, { pan: -0.6 });
    // ---- BEAT 2: core draws edge by edge (1.95-2.95), stem + MODEL (2.4/2.6), arrow (2.6-3.1), label (2.9)
    beam(1.95, 1.0, 80, 160, px(820), 1.1);
    beam(2.6, 0.5, 140, 200, px(450), 0.7);
    // cards fly into the core: arrive at 2.6 + i*0.34 + 1.5 (only the ones before the warp)
    for (let i = 0; i < 6; i++) { const t = 4.1 + i * 0.34; if (t > 5.75) break; k.tone(t, { f: [[0, 220], [0.08, 520]], type: 'square', dur: 0.1, gain: 0.04, a: 0.002, hold: 0.05, filter: 'lowpass', f2: 1600, pan: px(780), minor: true }); }
    // EXAMPLES SEEN (box 2.8, counter 2.9-5.5, accelerating): the heartbeat speeds up with it
    { let hi = true; for (let t = 2.95; t < 5.45;) { beat(t, hi); hi = !hi; t += H.lerp(0.42, 0.13, H.clamp((t - 2.9) / 2.6)); } }
    saw(5.5, 'A3', 0.1, 0.05, { pan: -0.4 }); saw(5.6, 'E4', 0.3, 0.05, { pan: -0.4 });          // lands on 1,000,000
    // warp into the core (5.8-6.4), out of the streaks into the loop (6.4-6.75)
    warp(5.8, 0.6, true, 1);
    k.play('thud', 6.4, { f: 90, gain: 0.45 });
    warp(6.4, 0.35, false, 0.6);

    // ---- BEAT 3: guess beam (6.8-7.25), DOG? draws (7.15-7.45)
    pew(6.8, 0.45, 1400, 500, px(600), 0.9);
    beam(7.15, 0.3, 130, 150, px(1100), 0.8);
    // CHECK (7.5): red cross + brackets blink (on at 7.5, 7.75, steady from 8.0) -> explosion + alarm warble
    boom(7.5, 0.7, 1.5, px(1080)); k.play('thud', 7.5, { f: 80, gain: 0.5, pan: px(1080) });
    [7.5, 7.75, 8.0].forEach((t) => { saw(t, 'C4', 0.06, 0.06, { pan: px(260) }); saw(t + 0.06, 'G3', 0.06, 0.06, { pan: px(260) }); });
    beam(7.6, 0.4, 120, 110, px(260), 0.7);                                                  // IT IS A CAT
    // ADJUST (8.4): error pulse runs back (8.35-8.9), core wobbles 8.5-9.4, dials turn (8.6, 8.72, 8.84 for 0.6)
    k.tone(8.35, { f: [[0, 600], [0.55, 200]], type: 'square', dur: 0.56, gain: 0.04, a: 0.01, hold: 0.4, filter: 'lowpass', f2: 1500, pan: px(1000) });
    k.withMinor(() => {
      for (let i = 0; i < 3; i++) k.tone(8.6 + i * 0.12, { f: [[0, 160 + i * 30], [0.6, 230 + i * 30]], type: 'sawtooth', dur: 0.6, gain: 0.03, a: 0.08, hold: 0.3, filter: 'lowpass', f2: 700, pan: px(690 + i * 150) });
      for (let t = 8.5; t < 9.35; t += 1 / 9) k.tone(t, { f: 95 + 30 * Math.sin(t * 9), type: 'sawtooth', dur: 0.1, gain: 0.04 * (1 - (t - 8.5) / 0.9), filter: 'lowpass', f2: 500, pan: px(840) });
    });
    // GUESS again: a shot travels from picture to core (9.45-9.85), CAT draws (9.75), lock-on check (10.0): the correction
    pew(9.45, 0.4, 1200, 400, px(560), 1.0);
    beam(9.75, 0.3, 140, 170, px(1100), 0.8);
    saw(10.0, 'E4', 0.1, 0.06, { pan: px(1100) }); saw(10.1, 'A4', 0.35, 0.06, { pan: px(1100) }); saw(10.1, 'A3', 0.35, 0.05, { pan: px(1100) });
    // zoom out of the loop (10.5-10.9), chart zooms in (10.85-11.2)
    warp(10.5, 0.4, false, 0.7);

    // ---- BEAT 4: axes draw (10.9-11.3), curve draws 11.1-12.8 with the % climbing (ease-out)
    beam(10.9, 0.4, 110, 130, px(400), 0.8);
    k.tone(11.1, { f: [[0, 120], [0.6, 210], [1.7, 240]], type: 'sawtooth', dur: 1.7, gain: 0.045, a: 0.05, hold: 1.5, filter: 'bandpass', f2: 900, q: 1.5, pan: px(500), minor: true });
    { let last = 61, lastT = -1; for (let f = Math.ceil(11.1 * 60); f < 12.75 * 60; f++) { const t = f / 60, v = Math.round(61 + 36 * H.ease.out(H.clamp((t - 11.1) / 1.7))); if (v > last && t - lastT >= 1 / 12) { k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1600, q: 3, gain: 0.13, a: 0.001, pan: px(1080), minor: true }); last = v; lastT = t; } } }
    // 97% (12.8): lock-on brackets blink, ring collapses on the last point. the biggest hit: deep boom + saw chord
    const P = 12.8;
    k.play('thud', P, { f: 110, gain: 0.8 }); boom(P, 0.5, 0.6, px(1000));
    ['C4', 'E4', 'G4', 'C5'].forEach((n) => saw(P, n, 0.9, 0.04, { hold: 0.35, verb: 0.15, pan: px(1080) })); k.tone(P, { f: 'C2', dur: 0.9, gain: 0.25, a: 0.004, hold: 0.2 });
    k.tone(P, { f: [[0, 900], [0.4, 300]], type: 'square', dur: 0.4, gain: 0.03, a: 0.005, hold: 0.25, filter: 'lowpass', f2: 1600, pan: px(870) }); // ring shrinking
    // ---- BEAT 5: takeaway draws (13.1-13.65) and lands with a resolving two-note
    beam(13.1, 0.55, 140, 170, 0, 0.9);
    saw(13.68, 'G3', 0.12, 0.04); saw(13.8, 'C4', 0.7, 0.04, { verb: 0.12 }); k.tone(13.8, { f: 'C3', type: 'triangle', dur: 0.8, gain: 0.09, a: 0.005, hold: 0.3 });
  }

  registerStyle({
    id: 'vector-arcade',
    name: 'Vector Arcade 1980',
    category: 'Retro Digital',
    description: 'An XY vector monitor cabinet game: hair-thin phosphor beams on pure black, additive bloom, brighter dwell dots where the beam pauses at vertices, dimmer long strokes, wireframe 3D in perspective and a hand-built stroke font.',
    motion: 'Attract-mode build: the beam traces the horizon and mountains, wireframes draw on edge by edge, the AI core flies in from the distance spinning, the saucer slides in with phosphor trails, then the radar, score and title are stroked in letter by letter while everything flickers with beam load.',
    duration: 5,
    frameT: 4.8,
    readsPixels: false,
    explainerDuration: 14.5,
    explainerNote: 'Told as a vector-cabinet HUD: the question shrinks into a red corner readout, labelled wireframe cards stream into a spinning icosahedron core, a hyperspace-style zoom carries us into a lock-on loop (GUESS > CHECK > ADJUST with brackets, red error beam, turning weight dials), and the stroked accuracy graph climbs to a flashing 97%.',
    explainer(ctx, W, H_, t) { vecExplainer(ctx, W, H_, t); },
    explainerSound(k) { vecSound(k); },
    draw(ctx, W, H_, t) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H_);
      const r = H.rng(1980 + Math.floor(t * 30));       // per-frame beam jitter/flicker
      const rs = H.rng(42);                               // static scene randomness
      const GREEN = [110, 255, 120], RED = [255, 70, 50], WHITE = [210, 255, 220];
      const globalFlick = 0.93 + 0.07 * r();

      // collect beam strokes first, render them in bloom passes after
      const strokes = []; // {pts:[[x,y]...], col, a}
      let REV = 1; // fraction of each path the beam has traced so far
      const cut = (pts, f) => {
        if (f >= 1) return pts; if (f <= 0) return [];
        let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        let left = L * f; const out = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          if (d >= left) { const k = d ? left / d : 0; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; }
          out.push(pts[i]); left -= d;
        }
        return out;
      };
      let GHOST = false;
      const poly = (pts, col = GREEN, a = 1) => { pts = cut(pts, REV); if (pts.length > 1) strokes.push({ pts, col, a, ghost: GHOST }); };
      const ph = (a, d) => H.ease.inOut(H.clamp((t - a) / d));

      // ---------- 3D camera ----------
      const camH = 1.5, f = 760, hz = 420, cx = W / 2;
      const yaw = Math.sin(t * 0.25) * 0.08;
      const proj = ([x, y, z]) => {
        const xr = x * Math.cos(yaw) - z * Math.sin(yaw), zr = x * Math.sin(yaw) + z * Math.cos(yaw);
        if (zr < 0.5) return null;
        return [cx + (f * xr) / zr, hz - (f * (y - camH)) / zr, zr];
      };
      const edges3 = (verts, edges, col, a = 1) => {
        const P = verts.map(proj);
        const rev0 = REV, k = REV * edges.length;
        edges.forEach(([i, j], e) => { REV = H.clamp(k - e); if (P[i] && P[j] && REV > 0) poly([[P[i][0], P[i][1]], [P[j][0], P[j][1]]], col, a * H.clamp(2.2 - P[i][2] / 30, 0.35, 1)); });
        REV = rev0;
      };
      const rotY = (v, a) => [v[0] * Math.cos(a) - v[2] * Math.sin(a), v[1], v[0] * Math.sin(a) + v[2] * Math.cos(a)];
      const rotX = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
      const tr = (v, p) => [v[0] + p[0], v[1] + p[1], v[2] + p[2]];

      // ---------- horizon + mountain range + moon + volcano ----------
      REV = ph(0.1, 0.35); poly([[0, hz], [W, hz]], GREEN, 0.75);
      REV = ph(0.35, 0.6);
      const mx = (x) => (((x - t * 18 * 0 - yaw * 900) % (W + 400)) + W + 400) % (W + 400) - 200;
      const mtn = [];
      for (let i = 0; i <= 26; i++) { const x = -200 + i * ((W + 400) / 26); const h = (i % 2 ? 10 + rs() * 30 : 40 + rs() * 70); mtn.push([x - yaw * 900, hz - h * (i > 9 && i < 15 ? 0.45 : 1)]); }
      poly(mtn, GREEN, 0.7);
      REV = ph(0.6, 0.3);
      // volcano (left) with erupting debris arcs
      const vx = 1170 - yaw * 900;
      poly([[vx - 90, hz], [vx - 22, hz - 92], [vx + 22, hz - 92], [vx + 90, hz]], GREEN, 0.75);
      for (let k = 0; k < (t > 0.9 ? 6 : 0); k++) {
        const ph = ((t * 0.7 + k / 6) % 1), dir = (k % 2 ? 1 : -1) * (0.3 + rs() * 0.7);
        const px = vx + dir * ph * 90, py = hz - 92 - (ph * 160 - ph * ph * 190);
        poly([[px, py], [px + dir * 6, py - 4]], GREEN, 1 - ph * 0.6);
      }
      // crescent moon (right)
      const moon = [];
      for (let a = -1.9; a <= 1.9; a += 0.12) moon.push([1040 + Math.cos(a) * 34 - yaw * 900, 235 + Math.sin(a) * 34]);
      for (let a = 1.6; a >= -1.6; a -= 0.12) moon.push([1054 + Math.cos(a) * 26 - yaw * 900, 235 + Math.sin(a) * 30]);
      REV = ph(0.7, 0.4); poly(moon, GREEN, 0.8);

      // ---------- ground objects: pyramids + blocks in perspective ----------
      const pyramid = (p, s, h) => edges3(
        [[-s, 0, -s], [s, 0, -s], [s, 0, s], [-s, 0, s], [0, h, 0]].map((v) => tr(v, p)),
        [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]], GREEN);
      const block = (p, sx, sy, sz) => edges3(
        [[-sx, 0, -sz], [sx, 0, -sz], [sx, 0, sz], [-sx, 0, sz], [-sx, sy, -sz], [sx, sy, -sz], [sx, sy, sz], [-sx, sy, sz]].map((v) => tr(v, p)),
        [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], GREEN);
      let oi = 0; const nx = () => { REV = H.clamp((t - 0.8 - (oi++) * 0.1) / 0.3); };
      nx(); pyramid([-12, 0, 27], 2, 3.4); nx(); block([11.5, 0, 19], 1.6, 2.2, 1.6); nx(); pyramid([9.5, 0, 30], 2.4, 4); nx(); block([-17, 0, 15], 1.2, 1.2, 1.2);
      nx(); pyramid([-30, 0, 44], 3, 5); nx(); block([-6, 0, 36], 2.2, 1.4, 1.4); nx(); pyramid([24, 0, 58], 3, 5);

      // ---------- AI CORE: rotating icosahedron + counter-rotating inner cube (focal point) ----------
      const phi = (1 + Math.sqrt(5)) / 2;
      const icoV = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]];
      const icoE = [];
      for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) { const d = Math.hypot(icoV[i][0] - icoV[j][0], icoV[i][1] - icoV[j][1], icoV[i][2] - icoV[j][2]); if (Math.abs(d - 2) < 0.01) icoE.push([i, j]); }
      const corePAt = (tt) => [0.4, 3.3 + Math.sin(tt * 1.3) * 0.2, 15 + 50 * (1 - H.ease.out(H.clamp((tt - 1.2) / 1.3)))];
      const coreP = corePAt(t);
      REV = H.clamp((t - 1.2) / 0.6);
      const ca = t * 0.6, cb = t * 0.37;
      const cubeV = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
      // phosphor persistence: the spinning core leaves a fading smear of copies over the last ~50 ms
      [[0.048, 0.07], [0.036, 0.12], [0.024, 0.2], [0.012, 0.32], [0, 1]].forEach(([lag, ga]) => {
        const tt = t - lag, pa = tt * 0.6, pb = tt * 0.37, cp = corePAt(tt); GHOST = lag > 0;
        edges3(icoV.map((v) => tr(rotX(rotY(v.map((q) => q * 1.05), pa), pb), cp)), icoE, WHITE, ga);
        edges3(cubeV.map((v) => tr(rotY(rotX(v.map((q) => q * 0.62), -pa * 1.7), -pb * 2), cp)), [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], GREEN, ga);
      });
      GHOST = false;
      // orbit ring around core
      const ring = []; for (let a = 0; a <= 6.3; a += 0.15) { const v = proj(tr(rotX([Math.cos(a + t) * 2.6, 0, Math.sin(a + t) * 2.6], 0.3), coreP)); if (v) ring.push([v[0], v[1]]); }
      REV = ph(2.1, 0.5); poly(ring, GREEN, 0.55);
      REV = 1;

      // ---------- enemy saucer with phosphor-decay trail ----------
      const saucerAt = (tt) => [-3 + Math.sin(tt * 0.9) * 1.6 - 16 * (1 - H.ease.out(H.clamp((tt - 1.7) / 1.1))), 1.0, 12 + Math.cos(tt * 0.9) * 2];
      if (t > 1.7) [0.12, 0.06, 0].forEach((lag, li) => {
        const p = saucerAt(t - lag), sa = (t - lag) * 2.5;
        const ring1 = [], ring2 = [], spokes = [];
        const n = 8;
        const v1 = [], v2 = [], v3 = [];
        for (let k = 0; k < n; k++) { const a = sa + (k / n) * Math.PI * 2; v1.push([Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3]); v2.push([Math.cos(a) * 0.55, 0.45, Math.sin(a) * 0.55]); v3.push([Math.cos(a) * 0.6, -0.25, Math.sin(a) * 0.6]); }
        const V = [...v1, ...v2, ...v3].map((v) => tr(v, p));
        const E = [];
        for (let k = 0; k < n; k++) { E.push([k, (k + 1) % n], [n + k, n + (k + 1) % n], [2 * n + k, 2 * n + (k + 1) % n], [k, n + k]); if (k % 2 === 0) E.push([k, 2 * n + k]); }
        edges3(V, E, GREEN, [0.08, 0.16, 0.8][li]);
      });
      // player shell flying toward the core
      const shellK = (t * 0.9) % 1;
      if (t > 2.6) [0.08, 0.04, 0].forEach((lag, li) => { const k = ((t - lag - 2.6) * 0.9) % 1; const p = proj([0.2, 0.6 + k * 3.2, 2 + k * 10]); if (p) poly([[p[0] - 3, p[1]], [p[0] + 3, p[1]], [p[0], p[1] - 5], [p[0] - 3, p[1]]], GREEN, [0.2, 0.4, 1][li]); });

      // ---------- gunsight reticle ----------
      const ry = 520;
      REV = ph(1.6, 0.35);
      poly([[cx, ry - 120], [cx, ry - 60]], GREEN, 0.9); poly([[cx, ry + 20], [cx, ry + 80]], GREEN, 0.9);
      poly([[cx - 70, ry - 40], [cx - 70, ry - 60], [cx - 20, ry - 60]], GREEN, 0.9); poly([[cx + 70, ry - 40], [cx + 70, ry - 60], [cx + 20, ry - 60]], GREEN, 0.9);
      poly([[cx - 70, ry], [cx - 70, ry + 20], [cx - 20, ry + 20]], GREEN, 0.9); poly([[cx + 70, ry], [cx + 70, ry + 20], [cx + 20, ry + 20]], GREEN, 0.9);

      // ---------- HUD (red overlay zone, like the cabinet's colour gel) ----------
      const text = (str, x, y, sz, col, a = 1, track = 1.6) => {
        let px = x;
        const nC = REV * str.length, rev0 = REV;
        for (let ci = 0; ci < str.length; ci++) {
          const ch = str[ci]; REV = H.clamp(nC - ci);
          const g = GLYPH[ch];
          if (g) g.forEach((pl) => poly(pl.map(([gx, gy]) => [px + gx * sz, y + gy * sz]), col, a));
          px += sz * 4 + sz * track;
        }
        REV = rev0;
        return px - x;
      };
      const textW = (str, sz, track = 1.6) => str.length * (sz * 4 + sz * track) - sz * track;
      // radar
      const rx0 = cx, ry0 = 92, rr = 62;
      REV = ph(1.9, 0.45);
      const circ = []; for (let a = 0; a <= 6.30; a += 0.2) circ.push([rx0 + Math.cos(a) * rr, ry0 + Math.sin(a) * rr]); poly(circ, RED, 0.85);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; poly([[rx0 + Math.cos(a) * (rr - 8), ry0 + Math.sin(a) * (rr - 8)], [rx0 + Math.cos(a) * rr, ry0 + Math.sin(a) * rr]], RED, 0.7); }
      const sw = t * 2.2;
      REV = t > 2.35 ? 1 : 0;
      poly([[rx0, ry0], [rx0 + Math.cos(sw) * rr, ry0 + Math.sin(sw) * rr]], RED, 1);
      if (REV > 0) { GHOST = true; for (let k = 1; k <= 5; k++) { const a = sw - k * 0.07; poly([[rx0, ry0], [rx0 + Math.cos(a) * rr, ry0 + Math.sin(a) * rr]], RED, 0.5 * Math.pow(0.6, k)); } GHOST = false; }
      [[0.5, 0.6], [2.4, 0.4], [4.1, 0.75]].forEach(([a, d]) => { const fade = ((sw - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); const al = H.clamp(1 - fade / 4); if (al > 0.05) { const bx = rx0 + Math.cos(a) * rr * d, by = ry0 + Math.sin(a) * rr * d; poly([[bx - 2, by], [bx + 2, by]], RED, al); } });
      poly([[rx0 - 6, ry0 - 14], [rx0, ry0 - 22], [rx0 + 6, ry0 - 14]], RED, 0.8);
      // score / hi-score
      REV = H.clamp((t - 2.2) / 0.3); text('SCORE', 60, 40, 4, RED, 0.85);
      REV = H.clamp((t - 2.35) / 0.35); text(String(42150 + Math.floor(Math.max(0, t - 2.4) * 50) * 10).padStart(7, '0'), 60, 74, 6, GREEN, 1);
      const hs = 'HI 0099900'; REV = H.clamp((t - 2.3) / 0.35); text(hs, W - 60 - textW(hs, 4), 40, 4, RED, 0.85);
      REV = t > 2.6 ? 1 : 0;
      // lives as tiny tank glyphs
      for (let k = 0; k < 3; k++) { const lx = W - 60 - textW(hs, 4) + k * 34, ly = 82; poly([[lx, ly + 12], [lx + 24, ly + 12], [lx + 20, ly + 6], [lx + 4, ly + 6], [lx, ly + 12]], GREEN, 0.9); poly([[lx + 8, ly + 6], [lx + 10, ly + 1], [lx + 16, ly + 1], [lx + 17, ly + 6]], GREEN, 0.9); poly([[lx + 16, ly + 3], [lx + 26, ly + 2]], GREEN, 0.9); }
      // blinking alert line
      REV = 1;
      if (t > 2.9 && Math.floor(t * 2.5) % 3 !== 1) { const msg = 'AI CORE IN RANGE'; text(msg, cx - textW(msg, 5) / 2, 180, 5, RED, 1); }
      // title, bottom
      const title = 'NEURAL ZONE';
      REV = H.clamp((t - 2.4) / 0.7); text(title, cx - textW(title, 11, 1.4) / 2, 632, 11, GREEN, 1, 1.4);
      REV = 1;

      // ---------- render: beam strokes with intensity model, additive bloom, tube glass ----------
      renderBeams(ctx, W, H_, strokes, r, globalFlick, 0.22);
    },
  });
}
```
