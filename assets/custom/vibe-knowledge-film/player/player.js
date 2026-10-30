/* Local adapter; upstream engine stays unchanged. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const play = $('play'), replay = $('replay'), track = $('time'), stamp = $('stamp'), status = $('status');
  const audio = $('sound');
  let t = 0, running = false, raf = 0, base = 0, ready = false, failed = false, serial = 0;
  function pause() {
    serial++; running = false; cancelAnimationFrame(raf); audio.pause(); play.textContent = '播放';
    document.body.dataset.playing = 'false';
  }
  function fail(message) { failed = true; pause(); status.textContent = message; play.disabled = replay.disabled = track.disabled = true; }
  function draw(value) {
    t = Math.max(0, Math.min(window.END, value));
    try { window.seek(t); } catch (error) { fail('画面绘制失败：' + error.message); return; }
    track.value = t; stamp.textContent = `${t.toFixed(1)} / ${window.END.toFixed(1)}s`;
    document.body.dataset.time = t.toFixed(3);
  }
  function syncAudio() { if (audio.hasAttribute('src') && audio.readyState > 0) audio.currentTime = Math.min(t, Number.isFinite(audio.duration) ? audio.duration : t); }
  function tick(now) {
    if (!running) return;
    draw((now - base) / 1000);
    if (failed) return;
    if (audio.hasAttribute('src') && !audio.paused && Math.abs(audio.currentTime - t) > .15) syncAudio();
    if (t >= window.END) { pause(); return; }
    raf = requestAnimationFrame(tick);
  }
  async function start() {
    if (!ready || failed) return;
    pause(); const request = serial;
    if (t >= window.END) draw(0);
    syncAudio();
    if (audio.hasAttribute('src') && (!Number.isFinite(audio.duration) || t < audio.duration)) {
      try { await audio.play(); } catch { if (request === serial) status.textContent = '音频未能播放，请检查文件后重试。'; return; }
      if (request !== serial) { audio.pause(); return; }
    }
    base = performance.now() - t * 1000; running = true; play.textContent = '暂停';
    document.body.dataset.playing = 'true'; raf = requestAnimationFrame(tick);
  }
  play.onclick = () => running ? pause() : start();
  replay.onclick = () => { pause(); draw(0); syncAudio(); start(); };
  track.oninput = () => { pause(); draw(Number(track.value)); syncAudio(); };
  document.addEventListener('keydown', event => {
    if (!ready || failed || /INPUT|BUTTON|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    if (event.code === 'Space') { event.preventDefault(); running ? pause() : start(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); pause(); draw(t + (event.key === 'ArrowLeft' ? -1 : 1)); syncAudio(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  audio.addEventListener('error', () => fail('本地音频加载失败。'));
  window.addEventListener('error', event => fail('加载或绘制失败：' + (event.message || '请检查本地依赖')));
  window.addEventListener('unhandledrejection', event => fail('初始化失败：' + String(event.reason)));
  const config = window.FILM_CONFIG || {};
  if (config.audio) {
    if (/^(?:[a-z]+:|\/|\\)/i.test(config.audio) || config.audio.split(/[\\/]/).includes('..')) { fail('音频必须是项目内的相对路径。'); return; }
    audio.src = config.audio;
  }
  const deadline = performance.now() + 30000;
  function boot() {
    if (failed) return;
    if (window.READY && typeof window.seek === 'function' && Number.isFinite(window.END)) {
      ready = true; track.max = window.END; play.disabled = replay.disabled = track.disabled = false;
      document.body.dataset.ready = 'true';
      status.textContent = config.audio ? '' : '无音轨';
      draw(Math.max(0, Number(new URLSearchParams(location.search).get('t')) || 0));
    } else if (performance.now() > deadline) fail('初始化超时，请检查引擎和本地字体文件。');
    else requestAnimationFrame(boot);
  }
  boot();
})();
