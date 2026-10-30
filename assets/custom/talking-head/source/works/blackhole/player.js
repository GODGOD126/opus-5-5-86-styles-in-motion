(()=>{
 'use strict';
 const canvas=document.querySelector('#film'),ctx=canvas.getContext('2d'),play=document.querySelector('#play'),replay=document.querySelector('#replay'),slider=document.querySelector('#time'),clock=document.querySelector('#clock'),sound=document.querySelector('#sound'),status=document.querySelector('#status');
 let t=0,playing=false,muted=false,base=0,audioContext=null,ready=false,dragResume=false,raf=0;const D=22;
 let draws=0,totalMs=0,maxMs=0;
 const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
 function audioStop(){if(audioContext){const old=audioContext;audioContext=null;old.close().catch(()=>{})}canvas.dataset.audioActive='false';canvas.dataset.audioState='closed'}
 function audioStart(){audioStop();if(muted||!playing)return;try{const next=audioContext=new(window.AudioContext||window.webkitAudioContext)();next.onstatechange=()=>{if(audioContext===next)canvas.dataset.audioState=next.state};BHScene.score(SOUND.kit(next,{voiceover:false,master:.62,start:t,delay:.03}));next.resume().catch(err=>{if(audioContext===next){audioStop();status.textContent='音效启动失败，画面可继续播放';console.error(err)}});canvas.dataset.audioActive='true';canvas.dataset.audioState=next.state}catch(err){audioStop();status.textContent='音效启动失败，画面可继续播放';console.error(err)}}
 function paint(){const start=performance.now();BHScene.draw(ctx,t);const ms=performance.now()-start;draws++;totalMs+=ms;maxMs=Math.max(maxMs,ms);slider.value=t;clock.value=`${fmt(t)} / 00:22`;canvas.dataset.time=t.toFixed(3);canvas.dataset.playing=String(playing);canvas.dataset.meanDrawMs=(totalMs/draws).toFixed(2);canvas.dataset.maxDrawMs=maxMs.toFixed(2);canvas.dataset.phase=t<5.15?'外侧光路':t<12.1?'事件视界':t<13.6?'绘卷转场':'吸积盘组装'}
 function frame(now){if(!playing)return;t=Math.min(D,(now-base)/1000);if(t>=D){playing=false;play.textContent='播放';audioStop()}paint();if(playing)raf=requestAnimationFrame(frame)}
 function start(){if(!ready)return;if(t>=D)t=0;playing=true;play.textContent='暂停';base=performance.now()-t*1000;audioStart();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
 function pause(){if(playing)t=Math.min(D,(performance.now()-base)/1000);playing=false;play.textContent='播放';cancelAnimationFrame(raf);audioStop();paint()}
 function seek(value){t=Math.max(0,Math.min(D,Number(value)||0));if(playing){base=performance.now()-t*1000;audioStart()}else audioStop();paint()}
 play.addEventListener('click',()=>playing?pause():start());
 replay.addEventListener('click',()=>{pause();t=0;start()});
 slider.addEventListener('pointerdown',()=>{dragResume=playing;if(playing)pause()});
 slider.addEventListener('input',()=>seek(slider.value));
 slider.addEventListener('change',()=>{if(dragResume)start();dragResume=false});
 slider.addEventListener('pointercancel',()=>{dragResume=false});
 sound.addEventListener('click',()=>{muted=!muted;sound.textContent=`声音 ${muted?'关':'开'}`;sound.setAttribute('aria-pressed',String(!muted));if(muted)audioStop();else audioStart()});
 document.addEventListener('keydown',event=>{if(event.code==='Space'&&event.target.tagName!=='BUTTON'&&event.target.tagName!=='INPUT'){event.preventDefault();playing?pause():start()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause()});
 window.addEventListener('pagehide',audioStop);
 window.DURATION=D;window.seek=seek;window.scoreSound=BHScene.score;
 async function init(){try{await document.fonts.load('900 64px Woodblock','事件视界');await document.fonts.ready;BHScene.init();ready=true;play.disabled=false;replay.disabled=false;slider.disabled=false;status.textContent='22 秒样片 · 对应全片中段';canvas.dataset.ready='true';paint()}catch(error){status.textContent='画面加载失败，请刷新重试';console.error(error)}}
 init();
})();
