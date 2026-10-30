// Film-time based audio; seek and pause stop every old scheduled source.
let ac=null,bus=null,nodes=[],enabled=true;
const events=[];
const landings=[0,.17,.42,1.35,3.08,3.25,3.45,3.58,3.75,4.05,4.65,7.02,7.28,7.42,8.38,8.65,8.95,11.25,12.05,12.38,12.9,13.2,17.12,17.28,17.42,17.82,18.45];
landings.forEach((t,i)=>events.push({t:t+.08,d:.13,g:i%3===0?.075:.045,type:'paper',f:130}));
[[.92,1.47],[5.12,5.7],[9.3,9.85],[13.45,14.05],[14.15,14.8],[18.35,19.02]].forEach(([a,b])=>events.push({t:a,d:b-a,g:.075,type:'mark'}));
[3,7,11.2,17].forEach(t=>events.push({t:t-.25,d:.58,g:.07,type:'slide'}));
[[146.83,174.61,220,261.63],[116.54,146.83,174.61,220],[130.81,164.81,196,246.94],[98,146.83,196,246.94],[146.83,174.61,220,293.66]].forEach((ch,i)=>ch.forEach(f=>events.push({t:i*4+.05,d:3.9,g:.008,type:'tone',f})));
events.push({t:19.02,d:.7,g:.028,type:'tone',f:440});
function stopAudio(){nodes.forEach(n=>{try{n.stop()}catch{}});nodes=[];if(bus){bus.disconnect();bus=null}document.body.dataset.audio='stopped'}
function startAudio(from){
 stopAudio();if(!enabled)return;ac??=new (window.AudioContext||window.webkitAudioContext)();ac.resume();bus=ac.createGain();bus.gain.value=.7;bus.connect(ac.destination);const base=ac.currentTime+.025;
 for(const e of events){if(e.t+e.d<=from)continue;const elapsed=Math.max(0,from-e.t),d=e.d-elapsed,when=base+Math.max(0,e.t-from),v=e.g*Math.exp(-elapsed/(e.d*.6));
  const env=ac.createGain();env.connect(bus);env.gain.setValueAtTime(.0001,when);env.gain.exponentialRampToValueAtTime(Math.max(.0002,v),when+Math.min(.018,d*.2));env.gain.exponentialRampToValueAtTime(.0001,when+d);
  if(e.type==='tone'){const o=ac.createOscillator();o.type='sine';o.frequency.value=e.f;o.connect(env);o.start(when);o.stop(when+d+.01);nodes.push(o)}
  else{const len=Math.max(1,Math.ceil(ac.sampleRate*d)),b=ac.createBuffer(1,len,ac.sampleRate),a=b.getChannelData(0),r=H.rng(Math.round(e.t*1000));let p=0;for(let i=0;i<len;i++){p=p*.87+(r()*2-1)*.13;a[i]=p*2.6}const o=ac.createBufferSource();o.buffer=b;const f=ac.createBiquadFilter();f.type=e.type==='paper'?'lowpass':'bandpass';f.frequency.value=e.type==='paper'?950:e.type==='mark'?1400:600;f.Q.value=.7;o.connect(f);f.connect(env);o.start(when);o.stop(when+d);nodes.push(o)}
 }document.body.dataset.audio='running';
}
const playBtn=document.querySelector('#play'),startBtn=document.querySelector('#start'),replayBtn=document.querySelector('#replay'),slider=document.querySelector('#progress'),time=document.querySelector('#time'),soundBtn=document.querySelector('#sound');
let current=0,playing=false,origin=0,ready=false;
const playIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l15 9-15 9z"/></svg>',pauseIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h4v18H6zM14 3h4v18h-4z"/></svg>';
function ui(){slider.value=current;time.value=`00:${String(Math.floor(current)).padStart(2,'0')} / 00:20`;const label=playing?'暂停':'播放';if(playBtn.getAttribute('aria-label')!==label){playBtn.innerHTML=playing?pauseIcon:playIcon;playBtn.setAttribute('aria-label',label)}startBtn.hidden=playing||current>0;document.body.dataset.state=playing?'playing':'paused';document.body.dataset.time=current.toFixed(3)}
function pause(){playing=false;stopAudio();ui()}
function play(){if(!ready)return;if(current>=DURATION)current=0;playing=true;origin=performance.now()-current*1000;startAudio(current);ui()}
function seek(t){if(!ready)return;current=clamp(Number(t)||0,0,DURATION);if(current>=DURATION)pause();else if(playing){origin=performance.now()-current*1000;startAudio(current)}draw(current);ui()}
function toggle(){playing?pause():play()}
playBtn.onclick=toggle;startBtn.onclick=play;canvas.onclick=toggle;replayBtn.onclick=()=>{pause();seek(0);play()};slider.oninput=()=>seek(slider.value);
soundBtn.onclick=()=>{enabled=!enabled;soundBtn.setAttribute('aria-pressed',String(enabled));soundBtn.setAttribute('aria-label',enabled?'关闭声音':'开启声音');soundBtn.style.opacity=enabled?'1':'.4';if(playing&&enabled)startAudio(current);else stopAudio()};
document.addEventListener('keydown',e=>{if(e.target===slider||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();toggle()}if(e.code==='ArrowRight'){e.preventDefault();seek(current+1)}if(e.code==='ArrowLeft'){e.preventDefault();seek(current-1)}});
function error(e){pause();const box=document.querySelector('#error');box.hidden=false;box.textContent=e.message||String(e);document.querySelector('#loading').hidden=true}
window.addEventListener('error',e=>error(e));window.addEventListener('unhandledrejection',e=>error(e.reason));window.addEventListener('pagehide',stopAudio);
function frame(now){if(playing){current=Math.min(DURATION,(now-origin)/1000);draw(current);if(current>=DURATION)pause();ui()}requestAnimationFrame(frame)}
window.seek=seek;
initFilm().then(()=>{ready=true;document.body.dataset.ready='true';[playBtn,startBtn,replayBtn,slider].forEach(e=>e.disabled=false);document.querySelector('#loading').hidden=true;seek(new URLSearchParams(location.search).get('t')||0);requestAnimationFrame(frame)}).catch(error);
