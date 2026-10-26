I want an animated explainer made in the "Silkscreen Grid" visual style (Print). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Anton
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&display=block">
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
Name: Silkscreen Grid
Family: Print
Look: A Warhol-style repeat portrait: the same robot pulled eight times through a grainy black photo screen over loose, hand-cut flat colour plates in garish combinations, each pull misregistered and streaked by the squeegee.
Motion: Panels are printed one after another across the grid — background flood, then the loose colour shapes slap down, then the squeegee drags the black photo screen across with a wet ink bead — before a slow push-in on the finished wall.
How it explains: Each beat is its own silkscreened panel, pulled in order (flood, loose colour shapes, squeegee drags the black screen) while the camera travels the grid; black arrows are painted across the gutters between panels, counters are stencil type, emphasis is a colourway flicker, and the final pull-back reveals all six beats as one Warhol grid.

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

REFERENCE STYLE SOURCE (styles/screenprint-grid.js; W/H_ are always 1280x720)
```js
{
  // ---------- Warhol-style silkscreen grid: flat hand-cut colour plates + misregistered black photo screen ----------
  const PW = 300, PH = 331, M = 24, G = 10, COLS = 4, ROWS = 2;
  const CANVAS = [236, 230, 218];
  const PAL = [
    { bg: '#f2559c', head: '#ffe14a', eye: '#22c3c8', mouth: '#e8242b', body: '#2b4fc3', tip: '#ff8a00' },
    { bg: '#ff7a1f', head: '#9fdcff', eye: '#ffe600', mouth: '#e5007e', body: '#5b2a86', tip: '#2ad46b' },
    { bg: '#2fbf63', head: '#ffa3cf', eye: '#1d3fbb', mouth: '#ff5a1f', body: '#fff04a', tip: '#e5007e' },
    { bg: '#1e2b9c', head: '#ff6fae', eye: '#c8f53a', mouth: '#ffcf00', body: '#ff5a1f', tip: '#22c3c8' },
    { bg: '#ffe100', head: '#ff6f3c', eye: '#2b4fc3', mouth: '#b8007a', body: '#22c3c8', tip: '#e8242b' },
    { bg: '#9b4ee0', head: '#c9f53c', eye: '#ff4fa3', mouth: '#ff8a00', body: '#ffe14a', tip: '#ffffff' },
    { bg: '#e8242b', head: '#fff1b0', eye: '#2fbf63', mouth: '#1e2b9c', body: '#ff9ec8', tip: '#ffe100' },
    { bg: '#00b2c8', head: '#ffb000', eye: '#f2559c', mouth: '#e8242b', body: '#1e2b9c', tip: '#c9f53c' },
  ];

  const rrect = (x, a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); };

  // the "photograph" the screen was burned from (grey tone, 0 = black, 255 = white)
  const toneImage = () => {
    const c = H.layer(PW, PH), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, PW, PH);
    // soft cast shadow behind head on the right
    x.fillStyle = 'rgba(0,0,0,0.12)'; rrect(x, 92, 82, 166, 156, 30); x.fill();
    // shoulders / body
    let g = x.createLinearGradient(40, 0, 260, 0);
    g.addColorStop(0, '#e0e0e0'); g.addColorStop(0.4, '#b0b0b0'); g.addColorStop(0.7, '#6a6a6a'); g.addColorStop(1, '#303030');
    x.fillStyle = g; x.beginPath(); x.moveTo(30, PH + 5); x.lineTo(42, 278); x.quadraticCurveTo(50, 252, 92, 248); x.lineTo(208, 248); x.quadraticCurveTo(250, 252, 258, 278); x.lineTo(270, PH + 5); x.closePath(); x.fill();
    x.strokeStyle = '#222'; x.lineWidth = 3; x.stroke();
    // chest panel with dials
    x.fillStyle = '#5a5a5a'; rrect(x, 104, 272, 92, 50, 6); x.fill();
    x.fillStyle = '#f0f0f0'; [[124, 292], [150, 292], [176, 292]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 7, 0, 7); x.fill(); });
    x.fillStyle = '#1a1a1a'; [[124, 292], [150, 292], [176, 292]].forEach(([a, b]) => { x.beginPath(); x.arc(a + 1.5, b + 1.5, 3, 0, 7); x.fill(); });
    x.fillStyle = '#d0d0d0'; x.fillRect(112, 308, 76, 5);
    // neck with rings
    g = x.createLinearGradient(124, 0, 176, 0); g.addColorStop(0, '#9a9a9a'); g.addColorStop(0.4, '#cfcfcf'); g.addColorStop(1, '#262626');
    x.fillStyle = g; x.fillRect(124, 214, 52, 38);
    x.fillStyle = '#2a2a2a'; x.fillRect(122, 224, 56, 5); x.fillRect(122, 238, 56, 5);
    // ears
    for (const s of [-1, 1]) {
      g = x.createLinearGradient(0, 118, 0, 176); g.addColorStop(0, '#d6d6d6'); g.addColorStop(1, '#3a3a3a');
      x.fillStyle = s < 0 ? g : '#3c3c3c'; rrect(x, s < 0 ? 52 : 232, 118, 16, 56, 5); x.fill();
      x.strokeStyle = '#1b1b1b'; x.lineWidth = 2.5; x.stroke();
    }
    // head
    g = x.createLinearGradient(70, 70, 235, 225);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#e2e2e2'); g.addColorStop(0.62, '#959595'); g.addColorStop(0.85, '#555555'); g.addColorStop(1, '#383838');
    x.fillStyle = g; rrect(x, 68, 70, 164, 150, 30); x.fill();
    // hard shadow side
    x.save(); rrect(x, 68, 70, 164, 150, 30); x.clip();
    x.fillStyle = 'rgba(0,0,0,0.55)'; x.beginPath(); x.moveTo(206, 60); x.quadraticCurveTo(196, 150, 214, 230); x.lineTo(260, 230); x.lineTo(260, 60); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(60, 206, 200, 20);
    x.restore();
    x.strokeStyle = '#141414'; x.lineWidth = 3.5; rrect(x, 68, 70, 164, 150, 30); x.stroke();
    // antenna
    x.strokeStyle = '#202020'; x.lineWidth = 4; x.beginPath(); x.moveTo(150, 70); x.lineTo(150, 40); x.stroke();
    g = x.createRadialGradient(146, 31, 1, 150, 35, 11); g.addColorStop(0, '#fff'); g.addColorStop(1, '#333');
    x.fillStyle = g; x.beginPath(); x.arc(150, 35, 10, 0, 7); x.fill();
    // brows
    x.fillStyle = '#1e1e1e'; x.fillRect(92, 102, 44, 6); x.fillRect(164, 102, 44, 6);
    // eyes
    for (const ex of [114, 186]) {
      x.fillStyle = '#121212'; x.beginPath(); x.arc(ex, 138, 25, 0, 7); x.fill();
      g = x.createRadialGradient(ex - 6, 132, 2, ex, 138, 19); g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#2a2a2a');
      x.fillStyle = g; x.beginPath(); x.arc(ex, 138, 18, 0, 7); x.fill();
      x.fillStyle = '#050505'; x.beginPath(); x.arc(ex + 1, 139, 8, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(ex - 7, 131, 5, 0, 7); x.fill();
    }
    // nose rivet
    x.fillStyle = '#333'; x.beginPath(); x.arc(150, 162, 4, 0, 7); x.fill();
    // mouth grille
    x.fillStyle = '#1a1a1a'; rrect(x, 104, 180, 92, 24, 6); x.fill();
    x.fillStyle = '#bdbdbd'; for (let i = 0; i < 6; i++) x.fillRect(112 + i * 14, 185, 5, 14);
    // rivets along head
    x.fillStyle = '#2a2a2a'; [[82, 84], [218, 84], [82, 206], [218, 206]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3.5, 0, 7); x.fill(); });
    return x.getImageData(0, 0, PW, PH).data;
  };

  // crude hand-cut colour shapes (in panel coords)
  const cutShape = (x, pts) => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath(); x.fill(); };
  const blobAround = (r, cx, cy, rx, ry, n) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push([cx + Math.cos(a) * rx * r.range(0.9, 1.1), cy + Math.sin(a) * ry * r.range(0.9, 1.1)]); } return p; };

  // ================= EXPLAINER: six silkscreened panels, one beat each, pulled in order =================
  const SE = H.ease, scl = H.clamp, sseg = (t, a, b) => scl((t - a) / (b - a));
  const QW = 402, QH = 330, QG = 12, QM = 25;
  const SLOT = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1]];          // snake order
  const qx = (i) => QM + SLOT[i][0] * (QW + QG), qy = (i) => 24 + SLOT[i][1] * (QH + QG);
  const PRINT = [0.05, 2.55, 6.15, 8.45, 10.65, 13.05];                   // when each panel is pulled
  const QPAL = [
    { bg: '#f2559c', a: '#ffe14a', b: '#22c3c8', c: '#e8242b' },
    { bg: '#ff7a1f', a: '#fff04a', b: '#9fdcff', c: '#5b2a86' },
    { bg: '#22c3c8', a: '#fff1b0', b: '#ffe14a', c: '#e8242b' },
    { bg: '#ffe100', a: '#ff9ec8', b: '#2fbf63', c: '#e8242b' },
    { bg: '#9b4ee0', a: '#c9f53c', b: '#ffe14a', c: '#ff4fa3' },
    { bg: '#e8242b', a: '#fff1b0', b: '#ffe14a', c: '#1e2b9c' },
  ];
  const FLASH = ['#ff7a1f', '#2fbf63', '#1e2b9c', '#f2559c'];
  let SX_CACHE = null;
  const shash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const anton = (x, s, size, px, py, align = 'center', ls = 1) => { x.font = `400 ${size}px "Anton"`; x.textAlign = align; x.textBaseline = 'middle'; x.letterSpacing = ls + 'px'; x.fillText(s, px, py); x.letterSpacing = '0px'; };
  const cutPoly = (x, pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fill(); };
  const loose = (cx, cy, w, h, seed) => { const r = H.rng(seed); return [[cx - w / 2 + r.range(-6, 6), cy - h / 2 + r.range(-6, 6)], [cx + w / 2 + r.range(-6, 6), cy - h / 2 + r.range(-6, 6)], [cx + w / 2 + r.range(-6, 6), cy + h / 2 + r.range(-6, 6)], [cx - w / 2 + r.range(-6, 6), cy + h / 2 + r.range(-6, 6)]]; };
  // small robot portrait (colour shapes + black screen with soft shading as grey tone)
  const miniBot = (c, k, cx, cy, s, pal, mood) => {
    c.save(); c.translate(cx, cy); c.scale(s, s); k.save(); k.translate(cx, cy); k.scale(s, s);
    c.fillStyle = pal.a; cutPoly(c, loose(6, 4, 168, 150, 3)); c.fillStyle = pal.b; cutPoly(c, loose(-36, -6, 60, 46, 4)); cutPoly(c, loose(42, -4, 60, 46, 5)); c.fillStyle = pal.c; cutPoly(c, loose(4, 50, 86, 30, 6));
    k.fillStyle = '#000'; k.strokeStyle = '#000';
    const g = k.createLinearGradient(-80, -70, 80, 70); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
    k.fillStyle = g; k.beginPath(); k.roundRect(-80, -72, 160, 144, 26); k.fill(); k.fillStyle = '#000';
    k.lineWidth = 4; k.beginPath(); k.roundRect(-80, -72, 160, 144, 26); k.stroke();
    k.lineWidth = 3.5; k.beginPath(); k.moveTo(0, -72); k.lineTo(0, -98); k.stroke(); k.beginPath(); k.arc(0, -104, 8, 0, 7); k.fill();
    for (const ex of [-36, 36]) { k.beginPath(); k.arc(ex, -10, 22, 0, 7); k.fill(); k.fillStyle = '#fff'; k.globalCompositeOperation = 'destination-out'; k.beginPath(); k.arc(ex - 7, -17, 6, 0, 7); k.fill(); k.globalCompositeOperation = 'source-over'; k.fillStyle = '#000'; }
    if (mood === 'happy') { k.lineWidth = 7; k.beginPath(); k.arc(0, 36, 28, 0.2, Math.PI - 0.2); k.stroke(); }
    else if (mood === 'sad') { k.lineWidth = 7; k.beginPath(); k.arc(0, 70, 28, Math.PI + 0.3, -0.3); k.stroke(); }
    else { k.beginPath(); k.roundRect(-40, 38, 80, 22, 5); k.fill(); k.fillStyle = 'rgba(0,0,0,0)'; }
    c.restore(); k.restore();
  };
  const picCard = (c, k, cx, cy, s, kind, label, pal) => {
    c.save(); c.translate(cx, cy); c.scale(s / 100, s / 100); k.save(); k.translate(cx, cy); k.scale(s / 100, s / 100);
    c.fillStyle = '#fbf3e4'; cutPoly(c, loose(0, 0, 100, 120, kind === 'cat' ? 9 : 10)); c.fillStyle = pal.a; cutPoly(c, loose(2, 44, 96, 30, 11));
    k.fillStyle = '#000'; k.strokeStyle = '#000'; k.lineWidth = 4; k.strokeRect(-50, -60, 100, 120); k.lineCap = 'round';
    k.lineWidth = 4; k.beginPath(); k.arc(0, -14, 26, 0, 7); k.stroke();
    if (kind === 'cat') { k.beginPath(); k.moveTo(-22, -26); k.lineTo(-20, -50); k.lineTo(-6, -38); k.moveTo(22, -26); k.lineTo(20, -50); k.lineTo(6, -38); k.stroke(); k.lineWidth = 2.5; k.beginPath(); for (const sg of [-1, 1]) { k.moveTo(sg * 6, -6); k.lineTo(sg * 36, -8); k.moveTo(sg * 6, -2); k.lineTo(sg * 34, 2); } k.stroke(); }
    else { for (const sg of [-1, 1]) { k.beginPath(); k.ellipse(sg * 26, -12, 8, 17, sg * 0.4, 0, 7); k.fill(); } k.beginPath(); k.ellipse(0, -4, 6, 4, 0, 0, 7); k.fill(); }
    k.beginPath(); k.arc(-9, -18, 3.4, 0, 7); k.arc(9, -18, 3.4, 0, 7); k.fill();
    if (label) anton(k, label, 26, 0, 44, 'center', 2);
    c.restore(); k.restore();
  };
  const blackArrow = (k, p0, cp, p1, u, w) => {
    if (u <= 0) return;
    const q = (s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * cp[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * cp[1] + s * s * p1[1]];
    k.save(); k.strokeStyle = '#000'; k.fillStyle = '#000'; k.lineWidth = w; k.lineCap = 'round'; k.beginPath(); k.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= 24 * u; i++) { const p = q(i / 24); k.lineTo(p[0], p[1]); }
    const e = q(u), b = q(Math.max(0, u - 0.05)), a = Math.atan2(e[1] - b[1], e[0] - b[0]); k.lineTo(e[0], e[1]); k.stroke();
    k.beginPath(); k.moveTo(e[0] + Math.cos(a) * w * 2.2, e[1] + Math.sin(a) * w * 2.2); k.lineTo(e[0] + Math.cos(a + 2.4) * w * 2.6, e[1] + Math.sin(a + 2.4) * w * 2.6); k.lineTo(e[0] + Math.cos(a - 2.4) * w * 2.6, e[1] + Math.sin(a - 2.4) * w * 2.6); k.closePath(); k.fill(); k.restore();
  };

  // panel contents (panel-local coords 402 x 330) — colour plates into c, black screen into k
  const CONTENT = [
    (c, k, t, pal) => { // HOOK
      miniBot(c, k, 290, 210, 0.95, pal, 'think');
      c.fillStyle = pal.a; cutPoly(c, loose(118, 92, 210, 130, 21));
      anton(k, 'HOW DOES', 46, 118, 62, 'center', 1); anton(k, 'AI LEARN?', 50, 118, 120, 'center', 1);
      const q = Math.floor(t * 6) % 2 ? -4 : 0; if (t > 1.0) { anton(k, '?', 54, 366, 70 + q); anton(k, '?', 38, 340, 34 - q); }
    },
    (c, k, t, pal) => { // DATA: a contact sheet filling up + counter
      const n = Math.floor(sseg(t, 3.15, 4.6) * 12);
      const cyc = Math.floor(Math.max(0, t - 4.6) * 6);
      for (let j = 0; j < n; j++) {
        const col = j % 4, row = (j / 4) | 0, kind = (j + cyc) % 3 === 1 ? 'dog' : 'cat';
        picCard(c, k, 50 + col * 72, 52 + row * 82, 58, kind, kind.toUpperCase(), pal);
      }
      c.fillStyle = pal.b; cutPoly(c, loose(201, 290, 380, 64, 31));
      const v = Math.round(1e6 * Math.pow(sseg(t, 3.2, 5.5), 2.3));
      anton(k, v.toLocaleString('en-US') + ' EXAMPLES', 40, 201, 291, 'center', 1);
      if (t > 5.5) { k.save(); k.lineWidth = 5; k.beginPath(); k.moveTo(30, 322); k.lineTo(30 + 340 * SE.out(sseg(t, 5.5, 5.8)), 320); k.stroke(); k.restore(); }
    },
    (c, k, t, pal) => { // GUESS + CHECK
      picCard(c, k, 82, 150, 120, 'cat', '?', pal);
      blackArrow(k, [150, 120], [205, 70], [258, 108], SE.out(sseg(t, 6.8, 7.1)), 6);
      if (t > 6.95) anton(k, 'GUESS', 30, 205, 58, 'center', 2);
      if (t > 7.15) { c.fillStyle = '#fbf3e4'; cutPoly(c, loose(320, 150, 140, 90, 41)); k.lineWidth = 4; k.strokeRect(250, 105, 140, 90); anton(k, 'DOG?', 50, 320, 150); }
      if (t > 7.5) {
        const u = SE.back(sseg(t, 7.5, 7.7)); c.save(); c.translate(360, 110); c.scale(u, u); c.strokeStyle = pal.c; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-28, -28); c.lineTo(28, 28); c.moveTo(28, -28); c.lineTo(-28, 28); c.stroke(); c.restore();
        anton(k, 'CHECK', 30, 320, 232, 'center', 2); anton(k, "WRONG — IT'S A CAT", 22, 300, 270, 'center', 1);
      }
    },
    (c, k, t, pal) => { // ADJUST + correct
      miniBot(c, k, 110, 200, 0.75, pal, t > 10.0 ? 'happy' : 'sad');
      const adj = SE.inOut(sseg(t, 9.25, 9.85));
      for (let d = 0; d < 3; d++) {
        const dx = 230 + d * 58, dy = 250; c.fillStyle = pal.c; cutPoly(c, loose(dx, dy, 48, 48, 50 + d));
        k.lineWidth = 4; k.beginPath(); k.arc(dx, dy, 22, 0, 7); k.stroke();
        const a = [-2.2, -0.6, 0.9][d] + adj * [1.8, -1.4, 2.4][d]; k.lineWidth = 6; k.lineCap = 'round'; k.beginPath(); k.moveTo(dx, dy); k.lineTo(dx + Math.cos(a) * 18, dy + Math.sin(a) * 18); k.stroke();
      }
      if (t > 9.1) anton(k, 'ADJUST', 34, 288, 196, 'center', 2);
      if (t > 10.0) {
        c.fillStyle = '#fbf3e4'; cutPoly(c, loose(290, 90, 150, 90, 61)); k.lineWidth = 4; k.strokeRect(215, 45, 150, 90); anton(k, 'CAT', 52, 290, 90);
        const u = SE.back(sseg(t, 10.05, 10.25)); c.save(); c.translate(370, 50); c.scale(u, u); c.strokeStyle = '#1e7a3a'; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-22, 0); c.lineTo(-6, 16); c.lineTo(24, -18); c.stroke(); c.restore();
      }
    },
    (c, k, t, pal) => { // PROGRESS
      const X0 = 36, Y0 = 280, CW = 200, CH = 220, prog = SE.inOut(sseg(t, 11.3, 12.5));
      const acc = (u) => 61 + 36 * (1 - Math.exp(-u * 3.2)) / (1 - Math.exp(-3.2)), yv = (v) => Y0 - ((v - 50) / 50) * CH;
      c.fillStyle = pal.a; c.beginPath(); c.moveTo(X0, Y0); for (let i = 0; i <= 40 * prog; i++) c.lineTo(X0 + (i / 40) * CW + 6, yv(acc(i / 40)) + 4); c.lineTo(X0 + prog * CW + 6, Y0); c.closePath(); c.fill();
      k.lineWidth = 4; k.beginPath(); k.moveTo(X0, Y0 - CH - 6); k.lineTo(X0, Y0); k.lineTo(X0 + CW + 10, Y0); k.stroke();
      k.lineWidth = 7; k.lineJoin = 'round'; k.beginPath(); for (let i = 0; i <= 40 * prog; i++) { const u = i / 40; i ? k.lineTo(X0 + u * CW, yv(acc(u))) : k.moveTo(X0, yv(acc(0))); } k.stroke();
      anton(k, 'TRAINING ROUNDS', 18, X0 + CW / 2, Y0 + 22, 'center', 2);
      c.fillStyle = pal.b; cutPoly(c, loose(322, 160, 150, 110, 71));
      anton(k, 'ACCURACY', 22, 322, 92, 'center', 3);
      anton(k, Math.round(61 + 36 * prog) + '%', 78, 322, 165, 'center', 0);
      if (t > 12.5) { k.lineWidth = 5; k.beginPath(); k.ellipse(322, 165, 92 * SE.back(sseg(t, 12.5, 12.7)), 62 * SE.back(sseg(t, 12.5, 12.7)), -0.1, 0, 7); k.stroke(); }
    },
    (c, k, t, pal) => { // TAKEAWAY
      c.fillStyle = pal.a; cutPoly(c, loose(201, 100, 360, 80, 81)); cutPoly(c, loose(201, 236, 360, 80, 82));
      anton(k, 'MORE EXAMPLES', 54, 201, 100, 'center', 1);
      blackArrow(k, [201, 145], [201, 160], [201, 182], SE.out(sseg(t, 13.75, 13.95)), 7);
      anton(k, 'BETTER GUESSES', 54, 201, 238, 'center', 1);
    },
  ];

  const camAt = (t) => {
    const P = (i) => [qx(i) + QW / 2, qy(i) + QH / 2, 1.85];
    const keys = [[0, P(0)], [2.25, P(0)], [2.75, P(1)], [5.85, P(1)], [6.35, P(2)], [8.15, P(2)], [8.65, P(3)], [10.35, P(3)], [10.85, P(4)], [12.75, P(4)], [13.25, P(5)], [14.05, P(5)], [14.75, [640, 360, 1]]];
    let a = keys[0], b = keys[0];
    for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0]) { a = keys[i]; b = keys[i + 1]; }
    if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
    const u = SE.inOut(sseg(t, a[0], b[0]));
    // zoom out a touch while travelling between panels
    const dip = (a[1][0] !== b[1][0] || a[1][1] !== b[1][1]) && b[1][2] > 1.5 ? Math.sin(Math.PI * u) * 0.35 : 0;
    return [H.lerp(a[1][0], b[1][0], u), H.lerp(a[1][1], b[1][1], u), H.lerp(a[1][2], b[1][2], u) - dip];
  };

  const spExplainer = (ctx, W, H_, t) => {
    if (!SX_CACHE) {
      const nz = H.makeNoise(8), GW = 640, GH = 360, g = new Float32Array(GW * GH); for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) g[y * GW + x] = nz.fbm2(x * 0.11, y * 0.11, 3) * 0.7 + nz.n2(x * 0.45, y * 0.45) * 0.3;
      // squeegee streak rows per panel (same field as the still's streakRows), key misregistration, ghost pulls
      const streak = [], reg = [];
      for (let i = 0; i < 6; i++) {
        const a = new Float32Array(QH), n2 = H.makeNoise((i + 1) * 13 + 5); for (let y = 0; y < QH; y++) a[y] = n2.fbm2(y * 0.045, 0.5, 3) + 0.6 * n2.n2(y * 0.3, 7.7); streak.push(a);
      }
      // key offsets chosen so nothing near a panel edge is pushed out of its panel
      reg.push([-4, 3], [3, -3], [-3, 4], [4, 3], [-4, -3], [3, 4]);
      const ghost = [[11, -3], null, null, null, null, [-9, 5]]; // panels with no gutter arrows crossing them
      SX_CACHE = { g, GW, GH, streak, reg, ghost };
    }
    const { streak: STK, reg: REGO, ghost: GHO } = SX_CACHE;
    const [ccx, ccy, z] = camAt(t);
    const col = H.layer(W, H_), c = col.getContext('2d'), key = H.layer(W, H_), k = key.getContext('2d');
    c.fillStyle = `rgb(${CANVAS})`; c.fillRect(0, 0, W, H_);
    const cam = (x) => { x.setTransform(z, 0, 0, z, W / 2 - ccx * z, H_ / 2 - ccy * z); };
    cam(c); cam(k);
    const panelState = [];
    for (let i = 0; i < 6; i++) {
      const x0 = qx(i), y0 = qy(i), T0 = PRINT[i];
      let pal = QPAL[i];
      if (i === 4 && t > 12.5 && t < 13.0) pal = { ...pal, bg: FLASH[Math.floor((t - 12.5) * 8) % FLASH.length] }; // emphasis: colourway flicker
      if (i === 2 && t > 7.5 && t < 7.9) pal = { ...pal, bg: Math.floor((t - 7.5) * 10) % 2 ? '#e8242b' : pal.bg };
      const kp = SE.inOut(sseg(t, T0 + 0.3, T0 + 0.7));
      panelState.push({ x0, y0, kp, dir: i % 2 ? -1 : 1, seed: i, on: t >= T0, fw: QW * SE.out(sseg(t, T0, T0 + 0.18)), st: STK[i], gh: GHO[i] });
      if (t < T0) { c.strokeStyle = 'rgba(90,80,70,0.3)'; c.lineWidth = 1.2; c.strokeRect(x0, y0, QW, QH); continue; }
      c.save(); c.beginPath(); c.rect(x0, y0, QW * SE.out(sseg(t, T0, T0 + 0.18)), QH); c.clip(); c.translate(x0, y0);
      c.fillStyle = pal.bg; c.fillRect(0, 0, QW, QH);
      k.save(); k.beginPath(); k.rect(x0, y0, QW, QH); k.clip(); k.translate(x0 + REGO[i][0], y0 + REGO[i][1]); // photo screen slightly off register
      CONTENT[i](c, k, t, pal);
      c.restore(); k.restore();
    }
    // cross-panel arrows painted straight on the canvas (cause and flow between beats)
    k.save(); k.strokeStyle = '#000'; k.fillStyle = '#000';
    blackArrow(k, [qx(2) + 330, qy(2) + 296], [qx(2) + 380, qy(2) + 345], [qx(3) + 362, qy(3) + 168], SE.inOut(sseg(t, 8.4, 8.95)), 7); // error flows down to the dials
    blackArrow(k, [qx(3) + 40, qy(3) + 70], [qx(3) - 10, qy(3) - 40], [qx(2) + 40, qy(2) + 230], SE.inOut(sseg(t, 10.15, 10.4)), 6);   // ...and loops back to guess again
    blackArrow(k, [qx(1) + 380, qy(1) + 165], [qx(1) + QW + 6, qy(1) + 165], [qx(2) + 18, qy(2) + 150], SE.inOut(sseg(t, 6.0, 6.3)), 6);
    k.restore();
    c.setTransform(1, 0, 0, 1, 0, 0); k.setTransform(1, 0, 0, 1, 0, 0);
    const cd = c.getImageData(0, 0, W, H_).data, kd = k.getImageData(0, 0, W, H_).data;
    const out = ctx.createImageData(W, H_), o = out.data, { g, GW, GH } = SX_CACHE;
    const K = [22, 18, 20], iz = 1 / z, PS = [];
    for (let j = 0; j < 2; j++) for (let ii = 0; ii < 3; ii++) PS.push(panelState[SLOT.findIndex((q) => q[0] === ii && q[1] === j)]);
    const kAt = (sx, sy) => (sx < 0 || sy < 0 || sx >= W || sy >= H_ ? 0 : kd[((sy | 0) * W + (sx | 0)) * 4 + 3] / 255);
    for (let y = 0; y < H_; y++) {
      const py = ccy + (y - H_ / 2) * iz, rowj = Math.floor((py - 24) / (QH + QG)), ly = py - 24 - rowj * (QH + QG);
      const rowOK = rowj >= 0 && rowj < 2 && ly < QH;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, px = ccx + (x - W / 2) * iz;
        const ipx = px | 0, ipy = py | 0;
        const h1 = shash(ipx, ipy, 1), weave = 1 + 0.025 * Math.sin(px * 2.1) * Math.sin(py * 2.3) + (h1 - 0.5) * 0.05;
        let r = cd[i] * weave, gg = cd[i + 1] * weave, b = cd[i + 2] * weave;
        const gs = g[(scl(py / 720 * GH, 0, GH - 1) | 0) * GW + (scl(px / 1280 * GW, 0, GW - 1) | 0)];
        // which panel is this pixel in?
        let s = null, lx = 0;
        if (rowOK) { const colj = Math.floor((px - QM) / (QW + QG)); lx = px - QM - colj * (QW + QG); if (colj >= 0 && colj < 3 && lx < QW) s = PS[rowj * 3 + colj]; }
        let starve = 0, along = 0, st = 0;
        if (s && s.on) {
          along = s.dir > 0 ? lx / QW : 1 - lx / QW; st = s.st[ly | 0];
          starve = scl((st * 0.9 + along * 0.9 - 0.75) * 1.6) * 0.85;
          if (lx < s.fw) {
            // flood: low-frequency ink load, a darker build-up where the flood bar starts and stops, and the colour
            // thinning in the squeegee's starved streaks (as in the still)
            let f = 1 + gs * 0.08;
            const ed = Math.min(lx, QW - lx), ev = Math.min(ly, QH - ly);
            if (ed < 2.4) f *= 0.86 + 0.05 * ed; else if (ev < 1.6) f *= 0.93 + 0.04 * ev;
            r *= f; gg *= f; b *= f;
            const cs = starve * 0.22 + (0.5 - h1) * 0.04;
            r += (CANVAS[0] - r) * cs; gg += (CANVAS[1] - gg) * cs; b += (CANVAS[2] - b) * cs;
          }
        }
        let ka = kd[i + 3] / 255;
        if (s && along > s.kp * 1.05 - 0.02) ka = 0;
        if (ka > 0.01) {
          const thr = 0.5 + gs * 0.28 + (shash(ipx, ipy, 5) - 0.5) * 0.22;
          let cov = scl((ka - thr) * 6 + 0.5);
          if (cov > 0) {
            let dens = 0.97 - starve * 0.55 + (shash(ipx, ipy, 9) - 0.5) * 0.1;
            if (starve > 0.4 && shash(ipx, ipy >> 1, 11) < starve * 0.5) dens *= 0.4;
            cov *= scl(dens);
            r = r * (1 - cov) + K[0] * cov; gg = gg * (1 - cov) + K[1] * cov; b = b * (1 - cov) + K[2] * cov;
          }
        }
        // ghost: a second, starved pull of the screen slipped sideways (two panels, as in the still)
        if (s && s.gh && along <= s.kp * 1.05 - 0.02) {
          const glx = lx - s.gh[0], gly = ly - s.gh[1];
          if (glx >= 0 && gly >= 0 && glx < QW && gly < QH) {
            const ka2 = kAt(x - s.gh[0] * z, y - s.gh[1] * z);
            if (ka2 > 0.3) {
              const cov = scl((ka2 - 0.55 - gs * 0.2) * 5 + 0.5) * (0.26 + 0.18 * st) * (shash(ipx, ipy, 17) < 0.55 ? 1 : 0.3);
              r *= 1 - cov * 0.85; gg *= 1 - cov * 0.85; b *= 1 - cov * 0.85;
            }
          }
        }
        o[i] = r; o[i + 1] = gg; o[i + 2] = b; o[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  };

  registerStyle({
    id: 'screenprint-grid',
    name: 'Silkscreen Grid',
    category: 'Print',
    description: 'A Warhol-style repeat portrait: the same robot pulled eight times through a grainy black photo screen over loose, hand-cut flat colour plates in garish combinations, each pull misregistered and streaked by the squeegee.',
    motion: 'Panels are printed one after another across the grid — background flood, then the loose colour shapes slap down, then the squeegee drags the black photo screen across with a wet ink bead — before a slow push-in on the finished wall.',
    fonts: ['400 50px "Anton"'],
    duration: 4.5,
    frameT: 4.4,
    readsPixels: true,
    explainerDuration: 16,
    explainerNote: 'Each beat is its own silkscreened panel, pulled in order (flood, loose colour shapes, squeegee drags the black screen) while the camera travels the grid; black arrows are painted across the gutters between panels, counters are stencil type, emphasis is a colourway flicker, and the final pull-back reveals all six beats as one Warhol grid.',
    explainer(ctx, W, H_, t) { spExplainer(ctx, W, H_, t); },
    // Sound: a screen-printing bench. Each panel is a pull: a wet flood of ink, then the rubber squeegee drags
    // across the mesh (following the pull direction), and the screen lifts off with a soft clack. Painted arrows
    // are brush strokes, cards and stencil labels are small dabs, the colourway flicker on 97% is four quick
    // re-floods after the big hit. Timings mirror PRINT / CONTENT / camAt / spExplainer above.
    // Voiceover mode: room bed drops; screen lifts, card dabs, counter ticks, labels and the flicker are minor.
    explainerSound(k) {
      const D = 16;
      const when = (t0, t1, ease, u) => { for (let i = 0; i <= 400; i++) { const t = t0 + ((t1 - t0) * i) / 400; if (ease(i / 400) >= u - 1e-6) return t; } return t1; };
      // ink flooded across the screen with the flood bar: a short wet swish
      const flood = (t, g, minor) => k.noise(t, { minor: !!minor, dur: 0.24, color: 'pink', filter: 'bandpass', f: [[0, 650], [0.2, 1150]], q: 0.9, gain: 0.2 * g, a: 0.07 });
      // squeegee: rubber blade dragging ink through the mesh over d seconds, panned along the pull; screen lifts after
      const squeegee = (t, d, dir, g) => {
        const p0 = -0.45 * dir, p1 = 0.45 * dir;
        k.noise(t, { dur: d * 0.55, color: 'brown', filter: 'bandpass', f: [[0, 420], [d * 0.55, 720]], q: 0.9, gain: 0.55 * g, a: d * 0.3, hold: d * 0.2, pan: p0 });
        k.noise(t + d * 0.45, { dur: d * 0.6, color: 'brown', filter: 'bandpass', f: [[0, 720], [d * 0.6, 480]], q: 0.9, gain: 0.55 * g, a: 0.05, hold: d * 0.25, pan: p1 });
        // mesh texture: the blade chatters over the threads, densest mid-pull
        k.withMinor(() => { for (let x = 0.03; x < d; x += 0.022) { const e = Math.sin(Math.PI * x / d); k.noise(t + x, { dur: 0.018, filter: 'bandpass', f: 1250, q: 2, gain: 0.12 * g * e, a: 0.002, pan: p0 + (p1 - p0) * (x / d) }); } });
        // screen lifts off the paper
        k.withMinor(() => { k.tone(t + d + 0.06, { f: [[0, 150], [0.06, 85]], dur: 0.09, gain: 0.13 * g }); k.noise(t + d + 0.06, { dur: 0.03, filter: 'bandpass', f: 900, q: 1.2, gain: 0.2 * g, a: 0.001 }); });
      };
      const pull = (i, g = 1) => { flood(PRINT[i], g); squeegee(PRINT[i] + 0.3, 0.4, i % 2 ? -1 : 1, g); };
      // camera travels the grid: a soft smooth slide, nothing papery
      const travel = (t0, t1, g = 1) => k.noise(t0, { minor: true, dur: t1 - t0, color: 'brown', filter: 'lowpass', f: [[0, 220], [(t1 - t0) / 2, 520], [t1 - t0, 220]], gain: 0.16 * g, a: (t1 - t0) * 0.45 });
      const dab = (t, g, p) => k.withMinor(() => { k.noise(t, { dur: 0.04, filter: 'bandpass', f: 800, q: 1, gain: 0.26 * g, a: 0.002, pan: p }); k.tone(t, { f: 130, dur: 0.05, gain: 0.1 * g, pan: p }); });
      const tick = (t, g, p) => k.noise(t, { minor: true, dur: 0.02, filter: 'bandpass', f: 2100, q: 1.6, gain: 0.24 * g, a: 0.001, pan: p });
      const brush = (t, d, g, p) => k.play('stroke', t, { material: 'brush', dur: d, gain: g, pan: p, minor: true });

      k.bed('room', 0, D, { gain: 0.2 });

      // ---- panel 1: HOOK (the black screen pulls HOW DOES AI LEARN? on)
      pull(0);
      dab(1.0, 0.6, 0.5); dab(1.07, 0.45, 0.4); // the two ?s

      // ---- panel 2: DATA
      travel(2.25, 2.75);
      pull(1);
      for (let j = 1; j <= 12; j++) dab(3.15 + (j / 12) * 1.45, 0.75, -0.4 + ((j - 1) % 4) * 0.25); // contact sheet fills
      // counter (1e6 * sseg(3.2, 5.5)^2.3): ticks once the sheet is full, speeding up toward 1,000,000
      for (let t = 4.66; t < 5.46; ) { const s = sseg(t, 4.6, 5.5); tick(t, 0.8 + 0.3 * s, 0); t += 0.13 - 0.05 * s; }
      k.play('stamp', 5.5, { gain: 0.65 }); // 1,000,000 EXAMPLES
      brush(5.5, 0.3, 0.6, -0.1); // underline
      brush(6.0, 0.3, 0.7, 0.4); // arrow painted across the gutter to panel 3

      // ---- panel 3: GUESS / CHECK
      travel(5.85, 6.35);
      pull(2);
      brush(6.8, 0.3, 1.4, 0.1); // GUESS arrow
      dab(6.95, 0.6, 0);
      k.play('slap', 7.15, { gain: 0.45, pan: 0.35 }); // DOG? card
      k.play('stamp', 7.5, { gain: 0.8, pan: 0.4 }); // red X, CHECK, WRONG
      k.play('error', 7.6, { f: 'E3', gain: 0.75, pan: 0.3 });
      for (let i = 1; i < 4; i++) flood(7.5 + i * 0.1, 0.45, true); // panel flickers red

      // ---- panel 4: ADJUST
      travel(8.15, 8.65);
      brush(8.4, 0.55, 1.4, 0.3); // error arrow painted down to the dials
      pull(3);
      dab(9.1, 0.6, 0.2); // ADJUST
      for (let i = 1; i <= 4; i++) k.play('tock', when(9.25, 9.85, SE.inOut, (i - 0.5) / 4), { f: 500 + i * 30, gain: 0.35, pan: 0.25, minor: true }); // dials turn
      k.play('slap', 10.0, { gain: 0.4, pan: 0.3 }); // CAT card
      k.play('success', when(10.05, 10.25, SE.back, 1), { f: 'C5', gain: 0.55, pan: 0.4 });
      brush(10.15, 0.25, 0.9, -0.3); // loop arrow back to guess again

      // ---- panel 5: ACCURACY
      travel(10.35, 10.85);
      pull(4);
      brush(11.38, 1.12, 0.6, -0.3); // the curve inks along
      for (let t = 11.3, last = 61, lastT = -1; t < 12.52; t += 1 / 120) { const v = Math.round(61 + 36 * SE.inOut(sseg(t, 11.3, 12.5))); if (v !== last && t - lastT >= 0.1) { tick(t, 0.9, 0.3); last = v; lastT = t; } }
      // 97%: the big hit, then the colourway flickers through four quick re-floods (8 per second)
      k.play('impact', 12.5, { gain: 1.2, pan: 0.25 });
      k.play('stamp', 12.5, { gain: 0.6, pan: 0.25 });
      for (let i = 1; i < 4; i++) flood(12.5 + i * 0.125, 0.55, true);

      // ---- panel 6: TAKEAWAY
      travel(12.75, 13.25);
      pull(5);
      brush(13.75, 0.2, 0.7, 0); // arrow
      ['C4', 'G4', 'C5', 'E5'].forEach((f, i) => k.play('ding', 13.95 + i * 0.06, { f, gain: 0.38 - i * 0.05, pan: (i - 1.5) * 0.2 }));
      // pull back to the whole Warhol grid
      travel(14.05, 14.75, 1.4);
      k.play('ding', 14.75, { f: 'G4', gain: 0.22, pan: 0 });
    },
    draw(ctx, W, H_, t) {
      const tone = toneImage();
      const step = 5; // fixed edition (matches the gallery still)
      // linen canvas ground
      ctx.fillStyle = `rgb(${CANVAS})`; ctx.fillRect(0, 0, W, H_);
      const panels = [];
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const idx = j * COLS + i, r = H.rng(100 + idx * 7 + step * 131);
        const px = M + i * (PW + G) + r.range(-2, 2), py = M + j * (PH + G) + r.range(-2, 2);
        const pal = PAL[(idx + step * 3) % PAL.length];
        const kdx = r.range(-7, 7), kdy = r.range(-6, 6);               // black screen offset
        const heavy = [0.05, -0.04, 0.15, -0.07, 0.02, 0.1, -0.1, 0.07][idx]; // ink load per pull
        panels.push({ px, py, kdx, kdy, heavy, seed: idx + 1 + step * 17, pullDir: r.chance(0.5) ? 1 : -1, ghost: (idx === 2 || idx === 5) ? [r.range(10, 16), r.range(-4, 4)] : null });
        // print order: one panel after another
        const T0 = 0.15 + idx * 0.25;
        const pp = panels[panels.length - 1];
        pp.keyProg = H.ease.inOut(H.clamp((t - T0 - 0.38) / 0.36));
        pp.ghostOn = t > T0 + 0.82;
        if (t < T0) {
          ctx.strokeStyle = 'rgba(90,80,70,0.25)'; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, PW - 1, PH - 1);
          continue;
        }
        ctx.save(); ctx.translate(px, py);
        ctx.beginPath(); ctx.rect(0, 0, PW * H.ease.out(H.clamp((t - T0) / 0.16)), PH); ctx.clip();
        ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, PW, PH);
        const plateA = t > T0 + 0.18, plateB = t > T0 + 0.28;
        // colour plates: cut loosely, placed a little off
        const o = () => [r.range(-12, 12), r.range(-9, 9)];
        let [dx, dy] = o();
        ctx.fillStyle = plateA ? pal.body : 'rgba(0,0,0,0)';
        cutShape(ctx, [[34 + dx, PH + 4], [44 + dx, 270 + dy], [70 + dx, 252 + dy], [232 + dx, 250 + dy], [258 + dx, 268 + dy], [272 + dx, PH + 4]]);
        [dx, dy] = o();
        ctx.fillStyle = plateA ? pal.head : 'rgba(0,0,0,0)';
        ctx.save(); ctx.translate(150 + dx, 145 + dy); ctx.rotate(r.range(-0.05, 0.05));
        cutShape(ctx, [[-80, -62], [-66, -76], [64, -78], [82, -60], [84, 64], [70, 78], [-70, 76], [-84, 60]]);
        ctx.fillRect(-100, -27, 20, 56); ctx.fillRect(80, -27, 20, 56);
        ctx.restore();
        [dx, dy] = o();
        ctx.fillStyle = plateB ? pal.eye : 'rgba(0,0,0,0)';
        cutShape(ctx, blobAround(r, 114 + dx, 136 + dy, 34, 28, 9)); cutShape(ctx, blobAround(r, 188 + dx, 136 + dy, 34, 28, 9));
        [dx, dy] = o();
        ctx.fillStyle = plateB ? pal.mouth : 'rgba(0,0,0,0)';
        cutShape(ctx, [[100 + dx, 176 + dy], [200 + dx, 174 + dy], [202 + dx, 206 + dy], [98 + dx, 209 + dy]]);
        ctx.fillStyle = plateB ? pal.tip : 'rgba(0,0,0,0)'; ctx.beginPath(); ctx.arc(150 + dx * 0.6, 35 + dy * 0.6, 13, 0, 7); ctx.fill();
        ctx.fillStyle = plateB ? pal.mouth : 'rgba(0,0,0,0)'; ctx.fillRect(108 + dx * 0.5, 276 + dy * 0.5, 84, 40);
        ctx.restore();
      }

      // ---- per-pixel: pull the black screen, squeegee streaks, ink texture, canvas weave ----
      const img = ctx.getImageData(0, 0, W, H_), d = img.data;
      const nz = H.makeNoise(8);
      // streak fields per panel (1D along pull direction = rows) precomputed
      const streakRows = panels.map((p) => { const a = new Float32Array(PH); const n2 = H.makeNoise(p.seed * 13); for (let y = 0; y < PH; y++) a[y] = n2.fbm2(y * 0.045, 0.5, 3) + 0.6 * n2.n2(y * 0.3, 7.7); return a; });
      // mid-frequency grain field (shared), low-res then sampled
      const GW = 320, GH = 180, grain = new Float32Array(GW * GH);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) grain[y * GW + x] = nz.fbm2(x * 0.22, y * 0.22, 3) * 0.7 + nz.n2(x * 0.9, y * 0.9) * 0.3;
      const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
      const K = [22, 18, 20];
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        // canvas weave
        const weave = 1 + 0.025 * Math.sin(x * 2.1) * Math.sin(y * 2.3) + (hash(x, y, 1) - 0.5) * 0.05;
        let r = d[i] * weave, g = d[i + 1] * weave, b = d[i + 2] * weave;
        let pi = -1;
        for (let k = 0; k < panels.length; k++) { const p = panels[k]; if (x >= p.px && x < p.px + PW && y >= p.py && y < p.py + PH) { pi = k; break; }
        if (pi >= 0 && panels[pi].keyProg === undefined) pi = -1; }
        if (pi >= 0) {
          const p = panels[pi], lx = x - p.px, ly = y - p.py;
          const gs = grain[((y * GH / H_) | 0) * GW + ((x * GW / W) | 0)];
          // squeegee: ink starves in streaks and toward the end of the pull
          const pull = p.pullDir > 0 ? lx / PW : 1 - lx / PW;
          const st = streakRows[pi][ly | 0];
          const starve = H.clamp((st * 0.9 + pull * 0.9 - 0.75) * 1.6) * 0.85;
          // colour plates thin slightly in the starved streaks
          const cs = starve * 0.22 + (hash(x, y, 3) - 0.5) * 0.04;
          r += (CANVAS[0] - r) * cs; g += (CANVAS[1] - g) * cs; b += (CANVAS[2] - b) * cs;
          // black photo screen (misregistered)
          const tx = Math.round(lx - p.kdx), ty = Math.round(ly - p.kdy);
          const kp = p.keyProg;
          if (kp > 0 && kp < 1) { // wet ink bead riding in front of the squeegee
            const fr = kp * (PW + 20) - 10, dd = pull * PW - fr;
            if (dd > 0 && dd < 7) { const bead = 0.55 * (1 - dd / 7) * (0.8 + 0.2 * Math.sin(ly * 0.3)); r *= 1 - bead; g *= 1 - bead; b *= 1 - bead; }
          }
          if (pull * PW <= kp * (PW + 20) - 10 && tx >= 0 && ty >= 0 && tx < PW && ty < PH) {
            const tv = tone[(ty * PW + tx) * 4] / 255;
            const thr = 0.47 + p.heavy + gs * 0.14 + (hash(x, y, 5) - 0.5) * 0.16;
            let cov = H.clamp((thr - tv) * 9);
            if (cov > 0) {
              let dens = 0.97 - starve * 0.9 + (hash(x, y, 9) - 0.5) * 0.1;
              if (starve > 0.35 && hash(x, y >> 1, 11) < starve * 0.8) dens *= 0.2;
              cov *= H.clamp(dens);
              r = r * (1 - cov) + K[0] * cov; g = g * (1 - cov) + K[1] * cov; b = b * (1 - cov) + K[2] * cov;
            }
          }
          // ghost: a second, starved pull of the screen slipped sideways
          if (p.ghost && p.ghostOn) {
            const gx = Math.round(lx - p.kdx - p.ghost[0]), gy = Math.round(ly - p.kdy - p.ghost[1]);
            if (gx >= 0 && gy >= 0 && gx < PW && gy < PH) {
              const tv = tone[(gy * PW + gx) * 4] / 255;
              let cov = H.clamp((0.4 + gs * 0.2 - tv) * 6) * (0.32 + 0.25 * st) * (hash(x, y, 17) < 0.55 ? 1 : 0.25);
              r *= 1 - cov * 0.9; g *= 1 - cov * 0.9; b *= 1 - cov * 0.9;
            }
          }
        }
        d[i] = r; d[i + 1] = g; d[i + 2] = b;
      }
      ctx.putImageData(img, 0, 0);
      const z = 1 + 0.03 * H.ease.inOut(H.clamp((t - 2.4) / 2.1));
      if (z > 1.0001) {
        const cp = H.layer(W, H_); cp.getContext('2d').drawImage(ctx.canvas, 0, 0, W, H_);
        ctx.drawImage(cp, 640 - 640 / z, 360 - 360 / z, W / z, H_ / z, 0, 0, W, H_);
      }
    },
  });
}
```
