(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const music=$('music'),play=$('play'),replay=$('replay'),range=$('progress'),sound=$('sound');
  const duration=window.DURATION;
  range.max=String(duration);
  const stamp=value=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
  let t=0,playing=false,raf=0,epoch=0,startClock=0,hasAudio=true,ready=false,resumeAfterScrub=false;
  const clamp=n=>Math.max(0,Math.min(duration,Number(n)||0));
  music.volume=.3;
  function draw() {
    window.renderFrame(t);range.value=t.toFixed(3);
    $('time').value=`${stamp(t)} / ${stamp(duration)}`;
    play.textContent=playing?'暂停':'播放';play.setAttribute('aria-label',playing?'暂停':'播放');
    document.body.dataset.playing=String(playing);document.body.dataset.audio=hasAudio?'ready':'unavailable';
  }
  function stop() {
    epoch++;playing=false;cancelAnimationFrame(raf);music.pause();draw();
  }
  function alignAudio(value) {try {music.currentTime=value;}catch(e){console.warn('音频定位尚未就绪。',e.name);}}
  function frame(now) {
    if(!playing)return;
    t=clamp(hasAudio?music.currentTime:(now-startClock)/1000);
    // Gentle fade in/out. Muting does not change the master time source.
    music.volume=.3*Math.min(1,t/.65,(duration-t)/1.05);
    if(t>=duration-.025){t=duration;stop();return;}
    draw();raf=requestAnimationFrame(frame);
  }
  async function start() {
    if(!ready||playing)return;if(t>=duration-.03)t=0;
    cancelAnimationFrame(raf);music.pause();alignAudio(t);
    const token=++epoch;playing=true;draw();startClock=performance.now()-t*1000;
    if(hasAudio){
      try{await music.play();}
      catch(err){
        if(token!==epoch)return;
        if(err.name==='AbortError'){playing=false;draw();return;}
        playing=false;play.textContent='点击播放';play.setAttribute('aria-label','播放');
        document.body.dataset.playing='false';console.warn('请再次点击播放以启用声音。',err.name);return;
      }
    }
    if(token!==epoch)return;
    raf=requestAnimationFrame(frame);
  }
  function seek(value) {const resume=playing;stop();t=clamp(value);alignAudio(t);draw();if(resume&&t<duration)void start();}
  play.addEventListener('click',()=>playing?stop():void start());
  replay.addEventListener('click',()=>{stop();t=0;alignAudio(0);draw();void start();});
  range.addEventListener('pointerdown',()=>{resumeAfterScrub=playing;stop();});
  range.addEventListener('input',()=>{t=clamp(range.value);alignAudio(t);draw();});
  range.addEventListener('change',()=>{if(resumeAfterScrub&&t<duration)void start();resumeAfterScrub=false;});
  range.addEventListener('keydown',()=>{if(playing){resumeAfterScrub=true;stop();}});
  range.addEventListener('keyup',()=>{if(resumeAfterScrub&&t<duration)void start();resumeAfterScrub=false;});
  sound.addEventListener('click',()=>{music.muted=!music.muted;sound.textContent=music.muted?'声音 关':'声音 开';sound.setAttribute('aria-pressed',String(!music.muted));sound.setAttribute('aria-label',music.muted?'开启声音':'关闭声音');});
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.player').requestFullscreen();}catch(e){console.warn('当前窗口不支持全屏。',e.name);}});
  document.addEventListener('keydown',event=>{if(event.code==='Space'&&!['BUTTON','INPUT'].includes(event.target.tagName)){event.preventDefault();playing?stop():void start();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stop();else if(!document.hidden&&ready)requestAnimationFrame(draw);});
  new ResizeObserver(()=>{if(ready&&!playing)requestAnimationFrame(draw);}).observe($('scene'));
  music.addEventListener('error',()=>{hasAudio=false;document.body.dataset.audio='unavailable';sound.textContent='声音不可用';sound.disabled=true;console.error('BGM 加载失败，请检查 assets/bgm.mp3。');if(playing)startClock=performance.now()-t*1000;});
  window.seek=seek;window.pause=stop;window.play=()=>start();
  play.disabled=true;
  document.fonts.load('900 86px SceneSans').then(()=>document.fonts.ready).then(()=>{
    ready=true;play.disabled=false;document.body.dataset.font='ready';draw();requestAnimationFrame(()=>requestAnimationFrame(draw));
  }).catch(error=>{ready=true;play.disabled=false;document.body.dataset.font='fallback';console.error('本地字体未成功加载。',error);draw();});
})();
