I want an animated explainer made in the "Synthwave Outrun" visual style (Retro UI & Neon). Below is the complete source code of a reference animation in this exact style, plus a small sound-effects kit. Use them as your style guide and rebuild it around my content.

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
- Load these Google Fonts before the first draw (await document.fonts.load for each spec you use): Caveat, Orbitron
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Orbitron:wght@500;800&display=block">
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
Name: Synthwave Outrun
Family: Retro UI & Neon
Look: 80s outrun poster: neon grid highway to a striped sunset, wireframe vector mountains, chrome-beveled italic title with a horizon reflection and a hot-pink neon script, all bathed in bloom.
Motion: Stars blink on, the horizon line and grid race toward camera, the striped sun rises and wireframe mountains grow, the chrome title slams in with a flash, the script tube flickers on and glints sweep the chrome.
How it explains: A night drive explains it: labelled example cards ride the neon highway into a wireframe AI core, a dashboard HUD holds a rolling odometer counter, synth-knob weights and GUESS/CHECK/ADJUST neon tubes; the camera tilts up into the sky for a glowing accuracy chart and back down for a chrome payoff.

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

REFERENCE STYLE SOURCE (styles/synthwave.js; W/H_ are always 1280x720)
```js
{
  const HZ = 438, VPX = 640, FOC = 420, CAMH = 1.25;
  const proj = (x, h, z) => [VPX + (x / z) * FOC, HZ + ((CAMH - h) / z) * FOC];

  function skyAndStars(c, W, t) {
    const g = c.createLinearGradient(0, 0, 0, HZ);
    g.addColorStop(0, '#05021a'); g.addColorStop(0.45, '#1c0640'); g.addColorStop(0.78, '#5a0f6e'); g.addColorStop(0.94, '#c41a7e'); g.addColorStop(1, '#ff4fa0');
    c.fillStyle = g; c.fillRect(0, 0, W, HZ + 2);
    const r = H.rng(404);
    for (let i = 0; i < 220; i++) {
      const x = r.range(0, W), y = Math.pow(r(), 1.6) * HZ * 0.8, s = r.range(0.6, 1.8);
      const tw = (0.55 + 0.45 * Math.sin(t * r.range(1, 4) + i)) * H.clamp((t - r() * 1.4) / 0.25);
      c.fillStyle = `rgba(255,${r.int(200, 255)},255,${(0.35 + r() * 0.6) * tw})`;
      c.fillRect(x, y, s, s);
      if (s > 1.65 && y < HZ * 0.5) { // cross glint
        c.fillStyle = `rgba(200,240,255,${0.5 * tw})`; c.fillRect(x - 6, y + s / 2 - 0.5, 12 + s, 1); c.fillRect(x + s / 2 - 0.5, y - 6, 1, 12 + s);
      }
    }
  }

  function sun(c0, W, Hh, cx, cy, R, t) {
    const L = H.layer(W, Hh), c = L.getContext('2d');
    // outer bloom
    const bg = c0.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 2.1);
    bg.addColorStop(0, 'rgba(255,90,150,0.55)'); bg.addColorStop(0.5, 'rgba(255,40,140,0.15)'); bg.addColorStop(1, 'rgba(255,40,140,0)');
    c0.fillStyle = bg; c0.fillRect(cx - R * 2.2, cy - R * 2.2, R * 4.4, R * 4.4);
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2);
    const g = c.createLinearGradient(0, cy - R, 0, cy + R * 0.6);
    g.addColorStop(0, '#fff6a0'); g.addColorStop(0.3, '#ffd23f'); g.addColorStop(0.55, '#ff8a3d'); g.addColorStop(0.8, '#ff3d7f'); g.addColorStop(1, '#d4147f');
    c.fillStyle = g; c.fill();
    c.globalCompositeOperation = 'destination-out';
    const sc = (t * 10) % 22;
    for (let k = -1; k < 14; k++) {
      const y = cy - R * 0.18 + k * 22 + sc;
      const f = H.clamp((y - (cy - R * 0.22)) / (R * 1.0));
      c.fillRect(cx - R, y, R * 2, 2 + f * 11);
    }
    c0.drawImage(L, 0, 0);
  }

  function mountains(c, t, hs = 1) {
    const nz = H.makeNoise(19);
    const xs = [], zs = [];
    for (let x = -64; x <= 64; x += 2.6) xs.push(x);
    for (let z = 80; z >= 26; z -= 2.4) zs.push(z);
    const hAt = (x, z) => {
      const ax = Math.abs(x);
      const ridge = H.smooth(4.5, 15, ax);
      const n = nz.fbm2(x * 0.075 + 3, z * 0.09, 4) * 0.5 + 0.5;
      const peaks = Math.pow(n, 1.6) * 36 + 2;
      const back = H.smooth(30, 60, z) * 0.5 + 0.5;
      const front = H.smooth(26, 40, z);
      return ridge * peaks * back * front * hs;
    };
    const P = zs.map((z) => xs.map((x) => { const h = hAt(x, z); return [...proj(x, h, z), h]; }));
    c.save();
    c.lineJoin = 'round';
    for (let j = 0; j < zs.length - 1; j++) {
      const depth = 1 - j / (zs.length - 1); // 1 far ... 0 near
      for (let i = 0; i < xs.length - 1; i++) {
        const a = P[j][i], b = P[j][i + 1], cc = P[j + 1][i + 1], d = P[j + 1][i];
        const hh = (a[2] + b[2] + cc[2] + d[2]) / 4;
        if (hh < 0.01) continue;
        const shade = H.clamp(hh / 26);
        const col = H.mix('#120531', '#3a0f63', shade * 0.8);
        c.fillStyle = H.rgba(col, 1);
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(d[0], d[1]); c.closePath(); c.fill();
        // wire: purple-magenta, brighter on the near rows, cyan tint on peaks
        const lc = H.mix('#b02cff', '#4ff3ff', H.smooth(0.55, 1, shade));
        const qh = Math.max(Math.abs(d[1] - a[1]), Math.abs(cc[1] - b[1]));
        const dens = H.clamp((qh - 1) / 7);
        c.strokeStyle = H.rgba(lc, (0.3 + 0.6 * (1 - depth)) * dens);
        c.lineWidth = 1.1;
        c.stroke();
        // diagonal for triangle mesh look
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(cc[0], cc[1]); c.strokeStyle = H.rgba(lc, (0.15 + 0.3 * (1 - depth)) * dens); c.stroke();
      }
    }
    c.restore();
  }

  function floorAndRoad(c, W, Hh, t, rev = 1, hor = 1) {
    const yTop = HZ + 1;
    const g = c.createLinearGradient(0, yTop, 0, Hh);
    g.addColorStop(0, '#2a0838'); g.addColorStop(0.15, '#12041f'); g.addColorStop(1, '#07010f');
    c.fillStyle = g; c.fillRect(0, yTop, W, Hh - yTop);
    const zFar = 34, zNear = 0.5;
    const road = 2.4;
    c.save();
    const yRev = HZ + Math.pow(rev, 2.2) * (Hh - HZ + 4); // grid races from the horizon toward camera
    c.beginPath(); c.rect(0, HZ, W, yRev - HZ); c.clip();
    const strokeGrid = (lw, col) => {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
      for (let x = road + 0.0001; x <= 90; x += 2.6) for (const s of [-1, 1]) {
        const [x0, y0] = proj(s * x, 0, zNear), [x1, y1] = proj(s * x, 0, zFar + 40);
        c.moveTo(x0, y0); c.lineTo(x1, y1);
      }
      const off = (t * 7) % 2.6;
      for (let z = 1 - off; z < zFar + 40; z += 2.6) {
        if (z < 0.3) continue;
        const [, y] = proj(0, 0, z);
        const [xl] = proj(-road, 0, z), [xr] = proj(road, 0, z);
        c.moveTo(0, y); c.lineTo(xl, y); c.moveTo(xr, y); c.lineTo(W, y);
      }
      c.stroke();
    };
    c.globalCompositeOperation = 'lighter';
    strokeGrid(6, 'rgba(255,30,170,0.12)');
    strokeGrid(2.6, 'rgba(255,50,190,0.35)');
    strokeGrid(1.1, 'rgba(255,150,230,0.9)');
    c.globalCompositeOperation = 'source-over';
    // road surface
    const [l0x, l0y] = proj(-road, 0, zNear), [r0x] = proj(road, 0, zNear), [l1x, l1y] = proj(-road, 0, 80), [r1x] = proj(road, 0, 80);
    const rg = c.createLinearGradient(0, HZ, 0, Hh);
    rg.addColorStop(0, '#1a0830'); rg.addColorStop(1, '#0b0418');
    c.fillStyle = rg; c.beginPath(); c.moveTo(l0x, l0y); c.lineTo(l1x, l1y); c.lineTo(r1x, l1y); c.lineTo(r0x, l0y); c.closePath(); c.fill();
    // sun reflection streak on the road
    const sg = c.createLinearGradient(0, HZ, 0, Hh);
    sg.addColorStop(0, 'rgba(255,120,120,0.55)'); sg.addColorStop(0.35, 'rgba(255,60,160,0.15)'); sg.addColorStop(1, 'rgba(255,60,160,0)');
    c.fillStyle = sg; c.beginPath(); c.moveTo(VPX - 3, HZ); c.lineTo(VPX + 3, HZ); c.lineTo(VPX + 150, Hh); c.lineTo(VPX - 150, Hh); c.fill();
    // edges (cyan neon)
    c.globalCompositeOperation = 'lighter';
    for (const [lw, a] of [[10, 0.12], [4, 0.35], [1.6, 1]]) {
      c.strokeStyle = `rgba(80,240,255,${a})`; c.lineWidth = lw;
      c.beginPath(); c.moveTo(l0x, l0y); c.lineTo(l1x, l1y); c.moveTo(r0x, l0y); c.lineTo(r1x, l1y); c.stroke();
    }
    // centre dashes
    const off = (t * 7) % 3.2;
    for (let z = 0.6 - off; z < 60; z += 3.2) {
      const z0 = Math.max(0.35, z), z1 = z + 1.5;
      if (z1 < 0.4) continue;
      const [ax, ay] = proj(-0.08, 0, z0), [bx] = proj(0.08, 0, z0), [cx, cy] = proj(0.08, 0, z1), [dx] = proj(-0.08, 0, z1);
      c.fillStyle = 'rgba(255,240,200,0.85)';
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, ay); c.lineTo(cx, cy); c.lineTo(dx, cy); c.fill();
    }
    c.restore();
    // horizon flare line
    c.save(); c.globalCompositeOperation = 'lighter';
    const hl = c.createLinearGradient(0, 0, W, 0);
    hl.addColorStop(0, 'rgba(255,80,180,0)'); hl.addColorStop(0.5, 'rgba(255,200,230,0.95)'); hl.addColorStop(1, 'rgba(255,80,180,0)');
    c.save(); c.beginPath(); c.rect(W / 2 * (1 - hor), 0, W * hor, Hh); c.clip();
    c.fillStyle = hl; c.fillRect(0, HZ - 1, W, 2.5);
    const hg = c.createLinearGradient(0, HZ - 10, 0, HZ + 30);
    hg.addColorStop(0, 'rgba(255,60,160,0)'); hg.addColorStop(0.3, 'rgba(255,60,160,0.35)'); hg.addColorStop(1, 'rgba(255,60,160,0)');
    c.fillStyle = hg; c.fillRect(0, HZ - 10, W, 40);
    c.restore(); c.restore();
  }

  function bloom(ctx, W, Hh, amt, blur) {
    const s = H.layer(W / 4, Hh / 4), sc = s.getContext('2d');
    sc.filter = `blur(${blur}px)`; sc.drawImage(ctx.canvas, 0, 0, W / 4, Hh / 4);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(s, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
  }

  function chromeTitle(c, text, cx, by, size) {
    c.save();
    c.font = `800 ${size}px "Orbitron"`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.letterSpacing = '4px';
    const top = by - size * 0.74, bot = by + 2;
    c.translate(cx, by); c.transform(1, 0, -0.22, 1, 0, 0); c.translate(-cx, -by);
    // extrusion
    for (let i = 14; i >= 1; i--) {
      const k = i / 14;
      c.fillStyle = H.rgba(H.mix('#ff2fb0', '#1a0533', 0.35 + k * 0.6), 1);
      c.fillText(text, cx + i * 0.55, by + i * 0.9);
    }
    // dark outline
    c.lineJoin = 'round';
    c.strokeStyle = '#12032a'; c.lineWidth = 9; c.strokeText(text, cx, by);
    // chrome fill
    const g = c.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, '#0e2a6b'); g.addColorStop(0.18, '#3d7fd6'); g.addColorStop(0.42, '#d9f2ff'); g.addColorStop(0.5, '#ffffff');
    g.addColorStop(0.505, '#2a0a2e'); g.addColorStop(0.58, '#5a1d3a'); g.addColorStop(0.75, '#d0602a'); g.addColorStop(0.9, '#ffc06a'); g.addColorStop(1, '#fff1c8');
    c.fillStyle = g; c.fillText(text, cx, by);
    // bevel: light upper edge, dark lower edge (stroke clipped to glyph interior via source-atop on a layer)
    c.restore();
    const L = H.layer(c.canvas.width, c.canvas.height), lc = L.getContext('2d');
    lc.font = `800 ${size}px "Orbitron"`; lc.textAlign = 'center'; lc.letterSpacing = '4px';
    lc.translate(cx, by); lc.transform(1, 0, -0.22, 1, 0, 0); lc.translate(-cx, -by);
    lc.fillStyle = '#000'; lc.fillText(text, cx, by);
    lc.globalCompositeOperation = 'source-atop';
    lc.strokeStyle = 'rgba(255,255,255,0.95)'; lc.lineWidth = 3; lc.strokeText(text, cx - 1.5, by - 2);
    lc.strokeStyle = 'rgba(40,0,60,0.55)'; lc.lineWidth = 3; lc.strokeText(text, cx + 1.5, by + 2.5);
    lc.globalCompositeOperation = 'destination-out';
    lc.fillStyle = '#000'; lc.fillText(text, cx + 0.5, by + 0.5); // keep only the rim
    c.drawImage(L, 0, 0);
    // pink rim stroke
    c.save();
    c.font = `800 ${size}px "Orbitron"`; c.textAlign = 'center'; c.letterSpacing = '4px';
    c.translate(cx, by); c.transform(1, 0, -0.22, 1, 0, 0); c.translate(-cx, -by);
    c.strokeStyle = 'rgba(255,170,240,0.55)'; c.lineWidth = 1.2; c.strokeText(text, cx, by);
    c.restore();
  }

  function glint(c, x, y, s, a) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const rg = c.createRadialGradient(x, y, 0, x, y, s * 0.5);
    rg.addColorStop(0, `rgba(255,255,255,${a})`); rg.addColorStop(1, 'rgba(255,200,255,0)');
    c.fillStyle = rg; c.fillRect(x - s, y - s, s * 2, s * 2);
    c.fillStyle = `rgba(255,255,255,${a})`;
    c.beginPath(); c.moveTo(x - s, y); c.lineTo(x, y - 1.6); c.lineTo(x + s, y); c.lineTo(x, y + 1.6); c.fill();
    c.beginPath(); c.moveTo(x, y - s * 0.7); c.lineTo(x - 1.4, y); c.lineTo(x, y + s * 0.7); c.lineTo(x + 1.4, y); c.fill();
    c.restore();
  }

  // =====================================================================================
  // EXPLAINER: a night drive. Examples ride the neon highway into a wireframe AI core on the horizon,
  // a dashboard HUD carries the odometer counter, synth-knob weights and the GUESS/CHECK/ADJUST tubes;
  // the camera tilts up into the sky for the accuracy chart and back down for the payoff.
  // =====================================================================================
  const E = H.ease, cl = H.clamp;
  function neonStroke(c, col, w, draw) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = col; c.globalAlpha = 0.18; c.lineWidth = w * 5; c.beginPath(); draw(); c.stroke();
    c.globalAlpha = 0.45; c.lineWidth = w * 2.2; c.beginPath(); draw(); c.stroke();
    c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = Math.max(1, w * 0.7); c.beginPath(); draw(); c.stroke();
    c.restore();
  }
  function neonText(c, txt, x, y, font, col, on = 1, align = 'center') {
    if (on <= 0) return;
    c.save(); c.font = font; c.textAlign = align; c.textBaseline = 'middle';
    // dark backing so the tube separates from the sun / grid behind it
    c.globalAlpha = on * 0.55; c.shadowColor = 'rgba(14,0,34,0.9)'; c.shadowBlur = 12; c.fillStyle = 'rgba(20,0,44,0.6)'; c.fillText(txt, x, y);
    c.globalAlpha = on; c.shadowColor = col; c.shadowBlur = 22; c.fillStyle = col; c.fillText(txt, x, y);
    c.shadowBlur = 8; c.fillText(txt, x, y);
    // hot tube core: a thin lightened stroke, plus a light wash (keeps the colour, no pastel wash-out)
    c.shadowBlur = 0; const fs = parseFloat((/(\d+(?:\.\d+)?)px/.exec(font) || [0, 24])[1]);
    c.strokeStyle = H.rgba(H.mix(col, '#ffffff', 0.62), 0.9); c.lineWidth = Math.max(0.8, fs * 0.04); c.lineJoin = 'round'; c.strokeText(txt, x, y);
    c.fillStyle = H.rgba(H.mix(col, '#ffffff', 0.45), 1); c.globalAlpha = on * 0.22; c.fillText(txt, x, y);
    c.restore();
  }
  function deadTube(c, txt, x, y, font, col) { // unlit glass tube: faint tinted glass, a dim outline and a cold highlight
    c.save(); c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.fillStyle = 'rgba(255,120,220,0.08)'; c.fillText(txt, x, y);
    c.strokeStyle = col; c.globalAlpha = 0.6; c.lineWidth = 1.8; c.strokeText(txt, x, y);
    c.globalAlpha = 0.35; c.strokeStyle = 'rgba(230,220,255,1)'; c.lineWidth = 0.7; c.strokeText(txt, x - 0.6, y - 0.8);
    c.restore(); }
  const flick = (t, t0) => { if (t < t0) return 0; const d = t - t0; if (d > 0.32) return 1; return [1, 0, 1, 0.3, 0, 1, 1, 0.5, 1, 1][Math.floor(d / 0.032)] ?? 1; };
  function neonArrow(c, pts, prog, col, w = 2.5) {
    let total = 0; const L = []; for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); L.push(l); total += l; }
    let rem = total * cl(prog); const out = [pts[0]]; let dir = [1, 0];
    for (let i = 0; i < L.length && rem > 0; i++) { const u = Math.min(1, rem / L[i]); const p = [H.lerp(pts[i][0], pts[i + 1][0], u), H.lerp(pts[i][1], pts[i + 1][1], u)]; out.push(p); dir = [(pts[i + 1][0] - pts[i][0]) / L[i], (pts[i + 1][1] - pts[i][1]) / L[i]]; rem -= L[i]; }
    neonStroke(c, col, w, () => {
      c.moveTo(...out[0]); for (const p of out) c.lineTo(...p);
      if (prog >= 1) { const [ex, ey] = out[out.length - 1], a = Math.atan2(dir[1], dir[0]); c.moveTo(ex - Math.cos(a - 0.5) * 16, ey - Math.sin(a - 0.5) * 16); c.lineTo(ex, ey); c.lineTo(ex - Math.cos(a + 0.5) * 16, ey - Math.sin(a + 0.5) * 16); }
    });
  }
  function neonIcon(c, kind, x, y, s, col) { // cat / dog line icon centred at x,y
    neonStroke(c, col, 1.6 * s, () => {
      if (kind === 'cat') {
        c.moveTo(x - 16 * s, y - 2 * s); c.lineTo(x - 13 * s, y - 20 * s); c.lineTo(x - 4 * s, y - 11 * s);
        c.moveTo(x + 16 * s, y - 2 * s); c.lineTo(x + 13 * s, y - 20 * s); c.lineTo(x + 4 * s, y - 11 * s);
        c.moveTo(x + 16 * s, y + 2 * s); c.ellipse(x, y + 2 * s, 16 * s, 13 * s, 0, 0, 7);
        c.moveTo(x - 6 * s, y); c.arc(x - 6 * s, y, 0.8 * s, 0, 7); c.moveTo(x + 6 * s, y); c.arc(x + 6 * s, y, 0.8 * s, 0, 7);
        c.moveTo(x - 24 * s, y + 4 * s); c.lineTo(x - 10 * s, y + 6 * s); c.moveTo(x + 24 * s, y + 4 * s); c.lineTo(x + 10 * s, y + 6 * s);
      } else {
        c.moveTo(x + 13 * s, y); c.ellipse(x, y, 13 * s, 16 * s, 0, 0, 7);
        c.moveTo(x - 12 * s, y - 10 * s); c.ellipse(x - 17 * s, y - 2 * s, 5 * s, 13 * s, 0.3, 0, 7);
        c.moveTo(x + 22 * s, y - 2 * s); c.ellipse(x + 17 * s, y - 2 * s, 5 * s, 13 * s, -0.3, 0, 7);
        c.moveTo(x - 5 * s, y - 4 * s); c.arc(x - 5 * s, y - 4 * s, 0.8 * s, 0, 7); c.moveTo(x + 5 * s, y - 4 * s); c.arc(x + 5 * s, y - 4 * s, 0.8 * s, 0, 7);
        c.moveTo(x + 3 * s, y + 7 * s); c.ellipse(x, y + 7 * s, 3 * s, 2 * s, 0, 0, 7);
      }
    });
  }
  function exCard(c, x, y, s, kind, label, a = 1) {
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(12,2,30,0.75)'; c.beginPath(); c.roundRect(x - 34 * s, y - 34 * s, 68 * s, 84 * s, 8 * s); c.fill();
    neonStroke(c, '#4ff3ff', 1.4 * s, () => c.roundRect(x - 34 * s, y - 34 * s, 68 * s, 84 * s, 8 * s));
    neonIcon(c, kind, x, y - 4 * s, s, kind === 'cat' ? '#ffb347' : '#ff7ad9');
    if (s > 0.25) neonText(c, label, x, y + 36 * s, `800 ${Math.max(6, 17 * s)}px "Orbitron"`, '#ffe066', a);
    c.restore();
  }
  function core(c, x, y, R, t, pulse, on) {
    if (on <= 0 || R < 1) return;
    c.save(); c.globalAlpha = on;
    const g = c.createRadialGradient(x, y, 0, x, y, R * 1.15); g.addColorStop(0, 'rgba(20,0,40,0.92)'); g.addColorStop(0.85, 'rgba(30,0,60,0.85)'); g.addColorStop(1, 'rgba(30,0,60,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, R * 1.15, 0, 7); c.fill();
    const col = pulse > 0 ? H.rgba(H.mix('#c86bff', '#ffffff', pulse), 1) : '#c86bff';
    neonStroke(c, col, 1.6, () => {
      c.moveTo(x + R, y); c.arc(x, y, R, 0, 7);
      for (let k = 1; k < 6; k++) { const a = (k / 6) * Math.PI; const ry = R * Math.cos(a), rx = R * Math.sin(a); c.moveTo(x + rx, y + ry); c.ellipse(x, y + ry, rx, rx * 0.28, 0, 0, 7); }
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI + t * 0.6; const rx = Math.abs(R * Math.cos(a)); c.moveTo(x, y - R); c.ellipse(x, y, Math.max(0.5, rx), R, 0, -Math.PI / 2, Math.PI * 1.5); }
    });
    c.restore();
  }
  function knob(c, x, y, r, v, label, hot) {
    c.save();
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); g.addColorStop(0, '#5a5a78'); g.addColorStop(1, '#0d0a1c');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = 'rgba(200,200,255,0.5)'; c.lineWidth = 1.5; c.stroke();
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, a = H.lerp(a0, a1, v);
    for (let i = 0; i <= 10; i++) { const aa = H.lerp(a0, a1, i / 10); const on = aa <= a + 0.01; c.fillStyle = on ? (hot ? '#ff4fd8' : '#4ff3ff') : 'rgba(120,120,160,0.35)'; c.beginPath(); c.arc(x + Math.cos(aa) * (r + 9), y + Math.sin(aa) * (r + 9), 2.2, 0, 7); c.fill(); }
    c.restore();
    neonStroke(c, hot ? '#ff4fd8' : '#4ff3ff', 1.6, () => { c.moveTo(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25); c.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); });
    neonText(c, label, x, y + r + 30, '800 24px "Orbitron"', '#b9a2ff');
  }
  function odometer(c, x, y, value, on) {
    const s = Math.round(value).toLocaleString('en-US').padStart(9, ' ');
    c.save(); c.globalAlpha = on;
    // chrome bezel around a smoked-glass window
    const bz = c.createLinearGradient(0, y - 52, 0, y + 48);
    bz.addColorStop(0, '#9aa6d8'); bz.addColorStop(0.18, '#2a2448'); bz.addColorStop(0.55, '#120c26'); bz.addColorStop(0.82, '#3a2a5a'); bz.addColorStop(1, '#c28ad8');
    c.fillStyle = bz; c.beginPath(); c.roundRect(x - 251, y - 52, 502, 100, 11); c.fill();
    c.fillStyle = '#05010e'; c.beginPath(); c.roundRect(x - 245, y - 46, 490, 88, 8); c.fill();
    c.font = '800 64px "Orbitron"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const frac = (value % 1);
    c.save();
    c.beginPath(); c.rect(x - 243, y - 44, 486, 84); c.clip();
    // drum wheels: each digit sits on its own shaded cylinder
    let cx = x - 232;
    for (let i = 0; i < s.length; i++) {
      const w = s[i] === ',' ? 22 : 54;
      if (s[i] !== ',') {
        const dg = c.createLinearGradient(0, y - 44, 0, y + 40);
        dg.addColorStop(0, '#020008'); dg.addColorStop(0.5, '#0a0620'); dg.addColorStop(1, '#020008');
        c.fillStyle = dg; c.fillRect(cx + 2, y - 44, w - 4, 84);
        c.fillStyle = 'rgba(79,243,255,0.06)'; c.fillRect(cx + 2, y - 2, w - 4, 1);
      }
      cx += w;
    }
    // last digit rolls like a mechanical counter
    cx = x - 232;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i], w = ch === ',' ? 22 : 54;
      if (ch !== ' ') {
        c.shadowColor = '#4ff3ff'; c.shadowBlur = 16; c.fillStyle = '#aaffff';
        if (i === s.length - 1 && value < 1e6) { c.fillText(ch, cx + w / 2, y - frac * 72); c.fillText(String((+ch + 1) % 10), cx + w / 2, y + 72 - frac * 72); }
        else c.fillText(ch, cx + w / 2, y);
      }
      cx += w;
    }
    c.shadowBlur = 0;
    // drum curvature: digits fade into the dark at the top and bottom of the window
    const fd = c.createLinearGradient(0, y - 44, 0, y + 40);
    fd.addColorStop(0, 'rgba(3,0,10,0.95)'); fd.addColorStop(0.2, 'rgba(3,0,10,0.25)'); fd.addColorStop(0.36, 'rgba(3,0,10,0)');
    fd.addColorStop(0.64, 'rgba(3,0,10,0)'); fd.addColorStop(0.8, 'rgba(3,0,10,0.25)'); fd.addColorStop(1, 'rgba(3,0,10,0.95)');
    c.fillStyle = fd; c.fillRect(x - 243, y - 44, 486, 84);
    // inner shadow of the recessed window
    c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
    c.strokeStyle = '#000'; c.lineWidth = 10; c.strokeRect(x - 248, y - 49, 496, 94);
    c.shadowColor = 'transparent';
    // glass glare: diagonal sheen across the upper half
    const gl = c.createLinearGradient(x - 200, y - 60, x + 40, y + 70);
    gl.addColorStop(0, 'rgba(255,255,255,0.1)'); gl.addColorStop(0.42, 'rgba(255,255,255,0.06)'); gl.addColorStop(0.43, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gl; c.fillRect(x - 243, y - 44, 486, 84);
    c.restore();
    c.strokeStyle = 'rgba(79,243,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 245, y - 46, 490, 88, 8); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 238, y - 50.5); c.lineTo(x + 238, y - 50.5); c.stroke();
    c.restore();
    neonText(c, 'EXAMPLES', x, y + 64, '800 28px "Orbitron"', '#ffe066', on);
  }

  let swDashRefl = null, swBrushedC = null;
  function swBrushed(W) { // horizontal brushed-metal / carbon streaks for the dash, built once
    if (swBrushedC && swBrushedC.width === W) return swBrushedC;
    const c = H.layer(W, 180), g = c.getContext('2d'), r = H.rng(5150);
    for (let i = 0; i < 900; i++) {
      const y = r.range(0, 180), x = r.range(-200, W), l = r.range(60, 420);
      g.fillStyle = r() < 0.5 ? `rgba(200,190,255,${r.range(0.015, 0.05)})` : `rgba(0,0,0,${r.range(0.05, 0.14)})`;
      g.fillRect(x, y, l, r.range(0.6, 1.4));
    }
    g.fillStyle = 'rgba(255,255,255,0.025)'; // fine 4 px weave
    for (let y = 0; y < 180; y += 4) g.fillRect(0, y, W, 1);
    return (swBrushedC = c);
  }
  function explainSW(ctx, W, H_, t) {
    const T1 = 2.4, T3 = 6.0, T4 = 10.5, T5 = 12.9;
    const tilt = t < T4 ? 0 : t < T5 - 0.1 ? 300 * E.inOut(cl((t - T4) / 0.7)) : 300 * (1 - E.inOut(cl((t - T5 + 0.1) / 0.5)));
    ctx.fillStyle = '#05021a'; ctx.fillRect(0, 0, W, H_);
    // extra stars above the tilted horizon
    if (tilt > 0) { const r = H.rng(77); for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(255,230,255,${r.range(0.3, 0.9)})`; ctx.fillRect(r.range(0, W), r.range(0, tilt + 40), 1.5, 1.5); } }
    ctx.save(); ctx.translate(0, tilt);
    skyAndStars(ctx, W, t + 3);
    sun(ctx, W, H_, VPX, 352, 176, t);
    mountains(ctx, t, 1);
    floorAndRoad(ctx, W, H_, t, 1, 1);
    // road chevrons (arrows) pointing at the core while data flows
    const chevOn = cl((t - 2.5) / 0.3) * (t < T4 ? 1 : 0);
    if (chevOn > 0) {
      for (let k = 0; k < 5; k++) {
        const z = 2.2 + ((k * 2.6 - t * 7) % 13 + 13) % 13;
        const [x0, y0] = proj(-0.9, 0, z + 0.6), [xm, ym] = proj(0, 0, z), [x1, y1] = proj(0.9, 0, z + 0.6);
        ctx.globalAlpha = chevOn * cl((14 - z) / 4);
        neonStroke(ctx, '#ff4fd8', Math.max(0.8, 6 / z), () => { ctx.moveTo(x0, y0); ctx.lineTo(xm, ym); ctx.lineTo(x1, y1); });
        ctx.globalAlpha = 1;
      }
    }
    // the AI core on the horizon
    const coreOn = t < T5 ? flick(t, 2.15) : 1 - cl((t - T5) / 0.25);
    let pulse = 0;
    if (t > 2.9 && t < 6.0) pulse = Math.max(0, 1 - (((t - 2.9) % 0.35) / 0.2));
    if (t > 7.0 && t < 7.15) pulse = 1;
    const coreR = 74 * (t < T5 ? E.back(cl((t - 2.15) / 0.4)) : 1 - E.in(cl((t - T5) / 0.3)));
    core(ctx, VPX, 300, coreR, t, pulse, coreOn);
    if (coreOn > 0 && t < T5) neonText(ctx, 'THE MODEL', VPX, 400, '800 28px "Orbitron"', '#e0a0ff', coreOn);
    // examples ride the road into the core
    if (t > 2.6 && t < 6.2) {
      for (let k = 0; k < 11; k++) {
        const t0 = 2.6 + k * 0.33, p = (t - t0) / 1.25; if (p < 0 || p > 1) continue;
        const z = H.lerp(1.6, 28, E.in(p)), lane = k % 2 ? 0.75 : -0.75;
        const [rx, ry] = proj(lane * (1 - p), 0.9, z);
        const y = H.lerp(ry, 300, Math.pow(p, 2.5)), x = H.lerp(rx, VPX, Math.pow(p, 2.5));
        exCard(ctx, x, y, 3.0 / z * 1.6, k % 2 ? 'dog' : 'cat', k % 2 ? 'DOG' : 'CAT', cl((1 - p) * 6));
      }
    }
    // test picture
    if (t > 6.1 && t < 7.1) {
      const p = (t - 6.1) / 0.9, z = H.lerp(1.8, 26, E.in(p));
      const [rx, ry] = proj(0, 0.9, z);
      exCard(ctx, H.lerp(rx, VPX, Math.pow(p, 2.5)), H.lerp(ry, 300, Math.pow(p, 2.5)), 2.6 / z * 1.6, 'cat', '?', cl((1 - p) * 6));
    }
    ctx.restore();
    if (t < T5) neonText(ctx, '', 0, 0, '10px sans-serif', '#000', 0);

    // ---- beat 3: guess sign, check, error pulse to the knobs, guess again ----
    const step = t < 7.0 ? -1 : t < 7.9 ? 0 : t < 8.5 ? 1 : t < 9.6 ? 2 : t < 10.05 ? 0 : 1;
    if (t >= 7.0 && t < T4 + 0.2) {
      const fade = 1 - cl((t - T4) / 0.2);
      ctx.save(); ctx.globalAlpha = fade;
      neonArrow(ctx, [[VPX + 84, 290], [880, 250]], cl((t - 7.0) / 0.3), '#4ff3ff');
      neonText(ctx, 'GUESS', 790, 222, '800 28px "Orbitron"', '#4ff3ff', flick(t, 7.1) * fade);
      if (t < 9.6) {
        neonText(ctx, 'DOG?', 1010, 245, '800 52px "Orbitron"', '#ff3d7f', flick(t, 7.3) * fade);
        if (t > 7.9) {
          const xo = flick(t, 7.9) * fade;
          ctx.globalAlpha = xo; neonStroke(ctx, '#ff2020', 4, () => { ctx.moveTo(1120, 220); ctx.lineTo(1166, 266); ctx.moveTo(1166, 220); ctx.lineTo(1120, 266); }); ctx.globalAlpha = fade;
          const cp = cl((t - 7.95) / 0.3);
          neonStroke(ctx, '#ffe066', 2, () => ctx.ellipse(1040, 245, 150, 52, -0.05, -Math.PI / 2, -Math.PI / 2 + cp * Math.PI * 2));
          neonText(ctx, "CHECK: IT'S A CAT", 1030, 330, '800 26px "Orbitron"', '#ffe066', flick(t, 8.05) * fade);
          const fl = Math.max(0, 1 - (t - 7.9) / 0.35);
          if (fl > 0) { ctx.fillStyle = `rgba(255,30,80,${0.25 * fl})`; ctx.fillRect(0, 0, W, H_); }
        }
      } else {
        neonText(ctx, 'CAT', 1010, 245, '800 52px "Orbitron"', '#5cffb0', flick(t, 9.6) * fade);
        ctx.globalAlpha = flick(t, 9.75) * fade;
        neonStroke(ctx, '#5cffb0', 4, () => { ctx.moveTo(1112, 246); ctx.lineTo(1130, 266); ctx.lineTo(1170, 218); });
        ctx.globalAlpha = fade;
        neonText(ctx, 'CORRECT', 1030, 330, '800 26px "Orbitron"', '#5cffb0', flick(t, 9.85) * fade);
      }
      if (t > 8.5 && t < 9.6) { // error pulse travels down to the weights
        const pts = [[1040, 350], [1040, 470], [1120, 560]];
        neonArrow(ctx, pts, cl((t - 8.5) / 0.4), '#ff4fd8');
        neonText(ctx, 'ERROR', 1062, 430, '800 26px "Orbitron"', '#ff4fd8', flick(t, 8.6) * fade, 'left');
        const pp = cl((t - 8.5) / 0.4); const py = H.lerp(340, 590, pp);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(1040 - (py > 470 ? (py - 470) / 130 * 30 : 0), py, 0, 1040, py, 26); g.addColorStop(0, 'rgba(255,120,230,0.9)'); g.addColorStop(1, 'rgba(255,60,200,0)'); ctx.fillStyle = g; ctx.fillRect(1000, py - 30, 80, 60); ctx.restore();
      }
      ctx.restore();
    }

    // ---- dashboard HUD (beats 2-3) ----
    const dashY = 600 + 190 * (t < 2.5 ? 1 : t < T4 ? 1 - E.out(cl((t - 2.5) / 0.4)) : E.in(cl((t - T4 + 0.1) / 0.35)));
    if (dashY < 740) {
      ctx.save(); ctx.translate(0, dashY - 600);
      const dg = ctx.createLinearGradient(0, 540, 0, 720); dg.addColorStop(0, 'rgba(8,2,22,0.88)'); dg.addColorStop(1, 'rgba(3,0,10,0.97)');
      // grab the road / sun strip just above the dash before covering it: it is reflected in the dash's glossy top
      const pxs = ctx.canvas.width / W, topY = dashY - 60, refH = 96;
      const RL = swDashRefl || (swDashRefl = H.layer(W / 4, refH / 4)), rc = RL.getContext('2d');
      rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, RL.width, RL.height); rc.filter = 'blur(1.5px)';
      rc.drawImage(ctx.canvas, 0, Math.max(0, (topY - refH) * pxs), ctx.canvas.width, refH * pxs, 0, 0, RL.width, RL.height); rc.filter = 'none';
      const slab = () => { ctx.beginPath(); ctx.moveTo(0, 568); ctx.lineTo(120, 540); ctx.lineTo(W - 120, 540); ctx.lineTo(W, 568); ctx.lineTo(W, 720); ctx.lineTo(0, 720); ctx.closePath(); };
      ctx.fillStyle = dg; slab(); ctx.fill();
      ctx.save(); slab(); ctx.clip();
      // flipped, soft reflection of the horizon glow fading down the glossy dash
      ctx.save(); ctx.globalAlpha = 0.16; ctx.globalCompositeOperation = 'lighter'; ctx.translate(0, 540); ctx.scale(1, -1);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(RL, 0, -refH * 0.9, W, refH * 0.9); ctx.restore();
      const rf = ctx.createLinearGradient(0, 540, 0, 640); rf.addColorStop(0, 'rgba(6,1,18,0)'); rf.addColorStop(1, 'rgba(6,1,18,0.9)');
      ctx.fillStyle = rf; ctx.fillRect(0, 540, W, 100);
      // brushed / carbon fibre texture (cached)
      ctx.globalAlpha = 0.6; ctx.drawImage(swBrushed(W), 0, 540); ctx.globalAlpha = 1;
      // recessed instrument panels behind the loop, the odometer and the knobs
      for (const [px, pw] of [[10, 460], [1010, 262]]) {
        const pg = ctx.createLinearGradient(0, 582, 0, 706); pg.addColorStop(0, 'rgba(0,0,0,0.5)'); pg.addColorStop(1, 'rgba(20,10,44,0.35)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(px, 582, pw, 124, 10); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(px, 582, pw, 124, 10); ctx.stroke();
        ctx.strokeStyle = 'rgba(190,170,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + 10, 706.5); ctx.lineTo(px + pw - 10, 706.5); ctx.stroke();
      }
      ctx.restore();
      neonStroke(ctx, '#4ff3ff', 1.2, () => { ctx.moveTo(0, 568); ctx.lineTo(120, 540); ctx.lineTo(W - 120, 540); ctx.lineTo(W, 568); });
      // chrome bevel just under the neon edge
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 571); ctx.lineTo(121, 543); ctx.lineTo(W - 121, 543); ctx.lineTo(W, 571); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 573); ctx.lineTo(121, 545); ctx.lineTo(W - 121, 545); ctx.lineTo(W, 573); ctx.stroke();
      // loop tubes
      const tubes = [['GUESS', 72], ['CHECK', 226], ['ADJUST', 390]];
      tubes.forEach(([lab, x], i) => { deadTube(ctx, lab, x, 612, '800 28px "Orbitron"', '#ff7ad9'); if (i === step) neonText(ctx, lab, x, 612, '800 28px "Orbitron"', '#ff4fd8', flick(t, [7.0, 7.9, 8.5, 9.6, 10.05][[0, 1, 2, 0, 1][[7.0, 7.9, 8.5, 9.6, 10.05].findIndex((x2, j, a) => t >= x2 && (j === a.length - 1 || t < a[j + 1]))]] ?? 0)); });
      ctx.globalAlpha = t > T3 ? 1 : 0.35;
      neonArrow(ctx, [[132, 612], [158, 612]], 1, '#b9a2ff', 1.4); neonArrow(ctx, [[292, 612], [312, 612]], 1, '#b9a2ff', 1.4);
      neonArrow(ctx, [[440, 630], [448, 662], [40, 662], [40, 634]], 1, '#b9a2ff', 1.2);
      ctx.globalAlpha = 1;
      neonText(ctx, 'REPEAT', 250, 690, '800 26px "Orbitron"', '#b9a2ff', t > T3 ? 1 : 0.4);
      // odometer
      const n = 1e6 * E.inOut(cl((t - 2.9) / 2.7));
      odometer(ctx, 725, 600, n, 1);
      // weights as synth knobs
      const adj = E.inOut(cl((t - 8.9) / 0.6));
      [[0.25, 0.8], [0.7, 0.3], [0.45, 0.9]].forEach(([a, b], i) => knob(ctx, 1055 + i * 92, 604, 25, H.lerp(a, b, adj) + (t < 8.9 ? Math.sin(t * 2 + i) * 0.02 : 0), 'W' + (i + 1), t > 8.85 && t < 9.6));
      ctx.restore();
    }

    // ---- beat 4: chart in the sky ----
    if (t > T4 + 0.3 && t < T5 + 0.1) {
      const on = t < T5 - 0.15 ? flick(t, T4 + 0.5) : 1 - cl((t - T5 + 0.15) / 0.25);
      const gx0 = 180, gx1 = 860, gy0 = 110, gy1 = 420;
      ctx.save(); ctx.globalAlpha = on;
      ctx.strokeStyle = 'rgba(79,243,255,0.18)'; ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(gx0, H.lerp(gy1, gy0, i / 4)); ctx.lineTo(gx1, H.lerp(gy1, gy0, i / 4)); ctx.stroke(); }
      neonStroke(ctx, '#4ff3ff', 1.6, () => { ctx.moveTo(gx0, gy0 - 10); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1 + 20, gy1); });
      neonText(ctx, 'TRAINING ROUNDS', (gx0 + gx1) / 2, gy1 + 34, '800 26px "Orbitron"', '#4ff3ff', on);
      neonText(ctx, '100%', gx0 - 46, gy0, '800 22px "Orbitron"', '#4ff3ff', on); neonText(ctx, '50%', gx0 - 40, gy1, '800 22px "Orbitron"', '#4ff3ff', on);
      const pr = cl((t - T4 - 0.8) / 1.1), N = 24, val = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3)) + Math.sin(u * 40) * 2 * (1 - u);
      const P = (u) => [H.lerp(gx0 + 6, gx1, u), H.lerp(gy1, gy0, (val(u) - 50) / 50)];
      if (pr > 0) {
        // soft glow fill under the curve, like a vector-monitor phosphor wash
        const fg = ctx.createLinearGradient(0, gy0, 0, gy1); fg.addColorStop(0, 'rgba(255,79,216,0.22)'); fg.addColorStop(1, 'rgba(255,79,216,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(P(0)[0], gy1); ctx.lineTo(...P(0)); for (let i = 1; i <= N * pr; i++) ctx.lineTo(...P(i / N)); ctx.lineTo(...P(pr)); ctx.lineTo(P(pr)[0], gy1); ctx.closePath(); ctx.fill();
        neonStroke(ctx, '#ff4fd8', 2.4, () => { ctx.moveTo(...P(0)); for (let i = 1; i <= N * pr; i++) ctx.lineTo(...P(i / N)); ctx.lineTo(...P(pr)); });
        const [hx, hy] = P(pr);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 22); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,120,230,0.8)'); g.addColorStop(1, 'rgba(255,60,200,0)'); ctx.fillStyle = g; ctx.fillRect(hx - 24, hy - 24, 48, 48); ctx.restore();
      }
      ctx.restore();
      const acc = pr >= 1 ? 97 : Math.round(val(pr));
      neonText(ctx, 'ACCURACY', 1060, 168, '800 28px "Orbitron"', '#ff4fd8', on);
      ctx.save(); ctx.globalAlpha = on; chromeTitle(ctx, acc + '%', 1060, 290, 92); ctx.restore();
      if (pr >= 1) {
        const k = cl((t - (T4 + 1.9)) / 0.3);
        glint(ctx, 1160, 210, 70 * Math.sin(k * Math.PI) + 26, 0.95 * on);
        neonStroke(ctx, '#ffe066', 2, () => ctx.ellipse(1060, 255, 150 * E.back(k), 80 * E.back(k), 0, 0, 7));
        neonText(ctx, 'UP FROM 61%', 1060, 370, '800 26px "Orbitron"', '#ffe066', on);
      }
    }

    // ---- header: the question slams in, then shrinks into the corner and stays ----
    {
      const pS = cl((t - 0.15) / 0.4), pM = E.inOut(cl((t - 1.75) / 0.6));
      if (t >= 0.15) {
        const sc = (1 + 1.5 * Math.pow(1 - pS, 3)) * H.lerp(1, 0.5, pM);
        const cx = H.lerp(VPX, 300, pM), cy = H.lerp(190, 52, pM);
        ctx.save(); ctx.globalAlpha = cl(pS * 4);
        ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-VPX, -190);
        chromeTitle(ctx, 'HOW DOES AI LEARN?', VPX, 214, 56);
        ctx.restore();
        if (pS >= 1 && t < 0.9) { const fl = Math.exp(-(t - 0.55) * 8); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,255,${0.35 * fl})`; ctx.fillRect(0, 0, W, H_); ctx.restore(); }
        if (t > 0.6 && t < 1.8) glint(ctx, 200 + (t - 0.6) / 1.2 * 880, 170, 40, 0.9);
      }
    }
    // ---- beat 5: payoff ----
    if (t > T5 + 0.3) {
      const p = cl((t - T5 - 0.3) / 0.35);
      ctx.save(); ctx.globalAlpha = cl(p * 4); ctx.translate(VPX, 220); const s2 = 1 + 1.2 * Math.pow(1 - p, 3); ctx.scale(s2, s2); ctx.translate(-VPX, -220);
      chromeTitle(ctx, 'MORE EXAMPLES', VPX, 240, 80);
      ctx.restore();
      const on = flick(t, T5 + 0.75);
      ctx.save(); ctx.globalAlpha = on;
      neonArrow(ctx, [[390, 330], [462, 330]], cl((t - T5 - 0.75) / 0.2), '#ff4fd8', 3);
      ctx.restore();
      ctx.save(); ctx.translate(690, 334); ctx.rotate(-0.06);
      ctx.font = '700 76px "Caveat"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      // unlit glass tube (always there once the payoff is up)
      ctx.globalAlpha = t >= T5 + 0.75 ? 1 : 0;
      ctx.shadowColor = 'rgba(16,0,40,0.95)'; ctx.shadowBlur = 22; ctx.fillStyle = 'rgba(30,0,50,0.6)'; ctx.fillText('better guesses', 0, 0);
      ctx.shadowBlur = 10; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(30,0,50,0.45)'; ctx.strokeText('better guesses', 0, 0);
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,150,210,0.3)'; ctx.lineWidth = 1.6; ctx.strokeText('better guesses', 0, 0);
      if (on > 0) {
        ctx.globalAlpha = on;
        ctx.shadowColor = '#ff1fa8'; ctx.shadowBlur = 28; ctx.fillStyle = '#ff1aa8'; ctx.fillText('better guesses', 0, 0);
        ctx.shadowBlur = 12; ctx.fillText('better guesses', 0, 0);
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,215,245,0.9)'; ctx.lineWidth = 1.5; ctx.strokeText('better guesses', 0, 0);
        ctx.fillStyle = 'rgba(255,190,235,0.9)'; ctx.globalAlpha = 0.12 * on; ctx.fillText('better guesses', 0, 0);
      }
      ctx.restore();
    }
    bloom(ctx, W, H_, 0.3, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = Math.floor(t * 20) % 3; y < H_; y += 3) ctx.fillRect(0, y, W, 1);
    H.grain(ctx, W, H_, 0.04, 12 + Math.floor(t * 12), true);
    H.vignette(ctx, W, H_, 0.5, '6,0,20');
  }

  // ---- SOUND: an 80s night drive. A driving synth pulse (kick + bass) under the road, airy pad in the sky; slams are
  // gated-reverb snares with detuned saw stabs, neon text strikes buzz through its flicker, arrows are analog zaps,
  // the odometer rolls with mechanical clicks and the weight knobs sweep a resonant filter. Times copy explainSW.
  function swSound(k) {
    const END = 14.5, T1 = 2.4, T3 = 6.0, T4 = 10.5, T5 = 12.9;
    const snare = (t, g = 1, pan = 0) => { // 80s gated-reverb snare: bright burst cut off hard
      k.noise(t, { dur: 0.24, color: 'pink', filter: 'bandpass', f: 1700, q: 0.6, gain: 0.32 * g, a: 0.002, hold: 0.17, verb: 0.5, pan });
      k.tone(t, { f: [[0, 230], [0.08, 160]], dur: 0.12, gain: 0.22 * g, pan });
    };
    const stab = (t, notes, g = 1, d = 0.5, pan = 0, minor = false) => notes.forEach((n, i) => { // detuned saw chord stab, filter closing
      k.tone(t, { f: n, type: 'sawtooth', dur: d, gain: 0.05 * g, a: 0.004, hold: d * 0.3, filter: 'lowpass', f2: [[0, 3200], [d * 0.8, 600]], verb: 0.35, pan: pan + (i - 1) * 0.2, minor });
      k.tone(t, { f: n, type: 'sawtooth', detune: 14, dur: d, gain: 0.04 * g, a: 0.004, hold: d * 0.3, filter: 'lowpass', f2: [[0, 2600], [d * 0.8, 500]], verb: 0.35, pan: pan - (i - 1) * 0.2, minor });
    });
    const zap = (t, d, f0, f1, g = 1, pan = 0, minor = true) => k.tone(t, { f: [[0, f0], [d, f1]], type: 'sawtooth', dur: d + 0.05, gain: 0.06 * g, a: 0.005, hold: d * 0.6, filter: 'lowpass', f2: 1600, pan, minor });
    // neon strike: buzzes on and off with flick()'s 32 ms pattern [1,0,1,.3,0,1,1,.5,1,1], then a short hum tail
    const FLK = [1, 0, 1, 0.3, 0, 1, 1, 0.5, 1, 1];
    const strike = (t, g = 1, pan = 0, minor = false) => {
      FLK.forEach((v, i) => {
        if (!v) return;
        k.tone(t + i * 0.032, { f: 120, type: 'sawtooth', dur: 0.034, gain: 0.16 * v * g, a: 0.001, hold: 0.026, filter: 'bandpass', f2: 1400, q: 1.4, pan, minor });
        if (!FLK[i - 1]) k.noise(t + i * 0.032, { dur: 0.008, filter: 'bandpass', f: 2200, q: 1.5, gain: 0.22 * g, a: 0.0005, pan, minor });
      });
      k.tone(t + 0.32, { f: 120, type: 'sawtooth', dur: 0.35, gain: 0.07 * g, a: 0.005, filter: 'bandpass', f2: 1100, q: 1.4, pan, minor });
    };
    const counter = (t0, t1, fn, step, play) => { let last = -1, lastV = fn(t0); for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const v = fn(t); if (Math.abs(v - lastV) >= step && t - last >= 1 / 12) { play(t, v); last = t; lastV = v; } } };

    // ---- music: pad intro, driving pulse on the road (bar = 2.4 s, lands on T1), airy pad in the sky, pad payoff
    k.music('pad', 0.55, T1, { bpm: 100, gain: 0.45, chords: [['A3', 'C4', 'E4', 'G4']] });
    k.music('pulse', T1, T4 - 0.1, { bpm: 100, gain: 0.42, chords: [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4'], ['C4', 'E4', 'G4', 'B4'], ['G3', 'B3', 'D4', 'F4']] });
    k.music('pad', T4 + 0.1, T5, { bpm: 100, gain: 0.4, chords: [['F3', 'A3', 'C4', 'E4'], ['G3', 'B3', 'D4', 'F4']] });
    k.music('pad', T5 + 0.65, END, { bpm: 100, gain: 0.45, chords: [['C4', 'E4', 'G4', 'B4']] });
    k.bed('hiss', 0, END, { gain: 0.8 });

    // ---- beat 1: chrome title slams in (0.15..0.55, flash at 0.55), glint sweeps, then glides into the corner
    k.noise(0.15, { dur: 0.42, color: 'pink', filter: 'bandpass', f: [[0, 400], [0.4, 3000]], q: 1, gain: 0.2, a: 0.38 }); // reverse swell into the slam
    const SLAM = 0.55;
    snare(SLAM, 1.1); k.play('thud', SLAM, { f: 90, gain: 0.7 });
    stab(SLAM, ['A3', 'E4', 'A4', 'C5'], 1.1, 0.7);
    k.noise(0.6, { dur: 1.2, color: 'pink', filter: 'bandpass', f: [[0, 900], [1.2, 2200]], q: 3, gain: 0.04, a: 0.4, pan: -0.6, minor: true }); // glint
    k.noise(1.75, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 500], [0.6, 200]], gain: 0.12, a: 0.25, pan: -0.4, minor: true });   // title glides to the corner

    // ---- beat 2: the core flickers on (2.15), the dashboard rises (2.5..2.9), cards ride into the core
    strike(2.15, 1);
    k.tone(2.15, { f: [[0, 'A2'], [0.4, 'A3']], type: 'sawtooth', dur: 0.5, gain: 0.06, a: 0.05, hold: 0.25, filter: 'lowpass', f2: [[0, 300], [0.4, 1400]] });
    k.noise(2.5, { dur: 0.4, color: 'brown', filter: 'lowpass', f: [[0, 200], [0.4, 600]], gain: 0.14, a: 0.2, minor: true });       // dash slides up
    // core absorbs a card each pulse (every 0.35 s from 2.9 to 6.0): soft analog bloop, walking up A minor pentatonic
    const PENT = ['A4', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'A4'];
    for (let i = 0; 2.9 + i * 0.35 < T3; i++) k.tone(2.9 + i * 0.35, { f: [[0, k.hz(PENT[i % PENT.length]) * 0.5], [0.05, PENT[i % PENT.length]]], type: 'triangle', dur: 0.16, gain: 0.08, a: 0.002, hold: 0.04, verb: 0.25, pan: 0.15, minor: true });
    // odometer 0 -> 1,000,000 (2.9..5.6, ease-in-out): mechanical roller clicks, then a stab when it lands
    counter(2.9, 5.6, (t) => E.inOut(cl((t - 2.9) / 2.7)), 1 / 40, (t) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1800, q: 3, gain: 0.17, a: 0.0005, pan: 0.15, minor: true }));
    stab(5.6, ['E4', 'A4', 'C5'], 0.8, 0.35, 0.15);

    // ---- beat 3: the loop tubes light (6.0), test card rides in, guess / check / adjust
    strike(T3, 0.7, -0.6, true);
    zap(7.0, 0.3, 300, 1100, 1, 0.4);                                   // arrow core -> sign
    strike(7.0, 0.6, -0.8, true);                                        // GUESS tube
    strike(7.1, 0.8, 0.3, true);                                         // GUESS label
    strike(7.3, 1, 0.6); stab(7.3, ['G4', 'D5'], 0.6, 0.3, 0.6);         // "DOG?" sign buzzes on
    // CHECK (7.9): wrong. red flash, the X strikes on, a sour falling stab
    const WRONG = 7.9;
    k.play('thud', WRONG, { f: 80, gain: 0.75 });
    ['A3', 'Eb4', 'Bb4'].forEach((n, i) => k.tone(WRONG, { f: [[0, n], [0.45, k.hz(n) * 0.8]], type: 'sawtooth', dur: 0.55, gain: 0.07, a: 0.004, hold: 0.25, filter: 'lowpass', f2: [[0, 2400], [0.5, 500]], verb: 0.3, pan: 0.6 + (i - 1) * 0.15 }));
    strike(WRONG, 0.8, 0.7);
    strike(8.05, 0.6, 0.6, true);                                        // CHECK: IT'S A CAT
    // ADJUST (8.5): error pulse runs down to the knobs (8.5..8.9) as a falling zap
    zap(8.5, 0.4, 1000, 180, 1.3, 0.7, false);
    strike(8.5, 0.6, -0.4, true);
    // knobs turn (8.9..9.5, ease-in-out): resonant filter sweep + detent clicks (30 detents over the three knobs' travel)
    k.tone(8.9, { f: 'A2', type: 'sawtooth', dur: 0.7, gain: 0.07, a: 0.05, hold: 0.45, filter: 'lowpass', f2: [[0, 300], [0.6, 1800]], q: 8, pan: 0.6, minor: true });
    counter(8.9, 9.5, (t) => E.inOut(cl((t - 8.9) / 0.6)), 1 / 10, (t) => k.noise(t, { dur: 0.01, filter: 'bandpass', f: 1500, q: 3, gain: 0.14, a: 0.0005, pan: 0.7, minor: true }));
    // GUESS again -> CAT (9.6), tick (9.75), CORRECT (9.85): bright major stab + sign buzz
    strike(9.6, 0.8, 0.6);
    stab(9.6, ['C4', 'E4', 'G4', 'C5'], 1, 0.5, 0.5);
    k.tone(9.75, { f: 'G4', type: 'triangle', dur: 0.4, gain: 0.1, verb: 0.3, pan: 0.6 }); k.tone(9.85, { f: 'C5', type: 'triangle', dur: 0.6, gain: 0.1, verb: 0.3, pan: 0.6 });
    strike(10.05, 0.5, -0.6, true);                                      // CHECK tube

    // ---- beat 4: camera tilts up into the sky (10.5..11.2), chart flickers on (11.0), line draws 11.3..12.4
    k.noise(T4, { dur: 0.75, color: 'pink', filter: 'bandpass', f: [[0, 300], [0.7, 2400]], q: 1.4, gain: 0.16, a: 0.5 });   // filter sweep up
    k.noise(T4 - 0.1, { dur: 0.35, color: 'brown', filter: 'lowpass', f: 400, gain: 0.12, a: 0.1, minor: true });             // dash drops away
    strike(T4 + 0.5, 0.8);
    k.tone(T4 + 0.8, { f: [[0, 'A3'], [1.1, 'A4']], type: 'sawtooth', dur: 1.15, gain: 0.04, a: 0.1, hold: 0.9, filter: 'lowpass', f2: 1300, pan: -0.3, minor: true }); // the line's glowing head
    const val = (u) => 61 + 36 * (1 - Math.pow(1 - u, 2.3)) + Math.sin(u * 40) * 2 * (1 - u);
    counter(T4 + 0.8, T4 + 1.9, (t) => Math.round(val(cl((t - T4 - 0.8) / 1.1))), 1, (t) => k.noise(t, { dur: 0.012, filter: 'bandpass', f: 1800, q: 3, gain: 0.14, a: 0.0005, pan: 0.4, minor: true }));
    // 97% (pr >= 1 at T4 + 1.9): biggest moment. gated snare, big chord stab, deep boom, glint
    const BEST = T4 + 1.9 + 1e-3;
    snare(BEST, 1.3, 0.3); k.play('impact', BEST, { f: 70, gain: 1 });
    stab(BEST, ['F3', 'C4', 'E4', 'A4', 'C5'], 1.4, 1.3, 0.3);
    k.noise(BEST + 0.05, { dur: 0.35, color: 'pink', filter: 'bandpass', f: [[0, 1200], [0.3, 2200]], q: 3, gain: 0.06, a: 0.15, pan: 0.5 });

    // ---- beat 5: tilt back down (12.8..13.3), MORE EXAMPLES slams in (13.2..13.55), arrow + script strike (13.65)
    k.noise(T5 - 0.1, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 2000], [0.5, 300]], q: 1.4, gain: 0.12, a: 0.15 });
    k.noise(T5 + 0.3, { dur: 0.27, color: 'pink', filter: 'bandpass', f: [[0, 500], [0.25, 2600]], q: 1, gain: 0.14, a: 0.24 });
    const PAY = T5 + 0.65;
    snare(PAY, 0.9); k.play('thud', PAY, { f: 90, gain: 0.55 });
    stab(PAY, ['C4', 'G4', 'C5'], 0.9, 0.5);
    zap(PAY + 0.1, 0.2, 400, 1000, 0.8, -0.4);
    // takeaway lands: script buzzes on and the chord resolves (B -> C over C)
    const TAKE = T5 + 0.75;
    strike(TAKE, 1, 0.2);
    k.tone(TAKE, { f: 'B4', type: 'triangle', dur: 0.2, gain: 0.1, verb: 0.3 }); k.tone(TAKE + 0.18, { f: 'C5', type: 'triangle', dur: 1.2, gain: 0.12, verb: 0.4 });
    k.tone(TAKE + 0.18, { f: 'C3', type: 'sawtooth', dur: 1.2, gain: 0.06, a: 0.02, hold: 0.4, filter: 'lowpass', f2: 700 });
  }

  registerStyle({
    id: 'synthwave',
    name: 'Synthwave Outrun',
    category: 'Retro UI & Neon',
    description: '80s outrun poster: neon grid highway to a striped sunset, wireframe vector mountains, chrome-beveled italic title with a horizon reflection and a hot-pink neon script, all bathed in bloom.',
    motion: 'Stars blink on, the horizon line and grid race toward camera, the striped sun rises and wireframe mountains grow, the chrome title slams in with a flash, the script tube flickers on and glints sweep the chrome.',
    fonts: ['800 112px "Orbitron"', '700 74px "Caveat"', '800 14px "Orbitron"', '800 52px "Orbitron"'],
    frameT: 5.2,
    duration: 5.5,
    explainerDuration: 14.5,
    explainerNote: 'A night drive explains it: labelled example cards ride the neon highway into a wireframe AI core, a dashboard HUD holds a rolling odometer counter, synth-knob weights and GUESS/CHECK/ADJUST neon tubes; the camera tilts up into the sky for a glowing accuracy chart and back down for a chrome payoff.',
    explainer(ctx, W, H_, t) { explainSW(ctx, W, H_, t); },
    explainerSound(k) { swSound(k); },
    readsPixels: true,
    draw(ctx, W, H_, t) {
      const E = H.ease, cl = H.clamp;
      skyAndStars(ctx, W, t);
      sun(ctx, W, H_, VPX, 352 + (1 - E.out(cl((t - 0.5) / 1.6))) * 300, 176, t);
      mountains(ctx, t, E.inOut(cl((t - 1.0) / 1.3)));
      floorAndRoad(ctx, W, H_, t, E.inOut(cl((t - 0.3) / 0.95)) * 0.999 + 0.001, E.out(cl((t - 0.1) / 0.5)));
      bloom(ctx, W, H_, 0.55, 5);

      // Title: chrome slams in from the camera, lands with a flash
      const T_T = 2.05, pT = cl((t - T_T) / 0.45);
      if (t >= T_T) {
        const sc = 1 + 1.6 * Math.pow(1 - pT, 3);
        ctx.save();
        ctx.globalAlpha = cl(pT * 4);
        ctx.translate(VPX, 140); ctx.scale(sc, sc); ctx.translate(-VPX, -140);
        chromeTitle(ctx, 'NEURAL DRIVE', VPX + 6, 168, 104);
        ctx.restore();
        const fl = t > T_T + 0.45 ? Math.exp(-(t - T_T - 0.45) * 7) : 0;
        if (fl > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const fg = ctx.createRadialGradient(VPX, 130, 0, VPX, 130, 520); fg.addColorStop(0, `rgba(255,220,255,${0.7 * fl})`); fg.addColorStop(1, 'rgba(255,120,220,0)'); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H_); ctx.restore(); }
      }
      // glint sweeps across the chrome every 2.2 s, plus a resting star glint
      const gph = (t - 2.6) % 2.2;
      if (t > 2.6 && gph < 0.75) glint(ctx, 180 + (gph / 0.75) * 920, 98 + (gph / 0.75) * 40, 46, 0.95);
      if (t > 2.6) glint(ctx, 952, 172, 26 * (0.75 + 0.25 * Math.sin(t * 4)), 0.7);

      // Neon script subtitle: tube flickers on
      const flick = [[2.85, 1], [2.92, 0], [3.02, 1], [3.06, 0], [3.2, 1], [3.24, 0.4], [3.3, 1]];
      let on = 0; for (const [ft, v] of flick) if (t >= ft) on = v;
      if (t >= 2.6) {
        ctx.save();
        ctx.translate(760, 238); ctx.rotate(-0.09);
        ctx.font = '700 74px "Caveat"'; ctx.textAlign = 'center';
        // unlit glass tube
        ctx.strokeStyle = 'rgba(255,150,210,0.28)'; ctx.lineWidth = 1.6; ctx.strokeText('Midnight Upload', 0, 0);
        if (on > 0) {
          ctx.globalAlpha = on;
          ctx.shadowColor = '#ff1fa8'; ctx.shadowBlur = 28; ctx.fillStyle = '#ff2fb6';
          ctx.fillText('Midnight Upload', 0, 0);
          ctx.shadowBlur = 12; ctx.fillText('Midnight Upload', 0, 0);
          ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,215,245,0.9)'; ctx.lineWidth = 1.6; ctx.strokeText('Midnight Upload', 0, 0);
          ctx.fillStyle = 'rgba(255,190,235,0.9)'; ctx.globalAlpha = 0.35 * on; ctx.fillText('Midnight Upload', 0, 0);
        }
        // underline swash draws on
        const sw = cl((t - 3.35) / 0.35);
        if (sw > 0) {
          ctx.globalAlpha = 1; ctx.strokeStyle = '#ff2fb6'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowColor = '#ff1fa8'; ctx.shadowBlur = 18;
          ctx.setLineDash([420 * sw, 1000]);
          ctx.beginPath(); ctx.moveTo(-170, 20); ctx.bezierCurveTo(-60, 34, 80, 10, 200, 16); ctx.stroke();
        }
        ctx.restore();
      }

      bloom(ctx, W, H_, 0.25, 3);
      // CRT scanlines + grain
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let y = Math.floor(t * 20) % 3; y < H_; y += 3) ctx.fillRect(0, y, W, 1);
      H.grain(ctx, W, H_, 0.05, 12 + Math.floor(t * 12), true);
      H.vignette(ctx, W, H_, 0.55, '6,0,20');
    },
  });
}
```
