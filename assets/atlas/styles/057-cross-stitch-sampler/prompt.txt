I want an animated explainer made in the "Cross-Stitch Sampler" visual style (Paper & Craft). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
Name: Cross-Stitch Sampler
Family: Paper & Craft
Look: Pixel art worked as real counted cross-stitch on cream aida: every cell is an X of two-strand floss with sheen and twist, top legs all leaning the same way, dark backstitch outlines, all stretched in a wooden hoop.
Motion: The design fills in stitch by stitch in chart order, the needle hopping row to row trailing its floss, while the hoop drifts gently.
How it explains: One long sampler slides through the hoop from motif to motif; everything is stitched cell by cell with the needle chasing the newest stitch, arrows and outlines are backstitch laid one hole at a time, numbers are re-stitched in a 3x5 sampler font, and the wrong guess gets a red running-stitch ring.

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

REFERENCE STYLE SOURCE (styles/cross-stitch.js; W/H_ are always 1280x720)
```js
{
  const TAU = Math.PI * 2;
  // 5x7 sampler alphabet
  const FONT = {
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    ',': ['00', '00', '00', '00', '00', '01', '10'],
    ' ': ['00', '00', '00', '00', '00', '00', '00'],
  };
  const HEART = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  const FLOWER = ['01010', '11111', '01210', '11111', '01010'];

  // =====================================================================
  // EXPLAINER: one long sampler; the cloth slides through the hoop from
  // motif to motif. Everything is stitched cell by cell; arrows are backstitch.
  // =====================================================================
  const F7 = {
    ...FONT,
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  };
  const F3 = {
    A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['011', '100', '100', '100', '011'],
    D: ['110', '101', '101', '101', '110'], E: ['111', '100', '110', '100', '111'], G: ['011', '100', '101', '101', '011'],
    H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'], J: ['001', '001', '001', '101', '010'],
    K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'], M: ['10001', '11011', '10101', '10001', '10001'],
    N: ['1001', '1101', '1011', '1001', '1001'], O: ['010', '101', '101', '101', '010'], P: ['110', '101', '110', '100', '100'],
    R: ['110', '101', '110', '101', '101'], S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
    U: ['101', '101', '101', '101', '111'], W: ['10001', '10001', '10101', '11011', '10001'], X: ['101', '101', '010', '101', '101'],
    Y: ['101', '101', '010', '010', '010'], '?': ['110', '001', '010', '000', '010'], '%': ['100', '001', '010', '100', '001'],
    ',': ['00', '00', '00', '01', '10'], ' ': ['00', '00', '00', '00', '00'], '>': ['00100', '00010', '11111', '00010', '00100'],
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['110', '001', '010', '100', '111'],
    3: ['110', '001', '010', '001', '110'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '110', '001', '110'],
    6: ['011', '100', '110', '101', '010'], 7: ['111', '001', '010', '010', '010'], 8: ['010', '101', '010', '101', '010'], 9: ['010', '101', '011', '001', '110'],
  };
  const XPAL = { R: '#c43a46', N: '#2e3760', T: '#5fb3a9', t: '#3f8c86', Y: '#f2c14e', O: '#ef8a3c', B: '#a8673c', D: '#5e3a22', K: '#2a2433', P: '#e98aa0', p: '#c4566f', G: '#4f9a52', W: '#dfe3e8', g: '#9aa0a8' };
  const ICON = {
    cat: ['O.......O', 'OO.....OO', 'OOOOOOOOO', 'OOKOOOKOO', 'OOOOOOOOO', 'OOOOPOOOO', '.OOOOOOO.', '..OOOOO..'],
    dog: ['DD.....DD', 'DDBBBBBDD', 'DBBBBBBBD', 'DBKBBBKBD', '.BBBBBBB.', '.BBBKBBB.', '..BBBBB..', '...BBB...'],
    brain: ['...PPPPPP...', '.PPpPPPPpPP.', 'PPPPPpPPPPPP', 'PpPPPPPPpPPP', 'PPPPpPPPPPpP', 'PPpPPPPpPPPP', '.PPPPPpPPPP.', '..PPPPPPPP..', '.....pp.....', '.....pp.....'],
    check: ['.......GG', '......GG.', 'GG...GG..', '.GG.GG...', '..GGG....'],
    x: ['RR...RR', '.RR.RR.', '..RRR..', '.RR.RR.', 'RR...RR'],
  };
  const XC = {};
  const xLeg = (c, x0, y0, x1, y1, rgb, rr) => {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
    c.lineCap = 'round'; c.strokeStyle = 'rgba(40,25,10,0.32)'; c.lineWidth = 5.8;
    c.beginPath(); c.moveTo(x0 + 0.7, y0 + 1.1); c.lineTo(x1 + 0.7, y1 + 1.1); c.stroke();
    for (let s = -1; s <= 1; s += 2) {
      const ox = nx * s * 1.25, oy = ny * s * 1.25, g = c.createLinearGradient(x0, y0, x1, y1);
      const dk = rgb.map((v) => v * 0.55), md = rgb.map((v) => Math.min(255, v * 1.08)), hi = rgb.map((v) => Math.min(255, v * 1.22 + 18));
      g.addColorStop(0, H.rgba(dk)); g.addColorStop(0.22, H.rgba(md)); g.addColorStop(0.5, H.rgba(s < 0 ? hi : md)); g.addColorStop(0.78, H.rgba(md)); g.addColorStop(1, H.rgba(dk));
      c.strokeStyle = g; c.lineWidth = 2.9; c.beginPath(); c.moveTo(x0 + ox, y0 + oy); c.lineTo(x1 + ox, y1 + oy); c.stroke();
      c.lineWidth = 0.7;
      for (let k = 2.2 + rr() * 1.5; k < len - 1.5; k += 2.3) {
        const px = x0 + ox + ux * k, py = y0 + oy + uy * k;
        c.strokeStyle = `rgba(255,255,255,${0.12 + rr() * 0.14})`; c.beginPath(); c.moveTo(px - nx * 1.3 - ux * 0.8, py - ny * 1.3 - uy * 0.8); c.lineTo(px + nx * 1.3 + ux * 0.8, py + ny * 1.3 + uy * 0.8); c.stroke();
      }
    }
  };
  const xSprite = (key, v, half) => {
    const id = key + v + (half ? 'h' : '');
    if (XC[id]) return XC[id];
    const S = 12, P = 4, cv = H.layer(S + P * 2, S + P * 2), c = cv.getContext('2d'), rr = H.rng(key.charCodeAt(0) * 31 + v * 7);
    const rgb = H.hex(XPAL[key]).map((x) => x * (0.96 + rr() * 0.08));
    xLeg(c, P + 1, P + S - 1, P + S - 1, P + 1, rgb.map((x) => x * 0.9), rr);
    if (!half) xLeg(c, P + 1, P + 1, P + S - 1, P + S - 1, rgb, rr);
    return (XC[id] = cv);
  };

  const EXPLAIN = (ctx, W, H_, t) => {
    const S = 12, HC = [640, 372], HR = 548, HW = 30;
    const seg = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    // the cloth slides through the hoop (in whole-cell steps of motion blur-free px)
    const camX = 1200 * seg(1.85, 2.35) + 408 * seg(5.6, 6.2) + 1200 * seg(10.1, 10.8);
    const cam = Math.round(camX);

    // ---------- aida (per-pixel, scrolls with the cloth) ----------
    if (!XC.lut) {
      const lut = new Float32Array(S * S);
      for (let fy = 0; fy < S; fy++) for (let fx = 0; fx < S; fx++) {
        const dx = Math.min(fx + 0.5, S - fx - 0.5), dy = Math.min(fy + 0.5, S - fy - 0.5);
        const hole = Math.exp(-(dx * dx + dy * dy) / 1.9), groove = Math.exp((-dx * dx) / 0.9) * 0.5 + Math.exp((-dy * dy) / 0.9) * 0.5;
        const sx = fx < S / 2 ? 0 : 1, sy = fy < S / 2 ? 0 : 1, horiz = (sx + sy) % 2 === 0, ph = horiz ? fy : fx, along = horiz ? fx : fy;
        lut[fy * S + fx] = 1 - hole * 0.42 - groove * 0.13 + (Math.cos((ph * TAU) / 3) * 0.5 + Math.cos((along * TAU) / 6 + ph) * 0.15) * 0.06;
      }
      XC.lut = lut;
      const cn = new Float32Array(4096), r = H.rng(2024); for (let i = 0; i < 4096; i++) cn[i] = r.gauss() * 0.018; XC.cn = cn;
      const out = new Float32Array(W * H_), nz = H.makeNoise(11);
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const dist = Math.hypot(x - HC[0], y - HC[1]);
        if (dist <= HR) { out[y * W + x] = 1; continue; }
        const a = Math.atan2(y - HC[1], x - HC[0]), fold = Math.sin(a * 38 + nz.n2(x * 0.01, y * 0.01) * 4) * 0.5 + nz.n2(x * 0.006, y * 0.006) * 0.6;
        out[y * W + x] = 0.78 + fold * 0.11 - Math.min(0.14, (dist - HR) * 0.0007);
      }
      XC.shade = out;
    }
    {
      const img = ctx.createImageData(W, H_), d = img.data, lut = XC.lut, cn = XC.cn, sh = XC.shade, rn = H.rng(7 + Math.floor(t * 12));
      for (let y = 0; y < H_; y++) {
        const fy = y % S, cy = (y / S) | 0;
        for (let x = 0; x < W; x++) {
          const wx = x + cam, fx = wx % S, cx = (wx / S) | 0;
          const v = (lut[fy * S + fx] + cn[(cy * 97 + cx * 13) & 4095] + (rn() - 0.5) * 0.05) * sh[y * W + x];
          const k = (y * W + x) * 4;
          d[k] = 238 * v; d[k + 1] = 230 * v; d[k + 2] = 211 * v; d[k + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      const g = ctx.createRadialGradient(470 + t * 12, 280, 50, 640, 372, 660);
      g.addColorStop(0, 'rgba(255,250,235,0.18)'); g.addColorStop(1, 'rgba(60,40,20,0.12)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
    }

    // ---------- chart: every stitch gets a time ----------
    const cells = []; // [col,row,key,time]
    const block = (pat, c0, r0, map, t0, t1, order = 'row') => {
      const list = [];
      pat.forEach((row, ry) => [...row].forEach((ch, rx) => { const k = map ? map[ch] : ch; if (k && XPAL[k]) list.push([c0 + rx, r0 + ry, k]); }));
      if (order === 'col') list.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      if (order === 'up') list.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      list.forEach((c, i) => cells.push([...c, t0 + ((t1 - t0) * i) / Math.max(1, list.length)]));
    };
    const text3 = (str, c0, r0, key, t0, t1, scale = 1) => {
      const rows = ['', '', '', '', ''].map(() => '');
      for (const ch of str) { const g = F3[ch] || F3[' ']; for (let i = 0; i < 5; i++) rows[i] += g[i].replace(/1/g, 'x').replace(/0/g, '.') + '.'; }
      const pat = scale === 1 ? rows : rows.flatMap((r) => { const rr = [...r].map((c) => c + c).join(''); return [rr, rr]; });
      block(pat, c0, r0, { x: key }, t0, t1, 'col');
      return (pat[0].length);
    };
    const text7 = (str, c0, r0, key, t0, t1) => {
      const rows = Array(7).fill('');
      for (const ch of str) { const g = F7[ch] || F7[' ']; for (let i = 0; i < 7; i++) rows[i] += g[i].replace(/1/g, 'x').replace(/0/g, '.') + '.'; }
      block(rows, c0, r0, { x: key }, t0, t1, 'col');
    };
    const iconMap = { O: 'O', K: 'K', P: 'P', p: 'p', D: 'D', B: 'B', G: 'G', R: 'R' };

    // BEAT 1: the question
    text7('HOW DOES', 30, 16, 'R', 0.1, 0.85);
    text7('AI LEARN?', 27, 26, 'N', 0.8, 1.6);
    // BEAT 2: labelled examples stack up, model on the right
    const s1 = 100;
    const counterT = Math.floor(t * 6) / 6;
    const n = Math.round(1e6 * Math.pow(H.clamp((counterT - 2.8) / 2.4), 2));
    if (t > 2.2) {
      const w = text3(n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), s1 + 16, 8, 'Y', 0, 0);
      text3('EXAMPLES', s1 + 18 + w, 8, 'T', 2.2, 2.6);
    }
    const kinds = ['cat', 'dog', 'dog', 'cat', 'cat', 'dog'];
    kinds.forEach((k, i) => {
      const c0 = s1 + 16 + (i % 3) * 13, r0 = 19 + Math.floor(i / 3) * 16, t0 = 2.35 + i * 0.45;
      block(ICON[k], c0, r0, iconMap, t0, t0 + 0.3);
      text3(k.toUpperCase(), c0 + 1, r0 + 9, k === 'cat' ? 'O' : 'D', t0 + 0.28, t0 + 0.4);
    });
    block(ICON.brain, 172, 22, iconMap, 2.0, 2.5);
    text3('MODEL', 170, 34, 'p', 2.5, 2.7);
    // BEAT 3: guess / check / adjust
    block(ICON.cat, 155, 24, iconMap, 6.2, 6.45);
    const dialAng = Math.floor(H.clamp((t - 8.9) / 0.6) * 6) * (t < 9.6 ? 1 : 1);
    [0, 1, 2].forEach((i) => {
      const c0 = 169 + i * 7, r0 = 40;
      block(['.ggg.', 'ggggg', 'ggggg', 'ggggg', '.ggg.'], c0, r0, null, 2.6 + i * 0.05, 2.7 + i * 0.05);
      const ring = [[2, 0], [3, 0.5], [4, 2], [3, 3.5], [2, 4], [1, 3.5], [0, 2], [1, 0.5]];
      const pos = ring[((i * 3 + dialAng * (i % 2 ? 1 : 3)) % 8 + 8) % 8];
      cells.push([c0 + Math.round(pos[0]), r0 + Math.round(pos[1]), 'K', 3.05 + i * 0.05 + (t > 8.9 ? 0 : 0)]);
      cells.push([c0 + 2, r0 + 2, 'K', 3.05]);
    });
    text3('GUESS', 184, 21, 'N', 7.15, 7.35);
    const wrong = t < 9.55;
    text3(wrong ? 'DOG?' : 'CAT', 209, 25, wrong ? 'N' : 'G', wrong ? 7.4 : 9.6, wrong ? 7.65 : 9.8, 1);
    if (wrong) { block(ICON.x, 222, 13, iconMap, 7.9, 8.05); text3('CHECK', 210, 39, 'R', 8.1, 8.3); }
    else block(ICON.check, 222, 13, iconMap, 9.85, 10.0);
    if (t < 9.55) text3('ADJUST', 186, 48, 'R', 8.7, 8.9);
    // BEAT 4: bars stitched from the bottom up, accuracy restitched as it counts
    const s3 = 234, accs = [61, 72, 80, 86, 90, 93, 95, 97];
    let shown = 61;
    accs.forEach((a, i) => {
      const hgt = Math.round(a * 0.22), t0 = 10.75 + i * 0.24, key = i === 7 ? 'R' : i % 2 ? 'T' : 'Y';
      const pat = Array.from({ length: hgt }, () => 'xxxx');
      block(pat, s3 + 22 + i * 6, 36 - hgt, { x: key }, t0, t0 + 0.24, 'up');
      if (t >= t0) shown = H.lerp(i ? accs[i - 1] : 61, a, H.clamp((t - t0) / 0.24));
    });
    if (t > 10.5) {
      text3('ACCURACY', s3 + 18, 6, 'T', 10.5, 10.8);
      text3(Math.round(Math.floor(shown * 2) / 2) + '%', s3 + 56, 3, t > 12.7 ? 'R' : 'N', 0, 0, 2);
      text3('ROUNDS', s3 + 40, 38, 'g', 10.8, 11.0);
    }
    // BEAT 5: takeaway
    text3('MORE EXAMPLES >', s3 + 22, 45, 'N', 13.0, 13.5);
    text3('BETTER GUESSES', s3 + 24, 51, 'R', 13.4, 13.9);

    // ---------- draw stitches (only what the hoop shows) ----------
    const rs = H.rng(77);
    let latest = null, lt = -1;
    cells.forEach(([c, r, key, tm]) => {
      const v = (c * 7 + r * 13) % 5, jx = ((c * 31 + r * 17) % 7) / 14 - 0.25, jy = ((c * 13 + r * 29) % 7) / 14 - 0.25;
      if (t < tm) return;
      const x = c * S - cam, y = r * S;
      if (x < -20 || x > W + 20 || Math.hypot(x + 6 - HC[0], y + 6 - HC[1]) > HR - 6) return;
      const half = t - tm < 0.06;
      ctx.drawImage(xSprite(key, v, half), x - 4 + jx, y - 4 + jy);
      if (tm > lt && tm > 0) { lt = tm; latest = [x + 12, y + 12, key]; }
    });
    void rs;
    // ---------- backstitch arrows / outlines (one stitch per cell edge, revealed in order) ----------
    // two-strand floss backstitch: each stitch runs hole to hole, inset so the aida hole shows between stitches
    const BSC = XC.bsc || (XC.bsc = {});
    const bsCols = (col, metal) => BSC[col + metal] || (BSC[col + metal] = (() => {
      const rgb = H.hex(col);
      return { dk: H.rgba(H.mix(rgb, [0, 0, 0], metal ? 0.45 : 0.4)), md: H.rgba(rgb), hi: metal ? 'rgba(255,243,192,0.95)' : H.rgba(H.mix(rgb, [255, 255, 255], 0.55), 0.8), tw: metal ? 'rgba(120,80,10,0.35)' : 'rgba(0,0,0,0.22)' };
    })());
    const bsSeg = (x0, y0, x1, y1, col, metal = false) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 4) return;
      const ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux, ins = 2.0;
      const ax = x0 + ux * ins, ay = y0 + uy * ins, bx = x1 - ux * ins, by = y1 - uy * ins;
      const cs = bsCols(col, metal), h = ((Math.round(x0 + cam) * 7 + Math.round(y0) * 13) % 9) / 9;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(20,10,5,0.3)'; ctx.lineWidth = 3.6;
      ctx.beginPath(); ctx.moveTo(ax + 0.8, ay + 1.3); ctx.lineTo(bx + 0.8, by + 1.3); ctx.stroke();
      // strand bodies: dark 1px edges, then the floss colour
      for (const [w, st] of [[3.1, cs.dk], [2.1, cs.md]]) {
        ctx.strokeStyle = st; ctx.lineWidth = w; ctx.beginPath();
        for (const sg of [-1, 1]) { const ox = nx * sg * 0.8, oy = ny * sg * 0.8; ctx.moveTo(ax + ox, ay + oy); ctx.lineTo(bx + ox, by + oy); }
        ctx.stroke();
      }
      // twist: the two strands wrap round each other in short diagonal ridges
      ctx.strokeStyle = cs.tw; ctx.lineWidth = 0.7; ctx.beginPath();
      for (let k = 1.6 + h * 1.6; k < len - 2 * ins - 0.8; k += 2.6) { const px = ax + ux * k, py = ay + uy * k; ctx.moveTo(px - nx * 1.3 - ux * 0.7, py - ny * 1.3 - uy * 0.7); ctx.lineTo(px + nx * 1.3 + ux * 0.7, py + ny * 1.3 + uy * 0.7); }
      ctx.stroke();
      // sheen along the lit strand (gold floss: broken twist highlights)
      ctx.strokeStyle = cs.hi; ctx.lineWidth = 0.75;
      if (metal) ctx.setLineDash([3, 4]), (ctx.lineDashOffset = -h * 7);
      ctx.beginPath(); ctx.moveTo(ax - nx * 1.0 + ux * 0.6, ay - ny * 1.0 + uy * 0.6); ctx.lineTo(bx - nx * 1.0 - ux * 0.6, by - ny * 1.0 - uy * 0.6); ctx.stroke();
      if (metal) ctx.setLineDash([]), (ctx.lineDashOffset = 0);
    };
    const bsPath = (pts, col, t0, t1) => { // pts in cell-corner units
      const steps = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n2 = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
        for (let k = 0; k < n2; k++) steps.push([ax + ((bx - ax) * k) / n2, ay + ((by - ay) * k) / n2, ax + ((bx - ax) * (k + 1)) / n2, ay + ((by - ay) * (k + 1)) / n2]);
      }
      const shown2 = Math.floor(steps.length * H.clamp((t - t0) / (t1 - t0)));
      for (let i = 0; i < shown2; i++) { const [a, b, c, d] = steps[i]; bsSeg(a * S - cam, b * S, c * S - cam, d * S, col); }
      if (shown2 > 0 && t < t1 + 0.05) { const [, , c, d] = steps[shown2 - 1]; latest = [c * S - cam, d * S, 'K']; lt = 99; }
    };
    const arrowPts = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];
    ctx.save(); ctx.beginPath(); ctx.arc(HC[0], HC[1], HR - 6, 0, TAU); ctx.clip();
    // flow arrow into the model
    bsPath(arrowPts(s1 + 53, 37, 171, 33), '#3d3548', 3.6, 4.2);
    bsPath([[168, 32], [171, 33], [169, 36]], '#3d3548', 4.2, 4.35);
    // loop arrows
    bsPath(arrowPts(165, 27, 171, 27), '#3d3548', 6.5, 6.8); bsPath([[169, 25], [171, 27], [169, 29]], '#3d3548', 6.8, 6.9);
    bsPath(arrowPts(185, 28, 203, 28), '#3d3548', 6.95, 7.2); bsPath([[201, 26], [203, 28], [201, 30]], '#3d3548', 7.2, 7.3);
    bsPath([[204, 20], [228, 20], [228, 34], [212, 34], [208, 37], [209, 34], [204, 34], [204, 20]], '#2e3760', 7.3, 7.6);
    if (wrong) {
      // emphasis: red running-stitch ring around the wrong guess
      const ringN = 30, rp = Math.floor(ringN * H.clamp((t - 7.85) / 0.45));
      for (let i = 0; i < rp; i += 2) {
        const a0 = (i / ringN) * TAU - 2, a1 = ((i + 1) / ringN) * TAU - 2;
        bsSeg(216 * S - cam + Math.cos(a0) * 215, 26 * S + Math.sin(a0) * 135, 216 * S - cam + Math.cos(a1) * 215, 26 * S + Math.sin(a1) * 135, '#c43a46');
      }
      bsPath([[204, 34], [204, 46], [190, 46]], '#c43a46', 8.35, 8.75);
      bsPath([[192, 44], [190, 46], [192, 48]], '#c43a46', 8.75, 8.85);
    }
    // chart axes
    bsPath([[s3 + 20, 12], [s3 + 20, 36], [s3 + 72, 36]], '#3d3548', 10.6, 10.9);
    if (t > 12.7) { // emphasis rays around 97%
      const k = Math.min(8, Math.floor((t - 12.7) * 24));
      for (let i = 0; i < k; i++) { const a = (i / 8) * TAU, cx = (s3 + 68) * S - cam, cy = 9 * S; const p0 = [cx + Math.cos(a) * 172, cy + Math.sin(a) * 74], p1 = [cx + Math.cos(a) * 200, cy + Math.sin(a) * 92], ns = Math.max(1, Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 11)); for (let j = 0; j < ns; j++) bsSeg(H.lerp(p0[0], p1[0], j / ns), H.lerp(p0[1], p1[1], j / ns), H.lerp(p0[0], p1[0], (j + 1) / ns), H.lerp(p0[1], p1[1], (j + 1) / ns), '#f2c14e', true); }
    }
    ctx.restore();

    // ---------- needle + floss at the newest stitch ----------
    if (latest) {
      const [lx, ly, key] = latest, nx0 = lx + 64, ny0 = ly + 30, ang = -0.5;
      ctx.lineCap = 'round';
      const fp = () => { ctx.beginPath(); ctx.moveTo(lx, ly); ctx.bezierCurveTo(lx + 36, ly + 60, nx0 + 36, ny0 + 70, nx0 + Math.cos(ang) * 64, ny0 + Math.sin(ang) * 64); };
      ctx.strokeStyle = 'rgba(30,15,5,0.25)'; ctx.lineWidth = 4; ctx.save(); ctx.translate(1.5, 3); fp(); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = XPAL[key] || '#c43a46'; ctx.lineWidth = 2.6; fp(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,235,225,0.35)'; ctx.lineWidth = 0.8; ctx.setLineDash([1.2, 2.2]); fp(); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(nx0, ny0); ctx.rotate(ang);
      ctx.fillStyle = 'rgba(30,20,10,0.3)'; ctx.beginPath(); ctx.ellipse(36, 6, 40, 3.2, 0, 0, TAU); ctx.fill();
      const ng = ctx.createLinearGradient(0, -3, 0, 3); ng.addColorStop(0, '#f4f6f8'); ng.addColorStop(0.35, '#b9c0c8'); ng.addColorStop(0.7, '#6f7780'); ng.addColorStop(1, '#a9b1ba');
      ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -2.4); ctx.lineTo(70, -2.6); ctx.quadraticCurveTo(76, 0, 70, 2.6); ctx.lineTo(10, 2.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e9e1cf'; ctx.beginPath(); ctx.ellipse(64, 0, 4.2, 1.1, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }

    // ---------- hoop (cached overlay) ----------
    ctx.drawImage(XC.hoop || (XC.hoop = (() => {
      const C = H.layer(W, H_), c = C.getContext('2d');
      c.save(); c.beginPath(); c.arc(HC[0], HC[1], HR, 0, TAU); c.clip();
      c.shadowColor = 'rgba(40,25,10,0.5)'; c.shadowBlur = 22; c.shadowOffsetX = 6; c.shadowOffsetY = 10;
      c.lineWidth = 40; c.strokeStyle = '#000'; c.beginPath(); c.arc(HC[0], HC[1], HR + 20, 0, TAU); c.stroke(); c.restore();
      c.save(); c.shadowColor = 'rgba(40,25,10,0.45)'; c.shadowBlur = 18; c.shadowOffsetX = 5; c.shadowOffsetY = 9;
      c.lineWidth = HW; c.strokeStyle = '#c99d66'; c.beginPath(); c.arc(HC[0], HC[1], HR + HW / 2, 0, TAU); c.stroke(); c.restore();
      const g = c.createRadialGradient(HC[0], HC[1], HR, HC[0], HC[1], HR + HW);
      [[0, '#a8794a'], [0.15, '#d9b07a'], [0.45, '#ecc994'], [0.8, '#d2a46c'], [1, '#9b6b3e']].forEach(([p, col]) => g.addColorStop(p, col));
      c.fillStyle = g; c.beginPath(); c.arc(HC[0], HC[1], HR + HW, 0, TAU); c.arc(HC[0], HC[1], HR, 0, TAU, true); c.fill('evenodd');
      const gr = H.rng(303);
      c.save(); c.beginPath(); c.arc(HC[0], HC[1], HR + HW, 0, TAU); c.arc(HC[0], HC[1], HR, 0, TAU, true); c.clip('evenodd');
      for (let i = 0; i < 70; i++) {
        const rr = HR + 2 + gr() * (HW - 4), a0 = gr() * TAU, al = gr.range(0.2, 1.4);
        c.strokeStyle = gr() < 0.7 ? `rgba(120,70,30,${gr.range(0.12, 0.3)})` : `rgba(255,235,200,${gr.range(0.15, 0.3)})`; c.lineWidth = gr.range(0.5, 1.6);
        c.beginPath(); for (let k = 0; k <= 30; k++) { const a = a0 + (al * k) / 30, w = Math.sin(a * 9 + i) * 1.2; const px = HC[0] + Math.cos(a) * (rr + w), py = HC[1] + Math.sin(a) * (rr + w); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
      }
      c.restore();
      c.strokeStyle = 'rgba(255,240,210,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(HC[0], HC[1], HR + HW - 1, Math.PI * 0.95, Math.PI * 1.75); c.stroke();
      c.strokeStyle = 'rgba(90,55,25,0.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(HC[0], HC[1], HR + 0.5, 0, TAU); c.stroke();
      H.vignette(c, W, H_, 0.35, '50,30,10');
      return C;
    })()), 0, 0);
  };

  registerStyle({
    id: 'cross-stitch',
    name: 'Cross-Stitch Sampler',
    category: 'Paper & Craft',
    description: 'Pixel art worked as real counted cross-stitch on cream aida: every cell is an X of two-strand floss with sheen and twist, top legs all leaning the same way, dark backstitch outlines, all stretched in a wooden hoop.',
    motion: 'The design fills in stitch by stitch in chart order, the needle hopping row to row trailing its floss, while the hoop drifts gently.',
    fonts: [],
    frameT: 5.8,
    duration: 6,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'One long sampler slides through the hoop from motif to motif; everything is stitched cell by cell with the needle chasing the newest stitch, arrows and outlines are backstitch laid one hole at a time, numbers are re-stitched in a 3x5 sampler font, and the wrong guess gets a red running-stitch ring.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: a needle and floss through aida held in a wooden hoop. While anything is being stitched, the needle
    // punches through and the floss is drawn after it (one pass about every 0.1 s, never one per cell); backstitch
    // arrows are the same with a darker floss; the cloth slides through the hoop as a soft fabric drag; counters are
    // re-stitched one needle pass per change; the hoop itself is the drum for the big hits; a scissor snip ends it.
    // Windows mirror the block()/text3()/bsPath() times in EXPLAIN() above (cloth slides 1.85-2.35, 5.6-6.2, 10.1-10.8).
    explainerSound(k) {
      const seg = (t, a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const camX = (t) => 1200 * seg(t, 1.85, 2.35) + 408 * seg(t, 5.6, 6.2) + 1200 * seg(t, 10.1, 10.8);
      const pan = (col, t) => H.clamp(((col * 12 - camX(t)) / 1280) * 2 - 1, -1, 1) * 0.6;
      let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      // one needle pass: punch through the cloth, then the floss drawn after it
      const pass = (t, g = 1, p = 0, dark = 1, minor = true) => {
        k.noise(t, { dur: 0.02, filter: 'bandpass', f: 950 * dark, q: 1.4, gain: 0.34 * g, a: 0.001, pan: p, minor });
        k.noise(t, { dur: 0.035, color: 'brown', filter: 'lowpass', f: 420, gain: 0.24 * g, a: 0.001, pan: p, minor });
        const pd = 0.06 + rnd() * 0.03;
        k.noise(t + 0.025, { dur: pd, filter: 'bandpass', f: [[0, 1700 * dark], [pd, 1150 * dark]], q: 0.9, gain: 0.2 * g, a: pd * 0.6, pan: p, minor });
      };
      // stitching windows [t0, t1, col, gain, dark]; passes are merged across overlapping windows and thinned
      const W = [
        [0.1, 0.85, 45, 1], [0.8, 1.6, 44, 1], // HOW DOES / AI LEARN?
        [2.0, 2.5, 178, 0.9], [2.2, 2.6, 125, 0.8], [2.5, 2.7, 175, 0.8], [2.6, 2.75, 178, 0.6], // brain, EXAMPLES, MODEL, dials
        ...[0, 1, 2, 3, 4, 5].map((i) => [2.35 + i * 0.45, 2.75 + i * 0.45, 120 + (i % 3) * 13, 0.85]), // examples + labels
        [3.6, 4.35, 160, 0.9, 0.8], // backstitch flow arrow
        [6.2, 6.45, 159, 0.9], [6.5, 6.9, 168, 0.8, 0.8], [6.95, 7.3, 194, 0.8, 0.8], [7.15, 7.35, 190, 0.8], // cat, loop arrows, GUESS
        [7.3, 7.6, 216, 0.8, 0.8], [7.4, 7.65, 214, 0.9], // bubble outline, DOG?
        [8.1, 8.3, 216, 0.8], [8.35, 8.85, 198, 0.9, 0.8], [8.7, 8.9, 194, 0.8], // CHECK, red arrow, ADJUST
        [9.6, 9.8, 214, 0.9], // CAT
        [10.5, 10.8, 263, 0.8], [10.6, 10.9, 270, 0.8, 0.8], [10.8, 11.0, 280, 0.7], // ACCURACY, axes, ROUNDS
        [13.0, 13.5, 265, 1], [13.4, 13.9, 267, 1], // takeaway
      ];
      const passes = [];
      W.forEach(([a, b, col, g, dark = 1]) => { for (let t = a; t < b - 0.02; t += 0.1 + rnd() * 0.025) passes.push([t, col, g, dark]); });
      passes.sort((x, y) => x[0] - y[0]);
      let lastT = -1;
      for (const [t, col, g, dark] of passes) if (t - lastT >= 0.085) { pass(t, g * (0.85 + rnd() * 0.25), pan(col, t), dark, t > 0.15); lastT = t; }

      // cloth slides through the hoop: a soft fabric drag against the wooden ring
      const drag = (t, d, g = 1) => {
        k.noise(t, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 380], [d * 0.5, 800], [d + 0.1, 380]], q: 0.6, gain: 0.13 * g, a: d * 0.45 });
        k.noise(t, { dur: d + 0.1, color: 'brown', filter: 'lowpass', f: 300, gain: 0.09 * g, a: d * 0.5 });
      };
      const hoop = (t, g = 1, p = 0) => { // knock on the taut cloth / wooden hoop
        k.tone(t, { f: [[0, 150], [0.12, 80]], dur: 0.2, gain: 0.35 * g, pan: p });
        k.noise(t, { dur: 0.05, filter: 'bandpass', f: 600, q: 2, gain: 0.25 * g, pan: p });
      };

      k.bed('room', 0, 15, { gain: 0.4 });
      k.music('pad', 0.2, 14.8, { bpm: 60, gain: 0.22, chords: [['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['C3', 'E3', 'G3', 'Bb3']] });
      k.play('tock', 1.62, { f: 260, gain: 0.32 }); // floss pulled snug: the title is finished

      // BEAT 2
      drag(1.85, 0.5, 1);
      { // counter re-stitched on its 6 fps grid (n = 1e6 * ((floor(t*6)/6 - 2.8)/2.4)^2), 1,000,000 at 32/6 s
        for (let f = 17; f < 32; f++) pass(f / 6 + 0.002, 0.5, pan(125, f / 6), 1.25, true);
        hoop(32 / 6, 0.6, pan(125, 32 / 6));
      }

      // BEAT 3
      drag(5.6, 0.6, 0.7);
      // wrong guess (7.85): red X stitched, red running-stitch ring, a hard yank and a knock on the hoop
      k.noise(7.85, { dur: 0.16, filter: 'bandpass', f: [[0, 1800], [0.16, 900]], q: 0.8, gain: 0.3, a: 0.01, pan: 0.5 }); // floss yanked tight
      hoop(7.86, 1.3, 0.45);
      k.tone(7.88, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 });
      k.tone(8.04, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.22, filter: 'lowpass', f2: 600 });
      for (let i = 1; i < 6; i++) pass(7.9 + i * 0.075, 0.7, 0.5, 1.1); // X cells + ring dashes
      for (let j = 1; j <= 6; j++) k.play('tock', 8.9 + j * 0.1, { f: 380, gain: 0.3, pan: pan(176, 9.2), minor: true }); // dial pointer jumps a cell
      // correction: the green tick is stitched (9.85)
      pass(9.85, 1.1, pan(224, 9.9), 1, false);
      k.play('success', 9.86, { f: 'G5', gain: 0.6, pan: pan(224, 9.9) });
      pass(9.95, 0.7, pan(224, 10));

      // BEAT 4: bars stitched bottom-up while the % is re-stitched: one pass per shown change, at most 10/s
      drag(10.1, 0.7, 1);
      {
        const accs = [61, 72, 80, 86, 90, 93, 95, 97];
        let last = -1, lt = -1;
        for (let t = 10.76; t < 12.7; t += 1 / 120) {
          const i = Math.min(7, Math.floor((t - 10.75) / 0.24)), t0 = 10.75 + i * 0.24;
          const v = Math.round(Math.floor(H.lerp(i ? accs[i - 1] : 61, accs[i], H.clamp((t - t0) / 0.24)) * 2) / 2);
          if (v !== last && t - lt >= 0.1) { pass(t, 0.8, pan(256 + i * 6, t), 0.9 + (v - 61) * 0.006); last = v; lt = t; }
        }
      }
      // 97% (12.7): turns red and gold rays are backstitched round it: the hoop thumps like a drum (biggest hit)
      k.play('impact', 12.7, { gain: 1.2, pan: 0.35 });
      hoop(12.7, 1.2, 0.35);
      k.play('ding', 12.7, { f: 'E5', gain: 0.6, pan: 0.3 });
      for (let i = 1; i < 4; i++) pass(12.7 + i * 0.09, 0.55, 0.35, 0.8);

      // BEAT 5: takeaway stitched (passes above), the thread is snipped, and it resolves
      k.noise(13.92, { dur: 0.025, filter: 'bandpass', f: 2300, q: 2, gain: 0.3, a: 0.001, pan: 0.3 });
      k.noise(13.96, { dur: 0.035, filter: 'bandpass', f: 1800, q: 1.6, gain: 0.32, a: 0.001, pan: 0.3 });
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 14.0 + i * 0.09, { f, gain: 0.46 - i * 0.04, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const S = 12, COLS = Math.ceil(W / S), ROWS = Math.ceil(H_ / S);
      const r = H.rng(2024), nz = H.makeNoise(11);
      const HC = [640, 372], HR = 548, HW = 30; // hoop

      // ---------- aida cloth (per-pixel, LUT for one cell) ----------
      const lut = new Float32Array(S * S);
      for (let fy = 0; fy < S; fy++) for (let fx = 0; fx < S; fx++) {
        const dx = Math.min(fx + 0.5, S - fx - 0.5), dy = Math.min(fy + 0.5, S - fy - 0.5);
        const hole = Math.exp(-(dx * dx + dy * dy) / 1.9);
        const groove = Math.exp((-dx * dx) / 0.9) * 0.5 + Math.exp((-dy * dy) / 0.9) * 0.5;
        const sx = fx < S / 2 ? 0 : 1, sy = fy < S / 2 ? 0 : 1, horiz = (sx + sy) % 2 === 0;
        const ph = horiz ? fy : fx, along = horiz ? fx : fy;
        const stripe = Math.cos((ph * TAU) / 3) * 0.5 + Math.cos((along * TAU) / 6 + ph) * 0.15;
        lut[fy * S + fx] = 1 - hole * 0.42 - groove * 0.13 + stripe * 0.06;
      }
      const img = ctx.createImageData(W, H_), d = img.data;
      const cellN = new Float32Array(COLS * ROWS);
      for (let i = 0; i < cellN.length; i++) cellN[i] = r.gauss() * 0.018;
      const base = [238, 230, 211];
      for (let y = 0; y < H_; y++) {
        const fy = y % S, cy = (y / S) | 0;
        for (let x = 0; x < W; x++) {
          const fx = x % S, cx = (x / S) | 0;
          const dist = Math.hypot(x - HC[0], y - HC[1]);
          let v = lut[fy * S + fx] + cellN[cy * COLS + cx] + (r() - 0.5) * 0.05;
          if (dist > HR) {
            // loose fabric outside the hoop: puckered, shaded folds
            const a = Math.atan2(y - HC[1], x - HC[0]);
            const fold = Math.sin(a * 38 + nz.n2(x * 0.01, y * 0.01) * 4) * 0.5 + nz.n2(x * 0.006, y * 0.006) * 0.6;
            v *= 0.78 + fold * 0.11 - Math.min(0.14, (dist - HR) * 0.0007);
          }
          const k = (y * W + x) * 4;
          d[k] = base[0] * v; d[k + 1] = base[1] * v; d[k + 2] = base[2] * v; d[k + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      // soft light falloff on the cloth
      {
        const g = ctx.createRadialGradient(470 + t * 30, 280, 50, 640, 372, 660);
        g.addColorStop(0, 'rgba(255,250,235,0.18)'); g.addColorStop(1, 'rgba(60,40,20,0.12)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- chart (pattern grid) ----------
      const grid = new Map(); // key col,row -> colour key
      const grpOf = new Map();
      let GRP = 0;
      const put = (c, rr, k) => { grid.set(c + ',' + rr, k); grpOf.set(c + ',' + rr, GRP); };
      const PAL = {
        R: '#c43a46', r: '#8f2335', N: '#2e3760', T: '#5fb3a9', t: '#3f8c86', l: '#9fd8cc', G: '#7fd36b', Y: '#f2c14e',
        S: '#495b8f', W: '#dfe3e8', K: '#2a2433', P: '#e98aa0', O: '#ef8a3c', g: '#4f9a52',
      };
      // title
      const title = 'HELLO, WORLD';
      let tw = 0;
      for (const ch of title) tw += FONT[ch][0].length + 1;
      tw -= 1;
      let cx = Math.round(COLS / 2 - tw / 2), ty = 8;
      for (let i = 0; i < title.length; i++) {
        const gl = FONT[title[i]], col = i < 6 ? 'R' : 'N';
        gl.forEach((row, ry) => [...row].forEach((b, rx) => { if (b === '1') put(cx + rx, ty + ry, col); }));
        cx += gl[0].length + 1;
      }
      // sampler border under title (alternating diamonds)
      GRP = 1;
      for (let c = 22; c <= COLS - 23; c++) {
        const m = (c - 22) % 6;
        if (m === 0 || m === 2) put(c, 18, 'Y'); else if (m === 1) { put(c, 17, 'g'); put(c, 19, 'g'); put(c, 18, 'R'); }
      }
      // computer
      GRP = 2;
      const C0 = Math.round(COLS / 2 - 13), R0 = 22;
      const comp = new Set();
      const cput = (c, rr, k) => { put(C0 + c, R0 + rr, k); comp.add(C0 + c + ',' + (R0 + rr)); };
      for (let rr = 0; rr < 18; rr++) for (let c = 1; c < 25; c++) {
        if ((rr === 0 || rr === 17) && (c === 1 || c === 24)) continue;
        const shade = c >= 23 || rr >= 16 ? 't' : rr === 0 || c === 1 ? 'l' : 'T';
        cput(c, rr, shade);
      }
      for (let rr = 2; rr < 13; rr++) for (let c = 4; c < 21; c++) cput(c, rr, 'N');
      cput(5, 3, 'S'); cput(6, 3, 'S'); cput(5, 4, 'S');
      // friendly face on screen
      [[9, 5], [9, 6], [16, 5], [16, 6]].forEach(([c, rr]) => cput(c, rr, 'G'));
      [[8, 9], [9, 10], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10], [17, 9]].forEach(([c, rr]) => cput(c, rr, 'G'));
      [[7, 8], [18, 8]].forEach(([c, rr]) => cput(c, rr, 'P'));
      cput(5, 15, 'R');
      for (let c = 14; c < 21; c++) cput(c, 15, 'K');
      for (let rr = 18; rr < 20; rr++) for (let c = 10; c < 16; c++) cput(c, rr, rr === 18 ? 't' : 'T');
      for (let rr = 20; rr < 25; rr++) for (let c = -1; c < 27; c++) {
        if ((rr === 20 || rr === 24) && (c === -1 || c === 26)) continue;
        let k = rr === 24 || c === 26 ? 't' : 'T';
        if ((rr === 21 || rr === 23) && c > 0 && c < 25 && c % 2 === 1) k = 'W';
        if (rr === 22 && c > 3 && c < 22) k = c % 2 ? 'W' : 'T';
        cput(c, rr, k);
      }
      // hearts + flowers flanking
      GRP = 3;
      const motif = (pat, c0, r0, map) => pat.forEach((row, ry) => [...row].forEach((b, rx) => { if (b !== '0') put(c0 + rx, r0 + ry, map[b]); }));
      motif(HEART, C0 - 13, R0 + 5, { 1: 'R' });
      motif(HEART, C0 + 32, R0 + 5, { 1: 'R' });
      motif(FLOWER, C0 - 12, R0 + 15, { 1: 'P', 2: 'Y' });
      motif(FLOWER, C0 + 33, R0 + 15, { 1: 'O', 2: 'Y' });
      [[C0 - 10, R0 + 20], [C0 - 10, R0 + 21], [C0 + 35, R0 + 20], [C0 + 35, R0 + 21]].forEach(([c, rr]) => put(c, rr, 'g'));
      put(C0 - 11, R0 + 21, 'g'); put(C0 + 36, R0 + 21, 'g');
      // bottom border (work in progress: last stretch unstitched)
      GRP = 4;
      const bRow = 51, bStart = 26, bEnd = COLS - 27;
      const done = t < 3.9 ? bStart - 1 : Math.floor(H.lerp(bStart, bEnd, 0.86 * H.clamp((t - 3.9) / 2.1)));
      for (let c = bStart; c <= Math.min(done, bEnd); c++) {
        const m = (c - bStart) % 6;
        if (m === 0 || m === 2) put(c, bRow, 'Y'); else if (m === 1) { put(c, bRow - 1, 'g'); put(c, bRow + 1, 'g'); put(c, bRow, 'R'); }
      }

      // ---------- stitch sprites: 2-strand floss X with sheen & twist ----------
      const PADS = 4, SP = S + PADS * 2;
      const sprites = {};
      const legPaint = (c, x0, y0, x1, y1, rgb, rr) => {
        const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
        // shadow
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(40,25,10,0.32)'; c.lineWidth = 5.8;
        c.beginPath(); c.moveTo(x0 + 0.7, y0 + 1.1); c.lineTo(x1 + 0.7, y1 + 1.1); c.stroke();
        // two strands
        for (let s = -1; s <= 1; s += 2) {
          const ox = nx * s * 1.25, oy = ny * s * 1.25;
          const g = c.createLinearGradient(x0, y0, x1, y1);
          const dk = rgb.map((v) => v * 0.55), md = rgb.map((v) => Math.min(255, v * 1.08)), hi = rgb.map((v) => Math.min(255, v * 1.22 + 18));
          g.addColorStop(0, H.rgba(dk)); g.addColorStop(0.22, H.rgba(md)); g.addColorStop(0.5, H.rgba(s < 0 ? hi : md)); g.addColorStop(0.78, H.rgba(md)); g.addColorStop(1, H.rgba(dk));
          c.strokeStyle = g; c.lineWidth = 2.9;
          c.beginPath(); c.moveTo(x0 + ox, y0 + oy); c.lineTo(x1 + ox, y1 + oy); c.stroke();
          // twist ridges
          c.lineWidth = 0.7;
          for (let k = 2.2 + rr() * 1.5; k < len - 1.5; k += 2.3) {
            const px = x0 + ox + ux * k, py = y0 + oy + uy * k;
            c.strokeStyle = `rgba(255,255,255,${0.12 + rr() * 0.14})`;
            c.beginPath(); c.moveTo(px - nx * 1.3 - ux * 0.8, py - ny * 1.3 - uy * 0.8); c.lineTo(px + nx * 1.3 + ux * 0.8, py + ny * 1.3 + uy * 0.8); c.stroke();
            c.strokeStyle = 'rgba(0,0,0,0.12)';
            c.beginPath(); c.moveTo(px - nx * 1.0 - ux * 0.2, py - ny * 1.0 - uy * 0.2); c.lineTo(px + nx * 1.0 + ux * 1.2, py + ny * 1.0 + uy * 1.2); c.stroke();
          }
        }
      };
      const sprite = (key, v, half) => {
        const id = key + v + (half ? 'h' : '');
        if (sprites[id]) return sprites[id];
        const cv = H.layer(SP, SP), c = cv.getContext('2d'), rr = H.rng(id.charCodeAt(0) * 31 + v * 7);
        const rgb = H.hex(PAL[key]).map((x) => x * (0.96 + rr() * 0.08));
        const a = 1.0, b = S - 1.0;
        legPaint(c, PADS + a, PADS + b, PADS + b, PADS + a, rgb.map((x) => x * 0.9), rr); // under leg: / (darker)
        if (!half) legPaint(c, PADS + a, PADS + a, PADS + b, PADS + b, rgb, rr); // top leg: \  (all the same way)
        sprites[id] = cv;
        return cv;
      };
      // order by appearance (stitched in chart order: rows top->bottom)
      const keys = [...grid.keys()].map((k) => k.split(',').map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      // stitching schedule: Danish method - each row gets a pass of half-stitches (/) then crosses back (\)
      const WIN = [[0.15, 1.5], [1.4, 1.85], [1.75, 3.55], [3.15, 3.95]];
      const tim = new Map();
      WIN.forEach(([w0, w1], g) => {
        const cells = keys.filter(([c, rr]) => grpOf.get(c + ',' + rr) === g);
        const rows = [...new Set(cells.map((k) => k[1]))].sort((a, b) => a - b), rd = (w1 - w0) / rows.length;
        rows.forEach((row, ri) => {
          const rc = cells.filter((k) => k[1] === row).sort((a, b) => a[0] - b[0]), n = rc.length;
          rc.forEach(([c], k) => {
            const r0 = w0 + ri * rd;
            tim.set(c + ',' + row, [r0 + (k / n) * rd * 0.5, r0 + rd * 0.5 + ((n - 1 - k) / n) * rd * 0.5]);
          });
        });
      });
      const rs = H.rng(77);
      let latest = null, latestT = -1;
      keys.forEach(([c, rr]) => {
        const key = grid.get(c + ',' + rr);
        const x = c * S, y = rr * S;
        if (Math.hypot(x + S / 2 - HC[0], y + S / 2 - HC[1]) > HR - 6) return;
        const v = rs.int(0, 4), jx = rs.gauss() * 0.25, jy = rs.gauss() * 0.25;
        const tm = tim.get(c + ',' + rr) || [0, 0];
        if (t < tm[0]) return;
        const full = t >= tm[1];
        ctx.drawImage(sprite(key, v, !full), x - PADS + jx, y - PADS + jy);
        const lt = full ? tm[1] : tm[0];
        if (tim.has(c + ',' + rr) && lt >= latestT) { latestT = lt; latest = [c, rr, key, full]; }
      });

      // ---------- backstitch outline around the computer ----------
      const rb = H.rng(88);
      let bsVis = true;
      const bs = (x0, y0, x1, y1, col) => {
        const rr = rb;
        const j0 = rr.gauss() * 0.3, j1 = rr.gauss() * 0.3, j2 = rr.gauss() * 0.3, j3 = rr.gauss() * 0.3;
        if (!bsVis) return;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20,10,5,0.35)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0 + 0.6, y0 + 1); ctx.lineTo(x1 + 0.6, y1 + 1); ctx.stroke();
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, '#1b1622'); g.addColorStop(0.5, col); g.addColorStop(1, '#1b1622');
        ctx.strokeStyle = g; ctx.lineWidth = 2.1;
        ctx.beginPath(); ctx.moveTo(x0 + j0, y0 + j1); ctx.lineTo(x1 + j2, y1 + j3); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x0 * 0.8 + x1 * 0.2 - 0.5, y0 * 0.8 + y1 * 0.2 - 0.5); ctx.lineTo(x0 * 0.4 + x1 * 0.6 - 0.5, y0 * 0.4 + y1 * 0.6 - 0.5); ctx.stroke();
      };
      // backstitch travels around the outline after the cross stitches are done
      const ccx = (C0 + 12.5) * S, ccy = (R0 + 12) * S;
      const bsProg = (x, y, w0, w1) => { const a = (Math.atan2(y - ccy, x - ccx) + Math.PI * 1.5) % TAU; return t >= w0 + (a / TAU) * (w1 - w0); };
      comp.forEach((k) => {
        const [c, rr] = k.split(',').map(Number), x = c * S, y = rr * S;
        bsVis = bsProg(x, y, 3.45, 4.1);
        if (!comp.has(c + ',' + (rr - 1))) bs(x, y, x + S, y, '#3d3548');
        if (!comp.has(c + ',' + (rr + 1))) bs(x, y + S, x + S, y + S, '#3d3548');
        if (!comp.has(c - 1 + ',' + rr)) bs(x, y, x, y + S, '#3d3548');
        if (!comp.has(c + 1 + ',' + rr)) bs(x + S, y, x + S, y + S, '#3d3548');
      });
      // screen bezel backstitch
      {
        const x0 = (C0 + 4) * S, y0 = (R0 + 2) * S, x1 = (C0 + 21) * S, y1 = (R0 + 13) * S;
        for (let x = x0; x < x1; x += S) { bsVis = bsProg(x, y0, 3.7, 4.2); bs(x, y0, x + S, y0, '#2a2433'); bsVis = bsProg(x, y1, 3.7, 4.2); bs(x, y1, x + S, y1, '#2a2433'); }
        for (let y = y0; y < y1; y += S) { bsVis = bsProg(x0, y, 3.7, 4.2); bs(x0, y, x0, y + S, '#2a2433'); bsVis = bsProg(x1, y, 3.7, 4.2); bs(x1, y, x1, y + S, '#2a2433'); }
        bsVis = true;
      }

      // ---------- needle parked in the cloth, floss trailing to the last stitch ----------
      {
        let lx, ly, fcol = '#c43a46';
        if (done >= bStart) { lx = (Math.min(done, bEnd) + 1) * S; ly = bRow * S + S; }
        else if (latest) { lx = (latest[0] + 1) * S; ly = (latest[1] + (latest[3] ? 1 : 0)) * S; fcol = PAL[latest[2]]; }
        else { lx = 380; ly = 90; }
        const nx0 = lx + 70, ny0 = ly + 34, ang = -0.5;
        // floss from last stitch hole to the needle eye (loose, curvy)
        ctx.lineCap = 'round';
        const flossPath = () => { ctx.beginPath(); ctx.moveTo(lx, ly); ctx.bezierCurveTo(lx + 40, ly + 70, nx0 + 40, ny0 + 80, nx0 + Math.cos(ang) * 64, ny0 + Math.sin(ang) * 64); };
        ctx.strokeStyle = 'rgba(30,15,5,0.25)'; ctx.lineWidth = 4; ctx.save(); ctx.translate(1.5, 3); flossPath(); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = fcol; ctx.lineWidth = 2.6; flossPath(); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,220,220,0.35)'; ctx.lineWidth = 0.8; ctx.setLineDash([1.2, 2.2]); flossPath(); ctx.stroke(); ctx.setLineDash([]);
        // needle: tip dives into cloth at nx0,ny0
        ctx.save(); ctx.translate(nx0, ny0); ctx.rotate(ang);
        ctx.fillStyle = 'rgba(30,20,10,0.3)'; ctx.beginPath(); ctx.ellipse(36, 6, 40, 3.2, 0, 0, TAU); ctx.fill();
        const ng = ctx.createLinearGradient(0, -3, 0, 3);
        ng.addColorStop(0, '#f4f6f8'); ng.addColorStop(0.35, '#b9c0c8'); ng.addColorStop(0.7, '#6f7780'); ng.addColorStop(1, '#a9b1ba');
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -2.4); ctx.lineTo(70, -2.6); ctx.quadraticCurveTo(76, 0, 70, 2.6); ctx.lineTo(10, 2.4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e9e1cf'; ctx.beginPath(); ctx.ellipse(64, 0, 4.2, 1.1, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }

      // ---------- wooden hoop ----------
      {
        // inner shadow on taut cloth
        ctx.save();
        ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + 200, 0, TAU); ctx.arc(HC[0], HC[1], HR, 0, TAU, true); ctx.clip('evenodd');
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(HC[0], HC[1], HR, 0, TAU); ctx.clip();
        ctx.shadowColor = 'rgba(40,25,10,0.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 10;
        ctx.lineWidth = 40; ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + 20, 0, TAU); ctx.stroke();
        ctx.restore();
        // outer cast shadow on loose fabric
        ctx.save(); ctx.shadowColor = 'rgba(40,25,10,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 9;
        ctx.lineWidth = HW; ctx.strokeStyle = '#c99d66'; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW / 2, 0, TAU); ctx.stroke(); ctx.restore();
        // wood body with round profile shading
        const ring = (r0, r1, cols) => {
          const g = ctx.createRadialGradient(HC[0], HC[1], r0, HC[0], HC[1], r1);
          cols.forEach(([p, c]) => g.addColorStop(p, c));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(HC[0], HC[1], r1, 0, TAU); ctx.arc(HC[0], HC[1], r0, 0, TAU, true); ctx.fill('evenodd');
        };
        ring(HR, HR + HW, [[0, '#a8794a'], [0.15, '#d9b07a'], [0.45, '#ecc994'], [0.8, '#d2a46c'], [1, '#9b6b3e']]);
        // grain
        const gr = H.rng(303);
        ctx.save(); ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW, 0, TAU); ctx.arc(HC[0], HC[1], HR, 0, TAU, true); ctx.clip('evenodd');
        for (let i = 0; i < 70; i++) {
          const rr = HR + 2 + gr() * (HW - 4), a0 = gr() * TAU, al = gr.range(0.2, 1.4);
          ctx.strokeStyle = gr() < 0.7 ? `rgba(120,70,30,${gr.range(0.12, 0.3)})` : `rgba(255,235,200,${gr.range(0.15, 0.3)})`;
          ctx.lineWidth = gr.range(0.5, 1.6);
          ctx.beginPath();
          for (let k = 0; k <= 30; k++) { const a = a0 + (al * k) / 30, w = Math.sin(a * 9 + i) * 1.2; const px = HC[0] + Math.cos(a) * (rr + w), py = HC[1] + Math.sin(a) * (rr + w); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke();
        }
        ctx.restore();
        // lit top edge + inner ring sliver
        ctx.strokeStyle = 'rgba(255,240,210,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW - 1, Math.PI * 0.95, Math.PI * 1.75); ctx.stroke();
        ctx.strokeStyle = 'rgba(90,55,25,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + 0.5, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(90,55,25,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(HC[0], HC[1], HR + HW * 0.42, 0, TAU); ctx.stroke();
      }
      H.vignette(ctx, W, H_, 0.35, '50,30,10');
      H.grain(ctx, W, H_, 0.02, 5 + Math.floor(t * 12));
    },
  });
}
```
