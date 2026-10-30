import {BEAT,BEAT0,CUE,JUMPS,WALKS,DURATION,at} from './timing.js';
// Music: Pinball Spring 160, Kevin MacLeod. CC BY 4.0 attribution: assets/music-credits.txt.
// Only foreground action sounds are synthesized; the animation follows the measured recording.
export function scoreSound(k){
 const pan=x=>Math.max(-.65,Math.min(.65,x/18));
 for(const j of JUMPS){
  k.tone(j.a,{f:[[0,270],[.12,620],[.22,920]],type:'triangle',dur:.24,gain:.20,a:.002,pan:pan(j.from[0])});
  k.noise(j.a,{dur:.10,filter:'bandpass',f:[[0,900],[.1,1900]],q:.8,gain:.055,a:.02,pan:pan(j.from[0])});
  if(!j.grip)k.play('thud',j.b,{gain:.37,f:160,pan:pan(j.to[0])});k.play('click',j.b+.005,{gain:.50,pan:pan(j.to[0])});
 }
 for(const m of WALKS)for(let t=m.a;t<m.b-.01;t+=BEAT/2)k.play('tock',t,{gain:.15,f:480+(Math.round((t-BEAT0)/BEAT*2)%2)*160,pan:pan(m.from[0])});
 k.play('select',CUE.add,{gain:.95});[3.5,4,4.5].forEach(n=>k.play('pop',at(n),{gain:.35}));
 k.noise(at(5),{dur:CUE.drop-at(5),filter:'bandpass',f:1100,q:1.4,gain:.06,a:.1,hold:.5,pan:-.25});
 k.play('stamp',CUE.drop,{gain:.50});k.play('select',CUE.drop+.045,{gain:.65});
 for(let n=10;n<13;n+=.5)k.play('tick',at(n),{gain:.24,f:2100+(n-10)*250});
 k.noise(CUE.cut,{dur:.045,filter:'highpass',f:4300,gain:.34});k.play('stamp',CUE.cut,{gain:.55});
 k.noise(CUE.push,{dur:CUE.snap-CUE.push,filter:'bandpass',f:700,q:1.4,gain:.06,a:.08,pan:.2});k.play('coin',CUE.snap,{gain:.85});
 k.play('sparkle',CUE.fx,{gain:.75,n:5});k.play('whoosh',CUE.fx,{gain:.23,dur:BEAT});
 k.play('typing',CUE.text,{gain:.52,n:4,rate:BEAT/4});k.play('click',CUE.captionDrop,{gain:.8});
 k.play('swish',CUE.transition,{gain:.8,dur:BEAT});k.play('ding',CUE.transition+BEAT,{gain:.22,f:'A5'});
 for(let n=37;n<=39;n+=.5)k.play('tick',at(n),{gain:.27,f:1800+(n-37)*500});
 k.play('select',CUE.play,{gain:.9});k.play('coin',CUE.flagGrab,{gain:.75,pan:.55});
 const descent=CUE.finish-CUE.flagSlide;
 k.tone(CUE.flagSlide,{f:[[0,980],[descent,180]],type:'triangle',dur:descent,gain:.055,a:.04,pan:.55});
 k.noise(CUE.flagSlide,{dur:descent,filter:'bandpass',f:[[0,1450],[descent,550]],q:.8,gain:.035,a:.08,pan:.55});
 for(let n=47;n<52;n++)k.play('count',at(n),{gain:.20,f:2300+(n-47)*160,pan:.55});
 k.play('thud',CUE.finish,{gain:.30,f:180,pan:.55});
 k.play('success',CUE.finish,{gain:.55,f:'D5'});
}
export async function createScore(context){
 const [r,musicData]=await Promise.all([window.SOUND.renderOffline(scoreSound,DURATION,48000,{master:.72}),fetch('./assets/music.mp3').then(x=>{if(!x.ok)throw new Error('Music unavailable');return x.arrayBuffer();})]);
 const music=await context.decodeAudioData(musicData);const b=context.createBuffer(2,r.frames,r.sr);
 let peak=0,sum=0;
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch),m=music.getChannelData(Math.min(ch,music.numberOfChannels-1));for(let i=0;i<r.frames;i++){const v=r.inter[i*2+ch]+(m[i]||0)*.90;d[i]=v;peak=Math.max(peak,Math.abs(v));}}
 const gain=Math.min(1,.94/Math.max(peak,.001));peak=0;
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<r.frames;i++){d[i]*=gain*Math.min(1,(r.frames-1-i)/2400);peak=Math.max(peak,Math.abs(d[i]));sum+=d[i]*d[i];}}
 return {buffer:b,peak,rms:Math.sqrt(sum/(r.frames*2)),music:'Pinball Spring 160 — Kevin MacLeod'};
}
