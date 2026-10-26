I want an animated explainer made in the "Felt & Patchwork" visual style (Paper & Craft). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Fredoka
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=block">
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
Name: Felt & Patchwork
Family: Paper & Craft
Look: A cosy patchwork quilt of cotton prints with puffy quilted squares, topped with fuzzy felt appliqué edged in blanket stitch, button "nodes" sewn on and joined by running-stitch thread, plus an embroidered label.
Motion: Thread draws itself stitch by stitch between the buttons, felt pieces drop on with a soft squash, and the quilt breathes with a slow puff of the padding.
How it explains: The camera pans along one long patchwork quilt; felt pieces drop on with a lifted shadow and soft squash, arrows and emphasis rings are thread sewn on stitch by stitch, labels are woven tags stitched onto what they name, the counter is cut felt digits swapped as it climbs, and the model's weights are buttons whose thread-X turns when it adjusts.

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

REFERENCE STYLE SOURCE (styles/felt-quilt.js; W/H_ are always 1280x720)
```js
{
  const TAU = Math.PI * 2;
  const hx = (h) => H.hex(h);

  // ---- fabric prints (u,v local px) -> rgb ----
  const PRINTS = [
    { kind: 'gingham', a: hx('#c9634d'), b: hx('#f3eadb') },
    { kind: 'dots', a: hx('#e2b24a'), b: hx('#f7efdc') },
    { kind: 'stripes', a: hx('#8fae84'), b: hx('#eee4cf') },
    { kind: 'floral', a: hx('#d98f86'), b: hx('#f6d9cf'), c: hx('#fff5e6') },
    { kind: 'denim', a: hx('#5f7ea3'), b: hx('#8aa3c2') },
    { kind: 'linen', a: hx('#e9dcc2'), b: hx('#d8c8aa') },
    { kind: 'gingham', a: hx('#6f9a8a'), b: hx('#f1ecdf') },
    { kind: 'dots', a: hx('#b9563f'), b: hx('#f1d4bf') },
  ];
  const printCol = (p, u, v) => {
    switch (p.kind) {
      case 'gingham': {
        const a = Math.floor(u / 14) % 2, b = Math.floor(v / 14) % 2, n = a + b;
        return n === 2 ? p.a : n === 1 ? H.mix(p.a, p.b, 0.55) : p.b;
      }
      case 'dots': {
        const row = Math.floor(v / 20), ox = row % 2 ? 10 : 0;
        const du = ((u + ox) % 20) - 10, dv = (v % 20) - 10;
        return du * du + dv * dv < 20 ? p.b : p.a;
      }
      case 'stripes': return (u % 18) < 7 ? p.a : (u % 18) < 9 ? H.mix(p.a, p.b, 0.5) : p.b;
      case 'floral': {
        const row = Math.floor(v / 26), ox = row % 2 ? 13 : 0;
        const du = ((u + ox) % 26) - 13, dv = (v % 26) - 13, d = du * du + dv * dv;
        if (d < 5) return p.c;
        const pet = [[4, 0], [-4, 0], [0, 4], [0, -4]].some(([x, y]) => (du - x) ** 2 + (dv - y) ** 2 < 8);
        return pet ? p.b : p.a;
      }
      case 'denim': return ((u + v) % 5) < 2 ? p.b : p.a;
      default: return p.a;
    }
  };

  const HQ = {}; // hero quilt cache (per canvas size)
  const feltTex = (seed) => {
    const S = 256, cv = H.layer(S, S), x = cv.getContext('2d'), r = H.rng(seed);
    const img = x.createImageData(S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = r(); d[i] = d[i + 1] = d[i + 2] = n > 0.5 ? 255 : 0; d[i + 3] = Math.abs(n - 0.5) * 70; }
    x.putImageData(img, 0, 0);
    x.lineCap = 'round';
    for (let n = 0; n < 1400; n++) {
      const px = r() * S, py = r() * S, a = r() * TAU, l = r.range(2, 7);
      x.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${r.range(0.08, 0.2)})` : `rgba(0,0,0,${r.range(0.08, 0.18)})`;
      x.lineWidth = r.range(0.4, 0.9);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        x.beginPath(); x.moveTo(px + ox * S, py + oy * S);
        x.quadraticCurveTo(px + ox * S + Math.cos(a + 1) * l, py + oy * S + Math.sin(a + 1) * l, px + ox * S + Math.cos(a) * l * 1.6, py + oy * S + Math.sin(a) * l * 1.6);
        x.stroke();
      }
    }
    return cv;
  };

  // =====================================================================
  // EXPLAINER: the camera pans along one long quilt. Felt pieces drop on
  // with a lifted shadow, thread sews arrows and outlines on as we watch,
  // labels are woven tags stitched to what they name, buttons are the weights.
  // =====================================================================
  const FX = {};
  const fwalk = (pts, step, fn) => {
    let acc = 0, next = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay) || 1e-6, a = Math.atan2(by - ay, bx - ax);
      while (next <= acc + L) { const u = (next - acc) / L; fn(ax + (bx - ax) * u, ay + (by - ay) * u, a, next); next += step; }
      acc += L;
    }
  };
  const fthread = (ctx, x0, y0, x1, y1, col, w = 2.4) => {
    const rgb = hx(col);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(40,25,15,0.38)'; ctx.lineWidth = w + 1.2; ctx.beginPath(); ctx.moveTo(x0 + 0.8, y0 + 1.2); ctx.lineTo(x1 + 0.8, y1 + 1.2); ctx.stroke();
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, H.rgba(rgb.map((v) => v * 0.65))); g.addColorStop(0.5, H.rgba(rgb.map((v) => Math.min(255, v * 1.1 + 10)))); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.65)));
    ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.fillStyle = 'rgba(30,15,10,0.45)'; ctx.beginPath(); ctx.arc(x0, y0, 1.1, 0, TAU); ctx.arc(x1, y1, 1.1, 0, TAU); ctx.fill();
  };
  const frun = (ctx, pts, col, len = 12, gap = 7, w = 3, pr = 1) => {
    if (pr <= 0 || pts.length < 2) return;
    let total = 0; for (let i = 0; i < pts.length - 1; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    let start = null;
    fwalk(pts, (len + gap) / 2, (x, y, a, dd) => {
      if (dd > total * pr) return;
      const k = Math.round(dd / ((len + gap) / 2));
      if (k % 2 === 0) start = [x, y]; else if (start) { fthread(ctx, start[0], start[1], start[0] + Math.cos(a) * len, start[1] + Math.sin(a) * len, col, w); start = null; }
    });
  };
  // stitched arrow: running stitch shaft + two stitched head strokes once complete
  const farrow = (ctx, pts, col, pr, w = 3.4) => {
    frun(ctx, pts, col, 14, 7, w, pr);
    if (pr >= 1) { const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2], a = Math.atan2(y1 - y0, x1 - x0); fthread(ctx, x1, y1, x1 + Math.cos(a + 2.5) * 24, y1 + Math.sin(a + 2.5) * 24, col, w); fthread(ctx, x1, y1, x1 + Math.cos(a - 2.5) * 24, y1 + Math.sin(a - 2.5) * 24, col, w); }
  };
  const fcurve = (ax, ay, cx, cy, bx, by) => Array.from({ length: 31 }, (_, i) => { const u = i / 30; return [(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]; });
  const fpat = () => FX.pat || (FX.pat = H.layer(2, 2).getContext('2d').createPattern(feltTex(55), 'repeat'));
  // a felt piece cut to polygon pts (local coords, origin top-left), fuzz + felt texture + soft edge
  const feltSpr = (key, pts, col, w, h, extra) => {
    if (FX[key]) return FX[key];
    const pad = 12, C = H.layer(Math.ceil(w + pad * 2), Math.ceil(h + pad * 2)), c = C.getContext('2d');
    c.translate(pad, pad);
    const path = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
    path(); c.fillStyle = col; c.fill();
    const fr = H.rng(key.length * 31 + w);
    c.lineCap = 'round';
    fwalk([...pts, pts[0]], 1.6, (x, y, a) => { const nx = Math.sin(a), ny = -Math.cos(a), l = fr.range(0.5, 2.6), tw = fr.range(-0.8, 0.8); c.strokeStyle = col; c.lineWidth = fr.range(0.5, 1.1); c.beginPath(); c.moveTo(x - nx * 1.5, y - ny * 1.5); c.lineTo(x + (nx + tw * ny) * l, y + (ny - tw * nx) * l); c.stroke(); });
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
    const p = fpat(); p.setTransform(new DOMMatrix().translateSelf(fr() * 256, fr() * 256)); c.fillStyle = p; c.fillRect(0, 0, C.width, C.height); c.restore();
    c.save(); c.globalCompositeOperation = 'source-atop'; c.filter = 'blur(3px)'; c.lineWidth = 7; c.strokeStyle = 'rgba(0,0,0,0.22)'; path(); c.stroke(); c.translate(-2, -2); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.12)'; path(); c.stroke(); c.restore();
    if (extra) extra(c);
    C.pad = pad; C.w = w; C.h = h;
    return (FX[key] = C);
  };
  // felt letters: cut glyphs with fuzzy edges, a darker cut rim and a soft padded bevel.
  // o.back: colour of a slightly larger felt cut-out the letters are appliqued onto (layered felt, for contrast).
  const feltText = (key, str, px, col, font = '700 PXpx "Fredoka"', o = {}) => {
    if (FX[key]) return FX[key];
    const f = font.replace('PX', px), m = H.layer(4, 4).getContext('2d'); m.font = f;
    const w = Math.ceil(m.measureText(str).width) + 8, h = Math.ceil(px * 1.2), bw = o.back ? Math.round(px * 0.14) : 0, pad = 12 + bw;
    const C = H.layer(w + pad * 2, h + pad * 2), c = C.getContext('2d'), r = H.rng(key.length * 13 + px);
    const tx = pad + 4, ty = pad + px * 0.95, dk = H.rgba(hx(col).map((v) => v * 0.6), 0.6);
    c.font = f; c.lineJoin = 'round';
    if (o.back) { // backing felt: dilated glyphs, own fuzz, texture and rim, with a small shadow from the letter layer
      const B = H.layer(C.width, C.height), b = B.getContext('2d');
      b.font = f; b.lineJoin = 'round'; b.fillStyle = b.strokeStyle = o.back;
      for (let i = 0; i < 18; i++) { b.globalAlpha = 0.2; b.lineWidth = bw * 2 + r.gauss() * 1.6; const ox = r.gauss() * 1.2, oy = r.gauss() * 1.2; b.strokeText(str, tx + ox, ty + oy); b.fillText(str, tx + ox, ty + oy); }
      b.globalAlpha = 1; b.lineWidth = bw * 2 - 1; b.strokeText(str, tx, ty); b.fillText(str, tx, ty);
      b.globalCompositeOperation = 'source-atop'; const pb = fpat(); pb.setTransform(new DOMMatrix().translateSelf(r() * 256, r() * 256)); b.fillStyle = pb; b.fillRect(0, 0, B.width, B.height);
      { // shaded cut edge: dark band = silhouette minus an eroded copy, softened
        const D = H.layer(C.width, C.height), dd = D.getContext('2d');
        dd.fillStyle = 'rgba(70,45,25,0.42)'; dd.fillRect(0, 0, D.width, D.height);
        dd.globalCompositeOperation = 'destination-out'; dd.font = f; dd.lineJoin = 'round'; dd.lineWidth = bw * 2 - 7; dd.strokeText(str, tx + 0.8, ty + 0.8); dd.fillText(str, tx + 0.8, ty + 0.8);
        b.filter = 'blur(2px)'; b.drawImage(D, 0, 0); b.filter = 'none';
      }
      c.drawImage(B, 0, 0);
      c.save(); c.shadowColor = 'rgba(40,20,10,0.45)'; c.shadowBlur = 4; c.shadowOffsetX = 1.5; c.shadowOffsetY = 2.5;
    }
    const L = H.layer(C.width, C.height), l = L.getContext('2d');
    l.font = f; l.lineJoin = 'round';
    l.strokeStyle = dk; l.lineWidth = 3; l.strokeText(str, tx, ty); // darker cut edge under the fuzz
    l.fillStyle = col;
    for (let i = 0; i < 26; i++) { l.globalAlpha = 0.18; l.fillText(str, tx + r.gauss() * 1.4, ty + r.gauss() * 1.4); }
    l.globalAlpha = 1; l.fillText(str, tx, ty);
    l.globalCompositeOperation = 'source-atop'; const p = fpat(); p.setTransform(new DOMMatrix().translateSelf(r() * 256, r() * 256)); l.fillStyle = p; l.fillRect(0, 0, C.width, C.height);
    // padded felt: shaded rim, light catching the top-left
    l.filter = 'blur(2.5px)'; l.lineWidth = Math.max(4, px * 0.06); l.strokeStyle = 'rgba(30,15,5,0.3)'; l.strokeText(str, tx, ty);
    l.lineWidth = Math.max(2, px * 0.03); l.strokeStyle = 'rgba(255,250,235,0.22)'; l.strokeText(str, tx - 1.5, ty - 1.5); l.filter = 'none';
    c.drawImage(L, 0, 0);
    if (o.back) c.restore();
    C.pad = pad; C.w = w; C.h = h;
    return (FX[key] = C);
  };
  // satin-stitched embroidery floss: close slanted stitches across a thick band (heavy, raised, catches the light)
  const fsatin = (ctx, x0, y0, x1, y1, col, w = 13) => {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 0.5) return;
    const rgb = hx(col), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, hw = w / 2, sl = w * 0.35;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(40,20,10,0.42)'; ctx.lineWidth = w + 3; ctx.filter = 'blur(1.5px)';
    ctx.beginPath(); ctx.moveTo(x0 + 1.5, y0 + 2.5); ctx.lineTo(x1 + 1.5, y1 + 2.5); ctx.stroke(); ctx.filter = 'none';
    ctx.strokeStyle = H.rgba(rgb.map((v) => v * 0.55)); ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const dark = H.rgba(rgb.map((v) => v * 0.72)), lite = H.rgba(rgb.map((v) => Math.min(255, v * 1.18 + 18))), hi = 'rgba(255,255,255,0.35)';
    for (let d = -hw * 0.5; d <= L + hw * 0.5; d += 2.1) {
      const cx = x0 + ux * d, cy = y0 + uy * d;
      const ax = cx - nx * hw - ux * sl / 2, ay = cy - ny * hw - uy * sl / 2, bx = cx + nx * hw + ux * sl / 2, by = cy + ny * hw + uy * sl / 2;
      ctx.strokeStyle = dark; ctx.lineWidth = 2.3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = lite; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ax - 0.4, ay - 0.6); ctx.lineTo(bx - 0.4, by - 0.6); ctx.stroke();
      ctx.strokeStyle = hi; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(cx - nx * hw * 0.5 - 0.5, cy - ny * hw * 0.5 - 0.7); ctx.lineTo(cx - nx * hw * 0.1 - 0.5, cy - ny * hw * 0.1 - 0.7); ctx.stroke();
    }
    ctx.restore();
  };
  // woven label with satin-stitched text
  const tagSpr = (str, px, ink = '#2f5f9a') => {
    const key = 'tag' + str + px + ink;
    if (FX[key]) return FX[key];
    const m = H.layer(4, 4).getContext('2d'); m.font = `700 ${px}px "Fredoka"`;
    const lw = Math.ceil(m.measureText(str).width + px * 1.4), lh = Math.ceil(px * 1.75), pad = 10;
    const C = H.layer(lw + pad * 2, lh + pad * 2), c = C.getContext('2d');
    c.translate(pad, pad);
    c.fillStyle = '#f3ecdc'; c.fillRect(0, 0, lw, lh);
    c.save(); c.beginPath(); c.rect(0, 0, lw, lh); c.clip();
    c.strokeStyle = 'rgba(120,100,70,0.12)'; c.lineWidth = 1; for (let k = -lw; k < lw; k += 3) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + lh, lh); c.stroke(); }
    c.fillStyle = '#c8443a'; c.fillRect(0, 4, lw, 2.5); c.fillRect(0, lh - 6.5, lw, 2.5);
    const fg = c.createLinearGradient(0, 0, 12, 0); fg.addColorStop(0, 'rgba(90,60,30,0.3)'); fg.addColorStop(1, 'rgba(90,60,30,0)'); c.fillStyle = fg; c.fillRect(0, 0, 12, lh);
    const fg2 = c.createLinearGradient(lw, 0, lw - 12, 0); fg2.addColorStop(0, 'rgba(90,60,30,0.3)'); fg2.addColorStop(1, 'rgba(90,60,30,0)'); c.fillStyle = fg2; c.fillRect(lw - 12, 0, 12, lh);
    c.restore();
    const M = H.layer(lw, lh), mc = M.getContext('2d');
    mc.font = `700 ${px}px "Fredoka"`; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillStyle = '#fff'; mc.fillText(str, lw / 2, lh / 2 + 2);
    mc.globalCompositeOperation = 'source-in'; mc.fillStyle = ink; mc.fillRect(0, 0, lw, lh);
    mc.globalCompositeOperation = 'source-atop'; mc.lineWidth = 1;
    for (let k = -lh; k < lw + lh; k += 2) { mc.strokeStyle = 'rgba(255,255,255,0.28)'; mc.beginPath(); mc.moveTo(k, 0); mc.lineTo(k + lh * 0.35, lh); mc.stroke(); mc.strokeStyle = 'rgba(0,0,30,0.25)'; mc.beginPath(); mc.moveTo(k + 1, 0); mc.lineTo(k + 1 + lh * 0.35, lh); mc.stroke(); }
    c.save(); c.shadowColor = 'rgba(20,10,5,0.45)'; c.shadowBlur = 1.5; c.shadowOffsetX = 0.8; c.shadowOffsetY = 1.2; c.drawImage(M, 0, 0); c.restore();
    frun(c, [[7, 4], [7, lh - 4]], '#c8443a', 6, 4, 1.8); frun(c, [[lw - 7, 4], [lw - 7, lh - 4]], '#c8443a', 6, 4, 1.8);
    C.pad = pad; C.w = lw; C.h = lh;
    return (FX[key] = C);
  };
  const circPts = (cx, cy, rx, ry, n = 90, wob = 0.02, seed = 0) => { const nz = FX.nz || (FX.nz = H.makeNoise(21)); return Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU, k = 1 + nz.n2(Math.cos(a) + seed, Math.sin(a)) * wob; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; }); };

  const EXPLAIN = (ctx, W, H_, t) => {
    const seg = (a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
    const prog = (a, b) => H.clamp((t - a) / (b - a));
    // drop-on: falls in large with lifted shadow, squashes, settles
    const put = (spr, x, y, st, o = {}) => {
      if (!spr || t < st) return;
      const u = H.clamp((t - st) / 0.45), lift = 1 - H.ease.out(u), sq = u > 0.45 && u < 1 ? Math.sin(((u - 0.45) / 0.55) * Math.PI) * 0.04 : 0;
      const cx = x + spr.w / 2, cy = y + spr.h / 2;
      ctx.save();
      ctx.shadowColor = `rgba(40,20,10,${0.45 - lift * 0.2})`; ctx.shadowBlur = (o.sb ?? 10) + lift * 26; ctx.shadowOffsetX = (o.sx ?? 4) + lift * 18; ctx.shadowOffsetY = (o.sy ?? 6) + lift * 26;
      ctx.globalAlpha = H.clamp(u * 5);
      ctx.translate(cx, cy - lift * 30); if (o.rot) ctx.rotate(o.rot); ctx.scale((1 + lift * 0.14 + sq) * (o.s || 1), (1 + lift * 0.14 - sq) * (o.s || 1)); ctx.translate(-cx, -cy);
      ctx.drawImage(spr, x - spr.pad, y - spr.pad); ctx.restore();
    };
    // ---- camera pan along the quilt ----
    const cam = 1280 * seg(1.9, 2.6) + 700 * seg(5.6, 6.3) + 1300 * seg(10.0, 10.7);
    // ---- quilt (baked once, 2560 wide, tiled) ----
    if (!FX.quilt) {
      const QW = 2560, P = 160, C = H.layer(QW, H_), c = C.getContext('2d'), img = c.createImageData(QW, H_), d = img.data;
      const nz = H.makeNoise(21), r = H.rng(314), cols = QW / P, rows = Math.ceil(H_ / P) + 1, pick = [];
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { let k; do { k = r.int(0, PRINTS.length - 1); } while ((i > 0 && pick[j * cols + i - 1] === k) || (j > 0 && pick[(j - 1) * cols + i] === k)); pick.push(k); }
      const grain = H.rng(9), lnz = H.makeNoise(77);
      for (let y = 0; y < H_; y++) {
        const yy = y + 30, j = Math.floor(yy / P), v = yy - j * P;
        // broad uneven light, periodic over the 2560px tile (sampled on a cylinder so the tile wrap has no seam), every 8px
        if (y % 8 === 0) { // coarse 8px grid rows, blended vertically below
          FX.lg0 = FX.lg1 || null; FX.lg1 = []; const y8 = y + 8;
          for (let x = 0; x <= QW; x += 8) { const a = (x / QW) * TAU; FX.lg1.push(0.85 + 0.15 * lnz.fbm3(Math.cos(a) * 0.9, Math.sin(a) * 0.9, y8 * 0.0035, 3)); }
          if (!FX.lg0) { FX.lg0 = []; for (let x = 0; x <= QW; x += 8) { const a = (x / QW) * TAU; FX.lg0.push(0.85 + 0.15 * lnz.fbm3(Math.cos(a) * 0.9, Math.sin(a) * 0.9, y * 0.0035, 3)); } }
        }
        const yt = (y % 8) / 8, lrow = FX.lg0.map((v, q) => v + (FX.lg1[q] - v) * yt);
        for (let x = 0; x < QW; x++) {
          const i = Math.floor(x / P), u = x - i * P, pr = PRINTS[pick[j * cols + i]];
          const col = H.mix(printCol(pr, Math.max(0, u + nz.n2(x * 0.02, y * 0.02) * 1.2), Math.max(0, v + nz.n2(x * 0.02 + 9, y * 0.02) * 1.2)), [214, 200, 178], 0.3);
          const wx = x % 3, wy = y % 3, over = (Math.floor(x / 3) + Math.floor(y / 3)) & 1;
          const wv = 1 + (over ? (wx === 1 ? 0.05 : -0.02) : (wy === 1 ? 0.05 : -0.02)) - (wx === 0 && wy === 0 ? 0.06 : 0) + (grain() - 0.5) * 0.06;
          const e = Math.min(u, P - u, v, P - v), puff = 0.93 - 0.36 * Math.exp(-e / 14) + (0.08 * (P / 2 - u + (P / 2 - v))) / P, seam = Math.exp(-(e * e) / 2.5) * 0.45;
          const lq = x >> 3, lf = lrow[lq] + ((lrow[lq + 1] ?? lrow[0]) - lrow[lq]) * ((x & 7) / 8);
          const s = wv * puff * (1 - seam) * lf, k = (y * QW + x) * 4;
          d[k] = col[0] * s; d[k + 1] = col[1] * s; d[k + 2] = col[2] * s; d[k + 3] = 255;
        }
      }
      c.putImageData(img, 0, 0);
      for (let gx = 9; gx < QW; gx += P) frun(c, [[gx, -10], [gx, H_ + 10]], '#f4ead6', 10, 7, 2.4);
      for (let gy = -21; gy < H_ + P; gy += P) frun(c, [[-10, gy], [QW + 10, gy]], '#f4ead6', 10, 7, 2.4);
      FX.quilt = C;
    }
    const qx = -(cam % 2560);
    ctx.drawImage(FX.quilt, qx, 0); ctx.drawImage(FX.quilt, qx + 2560, 0);

    ctx.save(); ctx.translate(-cam, 0); // ======== world ========

    // ---- BEAT 1: felt letters dropped on ----
    {
      const cols = ['#d9564a', '#2f5f9a', '#e8b04a', '#6fb3a6', '#ef9aa6'];
      const line = (str, px, y, st, off) => {
        const m = H.layer(4, 4).getContext('2d'); m.font = `700 ${px}px "Fredoka"`;
        let x = 640 - (m.measureText(str).width + str.length * 6) / 2, i = 0;
        for (const ch of str) { const w = m.measureText(ch).width; if (ch !== ' ') put(feltText('L' + ch + px + (i + off) % 5, ch, px, cols[(i + off) % 5]), x, y, st + i * 0.07, { rot: (H.rng(i + off)() - 0.5) * 0.12 }); x += w + 6; i++; }
      };
      // felt backing ovals the letters sit on
      put(feltSpr('b1back', circPts(330, 150, 330, 150, 120, 0.03, 1), '#f3ecdc', 660, 300), 310, 150, 0.0, { sb: 16 });
      line('How does', 100, 178, 0.15, 0);
      line('AI learn?', 116, 296, 0.75, 2);
      // blanket stitch around the backing, sewn on
      const bp = prog(0.4, 1.8), ring = circPts(640, 300, 340, 160, 160, 0.03, 1);
      for (let i = 0; i < ring.length * bp; i += 2) { const [x, y] = ring[i], dx = x - 640, dy = y - 300, d = Math.hypot(dx / 340, dy / 160) || 1, ux = dx / 340 / d, uy = dy / 160 / d, n = Math.hypot(ux, uy); fthread(ctx, x - (ux / n) * 14, y - (uy / n) * 14, x + (ux / n) * 2, y + (uy / n) * 2, '#c8443a', 2.6); if (i > 1) fthread(ctx, ring[i - 2][0], ring[i - 2][1], x, y, '#c8443a', 2.6); }
    }

    // ---- BEAT 2: labelled patches slide along a stitched path into the felt brain ----
    const BX = 2350, BY = 380; // brain centre (world)
    const brain = feltSpr('brain', (() => { const pts = []; for (let i = 0; i < 100; i++) { const a = (i / 100) * TAU, k = 1 + 0.08 * Math.sin(a * 7) + 0.04 * Math.sin(a * 13); pts.push([150 + Math.cos(a) * 145 * k, 115 + Math.sin(a) * 112 * k]); } return pts; })(), '#e9879a', 300, 230,
      (c) => { [[[150, 10], [150, 220]], [[60, 70], [100, 95], [80, 130], [110, 165]], [[200, 60], [240, 85], [215, 120], [250, 150]], [[105, 40], [125, 75]], [[185, 175], [215, 200]], [[40, 120], [70, 150]]].forEach((ln) => frun(c, ln, '#a8455c', 9, 5, 2.4)); });
    put(brain, BX - 150, BY - 115, 2.3, { sb: 20, sx: 8, sy: 12 });
    put(tagSpr('model', 34), BX - 70, BY + 140, 2.6, { rot: -0.05 });
    // buttons = the model's knobs (thread X turns when it adjusts)
    const turn = H.ease.inOut(prog(8.9, 9.6));
    [[-80, '#e8b04a'], [0, '#6fb3a6'], [80, '#d9564a']].forEach(([dx, col], i) => {
      const x = BX + dx, y = BY + 222, R = 30, st = 2.5 + i * 0.1;
      if (t < st) return;
      const s = Math.max(0.15, H.ease.back(prog(st, st + 0.35))), rgb = hx(col);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.shadowColor = 'rgba(40,20,10,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
      const g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R); g.addColorStop(0, H.rgba(rgb.map((v) => Math.min(255, v * 1.25 + 20)))); g.addColorStop(0.7, H.rgba(rgb)); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.7)));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.restore();
      if (s < 0.99) return;
      ctx.strokeStyle = H.rgba(rgb.map((v) => v * 0.6), 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R * 0.72, 0, TAU); ctx.stroke();
      const a = [0.2, 0.9, -0.4][i] + [1.4, -1.1, 1.6][i] * turn, hs = R * 0.3;
      const hp = [0, 1, 2, 3].map((k) => [x + Math.cos(a + k * Math.PI / 2 + Math.PI / 4) * hs, y + Math.sin(a + k * Math.PI / 2 + Math.PI / 4) * hs]);
      fthread(ctx, hp[0][0], hp[0][1], hp[2][0], hp[2][1], '#f4ead2', 3); fthread(ctx, hp[1][0], hp[1][1], hp[3][0], hp[3][1], '#f4ead2', 3);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x - R * 0.45, y - R * 0.5, R * 0.18, R * 0.08, -0.6, 0, TAU); ctx.fill();
    });
    // example patches
    const patch = (kind) => FX['patch' + kind] || (FX['patch' + kind] = (() => {
      const cat = kind === 'cat';
      const base = feltSpr('pbase' + kind, [[0, 0], [150, 0], [150, 150], [0, 150]], cat ? '#9fc6d6' : '#f1d27a', 150, 150, (c) => {
        const head = cat ? [[30, 70], [38, 22], [62, 48], [88, 48], [112, 22], [120, 70], [112, 105], [75, 122], [38, 105]] : circPts(75, 75, 46, 42, 60, 0.02, 3);
        c.save(); c.shadowColor = 'rgba(40,20,10,0.4)'; c.shadowBlur = 5; c.shadowOffsetX = 2; c.shadowOffsetY = 3;
        c.beginPath(); head.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = cat ? '#f08a3c' : '#a8673c'; c.fill();
        if (!cat) { c.fillStyle = '#6e4428'; c.beginPath(); c.ellipse(32, 72, 13, 30, 0.25, 0, TAU); c.fill(); c.beginPath(); c.ellipse(118, 72, 13, 30, -0.25, 0, TAU); c.fill(); }
        c.restore();
        c.fillStyle = '#2a2433'; [[60, 70], [90, 70]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 5.5, 0, TAU); c.fill(); });
        c.fillStyle = cat ? '#e0607a' : '#2a2433'; c.beginPath(); c.ellipse(75, 88, 7, 5, 0, 0, TAU); c.fill();
        frun(c, [[8, 8], [142, 8], [142, 142], [8, 142], [8, 8]], '#f4ead2', 8, 5, 2);
      });
      const tg = tagSpr(kind, 30, cat ? '#c8443a' : '#2f5f9a');
      const C = H.layer(base.width, base.height + 50), c = C.getContext('2d');
      c.drawImage(base, 0, 0);
      c.save(); c.shadowColor = 'rgba(40,20,10,0.4)'; c.shadowBlur = 4; c.shadowOffsetX = 2; c.shadowOffsetY = 3; c.translate(base.pad + 75, base.pad + 150); c.rotate(-0.04); c.drawImage(tg, -tg.width / 2, -tg.height / 2); c.restore();
      C.pad = base.pad; C.w = 150; C.h = 190;
      return C;
    })());
    if (t < 6.4) {
      // counter: felt digit tiles re-cut as the number climbs
      if (t >= 2.45) {
        const n = Math.round(1e6 * Math.pow(prog(2.7, 5.1), 2)), str = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        let x = 1280 + 50;
        put(feltSpr('cback', [[0, 6], [440, 0], [446, 118], [4, 124]], '#2f4f7a', 446, 124, (c) => frun(c, [[10, 14], [434, 9], [438, 112], [12, 116], [10, 14]], '#f4ead2', 8, 5, 2)), 1310, 72, 2.4, { sb: 12 });
        for (const ch of str) { const s = feltText('D' + ch, ch, 96, '#e8b04a'); put(s, x, 70, 2.45); x += s.w - 6; }
        put(tagSpr('examples', 36, '#3f8c86'), x + 18, 104, 2.6);
      }
      farrow(ctx, fcurve(1300, 250, 1650, 205, 2140, 270), '#c8443a', prog(2.6, 3.4));
      const KINDS = ['cat', 'dog', 'dog', 'cat', 'dog', 'cat', 'cat', 'dog'];
      KINDS.forEach((k, i) => {
        const s0 = 2.55 + i * 0.36, x = 1160 + (t - s0) * 640;
        if (t < s0 || x > BX - 110) return;
        const sh = H.clamp((BX - 110 - x) / 130);
        ctx.save(); ctx.shadowColor = 'rgba(40,20,10,0.45)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 9;
        const p = patch(k); ctx.translate(x + 75, 390 + 95); ctx.rotate(Math.sin(t * 6 + i) * 0.03); ctx.scale(sh, sh); ctx.drawImage(p, -75 - p.pad, -95 - p.pad); ctx.restore();
      });
      // brain re-drawn on top so patches go "into" it
      if (t > 2.75) { ctx.save(); ctx.shadowColor = 'rgba(40,20,10,0.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 12; ctx.drawImage(brain, BX - 150 - brain.pad, BY - 115 - brain.pad); ctx.restore(); }
    }

    // ---- BEAT 3: guess -> check -> adjust (a stitched loop) ----
    if (t > 5.9) {
      put(patch('cat'), 2000, 300, 6.25, { rot: -0.04 });
      put(tagSpr('new photo', 28), 1990, 255, 6.4, { rot: -0.05 });
      farrow(ctx, [[2160, 400], [2196, 400]], '#c8443a', prog(6.5, 6.7));
      farrow(ctx, fcurve(2510, 330, 2600, 280, 2700, 320), '#c8443a', prog(6.8, 7.2));
      put(tagSpr('Guess', 36), 2540, 210, 7.0, { rot: -0.06 });
      const bub = feltSpr('bub', (() => { const pts = []; for (let i = 0; i <= 80; i++) { const a = 0.62 * Math.PI + (i / 80) * (2 * Math.PI - 0.22 * Math.PI); pts.push([185 + Math.cos(a) * 180, 105 + Math.sin(a) * 100]); } pts.push([55, 236]); return pts; })(), '#f6f1e7', 370, 240);
      const wrong = t < 9.55, shake = t > 7.9 && t < 8.35 ? Math.sin(t * 70) * 7 : 0;
      put(bub, 2740 + shake, 220, 7.25, { sb: 14 });
      const ans = wrong ? feltText('Tdog', 'dog?', 104, '#2f5f9a') : feltText('Tcat', 'cat', 112, '#4f9a52');
      put(ans, 2925 - ans.w / 2 + shake, 262, wrong ? 7.45 : 9.6);
      if (wrong && t > 7.85) { // emphasis: red X + blanket-stitch ring sewn around the wrong guess
        const xr = prog(7.85, 8.05);
        if (xr > 0) { fsatin(ctx, 3060, 200, 3060 + 80 * xr, 200 + 80 * xr, '#c8443a', 14); if (xr > 0.5) fsatin(ctx, 3140, 200, 3140 - 80 * (xr - 0.5) * 2, 200 + 80 * (xr - 0.5) * 2, '#c8443a', 14); }
        const ring = circPts(2925, 330, 225, 140, 120, 0.02, 9), rp = prog(7.9, 8.4);
        for (let i = 0; i < ring.length * rp; i += 2) { const [x, y] = ring[i]; const dx = x - 2925, dy = y - 330, d = Math.hypot(dx, dy); fthread(ctx, x - (dx / d) * 12, y - (dy / d) * 12, x, y, '#c8443a', 2.6); if (i > 1) fthread(ctx, ring[i - 2][0], ring[i - 2][1], x, y, '#c8443a', 2.6); }
        put(tagSpr('Check', 38, '#c8443a'), 2840, 485, 8.05, { rot: 0.05 });
        farrow(ctx, fcurve(2860, 540, 2700, 660, 2480, 610), '#c8443a', prog(8.35, 8.85));
        put(tagSpr('Adjust', 38, '#c8443a'), 2560, 640, 8.7, { rot: -0.03 });
      }
      if (!wrong) { const vr = prog(9.85, 10.05); if (vr > 0) { fsatin(ctx, 3070, 240, 3070 + 26 * Math.min(1, vr * 2), 240 + 26 * Math.min(1, vr * 2), '#4f9a52', 14); if (vr > 0.5) fsatin(ctx, 3096, 266, 3096 + 60 * (vr - 0.5) * 2, 266 - 70 * (vr - 0.5) * 2, '#4f9a52', 14); } }
    }

    // ---- BEAT 4: felt bar chart, buttons on top, accuracy counts up ----
    if (t > 9.9) {
      const OXw = 3600, base = 600, accs = [61, 72, 80, 86, 90, 93, 95, 97], cols = ['#e8b04a', '#6fb3a6'];
      let shown = 61;
      frun(ctx, [[OXw, base + 8], [OXw + 760, base + 8]], '#3d3548', 14, 7, 3.4, prog(10.5, 11.0));
      accs.forEach((a, i) => {
        const st = 10.65 + i * 0.25, hgt = Math.round(a * 3.6);
        const bar = feltSpr('bar' + i, [[0, 0], [62, 0], [62, hgt], [0, hgt]], i === 7 ? '#d9564a' : cols[i % 2], 62, hgt, (c) => frun(c, [[8, 8], [54, 8], [54, hgt - 6], [8, hgt - 6], [8, 8]], '#f4ead2', 7, 5, 1.8));
        put(bar, OXw + 30 + i * 90, base - hgt, st, { sb: 12 });
        if (t >= st) shown = H.lerp(i ? accs[i - 1] : 61, a, prog(st, st + 0.25));
      });
      put(tagSpr('Accuracy', 44, '#3f8c86'), 3320, 140, 10.45, { rot: -0.03 });
      const str = Math.round(shown) + '%', hot = t > 12.6;
      const bounce = hot ? 1 + 0.18 * Math.sin(prog(12.6, 12.95) * Math.PI) : 1;
      let x = 3315;
      ctx.save(); ctx.translate(3430, 290); ctx.scale(bounce, bounce); ctx.translate(-3430, -290);
      { const s = feltText('A' + str + hot, str, 130, hot ? '#d9564a' : '#2f5f9a', undefined, { back: '#f4ecdc' }); put(s, x, 225, 10.5, { sb: 18, sx: 6, sy: 10 }); }
      ctx.restore();
      if (hot) { const star = feltSpr('star', Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 26 : 60; return [62 + Math.cos(a) * r, 62 + Math.sin(a) * r]; }), '#e8b04a', 124, 124, (c) => frun(c, Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 16 : 40; return [62 + Math.cos(a) * r, 62 + Math.sin(a) * r]; }), '#c8443a', 5, 4, 1.8)); put(star, OXw + 30 + 7 * 90 - 30, base - 97 * 3.6 - 130, 12.6, { rot: 0.1 }); }
      put(tagSpr('training rounds', 32), 3830, 622, 11.0);
    }
    ctx.restore(); // ======== end world ========

    // header tag + takeaway (screen space)
    put(tagSpr('How does AI learn?', 30), 24, 16, 2.25, { rot: -0.02 });
    if (t >= 13.0) {
      const tg = tagSpr('More examples  →  better guesses', 46, '#2f5f9a');
      put(tg, 640 - tg.w / 2, 600, 13.0, { sb: 16, rot: -0.01 });
    }
    // studio light + grain
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const lg = ctx.createRadialGradient(380 + t * 10, 190, 60, 600, 360, 900); lg.addColorStop(0, 'rgba(255,245,220,0.6)'); lg.addColorStop(1, 'rgba(30,20,10,0.62)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
    H.vignette(ctx, W, H_, 0.55, '35,20,10');
    H.grain(ctx, W, H_, 0.025, 6 + Math.floor(t * 12));
  };

  registerStyle({
    id: 'felt-quilt',
    name: 'Felt & Patchwork',
    category: 'Paper & Craft',
    description: 'A cosy patchwork quilt of cotton prints with puffy quilted squares, topped with fuzzy felt appliqué edged in blanket stitch, button "nodes" sewn on and joined by running-stitch thread, plus an embroidered label.',
    motion: 'Thread draws itself stitch by stitch between the buttons, felt pieces drop on with a soft squash, and the quilt breathes with a slow puff of the padding.',
    fonts: ['700 42px "Fredoka"'],
    frameT: 4.8,
    duration: 5,
    readsPixels: true,
    explainerDuration: 15,
    explainerNote: 'The camera pans along one long patchwork quilt; felt pieces drop on with a lifted shadow and soft squash, arrows and emphasis rings are thread sewn on stitch by stitch, labels are woven tags stitched onto what they name, the counter is cut felt digits swapped as it climbs, and the model\'s weights are buttons whose thread-X turns when it adjusts.',
    explainer(ctx, W, H_, t) { EXPLAIN(ctx, W, H_, t); },
    // Sound: felt and buttons on a quilt. Felt pieces fall in with a lifted shadow and land as a soft, dull "fump" at
    // the moment they touch (put(): squash starts at u = 0.45 of 0.45 s, so st + 0.2); thread sewn stitch by stitch is
    // a needle through thick felt with the thread drawn after it (one pass about every 0.12 s); buttons click on as
    // small wooden toks; the camera pans are the quilt drawn across the table. Times mirror EXPLAIN() above.
    explainerSound(k) {
      const LAND = 0.2;
      const seg = (t, a, b) => H.ease.inOut(H.clamp((t - a) / (b - a)));
      const cam = (t) => 1280 * seg(t, 1.9, 2.6) + 700 * seg(t, 5.6, 6.3) + 1300 * seg(t, 10.0, 10.7);
      const pan = (wx, t) => H.clamp(((wx - cam(t)) / 1280) * 2 - 1, -1, 1) * 0.6;
      let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const fump = (t, g = 1, p = 0, minor = true) => { // felt landing on quilted cotton: soft and dull
        k.noise(t, { dur: 0.09, color: 'brown', filter: 'lowpass', f: 420, gain: 0.42 * g, a: 0.006, pan: p, minor });
        k.noise(t, { dur: 0.05, color: 'pink', filter: 'bandpass', f: 700, q: 0.8, gain: 0.1 * g, a: 0.004, pan: p, minor });
        k.tone(t, { f: [[0, 120], [0.07, 70]], dur: 0.09, gain: 0.12 * g, pan: p, minor });
      };
      const pass = (t, g = 1, p = 0, minor = true) => { // needle through felt, thread drawn after it
        k.noise(t, { dur: 0.025, filter: 'bandpass', f: 800, q: 1.3, gain: 0.26 * g, a: 0.002, pan: p, minor });
        const pd = 0.07 + rnd() * 0.03;
        k.noise(t + 0.03, { dur: pd, filter: 'bandpass', f: [[0, 1400], [pd, 950]], q: 0.9, gain: 0.15 * g, a: pd * 0.6, pan: p, minor });
      };
      const sew = (t0, t1, g, p0, p1) => { for (let t = t0; t < t1 - 0.03; t += 0.115 + rnd() * 0.02) pass(t, g, p0 + (p1 - p0) * ((t - t0) / (t1 - t0))); };
      const button = (t, g = 1, p = 0, minor = true) => { k.play('tock', t, { f: 520, gain: 0.8 * g, pan: p, minor }); k.noise(t, { dur: 0.04, color: 'brown', filter: 'lowpass', f: 500, gain: 0.2 * g, pan: p, minor }); };
      const drag = (t, d, g = 1) => { // the quilt drawn along the table
        k.noise(t, { dur: d + 0.1, color: 'pink', filter: 'bandpass', f: [[0, 320], [d * 0.5, 700], [d + 0.1, 320]], q: 0.6, gain: 0.1 * g, a: d * 0.45 });
        k.noise(t, { dur: d + 0.1, color: 'brown', filter: 'lowpass', f: 280, gain: 0.075 * g, a: d * 0.5 });
      };

      k.bed('room', 0, 15, { gain: 0.4 });
      k.music('pad', 0.2, 14.8, { bpm: 62, gain: 0.22, chords: [['C3', 'E3', 'G3', 'D4'], ['A2', 'E3', 'G3', 'C4'], ['F2', 'A2', 'C3', 'G3'], ['G2', 'B2', 'D3', 'A3']] });

      // BEAT 1: backing oval, felt letters dropped on (0.15 + i*0.07, 0.75 + i*0.07), blanket stitch sewn round (0.4..1.8)
      fump(0.0 + LAND, 1.1, 0, false);
      {
        const ts = [];
        [...'How does'].forEach((ch, i) => ch !== ' ' && ts.push([0.15 + i * 0.07 + LAND, i / 8]));
        [...'AI learn?'].forEach((ch, i) => ch !== ' ' && ts.push([0.75 + i * 0.07 + LAND, i / 9]));
        let last = -1; ts.forEach(([t, u]) => { if (t - last >= 0.09) { fump(t, 0.55, (u - 0.5) * 0.8); last = t; } });
      }
      sew(0.4, 1.8, 0.6, -0.4, 0.4);

      // BEAT 2
      drag(1.9, 0.7, 1);
      fump(2.25 + LAND, 0.5, -0.8); // header tag
      fump(2.3 + LAND, 1.3, pan(2350, 2.5), false); // the felt brain
      fump(2.4 + LAND, 0.8, pan(1530, 2.6)); fump(2.45 + LAND, 0.6, pan(1500, 2.65)); // counter backing + digits
      [0, 1, 2].forEach((i) => button(2.5 + i * 0.1 + 0.13, 0.8, pan(2270 + i * 80, 2.7))); // buttons
      fump(2.6 + LAND, 0.55, pan(2280, 2.8)); // 'model' + 'examples' tags
      sew(2.6, 3.4, 0.75, pan(1300, 2.6), pan(2140, 3.4)); // red thread arrow
      for (let i = 0; i < 8; i++) { const tin = 2.55 + i * 0.36 + (2350 - 110 - 1160) / 640; fump(tin, 0.4, pan(2240, tin)); } // patches tucked into the brain
      { // counter: felt digits swapped as n = 1e6 * prog(2.7, 5.1)^2 climbs
        for (let t = 2.78; t < 5.04;) { const s = H.clamp((t - 2.7) / 2.4); k.noise(t, { dur: 0.04, color: 'brown', filter: 'lowpass', f: 600, gain: 0.3, a: 0.002, pan: pan(1500, t), minor: true }); k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1100, q: 1.2, gain: 0.1, a: 0.001, pan: pan(1500, t), minor: true }); t += 0.15 - 0.06 * s; }
        fump(5.1, 1.0, pan(1500, 5.1), false); button(5.1, 0.6, pan(1500, 5.1));
      }

      // BEAT 3
      drag(5.6, 0.7, 0.8);
      fump(6.25 + LAND, 1.0, pan(2075, 6.45), false); // new cat patch
      fump(6.4 + LAND, 0.5, pan(2050, 6.6));
      sew(6.5, 6.7, 0.7, pan(2160, 6.5), pan(2196, 6.7));
      sew(6.8, 7.2, 0.7, pan(2510, 6.8), pan(2700, 7.2));
      fump(7.0 + LAND, 0.5, pan(2580, 7.2)); // 'Guess'
      fump(7.25 + LAND, 0.9, pan(2925, 7.45)); // bubble
      fump(7.45 + LAND, 0.75, pan(2925, 7.65)); // 'dog?'
      // wrong guess (7.85): thick red thread yanked through as an X, a blanket-stitch ring sewn round it, the bubble jiggles
      k.noise(7.85, { dur: 0.2, filter: 'bandpass', f: [[0, 1500], [0.2, 700]], q: 0.8, gain: 0.32, a: 0.01, pan: pan(3100, 7.9) });
      k.play('thud', 7.86, { f: 110, gain: 0.6, pan: pan(3000, 7.9) });
      k.tone(7.88, { f: 'D3', type: 'triangle', dur: 0.16, gain: 0.2, filter: 'lowpass', f2: 700 });
      k.tone(8.04, { f: 'A2', type: 'triangle', dur: 0.32, gain: 0.22, filter: 'lowpass', f2: 600 });
      sew(8.1, 8.4, 0.6, 0.3, 0.6);
      fump(8.05 + LAND, 0.55, pan(2900, 8.25)); // 'Check'
      sew(8.35, 8.85, 0.75, pan(2860, 8.35), pan(2480, 8.85)); // red thread arrow back to the buttons
      fump(8.7 + LAND, 0.55, pan(2620, 8.9)); // 'Adjust'
      for (let i = 1; i <= 5; i++) { let t = 8.9; while (seg(t, 8.9, 9.6) < i / 5 - 1e-6) t += 0.005; button(t, 0.45, pan(2350, t)); } // buttons twist
      // correction: 'cat' dropped on, green check sewn (9.85..10.05)
      fump(9.6 + LAND, 1.0, pan(2925, 9.8), false);
      pass(9.85, 0.9, pan(3090, 9.9), false); pass(9.97, 0.7, pan(3110, 10));
      k.play('success', 9.86, { f: 'G5', gain: 0.45, pan: pan(3090, 9.9) });

      // BEAT 4
      drag(10.0, 0.7, 1);
      fump(10.45 + LAND, 0.55, pan(3420, 10.65)); fump(10.5 + LAND, 0.8, pan(3420, 10.7)); // 'Accuracy' tag + % digits
      sew(10.5, 11.0, 0.5, pan(3600, 10.5), pan(4360, 11.0)); // axis thread
      fump(11.0 + LAND, 0.45, pan(3950, 11.2)); // 'training rounds'
      for (let i = 0; i < 8; i++) fump(10.65 + i * 0.25 + LAND, 0.6 + i * 0.04, pan(3660 + i * 90, 11 + i * 0.25)); // felt bars
      { // % digits swapped as `shown` climbs, at most ~7/s
        const accs = [61, 72, 80, 86, 90, 93, 95, 97];
        let last = -1, lt = -1;
        for (let t = 10.66; t < 12.6; t += 1 / 120) {
          const i = Math.min(7, Math.floor((t - 10.65) / 0.25)), st = 10.65 + i * 0.25;
          const v = Math.round(H.lerp(i ? accs[i - 1] : 61, accs[i], H.clamp((t - st) / 0.25)));
          if (v !== last && t - lt >= 0.14) { k.noise(t, { dur: 0.03, filter: 'bandpass', f: 1000, q: 1.2, gain: 0.16, a: 0.001, pan: -0.5, minor: true }); last = v; lt = t; }
        }
      }
      // 97% (12.6): number turns red and bounces, a felt star drops on top: biggest hit
      k.play('impact', 12.6, { gain: 1.55, pan: -0.2 });
      k.play('ding', 12.6, { f: 'E5', gain: 0.6, pan: -0.1 });
      fump(12.6 + LAND, 1.6, pan(4230, 12.8), false);
      button(12.6 + LAND, 0.5, pan(4230, 12.8));

      // BEAT 5: takeaway label drops on and resolves
      fump(13.0 + LAND, 1.3, 0, false);
      ['C4', 'G4', 'E5'].forEach((f, i) => k.play('ding', 13.32 + i * 0.09, { f, gain: 0.38 - i * 0.03, pan: (i - 1) * 0.25 }));
    },
    draw(ctx, W, H_, t) {
      const nz = H.makeNoise(21), r = H.rng(314);
      const P = 160, OY = -30, OX = -40;
      const breathe = 1 + 0.12 * Math.sin(t * 1.4 - 1.5);
      const prog = (a, b) => H.clamp((t - a) / (b - a));

      // ---------- quilt: per-pixel cotton prints, weave, puff & seams ----------
      // The static part (print colour x weave x broad light falloff) and the puff/seam terms are cached per size;
      // each frame only re-applies the breathing puff.
      {
        const key = W + 'x' + H_;
        if (!HQ.key || HQ.key !== key) {
          const N = W * H_, base = new Float32Array(N * 3), A = new Float32Array(N), B = new Float32Array(N);
          const cols = Math.ceil((W - OX) / P) + 1, rows = Math.ceil((H_ - OY) / P) + 1;
          const pick = [];
          for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
            let k;
            do { k = r.int(0, PRINTS.length - 1); } while ((i > 0 && pick[j * cols + i - 1] === k) || (j > 0 && pick[(j - 1) * cols + i] === k));
            pick.push(k);
          }
          const grain = H.rng(9), lnz = H.makeNoise(77);
          for (let y = 0; y < H_; y++) {
            const yy = y - OY, j = Math.floor(yy / P), v = yy - j * P;
            // broad, uneven light across the quilt (a real quilt never lies perfectly flat or evenly lit), sampled every 8px
            const lrow = []; for (let x = 0; x <= W + 8; x += 8) lrow.push(0.9 + 0.1 * lnz.fbm2(x * 0.0022, y * 0.0035, 3));
            for (let x = 0; x < W; x++) {
              const xx = x - OX, i = Math.floor(xx / P), u = xx - i * P;
              const pr = PRINTS[pick[j * cols + i]];
              // slight fabric wobble in the print
              const wu = u + nz.n2(x * 0.02, y * 0.02) * 1.2, wv = v + nz.n2(x * 0.02 + 9, y * 0.02) * 1.2;
              const c = H.mix(printCol(pr, Math.max(0, wu), Math.max(0, wv)), [214, 200, 178], 0.3);
              // plain weave: warp/weft over-under
              const wx = x % 3, wy = y % 3, over = ((Math.floor(x / 3) + Math.floor(y / 3)) & 1);
              let wv2 = 1 + (over ? (wx === 1 ? 0.05 : -0.02) : (wy === 1 ? 0.05 : -0.02)) - (wx === 0 && wy === 0 ? 0.06 : 0);
              wv2 += (grain() - 0.5) * 0.06;
              const lq = x >> 3, lt = (x & 7) / 8, m = wv2 * (lrow[lq] + (lrow[lq + 1] - lrow[lq]) * lt), n = y * W + x;
              base[n * 3] = c[0] * m; base[n * 3 + 1] = c[1] * m; base[n * 3 + 2] = c[2] * m;
              // puff: pillowy patches, lit from top-left, sinking into seams
              const eu = Math.min(u, P - u), ev = Math.min(v, P - v), e = Math.min(eu, ev);
              const seam = Math.exp(-(e * e) / 2.5) * 0.45;
              A[n] = (0.95 + 0.08 * ((P / 2 - u) + (P / 2 - v)) / P) * (1 - seam);
              B[n] = 0.36 * Math.exp(-e / 14) * (1 - seam);
            }
          }
          HQ.key = key; HQ.base = base; HQ.A = A; HQ.B = B;
        }
        const img = ctx.createImageData(W, H_), d = img.data, base = HQ.base, A = HQ.A, B = HQ.B;
        for (let n = 0, N = W * H_; n < N; n++) {
          const s = A[n] - B[n] * breathe, k = n * 4, b = n * 3;
          d[k] = base[b] * s; d[k + 1] = base[b + 1] * s; d[k + 2] = base[b + 2] * s; d[k + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }

      // ---------- thread helpers ----------
      const walk = (pts, step, fn) => {
        // walk along polyline, calling fn(x,y,angle,dist)
        let acc = 0, next = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax);
          while (next <= acc + L) { const u = (next - acc) / L; fn(ax + (bx - ax) * u, ay + (by - ay) * u, a, next); next += step; }
          acc += L;
        }
      };
      const threadSeg = (x0, y0, x1, y1, col, w = 2.4) => {
        const rgb = hx(col);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(40,25,15,0.38)'; ctx.lineWidth = w + 1.2;
        ctx.beginPath(); ctx.moveTo(x0 + 0.8, y0 + 1.2); ctx.lineTo(x1 + 0.8, y1 + 1.2); ctx.stroke();
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, H.rgba(rgb.map((v) => v * 0.65))); g.addColorStop(0.5, H.rgba(rgb.map((v) => Math.min(255, v * 1.1 + 10)))); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.65)));
        ctx.strokeStyle = g; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.7;
        const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
        ctx.beginPath(); ctx.moveTo(x0 * 0.8 + x1 * 0.2 - (nx / L) * 0.5, y0 * 0.8 + y1 * 0.2 - (ny / L) * 0.5); ctx.lineTo(x0 * 0.3 + x1 * 0.7 - (nx / L) * 0.5, y0 * 0.3 + y1 * 0.7 - (ny / L) * 0.5); ctx.stroke();
        // holes where thread enters the cloth
        ctx.fillStyle = 'rgba(30,15,10,0.45)';
        ctx.beginPath(); ctx.arc(x0, y0, 1.1, 0, TAU); ctx.arc(x1, y1, 1.1, 0, TAU); ctx.fill();
      };
      const running = (pts, col, len = 9, gap = 6, w = 2.4, pr = 1) => {
        if (pr <= 0) return;
        let start = null, total = 0;
        for (let i = 0; i < pts.length - 1; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        walk(pts, (len + gap) / 2, (x, y, a, dd) => {
          const k = Math.round(dd / ((len + gap) / 2));
          if (dd > total * pr) return;
          if (k % 2 === 0) start = [x, y]; else if (start) { threadSeg(start[0], start[1], start[0] + Math.cos(a) * len, start[1] + Math.sin(a) * len, col, w); start = null; }
        });
      };

      // quilting: running stitches echoing every seam
      {
        for (let gx = OX; gx < W + P; gx += P) for (const off of [9]) {
          const pts = [[gx + off, -10], [gx + off, H_ + 10]];
          running(pts, '#f4ead6', 10, 7, 2.4);
        }
        for (let gy = OY; gy < H_ + P; gy += P) for (const off of [9]) {
          const pts = [[-10, gy + off], [W + 10, gy + off]];
          running(pts, '#f4ead6', 10, 7, 2.4);
        }
      }

      // ---------- felt appliqué ----------
      const ftex = feltTex(55), fpat = ctx.createPattern(ftex, 'repeat');
      const felt = (pts, col, o = {}) => {
        if (o.at != null && t < o.at) return;
        // layer sized to the piece (not the whole frame) to keep the fuzz/blur passes cheap
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
        const LX = Math.floor(x0) - 24, LY = Math.floor(y0) - 24, L = H.layer(Math.ceil(x1 - LX) + 24, Math.ceil(y1 - LY) + 24), c = L.getContext('2d');
        c.translate(-LX, -LY);
        const path = (cc) => { cc.beginPath(); pts.forEach(([x, y], i) => (i ? cc.lineTo(x, y) : cc.moveTo(x, y))); cc.closePath(); };
        path(c); c.fillStyle = col; c.fill();
        // fuzzy fibres poking past the cut edge
        const fr = H.rng(o.seed || 3);
        c.lineCap = 'round';
        walk([...pts, pts[0]], 1.6, (x, y, a) => {
          const nx = Math.sin(a), ny = -Math.cos(a), l = fr.range(0.5, 2.6), tw = fr.range(-0.8, 0.8);
          c.strokeStyle = col; c.lineWidth = fr.range(0.5, 1.1);
          c.beginPath(); c.moveTo(x - nx * 1.5, y - ny * 1.5); c.lineTo(x + (nx + tw * ny) * l * (o.outward ?? 1), y + (ny - tw * nx) * l * (o.outward ?? 1)); c.stroke();
        });
        c.save(); c.globalCompositeOperation = 'source-atop';
        fpat.setTransform(new DOMMatrix().translateSelf(fr() * 256, fr() * 256));
        c.fillStyle = fpat; c.fillRect(LX, LY, L.width, L.height);
        // soft rounded felt edge: darker rim, lighter top-left
        c.filter = 'blur(3px)'; c.lineWidth = 7; c.strokeStyle = 'rgba(0,0,0,0.22)'; path(c); c.stroke();
        c.translate(-2, -2); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.12)'; path(c); c.stroke();
        c.restore();
        // drop-on: falls in slightly large with a lifted shadow, squashes and settles
        const u = o.at == null ? 1 : H.clamp((t - o.at) / 0.5);
        const lift = 1 - H.ease.out(u);
        const sq = u < 1 ? Math.sin(Math.min(1, u * 1.6) * Math.PI) * 0.035 * (u > 0.45 ? 1 : 0) : 0;
        const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
        ctx.save(); ctx.shadowColor = `rgba(40,20,10,${0.45 - lift * 0.2})`; ctx.shadowBlur = (o.sb ?? 12) + lift * 30; ctx.shadowOffsetX = (o.sx ?? 4) + lift * 22; ctx.shadowOffsetY = (o.sy ?? 6) + lift * 30;
        ctx.globalAlpha = H.clamp(u * 5);
        ctx.translate(cx, cy - lift * 24); ctx.scale(1 + lift * 0.14 + sq, 1 + lift * 0.14 - sq); ctx.translate(-cx, -cy);
        ctx.drawImage(L, LX, LY); ctx.restore();
      };
      const circlePts = (cx, cy, R, n = 120, wob = 0.008, seed = 0) => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; const k = 1 + nz.n2(Math.cos(a) + seed, Math.sin(a)) * wob; return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]; });
      const blobPts = (cx, cy, R, seed, amp, sx = 1, sy = 1, n = 70) => Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU; const k = 1 + nz.fbm2(Math.cos(a) * 1.2 + seed, Math.sin(a) * 1.2 + seed, 3) * amp; return [cx + Math.cos(a) * R * k * sx, cy + Math.sin(a) * R * k * sy]; });

      const G = { x: 560, y: 368, R: 206 };
      // orbit ellipse thread (behind globe)
      const orbit = (a0, a1) => { const pts = []; for (let a = a0; a <= a1; a += 0.02) { const x = Math.cos(a) * 360, y = Math.sin(a) * 118, rr = -0.22; pts.push([G.x + x * Math.cos(rr) - y * Math.sin(rr), G.y + 10 + x * Math.sin(rr) + y * Math.cos(rr)]); } return pts; };
      running(orbit(Math.PI, TAU), '#f2c14e', 13, 8, 3.2, prog(1.6, 2.0));
      // globe
      const gpts = circlePts(G.x, G.y, G.R, 160, 0.01, 2);
      felt(gpts, '#2f5f9a', { seed: 5, sb: 24, sx: 9, sy: 14, at: 0.1 });
      // continents (green felt, running-stitched edges)
      const conts = [
        blobPts(G.x - 70, G.y - 60, 70, 3, 0.35, 1.0, 1.15), blobPts(G.x + 75, G.y + 40, 62, 8, 0.4, 0.9, 1.3), blobPts(G.x - 50, G.y + 110, 38, 12, 0.35, 1.3, 0.7), blobPts(G.x + 110, G.y - 110, 30, 17, 0.3, 1.2, 0.8),
      ];
      // clip continents to the globe disc
      const inside = (pts) => pts.map(([x, y]) => { const dx = x - G.x, dy = y - G.y, d = Math.hypot(dx, dy), m = G.R - 16; return d > m ? [G.x + (dx / d) * m, G.y + (dy / d) * m] : [x, y]; });
      conts.forEach((c0, i) => {
        const c = inside(c0);
        felt(c, i % 2 ? '#8dbb5e' : '#73a650', { seed: 30 + i, sb: 6, sx: 2.5, sy: 3.5, at: 0.55 + i * 0.13 });
        const inset = c.map(([x, y]) => { const cx = c.reduce((s, p) => s + p[0], 0) / c.length, cy = c.reduce((s, p) => s + p[1], 0) / c.length; const dx = x - cx, dy = y - cy, dd = Math.hypot(dx, dy) || 1; return [x - (dx / dd) * 7, y - (dy / dd) * 7]; });
        running([...inset, inset[0]], '#f2c14e', 8, 5, 2.5, prog(1.3 + i * 0.12, 1.9 + i * 0.12));
      });
      // blanket stitch around the globe
      {
        const n = gpts.length, step = 2;
        let prev = null;
        const bp = prog(0.9, 1.9);
        for (let i = 0; i < n * bp; i += step) {
          const [x, y] = gpts[i], dx = x - G.x, dy = y - G.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
          const ox = x + ux * 2, oy = y + uy * 2, ix = x - ux * 15, iy = y - uy * 15;
          if (prev) threadSeg(prev[0], prev[1], ox, oy, '#f4ead2', 2.8);
          threadSeg(ix, iy, ox, oy, '#f4ead2', 2.8);
          prev = [ox, oy];
        }
        if (bp >= 1) threadSeg(prev[0], prev[1], gpts[0][0] + ((gpts[0][0] - G.x) / G.R) * 1.5, gpts[0][1] + ((gpts[0][1] - G.y) / G.R) * 1.5, '#f4ead2', 2.2);
      }
      // orbit front half
      running(orbit(0, Math.PI), '#f2c14e', 13, 8, 3.2, prog(2.0, 2.4));

      // ---------- buttons as network nodes, linked by thread ----------
      const nodes = [
        [G.x - 300, G.y - 70, 26, '#e8b04a', 4], [G.x + 330, G.y - 120, 30, '#d9564a', 4], [G.x + 250, G.y + 120, 22, '#f4efe4', 2],
        [G.x - 210, G.y + 140, 24, '#6fb3a6', 4], [G.x - 40, G.y - 40, 20, '#f4efe4', 4], [G.x + 95, G.y + 45, 18, '#e8b04a', 2],
        [G.x - 60, G.y + 115, 16, '#ef9aa6', 2], [G.x + 490, G.y + 20, 24, '#6fb3a6', 4], [G.x + 120, G.y - 115, 15, '#d9564a', 2],
      ];
      const links = [[0, 4], [4, 5], [5, 2], [4, 8], [8, 1], [1, 7], [2, 7], [6, 3], [6, 5], [0, 3], [4, 6]];
      const grow = prog(2.55, 3.7);
      links.forEach(([a, b], li) => {
        const A = nodes[a], B = nodes[b];
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - 28 - (li % 3) * 8;
        const pts = [];
        const frac = H.clamp(grow * links.length - li * 0.6, 0, 1);
        for (let k = 0; k <= 30 * frac; k++) { const u = k / 30; pts.push([(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * mx + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * my + u * u * B[1]]); }
        if (pts.length > 1) running(pts, '#c8443a', 12, 7, 3.2);
      });
      nodes.forEach(([x, y, R0, col, holes], i) => {
        const bu = prog(2.05 + i * 0.07, 2.35 + i * 0.07);
        if (bu <= 0) return;
        const R = R0 * Math.max(0.15, H.ease.back(bu));
        const rgb = hx(col);
        ctx.save();
        ctx.shadowColor = 'rgba(40,20,10,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
        const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R);
        g.addColorStop(0, H.rgba(rgb.map((v) => Math.min(255, v * 1.25 + 20)))); g.addColorStop(0.7, H.rgba(rgb)); g.addColorStop(1, H.rgba(rgb.map((v) => v * 0.7)));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
        ctx.restore();
        // rim + dished centre
        ctx.strokeStyle = H.rgba(rgb.map((v) => v * 0.6), 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R * 0.72, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, R * 0.76, 0.2, 1.8); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, R - 1.5), 3.4, 4.6); ctx.stroke();
        // holes + thread
        const hp = holes === 4 ? [[-1, -1], [1, -1], [1, 1], [-1, 1]] : [[-1, 0], [1, 0]];
        const hs = R * 0.24;
        const tc = col === '#d9564a' || col === '#ef9aa6' ? '#f4ead2' : '#c8443a';
        if (bu < 1) return;
        if (holes === 4) { threadSeg(x - hs, y - hs, x + hs, y + hs, tc, 2.2); threadSeg(x + hs, y - hs, x - hs, y + hs, tc, 2.2); }
        else threadSeg(x - hs * 1.1, y, x + hs * 1.1, y, tc, 2.4);
        hp.forEach(([a, b]) => { ctx.fillStyle = 'rgba(30,15,10,0.55)'; ctx.beginPath(); ctx.arc(x + a * hs * (holes === 2 ? 1.1 : 1), y + b * hs, R * 0.09, 0, TAU); ctx.fill(); });
        // specular glint
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x - R * 0.45, y - R * 0.5, R * 0.18, R * 0.08, -0.6, 0, TAU); ctx.fill();
      });

      // ---------- felt heart + star accents ----------
      {
        const heart = []; for (let i = 0; i < 80; i++) { const a = (i / 80) * TAU; const x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); heart.push([1080 + x * 3.2, 150 + y * 3.2]); }
        felt(heart, '#d9564a', { seed: 61, sb: 10, at: 0.3 });
        const hi = heart.map(([x, y]) => [1080 + (x - 1080) * 0.78, 150 + (y - 150) * 0.78 + 3]);
        running([...hi, hi[0]], '#f4ead2', 6, 5, 1.8, prog(0.9, 1.4));
        const star = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, rr = i % 2 ? 17 : 38; star.push([175 + Math.cos(a) * rr, 120 + Math.sin(a) * rr]); }
        felt(star, '#f2c14e', { seed: 62, sb: 9, at: 0.42 });
        const si = star.map(([x, y]) => [175 + (x - 175) * 0.62, 120 + (y - 120) * 0.62 + 1]);
        running([...si, si[0]], '#c8443a', 5, 4, 1.7, prog(1.0, 1.5));
      }

      // ---------- sewn-on woven label with satin-stitched lettering ----------
      {
        const lx = 1010, ly = 612, lw = 390, lh = 100, rot = -0.05;
        const lu = prog(1.55, 2.0);
        if (lu > 0) {
        ctx.save(); ctx.translate(lx + (1 - H.ease.out(lu)) * 420, ly); ctx.rotate(rot - (1 - H.ease.out(lu)) * 0.25);
        ctx.save(); ctx.shadowColor = 'rgba(40,20,10,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#f3ecdc'; ctx.fillRect(-lw / 2, -lh / 2, lw, lh); ctx.restore();
        // twill weave
        ctx.save(); ctx.beginPath(); ctx.rect(-lw / 2, -lh / 2, lw, lh); ctx.clip();
        ctx.strokeStyle = 'rgba(120,100,70,0.12)'; ctx.lineWidth = 1;
        for (let k = -lw; k < lw; k += 3) { ctx.beginPath(); ctx.moveTo(k, -lh / 2); ctx.lineTo(k + lh, lh / 2); ctx.stroke(); }
        // folded-under ends
        const fg = ctx.createLinearGradient(-lw / 2, 0, -lw / 2 + 16, 0); fg.addColorStop(0, 'rgba(90,60,30,0.3)'); fg.addColorStop(1, 'rgba(90,60,30,0)');
        ctx.fillStyle = fg; ctx.fillRect(-lw / 2, -lh / 2, 16, lh);
        const fg2 = ctx.createLinearGradient(lw / 2, 0, lw / 2 - 16, 0); fg2.addColorStop(0, 'rgba(90,60,30,0.3)'); fg2.addColorStop(1, 'rgba(90,60,30,0)');
        ctx.fillStyle = fg2; ctx.fillRect(lw / 2 - 16, -lh / 2, 16, lh);
        // woven border lines
        ctx.fillStyle = '#c8443a'; ctx.fillRect(-lw / 2, -lh / 2 + 6, lw, 3); ctx.fillRect(-lw / 2, lh / 2 - 9, lw, 3);
        ctx.restore();
        // satin-stitched text: thread lines clipped to glyphs
        const M = H.layer(lw, lh), mc = M.getContext('2d');
        mc.font = '700 42px "Fredoka"'; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillStyle = '#fff';
        mc.fillText('WORLD WIDE WEB', lw / 2, lh / 2 + 2);
        mc.globalCompositeOperation = 'source-in';
        mc.fillStyle = '#2f5f9a'; mc.fillRect(0, 0, lw, lh);
        mc.globalCompositeOperation = 'source-atop';
        mc.lineWidth = 1;
        for (let k = -lh; k < lw + lh; k += 2) {
          mc.strokeStyle = 'rgba(255,255,255,0.28)'; mc.beginPath(); mc.moveTo(k, 0); mc.lineTo(k + lh * 0.35, lh); mc.stroke();
          mc.strokeStyle = 'rgba(0,0,30,0.25)'; mc.beginPath(); mc.moveTo(k + 1, 0); mc.lineTo(k + 1 + lh * 0.35, lh); mc.stroke();
        }
        // satin stitch fills the letters left to right
        const tp = prog(2.0, 2.7);
        ctx.save(); ctx.beginPath(); ctx.rect(-lw / 2, -lh / 2, lw * (0.12 + 0.76 * tp) + (tp >= 1 ? lw : 0), lh); ctx.clip();
        ctx.shadowColor = 'rgba(20,10,5,0.45)'; ctx.shadowBlur = 1.5; ctx.shadowOffsetX = 0.8; ctx.shadowOffsetY = 1.2;
        if (tp > 0) ctx.drawImage(M, -lw / 2, -lh / 2); ctx.restore();
        ctx.restore();
        // stitched down at both ends (in world coords)
        const cr = Math.cos(rot), sr = Math.sin(rot), tw = (x, y) => [lx + x * cr - y * sr, ly + x * sr + y * cr];
        running([tw(-lw / 2 + 9, -lh / 2 + 4), tw(-lw / 2 + 9, lh / 2 - 4)], '#c8443a', 7, 5, 2, prog(2.7, 2.9));
        running([tw(lw / 2 - 9, -lh / 2 + 4), tw(lw / 2 - 9, lh / 2 - 4)], '#c8443a', 7, 5, 2, prog(2.9, 3.1));
        }
      }

      // ---------- soft studio light ----------
      ctx.save(); ctx.globalCompositeOperation = 'soft-light';
      const lg = ctx.createRadialGradient(380 + t * 10, 190 + Math.sin(t * 0.7) * 15, 60, 600, 360, 900);
      lg.addColorStop(0, 'rgba(255,245,220,0.55)'); lg.addColorStop(1, 'rgba(30,20,10,0.5)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H_); ctx.restore();
      H.vignette(ctx, W, H_, 0.4, '35,20,10');
      H.grain(ctx, W, H_, 0.025, 6 + Math.floor(t * 12));
    },
  });
}
```
