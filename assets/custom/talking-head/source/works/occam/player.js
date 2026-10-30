(() => {
'use strict';
const canvas=document.querySelector('#stage'),ctx=canvas.getContext('2d');
const play=document.querySelector('#play'),replay=document.querySelector('#replay'),slider=document.querySelector('#timeline'),clock=document.querySelector('#clock'),sound=document.querySelector('#sound'),loop=document.querySelector('#loop'),status=document.querySelector('#status');
let t=0,running=false,anchor=0,soundOn=true,loopOn=false,ac=null,buffer=null,bufferPromise=null,source=null,epoch=0,frameCount=0,totalMs=0;
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function draw(){const before=performance.now();window.renderFrame(ctx,t);totalMs+=performance.now()-before;frameCount++;slider.value=t;clock.value=`${fmt(t)} / ${fmt(DURATION)}`;clock.dataset.time=t.toFixed(3);canvas.dataset.renderMs=(totalMs/frameCount).toFixed(2);canvas.setAttribute('aria-label',t<1.8?'杯子倒了，猫在旁边。':t<3.6?'你猜：猫碰倒了杯子。':t<5.6?'额外假设：隐形精灵，没有增加解释力。':t<7.1?'扫描剔除多余假设。':t<10.05?'解释同样充分，优先选假设更少的。':t<14.7?'如果监控拍到新的证据：一只手碰倒杯子。':t<17?'是手碰倒杯子，修正原来的解释。':t<19.6?'更简单，不等于一定正确。':'先看证据，再做减法。')}
function stopAudio(){epoch++;if(source){try{source.stop()}catch{}source.disconnect();source=null}canvas.dataset.audio='stopped'}
async function startAudio(){
  stopAudio();if(!soundOn||!running)return;const token=epoch;
  try{
    ac??=new AudioContext();await ac.resume();
    // Render once and play the buffer at the exact video offset. This also
    // avoids scheduling negative-time long sounds when seeking mid-score.
    if(!bufferPromise)bufferPromise=SOUND.renderOffline(scoreSound,DURATION,48000,{}).then(r=>{const b=ac.createBuffer(2,r.frames,r.sr);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<r.frames;i++)d[i]=r.inter[i*2+c]}canvas.dataset.audioPeak=r.peak.toFixed(4);return b});
    buffer=await bufferPromise;if(token!==epoch||!running||!soundOn)return;
    const offset=Math.min(DURATION,(performance.now()-anchor)/1000);if(offset>=DURATION)return;
    source=ac.createBufferSource();source.buffer=buffer;source.connect(ac.destination);source.start(0,offset);canvas.dataset.audio='playing';
  }catch(err){if(token!==epoch)return;status.hidden=false;status.textContent='声音暂不可用，画面可以继续播放。';canvas.dataset.audio='error';console.error(err)}
}
function setRunning(v){running=v;play.textContent=v?'暂停':'播放';play.setAttribute('aria-label',v?'暂停':'播放');canvas.dataset.playing=String(v);if(v){anchor=performance.now()-t*1000;startAudio()}else{stopAudio()}draw()}
function seek(v){t=Math.max(0,Math.min(DURATION,Number(v)||0));anchor=performance.now()-t*1000;stopAudio();if(running)startAudio();draw()}
play.addEventListener('click',()=>{if(!running&&t>=DURATION)t=0;setRunning(!running)});
replay.addEventListener('click',()=>{t=0;setRunning(true)});
let resumeAfterDrag=false;
slider.addEventListener('pointerdown',()=>{resumeAfterDrag=running;if(running)setRunning(false)});
slider.addEventListener('input',()=>seek(slider.value));
slider.addEventListener('change',()=>{if(resumeAfterDrag){resumeAfterDrag=false;setRunning(true)}});
slider.addEventListener('pointercancel',()=>{resumeAfterDrag=false});
sound.addEventListener('click',()=>{soundOn=!soundOn;sound.textContent=`声音 ${soundOn?'开':'关'}`;sound.setAttribute('aria-pressed',String(soundOn));sound.setAttribute('aria-label',`声音${soundOn?'开启':'关闭'}`);if(soundOn&&running)startAudio();else stopAudio()});
loop.addEventListener('click',()=>{loopOn=!loopOn;loop.textContent=`循环 ${loopOn?'开':'关'}`;loop.setAttribute('aria-pressed',String(loopOn));loop.setAttribute('aria-label',`循环${loopOn?'开启':'关闭'}`)});
document.querySelector('#full').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('main').requestFullscreen()}catch{}});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['BUTTON','INPUT'].includes(e.target.tagName)){e.preventDefault();play.click()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)setRunning(false)});
window.addEventListener('pagehide',()=>{stopAudio();ac?.close()});
function tick(){if(running){t=(performance.now()-anchor)/1000;if(t>=DURATION){if(loopOn){t=t%DURATION;anchor=performance.now()-t*1000;startAudio()}else{t=DURATION;setRunning(false)}}draw()}requestAnimationFrame(tick)}
window.seek=seek;
document.fonts.ready.then(()=>{draw();requestAnimationFrame(tick)});
})();
