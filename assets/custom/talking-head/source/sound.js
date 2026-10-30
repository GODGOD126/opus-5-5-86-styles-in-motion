'use strict';
// Motion-led sound: Product Launch #013 weight + Glassmorphism #046 taps.
// The supplied music bed ends with the narration. The appended Mario sequence
// retains its original twenty seconds of music and effects without this bed.
window.FILM_SOUND=(()=>{
  const D=FILM_TIMING.duration,SR=48000,SPEECH_GAIN_DB=3,BGM_GAIN_DB=-10;
  let buffer,context,source,output,anchor=0,offset=0,muted=false;
  const db=v=>20*Math.log10(Math.max(1e-8,v));
  function score(k){
    const air=(t,d,g,p=0,reverse=false)=>{
      k.noise(t,{dur:d,color:'pink',filter:'bandpass',f:reverse?[[0,2100],[d*.6,750],[d,240]]:[[0,280],[d*.5,1700],[d,650]],q:.8,gain:.24*g,a:d*.34,pan:p,verb:.12});
      k.tone(t,{f:reverse?[[0,240],[d,80]]:[[0,90],[d*.55,180],[d,85]],type:'triangle',dur:d,gain:.07*g,a:d*.26,pan:p});
    };
    const glass=(t,f,g,p=0)=>{
      k.play('click',t,{f:f*1.3,gain:.8*g,pan:p});
      k.tone(t,{f,dur:.19,gain:.13*g,a:.002,pan:p,verb:.16});
      k.tone(t,{f:f*1.5,dur:.1,gain:.035*g,a:.002,pan:p});
    };
    const land=(t,g,p=0)=>{k.play('thud',t,{f:135,gain:.34*g,pan:p});glass(t+.008,860,g,p)};
    // Four distinct foreground gestures in the first 24 seconds.
    // The portrait zooms, social screenshots, labels and small card shifts stay quiet.
    k.noise(.17,{dur:.58,color:'pink',filter:'bandpass',f:[[0,380],[.2,1600],[.58,520]],q:.65,gain:.16,a:.12,pan:-.12});
    k.tone(6.99,{f:[[0,125],[.12,54]],type:'sine',dur:.24,gain:.18,a:.002,pan:.4});
    k.play('pop',6.99,{gain:.48,f:520,pan:.4});
    k.noise(13.38,{dur:.33,color:'pink',filter:'highpass',f:[[0,1800],[.33,480]],gain:.11,a:.12,pan:.2});
    k.play('tock',16.70,{f:710,dur:.09,gain:.58,pan:.55});
    // Research -> real references -> the 86-video library.
    for(const at of FILM_TIMING.pageTurns)k.play('paper',at+.08,{dur:.46,gain:.59,pan:.15});
    air(36.25,.60,.55,.15,true);
    air(43.733,1.15,.9);land(47.27,.9);
    k.play('paper',50.32,{dur:.24,gain:.52,pan:-.2});
    air(54.23,.56,.54,.4);land(57.60,.72);
    air(59.47,.68,.67,.2);glass(60.33,920,.45);
    // Each tooth crosses the central pointer at the same time as this click.
    FILM_TIMING.carousel.ticks.forEach((at,i)=>{
      k.play('tock',at,{f:1500-i*38,dur:.038,gain:.38+i*.009,pan:.22});
    });
    k.play('select',FILM_TIMING.carousel.end,{gain:.48,pan:.22});
    // Package formation, then deliberate UI clicks tied to the cursor.
    air(68.40,1.25,.77,0,true);land(70.35,.85);
    air(75.25,.62,.62,.2);
    for(const at of [76.62,79.60,83.63,89.65,92.10,109.10])k.play('click',at,{f:1300,dur:.065,gain:.48,pan:.35});
    glass(94.90,970,.54,.3);
    for(const at of [95.4,99.43,103.2])air(at,.38,.56,.25);
    land(114.48,.82,.45);
    air(115.30,.65,.70,.15);glass(115.95,900,.52,.2);
    k.play('click',122.20,{f:1100,gain:.45,pan:.2});
    k.tone(125.92,{f:660,type:'sine',dur:.28,gain:.065,a:.012,pan:-.35});
  }
  async function prepare(){
    document.body.dataset.audioReady='loading';
    const frames=Math.ceil(D*SR),ctx=new OfflineAudioContext(2,frames,SR);
    const [fx,narration,mario,bgm]=await Promise.all([
      SOUND.renderOffline(score,D,SR,{master:1,voiceover:false}),
      fetch('assets/narration.wav').then(r=>{if(!r.ok)throw new Error('口播音轨加载失败');return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b)),
      fetch('assets/mario-full.wav').then(r=>{if(!r.ok)throw new Error('马里奥完整原声加载失败');return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b)),
      fetch('assets/bgm-voice-bed.wav').then(r=>{if(!r.ok)throw new Error('背景音乐加载失败');return r.arrayBuffer()}).then(b=>ctx.decodeAudioData(b))
    ]);
    // Thicken the moving air and glass tails as well as the transient peaks.
    const fxCtx=new OfflineAudioContext(2,frames,SR),raw=fxCtx.createBuffer(2,frames,SR);
    for(let ch=0;ch<2;ch++){const d=raw.getChannelData(ch);for(let i=0;i<frames;i++)d[i]=fx.inter[i*2+ch]}
    const fxSource=fxCtx.createBufferSource(),drive=fxCtx.createGain(),fxComp=fxCtx.createDynamicsCompressor();
    fxSource.buffer=raw;drive.gain.value=3;
    fxComp.threshold.value=-16;fxComp.knee.value=6;fxComp.ratio.value=5;fxComp.attack.value=.003;fxComp.release.value=.07;
    fxSource.connect(drive);drive.connect(fxComp);fxComp.connect(fxCtx.destination);fxSource.start();
    const compressed=await fxCtx.startRendering();let compressedPeak=0;
    for(let ch=0;ch<2;ch++)for(const v of compressed.getChannelData(ch))compressedPeak=Math.max(compressedPeak,Math.abs(v));
    const fxTarget=.68,boost=fxTarget/Math.max(compressedPeak,.001),fxBuffer=ctx.createBuffer(2,frames,SR);
    let fxSum=0,active=0;
    for(let ch=0;ch<2;ch++){
      const d=fxBuffer.getChannelData(ch);
      for(let i=0;i<frames;i++){
        d[i]=compressed.getChannelData(ch)[i]*boost*Math.min(1,(frames-1-i)/1920);
        if(Math.abs(d[i])>.005){fxSum+=d[i]*d[i];active++}
      }
    }
    const speech=ctx.createBufferSource(),effects=ctx.createBufferSource(),music=ctx.createBufferSource(),speechGain=ctx.createGain(),musicGain=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
    speech.buffer=narration;effects.buffer=fxBuffer;speechGain.gain.value=10**(SPEECH_GAIN_DB/20);
    musicGain.gain.value=10**(BGM_GAIN_DB/20);
    limiter.threshold.value=-4;limiter.knee.value=4;limiter.ratio.value=12;limiter.attack.value=.001;limiter.release.value=.07;
    speech.connect(speechGain);speechGain.connect(limiter);effects.connect(limiter);music.buffer=bgm;music.connect(musicGain);musicGain.connect(limiter);limiter.connect(ctx.destination);
    music.start(0);music.stop(FILM_TIMING.narrationEnd);
    const outro=ctx.createBufferSource();outro.buffer=mario;outro.connect(ctx.destination);outro.start(FILM_TIMING.outroStart);
    speech.start(0);effects.start(0);buffer=await ctx.startRendering();
    let peak=0;for(let ch=0;ch<2;ch++)for(const v of buffer.getChannelData(ch))peak=Math.max(peak,Math.abs(v));
    const scale=Math.min(1,.95/Math.max(peak,.001));
    if(scale<1)for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]*=scale}
    let bgmSum=0,mixSum=0;const narrationFrames=Math.min(frames,Math.round(FILM_TIMING.narrationEnd*SR));
    for(let ch=0;ch<2;ch++){for(const v of bgm.getChannelData(ch))bgmSum+=v*v;const d=buffer.getChannelData(ch);for(let i=0;i<narrationFrames;i++)mixSum+=d[i]*d[i]}
    Object.assign(document.body.dataset,{audioReady:'true',speechGainDb:db(speechGain.gain.value).toFixed(2),sfxPeakDb:db(fxTarget).toFixed(2),sfxActiveRmsDb:db(Math.sqrt(fxSum/active)).toFixed(2),mixPeakDb:db(peak*scale).toFixed(2),bgmStemMeanDb:db(Math.sqrt(bgmSum/(bgm.length*2))).toFixed(2),bgmGainDb:db(musicGain.gain.value).toFixed(2),bgmTrackMeanDb:db(Math.sqrt(bgmSum/(bgm.length*2))*musicGain.gain.value).toFixed(2),bgmEndsAt:String(FILM_TIMING.narrationEnd),narrationMixMeanDb:db(Math.sqrt(mixSum/(narrationFrames*2))).toFixed(2),masterTrimDb:db(scale).toFixed(2)});
  }
  async function unlock(){
    if(!context){context=new AudioContext();output=context.createGain();output.gain.value=muted?0:1;output.connect(context.destination)}
    if(context.state!=='running')await context.resume();
  }
  function stop(){if(source){try{source.stop()}catch{}source.disconnect();source=null}document.body.dataset.audioPlaying='false'}
  function start(time){
    stop();if(!buffer||!context||time>=D)return;
    source=context.createBufferSource();source.buffer=buffer;source.connect(output);offset=Math.max(0,time);anchor=context.currentTime;source.start(anchor,offset);
    document.body.dataset.audioPlaying='true';
  }
  function follow(time){
    if(!source||!context)return;
    const drift=offset+context.currentTime-anchor-time;
    document.body.dataset.audioDriftMs=(drift*1000).toFixed(1);
    if(Math.abs(drift)>.10)start(time);
  }
  function setMuted(value){muted=value;if(output)output.gain.setTargetAtTime(muted?0:1,context.currentTime,.012)}
  window.addEventListener('pagehide',()=>{stop();context?.close()});
  function time(){return source&&context?offset+context.currentTime-anchor:offset}
  function getBuffer(){if(!buffer)throw Error('Audio is not prepared');return buffer}
  return {prepare,unlock,start,stop,follow,setMuted,time,getBuffer};
})();
