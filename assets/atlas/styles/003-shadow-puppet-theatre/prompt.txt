I want an animated explainer made in the "Shadow Puppet Theatre" visual style (Paper & Craft). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): IM Fell English, Libre Baskerville
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=block">
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
Name: Shadow Puppet Theatre
Family: Paper & Craft
Look: Black cut-out silhouettes with punched lace-like cut-work, pinned joints and thin control rods, pressed against a backlit cloth screen glowing amber at the lamp and falling to red-brown at the edges, with coloured gels in the openings.
Motion: The oil lamp sputters alight, puppets slide and hop in on their rods with jointed limbs swinging, hanging cards drop and sway on their strings, and the flame keeps the screen gently breathing.
How it explains: Told as a little shadow play: a mechanical owl puppet is fed picture cards on rods, guesses on a hanging tag, a teacher's hand corrects it and its cut-work gears re-set, then it climbs a ladder toward a filling moon; transitions are the medium's own (the owl flies at the lamp so its shadow fills the screen, the lamp is turned down and up, lace curtains close and part), arrows are growing hide vines and labels are punched plaques on strings.

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

REFERENCE STYLE SOURCE (styles/shadow-puppet.js; W/H_ are always 1280x720)
```js
{
  // ---------- Shadow Puppet Theatre ----------
  // Black cut-out puppets with punched cut-work, pinned joints and rods, pressed against a backlit cloth screen.
  // Pipeline per frame: lamp light on the cloth -> coloured gels (multiply) -> silhouettes (each puppet is drawn on
  // its own scratch layer, holes punched with destination-out, then laid on the shadow layer, blurred if it is held
  // away from the screen) -> cloth weave, light diffusion, grain.
  const INK = 'rgb(20,8,4)';
  const FF = '"IM Fell English"';
  const NF = '"Libre Baskerville"'; // lining figures for the counters
  const TAU = Math.PI * 2;
  const NZ = H.makeNoise(4242);
  const sm = H.smooth, cl = H.clamp, lerp = H.lerp, EO = H.ease.out, EIO = H.ease.inOut;
  const LAY = {};
  function lay(name, w, h) {
    let c = LAY[name];
    if (!c) c = LAY[name] = H.layer(w, h);
    const x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none';
    x.clearRect(0, 0, c.width, c.height);
    return c;
  }

  // ---------- small drawing helpers ----------
  function cut(p, fn) { p.save(); p.globalCompositeOperation = 'destination-out'; p.fillStyle = '#000'; p.strokeStyle = '#000'; fn(); p.restore(); }
  function dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  // teardrop: round end at (x,y), point at distance len along angle a
  function tear(c, x, y, len, w, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0, -w / 2); c.quadraticCurveTo(len * 0.55, -w * 0.45, len, 0); c.quadraticCurveTo(len * 0.55, w * 0.45, 0, w / 2);
    c.arc(0, 0, w / 2, Math.PI / 2, Math.PI * 1.5); c.fill(); c.restore();
  }
  // a pivot pin: a punched ring around a rivet head
  function pin(p, x, y, r) { r = r || 8; cut(p, () => dot(p, x, y, r)); p.fillStyle = INK; dot(p, x, y, r * 0.55); }
  function gearPath(c, r, n, depth, rot) {
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const a0 = rot + i * TAU / n, s = TAU / n;
      [[a0, r - depth], [a0 + s * 0.12, r], [a0 + s * 0.42, r], [a0 + s * 0.54, r - depth]].forEach(([a, rr], k) => {
        const X = Math.cos(a) * rr, Y = Math.sin(a) * rr;
        if (i === 0 && k === 0) c.moveTo(X, Y); else c.lineTo(X, Y);
      });
    }
    c.closePath();
  }
  const both = (cs, fn) => cs.forEach(fn);
  const wpt = (p, x, y) => { const q = p.getTransform().transformPoint(new DOMPoint(x, y)); return [q.x, q.y]; };
  // a cubic bezier point / tangent
  const bz = (P, u) => { const v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; };
  const bzA = (P, u) => { const a = bz(P, Math.max(0, u - 0.01)), b = bz(P, Math.min(1, u + 0.01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const swing = (t, t0, amp, k, w) => (t > t0 ? amp * Math.exp(-(t - t0) * k) * Math.sin((t - t0) * w) : 0);
  const blinkAt = (t, list) => list.reduce((m, b) => Math.max(m, 1 - Math.abs((t - b) / 0.08)), 0);

  // ---------- frame lifecycle ----------
  function begin(W, Hh) { return { W, Hh, S: lay('S', W, Hh), G: lay('G', W, Hh), rods: [] }; }
  // draw one puppet: fn(p, g, rods) on a fresh scratch layer, then lay it on the shadow layer
  function pup(st, o, fn) {
    const P = lay('P', st.W, st.Hh), p = P.getContext('2d'), g = st.G.getContext('2d');
    p.fillStyle = INK; p.strokeStyle = INK;
    g.save(); fn(p, g, st.rods); g.restore();
    const s = st.S.getContext('2d');
    s.save(); s.globalAlpha = o.alpha == null ? 1 : o.alpha; if (o.blur) s.filter = `blur(${o.blur}px)`; s.drawImage(P, 0, 0); s.restore();
  }
  const STOPS = [[0, [255, 232, 168]], [0.16, [255, 200, 104]], [0.42, [238, 132, 46]], [0.68, [168, 60, 20]], [0.88, [84, 24, 9]], [1, [38, 10, 4]]];
  function lamp(ctx, W, Hh, t, b, flare) {
    const f = 1 + 0.045 * NZ.n2(t * 6.1, 0.3) + 0.025 * NZ.n2(t * 17.3, 2.2);
    const B = Math.max(0, b * f);
    const cx = 640 + NZ.n2(t * 0.9, 5) * 12, cy = 320 + NZ.n2(7, t * 0.8) * 9;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 860 + (flare || 0) * 200);
    STOPS.forEach(([o, c]) => g.addColorStop(o, H.rgba(c.map((v) => Math.min(255, v * B + (255 - v) * (flare || 0) * 0.7)), 1)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
  }
  function weave(W, Hh) {
    if (LAY._weave) return LAY._weave;
    const c = H.layer(W, Hh), x = c.getContext('2d'), img = x.createImageData(W, Hh), d = img.data, r = H.rng(77);
    const row = Float32Array.from({ length: Hh }, () => 0.6 + r() * 0.8), col = Float32Array.from({ length: W }, () => 0.6 + r() * 0.8);
    for (let y = 0; y < Hh; y++) for (let X = 0; X < W; X++) {
      const i = (y * W + X) * 4;
      const th = (y % 3 === 0 ? 1 : y % 3 === 1 ? 0.35 : 0) * row[y] * (0.7 + 0.3 * Math.sin(X * 0.05 + row[y] * 9));
      const tv = (X % 3 === 0 ? 1 : X % 3 === 1 ? 0.3 : 0) * col[X] * (0.7 + 0.3 * Math.sin(y * 0.043 + col[X] * 7));
      const v = 255 * (1 - 0.075 * th - 0.06 * tv);
      d[i] = v; d[i + 1] = v * 0.985; d[i + 2] = v * 0.97; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    // soft folds and slubs of the cloth (low-res, scaled up)
    const f = H.layer(160, 90), fx = f.getContext('2d'), fi = fx.createImageData(160, 90);
    for (let y = 0; y < 90; y++) for (let X = 0; X < 160; X++) {
      const v = 255 * (1 - 0.07 * (0.5 + 0.5 * NZ.fbm2(X * 0.05, y * 0.012, 3)) - 0.03 * (0.5 + 0.5 * NZ.n2(X * 0.4, y * 0.2)));
      const i = (y * 160 + X) * 4; fi.data[i] = fi.data[i + 1] = fi.data[i + 2] = v; fi.data[i + 3] = 255;
    }
    fx.putImageData(fi, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.imageSmoothingEnabled = true; x.drawImage(f, 0, 0, W, Hh);
    // a vertical seam in the cloth
    x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(200,190,180,1)'; x.fillRect(214, 0, 2, Hh); x.fillStyle = 'rgba(232,226,220,1)'; x.fillRect(211, 0, 7, Hh);
    LAY._weave = c; return c;
  }
  function grainTile(k) {
    const key = '_grain' + k;
    if (LAY[key]) return LAY[key];
    const c = H.layer(256, 256), x = c.getContext('2d'), img = x.createImageData(256, 256), r = H.rng(900 + k);
    for (let i = 0; i < img.data.length; i += 4) { const w = r() < 0.5 ? 0 : 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = w; img.data[i + 3] = r() * 26; }
    x.putImageData(img, 0, 0); LAY[key] = c; return c;
  }
  function end(ctx, st, t) {
    const { W, Hh } = st;
    // rods: thin sticks running down out of frame to the puppeteers, a little off the screen so a little soft
    if (st.rods.length) {
      const R = lay('R', W, Hh), r = R.getContext('2d');
      r.strokeStyle = INK; r.lineCap = 'round';
      st.rods.forEach(([x, y, w, a]) => { r.globalAlpha = a == null ? 1 : a; r.lineWidth = w || 3.2; r.beginPath(); r.moveTo(x, y); r.lineTo(x + (x - 640) * 0.14 + 18, Hh + 40); r.stroke(); dot(r, x, y, (w || 3.2) * 1.2); });
      r.globalAlpha = 1;
      const s = st.S.getContext('2d'); s.save(); s.filter = 'blur(1.3px)'; s.globalAlpha = 0.9; s.drawImage(R, 0, 0); s.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(st.G, 0, 0); ctx.restore();
    ctx.save(); ctx.filter = 'blur(0.7px)'; ctx.globalAlpha = 0.97; ctx.drawImage(st.S, 0, 0); ctx.restore();
    // the cloth
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(weave(W, Hh), 0, 0); ctx.restore();
    // light diffusing through the cloth: glow bleeding into the shadows and around the punched holes
    const hl = lay('half', W / 4, Hh / 4), hx = hl.getContext('2d');
    hx.filter = 'blur(5px)'; hx.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.13; ctx.drawImage(hl, 0, 0, W, Hh); ctx.restore();
    // grain, shifted at 12 fps
    const fr = Math.floor(t * 12), gt = grainTile(fr % 3), gr = H.rng(fr + 5);
    ctx.save(); ctx.fillStyle = ctx.createPattern(gt, 'repeat'); ctx.translate(-gr() * 256, -gr() * 256); ctx.fillRect(0, 0, W + 256, Hh + 256); ctx.restore();
    H.vignette(ctx, W, Hh, 0.38, '20,5,2');
  }

  // ---------- stage furniture (cached) ----------
  function valance(W) {
    if (LAY._val) return LAY._val;
    const c = H.layer(W, 80), p = c.getContext('2d');
    p.fillStyle = INK; p.fillRect(0, 0, W, 14);
    for (let x = -16; x < W + 32; x += 32) { p.beginPath(); p.arc(x + 16, 13, 16, 0, Math.PI); p.fill(); }
    for (let x = 32; x < W; x += 64) { p.fillRect(x - 1, 20, 2, 22); tear(p, x, 40, 18, 9, Math.PI / 2); dot(p, x, 40, 5); }
    cut(p, () => { for (let x = 8; x < W; x += 12) dot(p, x, 6, 1.8); for (let x = -16; x < W + 32; x += 32) { dot(p, x + 16, 20, 3.2); tear(p, x + 10, 17, 7, 3.4, 2.4); tear(p, x + 22, 17, 7, 3.4, 0.74); } });
    LAY._val = c; return c;
  }
  function ground(W) {
    if (LAY._gnd) return LAY._gnd;
    const c = H.layer(W, 110), p = c.getContext('2d'), r = H.rng(31);
    p.fillStyle = INK; p.strokeStyle = INK; p.fillRect(0, 96, W, 14);
    // filigree grass: thin curved blades
    for (let x = -10; x < W + 10; x += 5 + r() * 6) {
      const h = 14 + r() * 34 * (0.6 + 0.4 * Math.sin(x * 0.013) ** 2), lean = (r() - 0.5) * 22, w = 2 + r() * 2.5;
      p.beginPath(); p.moveTo(x - w, 100); p.quadraticCurveTo(x + lean * 0.3, 100 - h * 0.6, x + lean, 100 - h); p.quadraticCurveTo(x + lean * 0.3 + w * 0.6, 100 - h * 0.55, x + w, 100); p.fill();
    }
    // curls, ferns, little flowers
    p.lineCap = 'round';
    for (let x = 60; x < W; x += 150 + r() * 90) {
      const dir = r() < 0.5 ? -1 : 1, h = 40 + r() * 26;
      p.lineWidth = 3; p.beginPath(); p.moveTo(x, 100); p.quadraticCurveTo(x + dir * 6, 100 - h * 0.6, x + dir * 2, 100 - h);
      for (let a = 0; a < 5.5; a += 0.3) { const rr = 10 * (1 - a / 6.2); p.lineTo(x + dir * (2 + 10 - Math.cos(a) * rr), 100 - h - Math.sin(a) * rr * dir * dir); }
      p.stroke();
      for (let k = 1; k < 4; k++) tear(p, x + dir * 3, 100 - h * k / 4.2, 14, 6, dir > 0 ? -0.5 : Math.PI + 0.5);
    }
    for (let x = 140; x < W; x += 260 + r() * 120) {
      const h = 50 + r() * 20; p.lineWidth = 2; p.beginPath(); p.moveTo(x, 100); p.quadraticCurveTo(x + 8, 100 - h / 2, x + 3, 100 - h); p.stroke();
      for (let k = 0; k < 6; k++) tear(p, x + 3, 100 - h, 11, 6, k * TAU / 6);
      cut(p, () => dot(p, x + 3, 100 - h, 2.4));
    }
    LAY._gnd = c; return c;
  }
  // a fern frond cut from hide (local coords: base at 0,0, growing up)
  function fernShape(p) {
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 10; p.lineCap = 'round';
    p.beginPath(); p.moveTo(0, 0); p.quadraticCurveTo(40, -200, 10, -360); p.stroke();
    for (let k = 1; k < 13; k++) { const q = k / 13, y = -q * 340, x = 40 * Math.sin(q * 2.4) - 4; tear(p, x, y, 110 * (1 - q * 0.6), 34 * (1 - q * 0.5), 0.2 - q * 0.3); tear(p, x, y, 90 * (1 - q * 0.6), 30 * (1 - q * 0.5), Math.PI - 0.4 + q * 0.2); }
  }
  // explainer depth cue: the same fern held right up by the lamp, so its shadow is huge and very soft.
  // The blurred sprite is cached once; per frame it is only rotated (sway) and laid on the shadow layer.
  const FERN_OX = 170, FERN_OY = 440;
  function nearFern(st, t, side, a) {
    if (!LAY._fern) {
      const c = H.layer(380, 520), x = c.getContext('2d');
      const raw = H.layer(380, 520), rx = raw.getContext('2d'); rx.translate(FERN_OX, FERN_OY); fernShape(rx);
      x.filter = 'blur(7px)'; x.drawImage(raw, 0, 0); LAY._fern = c;
    }
    const s = st.S.getContext('2d');
    s.save(); s.globalAlpha = a;
    if (side > 0) { s.translate(st.W, 0); s.scale(-1, 1); }
    s.translate(-30, 770); s.rotate(0.5 + Math.sin(t * 0.8) * 0.03); s.scale(1.08, 1.08);
    s.drawImage(LAY._fern, -FERN_OX, -FERN_OY);
    s.restore();
  }
  function stage(st, t) {
    const s = st.S.getContext('2d');
    s.drawImage(valance(st.W), 0, 0);
    s.drawImage(ground(st.W), 0, st.Hh - 110);
  }

  // ---------- puppets ----------
  // the mechanical owl. o: x,y (feet) s, tilt, head, wl, wr (wing lift), gear, blink, look [x,y], eye, gearGel, sparks
  function owl(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.tilt || 0); c.scale(o.s, o.s); });
    p.fillStyle = INK; p.strokeStyle = INK;
    // tail fan
    [-0.42, 0, 0.42].forEach((a) => tear(p, 0, -84, 112, 34, Math.PI / 2 + a));
    cut(p, () => [-0.42, 0, 0.42].forEach((a) => { for (let k = 1; k < 5; k++) dot(p, Math.cos(Math.PI / 2 + a) * (k * 20 + 6), -84 + Math.sin(Math.PI / 2 + a) * (k * 20 + 6) + 0, 2.6); }));
    // legs and claws
    p.fillRect(-36, -72, 14, 66); p.fillRect(22, -72, 14, 66);
    for (const fx of [-29, 29]) [0.3, 1.35, 2.7].forEach((a) => tear(p, fx, -6, 26, 9, a));
    // body
    p.beginPath(); p.ellipse(0, -190, 100, 138, 0, 0, TAU); p.fill();
    cut(p, () => {
      for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; dot(p, 4 + Math.cos(a) * 82, -200 + Math.sin(a) * 94, 3); }
      for (let row = 0; row < 3; row++) {
        const y = -94 + row * 15, n = 6 - row, sp = 20;
        for (let k = 0; k < n; k++) tear(p, (k - (n - 1) / 2) * sp, y, 13, 7, Math.PI / 2);
      }
      // side feather slits
      for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) { p.lineWidth = 2.4; p.beginPath(); p.arc(sd * 70, -150 + k * 20 - 40, 18, sd > 0 ? 2.2 : 0.2, sd > 0 ? 2.9 : 0.94); p.stroke(); }
    });
    // chest gears (the inner workings): light leaks through the teeth and spokes
    const gears = [[-18, -212, 46, 12, 1], [44, -150, 28, 8, -46 / 28], [40, -262, 19, 7, -46 / 19]];
    gears.forEach(([gx, gy, r, n, ratio]) => {
      const rot = (o.gear || 0) * ratio;
      both([p, g], (c) => { c.save(); c.translate(gx, gy); });
      cut(p, () => { gearPath(p, r, n, r * 0.2, rot); p.fill(); });
      g.fillStyle = o.gearGel || 'rgb(222,52,40)'; gearPath(g, r + 2, n, r * 0.2, rot); g.fill();
      p.fillStyle = INK; dot(p, 0, 0, r * 0.66);
      cut(p, () => { for (let k = 0; k < 5; k++) { const a = rot + k * TAU / 5; p.beginPath(); p.arc(0, 0, r * 0.52, a + 0.2, a + TAU / 5 - 0.2); p.arc(0, 0, r * 0.25, a + TAU / 5 - 0.35, a + 0.35, true); p.closePath(); p.fill(); } });
      pin(p, 0, 0, Math.max(4, r * 0.16));
      both([p, g], (c) => c.restore());
    });
    // cut-work sparks when the gears re-set
    if (o.sparks) {
      g.fillStyle = 'rgb(255,226,130)';
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU + 0.3, d = 120 + o.sparks * 60, x = Math.cos(a) * d * 0.9, y = -200 + Math.sin(a) * d;
        const s = 14 * Math.sin(Math.PI * o.sparks);
        if (s < 1) continue;
        p.save(); p.translate(x, y); p.rotate(o.sparks * 2);
        p.fillStyle = INK; p.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? s * 0.38 : s; p.lineTo(Math.cos(i * TAU / 8) * rr, Math.sin(i * TAU / 8) * rr); } p.fill();
        p.restore();
      }
    }
    // wings, pinned at the shoulders
    for (const sd of [-1, 1]) {
      const a = sd < 0 ? o.wl || 0 : o.wr || 0;
      both([p, g], (c) => { c.save(); c.translate(sd * 84, -262); c.rotate(-sd * a); c.scale(sd, 1); });
      p.fillStyle = INK;
      p.beginPath(); p.moveTo(-14, -8); p.bezierCurveTo(30, -22, 54, 40, 48, 110); p.bezierCurveTo(44, 170, 24, 215, 6, 246);
      p.bezierCurveTo(-4, 200, -22, 150, -24, 90); p.bezierCurveTo(-26, 40, -26, 10, -14, -8); p.fill();
      cut(p, () => {
        [[70, 3, 26], [118, 3, 22], [164, 2, 20], [204, 1, 16]].forEach(([y, n, len]) => { for (let k = 0; k < n; k++) tear(p, -8 + k * 18 - (n - 1) * 4, y - len, len, 9, Math.PI / 2 - 0.12); });
        p.lineWidth = 2.2; p.beginPath(); p.moveTo(-6, 20); p.bezierCurveTo(14, 60, 30, 120, 10, 230); p.stroke();
      });
      pin(p, 0, 0, 9);
      if (rods && !o.noRods) rods.push([...wpt(p, 6, 238), 2.6]);
      both([p, g], (c) => c.restore());
    }
    // head, pinned at the neck
    both([p, g], (c) => { c.save(); c.translate(0, -300); c.rotate(o.head || 0); c.translate(0, 300); });
    p.fillStyle = INK;
    p.beginPath(); p.ellipse(0, -372, 112, 84, 0, 0, TAU); p.fill();
    for (const sd of [-1, 1]) { p.beginPath(); p.moveTo(sd * 58, -442); p.quadraticCurveTo(sd * 112, -470, sd * 134, -508); p.quadraticCurveTo(sd * 120, -450, sd * 106, -404); p.closePath(); p.fill(); }
    const ey = -374, look = o.look || [0, 0];
    cut(p, () => {
      for (const sd of [-1, 1]) {
        const ex = sd * 46;
        for (let k = 0; k < 18; k++) {
          const a = k / 18 * TAU; if (Math.cos(a) * sd < -0.55) continue;
          p.lineWidth = 3.2; p.beginPath(); p.moveTo(ex + Math.cos(a) * 39, ey + Math.sin(a) * 39); p.lineTo(ex + Math.cos(a) * 54, ey + Math.sin(a) * 54); p.stroke();
        }
        tear(p, sd * 118, -480, 22, 7, sd > 0 ? -2.2 : -0.94);
        tear(p, sd * 100, -446, 16, 6, sd > 0 ? -2.0 : -1.14);
      }
      p.lineWidth = 3.5; p.beginPath(); p.moveTo(-14, -350); p.lineTo(14, -350); p.lineTo(0, -310); p.closePath(); p.stroke();
      for (let k = -4; k <= 4; k++) dot(p, k * 11, -440 + Math.abs(k) * 1.6, 2.4);
      for (const sd of [-1, 1]) dot(p, sd * 46, ey, 31);
    });
    g.fillStyle = o.eye || 'rgb(92,206,150)';
    for (const sd of [-1, 1]) dot(g, sd * 46, ey, 32);
    for (const sd of [-1, 1]) {
      const ex = sd * 46;
      p.fillStyle = INK; dot(p, ex + look[0] * 9, ey + look[1] * 9, 13);
      cut(p, () => dot(p, ex + look[0] * 9 + 4, ey + look[1] * 9 - 4, 3.6));
      const bl = o.blink || 0;
      if (bl > 0) { p.save(); p.beginPath(); p.arc(ex, ey, 32, 0, TAU); p.clip(); p.fillStyle = INK; p.fillRect(ex - 33, ey - 33, 66, 66 * bl); p.restore(); }
    }
    pin(p, 0, -300, 9);
    both([p, g], (c) => c.restore());
    if (rods && !o.noRods) rods.push([...wpt(p, 0, -70), 3.6]);
    both([p, g], (c) => c.restore());
  }

  function cat(c) {
    c.fillStyle = INK; c.strokeStyle = INK;
    c.beginPath(); c.ellipse(-12, 26, 36, 30, -0.15, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(10, 6, 17, 32, 0.12, 0, TAU); c.fill();
    c.beginPath(); c.arc(16, -30, 20, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(0, -38); c.lineTo(3, -68); c.lineTo(18, -48); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(18, -49); c.lineTo(34, -66); c.lineTo(36, -36); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(32, -23, 9, 7, 0.2, 0, TAU); c.fill();
    c.beginPath(); c.roundRect(12, 18, 12, 38, 5); c.fill();
    c.beginPath(); c.roundRect(-30, 46, 56, 10, 5); c.fill();
    c.lineCap = 'round'; c.lineWidth = 9; c.beginPath(); c.moveTo(-40, 46); c.bezierCurveTo(-74, 46, -72, 2, -54, -14); c.stroke();
    cut(c, () => {
      c.beginPath(); c.ellipse(24, -34, 4.4, 2.6, -0.25, 0, TAU); c.fill();
      c.lineWidth = 1.7; c.beginPath(); c.moveTo(5, -8); c.quadraticCurveTo(-10, 12, -8, 34); c.stroke();
      c.beginPath(); c.moveTo(36, -21); c.lineTo(52, -26); c.moveTo(36, -19); c.lineTo(52, -16); c.stroke();
    });
    c.lineWidth = 1.6; c.beginPath(); c.moveTo(40, -22); c.lineTo(58, -28); c.moveTo(40, -20); c.lineTo(58, -14); c.stroke();
  }
  function dog(c) {
    c.fillStyle = INK; c.strokeStyle = INK;
    c.beginPath(); c.ellipse(-14, 24, 36, 28, -0.1, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(10, 4, 18, 30, 0.15, 0, TAU); c.fill();
    c.beginPath(); c.arc(14, -30, 19, 0, TAU); c.fill();
    c.beginPath(); c.roundRect(20, -41, 34, 18, 8); c.fill();
    c.beginPath(); c.arc(54, -36, 6, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(1, -22, 9, 21, 0.35, 0, TAU); c.fill();
    c.beginPath(); c.roundRect(10, 16, 13, 40, 5); c.fill();
    c.beginPath(); c.roundRect(-38, 46, 66, 10, 5); c.fill();
    c.lineCap = 'round'; c.lineWidth = 8; c.beginPath(); c.moveTo(-46, 12); c.bezierCurveTo(-62, 2, -64, -20, -56, -34); c.stroke();
    cut(c, () => {
      dot(c, 22, -37, 3.6);
      c.lineWidth = 2.2; c.beginPath(); c.ellipse(1, -22, 9, 21, 0.35, 0, TAU); c.stroke();
      c.lineWidth = 3; c.setLineDash([3, 4]); c.beginPath(); c.arc(14, -30, 24, 1.2, 2.3); c.stroke(); c.setLineDash([]);
    });
  }
  // picture card on a rod. o: x,y (centre) s rot kind label gel
  function card(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(o.s, o.s); });
    p.fillStyle = INK;
    p.beginPath(); p.roundRect(-86, -112, 172, 224, 8); p.fill();
    for (let x = -78; x <= 78; x += 13) { dot(p, x, -112, 5.5); dot(p, x, 112, 5.5); }
    for (let y = -99; y <= 99; y += 13) { dot(p, -86, y, 5.5); dot(p, 86, y, 5.5); }
    cut(p, () => { p.beginPath(); p.roundRect(-70, -96, 140, 134, 5); p.fill(); });
    g.fillStyle = o.gel || (o.kind === 'cat' ? 'rgb(120,206,176)' : 'rgb(236,112,96)');
    g.beginPath(); g.roundRect(-72, -98, 144, 138, 5); g.fill();
    p.save(); p.translate(8, -24); p.scale(0.94, 0.94); (o.kind === 'cat' ? cat : dog)(p); p.restore();
    p.fillStyle = INK;
    cut(p, () => {
      for (let x = -64; x <= 64; x += 10) dot(p, x, 50, 2.1);
      p.font = `400 44px ${FF}`; p.textAlign = 'center'; p.textBaseline = 'alphabetic'; p.fillText(o.label || o.kind, 0, 96);
    });
    if (rods && !o.noRods) rods.push([...wpt(p, 0, 112), 3.2]);
    both([p, g], (c) => c.restore());
  }
  // a card that slips into the owl: drawn on its own scratch layer and laid down at alpha a (gel and rod fade with it)
  function cardFade(p, g, o, rods, a) {
    if (a <= 0.004) return;
    if (a >= 0.996) { card(p, g, o, rods); return; }
    const C = lay('C', p.canvas.width, p.canvas.height), c = C.getContext('2d'), n = rods ? rods.length : 0;
    c.fillStyle = INK; c.strokeStyle = INK;
    g.save(); g.globalAlpha = a; card(c, g, o, rods); g.restore();
    if (rods) for (let i = n; i < rods.length; i++) rods[i][3] = a;
    p.save(); p.globalAlpha = a; p.drawImage(C, 0, 0); p.restore();
  }
  // the teacher's articulated hand, pointing left. o: x,y (wrist pin) s rot
  function hand(p, g, o, rods) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    p.fillStyle = INK; p.strokeStyle = INK;
    p.beginPath(); p.moveTo(16, -26); p.lineTo(240, -40); p.lineTo(240, 40); p.lineTo(16, 26); p.closePath(); p.fill();
    for (let y = -30; y <= 30; y += 10) dot(p, 14, y, 7);
    cut(p, () => {
      for (let y = -24; y <= 24; y += 12) dot(p, 28, y, 3);
      for (let x = 56; x < 230; x += 26) { p.lineWidth = 2.4; p.beginPath(); p.moveTo(x, -22 - (x - 56) * 0.06); p.quadraticCurveTo(x + 10, 0, x + 2, 22 + (x - 56) * 0.06); p.stroke(); }
      dot(p, 0, 0, 9);
    });
    p.fillStyle = INK; dot(p, 0, 0, 5);
    p.save(); p.rotate(o.rot || 0);
    p.beginPath(); p.ellipse(-32, 0, 34, 25, 0, 0, TAU); p.fill();
    p.beginPath(); p.roundRect(-122, -14, 92, 15, 7.5); p.fill();
    [[-60, 7], [-58, 17], [-52, 26]].forEach(([x, y]) => { p.beginPath(); p.ellipse(x, y, 15, 6.5, 0.1, 0, TAU); p.fill(); });
    p.beginPath(); p.ellipse(-52, -21, 22, 7, -0.45, 0, TAU); p.fill();
    cut(p, () => {
      p.lineWidth = 2; p.beginPath(); p.moveTo(-72, 12); p.lineTo(-46, 12); p.moveTo(-70, 22); p.lineTo(-44, 22); p.stroke();
      p.beginPath(); p.arc(-110, -6.5, 4, -1.2, 1.2); p.stroke();
      p.beginPath(); p.moveTo(-80, -2); p.lineTo(-74, -2); p.stroke();
    });
    p.restore();
    if (rods) rods.push([...wpt(p, 200, 0), 3.4]);
    both([p, g], (c) => c.restore());
  }
  // a hanging tag with cut-out letters. o: x,y (hang pin) rot flip w h text size badge('x'|'v') badgeS
  function tag(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); });
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2;
    p.beginPath(); p.moveTo(0, 0); p.lineTo(0, 30); p.stroke(); dot(p, 0, 0, 4);
    both([p, g], (c) => { c.translate(0, 30 + o.h / 2); c.scale(o.flip == null ? 1 : o.flip, 1); });
    const w = o.w, h = o.h;
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 12); p.fill();
    for (let x = -w / 2 + 10; x <= w / 2 - 10; x += 14) { dot(p, x, -h / 2, 4.5); dot(p, x, h / 2, 4.5); }
    cut(p, () => {
      p.lineWidth = 2.4; p.beginPath(); p.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 7); p.stroke();
      p.font = `italic 400 ${o.size}px ${FF}`; p.textAlign = 'center'; p.textBaseline = 'middle'; p.fillText(o.text, o.tx || 0, 3);
    });
    if (o.badge && o.badgeS > 0.01) badge(p, g, { x: w / 2 - 38, y: 0, s: o.badgeS, ok: o.badge === 'v' });
    both([p, g], (c) => c.restore());
  }
  function badge(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); c.scale(o.s, o.s); });
    p.fillStyle = INK; dot(p, 0, 0, 40);
    for (let k = 0; k < 12; k++) dot(p, Math.cos(k * TAU / 12) * 40, Math.sin(k * TAU / 12) * 40, 7);
    cut(p, () => dot(p, 0, 0, 31));
    g.fillStyle = o.ok ? 'rgb(110,220,120)' : 'rgb(240,60,46)'; dot(g, 0, 0, 33);
    p.strokeStyle = INK; p.lineCap = 'round'; p.lineWidth = 11; p.beginPath();
    if (o.ok) { p.moveTo(-16, 1); p.lineTo(-4, 14); p.lineTo(18, -14); } else { p.moveTo(-14, -14); p.lineTo(14, 14); p.moveTo(14, -14); p.lineTo(-14, 14); }
    p.stroke();
    both([p, g], (c) => c.restore());
  }
  // small label plaque with cut letters, hung on a string of length `hang` (0 = sits)
  function plaque(p, o) {
    p.save(); p.translate(o.x, o.y); p.rotate(o.rot || 0);
    p.font = `italic 400 ${o.size}px ${FF}`;
    const tw = p.measureText(o.text).width, w = tw + o.size * 1.1, h = o.size * 1.5;
    p.fillStyle = INK; p.strokeStyle = INK;
    if (o.hang) { p.lineWidth = 2; p.beginPath(); p.moveTo(0, -h / 2); p.lineTo(0, -h / 2 - o.hang); p.stroke(); }
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, h * 0.28); p.fill();
    dot(p, -w / 2 - 4, 0, h * 0.24); dot(p, w / 2 + 4, 0, h * 0.24);
    cut(p, () => {
      p.lineWidth = 2; p.beginPath(); p.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, h * 0.2); p.stroke();
      dot(p, -w / 2 - 4, 0, h * 0.09); dot(p, w / 2 + 4, 0, h * 0.09);
      p.textAlign = 'center'; p.textBaseline = 'middle'; p.fillText(o.text, 0, 2);
    });
    p.restore();
  }
  // a growing vine-arrow (cut from one strip of hide): P = cubic bezier, prog 0..1
  function vine(p, P, prog, w) {
    if (prog <= 0.001) return;
    w = w || 7; p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round'; p.lineJoin = 'round';
    const N = 60, n = Math.max(2, Math.ceil(N * prog));
    p.lineWidth = w; p.beginPath();
    for (let i = 0; i <= n; i++) { const q = bz(P, Math.min(prog, i / N)); if (i === 0) p.moveTo(q[0], q[1]); else p.lineTo(q[0], q[1]); }
    p.stroke();
    // start curl
    const s0 = bz(P, 0), a0 = bzA(P, 0);
    p.lineWidth = 3.5; p.beginPath();
    for (let a = 0; a < 5.2; a += 0.25) { const r = 16 * (1 - a / 6), aa = a0 + Math.PI + a; p.lineTo(s0[0] + Math.cos(a0 + Math.PI) * 4 + Math.cos(aa) * r - Math.cos(a0 + Math.PI) * 16, s0[1] + Math.sin(a0 + Math.PI) * 4 + Math.sin(aa) * r - Math.sin(a0 + Math.PI) * 16); }
    p.stroke();
    // leaves
    [0.18, 0.34, 0.5, 0.66, 0.8].forEach((u, i) => {
      if (u > prog - 0.06) return;
      const q = bz(P, u), a = bzA(P, u) + (i % 2 ? 1 : -1) * 0.9, gr = Math.min(1, (prog - u) / 0.12);
      tear(p, q[0], q[1], 26 * gr, 11 * gr, a);
      cut(p, () => { p.lineWidth = 1.4; p.beginPath(); p.moveTo(q[0] + Math.cos(a) * 5, q[1] + Math.sin(a) * 5); p.lineTo(q[0] + Math.cos(a) * 20 * gr, q[1] + Math.sin(a) * 20 * gr); p.stroke(); });
    });
    // spade arrowhead
    const e = bz(P, prog), ea = bzA(P, prog);
    p.save(); p.translate(e[0], e[1]); p.rotate(ea);
    p.beginPath(); p.moveTo(30, 0); p.quadraticCurveTo(8, -6, -4, -19); p.quadraticCurveTo(2, -6, -6, 0); p.quadraticCurveTo(2, 6, -4, 19); p.quadraticCurveTo(8, 6, 30, 0); p.fill();
    cut(p, () => dot(p, 6, 0, 3.2));
    p.restore();
  }
  // hanging intertitle card with cut-out lettering. o: x,y centre, w,h, s, rot (about the top), lines [{text,size,y,italic,arrow}]
  function titleCard(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y - o.h / 2 * o.s); c.rotate(o.rot || 0); c.scale(o.s, o.s); c.translate(0, o.h / 2); });
    const w = o.w, h = o.h;
    p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2.4;
    p.beginPath(); p.moveTo(-w * 0.32, -h / 2); p.lineTo(-w * 0.32, -h / 2 - 900); p.moveTo(w * 0.32, -h / 2); p.lineTo(w * 0.32, -h / 2 - 900); p.stroke();
    p.beginPath(); p.roundRect(-w / 2, -h / 2, w, h, 14); p.fill();
    for (let x = -w / 2 + 12; x <= w / 2 - 12; x += 16) { dot(p, x, -h / 2, 6); dot(p, x, h / 2, 6); }
    for (const sx of [-1, 1]) { p.beginPath(); p.arc(sx * w / 2, 0, h * 0.22, -Math.PI / 2, Math.PI / 2, sx < 0); p.fill(); }
    cut(p, () => {
      p.lineWidth = 3; p.beginPath(); p.roundRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8); p.stroke();
      for (let x = -w / 2 + 34; x <= w / 2 - 34; x += 11) { dot(p, x, -h / 2 + 24, 1.8); dot(p, x, h / 2 - 24, 1.8); }
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        const cx = sx * (w / 2 - 34), cy = sy * (h / 2 - 34);
        dot(p, cx, cy, 4);
        [0, 1, 2].forEach((k) => tear(p, cx, cy, 14, 6, Math.atan2(-sy, -sx) + (k - 1) * 0.7 + Math.PI));
      }
      for (const sx of [-1, 1]) { dot(p, sx * (w / 2 + h * 0.1), 0, h * 0.07); }
      o.lines.forEach((L) => {
        p.font = `${L.italic ? 'italic ' : ''}400 ${L.size}px ${FF}`; p.textAlign = 'center'; p.textBaseline = 'alphabetic';
        if (L.arrow) {
          const tw = p.measureText(L.text).width, aw = L.size * 1.2, gap = L.size * 0.3, x0 = -(tw + aw + gap) / 2, ay = L.y - L.size * 0.3;
          p.fillText(L.text, x0 + aw + gap + tw / 2, L.y);
          p.fillRect(x0, ay - 3.5, aw - 16, 7);
          p.beginPath(); p.moveTo(x0 + aw, ay); p.lineTo(x0 + aw - 24, ay - 15); p.lineTo(x0 + aw - 24, ay + 15); p.closePath(); p.fill();
          dot(p, x0, ay, 7);
        } else p.fillText(L.text, 0, L.y);
      });
    });
    both([p, g], (c) => c.restore());
  }
  // moon in a lace frame; fill 0..1 = lit fraction, burst 0..1 = rays
  function moon(p, g, o) {
    both([p, g], (c) => { c.save(); c.translate(o.x, o.y); });
    const r = o.r;
    p.fillStyle = INK;
    if (o.burst > 0.01) {
      const L = 46 * o.burst;
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * TAU + 0.1, l = (k % 2 ? 0.6 : 1) * L, w = 0.09;
        p.beginPath(); p.moveTo(Math.cos(a - w) * (r + 12), Math.sin(a - w) * (r + 12)); p.lineTo(Math.cos(a) * (r + 16 + l), Math.sin(a) * (r + 16 + l)); p.lineTo(Math.cos(a + w) * (r + 12), Math.sin(a + w) * (r + 12)); p.fill();
        dot(p, Math.cos(a) * (r + 22 + l), Math.sin(a) * (r + 22 + l), 4 * o.burst);
      }
    }
    dot(p, 0, 0, r + 12);
    for (let k = 0; k < 20; k++) dot(p, Math.cos(k * TAU / 20) * (r + 12), Math.sin(k * TAU / 20) * (r + 12), 5.5);
    cut(p, () => { dot(p, 0, 0, r); for (let k = 0; k < 20; k++) dot(p, Math.cos((k + 0.5) * TAU / 20) * (r + 7), Math.sin((k + 0.5) * TAU / 20) * (r + 7), 1.8); });
    g.fillStyle = 'rgb(255,246,214)'; dot(g, 0, 0, r + 1);
    const f = cl(o.fill);
    p.fillStyle = INK; [[-0.3, -0.25, 0.16], [0.28, 0.1, 0.22], [-0.1, 0.42, 0.12], [0.35, -0.42, 0.09]].forEach(([x, y, rr]) => { dot(p, x * r, y * r, rr * r); cut(p, () => dot(p, x * r + rr * r * 0.25, y * r - rr * r * 0.2, rr * r * 0.72)); });
    if (f < 0.995) { p.save(); p.beginPath(); p.arc(0, 0, r + 0.5, 0, TAU); p.clip(); p.fillStyle = INK; dot(p, -2 * r * f, 0, r + 1); p.restore(); }
    both([p, g], (c) => c.restore());
  }
  function ladder(p, x, yTop, yBot, n) {
    p.fillStyle = INK; p.strokeStyle = INK;
    for (const sx of [-1, 1]) { p.beginPath(); p.moveTo(x + sx * 44 - 5, yBot); p.lineTo(x + sx * 40 - 4, yTop); p.lineTo(x + sx * 40 + 4, yTop); p.lineTo(x + sx * 44 + 5, yBot); p.fill(); dot(p, x + sx * 40, yTop, 8); }
    const step = (yBot - 52 - yTop) / (n - 1);
    for (let k = 0; k < n; k++) {
      const y = yBot - 52 - k * step;
      p.fillRect(x - 44, y - 4, 88, 8);
      for (const sx of [-1, 1]) { p.beginPath(); p.ellipse(x + sx * 42, y, 9, 6, 0, 0, TAU); p.fill(); }
    }
    cut(p, () => { for (let k = 0; k < n; k++) { const y = yBot - 52 - k * step; for (const sx of [-1, 1]) { p.lineWidth = 1.6; p.beginPath(); p.moveTo(x + sx * 42 - 6, y - 4); p.lineTo(x + sx * 42 + 6, y + 4); p.stroke(); } } for (let y = yTop + 20; y < yBot; y += 26) for (const sx of [-1, 1]) dot(p, x + sx * 41.5, y, 1.8); });
    return (k) => yBot - 52 - k * step;
  }
  function branch(p, x0, y0, x1, y1, r) {
    p.fillStyle = INK; p.strokeStyle = INK; p.lineCap = 'round';
    const P = [[x0, y0], [lerp(x0, x1, 0.35), y0 - 40], [lerp(x0, x1, 0.7), y1 + 30], [x1, y1]];
    for (let i = 0; i < 40; i++) { const q = bz(P, i / 40), q2 = bz(P, (i + 1) / 40); p.lineWidth = lerp(26, 6, i / 40); p.beginPath(); p.moveTo(q[0], q[1]); p.lineTo(q2[0], q2[1]); p.stroke(); }
    [0.2, 0.45, 0.62, 0.8, 0.92].forEach((u, i) => {
      const q = bz(P, u), up = i % 2 ? -1 : 1;
      p.lineWidth = 3; p.beginPath(); p.moveTo(q[0], q[1]);
      const ex = q[0] + (x1 - x0) * 0.05, ey = q[1] - up * 48;
      p.quadraticCurveTo(q[0] + 10, q[1] - up * 30, ex, ey); p.stroke();
      for (let a = 0, cx = ex, cy = ey; a < 5; a += 0.35) { const rr = 9 * (1 - a / 5.6); p.beginPath(); p.arc(ex + 9 * Math.cos(Math.PI), ey, rr, a, a + 0.4); p.stroke(); }
      tear(p, q[0], q[1], 34, 15, -up * 1.3 + (x1 < x0 ? Math.PI : 0) * 0.5 - 0.6);
      tear(p, (q[0] + ex) / 2, (q[1] + ey) / 2, 26, 12, -up * 2.2);
    });
    cut(p, () => { for (let i = 2; i < 30; i += 2) { const q = bz(P, i / 40); dot(p, q[0], q[1], 2.4 * (1 - i / 40)); } });
    void r;
  }
  function star(p, x, y, r) { p.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, a = i * TAU / 10 - Math.PI / 2; p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } p.fill(); }
  function curtains(p, W, Hh, cover, t) {
    const e = cover * (W / 2 + 40);
    for (const sd of [-1, 1]) {
      const wave = (y) => Math.sin(y * 0.018 + t * 2 + sd) * 10 + Math.sin(y * 0.05) * 4;
      const inner = (y) => (sd < 0 ? e - 40 + wave(y) : W - e + 40 + wave(y));
      const outer = sd < 0 ? -60 : W + 60;
      p.fillStyle = INK; p.beginPath(); p.moveTo(outer, -10);
      for (let y = -10; y <= Hh + 10; y += 20) p.lineTo(inner(y), y);
      p.lineTo(outer, Hh + 10); p.closePath(); p.fill();
      for (let y = 30; y < Hh; y += 24) { tear(p, inner(y), y, 18, 9, sd < 0 ? 0 : Math.PI); }
      cut(p, () => {
        const xs = sd < 0 ? [] : [];
        for (let k = 1; k < 9; k++) {
          const x = sd < 0 ? inner(0) - k * 70 : inner(0) + k * 70;
          for (let y = 50; y < Hh - 20; y += 22) { const xx = x + wave(y) * 0.6 + Math.sin(y * 0.03 + k) * 6; p.save(); p.translate(xx, y); p.rotate(Math.PI / 4); p.fillRect(-3.4, -3.4, 6.8, 6.8); p.restore(); }
        }
        for (let y = 40; y < Hh - 20; y += 18) dot(p, inner(y) - sd * 18, y, 3);
        void xs;
      });
    }
  }

  // ---------- the still / clip ----------
  function stillFrame(ctx, W, Hh, t) {
    const st = begin(W, Hh);
    let b = sm(0, 0.9, t) * (1 - 0.45 * Math.max(0, NZ.n2(t * 23, 9.1)) * (1 - sm(0.6, 1.05, t)));
    lamp(ctx, W, Hh, t, b, 0);
    // moon on its thread
    pup(st, {}, (p, g) => {
      const sw = Math.sin(t * 1.1) * 0.03;
      p.save(); p.translate(1116, 0); p.rotate(sw); p.lineWidth = 2; p.strokeStyle = INK; p.beginPath(); p.moveTo(0, 0); p.lineTo(0, 82); p.stroke(); p.restore();
      moon(p, g, { x: 1116 + Math.sin(sw) * -150, y: 150, r: 56, fill: 0.62, burst: 0 });
      [[972, 96, 15, 1.3], [1236, 120, 12, 0.9], [1036, 250, 10, 1.7]].forEach(([x, y, r, f]) => {
        const a = Math.sin(t * f + x) * 0.06; p.save(); p.translate(x, 0); p.rotate(a); p.lineWidth = 1.6; p.beginPath(); p.moveTo(0, 0); p.lineTo(0, y - r); p.stroke(); p.fillStyle = INK; star(p, 0, y, r); cut(p, () => dot(p, 0, y, r * 0.22)); p.restore();
      });
    });
    // title card drops on its strings and swings
    const cy = lerp(-260, 250, EO(sm(1.5, 2.15, t)));
    pup(st, {}, (p, g) => titleCard(p, g, { x: 300, y: cy, w: 440, h: 226, s: 1, rot: swing(t, 2.0, 0.09, 1.5, 6.5), lines: [{ text: 'The Thinking', size: 56, y: -6 }, { text: 'Machine', size: 62, y: 58, italic: true }] }));
    // branch from the right
    pup(st, {}, (p) => branch(p, 1300, 548, 640, 512));
    // owl hops along the branch
    const u = sm(0.7, 2.0, t), hop = Math.abs(Math.sin(u * Math.PI * 3)) * 26 * (1 - u);
    const flap = (1 - sm(1.8, 2.4, t)) * (0.55 + 0.45 * Math.sin(t * 15));
    pup(st, {}, (p, g, rods) => owl(p, g, {
      x: lerp(1460, 840, EO(u)), y: 512 - hop, s: 0.86, tilt: (1 - u) * -0.08,
      head: Math.sin(sm(2.6, 3.4, t) * Math.PI) * -0.16 + sm(3.6, 4.0, t) * 0.04, wl: 0.06 + flap + Math.sin(t * 2.2) * 0.03, wr: 0.06 + flap + Math.sin(t * 2.2 + 1) * 0.03,
      gear: Math.floor(t * 3) * 0.26 + sm(0, 0.12, (t * 3) % 1) * 0.26, blink: blinkAt(t, [3.45, 4.35]), look: [-0.7 + sm(2.6, 3.0, t) * 0.4, 0.1],
    }, rods));
    // a cat comes to look
    const cu = EO(sm(2.5, 3.3, t));
    pup(st, {}, (p, g, rods) => {
      p.save(); p.translate(lerp(-120, 372, cu), 628 - Math.abs(Math.sin(cu * Math.PI * 2)) * 12 * (1 - cu)); p.scale(1.15, 1.15); cat(p); rods.push([...wpt(p, -8, 50), 3]); p.restore();
    });
    stage(st, t);
    // an out-of-focus fern held near the lamp: big and soft
    pup(st, { blur: 7, alpha: 0.92 }, (p) => {
      p.save(); p.translate(-30, 770); p.rotate(0.5 + Math.sin(t * 0.8) * 0.03);
      fernShape(p);
      p.restore();
    });
    end(ctx, st, t);
  }

  // ---------- explainer: "How does AI learn?" as a shadow play ----------
  const XD = 15;
  // scene A cards (big, labelled) and the flock of small ones; times also used by the sound score
  const ACARDS = [{ t0: 2.7, kind: 'cat' }, { t0: 3.45, kind: 'dog' }, { t0: 4.2, kind: 'cat' }];
  const ACARD_DUR = 1.6;
  const cardPath = (u) => ({ x: lerp(-110, 1050, EIO(cl(u / 0.9))), y: 470 - 70 * Math.sin(Math.PI * Math.min(u, 0.85) / 0.85), rot: 0.07 * Math.sin(u * TAU * 1.5) });
  const fmt = (n) => n.toLocaleString('en-US');
  const countA = (t) => Math.round(Math.pow(10, 6 * sm(2.7, 5.5, t)));
  const accC = (t) => Math.round(61 + 36 * EO(sm(10.8, 12.0, t)));
  const VG = [[386, 322], [440, 140], [660, 104], [752, 250]];      // Guess vine (owl -> card)
  const VA = [[770, 520], [726, 660], [470, 668], [376, 566]];      // Adjust vine (card -> owl)

  function sceneA(st, t) {
    // the question card drops, then is hoisted into the corner
    const hp = EIO(sm(1.9, 2.5, t));
    const dropY = lerp(-240, 300, EO(sm(0.15, 0.8, t)));
    pup(st, {}, (p, g) => titleCard(p, g, {
      x: lerp(640, 238, hp), y: lerp(dropY, 86, hp), w: 800, h: 190, s: lerp(1, 0.5, hp),
      rot: swing(t, 0.7, 0.08, 2.2, 7) + swing(t, 2.45, 0.05, 2.5, 8),
      lines: [{ text: 'How does AI learn?', size: 74, y: 24 }],
    }));
    // counter board
    if (t > 2.5) {
      const dy = lerp(-260, 0, EO(sm(2.5, 2.85, t))), v = countA(t), pop = 1 + 0.1 * Math.exp(-Math.max(0, t - 5.5) * 8) * (t > 5.5 ? 1 : 0);
      pup(st, {}, (p) => {
        p.save(); p.translate(612, 214 + dy); p.rotate(swing(t, 2.85, 0.04, 2.5, 7));
        p.fillStyle = INK; p.strokeStyle = INK; p.lineWidth = 2;
        p.beginPath(); p.moveTo(-250, 34); p.lineTo(-250, -260); p.moveTo(250, 34); p.lineTo(250, -260); p.stroke();
        p.fillRect(-256, 22, 512, 7); dot(p, -256, 25, 8); dot(p, 256, 25, 8);
        p.save(); p.font = `400 88px ${NF}`; const cw = p.measureText(fmt(v)).width, fit = Math.min(1, 360 / cw); p.translate(0, -12); p.scale(pop * fit, pop * fit); p.textAlign = 'center'; p.textBaseline = 'alphabetic'; p.fillText(fmt(v), 0, 0); p.restore();
        p.restore();
        plaque(p, { x: 612, y: 248 + dy, text: 'examples', size: 36 });
      });
    }
    // big labelled cards (behind the owl, so they slip into it)
    pup(st, {}, (p, g, rods) => {
      ACARDS.forEach((c) => { const u = (t - c.t0) / ACARD_DUR; if (u <= 0 || u >= 0.9) return; const q = cardPath(u); cardFade(p, g, { ...q, s: 0.9, kind: c.kind }, rods, 1 - sm(880, 1010, q.x)); });
    });
    // the flock: many small cards, held further back (softer)
    if (t > 4.3) pup(st, { blur: 1.6, alpha: 0.95 }, (p, g) => {
      for (let j = 0; j < 18; j++) {
        const u = (t - 4.35 - j * 0.085) / 1.05; if (u <= 0 || u >= 0.88) continue;
        const q = cardPath(u); cardFade(p, g, { x: q.x, y: q.y + 20 + ((j % 3) - 1) * 80, rot: q.rot * 2, s: 0.36, kind: j % 2 ? 'dog' : 'cat', noRods: true }, null, 1 - sm(860, 990, q.x));
      }
    });
    // the owl (until it takes off)
    if (t < 5.85) {
      const u = sm(2.2, 3.0, t), hop = Math.abs(Math.sin(u * Math.PI * 2)) * 30 * (1 - u), flap = (1 - sm(2.8, 3.2, t)) * (0.5 + 0.5 * Math.sin(t * 16));
      const fed = ACARDS.reduce((m, c) => m + sm(c.t0 + 1.25, c.t0 + 1.45, t), 0) + sm(4.6, 5.9, t) * 4;
      pup(st, {}, (p, g, rods) => owl(p, g, {
        x: lerp(1460, 1036, EO(u)), y: 652 - hop, s: 0.86, wl: 0.05 + flap + Math.sin(t * 2.3) * 0.03, wr: 0.05 + flap + Math.sin(t * 2.3 + 1) * 0.03,
        gear: fed * 0.55, look: [-1, 0.25], head: -0.06, blink: blinkAt(t, [3.9, 5.2]),
      }, rods));
    }
  }
  function flyOver(st, t) {
    // the owl takes off and flies up toward the lamp: its shadow swells until it fills the screen
    const lift = sm(5.85, 6.05, t), q = sm(6.0, 6.62, t);
    const s = lerp(0.86, 7.2, Math.pow(q, 1.2));
    const cx = lerp(1036, 600, EIO(sm(0, 0.5, q))) - 900 * sm(0.5, 1, q) * sm(0.5, 1, q), cy = lerp(652 - 190 * 0.86 - 40 * lift, 360, EIO(sm(0, 0.5, q))) - 300 * sm(0.55, 1, q);
    const flap = 1.6 + 0.35 * Math.sin(t * 22);
    pup(st, { blur: 1 + 26 * q, alpha: 1 - 0.1 * q }, (p, g) => owl(p, g, { x: cx, y: cy + 190 * s, s, wl: lift * flap, wr: lift * flap, gear: t * 3, look: [0, -0.5], noRods: q > 0.05 }, q > 0.05 ? null : st.rods));
    const cover = sm(0.25, 0.42, q) * (1 - sm(0.5, 0.72, q));
    if (cover > 0) { const s2 = st.S.getContext('2d'); s2.save(); s2.globalAlpha = cover * 0.93; s2.fillStyle = INK; s2.fillRect(0, 0, st.W, st.Hh); s2.restore(); }
  }
  function sceneB(st, t) {
    const OW = { x: 262, y: 714, s: 0.95 };
    // card with the cat rises in on its rod
    const cy = lerp(900, 390, EO(sm(6.32, 6.85, t)));
    const tapT = 8.05, gearU = sm(9.0, 9.7, t);
    pup(st, {}, (p, g, rods) => card(p, g, { x: 850, y: cy, s: 1.1, kind: 'cat', rot: swing(t, 6.85, 0.05, 3, 9) + swing(t, tapT + 0.05, 0.05, 4, 14) }, rods));
    // owl close-up
    const adj = sm(9.0, 9.25, t) * (1 - sm(9.55, 9.9, t));
    pup(st, {}, (p, g, rods) => owl(p, g, {
      ...OW, wl: 0.05 + 0.32 * adj + Math.sin(t * 2.1) * 0.03, wr: 0.05 + 0.32 * adj + Math.sin(t * 2.1 + 1) * 0.03,
      head: 0.06 - 0.12 * sm(8.05, 8.2, t) * (1 - sm(8.6, 8.9, t)), look: t < 8.0 ? [1, -0.15] : t < 8.9 ? [1, 0.1] : [0.6, 0.5 * (1 - sm(9.7, 9.9, t))],
      gear: 2.2 + EIO(gearU) * 3.2, gearGel: gearU > 0.05 && gearU < 0.98 || (t > 9.0 && t < 9.95) ? 'rgb(255,214,96)' : undefined,
      sparks: sm(9.15, 9.75, t) * (t < 9.75 ? 1 : 0), blink: blinkAt(t, [6.6, 10.25]),
    }, rods));
    // Guess vine + its plaque, the guess tag hanging from it
    const gp = EIO(sm(6.9, 7.45, t));
    pup(st, {}, (p, g) => {
      vine(p, VG, gp, 7);
      if (t > 7.15) plaque(p, { x: 556, y: lerp(-60, 142, EO(sm(7.15, 7.4, t))), text: 'Guess', size: 38, rot: swing(t, 7.4, 0.06, 3, 9), hang: 220 });
      if (t > 7.42) {
        const hang = bz(VG, 0.64), drop = EO(sm(7.42, 7.62, t));
        const flipU = sm(9.72, 10.02, t), flip = Math.cos(flipU * Math.PI);
        const shake = t > tapT && t < tapT + 0.5 ? Math.sin((t - tapT) * 60) * 0.06 * (1 - (t - tapT) / 0.5) : 0;
        const right = flipU > 0.5;
        tag(p, g, {
          x: hang[0], y: hang[1] - 6, rot: swing(t, 7.62, 0.12, 2.5, 8) + shake, flip: Math.max(0.04, Math.abs(flip)),
          w: 200 * drop, h: 76 * drop, text: right ? 'cat' : 'dog?', size: 52 * drop, tx: -26,
          badge: t > tapT ? (right ? 'v' : 'x') : null, badgeS: right ? EO(sm(10.0, 10.18, t)) * 0.92 : EO(sm(tapT, tapT + 0.14, t)) * 0.92,
        });
      }
    });
    // the teacher's hand comes in and taps the card
    if (t > 7.7) {
      const inU = EO(sm(7.7, 8.0, t)), tap = Math.sin(Math.PI * sm(7.95, 8.15, t)) + Math.sin(Math.PI * sm(10.02, 10.22, t)) * 0.7;
      pup(st, { blur: 1.2 }, (p, g, rods) => {
        hand(p, g, { x: lerp(1420, 1082, inU) - tap * 22, y: 308 + tap * 4, s: 1, rot: -0.12 * tap }, rods);
        if (t > 8.12) plaque(p, { x: 1090, y: lerp(-40, 208, EO(sm(8.12, 8.36, t))), text: 'Check', size: 38, rot: swing(t, 8.36, 0.07, 3, 9), hang: 220 });
      });
    }
    // Adjust vine runs back into the owl's chest
    pup(st, {}, (p) => {
      vine(p, VA, EIO(sm(8.5, 9.02, t)), 7);
      if (t > 8.72) plaque(p, { x: 584, y: lerp(800, 598, EO(sm(8.72, 8.96, t))), text: 'Adjust', size: 38 });
    });
  }
  function sceneC(st, t) {
    const acc = accC(t), p01 = (acc - 61) / 36;
    const hit = t > 12.0 ? Math.exp(-(t - 12.0) * 5) : 0;
    pup(st, {}, (p) => {
      plaque(p, { x: 350, y: lerp(-60, 196, EO(sm(10.6, 10.85, t))), text: 'Accuracy', size: 46, rot: swing(t, 10.85, 0.05, 3, 8), hang: 220 });
      p.save(); p.translate(350, 440); p.scale(1 + hit * 0.14, 1 + hit * 0.14);
      p.fillStyle = INK; p.font = `400 170px ${NF}`; p.textAlign = 'center'; p.textBaseline = 'alphabetic'; p.fillText(acc + '%', 0, 0);
      p.restore();
      // emphasis: a vine flourish draws under the number
      vine(p, [[120, 500], [250, 545], [440, 470], [580, 500]], EIO(sm(12.0, 12.35, t)), 6);
    });
    // ladder, owl climbing rung by rung, moon filling at the top
    const climbP = cl(p01), kf = climbP * 9, k = Math.floor(kf), hopU = sm(0.55, 1, kf - k), pos = Math.min(9, k + hopU);
    const top = t > 12.0 ? 1 : 0;
    pup(st, {}, (p, g, rods) => {
      const rung = ladder(p, 820, 262, 720, 10);
      moon(p, g, { x: 1070, y: 250, r: 80, fill: 0.12 + 0.88 * climbP, burst: EO(sm(12.0, 12.3, t)) * (1 - 0.15 * Math.sin((t - 12) * 6) * (t > 12.3 ? 1 : 0)) });
      const hopY = Math.sin(Math.PI * hopU) * 22 * (k < 9 ? 1 : 0);
      const flap = (k < 9 ? Math.sin(Math.PI * hopU) * 0.9 : 0) + top * (0.5 + 0.5 * Math.sin(t * 14)) * (1 - sm(12.6, 12.9, t));
      owl(p, g, { x: 820, y: rung(pos) - hopY + 4, s: 0.38, wl: 0.06 + flap, wr: 0.06 + flap, gear: pos * 0.8, look: [0.6, -0.6], blink: blinkAt(t, [11.2]) }, rods);
    });
  }
  function sceneD(st, t) {
    pup(st, {}, (p, g) => titleCard(p, g, {
      x: 640, y: lerp(-200, 318, EO(sm(13.2, 13.5, t))), w: 940, h: 270, s: 1, rot: swing(t, 13.5, 0.05, 2.2, 6),
      lines: [{ text: 'More examples', size: 76, y: -14 }, { text: 'better guesses', size: 76, y: 84, italic: true, arrow: true }],
    }));
    pup(st, {}, (p, g, rods) => {
      card(p, g, { x: 168, y: 606, s: 0.5, kind: 'cat', rot: Math.sin(t * 2) * 0.03 }, rods);
      card(p, g, { x: 290, y: 616, s: 0.5, kind: 'dog', rot: Math.sin(t * 2 + 1) * 0.03 }, rods);
      const bow = Math.sin(Math.PI * sm(14.15, 14.75, t));
      owl(p, g, { x: 1100, y: 700, s: 0.4, tilt: bow * 0.25, head: bow * 0.2, wl: 0.1 + bow * 0.6, wr: 0.1 + bow * 0.6, gear: t, look: [-0.6, 0.2], blink: blinkAt(t, [13.8]) }, rods);
    });
  }
  function explainerFrame(ctx, W, Hh, t) {
    const st = begin(W, Hh);
    let b = sm(0, 0.55, t) * (1 - 0.35 * Math.max(0, NZ.n2(t * 23, 3.3)) * (1 - sm(0.35, 0.7, t)));
    b *= 1 - 0.93 * Math.sin(Math.PI * cl((t - 10.3) / 0.5));        // the lamp is turned down and up again
    const flare = t > 12.0 ? Math.exp(-(t - 12.0) * 3) * 0.32 : 0;  // 97%: the flame flares
    lamp(ctx, W, Hh, t, b + flare * 0.3, flare);
    // a red gel is slid in front of the lamp for the wrong guess
    const red = sm(8.03, 8.12, t) * (1 - sm(8.45, 8.75, t));
    if (red > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,70,50,${red * 0.75})`; ctx.fillRect(0, 0, W, Hh); ctx.restore(); }
    if (t < 6.28) sceneA(st, t); else if (t < 10.55) sceneB(st, t); else if (t < 13.2) sceneC(st, t); else sceneD(st, t);
    if (t > 5.8 && t < 6.7) flyOver(st, t);
    stage(st, t);
    // the soft near-lamp fern: bottom-left while the cards come in, bottom-right once the owl sits left
    if (t < 6.28) nearFern(st, t, -1, 0.82 * sm(0.3, 0.9, t)); else if (t < 13.2) nearFern(st, t, 1, 0.82);
    // lace curtains close and part again
    const cover = EIO(sm(12.85, 13.15, t)) * (1 - EIO(sm(13.3, 13.65, t)));
    if (cover > 0.001) pup(st, {}, (p) => curtains(p, W, Hh, cover, t));
    end(ctx, st, t);
  }

  registerStyle({
    id: 'shadow-puppet',
    name: 'Shadow Puppet Theatre',
    category: 'Paper & Craft',
    description: 'Black cut-out silhouettes with punched lace-like cut-work, pinned joints and thin control rods, pressed against a backlit cloth screen glowing amber at the lamp and falling to red-brown at the edges, with coloured gels in the openings.',
    motion: 'The oil lamp sputters alight, puppets slide and hop in on their rods with jointed limbs swinging, hanging cards drop and sway on their strings, and the flame keeps the screen gently breathing.',
    fonts: ['400 88px "Libre Baskerville"', '400 74px "IM Fell English"', 'italic 400 52px "IM Fell English"', '400 190px "IM Fell English"', 'italic 400 38px "IM Fell English"'],
    frameT: 4.6,
    duration: 5,
    readsPixels: false,
    explainerDuration: XD,
    explainerNote: 'Told as a little shadow play: a mechanical owl puppet is fed picture cards on rods, guesses on a hanging tag, a teacher\'s hand corrects it and its cut-work gears re-set, then it climbs a ladder toward a filling moon; transitions are the medium\'s own (the owl flies at the lamp so its shadow fills the screen, the lamp is turned down and up, lace curtains close and part), arrows are growing hide vines and labels are punched plaques on strings.',
    explainerSound(k) {
      const D = XD;
      // first time (1 ms scan) at which f(t) reaches or passes v
      const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
      // gamelan-ish struck bronze: fundamental + a slightly detuned twin (the ombak beat) + soft upper partials, all under 2.5 kHz
      const gam = (t, n, g = 1, pan = 0, minor = false) => {
        const f = k.hz(n);
        k.tone(t, { f, dur: 1.9, gain: 0.13 * g, a: 0.002, pan, verb: 0.3, minor });
        k.tone(t, { f: f * 1.007, dur: 1.6, gain: 0.07 * g, a: 0.002, pan, verb: 0.3, minor });
        k.tone(t, { f: f * 2.01, dur: 0.55, gain: 0.04 * g, a: 0.002, pan, minor });
        if (f * 2.95 < 2500) k.tone(t, { f: f * 2.95, dur: 0.22, gain: 0.018 * g, a: 0.002, pan, minor });
        k.noise(t, { dur: 0.02, filter: 'bandpass', f: Math.min(2200, f * 1.6), q: 2, gain: 0.08 * g, pan, minor });
      };
      // the low gong for 97%
      const gong = (t, g = 1) => {
        k.play('thud', t, { f: 90, gain: 0.7 * g });
        k.tone(t, { f: [[0, 98], [3.6, 95]], dur: 3.6, gain: 0.36 * g, a: 0.012, verb: 0.45 });
        k.tone(t, { f: [[0, 99.2], [3.2, 96]], dur: 3.2, gain: 0.16 * g, a: 0.02 });
        k.tone(t, { f: 202, dur: 2.2, gain: 0.1 * g, a: 0.01, verb: 0.4 });
        k.tone(t, { f: 277, dur: 1.4, gain: 0.05 * g, a: 0.01 });
        k.noise(t, { dur: 0.3, color: 'brown', filter: 'lowpass', f: 450, gain: 0.3 * g });
      };
      const tap = (t, f = 640, g = 0.55, pan = 0, minor = true) => { k.play('tock', t, { f, gain: g, pan, minor }); k.noise(t, { dur: 0.014, filter: 'bandpass', f: 1700, q: 2.5, gain: 0.32 * g, a: 0.001, pan, minor }); };   // wooden rod tap: knock + bright click
      const hide = (t, dur, g = 0.5, pan = 0, minor = true) => k.play('paper', t, { dur, gain: g, pan, minor });    // leather/hide rustle
      const slide = (t, dur, g = 0.12, minor = true) => k.noise(t, { dur, color: 'brown', filter: 'lowpass', f: [[0, 260], [dur * 0.5, 520], [dur, 240]], gain: g, a: dur * 0.4, minor });
      const flap = (t, g = 0.25, pan = 0, minor = true) => k.noise(t, { dur: 0.11, color: 'pink', filter: 'lowpass', f: [[0, 900], [0.11, 300]], gain: g, a: 0.03, pan, minor });

      // ---- beds: the lamp's hum and the room
      k.bed('hum', 0.2, D, { gain: 0.5 });
      k.bed('room', 0, D, { gain: 0.7 });
      // lamp catches: a soft whump, then a few sputters (sputter noise in explainerFrame, 0-0.7 s)
      k.noise(0.04, { dur: 0.45, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.12, 700], [0.45, 180]], gain: 0.4, a: 0.05 });
      [0.18, 0.31, 0.47].forEach((t, i) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1300 + i * 300, q: 1.5, gain: 0.12, minor: true }));
      // flame crackle now and then
      [2.1, 3.9, 6.9, 9.4, 11.0, 14.0].forEach((t, i) => k.noise(t, { dur: 0.01, filter: 'bandpass', f: 1500 + i * 120, q: 1.4, gain: 0.07, minor: true }));

      // ---- HOOK: card drops on its strings (lands ~0.62), rings a bronze note; hoisted to the corner 1.9-2.5
      hide(0.24, 0.3, 0.7);
      tap(0.62, 520, 0.7, 0, false);
      gam(0.64, 'D4', 1.0);
      slide(1.9, 0.6, 0.14);
      tap(2.47, 700, 0.45, -0.5);

      // ---- DATA: owl hops in from the right (hop landings at 2.6 and 3.0), wings flapping
      hide(2.2, 0.55, 0.55, 0.6);
      for (let t = 2.25; t < 3.05; t += 0.39) flap(t, 0.22, 0.6);
      tap(2.6, 420, 0.5, 0.6); tap(3.0, 380, 0.65, 0.6);
      // counter board drops (2.5-2.85)
      hide(2.5, 0.25, 0.35, -0.1); tap(2.82, 760, 0.45, -0.1);
      // big cards: rustle in from the left, clack as each slips into the owl (u = 0.9 of 1.6 s)
      ACARDS.forEach((c, i) => { hide(c.t0 + 0.08, 0.35, 0.5, -0.7); tap(c.t0 + 0.9 * ACARD_DUR, 360 + i * 30, 1.0, 0.5); });
      // the flock streaming in
      hide(4.4, 1.4, 0.32, -0.2);
      // counter: wooden ticks, at most ~11/s, slowing as the number settles
      { let last = -1, prev = countA(2.6); for (let t = 2.72; t < 5.48; t += 0.002) { const v = countA(t); if (v !== prev && t - last >= 0.09) { tap(t, 1150, 0.36, -0.1); last = t; } prev = v; } }
      gam(5.5, 'A4', 0.9, -0.1);

      // ---- TRANSITION: the owl flies at the lamp, its shadow fills the screen (5.85-6.6)
      flap(5.88, 0.45, 0.5, false); flap(6.02, 0.5, 0.2, false);
      k.noise(5.95, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 180], [0.35, 800], [0.75, 160]], q: 0.8, gain: 0.42, a: 0.3, verb: 0.2 });
      k.play('thud', 6.24, { f: 70, gain: 0.35 });

      // ---- GUESS / CHECK / ADJUST
      slide(6.32, 0.4, 0.12); tap(6.72, 560, 0.5, 0.3);                       // cat card rises on its rod
      k.play('stroke', 6.9, { material: 'brush', dur: 0.55, gain: 0.7, minor: true });   // Guess vine grows
      tap(7.36, 820, 0.45, 0);                                                  // Guess plaque lands
      tap(7.58, 600, 0.55, 0.1, false);                                         // the guess tag drops: "dog?"
      gam(7.6, 'D4', 0.75, 0.1); gam(7.78, 'F4', 0.75, 0.1);                    // a questioning rise
      hide(7.7, 0.3, 0.9, 0.8);                                                // the teacher's hand comes in
      k.play('thud', 8.05, { f: 170, gain: 0.55, pan: 0.5 }); tap(8.05, 300, 0.9, 0.5, false);   // knock on the card
      k.noise(8.0, { dur: 0.14, filter: 'highpass', f: 1200, gain: 0.08, a: 0.06 });               // red gel slid in front of the lamp
      gam(8.08, 'Eb4', 0.8, 0.1); gam(8.08, 'E4', 0.7, 0.1); gam(8.08, 'A2', 0.9, 0);               // clashing bronze: wrong
      tap(8.32, 860, 0.75, 0.6);                                                 // Check plaque
      k.play('stroke', 8.5, { material: 'brush', dur: 0.52, gain: 1.1, minor: true });  // Adjust vine
      tap(8.92, 760, 0.7, -0.1);                                                // Adjust plaque
      // gears re-set: a wooden ratchet while they turn (9.0-9.7)
      for (let t = 9.02; t < 9.68; t += 0.075) tap(t, 1050 + ((t * 40) % 3) * 60, 0.55, -0.5);
      gam(9.18, 'A5', 0.4, -0.5, true);
      flap(9.82, 0.3, 0.1);                                                     // tag flips over
      gam(10.0, 'A4', 0.85, 0.1); gam(10.12, 'D5', 0.85, 0.1);                  // "cat" + tick: right
      tap(10.12, 320, 0.5, 0.5);                                                // hand taps again

      // ---- TRANSITION: lamp turned down and up (10.3-10.8)
      k.noise(10.3, { dur: 0.5, color: 'brown', filter: 'lowpass', f: [[0, 600], [0.25, 140], [0.5, 600]], gain: 0.35, a: 0.05, hold: 0.3 });

      // ---- PROGRESS: Accuracy plaque, owl climbs rung by rung (one pitched wood block per rung), number counts
      tap(10.82, 820, 0.7, -0.4);
      const scale = ['D4', 'Eb4', 'F4', 'A4', 'Bb4', 'D5', 'Eb5', 'F5', 'A5'];
      const kf = (t) => ((accC(t) - 61) / 36) * 9;
      const rungT = [];
      for (let n = 1; n <= 9; n++) { const t = when(kf, n, 10.8, 12.01); rungT.push(t); k.tone(t, { f: scale[n - 1], type: 'triangle', dur: 0.12, gain: 0.09, a: 0.002, pan: 0.3, minor: true }); tap(t, 500, 0.7, 0.3); }
      { let last = -1, prev = accC(10.7); for (let t = 10.8; t < 11.98; t += 0.002) { const v = accC(t); if (v !== prev && t - last >= 0.1 && !rungT.some((r) => Math.abs(r - t) < 0.15)) { tap(t, 1200, 0.38, -0.4); last = t; } prev = v; } }
      // 97%: the gong, the moon bursts, the flame flares
      gong(12.0, 1.1);
      gam(12.02, 'D5', 0.6, 0.4);
      hide(12.0, 0.3, 0.35, 0.4);
      k.play('stroke', 12.0, { material: 'brush', dur: 0.35, gain: 0.5, minor: true });   // underline vine

      // ---- TRANSITION: lace curtains close (12.85-13.15) and part (13.3-13.65)
      for (const pan of [-0.7, 0.7]) k.noise(12.86, { dur: 0.32, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.2, 1500], [0.32, 700]], q: 0.7, gain: 0.25, a: 0.12, pan });
      k.play('thud', 13.15, { f: 110, gain: 0.3 });
      for (const pan of [-0.7, 0.7]) k.noise(13.3, { dur: 0.36, color: 'pink', filter: 'bandpass', f: [[0, 700], [0.2, 1500], [0.36, 500]], q: 0.7, gain: 0.22, a: 0.12, pan });

      // ---- TAKEAWAY: the card swings in; a resolving bronze phrase
      tap(13.5, 520, 1.0, 0, true);
      gam(13.62, 'D4', 0.9, -0.2); gam(13.76, 'A4', 0.85, 0); gam(13.9, 'D5', 0.8, 0.2);
      k.tone(13.62, { f: 'D3', dur: 2.0, gain: 0.12, a: 0.01, verb: 0.4 });
      tap(14.15, 420, 1.0, 0.7);                                               // the owl takes a bow
    },
    explainer(ctx, W, Hh, t) { explainerFrame(ctx, W, Hh, t); },
    draw(ctx, W, Hh, t) { stillFrame(ctx, W, Hh, t); },
  });
}
```
