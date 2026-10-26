I want an animated explainer made in the "Risograph Zine" visual style (Print). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Archivo Black, Space Mono
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=block">
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
Name: Risograph Zine
Family: Print
Look: Three fluorescent spot inks (pink, medium blue, yellow) laid down as separate drum passes and multiplied on off-white stock — misregistered plates, grainy patchy solids, dotted tints and roller streaks.
Motion: The sheet goes through the drum three times — yellow, then pink, then blue roll down the page and slide into misregistration — then the print boils at 8 fps while the rocket creeps upward and its flame flickers in the screen.
How it explains: Scenes change by re-registering the plates — yellow, pink and blue slide off and the next scene's plates slide in one drum pass at a time — with dotted blue flow arrows, pink error arrows and scribbled circles, and counters set in big two-plate zine type.

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

REFERENCE STYLE SOURCE (styles/risograph.js; W/H_ are always 1280x720)
```js
{
  // ---------- Risograph: 3 spot-ink separations, multiplied onto stock ----------
  const INK = { pink: [255, 72, 176], blue: [50, 85, 164], yellow: [255, 226, 0] };
  const PAPER = [242, 237, 224];

  const hash = (x, y, s) => {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };

  // smooth low-frequency noise field (3 channels) via upscaled tiny canvas
  const lowField = (W, H_, seed, gw, gh, freq) => {
    const nz = H.makeNoise(seed), s = H.layer(gw, gh), sx = s.getContext('2d');
    const im = sx.createImageData(gw, gh), d = im.data;
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const i = (y * gw + x) * 4;
      d[i] = 128 + 127 * H.clamp(nz.fbm2(x * freq, y * freq, 3) * 1.6, -1, 1);
      d[i + 1] = 128 + 127 * H.clamp(nz.fbm2(x * freq + 40, y * freq + 9, 3) * 1.6, -1, 1);
      d[i + 2] = 128 + 127 * H.clamp(nz.fbm2(x * freq + 80, y * freq + 31, 3) * 1.6, -1, 1);
      d[i + 3] = 255;
    }
    sx.putImageData(im, 0, 0);
    const big = H.layer(W, H_), bx = big.getContext('2d');
    bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = 'high';
    bx.drawImage(s, 0, 0, W, H_);
    return bx.getImageData(0, 0, W, H_).data;
  };

  const sparkle = (x, cx, cy, r, rot) => {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      const b = a + Math.PI / 4;
      x.lineTo(Math.cos(b) * r * 0.2, Math.sin(b) * r * 0.2);
    }
    x.closePath(); x.fill(); x.restore();
  };

  // rocket geometry (local coords, nose up)
  const bodyPath = (x) => {
    x.beginPath(); x.moveTo(0, -200);
    x.bezierCurveTo(62, -150, 80, -60, 72, 40);
    x.lineTo(62, 130); x.lineTo(-62, 130); x.lineTo(-72, 40);
    x.bezierCurveTo(-80, -60, -62, -150, 0, -200); x.closePath();
  };
  const finL = (x) => { x.beginPath(); x.moveTo(-68, 20); x.quadraticCurveTo(-150, 90, -138, 188); x.quadraticCurveTo(-104, 150, -62, 132); x.closePath(); };
  const finR = (x) => { x.beginPath(); x.moveTo(68, 20); x.quadraticCurveTo(150, 90, 138, 188); x.quadraticCurveTo(104, 150, 62, 132); x.closePath(); };
  const finC = (x) => { x.beginPath(); x.moveTo(-9, 70); x.lineTo(9, 70); x.lineTo(7, 196); x.lineTo(-7, 196); x.closePath(); };
  const flame = (x, L, w) => {
    x.beginPath(); x.moveTo(-w, 150);
    x.bezierCurveTo(-w * 1.1, 150 + L * 0.35, -w * 0.3, 150 + L * 0.8, 0, 150 + L);
    x.bezierCurveTo(w * 0.3, 150 + L * 0.8, w * 1.1, 150 + L * 0.35, w, 150);
    x.closePath();
  };

  const clouds = [
    [560, 700, 70], [640, 668, 64], [720, 690, 82], [800, 650, 58], [690, 610, 46], [880, 690, 76], [960, 660, 66],
    [1040, 700, 80], [1120, 670, 70], [1200, 690, 80], [1270, 650, 62], [470, 712, 52], [760, 600, 38], [1000, 625, 40],
  ];
  const cloudPath = (x, grow) => {
    x.beginPath();
    for (const [cx, cy, r] of clouds) { x.moveTo(cx + r + grow, cy); x.arc(cx, cy, r + grow, 0, Math.PI * 2); }
  };

  // ------ draw one separation (black = ink, grey = tint) ------
  const sepDraw = (x, ink, t) => {
    const K = '#000', tint = (a) => `rgba(0,0,0,${a})`;
    const rx = 905 + (t - 4.6) * 10, ry = 300 - (t - 4.6) * 16, rot = 0.52;
    const flick = 1 + 0.08 * Math.sin(t * 23) + 0.05 * Math.sin(t * 37 + 1);

    // --- sun ---
    if (ink === 'yellow') { x.fillStyle = K; x.beginPath(); x.arc(935, 305, 248, 0, Math.PI * 2); x.fill(); }
    if (ink === 'pink') {
      x.save(); x.beginPath(); x.arc(935, 305, 248, 0, Math.PI * 2); x.clip();
      const g = x.createLinearGradient(0, 120, 0, 560);
      g.addColorStop(0, tint(0)); g.addColorStop(0.45, tint(0.12)); g.addColorStop(1, tint(0.78));
      x.fillStyle = g; x.fillRect(600, 40, 700, 560);
      // sunset bands knocked out
      x.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) { const yy = 420 + i * 30 + i * i * 2; x.fillRect(600, yy, 700, 4 + i * 2.2); }
      x.restore();
    }
    // ring planet
    if (ink === 'blue') {
      x.save(); x.translate(1150, 120); x.rotate(-0.35);
      x.lineWidth = 6; x.strokeStyle = K;
      x.beginPath(); x.ellipse(0, 0, 70, 16, 0, Math.PI, Math.PI * 2); x.stroke();
      x.fillStyle = tint(0.5); x.beginPath(); x.arc(0, 0, 38, 0, Math.PI * 2); x.fill();
      x.lineWidth = 6; x.beginPath(); x.ellipse(0, 0, 70, 16, 0, 0, Math.PI); x.stroke();
      x.restore();
    }

    // --- speed lines ---
    if (ink === 'pink') {
      x.save(); x.lineCap = 'round'; x.strokeStyle = K;
      const lines = [[-150, 30, 0.9], [-170, -60, 0.6], [140, 120, 0.7], [-125, 150, 0.45]];
      x.translate(rx, ry); x.rotate(rot);
      for (const [ox, oy, l] of lines) { x.lineWidth = 9; x.beginPath(); x.moveTo(ox, oy); x.lineTo(ox, oy + 220 * l); x.stroke(); }
      x.restore();
    }

    // --- rocket ---
    x.save(); x.translate(rx, ry); x.rotate(rot);
    if (ink === 'yellow') {
      // knock the sun out under the rocket (trap is thin so misregistration shows paper slivers)
      x.fillStyle = '#fff'; bodyPath(x); x.fill(); finL(x); x.fill(); finR(x); x.fill();
      x.fillRect(-52, 128, 104, 34);
      x.fillStyle = '#fff'; flame(x, 270 * flick + 14, 62); x.fill();
      x.fillStyle = K; flame(x, 270 * flick, 50); x.fill();
      x.beginPath(); x.arc(0, -40, 32, 0, Math.PI * 2); x.fill();
    }
    if (ink === 'pink') {
      x.fillStyle = K;
      finL(x); x.fill(); finR(x); x.fill(); finC(x); x.fill();
      x.save(); bodyPath(x); x.clip(); x.fillRect(-100, -260, 200, 140);
      x.restore();
      flame(x, 175 * flick, 28); x.fill();
      // window glint
      x.fillStyle = tint(0.6); x.beginPath(); x.arc(-8, -50, 14, 0, Math.PI * 2); x.fill();
    }
    if (ink === 'blue') {
      x.save(); bodyPath(x); x.clip();
      const g = x.createLinearGradient(-20, 0, 74, 0);
      g.addColorStop(0, tint(0)); g.addColorStop(0.5, tint(0.28)); g.addColorStop(1, tint(0.72));
      x.fillStyle = g; x.fillRect(-100, -260, 200, 400);
      x.fillStyle = K; x.fillRect(-100, 38, 200, 26);
      x.restore();
      // fins shading
      x.save(); finR(x); x.clip(); x.fillStyle = tint(0.45); x.fillRect(0, 0, 200, 220); x.restore();
      x.save(); finL(x); x.clip(); x.fillStyle = tint(0.12); x.fillRect(-200, 0, 200, 220); x.restore();
      // outline + details
      x.lineJoin = 'round'; x.lineWidth = 6; x.strokeStyle = K; bodyPath(x); x.stroke();
      x.lineWidth = 5; finL(x); x.stroke(); finR(x); x.stroke();
      x.lineWidth = 9; x.beginPath(); x.arc(0, -40, 36, 0, Math.PI * 2); x.stroke();
      x.fillStyle = K;
      x.beginPath(); x.moveTo(-44, 130); x.lineTo(44, 130); x.lineTo(54, 162); x.lineTo(-54, 162); x.closePath(); x.fill();
      for (let i = -3; i <= 3; i++) { x.fillStyle = '#fff'; x.beginPath(); x.arc(i * 17, 51, 3.2, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = K; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35; x.beginPath(); x.arc(Math.cos(a) * 52, -40 + Math.sin(a) * 52 + 4, 2.6, 0, 7); x.fill(); }
      // panel lines
      x.lineWidth = 3; x.beginPath(); x.moveTo(-74, -10); x.quadraticCurveTo(0, 6, 74, -10); x.stroke();
    }
    x.restore();

    // --- exhaust clouds ---
    if (ink === 'blue') {
      x.save();
      cloudPath(x, 0); x.lineWidth = 11; x.strokeStyle = K; x.stroke();
      x.fillStyle = '#fff'; cloudPath(x, 0); x.fill();
      cloudPath(x, 0); x.clip();
      const g = x.createLinearGradient(0, 590, 0, 720); g.addColorStop(0, tint(0)); g.addColorStop(1, tint(0.42));
      x.fillStyle = g; x.fillRect(400, 540, 900, 200);
      // puff contour strokes
      x.lineWidth = 5; x.lineCap = 'round';
      for (const [cx, cy, r] of clouds) { if (r < 60) continue; x.beginPath(); x.arc(cx + r * 0.1, cy + r * 0.15, r * 0.7, Math.PI * 1.05, Math.PI * 1.35); x.stroke(); }
      x.restore();
    }
    if (ink === 'pink') {
      x.save(); cloudPath(x, 0); x.clip();
      const g = x.createLinearGradient(0, 560, 0, 720); g.addColorStop(0, tint(0)); g.addColorStop(1, tint(0.5));
      x.fillStyle = g; x.fillRect(400, 540, 900, 200); x.restore();
    }
    if (ink === 'yellow') {
      // clouds knock out the sun below them
      x.fillStyle = '#fff'; cloudPath(x, 4); x.fill();
    }

    // --- sparkles & specks ---
    const r = H.rng(77);
    if (ink === 'yellow') {
      x.fillStyle = K;
      [[612, 96, 34, 0.1], [1220, 470, 26, 0.3], [560, 520, 20, 0.6], [1236, 236, 18, 0], [700, 200, 16, 0.2], [1080, 40, 22, 0.4]].forEach(([a, b, s, ro]) => sparkle(x, a, b, s * (1 + 0.15 * Math.sin(t * 5 + a)), ro));
    }
    if (ink === 'pink') {
      x.fillStyle = K;
      for (let i = 0; i < 22; i++) { const a = r.range(540, 1270), b = r.range(20, 540); x.beginPath(); x.arc(a, b, r.range(2.5, 5.5), 0, 7); x.fill(); }
    }
    if (ink === 'blue') {
      x.strokeStyle = K; x.lineWidth = 4; x.lineCap = 'round';
      [[1180, 330], [760, 70], [598, 330], [1250, 560]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a - 9, b); x.lineTo(a + 9, b); x.moveTo(a, b - 9); x.lineTo(a, b + 9); x.stroke(); });
    }

    // --- typography ---
    x.textBaseline = 'alphabetic';
    const L = 66;
    if (ink === 'yellow') { x.fillStyle = K; x.fillRect(L - 10, 64, 344, 40); }
    if (ink === 'blue') {
      x.fillStyle = K; x.font = '700 19px "Space Mono"'; x.letterSpacing = '2px';
      x.fillText('ZINE Nº07 · MACHINES', L, 91);
      x.letterSpacing = '0px';
    }
    const title = (dx, dy) => {
      x.font = '400 250px "Archivo Black"'; x.letterSpacing = '-10px'; x.fillText('AI', L - 10 + dx, 330 + dy);
      x.font = '400 112px "Archivo Black"'; x.letterSpacing = '-4px';
      x.fillText('TAKES', L - 4 + dx, 450 + dy); x.fillText('OFF!', L - 4 + dx, 562 + dy);
      x.letterSpacing = '0px';
    };
    if (ink === 'pink') { x.fillStyle = K; title(11, 9); }
    if (ink === 'blue') {
      x.fillStyle = K; title(0, 0);
      x.font = '400 17px "Space Mono"';
      ['a pocket field guide to the', 'machines that learn. print run', 'of 200 — read it, pass it on.'].forEach((s, i) => x.fillText(s, L, 616 + i * 25));
    }
    if (ink === 'pink') {
      x.lineWidth = 5; x.strokeStyle = K; x.beginPath(); x.moveTo(L, 590); x.lineTo(L + 380, 590); x.stroke();
    }
  };

  // ================= EXPLAINER: "How does AI learn?" printed as a riso zine =================
  const XE = H.ease, cl = H.clamp;
  const seg = (t, a, b) => cl((t - a) / (b - a));
  let RX_CACHE = null;
  const rxStatic = (W, H_) => {
    if (RX_CACHE) return RX_CACHE;
    const mott = lowField(W, H_, 5, 96, 54, 0.11), fine = lowField(W, H_, 9, 320, 180, 0.22);
    const streaks = [11, 22, 33].map((sd) => {
      const a = new Float32Array(W), nz = H.makeNoise(sd + 3), rr = H.rng(sd + 5), lines = [];
      for (let i = 0; i < 6; i++) lines.push([rr.range(0, W), rr.range(1, 4), rr.range(0.15, 0.35)]);
      for (let x = 0; x < W; x++) { let v = 1 - 0.1 * Math.abs(nz.fbm2(x * 0.012, 0.3, 3)) * 2 - 0.05 * (nz.n2(x * 0.09, 3.1) + 1); for (const [lx, lw, ls] of lines) v -= ls * Math.exp(-((x - lx) * (x - lx)) / (lw * lw)); a[x] = v; }
      return a;
    });
    return (RX_CACHE = { mott, fine, streaks });
  };

  // draw-on quadratic arrow (ink line), u = 0..1 progress
  const qpt = (p0, c, p1, s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * c[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * c[1] + s * s * p1[1]];
  const arrowQ = (x, p0, c, p1, u, w, dash) => {
    if (u <= 0) return;
    x.save(); x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; if (dash) x.setLineDash(dash);
    x.beginPath(); x.moveTo(p0[0], p0[1]);
    const N = 30; for (let i = 1; i <= N * u; i++) { const q = qpt(p0, c, p1, i / N); x.lineTo(q[0], q[1]); }
    const e = qpt(p0, c, p1, u); x.lineTo(e[0], e[1]); x.stroke(); x.setLineDash([]);
    const b = qpt(p0, c, p1, Math.max(0, u - 0.04)), a = Math.atan2(e[1] - b[1], e[0] - b[0]), hs = w * 3.2;
    x.beginPath(); x.moveTo(e[0] + Math.cos(a) * hs * 0.6, e[1] + Math.sin(a) * hs * 0.6);
    x.lineTo(e[0] + Math.cos(a + 2.5) * hs, e[1] + Math.sin(a + 2.5) * hs); x.lineTo(e[0] + Math.cos(a - 2.5) * hs, e[1] + Math.sin(a - 2.5) * hs); x.closePath(); x.fill();
    x.restore();
  };
  const T = (x, s, font, px, py, align = 'left', ls = 0) => { x.font = font; x.textAlign = align; x.letterSpacing = ls + 'px'; x.fillText(s, px, py); x.letterSpacing = '0px'; };

  // animal line drawings (blue plate) for cards
  const animal = (x, kind, s) => {
    x.lineWidth = Math.max(2.5, s * 0.045); x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.arc(0, 0, s * 0.3, 0, 7); x.stroke();
    if (kind === 'cat') {
      x.beginPath(); x.moveTo(-s * 0.26, -s * 0.12); x.lineTo(-s * 0.24, -s * 0.42); x.lineTo(-s * 0.06, -s * 0.28); x.moveTo(s * 0.26, -s * 0.12); x.lineTo(s * 0.24, -s * 0.42); x.lineTo(s * 0.06, -s * 0.28); x.stroke();
      x.beginPath(); for (const sg of [-1, 1]) for (const dy of [-0.02, 0.05]) { x.moveTo(sg * s * 0.1, s * 0.08); x.lineTo(sg * s * 0.42, s * (0.06 + dy)); } x.stroke();
    } else {
      for (const sg of [-1, 1]) { x.beginPath(); x.ellipse(sg * s * 0.3, s * 0.0, s * 0.09, s * 0.2, sg * 0.4, 0, 7); x.fill(); }
      x.beginPath(); x.ellipse(0, s * 0.12, s * 0.07, s * 0.05, 0, 0, 7); x.fill();
    }
    x.beginPath(); x.arc(-s * 0.1, -s * 0.04, s * 0.035, 0, 7); x.arc(s * 0.1, -s * 0.04, s * 0.035, 0, 7); x.fill();
  };
  // a labelled training card: yellow photo, blue drawing, pink tag
  const card = (x, ink, cx, cy, s, kind, label, rot) => {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = '#000'; x.strokeStyle = '#000';
    const w = s, h = s * 1.22;
    if (ink !== 'yellow') { x.fillStyle = '#fff'; x.fillRect(-w / 2, -h / 2, w, h); x.fillStyle = '#000'; }
    if (ink === 'yellow') { // tonal photo: lit from the top-left, so it screens from a light dot tint into a solid
      const g = x.createLinearGradient(-w / 2, -h / 2, w / 2, h * 0.2); g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(0.6, 'rgba(0,0,0,0.85)'); g.addColorStop(1, '#000');
      x.fillStyle = g; x.beginPath(); x.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.68, 4); x.fill(); x.fillStyle = '#000'; }
    if (ink === 'blue') {
      x.lineWidth = Math.max(2, s * 0.035); x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 6); x.stroke();
      x.save(); x.translate(0, -h * 0.13); animal(x, kind, s * 0.8); x.restore();
      if (label) T(x, label, `700 ${Math.round(s * 0.25)}px "Space Mono"`, 0, h * 0.42, 'center');
    }
    if (ink === 'pink' && label) { const g = x.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, 'rgba(0,0,0,0.8)'); g.addColorStop(1, 'rgba(0,0,0,0.3)'); x.fillStyle = g; x.fillRect(-w / 2 + 6, h * 0.24, w - 12, h * 0.22); }
    x.restore();
  };
  // the model: a chunky machine with a hopper, a screen and three knobs
  const machine = (x, ink, cx, cy, s, knobs, glow) => {
    x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineJoin = 'round';
    const body = () => { x.beginPath(); x.roundRect(-150, -110, 300, 230, 22); };
    const hopper = () => { x.beginPath(); x.moveTo(-110, -200); x.lineTo(110, -200); x.lineTo(46, -110); x.lineTo(-46, -110); x.closePath(); };
    if (ink === 'yellow') { // body shaded as a dot gradient (light top-left -> solid bottom-right), like the hero rocket
      const g = x.createLinearGradient(-150, -110, 150, 120); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(0.5, 'rgba(0,0,0,0.8)'); g.addColorStop(0.85, '#000');
      x.fillStyle = g; body(); x.fill(); x.fillStyle = '#fff'; x.fillRect(-112, -84, 224, 92); x.fillStyle = '#000'; if (glow) { x.globalAlpha = glow; x.fillRect(-112, -84, 224, 92); x.globalAlpha = 1; } }
    if (ink === 'pink') {
      { const g = x.createLinearGradient(0, -200, 0, -110); g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0.22)'); x.fillStyle = g; hopper(); x.fill(); }
      knobs.forEach((a, i) => { // domed knobs: a dotted highlight top-left, solid at the rim
        const kx = -90 + i * 90, g = x.createRadialGradient(kx - 9, 52, 2, kx, 62, 27); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.75, '#000');
        x.fillStyle = g; x.beginPath(); x.arc(kx, 62, 26, 0, 7); x.fill(); });
      x.fillStyle = '#000';
    }
    if (ink === 'blue') {
      x.lineWidth = 8; body(); x.stroke(); x.lineWidth = 6; hopper(); x.stroke();
      // the screen prints as a dotted blue tint with a paper-white glare streak
      { const g = x.createLinearGradient(0, -84, 0, 8); g.addColorStop(0, 'rgba(0,0,0,0.34)'); g.addColorStop(1, 'rgba(0,0,0,0.2)'); x.fillStyle = g; x.fillRect(-112, -84, 224, 92);
        x.fillStyle = '#fff'; x.beginPath(); x.moveTo(-70, -84); x.lineTo(-38, -84); x.lineTo(-84, 8); x.lineTo(-112, 8); x.lineTo(-112, 0); x.closePath(); x.fill(); x.fillStyle = '#000'; }
      x.lineWidth = 6; x.strokeRect(-112, -84, 224, 92);
      x.save(); body(); x.clip(); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(100, -120, 60, 260); x.restore();
      knobs.forEach((a, i) => {
        const kx = -90 + i * 90; x.lineWidth = 5; x.beginPath(); x.arc(kx, 62, 26, 0, 7); x.stroke();
        x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(kx, 62); x.lineTo(kx + Math.cos(a) * 20, 62 + Math.sin(a) * 20); x.stroke();
      });
      T(x, 'MODEL', '700 30px "Space Mono"', 0, 158, 'center', 4);
    }
    x.restore();
  };
  const bubble = (x, ink, cx, cy, w, h) => {
    const path = () => { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, 26); x.moveTo(cx - w * 0.3, cy + h / 2 - 2); x.lineTo(cx - w * 0.42, cy + h / 2 + 34); x.lineTo(cx - w * 0.12, cy + h / 2 - 2); };
    if (ink === 'pink') { x.fillStyle = '#fff'; path(); x.fill(); x.fillStyle = '#000'; }
    if (ink === 'yellow') { const g = x.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2); g.addColorStop(0, 'rgba(0,0,0,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; path(); x.fill(); x.fillStyle = '#000'; }
    if (ink === 'blue') { x.fillStyle = '#fff'; path(); x.fill(); x.fillStyle = '#000'; x.lineWidth = 7; x.lineJoin = 'round'; path(); x.stroke(); }
  };
  const scribbleCircle = (x, cx, cy, rx, ry, u, w) => {
    if (u <= 0) return;
    x.save(); x.lineWidth = w; x.lineCap = 'round'; x.beginPath();
    const N = 60, turns = 1.15;
    for (let i = 0; i <= N * u; i++) { const a = -2.2 + (i / N) * turns * Math.PI * 2, rr = 1 + 0.06 * Math.sin(i * 0.5); const px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr; i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke(); x.restore();
  };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // flowing card stream path for the DATA beat
  const P0 = [130, 460], PC = [430, 120], P1 = [905, 205];

  const exScene = (x, ink, sc, t) => {
    x.fillStyle = '#000'; x.strokeStyle = '#000';
    if (sc === 0) {
      // --- machine + card stream + counter ---
      const mIn = XE.back(seg(t, 2.2, 2.8));
      if (t > 2.2) machine(x, ink, 1010, 400 + (1 - mIn) * 400, 1.15, [-2.4 + t * 0.5, -0.8, 0.6 - t * 0.3], 0);
      if (ink === 'blue') arrowQ(x, P0, PC, P1, XE.inOut(seg(t, 2.5, 3.1)), 9, [2, 18]);
      // cards: spawn faster and faster
      for (let i = 0, t0 = 2.85; i < 22; i++, t0 += Math.max(0.13, 0.36 - i * 0.02)) {
        const u = seg(t, t0, t0 + 1.25); if (u <= 0 || u >= 1) continue;
        const e = 1 - Math.pow(1 - u, 1.6), q = qpt(P0, PC, P1, e), kind = i % 3 === 1 ? 'dog' : 'cat';
        card(x, ink, q[0], q[1] - 40, 150 * (1 - e * 0.6), kind, kind, Math.sin(i * 2.1) * 0.15 + e * 0.3);
      }
      // counter
      if (t > 2.6) {
        const n = 1e6 * Math.pow(seg(t, 2.7, 5.4), 2.2);
        if (ink === 'blue' || ink === 'pink') { const o = ink === 'pink' ? 5 : 0; T(x, fmt(n), '400 78px "Archivo Black"', 70 + o, 650 + o, 'left', -2); }
        if (ink === 'blue') T(x, 'EXAMPLES SEEN', '700 28px "Space Mono"', 74, 573, 'left', 3);
        if (ink === 'yellow') { const w = 520 * XE.out(seg(t, 2.6, 3.0)); x.fillRect(60, 548, w, 30); }
        if (ink === 'pink' && t > 5.4) { x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); const u = XE.out(seg(t, 5.4, 5.75)); x.moveTo(70, 676); x.lineTo(70 + 470 * u, 672 + 4 * u); x.stroke(); }
      }
      // hook title travels from centre to header
      if (t < 2.4) {
        const u = XE.inOut(seg(t, 1.5, 2.35)), s = H.lerp(1, 0.3, u), cx = H.lerp(640, 64, u), cy = H.lerp(330, 62, u);
        const al = H.lerp(0.5, 0, u); // anchor: centre -> left
        x.save(); x.translate(cx, cy); x.scale(s, s);
        x.textAlign = 'left';
        x.font = '400 128px "Archivo Black"'; x.letterSpacing = '-4px';
        const w1 = x.measureText('How does').width, w2 = x.measureText('AI learn?').width, wm = Math.max(w1, w2);
        const ox = -wm * al;
        const o = ink === 'pink' ? 9 : 0;
        if (ink === 'blue' || ink === 'pink') { x.fillText('How does', ox + o, -10 + o); x.fillText('AI learn?', ox + o, 120 + o); }
        if (ink === 'yellow') { x.beginPath(); x.arc(ox + wm * 0.82, -60, 120 * (1 - u), 0, 7); x.fill(); }
        x.letterSpacing = '0px'; x.restore();
      }
    }
    if (sc === 1) {
      const lt = t;
      // new photo, no label yet
      const cIn = XE.back(seg(lt, 6.2, 6.6));
      if (cIn > 0) card(x, ink, 190, 380 - (1 - cIn) * 60, 190, 'cat', '?', -0.05);
      const kn = [-2.4 + 6 * 0.5, -0.8, 0.6 - 6 * 0.3];
      const adj = XE.inOut(seg(lt, 8.5, 9.2));
      machine(x, ink, 600, 400, 0.88, [kn[0] + adj * 1.6, kn[1] - adj * 1.2, kn[2] + adj * 2.1], ink === 'yellow' ? 0 : 0);
      // GUESS arrow
      if (ink === 'blue') { arrowQ(x, [300, 300], [420, 230], [500, 285], XE.out(seg(lt, 6.55, 7.0)), 8); if (lt > 6.8) T(x, 'GUESS', '400 30px "Archivo Black"', 400, 228, 'center'); }
      if (ink === 'blue') arrowQ(x, [740, 300], [800, 230], [860, 250], XE.out(seg(lt, 7.0, 7.3)), 8);
      // output bubble: dog? -> cat
      const bIn = XE.back(seg(lt, 7.15, 7.45));
      if (bIn > 0) {
        x.save(); x.translate(1030, 250); x.scale(bIn, bIn); x.translate(-1030, -250);
        bubble(x, ink, 1030, 250, 250, 120);
        const right = lt > 9.4;
        if (ink === 'blue') T(x, right ? 'cat' : 'dog?', '400 64px "Archivo Black"', 1030, 274, 'center');
        x.restore();
      }
      // CHECK: big pink X + circle on the wrong guess
      if (lt > 7.75 && lt < 9.4) {
        const u = XE.out(seg(lt, 7.75, 7.95));
        if (ink === 'pink') { x.save(); x.lineWidth = 16; x.lineCap = 'round'; x.translate(1150, 170); x.scale(u, u); x.beginPath(); x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); x.stroke(); x.restore(); }
        if (ink === 'pink') scribbleCircle(x, 1030, 250, 160, 92, seg(lt, 7.8, 8.2), 7);
        if (ink === 'blue' && lt > 7.9) { T(x, 'CHECK', '400 30px "Archivo Black"', 1030, 120, 'center'); T(x, "it's a cat!", '700 28px "Space Mono"', 1030, 404, 'center'); }
      }
      // ADJUST: error travels back along the bottom to the knobs
      if (ink === 'pink') arrowQ(x, [1010, 420], [900, 620], [700, 495], XE.inOut(seg(lt, 8.05, 8.55)), 9, [18, 14]);
      if (lt > 8.2 && ink === 'blue') T(x, 'ADJUST', '400 30px "Archivo Black"', 880, 620, 'center');
      // error pulse dot riding the return arrow
      if (ink === 'pink' && lt > 8.05 && lt < 8.75) { const q = qpt([1010, 420], [900, 620], [700, 495], XE.inOut(seg(lt, 8.05, 8.75))); x.beginPath(); x.arc(q[0], q[1], 16, 0, 7); x.fill(); }
      if (ink === 'yellow' && lt > 8.5 && lt < 9.4) for (let i = 0; i < 3; i++) sparkle(x, 600 - 79 + i * 79 + 30, 455 - 30, 16 * (1 + 0.3 * Math.sin(lt * 20 + i)), lt);
      // CORRECT: tick
      if (lt > 9.4) {
        const u = XE.back(seg(lt, 9.4, 9.65));
        if (ink === 'yellow') { x.beginPath(); x.arc(1160, 170, 44 * u, 0, 7); x.fill(); }
        if (ink === 'blue') { x.save(); x.translate(1160, 170); x.scale(u, u); x.lineWidth = 12; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(-22, 2); x.lineTo(-6, 18); x.lineTo(24, -18); x.stroke(); x.restore(); }
        if (ink === 'blue') T(x, 'CHECK', '400 30px "Archivo Black"', 1030, 120, 'center');
      }
      // the loop keeps running: little dots circulating guess -> check -> adjust
      if (lt > 9.6 && ink === 'pink') for (let i = 0; i < 6; i++) { const u = ((lt - 9.6) * 0.9 + i / 6) % 1; const q = qpt([1010, 420], [900, 620], [700, 495], u); x.beginPath(); x.arc(q[0], q[1], 7, 0, 7); x.fill(); }
    }
    if (sc === 2) {
      const lt = t - 10.6;
      // chart frame
      const X0 = 90, Y0 = 560, CW = 640, CHh = 360;
      if (ink === 'blue') {
        x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(X0, Y0 - CHh - 10); x.lineTo(X0, Y0); x.lineTo(X0 + CW + 10, Y0); x.stroke();
        T(x, 'TRAINING ROUNDS', '700 28px "Space Mono"', X0 + CW - 48, Y0 + 40, 'right', 1);
        arrowQ(x, [X0 + CW - 38, Y0 + 30], [X0 + CW - 18, Y0 + 30], [X0 + CW + 4, Y0 + 30], 1, 6);
        x.font = '700 24px "Space Mono"'; for (let i = 0; i <= 4; i++) { x.textAlign = 'right'; x.fillText(`${50 + i * 12.5 | 0}`, X0 - 12, Y0 - i * CHh / 4 + 8); }
      }
      const prog = XE.inOut(seg(lt, 0.35, 2.1));
      const acc = (u) => 61 + 36 * (1 - Math.exp(-u * 3.2)) / (1 - Math.exp(-3.2)) + Math.sin(u * 40) * 2.2 * (1 - u);
      const yv = (v) => Y0 - ((v - 50) / 50) * CHh;
      const pts = []; for (let i = 0; i <= 80 * prog; i++) { const u = i / 80; pts.push([X0 + u * CW, yv(acc(u))]); }
      if (pts.length > 1) {
        if (ink === 'blue') { x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.moveTo(X0, Y0); pts.forEach((p) => x.lineTo(p[0], p[1])); x.lineTo(pts[pts.length - 1][0], Y0); x.closePath(); x.fill(); x.fillStyle = '#000'; }
        if (ink === 'pink') { x.lineWidth = 10; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); const e = pts[pts.length - 1]; x.beginPath(); x.arc(e[0], e[1], 14, 0, 7); x.fill(); }
      }
      // big counter
      const v = Math.round(61 + 36 * prog);
      if (ink === 'blue') T(x, 'ACCURACY', '700 28px "Space Mono"', 990, 222, 'center', 6);
      if (ink === 'pink') T(x, v + '%', '400 150px "Archivo Black"', 990, 400, 'center', -6);
      if (ink === 'blue') { x.font = '400 150px "Archivo Black"'; x.textAlign = 'center'; x.letterSpacing = '-6px'; x.lineWidth = 3; x.lineJoin = 'round'; x.strokeText(v + '%', 990, 400); x.letterSpacing = '0px'; }
      if (ink === 'yellow') { // the sun-disc behind the number: solid core screening out to a dotted rim
        const g = x.createRadialGradient(970, 325, 10, 990, 345, 152); g.addColorStop(0, '#000'); g.addColorStop(0.62, '#000'); g.addColorStop(0.8, 'rgba(0,0,0,0.8)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
        x.fillStyle = g; x.beginPath(); x.arc(990, 345, 150, 0, 7); x.fill(); x.fillStyle = '#000'; }
      if (ink === 'pink') scribbleCircle(x, 990, 345, 190, 110, seg(lt, 2.1, 2.5), 8);
      if (ink === 'yellow' && lt > 2.2) [[810, 210], [1170, 230], [1180, 470]].forEach(([a, b], i) => sparkle(x, a, b, 24 * XE.back(seg(lt, 2.2 + i * 0.08, 2.5 + i * 0.08)), 0.3));
      // takeaway band prints across the bottom
      const tw = seg(t, 12.85, 13.25);
      if (tw > 0) {
        if (ink === 'yellow') { x.fillRect(0, 600, W_ * XE.out(tw), 100); }
        if (ink === 'blue' || ink === 'yellow' || ink === 'pink') { if (ink !== 'yellow') { x.fillStyle = '#fff'; x.fillRect(0, 600, W_ * XE.out(tw), 100); x.fillStyle = '#000'; } }
        if (ink === 'blue' && t > 13.0) {
          x.font = '400 46px "Archivo Black"'; x.letterSpacing = '-1px';
          const a = 'More examples', b = 'better guesses', wa = x.measureText(a).width, wb = x.measureText(b).width, gap = 90, tot = wa + gap + wb, sx = 640 - tot / 2;
          x.textAlign = 'left'; x.fillText(a, sx, 666); x.fillText(b, sx + wa + gap, 666); x.letterSpacing = '0px';
          arrowQ(x, [sx + wa + 16, 650], [sx + wa + 45, 646], [sx + wa + gap - 20, 650], XE.out(seg(t, 13.1, 13.4)), 7);
        }
      }
    }
  };
  const W_ = 1280;

  const explainerFn = (ctx, W, H_, t) => {
    const st = rxStatic(W, H_);
    const step = Math.floor(t * 8), jr = H.rng(2000 + step);
    const TR = [6.0, 10.6];
    const base = [
      { k: 'yellow', ink: INK.yellow, dx: -5, dy: 6, ang: 0.26, cell: 5.2 },
      { k: 'pink', ink: INK.pink, dx: 6, dy: -3, ang: 1.31, cell: 5.2 },
      { k: 'blue', ink: INK.blue, dx: 0, dy: 0, ang: 0.79, cell: 5.2 },
    ];
    const seps = base.map((p, k) => {
      // plate re-registration: each drum pass slides the old scene off and the new one in, one ink at a time
      let sc = 0, off = 0;
      for (let j = 0; j < TR.length; j++) {
        const s0 = TR[j] - 0.3 + k * 0.11;
        if (t >= s0) { const u = cl((t - s0) / 0.6); if (u < 0.5) { sc = j; off = -XE.in(u * 2) * 1450; } else { sc = j + 1; off = (1 - XE.out((u - 0.5) * 2)) * 1450; } }
      }
      const intro = 1 - XE.out(seg(t, k * 0.18, k * 0.18 + 0.55));
      p.reveal = t < 1.2 ? seg(t, k * 0.18, k * 0.18 + 0.55) * (H_ + 60) - 30 : 1e9;
      const c = H.layer(W, H_), x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H_);
      x.save();
      x.translate(p.dx + jr.range(-1, 1) * (k < 2) + off, p.dy + jr.range(-1, 1) * (k < 2) - intro * 40);
      if (sc === 1) { x.translate(650, 400); x.scale(1.1, 1.1); x.translate(-650, -400); }
      exScene(x, p.k, sc, t);
      x.restore();
      // running header (stays put while scenes swap underneath)
      if (t >= 2.35) {
        x.save(); x.translate(p.dx, p.dy); x.fillStyle = '#000';
        if (p.k === 'blue') { x.font = '400 38px "Archivo Black"'; x.letterSpacing = '-1px'; x.fillText('How does AI learn?', 64, 62); x.letterSpacing = '0px'; }
        if (p.k === 'pink') { x.fillRect(64, 76, 380, 6); }
        x.restore();
      }
      return x.getImageData(0, 0, W, H_).data;
    });
    const { mott, fine, streaks } = st;
    const out = ctx.createImageData(W, H_), o = out.data;
    const cs = base.map((p) => Math.cos(p.ang)), sn = base.map((p) => Math.sin(p.ang));
    for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const pf = (fine[i] - 128) / 128, pg = hash(x, y, 7) - 0.5;
      let r = PAPER[0] * (1 + pf * 0.018 + pg * 0.035), g = PAPER[1] * (1 + pf * 0.018 + pg * 0.035), b = PAPER[2] * (1 + pf * 0.022 + pg * 0.04);
      for (let k = 0; k < 3; k++) {
        const d = 1 - seps[k][i] / 255; if (d < 0.01) continue;
        const p = base[k];
        let edgeF = 1;
        if (p.reveal < 1e8) { const ed = p.reveal + Math.sin(x * 0.031 + k * 2) * 5 - y; if (ed < 0) continue; if (ed < 18) edgeF = ed / 18; }
        let cov;
        if (d > 0.96) cov = 1;
        else {
          const u = (x * cs[k] + y * sn[k]) * (6.2832 / p.cell), v = (-x * sn[k] + y * cs[k]) * (6.2832 / p.cell);
          const thr = (0.5 + 0.25 * (Math.cos(u) + Math.cos(v))) * 0.72 + hash(x, y, 50 + k) * 0.28;
          cov = cl((d * 1.05 - thr) * 5 + 0.5);
        }
        if (cov <= 0) continue;
        const m = (k === 0 ? mott[i + 2] - 128 : k === 1 ? mott[i] - 128 : mott[i + 1] - 128) / 128;
        let dens = 0.88 + m * 0.15 + ((fine[i + k] - 128) / 128) * 0.07 + (hash(x, y, 90 + k + step * 7) - 0.5) * 0.16;
        dens *= streaks[k][x];
        if (hash(x, y, 120 + k) < 0.012 + Math.max(0, -m) * 0.04) dens *= 0.35;
        cov *= cl(dens) * edgeF;
        r *= 1 - cov * (1 - p.ink[0] / 255); g *= 1 - cov * (1 - p.ink[1] / 255); b *= 1 - cov * (1 - p.ink[2] / 255);
      }
      o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  };

  registerStyle({
    id: 'risograph',
    name: 'Risograph Zine',
    category: 'Print',
    description: 'Three fluorescent spot inks (pink, medium blue, yellow) laid down as separate drum passes and multiplied on off-white stock — misregistered plates, grainy patchy solids, dotted tints and roller streaks.',
    motion: 'The sheet goes through the drum three times — yellow, then pink, then blue roll down the page and slide into misregistration — then the print boils at 8 fps while the rocket creeps upward and its flame flickers in the screen.',
    fonts: ['400 250px "Archivo Black"', '700 19px "Space Mono"', '400 17px "Space Mono"'],
    duration: 5,
    frameT: 4.6,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'Scenes change by re-registering the plates — yellow, pink and blue slide off and the next scene\'s plates slide in one drum pass at a time — with dotted blue flow arrows, pink error arrows and scribbled circles, and counters set in big two-plate zine type.',
    explainer(ctx, W, H_, t) { explainerFn(ctx, W, H_, t); },
    // Sound: a riso duplicator. Drum passes = roller + paper feed + one registration clack per plate,
    // dotted arrows tick dot by dot, stamps for the X / tick / 97%, quiet machine hum and room under it.
    // Timings mirror explainerFn/exScene above (TR, plate offsets k*0.11, seg() windows).
    // Voiceover mode (k.vo): beds drop out and everything flagged minor (or inside k.withMinor) plays quieter, so the
    // plate clacks, the title press, 1,000,000 stamp, the X, the correction, the 97% hit and the closing chord lead.
    explainerSound(k) {
      const D = 15, TR = [6.0, 10.6];
      const pan = (px) => H.clamp((px / 1280) * 2 - 1, -1, 1) * 0.7;
      // first time an eased progress over [t0,t1] reaches u
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // dotted / dashed arrow: one ink dot per step, following the arrow's ease, panned along it
      // ink dab: one dot of the dotted/dashed arrows (a short damped tap with a little body)
      const dab = (t, f, g, p) => { k.withMinor(() => { k.noise(t, { dur: 0.03, filter: 'bandpass', f, q: 1.1, gain: 0.32 * g, a: 0.001, pan: p }); k.tone(t, { f: f * 0.14, dur: 0.035, gain: 0.1 * g, pan: p }); }); };
      // numbering machine: the counter digits advance with a small metal clack
      const numb = (t, f, g, p) => { k.withMinor(() => { k.noise(t, { dur: 0.025, filter: 'bandpass', f, q: 1.5, gain: 0.34 * g, a: 0.001, pan: p }); k.tone(t, { f: f * 0.22, type: 'triangle', dur: 0.03, gain: 0.08 * g, pan: p }); }); };
      const dots = (t0, t1, ease, n, f, g, pa, pb) => { for (let i = 1; i <= n; i++) dab(when(t0, t1, ease, i / n), f, g, pa + (pb - pa) * (i / n)); };
      // a drum pass: roller under the slide, sheet feed, then a registration clack as each plate lands (Y, P, B)
      const drum = (s0, lands, g) => {
        k.play('roller', s0, { dur: lands[2] - s0 + 0.04, gain: 0.45 * g, minor: true });
        k.play('paper', s0, { dur: 0.3, gain: 0.3 * g, minor: true });
        lands.forEach((tl, i) => k.play('tock', tl, { f: [470, 590, 700][i], gain: 0.6 * g, pan: [-0.2, 0.2, 0][i] }));
      };

      k.bed('room', 0, D, { gain: 0.2 });
      k.bed('hum', 0, D, { gain: 0.12 }); // the duplicator idling

      // ---- intro: yellow, pink, blue roll down the sheet (reveal k*0.18 .. +0.55), title prints
      k.play('roller', 0.0, { dur: 0.92, gain: 0.5, minor: true });
      k.play('paper', 0.0, { dur: 0.3, gain: 0.35, minor: true });
      k.play('tock', 0.55, { f: 470, gain: 0.5, pan: -0.2, minor: true });
      k.play('tock', 0.73, { f: 590, gain: 0.5, pan: 0.2, minor: true });
      k.play('press', 0.91, { gain: 0.38 }); // last plate down: "How does AI learn?" is complete
      // title shrinks into the running header (1.5 -> 2.35)
      k.noise(1.5, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 450], [0.5, 1300]], q: 0.7, gain: 0.1, a: 0.18, minor: true }); // title slides to the corner: a soft sheet slide

      // ---- scene 0: DATA
      k.play('press', when(2.2, 2.8, XE.back, 1), { gain: 0.38, pan: pan(1010), minor: true }); // machine rises in
      dots(2.5, 3.1, XE.inOut, 8, 2600, 0.9, pan(130), pan(905)); // dotted card stream arrow
      k.play('roller', 2.6, { dur: 0.4, gain: 0.5, pan: pan(320), minor: true }); // yellow bar under the counter
      // cards drop onto the stream, faster and faster (same spawn schedule as exScene)
      for (let i = 0, t0 = 2.85; t0 < 5.4; i++, t0 += Math.max(0.13, 0.36 - i * 0.02))
        k.noise(t0, { dur: 0.05, filter: 'bandpass', f: 2000 + (i % 3) * 300, q: 0.8, gain: 0.2, pan: pan(130), minor: true });
      // EXAMPLES SEEN counter (n = 1e6 * seg(2.7, 5.4)^2.2): throttled ticks speeding up with the count
      for (let t = 2.78; t < 5.34; ) { const s = seg(t, 2.7, 5.4); numb(t, 3800, 0.8 + 0.3 * s, pan(250)); t += 0.17 - 0.087 * s; }
      k.play('stamp', 5.4, { gain: 0.7, pan: pan(250) }); // 1,000,000 lands
      k.play('stroke', 5.42, { material: 'marker', dur: 0.32, gain: 0.45, pan: pan(300), minor: true }); // pink underline

      // ---- drum pass 1 -> scene 1 (plates leave at TR-0.3+k*0.11, land 0.6 later)
      drum(TR[0] - 0.3, [0, 1, 2].map((p) => TR[0] + 0.3 + p * 0.11), 1);

      // ---- scene 1: GUESS / CHECK / ADJUST
      k.play('stroke', 6.55, { material: 'brush', dur: 0.32, gain: 1, pan: pan(400), minor: true }); // GUESS arrow
      k.play('tock', 6.8, { f: 820, gain: 0.35, pan: pan(400), minor: true }); // GUESS label
      k.play('stroke', 7.0, { material: 'brush', dur: 0.22, gain: 0.6, pan: pan(800), minor: true });
      k.play('pop', when(7.15, 7.45, XE.back, 1), { f: 520, gain: 0.8, pan: pan(1030), minor: true }); // "dog?" bubble
      k.play('stamp', 7.76, { gain: 0.65, pan: pan(1150) }); // big pink X
      k.play('error', 7.76, { f: 'A3', gain: 0.7, pan: pan(1100) });
      k.play('stroke', 7.82, { material: 'sharpie', dur: 0.38, gain: 0.7, pan: pan(1030), minor: true }); // scribbled circle
      dots(8.05, 8.55, XE.inOut, 7, 1700, 0.95, pan(1010), pan(700)); // dashed error arrow back to the knobs
      for (let i = 1; i <= 6; i++) k.play('click', when(8.5, 9.2, XE.inOut, i / 6), { f: 1300 + i * 60, gain: 1.2, pan: pan(600), minor: true }); // knobs turn
      k.play('stamp', 9.42, { gain: 0.5, pan: pan(1160), minor: true }); // tick printed, bubble reads "cat"
      k.play('success', 9.42, { f: 'C6', gain: 0.8, pan: pan(1100) });

      // ---- drum pass 2 -> scene 2
      drum(TR[1] - 0.3, [0, 1, 2].map((p) => TR[1] + 0.3 + p * 0.11), 1);

      // ---- scene 2: ACCURACY
      const c0 = TR[1] + 0.35, c1 = TR[1] + 2.1;
      k.play('stroke', c0, { material: 'brush', dur: c1 - c0, gain: 0.4, pan: pan(400), minor: true }); // pink line inks along
      for (let t = c0, last = 61, lastT = -1; t < c1 + 0.05; t += 1 / 120) {
        const v = Math.round(61 + 36 * XE.inOut(seg(t, c0, c1)));
        if (v !== last && t - lastT >= 1 / 12) { numb(t, 3200 + (v - 61) * 50, 1, pan(990)); last = v; lastT = t; }
      }
      k.play('impact', c1, { gain: 1.25, pan: pan(990) }); // 97% circled: the big hit
      // takeaway band prints across the bottom, arrow inks, then it resolves
      k.play('roller', 12.85, { dur: 0.42, gain: 0.55, minor: true });
      k.play('press', 13.0, { gain: 0.35, minor: true });
      k.play('stroke', 13.1, { material: 'brush', dur: 0.25, gain: 0.7, minor: true });
      ['C5', 'G5', 'E6'].forEach((f, i) => k.play('ding', 13.4 + i * 0.07, { f, gain: 0.42 - i * 0.07, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const step = Math.floor(t * 8); // registration "boils" a little per printed frame
      const jr = H.rng(1000 + step);
      const plates = [
        { k: 'yellow', ink: INK.yellow, dx: -5 + jr.range(-1, 1), dy: 6 + jr.range(-1, 1), rot: -0.002, ang: 0.26, cell: 5.2, seed: 11 },
        { k: 'pink', ink: INK.pink, dx: 6 + jr.range(-1, 1), dy: -3 + jr.range(-1, 1), rot: 0.003, ang: 1.31, cell: 5.2, seed: 22 },
        { k: 'blue', ink: INK.blue, dx: 0, dy: 0, rot: 0, ang: 0.79, cell: 5.2, seed: 33 },
      ];
      // each plate prints in turn: the sheet feeds top->bottom while the plate slides into its (mis)registration
      const STARTS = [0.2, 1.0, 1.8], PASS = 0.8;
      plates.forEach((p, k) => {
        const u = H.clamp((t - STARTS[k]) / PASS);
        p.prog = u; p.reveal = u * (H_ + 60) - 30;
        const sl = 1 - H.ease.out(H.clamp((t - STARTS[k]) / 0.6));
        p.dx += sl * [-16, 22, -10][k]; p.dy += sl * -46;
      });
      const seps = plates.map((p) => {
        if (p.prog <= 0) return null;
        const c = H.layer(W, H_), x = c.getContext('2d', { willReadFrequently: true });
        x.fillStyle = '#fff'; x.fillRect(0, 0, W, H_);
        x.translate(W / 2 + p.dx, H_ / 2 + p.dy); x.rotate(p.rot); x.translate(-W / 2, -H_ / 2);
        sepDraw(x, p.k, t);
        return x.getImageData(0, 0, W, H_).data;
      });
      const mott = lowField(W, H_, 5, 96, 54, 0.11);
      const fine = lowField(W, H_, 9, 320, 180, 0.22);

      // per-plate column streaks from the drum (paper feeds top->bottom)
      const streaks = plates.map((p, k) => {
        const a = new Float32Array(W), nz = H.makeNoise(p.seed + 3), rr = H.rng(p.seed + 5);
        const lines = []; for (let i = 0; i < 6; i++) lines.push([rr.range(0, W), rr.range(1, 4), rr.range(0.15, 0.35)]);
        for (let x = 0; x < W; x++) {
          let v = 1 - 0.1 * Math.abs(nz.fbm2(x * 0.012, 0.3, 3)) * 2 - 0.05 * (nz.n2(x * 0.09, 3.1) + 1);
          for (const [lx, lw, ls] of lines) v -= ls * Math.exp(-((x - lx) * (x - lx)) / (lw * lw));
          a[x] = v;
        }
        return a;
      });

      const out = ctx.getImageData(0, 0, W, H_), o = out.data;
      const cs = plates.map((p) => Math.cos(p.ang)), sn = plates.map((p) => Math.sin(p.ang));
      for (let y = 0; y < H_; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const pf = (fine[i] - 128) / 128, pm = (mott[i] - 128) / 128;
          const pg = hash(x, y, 7) - 0.5;
          let r = PAPER[0] * (1 + pf * 0.018 + pg * 0.035), g = PAPER[1] * (1 + pf * 0.018 + pg * 0.035), b = PAPER[2] * (1 + pf * 0.022 + pg * 0.04);
          // paper fibre flecks
          if (hash(x >> 1, y, 3) > 0.9985) { r *= 0.9; g *= 0.9; b *= 0.88; }
          for (let k = 0; k < 3; k++) {
            if (!seps[k]) continue;
            let edgeF = 1;
            if (plates[k].prog < 1) {
              const ed = plates[k].reveal + Math.sin(x * 0.031 + k * 2) * 5 + Math.sin(x * 0.11 + k) * 2 - y;
              if (ed < 0) continue;
              if (ed < 18) edgeF = (ed / 18) * (0.6 + 0.4 * hash(x, y, 300 + k));
            }
            const d = 1 - seps[k][i] / 255;
            if (d < 0.01) continue;
            const p = plates[k];
            let cov;
            if (d > 0.96) cov = 1;
            else {
              const u = (x * cs[k] + y * sn[k]) * (6.2832 / p.cell), v = (-x * sn[k] + y * cs[k]) * (6.2832 / p.cell);
              const scr = 0.5 + 0.25 * (Math.cos(u) + Math.cos(v));
              const thr = scr * 0.72 + hash(x, y, 50 + k) * 0.28;
              cov = H.clamp((d * 1.05 - thr) * 5 + 0.5);
            }
            if (cov <= 0) continue;
            // grainy, patchy ink transfer
            const m = (k === 0 ? (mott[i + 2] - 128) : k === 1 ? (mott[i] - 128) : (mott[i + 1] - 128)) / 128;
            const fn = (fine[i + k] - 128) / 128;
            let dens = 0.88 + m * 0.15 + fn * 0.07 + (hash(x, y, 90 + k + step * 7) - 0.5) * 0.16;
            dens *= streaks[k][x];
            dens -= Math.max(0, (y / H_ - 0.55)) * 0.12 * (k === 2 ? 1 : 0.6); // ink starves toward tail of sheet
            if (hash(x, y, 120 + k) < 0.012 + Math.max(0, -m) * 0.04) dens *= 0.35; // pinholes
            cov *= H.clamp(dens) * edgeF;
            const ik = p.ink;
            r *= 1 - cov * (1 - ik[0] / 255);
            g *= 1 - cov * (1 - ik[1] / 255);
            b *= 1 - cov * (1 - ik[2] / 255);
          }
          o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      // a trace of drum toner haze along the leading edge
      const gr = ctx.createLinearGradient(0, 0, 0, 30);
      gr.addColorStop(0, 'rgba(50,85,164,0.06)'); gr.addColorStop(1, 'rgba(50,85,164,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, 30);
    },
  });
}
```
