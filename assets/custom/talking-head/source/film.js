'use strict';
const $=s=>document.querySelector(s),canvas=$('#film'),c=canvas.getContext('2d'),voice=$('#presenter'),ref=$('#reference');
const W=1920,H=1080,DURATION=FILM_TIMING.duration,EXPORT_MODE=new URLSearchParams(location.search).has('export'),cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,p)=>a+(b-a)*p;
const smooth=(a,b,t)=>{const u=cl((t-a)/(b-a));return u*u*(3-2*u)},out=u=>1-(1-cl(u))**3,back=u=>{u=cl(u);return 1+2.70158*(u-1)**3+1.70158*(u-1)**2};
const tracks=[['anthropic','Anthropic','商业讲解'],['journey','西游记','水墨叙事'],['occam','奥卡姆剃刀','知识科普'],['blackhole','黑洞','浮世绘'],['weight','减肥的真相','等距动画'],['mario','马里奥剪辑台','3D 动效']];
const cachedWorks={2:$('#occamPreview'),5:$('#marioPreview')},cachedVideos=Object.values(cachedWorks),cachedFrames={2:document.createElement('canvas'),5:document.createElement('canvas')};
const storyVideos=[$('#atlasMotion'),$('#styleReference'),$('#marioFull')],previewVideos=[...cachedVideos,...storyVideos];
let running=false,ready=false,t=0,subs=true,soundOn=true,workFrame=0,pendingSeek=0;const errors=[],engines=[],engineSlots=[];
let perfStart=0,perfPaints=0,perfCounts=Array(6).fill(0),perfRenderMs=Array(6).fill(0);
const heldVoice=document.createElement('canvas'),heldRef=document.createElement('canvas');
function videoFrame(v,held){if(v.readyState>=2){if(held.width!==v.videoWidth||held.height!==v.videoHeight){held.width=v.videoWidth;held.height=v.videoHeight}held.getContext('2d').drawImage(v,0,0);held.dataset.ready='true'}return held.dataset.ready?held:null}
function rr(x,y,w,h,r=20){c.beginPath();c.roundRect(x,y,w,h,r)}
function box(x,y,w,h,r,fill,shadow=0){c.save();c.fillStyle=fill;if(shadow){c.shadowColor='#24231e26';c.shadowBlur=shadow;c.shadowOffsetY=shadow*.36}rr(x,y,w,h,r);c.fill();c.restore()}
function text(s,x,y,size=32,color='#292b2b',weight=500,align='left'){c.fillStyle=color;c.font=`${weight} ${size}px FilmHei, "Microsoft YaHei", sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y)}
function displayText(s,x,y,size,color,align='left'){c.save();c.fillStyle=c.strokeStyle=color;c.font=`700 ${size}px FilmRound, "Microsoft YaHei", sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=size*.035;c.strokeText(s,x,y);c.fillText(s,x,y);c.restore()}
function line(x,y,x2,y2,color='#8c8e8d',width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()}
function star(x,y,size,color){c.save();c.translate(x,y);c.strokeStyle=color;c.lineCap='round';c.lineWidth=size*.12;for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.beginPath();c.moveTo(size*.13,0);c.lineTo(size*.48,0);c.stroke()}c.restore()}
function apple(x,y,s){c.save();c.translate(x,y);c.scale(s/30,s/30);c.fillStyle='#252625';c.beginPath();c.moveTo(16,6);c.bezierCurveTo(9,-1,-1,5,2,18);c.bezierCurveTo(5,31,11,30,15,27);c.bezierCurveTo(20,30,26,29,29,19);c.bezierCurveTo(20,16,21,8,28,6);c.bezierCurveTo(24,1,20,2,16,6);c.fill();c.beginPath();c.ellipse(18,-2,3,7,.6,0,7);c.fill();c.restore()}
function macBar(alpha=1){c.save();c.globalAlpha=alpha;box(0,0,W,43,0,'#ffffffa8');apple(28,12,20);text('Finder',79,23,21,'#252625',700);['文件','编辑','显示','前往','窗口','帮助'].forEach((v,i)=>text(v,175+i*70,23,20));text('10月27日 周二  09:41',1880,23,20,'#424442',500,'right');line(0,43,W,43,'#ffffff99',1);c.restore()}

// A continuous glass rim; no window title, traffic lights or opaque header.
function glassFrame(w,h){
  const x=-w/2,y=-h/2,r=27;
  c.save();
  box(x,y,w,h,r,'#d6e2e226',30);
  const body=c.createLinearGradient(x,y,x+w,y+h);
  body.addColorStop(0,'#fffffff2');body.addColorStop(.22,'#e4effb88');
  body.addColorStop(.48,'#ffffff45');body.addColorStop(.74,'#b3c5d26b');body.addColorStop(1,'#fffffff0');
  box(x,y,w,h,r,body);
  const edge=c.createLinearGradient(x,y,x+w*.75,y+h);
  edge.addColorStop(0,'#ffffff');edge.addColorStop(.35,'#ffffffa8');edge.addColorStop(.62,'#92a4ba70');edge.addColorStop(1,'#ffffffef');
  c.lineWidth=2; c.strokeStyle=edge;rr(x+1,y+1,w-2,h-2,r-1);c.stroke();
  c.strokeStyle='#ffffff60';c.lineWidth=1;rr(x+5,y+5,w-10,h-10,r-5);c.stroke();
  c.strokeStyle='#5365772b';rr(x+9,y+9,w-18,h-18,r-9);c.stroke();
  // Narrow reflected arcs make the rim read as glass at small preview sizes.
  c.lineCap='round';c.strokeStyle='#ffffffed';c.lineWidth=2.6;
  c.beginPath();c.moveTo(x+12,y+31);c.quadraticCurveTo(x+12,y+5,x+40,y+5);c.lineTo(x+w*.41,y+5);c.stroke();
  c.strokeStyle='#e4f2ffdb';c.lineWidth=2;
  c.beginPath();c.moveTo(x+w-5,y+h-44);c.quadraticCurveTo(x+w-5,y+h-5,x+w-42,y+h-5);c.lineTo(x+w*.72,y+h-5);c.stroke();
  c.restore();
}
function glassContent(w,h,draw){c.save();rr(-w/2+10,-h/2+10,w-20,h-20,18);c.clip();draw(-w/2+10,-h/2+10,w-20,h-20);c.restore()}
function workTexture(i){return cachedWorks[i]&&!EXPORT_MODE?videoFrame(cachedWorks[i],cachedFrames[i]):engines[i]?.contentDocument?.querySelector('canvas')}
function outroTexture(held){return EXPORT_MODE?workTexture(5):videoFrame($('#marioFull'),held)}
function workCard(i,x,y,w,h,angle,alpha=1){c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);glassFrame(w,h);const src=workTexture(i);if(src&&src.width)glassContent(w,h,(x,y,w,h)=>c.drawImage(src,x,y,w,h));c.restore()}
function reachTile(src,x,y,w,angle,alpha){
  if(alpha<.003||!src)return;
  c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.scale(w/300,w/300);
  glassFrame(300,177.5);glassContent(300,177.5,(x,y,w,h)=>c.drawImage(src,x,y,w,h));c.restore();
}
function playGlyph(x,y,size,alpha){
  c.save();c.globalAlpha*=alpha;c.translate(x,y);
  const fill=c.createLinearGradient(-size/2,-size/2,size/2,size/2);fill.addColorStop(0,'#ffffffec');fill.addColorStop(1,'#c6d8f989');
  box(-size/2,-size/2,size,size,size*.29,fill,10);
  c.strokeStyle='#ffffffd9';c.lineWidth=1.4;rr(-size/2,-size/2,size,size,size*.29);c.stroke();
  c.fillStyle='#5672bb';c.beginPath();c.moveTo(-size*.12,-size*.20);c.lineTo(size*.22,0);c.lineTo(-size*.12,size*.20);c.closePath();c.fill();c.restore();
}
function openingReach(t){
  const enter=smooth(3.65,4.25,t);if(enter<=0)return;
  const change=smooth(6.36,6.95,t),src=workTexture(2),cx=1450,cy=582;
  c.save();c.globalAlpha*=enter;
  // Six distinct works share one expanding composition.
  const head=smooth(4.06,4.50,t);
  c.save();c.globalAlpha*=head;c.translate(0,(1-head)*28);
  displayText('Vibe 知识大赏',cx,258,92,'#243349','center');c.restore();
  const destinations=[[0,1118,431,-.12],[1,1767,430,.12],[3,1774,749,.075],[4,1450,835,.025],[5,1118,765,-.10]];
  for(let i=0;i<destinations.length;i++){
    const q=out(cl((t-4.65-i*.11)/.76)),[work,dx,dy,rot]=destinations[i];if(q<=0)continue;
    const bx=mix(cx,dx,q),by=mix(cy,dy,q)-Math.sin(q*Math.PI)*65;
    c.save();c.globalAlpha*=.24*q*(1-change);c.strokeStyle='#879bc8';c.lineWidth=1.6;
    c.beginPath();c.moveTo(cx,cy);c.quadraticCurveTo((cx+dx)/2,Math.min(cy,dy)-80,bx,by);c.stroke();c.restore();
    reachTile(workTexture(work),bx,by,mix(104,174,q),rot*q,q*(1-change));
  }
  const grow=out(cl((t-4.12)/.55));
  reachTile(src,cx,cy-22*change,mix(380,454,grow)*(1-change*.78),-.025*(1-grow),grow*(1-change));
  // This is a typographic illustration of the spoken scale, not a platform metric.
  const hit=out(cl((t-6.43)/.56));
  if(hit>0){
    const count=Math.max(1,Math.round(1000*(1-(1-hit)**2))),settle=smooth(6.85,7.10,t);
    c.save();c.globalAlpha*=smooth(6.43,6.67,t);c.translate(cx,603);c.scale(.87+.13*hit,.87+.13*hit);
    const ink=c.createLinearGradient(-240,-100,260,110);ink.addColorStop(0,'#213759');ink.addColorStop(.55,'#445d9b');ink.addColorStop(1,'#2b477d');
    displayText(String(count)+'万',0,0,186,ink,'center');displayText('播放',0,148,52,'#455c7c','center');
    c.restore();
    // A finite wave of play tiles fans outward on the million-scale hit.
    for(let i=0;i<10;i++){
      const a=i*Math.PI*2/10-.15,q=out(cl((t-6.44-i*.025)/.72));
      const rx=340+q*62,ry=214+q*42;
      const px=cx+Math.cos(a)*rx,py=600+Math.sin(a)*ry;
      playGlyph(px,py,32+(i%3)*7,q*(.50-.22*settle));
    }
    const ring=cl((t-6.86)/.65);
    if(ring>0&&ring<1){c.save();c.globalAlpha*=(1-ring)*.26;c.strokeStyle='#7f9bcc';c.lineWidth=2;c.beginPath();c.ellipse(cx,600,280+ring*170,138+ring*125,0,0,Math.PI*2);c.stroke();c.restore()}
  }
  c.restore();
}
function opening(t,alpha){
  c.save();c.globalAlpha=alpha;
  const dolly=smooth(2.3,7.9,t);c.translate(W/2+Math.sin(t*.45)*3,H/2);
  c.scale(1+dolly*.016,1+dolly*.016);c.translate(-W/2,-H/2);
  for(const i of [5,4,3,2,1,0]){
    const u=cl((t-.17-i*.115)/.88),p=back(u);
    const x0=1010+(i-2.5)*14,y0=500+(i-2.5)*10,xf=326+(i%3)*634,yf=320+Math.floor(i/3)*430;
    let x=mix(x0,xf,p),y=mix(y0,yf,p)-Math.sin(u*Math.PI)*(135+(i%2)*35);
    let scale=mix(.86,1,p),a=mix((i-2.5)*.065,0,p),opacity=1;
    if(i===1||i===4){
      const leave=smooth(2.82,3.48,t);opacity=1-leave;scale*=1-leave*.28;y+=(i===1?-1:1)*leave*110;
    }else{
      const shift=smooth(i%3===2?3.04:2.90,4.04,t),right=i%3===2;
      x=mix(x,right?758:286,shift);y=mix(y,i<3?330:714,shift);scale*=mix(1,444/620,shift);
    }
    if(opacity>.003)workCard(i,x,y,620*scale,(620*scale-20)*9/16+20,a,opacity);
  }
  openingReach(t);
  c.restore();
}
function portraitRect(t){const toFull=smooth(7.85,8.68,t),toSmall=smooth(13.05,13.8,t),p=Math.max(toFull*(1-toSmall),smooth(123.30,124.2,t));return {x:mix(48,0,p),y:mix(667,0,p),w:mix(310,W,p),h:mix(365,H,p),r:mix(30,0,p),p}}
function presenter(t){const alpha=1-smooth(129.033,129.55,t);if(!alpha)return;c.save();c.globalAlpha*=alpha;const q=portraitRect(t);box(q.x,q.y,q.w,q.h,q.r,'#222',q.p<.98?32:0);const frame=videoFrame(voice,heldVoice);if(frame){c.save();rr(q.x,q.y,q.w,q.h,q.r);c.clip();const p=q.p;const sh=mix(frame.height*660/720,frame.height,p),sw=Math.min(frame.width,sh*q.w/q.h),sx=(frame.width-sw)/2,sy=(frame.height-sh)/2;c.drawImage(frame,sx,sy,sw,sh,q.x,q.y,q.w,q.h);c.restore()}c.restore()}
function social(t){
  const exit=smooth(12.95,13.65,t),places=[[200,303,-.075],[430,725,.06],[1703,295,.075],[1475,727,-.055]];
  for(let i=0;i<4;i++){
    const u=cl((t-10.03-i*.18)/.55);if(!u||exit>=1)continue;
    // Crop only the white perimeter of the first screenshot, retaining its heart count.
    const crop=i===0?4:0,img=images[i],sw=img.width-crop*2,sh=img.height-crop*2;
    const p=out(u),[x,y,a]=places[i],w=282,h=w*sh/sw;
    c.save();c.globalAlpha=cl(u*2)*(1-exit);
    c.translate(x+(i<2?-1:1)*(1-p)*160+(x-960)*exit*.6,y+(1-p)*65-exit*300);
    c.rotate(a*p+exit*(i<2?-.2:.2));c.scale(mix(.86,1,p),mix(.86,1,p));
    box(-w/2,-h/2,w,h,18,'#16181c',32);rr(-w/2,-h/2,w,h,18);c.clip();
    c.drawImage(img,crop,crop,sw,sh,-w/2,-h/2,w,h);c.restore();
  }
}

function dot(x,y,r,color,glow=0){c.save();c.fillStyle=color;if(glow){c.shadowBlur=glow;c.shadowColor=color}c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore()}
function eight(x,y,size,color,weight=4,tilt=0){
  c.save();c.translate(x,y);c.rotate(tilt);c.scale(size/80,size/80);
  c.strokeStyle=color;c.lineWidth=weight;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-42,-17,-27,-53,2,-38);c.bezierCurveTo(35,-20,25,-6,0,0);
  c.bezierCurveTo(-35,12,-31,45,1,40);c.bezierCurveTo(40,35,29,9,0,0);c.stroke();c.restore();
}
function learningDemo(t,x,y,w,h){
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.translate(x,y);c.scale(w/720,h/405);
  const bg=c.createLinearGradient(0,0,720,405);bg.addColorStop(0,'#192132');bg.addColorStop(1,'#0a0e1b');
  c.fillStyle=bg;c.fillRect(0,0,720,405);
  const glow=c.createRadialGradient(395,223,10,395,223,290);glow.addColorStop(0,'#6062b62e');glow.addColorStop(1,'#14192700');c.fillStyle=glow;c.fillRect(0,0,720,405);
  for(let xx=28;xx<720;xx+=28)for(let yy=96;yy<405;yy+=28)dot(xx,yy,.7,'#afc5ef1c');
  text('AI 如何学习？',34,42,30,'#f5f7ff',650);line(34,77,686,77,'#c3d4f31e',1);
  const reveal=smooth(16.22,17.1,t),learn=smooth(17.1,20.3,t),result=smooth(19.25,20.15,t);
  c.save();c.globalAlpha=reveal;c.translate((1-reveal)*-35,0);
  for(let i=2;i>=0;i--){
    c.save();c.translate(112+i*12,223-i*13);c.rotate((i-1)*.075);
    box(-48,-66,96,132,13,i===0?'#263649':'#263045',i===0?12:0);
    c.strokeStyle=i===0?'#b0cafa83':'#7d8fb14f';c.lineWidth=1;rr(-48,-66,96,132,13);c.stroke();
    if(i===0){for(let xx=-35;xx<40;xx+=10)line(xx,-53,xx,53,'#c2dcff0a',1);for(let yy=-53;yy<55;yy+=10)line(-35,yy,35,yy,'#c2dcff0a',1)}
    eight(0,0,76,i===0?'#e5eaff':'#91a9ce',3.3,-.13+i*.11);c.restore();
  }
  c.restore();
  const layers=[[270,152,199,246,293],[366,128,175,222,269,316],[462,152,199,246,293]];
  for(let k=0;k<2;k++){
    const a=layers[k],b=layers[k+1];
    for(let i=1;i<a.length;i++)for(let j=1;j<b.length;j++){
      const strong=(i+j+k)%3===0;
      line(a[0],a[i],b[0],b[j],strong?`rgba(127,160,244,${.11+learn*.47})`:'#99b5e316',strong?1.4:1);
      const ph=((t-17.1)*.7-i*.08-j*.035-k*.23)%1;
      if(ph>=0&&strong&&t>17.1+k*.25&&t<20.6){dot(mix(a[0],b[0],ph),mix(a[i],b[j],ph),2.6,'#bad5ff',11)}
    }
  }
  const packet=cl((t-16.95)/.7);
  line(171,223,238,223,'#b6d4ff65',1.5);
  if(packet>0&&packet<1)dot(mix(171,238,packet),223,4,'#d1dcff',17);
  for(let k=0;k<layers.length;k++){
    const layer=layers[k];for(let i=1;i<layer.length;i++){
      const on=smooth(17.15+k*.42+i*.04,17.72+k*.42+i*.04,t),pulse=(Math.sin(t*4.2-i*.9-k)+1)/2;
      dot(layer[0],layer[i],12,'#111a2b');
      c.strokeStyle=`rgba(167,191,248,${.3+on*.4})`;c.lineWidth=1.5;c.beginPath();c.arc(layer[0],layer[i],12,0,7);c.stroke();
      dot(layer[0],layer[i],5+on*1.4,on>.3?'#b3c7ff':'#4d6084',on*(8+pulse*8));
    }
  }
  c.save();c.globalAlpha=.28+result*.72;
  const ox=611,oy=223;
  box(ox-52,oy-70,104,140,21,'#202f4080',10);
  const outline=c.createLinearGradient(ox-50,oy-70,ox+50,oy+70);outline.addColorStop(0,'#c4e4ffb3');outline.addColorStop(1,'#86b7ea30');
  c.strokeStyle=outline;c.lineWidth=1.4;rr(ox-52,oy-70,104,140,21);c.stroke();
  eight(ox,oy,76,'#c8e9ff',4);
  c.restore();
  for(let i=1;i<layers[2].length;i++)line(475,layers[2][i],556,223,`rgba(148,210,245,${.1+result*.45})`,1.4);
  if(result>0&&result<1)dot(mix(475,556,result),223,4,'#c0f0ff',16);
  // A returning signal links the prediction back to the examples.
  c.save();c.globalAlpha=learn*.6;c.strokeStyle='#8aabdf';c.lineWidth=1.2;c.setLineDash([4,7]);c.lineDashOffset=-t*14;
  c.beginPath();c.moveTo(610,304);c.bezierCurveTo(610,369,112,369,112,300);c.stroke();c.restore();
  c.restore();
}
function toolBadge(label,x,y,w,at,color){
  const p=out(cl((t-at)/.45));if(!p)return;
  c.save();c.globalAlpha*=p;c.translate(x,y+(1-p)*20);c.scale(.93+.07*p,.93+.07*p);
  const fill=c.createLinearGradient(-w/2,-32,w/2,32);fill.addColorStop(0,'#ffffffeb');fill.addColorStop(1,'#e3edf5b5');
  box(-w/2,-32,w,64,22,fill,14);c.strokeStyle='#ffffff';c.lineWidth=1.5;rr(-w/2,-32,w,64,22);c.stroke();
  box(-w/2+13,-19,38,38,12,color);
  c.strokeStyle='#ffffffd9';c.lineWidth=1.6;rr(-w/2+21,-11,16,16,3);c.stroke();rr(-w/2+26,-6,16,16,3);c.stroke();
  text(label,-w/2+64,1,27,'#253450',650);c.restore();
}
function comparison(t){
  const enter=smooth(13.16,13.85,t),split=smooth(15.8,16.7,t);if(enter<=0)return;
  c.save();c.globalAlpha=enter*(1-smooth(23.65,24.45,t));
  const xx=mix(1128,784,split),yy=mix(598,608,split),w=mix(1190,718,split),h=(w-20)*9/16+20,headerY=yy-h/2-74;
  c.save();c.translate(xx+(1-enter)*160,yy+(1-enter)*75);c.scale(.95+.05*enter,.95+.05*enter);glassFrame(w,h);
  const frame=videoFrame(ref,heldRef);if(frame)glassContent(w,h,(x,y,w,h)=>c.drawImage(frame,x,y,w,h));c.restore();
  star(xx-240,headerY,62,'#cb8065');text('Claude Opus 5.5',xx-190,headerY,50,'#242626',650);
  if(split>0){
    const rx=1528+(1-split)*420,rw=718,rh=(rw-20)*9/16+20;
    c.save();c.globalAlpha*=split;c.translate(rx,yy);glassFrame(rw,rh);glassContent(rw,rh,(x,y,w,h)=>learningDemo(t,x,y,w,h));c.restore();
    c.save();c.globalAlpha*=split;
    c.drawImage(codexLogo,rx-146,headerY-42,84,84);text('Codex',rx-43,headerY,50,'#242626',650);
    toolBadge('HyperFrames',rx-132,894,260,17.93,'#5262c1');
    toolBadge('Remotion',rx+135,894,234,19.02,'#3b88dc');
    c.restore();
  }
  c.restore();
}
function updateEngines(t,force=false){
  for(let i=0;i<engines.length;i++){
    if(cachedWorks[i]){
      if(!EXPORT_MODE)continue;
      const win=engines[i].contentWindow,atOutro=i===5&&t>=129.033,cacheTime=atOutro?0:LATER.mediaTime(cachedWorks[i],t);
      if(cacheTime===null)continue;
      const sample=atOutro?cl(t-FILM_TIMING.outroStart,0,19.999):(3.8+cacheTime*.8+i*.72)%Math.min(18,win.DURATION-1);
      if(i===5)win.renderFrame(sample);else win.seek(sample);
      continue;
    }
    const later=t>8.8?LATER.engineTime(i,t):null;
    if(t>8.8&&later===null)continue;
    // The two departing cards return in the smaller spread only during this beat.
    if(t<=8.8&&t>=3.5&&(i===1||i===4)&&(t<4.65||t>=6.95))continue;
    // Phase the six 30 fps streams across display refreshes, rather than giving
    // each card only one turn every six frames.
    const slot=Math.floor(t*30+i/6);if(!force&&engineSlots[i]===slot)continue;engineSlots[i]=slot;
    const win=engines[i].contentWindow,begin=performance.now();
    try{const sampleTime=later===null?(3.8+t*.8+i*.72)%Math.min(18,win.DURATION-1):later;win.seek(sampleTime)}
    catch(e){if(!errors.includes(e.message))errors.push(e.message)}
    if(running&&!force){perfCounts[i]++;perfRenderMs[i]+=performance.now()-begin}
  }
  workFrame++;
  if(running&&!force){
    perfPaints++;const secs=(performance.now()-perfStart)/1000;
    if(secs>.5){canvas.dataset.previewFps=(perfPaints/secs).toFixed(1);canvas.dataset.cardFps=perfCounts.map((n,i)=>cachedWorks[i]?'cached 30':(n/secs).toFixed(1)).join(',');canvas.dataset.cardRenderMs=perfCounts.map((n,i)=>(perfRenderMs[i]/Math.max(1,n)).toFixed(1)).join(',');const q=cachedWorks[5].getVideoPlaybackQuality();canvas.dataset.marioDecoded=String(q.totalVideoFrames);canvas.dataset.marioDropped=String(q.droppedVideoFrames)}
  }
}
function paint(time,force=false){const began=performance.now();t=cl(time,0,DURATION);updateEngines(t,force);c.clearRect(0,0,W,H);c.drawImage(wallpaper,0,0,W,H);macBar(1-portraitRect(t).p);if(t<8.8)opening(t,1-smooth(7.95,8.6,t));if(t>=13.05&&t<24.45)comparison(t);LATER.draw(t);presenter(t);social(t);LATER.after(t);$('#clock').textContent=fmt(t)+' / '+fmt(DURATION);$('#seek').value=t;$('#caption').textContent=t>=125.35?'':window.EDIT.captions.find(q=>q.a<=t&&q.b>t)?.text||'';canvas.dataset.time=t.toFixed(3);canvas.dataset.workFrames=workFrame;canvas.dataset.errors=errors.join(' | ');canvas.dataset.frameMs=(performance.now()-began).toFixed(1)}
const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function referenceTime(t){return cl(t-12.8,0,15.4)}
function pause(){running=false;voice.pause();ref.pause();previewVideos.forEach(v=>v.pause());FILM_SOUND.stop();$('#play').textContent='播放';$('#start').hidden=t>0;paint(t)}
function activePreviews(time,force=false){const active=[];for(const v of previewVideos){const target=LATER.mediaTime(v,time);if(target===null){if(!v.paused)v.pause();continue}const atOutroEnd=v.id==='marioFull'&&time>=FILM_TIMING.outroStart+FILM_TIMING.outroDuration,tolerance=v.id==='marioFull'?.05:.16;if(!shouldPlayPreview(v,time)&&!v.paused)v.pause();if(force||(!v.seeking&&(Math.abs(v.currentTime-target)>tolerance||(atOutroEnd&&Math.abs(v.currentTime-target)>.001))))v.currentTime=target;active.push(v)}return active}
const shouldPlayPreview=(v,time)=>v.id!=='marioFull'||(time>=FILM_TIMING.outroStart&&time<FILM_TIMING.outroStart+FILM_TIMING.outroDuration);
async function play(){if(!ready)return;if(running){pause();return}if(t>=DURATION-.03)await seek(0);try{const active=activePreviews(t,true),hasVoice=t<FILM_TIMING.narrationEnd-.02;await Promise.all([hasVoice?voice.play():Promise.resolve(),FILM_SOUND.unlock(),...active.filter(v=>shouldPlayPreview(v,t)).map(v=>v.play())]);if(hasVoice)t=voice.currentTime;running=true;perfStart=performance.now();perfPaints=0;perfCounts.fill(0);perfRenderMs.fill(0);FILM_SOUND.start(t);ref.currentTime=referenceTime(t);if(t>=13&&t<24.5)await ref.play();$('#play').textContent='暂停';$('#start').hidden=true}catch(e){running=false;$('#status').textContent='请点击播放启动声音';voice.pause();previewVideos.forEach(v=>v.pause());FILM_SOUND.stop()}}
async function seek(time){if(!ready)return;const serial=++pendingSeek;pause();$('#status').textContent='正在定位画面…';document.body.dataset.seeking='true';t=cl(Number(time)||0,0,DURATION);$('#start').hidden=t>0;voice.currentTime=Math.min(t,FILM_TIMING.narrationEnd-.035);ref.currentTime=referenceTime(t);const active=activePreviews(t,true);paint(t,true);await Promise.all([waitSeek(voice),waitSeek(ref),...active.map(waitSeek)]);if(serial===pendingSeek){paint(t,true);$('#status').textContent='';document.body.dataset.seeking='false'}}
function waitSeek(v){return new Promise(resolve=>{if(!v.seeking){resolve();return}v.addEventListener('seeked',resolve,{once:true});setTimeout(resolve,1200)})}
async function renderExportFrame(time){
  if(!ready||!EXPORT_MODE)throw Error('Export scene is not ready');
  const at=cl(time,0,DURATION),seeks=[];
  function locate(v,target){
    const exact=Math.min(Math.max(0,target+1e-6),v.duration-1e-4);
    if(Math.abs(v.currentTime-exact)<1e-7&&!v.seeking)return;
    seeks.push(new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(Error('Video seek timed out: '+v.id)),10000);
      const finish=error=>{clearTimeout(timer);v.removeEventListener('seeked',done);v.removeEventListener('error',failed);error?reject(error):resolve()};
      const done=()=>finish(),failed=()=>finish(Error('Video seek failed: '+v.id));
      v.addEventListener('seeked',done,{once:true});v.addEventListener('error',failed,{once:true});v.currentTime=exact;
    }));
  }
  if(at<129.55)locate(voice,Math.min(at,FILM_TIMING.narrationEnd-.001));
  if(at>=13.05&&at<24.45)locate(ref,referenceTime(at));
  for(const v of storyVideos){if(v.id==='marioFull')continue;const target=LATER.mediaTime(v,at);if(target!==null)locate(v,target)}
  await Promise.all(seeks);paint(at,true);if(errors.length)throw Error(errors.join(' | '));return canvas;
}
window.renderExportFrame=renderExportFrame;
function tick(){if(running){t=Math.min(DURATION,FILM_SOUND.time());if(t<FILM_TIMING.narrationEnd-.02){const drift=t-voice.currentTime;document.body.dataset.audioDriftMs=(drift*1000).toFixed(1);if(Math.abs(drift)>.12&&!voice.seeking)voice.currentTime=t;if(voice.paused)voice.play().catch(()=>{})}else if(!voice.paused)voice.pause();for(const v of activePreviews(t))if(v.paused&&shouldPlayPreview(v,t))v.play().catch(()=>{});if(t>=13&&t<24.5){if(ref.paused)ref.play().catch(()=>{});if(Math.abs(ref.currentTime-referenceTime(t))>.18)ref.currentTime=referenceTime(t)}else if(!ref.paused)ref.pause();paint(t);if(t>=DURATION-.001){t=DURATION;pause()}}requestAnimationFrame(tick)}
$('#play').onclick=play;$('#start').onclick=play;canvas.onclick=play;$('#replay').onclick=async()=>{await seek(0);play()};$('#seek').oninput=e=>seek(e.target.value);$('#sound').onclick=()=>{soundOn=!soundOn;FILM_SOUND.setMuted(!soundOn);$('#sound').textContent=soundOn?'声音 开':'声音 关';$('#sound').setAttribute('aria-pressed',String(soundOn))};$('#subs').onclick=()=>{subs=!subs;$('#caption').hidden=!subs;$('#subs').textContent=subs?'字幕 开':'字幕 关';$('#subs').setAttribute('aria-pressed',String(subs))};$('#full').onclick=()=>document.fullscreenElement?document.exitFullscreen():$('#picture').requestFullscreen();document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','BUTTON'].includes(e.target.tagName)){e.preventDefault();play()}});
$('#exitFull').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen()};
function loadImage(src){return new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=()=>rej(new Error('图片缺失：'+src));x.src=src})}
function mediaReady(v){return new Promise((res,rej)=>{if(v.readyState>=2)return res();v.addEventListener('loadeddata',res,{once:true});v.addEventListener('error',()=>rej(new Error('视频加载失败')),{once:true})})}
function loadEngine(track,i){if(cachedWorks[i]&&!EXPORT_MODE){engines[i]=null;return mediaReady(cachedWorks[i])}return new Promise((res,rej)=>{const f=document.createElement('iframe');f.src=`works/${track[0]}/index.html?embed=1${EXPORT_MODE?'&cache=1&export=1':''}`;f.tabIndex=-1;f.title=track[1];$('#engines').append(f);engines[i]=f;const start=performance.now();const id=setInterval(()=>{try{const win=f.contentWindow,doc=f.contentDocument,cv=doc?.querySelector('canvas'),btn=doc?.querySelector('#play');if(typeof win.seek==='function'&&cv&&(!btn||!btn.disabled)&&doc.fonts.status==='loaded'){clearInterval(id);res(f)}else if(performance.now()-start>60000){clearInterval(id);rej(new Error('作品载入超时：'+track[1]))}}catch{}},100)})}
let wallpaper,codexLogo,images=[];
(async()=>{try{[wallpaper,codexLogo,...images]=await Promise.all([loadImage('assets/macos-wallpaper.png'),loadImage('assets/chatgpt-logo.svg'),...Array.from({length:4},(_,i)=>loadImage(`assets/social-${i}.jpg`))]);await Promise.all([document.fonts.load('600 40px FilmHei'),document.fonts.load('700 92px FilmRound','Vibe知识大赏1000万播放'),mediaReady(voice),mediaReady(ref),...storyVideos.map(mediaReady),LATER.load(),FILM_SOUND.prepare(),...tracks.map(loadEngine)]);videoFrame(ref,heldRef);ready=true;window.DURATION=DURATION;window.seek=seek;window.renderFrame=paint;window.pause=pause;document.body.dataset.ready='true';document.body.dataset.atlasCount=String(ATLAS.length);$('#play').disabled=$('#replay').disabled=$('#start').disabled=false;$('#loading').hidden=true;paint(0,true);requestAnimationFrame(tick)}catch(e){$('#loading').textContent=e.message;$('#status').textContent='素材尚未就绪';console.error(e)}})();
