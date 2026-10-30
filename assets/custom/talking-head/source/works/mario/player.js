import {DURATION,clamp} from './timing.js';
import {createScene} from './scene.js';
import {createScore,scoreSound} from './score.js';
const canvas=document.querySelector('#stage'),play=document.querySelector('#play'),replay=document.querySelector('#replay'),slider=document.querySelector('#timeline'),clock=document.querySelector('#clock'),sound=document.querySelector('#sound'),loop=document.querySelector('#loop'),status=document.querySelector('#status');
let t=0,running=false,anchor=0,soundOn=true,loopOn=false,ac=null,buffer=null,promise=null,source=null,epoch=0,view=null;
let cadenceStart=0,cadenceFrames=0;
function prepareScore(){promise??=createScore(new OfflineAudioContext(2,1,48000)).then(r=>{canvas.dataset.audioPeak=r.peak.toFixed(4);canvas.dataset.audioRms=r.rms.toFixed(4);canvas.dataset.audioDuration=r.buffer.duration.toFixed(3);canvas.dataset.music=r.music;canvas.dataset.audioReady='true';return r;});return promise;}
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function draw(){view.render(t);slider.value=t;clock.value=`${fmt(t)} / ${fmt(DURATION)}`;clock.dataset.time=t.toFixed(3);canvas.dataset.playing=String(running);}
function stopAudio(){epoch++;if(source){try{source.stop()}catch{}source.disconnect();source=null}canvas.dataset.audio='stopped';}
async function audio(){stopAudio();if(!soundOn||!running)return;const token=epoch;try{ac??=new AudioContext();await ac.resume();const result=await prepareScore();if(token!==epoch||!running||!soundOn)return;buffer=result.buffer;const offset=Math.min(DURATION,(performance.now()-anchor)/1000);if(offset>=DURATION)return;source=ac.createBufferSource();source.buffer=buffer;source.connect(ac.destination);source.start(0,offset);canvas.dataset.audio='playing';}catch(e){if(token!==epoch)return;status.hidden=false;status.textContent='声音未能启动，请再次点击声音按钮。';console.error(e);}}
function setRunning(v){running=v;play.textContent=v?'暂停':'播放';play.setAttribute('aria-label',v?'暂停':'播放');if(v){cadenceStart=performance.now();cadenceFrames=0;anchor=performance.now()-t*1000;audio()}else stopAudio();draw();}
function seek(v){t=clamp(Number(v)||0,0,DURATION);anchor=performance.now()-t*1000;if(running)audio();else stopAudio();draw();}
play.addEventListener('click',()=>{if(!running&&t>=DURATION)t=0;setRunning(!running)});
replay.addEventListener('click',()=>{t=0;setRunning(true)});
let resume=false;slider.addEventListener('pointerdown',()=>{resume=running;if(running)setRunning(false)});slider.addEventListener('input',()=>seek(slider.value));slider.addEventListener('change',()=>{if(resume){resume=false;setRunning(true)}});slider.addEventListener('pointercancel',()=>resume=false);
sound.addEventListener('click',()=>{soundOn=!soundOn;sound.textContent=`声音 ${soundOn?'开':'关'}`;sound.setAttribute('aria-label',`声音${soundOn?'开启':'关闭'}`);sound.setAttribute('aria-pressed',String(soundOn));if(soundOn&&running)audio();else stopAudio()});
loop.addEventListener('click',()=>{loopOn=!loopOn;loop.textContent=`循环 ${loopOn?'开':'关'}`;loop.setAttribute('aria-label',`循环${loopOn?'开启':'关闭'}`);loop.setAttribute('aria-pressed',String(loopOn))});
document.querySelector('#full').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('main').requestFullscreen()}catch{}});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['BUTTON','INPUT'].includes(e.target.tagName)){e.preventDefault();play.click()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)setRunning(false)});window.addEventListener('pagehide',()=>{stopAudio();ac?.close()});
function tick(){if(running){t=(performance.now()-anchor)/1000;cadenceFrames++;if(cadenceFrames>30)canvas.dataset.playbackFps=(cadenceFrames*1000/(performance.now()-cadenceStart)).toFixed(1);if(t>=DURATION){if(loopOn){t=t%DURATION;anchor=performance.now()-t*1000;audio()}else{t=DURATION;setRunning(false)}}draw()}requestAnimationFrame(tick)}
window.seek=seek;window.DURATION=DURATION;window.scoreSound=scoreSound;
try{const params=new URLSearchParams(location.search),embedded=params.has('embed');await document.fonts.ready;view=createScene(canvas,{embedded:embedded&&!params.has('cache')});await view.ready;window.renderFrame=t=>view.render(clamp(t,0,DURATION));draw();if(!embedded){document.querySelector('#loading').textContent='正在准备音乐与音效…';try{await prepareScore();}catch(e){status.hidden=false;status.textContent='声音暂不可用，画面可以播放。';console.error(e);}}document.querySelector('#loading').hidden=true;play.disabled=replay.disabled=false;requestAnimationFrame(tick);}catch(e){document.querySelector('#loading').textContent='立体画面加载失败，请刷新重试。';console.error(e);}
