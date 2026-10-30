export const DURATION=20,BPM=160,BEAT=60/BPM,BEAT0=.011;
export const at=n=>BEAT0+n*BEAT;
export const CUE={add:at(3),drop:at(8),grab:at(10),scrubEnd:at(13),cut:at(16),push:at(18.5),snap:at(20),fx:at(23),text:at(25),captionGrab:at(27),captionDrop:at(30),transition:at(32),volumeGrab:at(37),volumeEnd:at(39),play:at(42),flagRaise:at(42.5),flagGrab:at(46),flagSlide:at(46.5),export:at(46.5),finish:at(52)};
export const FLAG={x:12.8,z:-6.1,top:5.75,bottom:.45,gripOffset:1.70};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const win=(t,a,b)=>clamp((t-a)/(b-a));
export const smooth=x=>x*x*(3-2*x);
export const mix=(a,b,u)=>a+(b-a)*u;
export const ease=(t,a,b)=>smooth(win(t,a,b));
export const punch=(t,a,d=.28)=>{const u=(t-a)/d;return u<0||u>1?0:Math.sin(u*Math.PI)*Math.exp(-u*2)};
const P={start:[-12.65,.2,1.4],run:[-11.8,.2,-.6],add:[-10,1.00,-3.65],pull0:[-8,.2,.5],pull1:[-6,.2,4.95],head0:[-8.92,.2,1.55],head1:[-2.12,.2,1.55],cut:[2.8,.98,.35],push0:[9.35,.2,3.6],push1:[6.35,.2,3.6],fx:[-.2,.98,.35],text:[-2.8,.98,.35],caption0:[-2.8,.68,5.8],caption1:[.2,.68,5.8],transition:[-5.4,.98,.35],seam:[-1.3,1.05,3.6],volume0:[10.3,.56,4.1],volume1:[10.3,.56,5.4],play:[5.55,.98,.35],flag:[FLAG.x-.85,FLAG.top,FLAG.z+.32]};
const jump=(a,b,f,to,h,y0,y1)=>({a:at(a),b:at(b),from:P[f],to:P[to],h,y0,y1,mode:'jump'});
export const JUMPS=[
 jump(1,3,'run','add',2.8,2.74,.4),jump(3.5,5,'add','pull0',2.4,.4,Math.PI),
 jump(8.5,10,'pull1','head0',1.8,Math.PI,Math.PI/2),jump(13.5,16,'head1','cut',3.1,Math.PI/2,-.4),
 jump(16.5,18,'cut','push0',2.7,-.4,-Math.PI/2),jump(20.5,23,'push1','fx',3.0,-Math.PI/2,.3),
 jump(23.5,25,'fx','text',1.7,.3,.3),jump(25.5,27,'text','caption0',2.2,.3,0),
 jump(30.5,32,'caption1','transition',3.0,Math.PI/2,.3),jump(32.5,34,'transition','seam',2.4,.3,Math.PI/2),
 jump(34.5,37,'seam','volume0',3.3,Math.PI/2,0),jump(39.5,42,'volume1','play',3.0,0,.4),
 {...jump(43,46,'play','flag',2.2,.4,Math.PI/2),grip:true}
];
const walk=(a,b,f,to,mode,yaw)=>({a:at(a),b:at(b),from:P[f],to:P[to],mode,yaw});
export const WALKS=[walk(0,1,'start','run','run',2.74),walk(5,8,'pull0','pull1','pull',Math.PI),walk(10,13,'head0','head1','scrub',Math.PI/2),walk(18.5,20,'push0','push1','push',-Math.PI/2),walk(27,30,'caption0','caption1','caption',Math.PI/2),walk(37,39,'volume0','volume1','volume',0)];
const moves=[...WALKS,...JUMPS].sort((a,b)=>a.a-b.a);
const turn=(a,b,u)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u;
export function stateAt(t){
 t=clamp(t,0,DURATION);let p=[...P.start],yaw=2.74,pose='idle',run=0,drag=0,push=0,air=0,squash=0;
 for(const m of moves){if(t<m.a)break;if(t>=m.b){p=[...m.to];yaw=m.mode==='jump'?m.y1:m.yaw;pose='idle';continue;}const u=win(t,m.a,m.b);pose=m.mode;p=m.from.map((v,k)=>mix(v,m.to[k],m.mode==='jump'?u:smooth(u)));if(m.mode==='jump'){p[1]+=4*m.h*u*(1-u);const dir=Math.atan2(m.to[0]-m.from[0],m.to[2]-m.from[2]);yaw=turn(m.y0,dir,smooth(clamp(u/.25)));yaw=turn(yaw,m.y1,smooth(clamp((u-.52)/.48)));air=Math.sin(u*Math.PI);}else{yaw=m.yaw;run=m.mode==='run'?1:.8;drag=['pull','scrub','caption','volume'].includes(m.mode)?1:0;push=m.mode==='push'?1:0;}break;}
 for(const j of JUMPS){if(!j.grip)squash+=punch(t,j.b,BEAT*.7)*.48;if(t>=j.a-BEAT/4&&t<j.a)squash+=win(t,j.a-BEAT/4,j.a)*.18;}
 const exportProgress=ease(t,CUE.flagSlide,CUE.finish),celebrate=ease(t,CUE.finish,CUE.finish+BEAT*.8);
 if(t>=CUE.flagGrab){p=[FLAG.x-.85,mix(FLAG.top,FLAG.bottom,exportProgress),FLAG.z+.32];yaw=mix(Math.PI/2,.48,celebrate);pose=t<CUE.finish?'flag-slide':'celebrate';run=0;air=0;squash=punch(t,CUE.finish,BEAT*.7)*.22;}
 const tileMove=ease(t,at(5),CUE.drop),scrub=ease(t,CUE.grab,CUE.scrubEnd),slide=ease(t,CUE.push,CUE.snap),playProgress=ease(t,CUE.play,CUE.finish);
 const head=t<CUE.play?mix(-8.2,-1.4,scrub):mix(-9,5.6,playProgress);
 const event=t<CUE.add?'踩加号，添加素材':t<CUE.drop?'拉入素材':t<CUE.scrubEnd?'快速定位播放头':t<CUE.cut+.3?'踩下切片':t<CUE.snap?'推拢片段':t<CUE.fx?'跃向特效按钮':t<CUE.text?'添加画面特效':t<CUE.captionDrop?'添加并移动字幕':t<CUE.transition?'跃向转场按钮':t<CUE.volumeGrab?'添加转场':t<CUE.volumeEnd?'调节音量':t<CUE.play?'跃向播放按钮':t<CUE.flagRaise?'播放剪辑结果':t<CUE.flagGrab?'跳向旗杆顶部':t<CUE.flagSlide?'抓稳旗杆':t<CUE.finish?'滑下旗杆，导出成片':'导出完成';
 return{t,p,yaw,pose,run,drag,push,air,squash,tileMove,scrub,slide,head,playProgress,cut:t>=CUE.cut,imported:t>=CUE.add,landed:t>=CUE.drop,fx:ease(t,CUE.fx,CUE.fx+BEAT),caption:ease(t,CUE.captionGrab,CUE.captionDrop),captionVisible:t>=CUE.text,transition:ease(t,CUE.transition,CUE.transition+2*BEAT),volume:ease(t,CUE.volumeGrab,CUE.volumeEnd),exportProgress,flagY:mix(FLAG.top,FLAG.bottom,exportProgress)+FLAG.gripOffset,celebrate,event};
}
