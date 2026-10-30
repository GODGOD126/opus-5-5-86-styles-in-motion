/* Hidden-Line Wireframe study, adapted from Futurepedia AI Style Atlas #066.
   Source: https://www.futurepedia.io/resources/ai-style-atlas/view
   Perspective projection, opaque back-to-front grid cells, depth haze,
   additive bloom and scanline finish follow the archived reference.
   Topic, geometry, camera sequence and score are original to this sample.
   Bundling a local reference is not a grant of redistribution rights. */
(() => {
'use strict';
const W=1280,H=720,D=22,TAU=Math.PI*2;
const CY='#7feaff',WHITE='#e8fbff',AMB='#ffd36b',DARK='#050a22';
const FONT='"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const phase=(t,a,b)=>clamp((t-a)/(b-a));
const E=(t,a,b)=>ease(phase(t,a,b));
const lerp3=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const norm=a=>{const n=Math.hypot(...a);return a.map(v=>v/n)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const rgb=(a,b,t)=>a.map((v,i)=>Math.round(mix(v,b[i],t)));
const color=(v,a=1)=>`rgba(${v.join(',')},${a})`;
const glow=document.createElement('canvas');glow.width=W;glow.height=H;
const gc=glow.getContext('2d');
let faces=[],strokes=[],cam,tNow=0,model=null;

function camera(t){
  // First ten seconds compress the original comparison; then orbit into a replay.
  const u=Math.min(t*2.2,22),k=E(u,3.2,4.5),close=E(u,16.1,18.4);
  const x=mix(-1.2,1.0,k)+.18*Math.sin(t*.19);
  const replay=E(t,10,11.4),resolve=E(t,17.3,19.2);
  const pos=[x+replay*1.5-resolve*1.1,mix(6.5,7.0,k)-close*.6+replay*.8,mix(-11.7,-14.5,k)+close*1.4+replay*.7];
  const target=[mix(.4,1.3,k)-replay*.7,mix(1.2,1.8,k)+replay*.1,2.5];
  const fwd=norm(sub(target,pos)),right=norm(cross([0,1,0],fwd)),up=cross(fwd,right);
  return p=>{const v=sub(p,pos),z=dot(v,fwd);return [640+1100*dot(v,right)/z,435-1100*dot(v,up)/z,z]};
}
function projectFace(points,stroke=CY,alpha=.7,fill=DARK,width=1){
  const pts=points.map(p=>cam(model?model(p):p));if(pts.some(p=>p[2]<.8))return;
  if(Math.max(...pts.map(p=>p[0]))<0||Math.min(...pts.map(p=>p[0]))>W||Math.min(...pts.map(p=>p[1]))>H)return;
  faces.push({pts,z:pts.reduce((s,p)=>s+p[2],0)/pts.length,stroke,alpha,fill,width});
}
function line3(points,col=CY,width=1.3,alpha=1,dashed=false){
  const pts=points.map(p=>cam(model?model(p):p));if(pts.some(p=>p[2]<.8))return;
  strokes.push({pts,col,width,alpha,dashed});
}
function drawFaces(ctx){
  faces.sort((a,b)=>b.z-a.z);
  ctx.lineJoin='round';
  for(const f of faces){
    ctx.beginPath();f.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
    ctx.globalAlpha=1;ctx.fillStyle=f.fill;ctx.fill();
    ctx.globalAlpha=f.alpha;ctx.strokeStyle=f.stroke;ctx.lineWidth=f.width;ctx.stroke();
  }ctx.globalAlpha=1;
  for(const s of strokes){
    ctx.strokeStyle=s.col;ctx.lineWidth=s.width;ctx.globalAlpha=s.alpha;
    ctx.setLineDash(s.dashed?[6,7]:[]);ctx.beginPath();s.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
  }ctx.globalAlpha=1;ctx.setLineDash([]);
}
function groundHeight(x,z){
  const side=E(Math.abs(x),5,19),back=E(z,7,35);
  return -.8+side*(1.3+Math.sin(x*.35+z*.21)*1.1+Math.cos(z*.5)*.6)+back*(2.6+Math.cos(x*.45+z*.15)*1.8);
}
function terrain(t){
  const scan=t<1.2?-6+phase(t,0,1.2)*65:-6+((t-1.2)*13)%65;
  for(let z=44;z>=-10;z-=1.1)for(let x=-32;x<32;x+=1.1){
    const fog=clamp((z+5)/55),alpha=.24*(1-fog*.76)+.5*Math.exp(-Math.pow((z-scan)/1.4,2));
    const pts=[[x,z],[x+1.1,z],[x+1.1,z+1.1],[x,z+1.1]].map(([xx,zz])=>[xx,groundHeight(xx,zz),zz]);
    projectFace(pts,color(rgb([54,191,235],[56,94,179],fog)),alpha,color(rgb([5,10,34],[11,26,66],fog)),.75);
  }
}
function transform(v,p,rotation=0){const c=Math.cos(rotation),s=Math.sin(rotation);return [p[0]+v[0]*c-v[1]*s,p[1]+v[0]*s+v[1]*c,p[2]+v[2]]}
function ellipsoid(p,r,col=CY,alpha=.8,segments=16,rings=8){
  const P=(i,j)=>[p[0]+r[0]*Math.sin(Math.PI*j/rings)*Math.cos(TAU*i/segments),p[1]+r[1]*Math.cos(Math.PI*j/rings),p[2]+r[2]*Math.sin(Math.PI*j/rings)*Math.sin(TAU*i/segments)];
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++)projectFace([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],col,alpha,DARK,.9);
}
function cat(t){
  // Articulated motion: inspect the spill, raise a paw while the guess is shown,
  // then recoil from the hand in the replay. The paw never touches the cup.
  const walk=E(t,.6,1.6),reset=E(t,10,11.3),flinch=E(t,14.15,14.4)*(1-E(t,14.55,15.1));
  const p=[-4.5+.85*walk-.65*reset-.4*E(t,14.2,14.8),0,2.0];
  const stepping=t>.6&&t<1.6,breath=.035*Math.sin(t*3.1),bob=(stepping?.07*Math.sin(t*18):0)+flinch*.52;
  ellipsoid([p[0],.8+bob+breath,p[2]],[1.1,.83,.68],CY,.65,16,8);
  const paw=E(t,1.85,2.2)*(1-E(t,3.1,3.55));
  let legId=0;
  for(const x of [-.8,.45])for(const z of [-.43,.43]){
    const swing=stepping?Math.sin(t*16+legId*Math.PI*.9):0,raised=x>0&&z<0?paw:0;
    const foot=[p[0]+x+swing*.17+raised*.55,.08+Math.max(0,swing)*.22+raised*.65+flinch*.12,p[2]+z];
    bone([p[0]+x,.65+bob,p[2]+z],foot,.16,CY,.65);
    ellipsoid(foot,[.29,.19,.24],CY,.8,8,4);legId++;
  }
  const hc=[p[0]+.7,1.6+bob,p[2]-.05];
  const yaw=.28*Math.sin(t*1.8)+.4*E(t,12.2,13.4)-.65*E(t,16,17);
  const nod=-.16*E(t,.8,1.5)+.16*E(t,2,2.6)+flinch*.2;
  model=q=>{const v=sub(q,hc),c=Math.cos(yaw),s=Math.sin(yaw),v2=[v[0]*c-v[2]*s,v[1],v[0]*s+v[2]*c];return transform(v2,hc,nod)};
  ellipsoid(hc,[.65,.62,.6],CY,.88,14,7);
  for(const z of [-.43,.43]){
    const a=[p[0]+.33,1.86+bob,p[2]+z],b=[p[0]+.95,1.88+bob,p[2]+z],tip=[p[0]+.58+.07*Math.sin(t*4+z),2.6+bob,p[2]+z];
    projectFace([a,b,tip],WHITE,.9,DARK,1.3);
    projectFace([a,[p[0]+.58,1.8+bob,p[2]],tip],CY,.9,DARK,1);
  }
  const tip=[p[0]+1.34,1.6+bob,p[2]-.05];
  ellipsoid(tip,[.12,.12,.16],WHITE,.9,6,4);
  const blink=Math.pow(Math.max(0,Math.cos((t-2.7)*2.1)),30);
  for(const z of [-.3,.3])ellipsoid([p[0]+1.2,1.85+bob,p[2]+z],[.07,.095*(1-.85*blink),.07],WHITE,1,6,4);
  for(const z of [-1,1])for(let i=0;i<2;i++)line3([[p[0]+1.26,1.53+bob,p[2]+z*.22],[p[0]+1.7,1.42+bob+i*.18,p[2]+z*.75]],CY,1,.8);
  model=null;
  const tail=[];for(let i=0;i<=24;i++){const u=i/24;tail.push([p[0]-1.0-1.0*Math.sin(u*2),.45+bob+1.6*u+.17*Math.sin(t*3.6+u*4)*u,p[2]+.8*Math.sin(t*2.8+u*2)*u*u])}line3(tail,CY,2,.9);
  return [p[0]+1.0,.5,p[2]];
}
function bone(a,b,r,col=CY,alpha=.8){
  const axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
  const P=(p,i)=>p.map((x,j)=>x+r*(u[j]*Math.cos(TAU*i/8)+v[j]*Math.sin(TAU*i/8)));
  for(let i=0;i<8;i++)projectFace([P(a,i),P(a,i+1),P(b,i+1),P(b,i)],col,alpha,DARK,1);
}
function hand(t){
  if(t<12||t>19)return null;
  const enter=E(t,12,13.4),push=E(t,13.4,14.25),retreat=E(t,16.5,18.8);
  const p=[mix(-9,-2.4,enter)+1.35*push-6*retreat,mix(9,1.5,enter)+8*retreat,1.75+.8*retreat];
  const col=t>14.5?CY:AMB;
  bone([-7.5-3*retreat,4.7+8*retreat,3.1],[p[0]-.75,p[1]+.15,p[2]],.32,col,.65);
  ellipsoid(p,[.65,.22,.48],col,.9,12,6);
  for(let i=0;i<4;i++){
    const z=p[2]+(i-1.5)*.23,len=[.55,.8,.87,.7][i],curl=.12*(1-push)+retreat*.35;
    const base=[p[0]+.42,p[1],z],joint=[p[0]+.42+len*.65,p[1]-.04,z],tip=[p[0]+.42+len,p[1]-curl,z];
    bone(base,joint,.095,col,.9);bone(joint,tip,.085,col,.9);ellipsoid(tip,[.1,.1,.1],col,.85,6,4);
  }
  bone([p[0]-.2,p[1],p[2]-.35],[p[0]+.23,p[1]-.14,p[2]-.72],.14,col,.9);
  bone([p[0]+.23,p[1]-.14,p[2]-.72],[p[0]+.56,p[1]-.15,p[2]-.62],.12,col,.9);
  return [p[0]+1.2,p[1]-.05,p[2]];
}
function cup(t){
  const rewind=E(t,10.2,11.2),fall=E(t,13.85,14.55);
  const fallen=t<10?E(t,.12,.6):1-rewind+fall;
  const settle=t>14.55?Math.sin((t-14.55)*23)*Math.exp(-(t-14.55)*5)*.1:0;
  const angle=mix(.05,-1.38,fallen)+settle;
  const contactY=Math.max(.47*Math.abs(Math.sin(angle)),.67*Math.abs(Math.sin(angle))-1.8*Math.cos(angle))+.03;
  const p=[-.4,contactY,1.8];
  const P=(i,j)=>{const u=j/8,r=mix(.47,.67,u);return transform([Math.cos(TAU*i/24)*r,u*1.8,Math.sin(TAU*i/24)*r],p,angle)};
  for(let j=0;j<8;j++)for(let i=0;i<24;i++)projectFace([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],WHITE,.82,DARK,1.1);
  const end=[];for(let i=0;i<=24;i++)end.push(P(i,0));projectFace(end,CY,.65,DARK,1.1);
  const rim=[];for(let i=0;i<=48;i++){const u=TAU*i/48;rim.push(transform([Math.cos(u)*.67,1.8,Math.sin(u)*.67],p,angle))}line3(rim,WHITE,2.1,.96);
  const handle=[];for(let i=0;i<=25;i++){const a=-Math.PI*.5+Math.PI*i/25;handle.push(transform([-.48-.55*Math.cos(a),.9+.65*Math.sin(a),0],p,angle))}line3(handle,CY,2,.8);
  const spill=t<10?E(t,.35,1.2):(1-rewind)+E(t,14.1,15.2);
  if(spill>0){
    const center=[2.0,.06,1.1];
    for(let j=1;j<=7;j++){
      const ring=[];for(let i=0;i<=64;i++){const a=TAU*i/64,r=j/7*spill*(1+.065*Math.sin(a*5-t*2));ring.push([center[0]+Math.cos(a)*r*2.2,center[1]+.012*Math.sin(t*6+j),center[2]+Math.sin(a)*r*1.1])}
      line3(ring,CY,.9,.5);
    }
    for(let i=0;i<10;i++){const u=i/10,a=u*TAU;line3([center,[center[0]+Math.cos(a)*2.15*spill,.06,center[2]+Math.sin(a)*1.05*spill]],CY,.8,.35)}
    const pouring=t<1.5?phase(t,.35,1.5):phase(t,14.05,15.2);
    if(pouring>0&&pouring<1){for(let i=0;i<8;i++){const u=(pouring*2+i/8)%1;ellipsoid([1.15+u*1.5,.12+Math.sin(u*Math.PI)*.5,1.4+(i%3-1)*.22],[.055,.08,.055],WHITE,.9,5,3)}}
  }
  return [1.0,1.2,1.8];
}
function ghost(t){
  const grow=E(t,7.9,8.8),cut=E(t,12.5,14.5),alpha=grow*(1-cut);
  const p=[6.4,3.5,3.8],r=1.45*grow;
  if(alpha<=0)return p;
  // The extra entity is explicitly hypothetical: an amber shell, not observed evidence.
  const spin=t*.3,pts=[];
  for(let j=0;j<=10;j++)for(let i=0;i<20;i++){
    const P=(ii,jj)=>{const a=TAU*ii/20+spin,lat=Math.PI*jj/10;return [p[0]+r*Math.sin(lat)*Math.cos(a),p[1]+r*Math.cos(lat),p[2]+r*Math.sin(lat)*Math.sin(a)]};
    if(j<10){const centerX=(P(i,j)[0]+P(i+1,j)[0])/2;if(centerX>mix(8.1,4.6,cut))continue;projectFace([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],AMB,.6*alpha,DARK,.95)}
  }
  const ring=[];for(let i=0;i<=80;i++){const a=TAU*i/80;ring.push([p[0]+r*1.35*Math.cos(a),p[1]+.25*Math.sin(a),p[2]+r*1.35*Math.sin(a)])}line3(ring,AMB,1,.65*alpha,true);
  return p;
}
function worldCurve(a,b,bend=0,n=60){const out=[];for(let i=0;i<=n;i++){const u=i/n;out.push([mix(a[0],b[0],u),mix(a[1],b[1],u)+Math.sin(u*Math.PI)*bend,mix(a[2],b[2],u)])}return out}
function route(ctx,points,amount,col,opacity=1,dashed=false){
  if(amount<=0||opacity<=0)return;
  const visible=points.slice(0,Math.max(2,Math.ceil(points.length*amount))).map(cam);
  ctx.save();ctx.globalAlpha=opacity;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.shadowBlur=12;ctx.shadowColor=col;ctx.setLineDash(dashed?[7,9]:[]);
  ctx.beginPath();visible.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);
  const q=visible.at(-1),b=visible.at(-2),ang=Math.atan2(q[1]-b[1],q[0]-b[0]);ctx.translate(q[0],q[1]);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-11,-6);ctx.moveTo(0,0);ctx.lineTo(-11,6);ctx.stroke();ctx.restore();
}
function text(ctx,str,x,y,size,col=WHITE,align='left',weight=700){ctx.font=`${weight} ${size}px ${FONT}`;ctx.fillStyle=col;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(str,x,y);ctx.textAlign='left'}
function caption(ctx,lines,t,a,b,{x=72,y=102,size=54,col=WHITE}={}){
  const on=E(t,a,a+.20)*(1-E(t,b-.18,b));if(on<=0)return;
  ctx.save();ctx.globalAlpha=on;ctx.translate(0,10*(1-on));
  lines.forEach((s,i)=>text(ctx,s,x,y+i*(size+14),size,col));ctx.restore();
}
function tag(ctx,str,p,offset,col,alpha=1,size=28){
  if(alpha<=0)return;const q=cam(p),x=q[0]+offset[0],y=q[1]+offset[1];
  ctx.save();ctx.globalAlpha=alpha;ctx.font=`600 ${size}px ${FONT}`;const w=ctx.measureText(str).width;
  ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(x,y+23);ctx.lineTo(x+w,y+23);ctx.stroke();
  ctx.fillStyle='rgba(3,8,30,.92)';ctx.fillRect(x-10,y-size/2-7,w+20,size+14);text(ctx,str,x,y,size,col,'left',600);ctx.restore();
}
function finish(ctx){
  gc.clearRect(0,0,W,H);gc.filter='blur(6px)';gc.drawImage(ctx.canvas,0,0,W,H);gc.filter='none';
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5;ctx.drawImage(glow,0,0);ctx.restore();
}
function hud(ctx,t){
  ctx.save();ctx.strokeStyle='rgba(127,234,255,.5)';ctx.lineWidth=1;
  for(const [x,y,sx,sy]of [[26,26,1,1],[1254,26,-1,1],[26,694,1,-1],[1254,694,-1,-1]]){ctx.beginPath();ctx.moveTo(x,y+18*sy);ctx.lineTo(x,y);ctx.lineTo(x+18*sx,y);ctx.stroke()}
  text(ctx,'奥卡姆剃刀',1207,47,21,'#6d9bb2','right',400);
  ctx.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<H;y+=3)ctx.fillRect(0,y,W,1);
  const g=ctx.createRadialGradient(W/2,H/2,216,W/2,H/2,881);g.addColorStop(0,'rgba(0,0,10,0)');g.addColorStop(1,'rgba(0,0,10,.45)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
}
function render(ctx,t){
  t=clamp(t,0,D);tNow=t;faces=[];strokes=[];model=null;cam=camera(t);
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#02051a');sky.addColorStop(.48,'#0b1b4d');sky.addColorStop(1,'#050a22');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  for(let i=0;i<75;i++){const x=(Math.sin(i*137.3)*43758.5)%1*W,y=(Math.sin(i*87.9)*24634.6)%1*300;ctx.fillStyle='rgba(165,224,255,.18)';ctx.fillRect(Math.abs(x),Math.abs(y),1,1)}
  terrain(t);
  for(let z=-.5;z<=5;z+=.5)for(let x=-7;x<8;x+=.5)projectFace([[x,-.12,z],[x+.5,-.12,z],[x+.5,-.12,z+.5],[x,-.12,z+.5]],CY,.18,'#060e28',.8);
  const catP=cat(t),cupP=cup(t),ghostP=ghost(Math.min(t*2.2,22)),handP=hand(t);drawFaces(ctx);
  const evidence=E(t,1.85,2.45),extra=E(t,4,4.5),cut=E(t,5.7,6.7),replay=E(t,10,10.5),reject=E(t,15,16.1);
  const oldAmount=t<10?evidence:(t<14.5?1-E(t,10,10.5):E(t,14.5,14.85)*(1-reject));
  route(ctx,worldCurve(catP,cupP,1.2),oldAmount,t<14.5?CY:'#ff7d88',t<14.5?.8:.8*(1-reject),t>=14.5);
  route(ctx,worldCurve(ghostP,cupP,1),extra*(1-cut),AMB,(1-cut)*.8,true);
  // Packets moving along the retained explanation make the inference legible.
  if(t>2.45&&t<10){const routePts=worldCurve(catP,cupP,1.2);for(let i=0;i<2;i++){const u=(t*.65+i*.5)%1,q=cam(routePts[Math.floor(u*60)]);ctx.save();ctx.fillStyle=WHITE;ctx.shadowColor=CY;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(q[0],q[1],3.3,0,TAU);ctx.fill();ctx.restore()}}
  if(t>5.5&&t<6.95){
    const x=mix(8.1,4.6,cut),a=cam([x,-.1,2]),b=cam([x,5.6,2]),c=cam([x,5.6,5.8]),d=cam([x,-.1,5.8]);
    const fade=E(t,5.5,5.7)*(1-E(t,6.7,6.95));ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='rgba(127,234,255,.09)';ctx.strokeStyle='#d9fbff';ctx.shadowColor=CY;ctx.shadowBlur=20;ctx.lineWidth=2;ctx.beginPath();[a,b,c,d].forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
  if(t>13.85&&t<14.7){const q=cam([-.6,1.1,1.8]),u=phase(t,13.85,14.7);ctx.save();ctx.globalAlpha=1-u;ctx.strokeStyle=AMB;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(q[0],q[1],10+55*u,0,TAU);ctx.stroke();for(let i=0;i<7;i++){const a=TAU*i/7;ctx.beginPath();ctx.moveTo(q[0]+Math.cos(a)*(18+25*u),q[1]+Math.sin(a)*(18+25*u));ctx.lineTo(q[0]+Math.cos(a)*(30+45*u),q[1]+Math.sin(a)*(30+45*u));ctx.stroke()}ctx.restore()}
  if(t>15.2){
    const newOrigin=handP||[-2.7,2.5,2.3];
    route(ctx,worldCurve(newOrigin,cupP,1),E(t,15.2,16.3),CY,.8*(1-E(t,17.1,18.4)));
  }
  finish(ctx);
  const shade=ctx.createLinearGradient(0,0,0,300);shade.addColorStop(0,'rgba(2,5,26,.68)');shade.addColorStop(1,'rgba(2,5,26,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,300);
  caption(ctx,['杯子倒了，猫在旁边。'],t,-.5,1.8,{size:53});
  caption(ctx,['你猜：猫碰倒了杯子。'],t,1.8,3.6,{size:53});
  caption(ctx,['还要加上隐形精灵？'],t,3.6,5.6,{size:53,col:AMB});
  caption(ctx,['剃掉多余假设。'],t,5.6,7.1,{size:58});
  caption(ctx,['解释同样充分，','优先选假设更少的。'],t,7.1,10.05,{size:53});
  caption(ctx,['但如果监控拍到……'],t,10.05,12.35,{size:53});
  caption(ctx,['看清杯子倒下的瞬间。'],t,12.35,14.7,{size:52});
  caption(ctx,['是手碰倒了杯子。'],t,14.7,17,{size:56});
  caption(ctx,['更简单，不等于一定正确。'],t,17,19.6,{size:49});
  caption(ctx,['先看证据，再做减法。'],t,19.6,24,{size:57});
  if(t>4&&t<7){tag(ctx,'额外假设',ghostP,[-45,-85],AMB,E(t,4,4.25)*(1-E(t,5.8,6.1)),28)}
  if(t>4.25&&t<5.6){ctx.save();ctx.globalAlpha=E(t,4.25,4.5)*(1-E(t,5.4,5.6));text(ctx,'没有增加解释力',780,620,32,AMB,'center',600);ctx.restore()}
  if(t>10.15&&t<11.4){
    const alpha=E(t,10.15,10.4)*(1-E(t,11.1,11.4));ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=CY;ctx.lineWidth=3;
    for(let i=0;i<2;i++){const x=100+i*28;ctx.beginPath();ctx.moveTo(x+19,570);ctx.lineTo(x,584);ctx.lineTo(x+19,598);ctx.stroke()}text(ctx,'回看',174,584,28,CY,'left',500);ctx.restore();
  }
  if(t>11.5&&t<17.2){
    ctx.save();ctx.globalAlpha=E(t,11.5,11.8)*(1-E(t,16.8,17.2));ctx.strokeStyle='rgba(127,234,255,.6)';ctx.lineWidth=1.5;ctx.strokeRect(65,251,1150,360);ctx.fillStyle=AMB;ctx.beginPath();ctx.arc(89,275,4,0,TAU);ctx.fill();text(ctx,'监控画面 · 情景示意',105,275,22,CY,'left',400);ctx.restore();
  }
  if(t>15&&t<17.3){tag(ctx,'修正解释',[-.6,1.1,1.8],[80,-95],CY,E(t,15,15.4)*(1-E(t,16.9,17.3)),28)}
  if(t>19.8){ctx.save();ctx.globalAlpha=E(t,19.8,20.2);text(ctx,'删掉多余假设，保留全部证据',640,620,32,CY,'center',500);ctx.restore()}
  hud(ctx,t);
}
function scoreSound(k){
  k.bed('hum',0,D,{gain:.15});k.bed('hiss',0,D,{gain:.2});
  k.music('pad',.1,D,{gain:.19,bpm:96,chords:[['D3','F3','A3','C4'],['Bb2','D3','F3','A3'],['G2','Bb2','D3','F3'],['D3','F3','A3','D4']]});
  const beep=(t,f,g=.6)=>k.tone(t,{f,dur:.12,gain:.08*g,a:.004,verb:.12});
  beep(.05,'A4',.5);k.play('tock',.55,{f:300,gain:.4});
  [.8,1.08,1.36,1.6].forEach(t=>k.play('tock',t,{f:180,gain:.12}));
  k.noise(.4,{dur:.8,color:'pink',filter:'bandpass',f:1000,gain:.035,a:.1});
  for(const [a,b]of [[1.45,2.1],[10,11.4],[17.3,19.2]])k.noise(a,{dur:b-a,color:'pink',filter:'bandpass',f:[[0,160],[(b-a)/2,380],[b-a,170]],gain:.045,a:(b-a)/2});
  k.tone(1.85,{f:[[0,220],[.6,660]],type:'triangle',dur:.6,gain:.035,a:.1});beep(2.45,'D5');
  beep(3.6,'A4',.6);beep(4.2,'F4',.5);
  k.noise(5.7,{dur:1,color:'pink',filter:'bandpass',f:[[0,1500],[1,350]],q:3,gain:.065,a:.18});
  k.tone(5.7,{f:[[0,660],[1,165]],type:'triangle',dur:1,gain:.04,a:.12});
  beep(6.75,'D5',.65);beep(7.2,'A4',.5);
  k.tone(10.15,{f:[[0,700],[1,150]],type:'triangle',dur:1,gain:.055,a:.04});
  beep(11.6,'A4',.5);beep(11.78,'A4',.4);
  k.noise(12.1,{dur:1.3,color:'pink',filter:'lowpass',f:450,gain:.018,a:.3});
  k.play('tock',13.88,{f:500,gain:.55});k.play('tock',14.5,{f:300,gain:.45});
  k.noise(14.1,{dur:1.1,color:'pink',filter:'bandpass',f:1100,gain:.035,a:.1});
  k.tone(15,{f:[[0,420],[.6,210]],dur:.6,gain:.045,a:.08});beep(16.3,'D5',.7);
  beep(17.1,'A4',.5);k.tone(19.8,{f:'D3',dur:1.2,gain:.08,a:.1});beep(19.8,'D5',.65);
}
window.DURATION=D;window.renderFrame=render;window.scoreSound=scoreSound;
})();
