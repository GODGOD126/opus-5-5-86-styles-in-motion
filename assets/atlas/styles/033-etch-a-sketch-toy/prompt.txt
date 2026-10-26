I want an animated explainer made in the "Etch A Sketch Toy" visual style (Hand-Drawn). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
Name: Etch A Sketch Toy
Family: Hand-Drawn
Look: The classic red line-drawing toy: glossy rounded red plastic with hard specular streaks, two white knurled knobs, and a grainy silver aluminium-powder screen where everything is one thin dark line that never lifts: crisp horizontals and verticals, stair-stepped diagonals and curves, and visible travel lines joining every letter and shape.
Motion: A shake clears the last doodle in patchy streaks, then the single line crawls out at time-lapse speed while the left knob turns with every horizontal move and the right knob with every vertical one.
How it explains: Every word and picture is one continuous stylus line with the knobs turning to match; the scene transition is shaking the toy so the drawing fades in streaks (leaving a faint ghost), arrows and labels are part of the same line (labels ride arrows and bubble edges), and numbers grow as they are written: 1,000,000 gains a zero at a time and the accuracy staircase writes 61%, 70%, 77%, 90% on its treads before a double-traced, boxed 97%.

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

REFERENCE STYLE SOURCE (styles/etch-sketch.js; W/H_ are always 1280x720)
```js
// Etch A Sketch Toy: a glossy red plastic line-drawing toy. Everything is one continuous, never-lifting line scraped
// through silver aluminium powder: crisp horizontals and verticals, stair-stepped diagonals, travel lines between
// every word and shape, white knobs that turn with the stylus (left = x, right = y), and a shake to erase.
{
  // ---------------- toy geometry (toy coords = canvas coords at camera 1x) ----------------
  const SCR = { x: 92, y: 54, w: 1096, h: 540 };                 // aluminium screen; content is drawn in screen coords
  const BODY = { x0: 12, y0: 8, x1: 1268, y1: 714, r: 62 };
  const BEZ = { x0: 78, y0: 40, x1: 1202, y1: 608, r: 26 };
  const KNOBS = [{ x: 104, y: 661, r: 41 }, { x: 1176, y: 661, r: 41 }];
  const KNOB_K = 0.0125;                                        // knob radians per px of stylus travel
  const FAST = 0.38;                                            // retrace / travel moves run faster

  // ---------------- single-stroke blocky lettering (units: y up, cap height 6, all start & end on the baseline) ----
  const GAP = 1.4, XS = 1.15; // XS widens the narrow 3x6 glyph grid a little
  const GL = {
    ' ': [1.6, []],
    'A': [3, [[0, 0], [0, 4], [1, 6], [2, 6], [3, 4], [3, 3], [0, 3], [3, 3], [3, 0]]],
    'B': [3, [[0, 0], [0, 6], [2, 6], [3, 5], [3, 4], [2, 3], [0, 3], [2, 3], [3, 2], [3, 1], [2, 0], [0, 0]]],
    'C': [3, [[0, 0], [0, 6], [3, 6], [3, 5], [3, 6], [0, 6], [0, 0], [3, 0], [3, 1], [3, 0]]],
    'D': [3, [[0, 0], [0, 6], [2, 6], [3, 5], [3, 1], [2, 0], [0, 0]]],
    'E': [3, [[0, 0], [0, 6], [3, 6], [3, 5], [3, 6], [0, 6], [0, 3], [2, 3], [0, 3], [0, 0], [3, 0], [3, 1.1], [3, 0]]],
    'G': [3, [[0, 0], [0, 6], [3, 6], [3, 5], [3, 6], [0, 6], [0, 0], [3, 0], [3, 3], [1.6, 3], [3, 3], [3, 0]]],
    'H': [3, [[0, 0], [0, 6], [0, 3], [3, 3], [3, 6], [3, 0]]],
    'I': [2, [[1, 0], [1, 6], [0, 6], [2, 6], [1, 6], [1, 0]]],
    'J': [3, [[0, 0], [0, 1.6], [0, 0], [3, 0], [3, 6], [1.4, 6], [3, 6], [3, 0]]],
    'K': [3, [[0, 0], [0, 6], [0, 3], [3, 6], [0, 3], [3, 0]]],
    'L': [3, [[0, 0], [0, 6], [0, 0], [3, 0], [3, 1.1], [3, 0]]],
    'M': [4, [[0, 0], [0, 6], [2, 3], [4, 6], [4, 0]]],
    'N': [3, [[0, 0], [0, 6], [3, 0], [3, 6], [3, 0]]],
    'O': [3, [[1, 0], [0, 1], [0, 5], [1, 6], [2, 6], [3, 5], [3, 1], [2, 0], [1, 0]]],
    'P': [3, [[0, 0], [0, 6], [3, 6], [3, 3], [0, 3], [0, 0]]],
    'R': [3, [[0, 0], [0, 6], [3, 6], [3, 3], [0, 3], [1, 3], [3, 0]]],
    'S': [3, [[0, 0], [3, 0], [3, 3], [0, 3], [0, 6], [3, 6], [3, 5], [3, 6], [0, 6], [0, 3], [3, 3], [3, 0]]],
    'T': [3, [[1.5, 0], [1.5, 6], [0, 6], [3, 6], [1.5, 6], [1.5, 0]]],
    'U': [3, [[0, 0], [0, 6], [0, 0], [3, 0], [3, 6], [3, 0]]],
    'W': [4, [[1, 0], [0, 6], [1, 0], [2, 4], [3, 0], [4, 6], [3, 0]]],
    'X': [3, [[0, 0], [3, 6], [1.5, 3], [0, 6], [3, 0]]],
    'Y': [3, [[1.5, 0], [1.5, 3], [0, 6], [1.5, 3], [3, 6], [1.5, 3], [1.5, 0]]],
    '?': [3, [[1, 0], [1, 1], [2, 1], [2, 0], [2, 1], [1.5, 1], [1.5, 2.6], [3, 3.6], [3, 5], [2, 6], [1, 6], [0, 5], [1, 6], [2, 6], [3, 5], [3, 3.6], [1.5, 2.6], [1.5, 1], [2, 1], [2, 0]]],
    '0': [3, [[1, 0], [0, 1], [0, 5], [1, 6], [2, 6], [3, 5], [3, 1], [2, 0], [1, 0]]],
    '1': [2, [[1, 0], [1, 6], [0, 5], [1, 6], [1, 0]]],
    '6': [3, [[0, 0], [0, 6], [3, 6], [0, 6], [0, 3], [3, 3], [3, 0], [0, 0]]],
    '7': [3, [[1, 0], [3, 6], [0, 6], [3, 6], [1, 0]]],
    '9': [3, [[0, 0], [3, 0], [3, 6], [0, 6], [0, 3], [3, 3], [3, 0]]],
    '%': [4, [[0, 0], [4, 6], [2.53, 3.8], [1.8, 3.8], [1.8, 6], [0, 6], [0, 3.8], [1.8, 3.8], [2.53, 3.8], [1.47, 2.2], [2.2, 2.2], [4, 2.2], [4, 0], [2.2, 0], [2.2, 2.2], [2.2, 0], [4, 0]]],
    ',': [0.9, [[0.5, 0], [0.5, 1], [0.5, -1.2], [-0.2, -2.4], [0.5, -1.2], [0.5, 0]]],
    '>': [5.6, [[0, 0], [0.7, 3], [5.6, 3], [3.6, 5.2], [5.6, 3], [3.6, 0.8], [5.6, 3], [5.6, 0]]],
  };
  const tw = (str, s) => { let w = 0; for (const c of str) w += GL[c][0] * XS + GAP; return (w - GAP) * s; };

  // ---------------- the stylus path builder: everything is one connected polyline ----------------
  function Pen(x, y, seed) { this.p = [[x, y]]; this.wt = [0]; this.f = false; this.marks = {}; this.r = H.rng(seed || 7); }
  Pen.prototype.cur = function () { return this.p[this.p.length - 1]; };
  Pen.prototype.fast = function () { this.f = true; return this; };
  Pen.prototype.slow = function () { this.f = false; return this; };
  Pen.prototype.mark = function (n) { this.marks[n] = this.p.length - 1; return this; };
  Pen.prototype.push = function (x, y) {
    const c = this.cur(); if (Math.abs(c[0] - x) < 0.01 && Math.abs(c[1] - y) < 0.01) return;
    this.p.push([x, y]); this.wt.push(this.f ? FAST : 1);
  };
  // straight move; diagonals become a slightly irregular staircase (one knob, then the other)
  Pen.prototype.to = function (x, y) {
    const [x0, y0] = this.cur(), ax = Math.abs(x - x0), ay = Math.abs(y - y0);
    if (ax < 0.6 || ay < 0.6) { this.push(x, y); return this; }
    // the staircase only depends on the two endpoints, so a retrace runs exactly over the same steps
    const fwd = x0 < x || (x0 === x && y0 < y), [sx, sy, ex, ey] = fwd ? [x0, y0, x, y] : [x, y, x0, y0];
    const r = H.rng((Math.round(sx * 7.1 + sy * 13.3 + ex * 17.9 + ey * 23.7) >>> 0) + 1);
    const dx = ex - sx, dy = ey - sy, n = Math.max(1, Math.round(Math.min(ax, ay) / 3.3), Math.ceil(Math.max(ax, ay) / 16));
    const S = []; let py = sy;
    for (let i = 1; i <= n; i++) {
      const j = i === n ? 1 : (i + (r() - 0.5) * 0.55) / n;
      const nx = sx + dx * j, ny = sy + dy * j;
      S.push([nx, py], [nx, ny]); py = ny;
    }
    if (fwd) for (const q of S) this.push(q[0], q[1]);
    else { for (let i = S.length - 2; i >= 0; i--) this.push(S[i][0], S[i][1]); this.push(sx, sy); }
    return this;
  };
  Pen.prototype.rel = function (pts, ox, oy, k) { for (const [x, y] of pts) this.to(ox + x * k, oy + y * k); return this; };
  Pen.prototype.arc = function (cx, cy, r, a0, a1, n) {
    n = n || Math.max(8, Math.ceil(Math.abs(a1 - a0) * r / 9));
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; this.to(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    return this;
  };
  // lettering: pen must already sit on the baseline left of x (ltr) or right of the text end (rtl)
  Pen.prototype.text = function (str, x, base, s, rtl, markPrefix) {
    const pos = []; let cx = x;
    for (const c of str) { pos.push(cx); cx += (GL[c][0] * XS + GAP) * s; }
    const idx = [...Array(str.length).keys()]; if (rtl) idx.reverse();
    for (const i of idx) {
      const g = GL[str[i]][1], pts = rtl ? g.slice().reverse() : g;
      for (const [gx, gy] of pts) this.to(pos[i] + gx * XS * s, base - gy * s);
      if (markPrefix) this.mark(markPrefix + i);
    }
    return this;
  };
  Pen.prototype.arrow = function (x1, y1, hd) {
    const [x0, y0] = this.cur(), d = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / d, uy = (y1 - y0) / d;
    this.to(x1, y1);
    const bx = x1 - ux * hd, by = y1 - uy * hd, px = -uy * hd * 0.62, py = ux * hd * 0.62;
    this.to(bx + px, by + py); this.to(x1, y1); this.to(bx - px, by - py); this.to(x1, y1);
    return this;
  };
  // timing: keys = [[markName, t], ...] (+ 'start'); weights make retraces quicker than new lines
  Pen.prototype.done = function (keys) {
    const P = this.p, E = [0];
    for (let i = 1; i < P.length; i++) E.push(E[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]) * this.wt[i]);
    this.E = E;
    this.keys = keys.map(([m, t]) => [m === 'start' ? 0 : m === 'end' ? E[E.length - 1] : E[this.marks[m]], t]);
    this.t0 = keys[0][1]; this.t1 = keys[keys.length - 1][1];
    return this;
  };
  Pen.prototype.effAt = function (t) {
    const K = this.keys;
    if (t <= K[0][1]) return K[0][0];
    for (let i = 1; i < K.length; i++) if (t < K[i][1]) return K[i - 1][0] + (K[i][0] - K[i - 1][0]) * (t - K[i - 1][1]) / (K[i][1] - K[i - 1][1]);
    return K[K.length - 1][0];
  };
  // -> { n: last full point index, pt: stylus position }
  Pen.prototype.at = function (t) {
    const e = this.effAt(t), E = this.E;
    let lo = 0, hi = E.length - 1;
    if (e >= E[hi]) return { n: hi, pt: this.p[hi] };
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (E[m] <= e) lo = m; else hi = m; }
    const f = (e - E[lo]) / Math.max(1e-6, E[hi] - E[lo]), a = this.p[lo], b = this.p[hi];
    return { n: lo, pt: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f] };
  };
  Pen.prototype.timeOf = function (m) { // time the stylus reaches a mark
    const e = this.E[this.marks[m]], K = this.keys;
    for (let i = 1; i < K.length; i++) if (e <= K[i][0] + 1e-6) return K[i - 1][1] + (K[i][1] - K[i - 1][1]) * (e - K[i - 1][0]) / Math.max(1e-6, K[i][0] - K[i - 1][0]);
    return this.t1;
  };

  // ---------------- doodles (relative coords, y down) ----------------
  const F_CAT = [[-12, 30], [-24, 24], [-31, 10], [-32, -5], [-21, -5], [-15, -11], [-9, -5], [-15, 1], [-21, -5], [-32, -5], [-32, -12], [-30, -37], [-15, -23], [15, -23], [30, -37], [32, -12], [32, -5], [21, -5], [15, -11], [9, -5], [15, 1], [21, -5], [32, -5], [31, 10], [24, 24], [12, 30],
    [0, 30], [0, 17], [-8, 21], [-13, 17], [-8, 21], [0, 17], [8, 21], [13, 17], [8, 21], [0, 17], [0, 11], [-6, 5], [6, 5], [0, 11], [-47, 6], [0, 11], [-47, 16], [0, 11], [47, 6], [0, 11], [47, 16], [0, 11], [0, 30], [12, 30]];
  const F_DOG = [[-12, 30], [-22, 24], [-27, 10], [-27, -3], [-18, -3], [-18, -9], [-10, -9], [-10, -1], [-18, -1], [-18, -3], [-27, -3], [-27, -9], [-34, 10], [-45, 6], [-42, -20], [-25, -28], [25, -28], [42, -20], [45, 6], [34, 10], [27, -9], [27, -3], [18, -3], [18, -9], [10, -9], [10, -1], [18, -1], [18, -3], [27, -3], [27, 10], [22, 24], [12, 30],
    [0, 30], [0, 21], [-9, 25], [0, 21], [9, 25], [0, 21], [0, 13], [-9, 13], [-10, 8], [-7, 5], [7, 5], [10, 8], [9, 13], [0, 13], [0, 30], [12, 30]];
  // a bust: pen sits at (cx-50k, bottom) on a line; shoulders rise, face, shoulders fall to (cx+50k, bottom)
  function bust(P, F, cx, cy, k, bottom) {
    P.to(cx - 50 * k, bottom); P.to(cx - 48 * k, cy + 52 * k); P.to(cx - 30 * k, cy + 38 * k);
    P.rel(F, cx, cy, k);
    P.to(cx + 30 * k, cy + 38 * k); P.to(cx + 48 * k, cy + 52 * k); P.to(cx + 50 * k, bottom);
  }
  // boxy robot = the model. Enters and leaves at S = (cx-130k, top+200k), the body's left side.
  function robot(P, cx, top, k, s, tag) {
    const R = (x, y) => P.to(cx + x * k, top + y * k), PI = Math.PI;
    R(-130, 140); R(0, 140); R(0, 120); R(-100, 120); R(-100, 0); R(0, 0); R(0, -30);
    R(-9, -30); R(-9, -48); R(9, -48); R(9, -30); R(0, -30);
    P.fast(); R(0, 0); P.slow(); R(100, 0); R(100, 28);
    // brow line with two round eyes hanging from it
    R(45, 28); P.arc(cx + 45 * k, top + 46 * k, 18 * k, -PI / 2, PI * 1.5); R(-45, 28); P.arc(cx - 45 * k, top + 46 * k, 18 * k, -PI / 2, PI * 1.5); R(-100, 28);
    P.fast(); R(-100, 89); P.slow();
    // grille mouth
    R(-50, 89); R(-50, 78); R(50, 78); R(50, 100); R(-50, 100); R(-50, 89);
    for (const x of [-25, 0, 25]) { R(x, 89); R(x, 78); R(x, 100); R(x, 89); }
    R(50, 89); R(100, 89); R(100, 28); P.fast(); R(100, 89); P.slow(); R(100, 120); R(0, 120); P.fast(); R(0, 140); P.slow();
    if (tag) P.mark(tag + 'head');
    // chest gauge sitting under the neck, needle at 10 o'clock
    const gx = cx, gy = top + 185 * k, gr = 45 * k;
    P.arc(gx, gy, gr, -PI / 2, PI * 1.5); P.fast(); P.arc(gx, gy, gr, PI * 1.5, PI * 7 / 6, 4); P.slow();
    P.to(gx, gy); P.fast(); P.to(gx + Math.cos(PI * 7 / 6) * gr, gy + Math.sin(PI * 7 / 6) * gr); P.arc(gx, gy, gr, PI * 7 / 6, PI * 1.5, 4); P.slow();
    R(130, 140); R(130, 330); R(-130, 330); R(-130, 305);
    const w = tw('MODEL', s); P.to(cx - w / 2, top + 305 * k); P.text('MODEL', cx - w / 2, top + 305 * k, s); R(130, 305);
    P.fast(); R(-130, 305); P.slow(); R(-130, 200);
    if (tag) P.mark(tag + 'end');
  }
  // text standing on two little stubs above (dir=-1) or below (dir=+1) a box edge at y=edge
  function stilts(P, str, x, edge, base, s, rtl) {
    const w = tw(str, s);
    if (!rtl) { P.to(x, edge); P.to(x, base); P.text(str, x, base, s); P.to(x + w, base); P.to(x + w, edge); }
    else { P.to(x + w, edge); P.to(x + w, base); P.text(str, x, base, s, true); P.to(x, base); P.to(x, edge); }
  }

  // ---------------- the three explainer pages ----------------
  function buildExplainer() {
    // PAGE 1: question, labelled examples flowing into the model, the counter
    const A = new Pen(40, 62, 101);
    A.text('HOW DOES AI LEARN?', 40, 62, 6.2, false); A.mark('title');
    A.fast(); A.to(40, 62); A.slow(); A.to(40, 225); A.mark('margin');
    const card = (x0, F, label, tag) => {
      const x1 = x0 + 160, cx = x0 + 80;
      A.to(x1, 225); A.to(x1, 440); A.to(x0, 440); A.fast(); A.to(x0, 428); A.slow();
      const w = tw(label, 5.2); A.to(cx - w / 2, 428); A.text(label, cx - w / 2, 428, 5.2); A.mark(tag + 'label'); A.to(x1, 428);
      A.fast(); A.to(x1, 385); A.slow(); A.to(x0, 385); A.fast(); A.to(cx - 50 * 1.42, 385); A.slow();
      bust(A, F, cx, 302, 1.42, 385); A.mark(tag + 'face');
      A.to(x1, 385); A.fast(); A.to(x1, 440); A.slow();
    };
    card(40, F_CAT, 'CAT', 'cat'); A.mark('cat');
    A.to(230, 440); A.to(230, 225); card(230, F_DOG, 'DOG', 'dog'); A.mark('dog');
    A.fast(); A.to(390, 310); A.slow();
    for (const mx of [428, 492, 556]) { A.to(mx, 310); A.to(mx, 281); A.to(mx + 28, 281); A.to(mx + 28, 310); }
    A.arrow(670, 310, 20); A.mark('arrow');
    robot(A, 800, 110, 1, 5, 'r'); A.mark('robot');
    A.fast(); A.to(670, 440); A.slow(); A.to(390, 440); A.fast(); A.to(40, 440); A.slow(); A.to(40, 515); A.mark('cstart');
    A.text('1,000,000', 40, 515, 8.6, false, 'c'); A.mark('count');
    { const ex = 40 + tw('1,000,000', 8.6) + 34; A.to(ex, 515); A.text('EXAMPLES', ex, 515, 5.6); } A.mark('end');
    A.done([['start', 0], ['title', 1.3], ['margin', 1.55], ['catlabel', 1.85], ['cat', 2.55], ['dog', 3.4], ['arrow', 3.85], ['rhead', 4.5], ['robot', 5.0], ['cstart', 5.25], ['count', 5.85], ['end', 6.25]]);

    // PAGE 2: guess -> check -> adjust -> guess again
    const B = new Pen(...A.cur(), 202);
    B.to(330, 515); B.to(330, 170); B.to(40, 170); B.to(40, 515); B.to(45, 515);
    bust(B, F_CAT, 185, 360, 2.8, 515); B.to(330, 515); B.mark('photo');
    B.fast(); B.to(330, 310); B.slow(); B.arrow(426, 310, 16); B.mark('in');
    robot(B, 530, 150, 0.8, 4.3, 'r'); B.mark('robot');
    // GUESS rides the speech tail from the head into bubble 1
    B.fast(); B.to(426, 262); B.to(530, 262); B.to(530, 246); B.to(610, 246); B.to(610, 200); B.slow();
    B.to(626, 200); B.text('GUESS', 626, 200, 5.2); B.to(750, 200); B.mark('guess');
    B.to(750, 232);
    { const w = tw('DOG?', 8), x = 875 - w / 2; B.to(x, 232); B.to(x, 206); B.text('DOG?', x, 206, 8); B.to(x + w, 206); B.to(x + w, 232); B.mark('dog');
      B.to(1000, 232); B.to(1000, 120); B.to(750, 120); B.to(750, 200); B.mark('bub1');
      // CHECK: scribble the wrong guess out
      B.fast(); B.to(750, 232); B.to(x, 232); B.to(x, 206); B.slow(); B.mark('scrib0');
      let xx = x - 4, up = true; while (xx < x + w) { xx += 12; B.to(Math.min(xx, x + w + 2), up ? 150 : 210); up = !up; }
      B.mark('scrib'); B.fast(); B.to(x + w, 206); B.to(x + w, 232); B.to(1000, 232); B.to(1000, 215); B.slow(); }
    B.to(1012, 215); B.to(1080, 140); B.to(1046, 178); B.to(1012, 140); B.to(1080, 215); B.mark('x');
    B.to(1084, 215); B.to(1084, 108); B.text('CHECK', 1084 - tw('CHECK', 5.2), 108, 5.2, true); B.mark('check');
    B.fast(); B.to(1084, 108); B.slow(); B.to(1084, 268); B.mark('check2');
    // ADJUST rides the error arrow back to the model's gauge: a new needle
    { const w = tw('ADJUST', 5.2); B.to(1046, 268); B.text('ADJUST', 1046 - w, 268, 5.2, true); }
    B.mark('adjust');
    B.to(660, 268); B.arrow(560, 279, 16); B.mark('arrowIn');
    B.to(530, 298); B.mark('needle');
    // second guess: CAT + check mark
    B.fast(); B.to(560, 279); B.to(660, 268); B.slow(); B.to(660, 360); B.to(750, 360); B.mark('tail2');
    { const w = tw('CAT', 8), x = 875 - w / 2; B.to(750, 412); B.to(x, 412); B.to(x, 388); B.text('CAT', x, 388, 8); B.to(x + w, 388); B.to(x + w, 412); }
    B.mark('cat');
    B.to(1000, 412); B.to(1000, 310); B.to(750, 310); B.to(750, 360); B.mark('bub2');
    B.fast(); B.to(750, 412); B.to(1000, 412); B.slow(); B.to(1036, 412); B.to(1036, 404); B.to(1012, 372); B.to(1036, 404); B.mark('tick0'); B.to(1082, 318); B.mark('end');
    B.done([['start', 7.0], ['photo', 7.75], ['in', 7.9], ['rhead', 8.32], ['robot', 8.62], ['guess', 8.92], ['dog', 9.15], ['bub1', 9.35], ['scrib0', 9.42], ['scrib', 9.64], ['x', 9.84], ['check', 10.03], ['check2', 10.1], ['adjust', 10.33], ['arrowIn', 10.46], ['needle', 10.52], ['cat', 10.84], ['bub2', 10.96], ['tick0', 11.03], ['end', 11.12]]);

    // PAGE 3: accuracy staircase (numbers ride the treads), 97% double-traced and boxed, takeaway
    const C = new Pen(...B.cur(), 303);
    C.to(1082, 62); C.to(40, 62); C.mark('rule');
    C.text('ACCURACY', 40, 62, 6); C.mark('acc');
    C.fast(); C.to(62, 62); C.slow(); C.to(62, 318); C.arrow(668, 318, 16); C.fast(); C.to(62, 318); C.to(62, 275); C.slow(); C.mark('axes');
    const steps = [[61, 275], [70, 234], [77, 201], [90, 142]];
    steps.forEach(([v, y], i) => {
      const x0 = 62 + i * 110, lab = v + '%';
      C.to(x0 + 14, y); C.text(lab, x0 + 14, y, 4.6, false); C.mark('v' + i); C.to(x0 + 110, y);
      C.to(x0 + 110, i < 3 ? steps[i + 1][1] : 110);
    });
    C.mark('climb');
    C.to(600, 110); C.to(686, 110); C.to(686, 262); C.to(704, 262); C.mark('n0');
    C.text('97%', 704, 262, 16.5, false, 'n'); C.mark('num');
    const nw = tw('97%', 16.5);
    C.fast(); C.to(704 + nw + 4, 262); C.to(704 + nw + 4, 258); C.slow();
    C.text('97%', 708, 258, 16.5, true); C.mark('double');
    C.fast(); C.to(708, 258); C.to(680, 258); C.slow(); C.to(680, 284); C.to(938, 284); C.to(938, 136); C.to(680, 136); C.to(680, 284); C.mark('box');
    C.to(674, 290); C.to(944, 290); C.to(944, 130); C.to(674, 130); C.to(674, 290); C.mark('box2');
    // takeaway in two big lines; the arrow's line drops down to the second line
    C.to(674, 340); C.to(40, 340); C.to(40, 412); C.mark('t0');
    C.text('MORE EXAMPLES >', 40, 412, 8.8); C.mark('t1');
    { const x1 = 40 + tw('MORE EXAMPLES >', 8.8); C.to(x1, 502); C.to(40, 502); }
    C.text('BETTER GUESSES', 40, 502, 8.8); C.mark('end');
    C.done([['start', 11.75], ['rule', 12.0], ['acc', 12.3], ['axes', 12.6], ['v0', 12.72], ['v1', 12.95], ['v2', 13.18], ['v3', 13.42], ['climb', 13.55], ['n0', 13.65], ['num', 14.0], ['double', 14.2], ['box2', 14.42], ['t0', 14.55], ['t1', 15.22], ['end', 15.9]]);

    return {
      D: 17.2,
      pages: [A, B, C],
      shakes: [{ t0: 6.35, t1: 7.0, page: 0 }, { t0: 11.12, t1: 11.75, page: 1 }],
      cams: [[0, 384, 175, 2.05], [0.7, 384, 175, 2.05], [1.5, 640, 361, 1], [9.3, 640, 361, 1], [9.55, 960, 250, 1.2], [10.0, 960, 250, 1.2], [10.3, 640, 361, 1], [13.55, 640, 361, 1], [13.8, 880, 300, 1.32], [14.35, 880, 300, 1.32], [14.6, 640, 361, 1]],
    };
  }

  // ---------------- clip / still: a microchip drawn in one line ----------------
  function buildClip() {
    // page 0: a leftover doodle (house + sun) that gets shaken away first
    const Z = new Pen(120, 470, 11);
    Z.to(1000, 470); Z.to(860, 470); Z.to(860, 330); Z.to(780, 250); Z.to(700, 330); Z.to(700, 470); Z.to(760, 470); Z.to(760, 400); Z.to(800, 400); Z.to(800, 470);
    Z.to(700, 470); Z.to(700, 330); Z.to(860, 330); Z.to(860, 200); Z.arc(860, 150, 50, Math.PI / 2, Math.PI * 2.5); Z.to(860, 150); Z.to(330, 150); Z.to(330, 92);
    Z.done([['start', -2], ['end', -1]]);
    // page 1: SILICON BRAIN + chip with pins, traces and pads
    const P = new Pen(330, 92, 23);
    P.text('SILICON BRAIN', 330, 92, 8.4, false); P.mark('title');
    P.fast(); P.to(548, 92); P.slow(); P.to(548, 150); P.to(507, 191); P.to(507, 236); P.mark('lead');
    const L = 438, R = 658, T = 236, Bt = 424, pin = 12, ph = 18;
    // pads at the end of traces
    const pad = (x, y) => {
      const [x0, y0] = P.cur(), d = Math.hypot(x - x0, y - y0), ux = (x - x0) / d, uy = (y - y0) / d, cx = x + ux * 9, cy = y + uy * 9, a0 = Math.atan2(-uy, -ux);
      P.to(x, y); P.arc(cx, cy, 9, a0, a0 + Math.PI * 2, 8); P.fast(); P.to(x0, y0); P.slow();
    };
    const traces = {
      t0: [[0, -28], [-60, -88], [-162, -88]], t5: [[0, -38], [50, -88], [188, -88]],
      r0: [[44, 0], [94, -50], [224, -50]], r2: [[284, 0]], r4: [[54, 0], [104, 50], [244, 50]],
      b1: [[0, 28], [36, 64], [116, 64]], b4: [[0, 58]], b6: [[0, 28], [-36, 64], [-124, 64]],
      l0: [[-40, 0], [-80, 40], [-200, 40]], l2: [[-270, 0]], l4: [[-50, 0], [-100, -50], [-220, -50]],
    };
    const tr = (key, x, y) => { const t = traces[key]; if (!t) return; for (const [dx, dy] of t.slice(0, -1)) P.to(x + dx, y + dy); const e = t[t.length - 1]; pad(x + e[0], y + e[1]); P.fast(); for (let i = t.length - 2; i >= 0; i--) P.to(x + t[i][0], y + t[i][1]); P.to(x, y); P.slow(); };
    // outline clockwise from the top-left corner with crenellated pins
    P.to(L, T);
    for (let i = 0; i < 7; i++) { const x = L + 18 + i * 30; P.to(x, T); P.to(x, T - ph); P.to(x + pin / 2, T - ph); tr('t' + i, x + pin / 2, T - ph); P.to(x + pin, T - ph); P.to(x + pin, T); }
    P.to(R, T);
    for (let i = 0; i < 6; i++) { const y = T + 18 + i * 30; P.to(R, y); P.to(R + ph, y); P.to(R + ph, y + pin / 2); tr('r' + i, R + ph, y + pin / 2); P.to(R + ph, y + pin); P.to(R, y + pin); }
    P.to(R, Bt);
    for (let i = 0; i < 7; i++) { const x = R - 18 - i * 30; P.to(x, Bt); P.to(x, Bt + ph); P.to(x - pin / 2, Bt + ph); tr('b' + i, x - pin / 2, Bt + ph); P.to(x - pin, Bt + ph); P.to(x - pin, Bt); }
    P.to(L, Bt);
    for (let i = 0; i < 6; i++) { const y = Bt - 18 - i * 30; P.to(L, y); P.to(L - ph, y); P.to(L - ph, y - pin / 2); tr('l' + i, L - ph, y - pin / 2); P.to(L - ph, y - pin); P.to(L, y - pin); }
    P.to(L, T); P.mark('chip');
    // pin-1 marker, bond wire, die with AI standing on its floor
    P.to(458, 256); P.arc(464, 262, 6, Math.PI * 1.25, Math.PI * 3.25, 8); P.to(498, 280);
    P.to(598, 280); P.to(598, 380);
    { const w = tw('AI', 7.5); P.to(548 + w / 2, 380); P.text('AI', 548 - w / 2, 380, 7.5, true); }
    P.to(498, 380); P.to(498, 280); P.mark('end');
    P.done([['start', 0.95], ['title', 2.0], ['lead', 2.2], ['chip', 4.9], ['end', 5.75]]);
    return { D: 7, pages: [Z, P], shakes: [{ t0: 0.12, t1: 0.82, page: 0 }], cams: [[0, 640, 361, 1], [5.8, 640, 361, 1], [7, 640, 361, 1.025]] };
  }

  let EX = null, CL = null;
  const getEx = () => EX || (EX = buildExplainer());
  const getClip = () => CL || (CL = buildClip());

  // ---------------- textures (cached) ----------------
  let BASE = null, MASK = null, LINE = null, TOYL = null;
  // built at 2x (drawn scaled 0.5) so the camera push-ins (up to 2.05x) show real powder grain, not blown-up pixels
  function screenBase() {
    if (BASE) return BASE;
    const SW = SCR.w * 2, SH = SCR.h * 2;
    const c = H.layer(SW, SH), g = c.getContext('2d');
    g.scale(2, 2);
    const gr = g.createLinearGradient(0, 0, SCR.w * 0.7, SCR.h * 1.2);
    gr.addColorStop(0, '#d2d1cb'); gr.addColorStop(0.5, '#c4c3bc'); gr.addColorStop(1, '#adaca5');
    g.fillStyle = gr; g.fillRect(0, 0, SCR.w, SCR.h);
    // mottled powder density (coarse noise, smoothed up)
    const m = H.layer(140, 70), mg = m.getContext('2d'), nz = H.makeNoise(31), mi = mg.createImageData(140, 70);
    for (let y = 0; y < 70; y++) for (let x = 0; x < 140; x++) {
      const v = nz.fbm2(x * 0.06, y * 0.09, 3), i = (y * 140 + x) * 4;
      const c0 = v > 0 ? 255 : 0; mi.data[i] = mi.data[i + 1] = mi.data[i + 2] = c0; mi.data[i + 3] = Math.min(255, Math.abs(v) * 90);
    }
    mg.putImageData(mi, 0, 0);
    g.imageSmoothingEnabled = true; g.globalAlpha = 0.3; g.drawImage(m, 0, 0, SCR.w, SCR.h); g.globalAlpha = 1;
    // fine grain (stronger per sub-pixel so it reads the same once averaged back to 1x) + metallic flakes as 2x2 specks
    const img = g.getImageData(0, 0, SW, SH), d = img.data, r = H.rng(77);
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 34;
      d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.96;
    }
    const nf = Math.round(SCR.w * SCR.h * 0.01);
    for (let k = 0; k < nf; k++) {
      const x = (r() * (SW - 2)) | 0, y = (r() * (SH - 2)) | 0, n = r() < 0.6 ? 34 : -26, big = r() < 0.3;
      for (let yy = 0; yy < (big ? 3 : 2); yy++) for (let xx = 0; xx < 2; xx++) { const i = ((y + yy) * SW + x + xx) * 4; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.96; }
    }
    g.putImageData(img, 0, 0);
    return (BASE = c);
  }
  // erase order: streaky, patchy field in [0,1] (half resolution)
  function eraseMask() {
    if (MASK) return MASK;
    const w = SCR.w >> 1, h = SCR.h >> 1, a = new Float32Array(w * h), nz = H.makeNoise(909);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const warp = nz.n2(x * 0.01, y * 0.02) * 30;
      a[y * w + x] = 0.6 * nz.fbm2((x + warp) * 0.006, y * 0.06, 3) + 0.4 * nz.fbm2(x * 0.02, y * 0.02, 2) + (y / h - 0.5) * 0.25;
    }
    const s = Array.from(a).sort((p, q) => p - q), lut = (v) => { let lo = 0, hi = s.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < v) lo = m + 1; else hi = m; } return lo / s.length; };
    for (let i = 0; i < a.length; i++) a[i] = lut(a[i]);
    return (MASK = { a, w, h });
  }

  // ---------------- drawing pieces ----------------
  const rr = (ctx, x0, y0, x1, y1, r) => { ctx.beginPath(); ctx.moveTo(x0 + r, y0); ctx.arcTo(x1, y0, x1, y1, r); ctx.arcTo(x1, y1, x0, y1, r); ctx.arcTo(x0, y1, x0, y0, r); ctx.arcTo(x0, y0, x1, y0, r); ctx.closePath(); };

  function tracePen(ctx, pen, upto) {
    const P = pen.p, n = upto ? upto.n : P.length - 1;
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i <= n; i++) ctx.lineTo(P[i][0], P[i][1]);
    if (upto) ctx.lineTo(upto.pt[0], upto.pt[1]);
  }
  // the scraped line: a faint bright powder ridge, the grey-dark groove, a darker core
  function ink(ctx, alpha) {
    ctx.lineJoin = 'miter'; ctx.miterLimit = 3; ctx.lineCap = 'square';
    ctx.strokeStyle = `rgba(232,231,224,${0.4 * alpha})`; ctx.lineWidth = 6.6; ctx.stroke();
    ctx.save();
    ctx.shadowColor = `rgba(246,245,239,${0.7 * alpha})`; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0.9; ctx.shadowOffsetY = 0.9;
    ctx.strokeStyle = `rgba(72,74,78,${0.95 * alpha})`; ctx.lineWidth = 3.2; ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = `rgba(42,43,46,${0.5 * alpha})`; ctx.lineWidth = 1.4; ctx.stroke();
  }

  function drawDesk(ctx) {
    const g = ctx.createRadialGradient(640, 300, 100, 640, 360, 1100);
    g.addColorStop(0, '#46585a'); g.addColorStop(0.6, '#2c3a3c'); g.addColorStop(1, '#151d1e');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3080, 2120);
  }

  function knob(ctx, K, a, w) {
    const { x, y, r } = K;
    ctx.save();
    // cast shadow on the red plastic
    ctx.fillStyle = 'rgba(70,0,6,0.55)'; ctx.shadowColor = 'rgba(60,0,4,0.7)'; ctx.shadowBlur = 14; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 9;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
    ctx.save();
    // knurled side ring
    let g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.2, x, y, r * 1.05);
    g.addColorStop(0, '#fffefa'); g.addColorStop(0.7, '#ebe7dc'); g.addColorStop(1, '#bdb7a8');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    const blur = H.clamp(1 - Math.abs(w) / 22), N = 40;
    for (let i = 0; i < N; i++) {
      const th = a + i * Math.PI * 2 / N, lit = 0.5 + 0.5 * Math.cos(th + 2.3);
      const c = Math.cos(th), s = Math.sin(th);
      ctx.strokeStyle = `rgba(120,110,92,${(0.18 + 0.35 * (1 - lit)) * (0.25 + 0.75 * blur)})`; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x + c * r * 0.82, y + s * r * 0.82); ctx.lineTo(x + c * r * 0.985, y + s * r * 0.985); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${(0.25 + 0.5 * lit) * (0.25 + 0.75 * blur)})`; ctx.lineWidth = 1.2;
      const t2 = th + 0.045, c2 = Math.cos(t2), s2 = Math.sin(t2);
      ctx.beginPath(); ctx.moveTo(x + c2 * r * 0.83, y + s2 * r * 0.83); ctx.lineTo(x + c2 * r * 0.98, y + s2 * r * 0.98); ctx.stroke();
    }
    if (blur < 1) { ctx.strokeStyle = `rgba(200,193,178,${0.5 * (1 - blur)})`; ctx.lineWidth = r * 0.15; ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, 7); ctx.stroke(); }
    // top face: gentle dome
    g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r * 0.8);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#f3f0e8'); g.addColorStop(1, '#d6d1c4');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 0.79, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(150,140,120,0.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r * 0.79, 0, 7); ctx.stroke();
    // injection sprue mark + parting tick: they turn with the knob
    const mx = x + Math.cos(a) * r * 0.42, my = y + Math.sin(a) * r * 0.42;
    ctx.strokeStyle = 'rgba(140,128,108,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx, my, 3.4, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,140,120,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a + Math.PI) * r * 0.55, y + Math.sin(a + Math.PI) * r * 0.55); ctx.lineTo(x + Math.cos(a + Math.PI) * r * 0.74, y + Math.sin(a + Math.PI) * r * 0.74); ctx.stroke();
    // fixed specular
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(x - r * 0.33, y - r * 0.42, r * 0.22, r * 0.1, -0.6, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawToy(ctx, st) {
    const { x0, y0, x1, y1, r } = BODY;
    // shadow + body
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 16;
    rr(ctx, x0, y0, x1, y1, r); ctx.fillStyle = '#b01219'; ctx.fill(); ctx.restore();
    let g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#f1403f'); g.addColorStop(0.06, '#de2228'); g.addColorStop(0.55, '#cc171e'); g.addColorStop(0.9, '#b01118'); g.addColorStop(1, '#8e0b12');
    rr(ctx, x0, y0, x1, y1, r); ctx.fillStyle = g; ctx.fill();
    ctx.save(); rr(ctx, x0, y0, x1, y1, r); ctx.clip();
    g = ctx.createRadialGradient(300, 90, 10, 300, 90, 760); g.addColorStop(0, 'rgba(255,140,120,0.32)'); g.addColorStop(1, 'rgba(255,140,120,0)');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    // edge roll: light catches the top/left rounded edge, bottom/right edge falls into shade
    ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(80,0,8,0.35)'; rr(ctx, x0 + 3, y0 + 3, x1 + 2, y1 + 2, r); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,190,180,0.35)'; rr(ctx, x0 + 3, y0 + 3, x1 - 3, y1 - 3, r - 3); ctx.stroke();
    // window reflections on the frame
    g = ctx.createLinearGradient(0, 640, 0, 714); g.addColorStop(0, 'rgba(255,220,215,0)'); g.addColorStop(0.35, 'rgba(255,220,215,0.10)'); g.addColorStop(1, 'rgba(255,220,215,0)');
    ctx.fillStyle = g; ctx.fillRect(170, 612, 940, 100);
    ctx.restore();
    // long specular streaks
    const streak = (ax, ay, bx, by, w, a) => {
      const sg = ctx.createLinearGradient(ax, ay, bx, by);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.18, `rgba(255,255,255,${a})`); sg.addColorStop(0.75, `rgba(255,255,255,${a * 0.8})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = sg; ctx.lineCap = 'round';
      for (const [lw, k] of [[w * 3.5, 0.18], [w * 1.8, 0.35], [w, 1]]) { ctx.globalAlpha = k; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
      ctx.globalAlpha = 1;
    };
    streak(110, 19, 1150, 19, 2.2, 0.75);
    streak(25, 110, 25, 560, 2.4, 0.5);
    streak(1255, 140, 1255, 520, 1.6, 0.22);
    streak(260, 698, 1020, 698, 1.4, 0.2);
    // corner glints
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x0 + r, y0 + r, r - 9, Math.PI * 1.06, Math.PI * 1.42); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x1 - r, y0 + r, r - 9, Math.PI * 1.6, Math.PI * 1.85); ctx.stroke();
    // a soft skewed window reflection on the top-right of the frame
    ctx.save(); rr(ctx, x0, y0, x1, y1, r); ctx.clip(); ctx.fillStyle = 'rgba(255,235,230,0.13)';
    ctx.beginPath(); ctx.moveTo(960, 8); ctx.lineTo(1040, 8); ctx.lineTo(1010, 40); ctx.lineTo(930, 40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(1052, 8); ctx.lineTo(1078, 8); ctx.lineTo(1048, 40); ctx.lineTo(1022, 40); ctx.closePath(); ctx.fill(); ctx.restore();
    // screen recess: the plastic lip slopes in
    g = ctx.createLinearGradient(0, BEZ.y0, 0, BEZ.y1);
    g.addColorStop(0, '#7c0a10'); g.addColorStop(0.5, '#a3121a'); g.addColorStop(1, '#e2353a');
    rr(ctx, BEZ.x0, BEZ.y0, BEZ.x1, BEZ.y1, BEZ.r); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,200,190,0.35)'; rr(ctx, BEZ.x0 - 1, BEZ.y0 - 1, BEZ.x1 + 1, BEZ.y1 + 1, BEZ.r + 1); ctx.stroke();

    // aluminium screen + drawing
    ctx.save(); rr(ctx, SCR.x, SCR.y, SCR.x + SCR.w, SCR.y + SCR.h, 10); ctx.clip();
    ctx.translate(SCR.x, SCR.y);
    ctx.drawImage(screenBase(), 0, 0, SCR.w, SCR.h);
    st.content(ctx);
    // glass-ish sheen: one broad soft diagonal band + faint grainy glitter on it
    g = ctx.createLinearGradient(140, 0, 560, 540);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.42, 'rgba(255,255,255,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0.16)'); g.addColorStop(0.58, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SCR.w, SCR.h);
    // inner lip shadow along top & left, light catch at the bottom
    g = ctx.createLinearGradient(0, 0, 0, 22); g.addColorStop(0, 'rgba(40,10,10,0.42)'); g.addColorStop(1, 'rgba(40,10,10,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SCR.w, 22);
    g = ctx.createLinearGradient(0, 0, 18, 0); g.addColorStop(0, 'rgba(40,10,10,0.3)'); g.addColorStop(1, 'rgba(40,10,10,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 18, SCR.h);
    g = ctx.createLinearGradient(0, SCR.h - 8, 0, SCR.h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0.3)');
    ctx.fillStyle = g; ctx.fillRect(0, SCR.h - 8, SCR.w, 8);
    ctx.restore();

    knob(ctx, KNOBS[0], st.kL, st.wL);
    knob(ctx, KNOBS[1], st.kR, st.wR);
  }

  // ---------------- one frame of a "show" (pages + shakes + camera) ----------------
  function camAt(cams, t) {
    let c = cams[0];
    for (let i = 1; i < cams.length; i++) {
      if (t < cams[i][0]) { const a = cams[i - 1], b = cams[i], u = H.ease.inOut(H.clamp((t - a[0]) / (b[0] - a[0]))); c = [t, H.lerp(a[1], b[1], u), H.lerp(a[2], b[2], u), H.lerp(a[3], b[3], u)]; break; }
      c = cams[i];
    }
    let [, cx, cy, z] = c;
    const hw = 640 / z, hh = 360 / z;
    cx = H.clamp(cx, hw + 4, 1276 - hw); cy = H.clamp(cy, hh + 2, 718 - hh);
    return { cx, cy, z };
  }
  function penState(show, t) { // which page is live, how far drawn, where the stylus is
    const { pages, shakes } = show;
    for (const s of shakes) if (t >= s.t0 && t < s.t1) return { page: s.page, upto: null, pt: pages[s.page].cur(), shake: s };
    let pi = 0;
    for (let i = 0; i < pages.length; i++) if (t >= pages[i].t0) pi = i;
    for (const s of shakes) if (t >= s.t1) pi = Math.max(pi, s.page + 1); // a shaken page is gone
    const pg = pages[pi], at = pg.at(t);
    return { page: pi, upto: at, pt: at.pt, shake: null };
  }
  function renderShow(ctx, show, t) {
    const st = penState(show, t), prev = penState(show, t - 1 / 30);
    const pt = st.pt, pp = prev.pt;
    const kL = pt[0] * KNOB_K, kR = -pt[1] * KNOB_K, wL = (pt[0] - pp[0]) * KNOB_K * 30, wR = (pp[1] - pt[1]) * KNOB_K * 30;
    const cam = camAt(show.cams, t);
    const sh = st.shake;
    let shk = null;
    if (sh) {
      const tt = t - sh.t0, u = tt / (sh.t1 - sh.t0);
      shk = (dt) => { const q = tt - dt, e = Math.pow(Math.max(0, Math.sin(Math.PI * H.clamp(q / (sh.t1 - sh.t0)))), 0.55); return { dx: e * 34 * Math.sin(2 * Math.PI * 5.6 * q), dy: e * 20 * Math.sin(2 * Math.PI * 7.1 * q + 0.8), rot: e * 0.045 * Math.sin(2 * Math.PI * 4.4 * q + 1.4), sc: 1 + e * 0.025 }; };
      st.erase = H.smooth(0.08, 0.92, u);
    }
    const content = (c) => {
      // ghosts of everything shaken away before
      for (let i = 0; i < st.page; i++) { tracePen(c, show.pages[i], null); ink(c, i === st.page - 1 ? 0.04 : 0.012); }
      if (sh) {
        // the live page fades out in patchy, streaky bands
        const L = LINE || (LINE = H.layer(SCR.w, SCR.h)), lc = L.getContext('2d', { willReadFrequently: true });
        lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, SCR.w, SCR.h);
        tracePen(lc, show.pages[st.page], null); ink(lc, 1);
        const M = eraseMask(), img = lc.getImageData(0, 0, SCR.w, SCR.h), d = img.data, thr = st.erase * 1.3 - 0.16;
        for (let y = 0; y < SCR.h; y++) {
          const row = (y >> 1) * M.w;
          for (let x = 0; x < SCR.w; x++) {
            const i = (y * SCR.w + x) * 4 + 3; if (!d[i]) continue;
            const m = H.clamp((M.a[row + (x >> 1)] - thr) / 0.12);
            d[i] = d[i] * (0.075 + 0.925 * m);
          }
        }
        lc.putImageData(img, 0, 0);
        c.drawImage(L, 0, 0);
        // powder sloshing back over the screen: soft bright streaks that come and go
        const e = Math.sin(Math.PI * H.clamp((t - sh.t0) / (sh.t1 - sh.t0)));
        const r = H.rng(Math.floor(t * 30) + 5);
        for (let k = 0; k < 7; k++) {
          const y = r() * SCR.h, h = 10 + r() * 40, g = c.createLinearGradient(0, y, 0, y + h);
          g.addColorStop(0, 'rgba(225,224,218,0)'); g.addColorStop(0.5, `rgba(225,224,218,${0.22 * e})`); g.addColorStop(1, 'rgba(225,224,218,0)');
          c.fillStyle = g; c.fillRect(0, y, SCR.w, h);
        }
      } else {
        tracePen(c, show.pages[st.page], st.upto); ink(c, 1);
      }
      // stylus tip
      c.fillStyle = 'rgba(30,31,34,0.9)'; c.beginPath(); c.arc(pt[0], pt[1], 2.6, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(pt[0] - 0.8, pt[1] - 0.8, 0.9, 0, 7); c.fill();
    };
    const state = { content, kL, kR, wL, wR };
    const camT = (c) => { c.translate(640, 360); c.scale(cam.z, cam.z); c.translate(-cam.cx, -cam.cy); };
    ctx.save(); camT(ctx); drawDesk(ctx); ctx.restore();
    if (!shk) { ctx.save(); camT(ctx); drawToy(ctx, state); ctx.restore(); return; }
    // shaking: render the toy once, composite it at three sub-frame positions for motion blur
    const TL = TOYL || (TOYL = H.layer(1280, 720)), tc = TL.getContext('2d');
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, 1280, 720);
    tc.save(); camT(tc); drawToy(tc, state); tc.restore();
    [[0, 1], [1 / 90, 0.5], [2 / 90, 0.34]].forEach(([dt, a]) => {
      const s = shk(dt); ctx.save(); ctx.globalAlpha = a;
      ctx.translate(640 + s.dx, 380 + s.dy); ctx.rotate(s.rot); ctx.scale(s.sc, s.sc); ctx.translate(-640, -380);
      ctx.drawImage(TL, 0, 0, 1280, 720); ctx.restore();
    });
  }

  registerStyle({
    id: 'etch-sketch',
    name: 'Etch A Sketch Toy',
    category: 'Hand-Drawn',
    description: 'The classic red line-drawing toy: glossy rounded red plastic with hard specular streaks, two white knurled knobs, and a grainy silver aluminium-powder screen where everything is one thin dark line that never lifts: crisp horizontals and verticals, stair-stepped diagonals and curves, and visible travel lines joining every letter and shape.',
    motion: 'A shake clears the last doodle in patchy streaks, then the single line crawls out at time-lapse speed while the left knob turns with every horizontal move and the right knob with every vertical one.',
    fonts: [],
    frameT: 6.8,
    duration: 7,
    readsPixels: true,
    draw(ctx, W, H_, t) { renderShow(ctx, getClip(), t); },

    explainerDuration: 17.2,
    explainerNote: 'Every word and picture is one continuous stylus line with the knobs turning to match; the scene transition is shaking the toy so the drawing fades in streaks (leaving a faint ghost), arrows and labels are part of the same line (labels ride arrows and bubble edges), and numbers grow as they are written: 1,000,000 gains a zero at a time and the accuracy staircase writes 61%, 70%, 77%, 90% on its treads before a double-traced, boxed 97%.',
    explainer(ctx, W, H_, t) { renderShow(ctx, getEx(), t); },

    explainerSound(k) { etchSound(k); },
  });

  // ---------------- sound ----------------
  function etchSound(k) {
    const show = getEx(), [A, B, C] = show.pages, D = show.D;
    const at = (pg, m) => pg.timeOf(m);
    k.bed('room', 0, D, { gain: 0.32 });

    // knob grit: a soft gritty friction texture per knob (left = x, right = y), density and level follow stylus speed
    k.withMinor(() => {
      const r = H.rng(4141), dt = 1 / 60;
      for (const pg of show.pages) {
        let prev = pg.at(pg.t0).pt;
        for (let t = pg.t0 + dt; t <= pg.t1 + 1e-6; t += dt) {
          const pt = pg.at(t).pt, vx = Math.abs(pt[0] - prev[0]) / dt, vy = Math.abs(pt[1] - prev[1]) / dt; prev = pt;
          [[vx, -0.55, 1], [vy, 0.55, 0.85]].forEach(([v, pan, fk]) => {
            if (v < 30 || r() > Math.min(1, v / 1400)) return;
            const lv = Math.pow(Math.min(1, v / 2600), 0.6);
            k.noise(t - dt + r() * dt, { dur: 0.022 + r() * 0.02, filter: 'bandpass', f: (800 + r() * 1100) * fk, q: 1.3, gain: 0.1 * lv, a: 0.003, pan: pan + (r() - 0.5) * 0.15 });
            if (r() < 0.5) k.noise(t - dt, { dur: 0.05, color: 'brown', filter: 'lowpass', f: 420, gain: 0.09 * lv, a: 0.01, pan: pan * 0.6 });
          });
        }
      }
    });

    // soft plastic tap when a drawing is finished (stylus pauses / changes job)
    const tap = (t, g = 1, minor = true) => k.play('tock', t, { f: 430, gain: 0.32 * g, pan: 0, minor });
    ['title', 'cat', 'dog', 'robot'].forEach((m) => tap(at(A, m)));
    ['photo', 'robot', 'bub1', 'bub2'].forEach((m) => tap(at(B, m)));
    ['acc', 'axes', 'climb', 'box2'].forEach((m) => tap(at(C, m)));

    // camera pull-back from the question: a quiet smooth slide
    k.noise(0.7, { dur: 0.8, color: 'pink', filter: 'lowpass', f: [[0, 300], [0.5, 900], [0.8, 400]], gain: 0.05, a: 0.35, minor: true });

    // 1,000,000: a low tock as each zero lands, then the count settles
    for (let i = 1; i < 9; i++) if (i !== 1 && i !== 5) k.play('tock', at(A, 'c' + i), { f: 560 + i * 25, gain: 0.26, minor: true });
    k.play('tock', at(A, 'count') + 0.02, { f: 480, gain: 0.5 });

    // the shake: plastic body knocks + styrene beads rattling at every reversal, aluminium powder hiss underneath
    for (const sh of show.shakes) {
      const dur = sh.t1 - sh.t0, r = H.rng(sh.t0 * 100);
      k.noise(sh.t0, { dur: dur + 0.25, color: 'pink', filter: 'highpass', f: 2200, gain: 0.16, a: 0.12, hold: dur * 0.5 });
      k.noise(sh.t0, { dur: dur + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 700], [dur, 1400]], q: 0.7, gain: 0.08, a: 0.1 });
      for (let n = 0; ; n++) {
        const q = (0.5 + n) / 11.2; if (q > dur - 0.03) break;
        const e = Math.pow(Math.sin(Math.PI * q / dur), 0.55), t = sh.t0 + q;
        k.play('tock', t, { f: 300 + r() * 80, gain: 0.5 * e, pan: (n % 2 ? 0.3 : -0.3) });
        for (let j = 0; j < 5; j++) k.noise(t + j * 0.006 + r() * 0.012, { dur: 0.008, filter: 'bandpass', f: 1800 + r() * 1400, q: 3, gain: 0.22 * e, a: 0.001, pan: (r() - 0.5) * 0.8 });
      }
    }

    // wrong guess: scribble starts -> low descending toy tones; the X lands with a soft knock
    k.play('error', at(B, 'scrib0') + 0.02, { f: 'G3', gain: 0.75 });
    k.play('tock', at(B, 'x'), { f: 300, gain: 0.45 });
    // ADJUST arrow reaches the gauge: a little plastic click as the new needle goes in
    k.play('click', at(B, 'needle'), { f: 900, gain: 0.5 });
    k.play('tock', at(B, 'needle') + 0.05, { f: 520, gain: 0.3, minor: true });
    // correct guess: warm rising toy tones as the check mark finishes
    const toy = (t, notes, g, step) => notes.forEach((n, i) => { k.tone(t + i * step, { f: n, type: 'triangle', dur: 0.55, gain: 0.16 * g, a: 0.006, verb: 0.15 }); k.tone(t + i * step, { f: SOUND.hz(n) * 2, type: 'sine', dur: 0.25, gain: 0.04 * g }); });
    toy(at(B, 'end') - 0.02, ['C4', 'E4', 'G4'], 1, 0.075);
    k.play('pop', at(B, 'end') - 0.02, { f: 330, gain: 0.35 });

    // accuracy treads: a soft count tock as each new number is written
    ['v0', 'v1', 'v2', 'v3'].forEach((m, i) => k.play('tock', at(C, m), { f: 520 + i * 60, gain: 0.32, minor: true }));
    // 97%: the big chunk + warm chord
    const T97 = at(C, 'num');
    k.play('thud', T97, { f: 120, gain: 1.0 });
    k.noise(T97, { dur: 0.05, filter: 'bandpass', f: 1100, q: 1.8, gain: 0.45 });
    k.noise(T97 + 0.012, { dur: 0.03, filter: 'bandpass', f: 600, q: 2, gain: 0.35 });
    ['C3', 'G3', 'C4', 'E4'].forEach((n, i) => k.tone(T97 + 0.02, { f: n, type: 'triangle', dur: 1.4, gain: 0.07, a: 0.01, verb: 0.25, pan: (i - 1.5) * 0.2 }));
    // takeaway lands: gentle resolving toy chime
    const TK = at(C, 'end');
    toy(TK, ['G3', 'C4', 'E4', 'G4'], 0.9, 0.09);
    k.play('ding', TK + 0.28, { f: 'C5', gain: 0.35 });
  }
}
```
