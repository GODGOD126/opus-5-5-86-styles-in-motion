/* Ukiyo-e rendering adapted from Futurepedia #21: carved keylines, bokashi,
   seeded wood grain, kozo fibres, kasumi scroll, separate colour impressions.
   Original helpers in vendor/ retain their source comments. New astronomy art. */
(()=>{
 'use strict';
 const M=BHMotion,{clamp,mix,smooth,out,TAU,rng}=M,W=1280,HH=720;
 const C={paper:'#ecdfc2',key:'#102c40',black:'#091b2b',deep:'#16334d',blue:'#24507e',mid:'#5e85a4',light:'#9ab7c7',white:'#f4e8c9',gold:'#cfa355',red:'#b9422b'};
 const layer=()=>{const a=document.createElement('canvas');a.width=W;a.height=HH;return a};
 let PAPER,WOOD,FIBRE,BLUE,SKY,STARS,INKSCRATCH;
 const cfont=(c,size,w=900)=>c.font=`${w} ${size}px Woodblock`;
 const alpha=(c,p,fn)=>{if(p<=0)return;c.save();c.globalAlpha*=clamp(p);fn();c.restore()};
 function keyline(c,path,width=1.6,col=C.key){c.save();c.strokeStyle=col;c.lineCap='round';c.lineJoin='round';c.lineWidth=width;c.stroke(path);c.translate(.6,.4);c.globalAlpha*=.35;c.lineWidth=width*.55;c.stroke(path);c.restore()}
 function irregularCircle(x,y,r,seed=7){const rand=rng(seed),p=new Path2D();for(let i=0;i<=180;i++){const a=i/180*TAU,rr=r+(rand()-.5)*.9+Math.sin(a*9)*.55;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;i?p.lineTo(xx,yy):p.moveTo(xx,yy)}p.closePath();return p}
 function paperTitle(c,txt,x,y,size,color=C.key){cfont(c,size);c.fillStyle=color;c.textAlign='left';c.textBaseline='top';c.fillText(txt,x,y)}
 function stamp(c,x,y,glyph,p=1){if(p<=0)return;const s=1+(1-clamp(p))*.6;c.save();c.translate(x,y);c.rotate(-.018);c.scale(s,s);c.globalAlpha*=clamp(p*2);c.fillStyle=C.red;c.fillRect(-21,-21,42,42);c.strokeStyle=C.white;c.lineWidth=1.3;c.strokeRect(-17,-17,34,34);cfont(c,31,700);c.textAlign='center';c.textBaseline='middle';c.fillStyle=C.white;c.fillText(glyph,0,-1);c.restore()}
 function plaque(c,txt,x,y,size=34,p=1){if(p<=0)return;const w=size+24,h=txt.length*(size+7)+25;c.save();c.globalAlpha*=clamp(p);c.translate(0,(1-out(p))*-14);c.fillStyle=C.paper;c.fillRect(x,y,w,h);c.strokeStyle=C.key;c.lineWidth=1.8;c.strokeRect(x,y,w,h);c.lineWidth=.8;c.strokeRect(x+4,y+4,w-8,h-8);cfont(c,size,800);c.fillStyle=C.key;c.textBaseline='top';c.textAlign='center';[...txt].forEach((ch,i)=>c.fillText(ch,x+w/2,y+12+i*(size+7)));c.restore();return{x,y,w,h}}
 function cloudBand(c,x,y,w,p=1){if(p<=0)return;c.save();c.globalAlpha*=p;const shape=new Path2D();shape.moveTo(x,y);shape.bezierCurveTo(x+w*.35,y-10,x+w*.18,y-15,x+w*.7,y-14);shape.bezierCurveTo(x+w*.94,y-14,x+w*.84,y+3,x+w*.63,y+4);shape.lineTo(x+w,y+4);shape.bezierCurveTo(x+w+20,y+4,x+w+20,y+16,x+w*.86,y+17);shape.lineTo(x+w*.4,y+17);shape.bezierCurveTo(x+w*.22,y+17,x+w*.27,y+27,x+w*.57,y+27);shape.lineTo(x+w*.75,y+27);shape.bezierCurveTo(x+w*.96,y+28,x+w*.95,y+36,x+w*.65,y+36);shape.lineTo(x-8,y+36);shape.bezierCurveTo(x-30,y+35,x-25,y+25,x+35,y+24);shape.lineTo(x+w*.23,y+24);shape.bezierCurveTo(x+w*.43,y+24,x+w*.39,y+17,x+w*.08,y+16);shape.bezierCurveTo(x-20,y+16,x-20,y+2,x,y);shape.closePath();c.fillStyle=C.gold;c.fill(shape);keyline(c,shape,.5,'#b48f50');c.restore()}
 function makeFields(){
   PAPER=layer();const c=PAPER.getContext('2d');H.paper(c,W,HH,C.paper,3,.055);
   const r=rng(77);for(let i=0;i<2700;i++){c.fillStyle=i%2?'rgba(109,81,43,.06)':'rgba(255,248,222,.13)';c.fillRect(r()*W,r()*HH,.5+r()*2,.5+r()*2)}
   WOOD=layer();const wc=WOOD.getContext('2d'),d=wc.createImageData(W,HH),n=H.makeNoise(3);
   // A smooth warp field separates coarse wood fibres from fine paper tooth.
   const gw=66,gh=38,grid=[];for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)grid.push(n.fbm2(x*.25,y*.25,3));
   const rr=rng(2);for(let y=0,i=0;y<HH;y++)for(let x=0;x<W;x++,i+=4){const gx=x/20,gy=y/20,ix=gx|0,iy=gy|0,fx=gx-ix,fy=gy-iy,k=iy*gw+ix;const a=mix(grid[k],grid[k+1],fx),b=mix(grid[k+gw],grid[k+gw+1],fx),v=mix(a,b,fy);const g=Math.sin(y*.55+v*26+x*.004)*.5+(rr()-.5)*1.1;const q=128+g*18;d.data[i]=q+3;d.data[i+1]=q;d.data[i+2]=q-5;d.data[i+3]=255}wc.putImageData(d,0,0);
   FIBRE=layer();const fc=FIBRE.getContext('2d'),rf=rng(55);for(let i=0;i<350;i++){const x=rf()*W,y=rf()*HH,len=8+rf()*26,a=rf()*TAU;fc.strokeStyle=rf()<.5?'rgba(255,250,235,.22)':'rgba(88,66,39,.12)';fc.lineWidth=.4+rf()*.5;fc.beginPath();fc.moveTo(x,y);fc.quadraticCurveTo(x+Math.cos(a)*len*.5+rf()*4,y+Math.sin(a)*len*.5,x+Math.cos(a)*len,y+Math.sin(a)*len);fc.stroke()}
   BLUE=layer();const bc=BLUE.getContext('2d');
   // Broad, imperfect colour plates keep the grain visible without looking like a sea.
   const shape=new Path2D('M -60 430 C 185 470 360 445 515 263 C 650 90 973 48 1330 96 L 1330 720 C 1050 754 831 703 620 635 C 412 571 177 612 -60 593 Z');
   bc.save();bc.translate(-8,-6);bc.fillStyle=C.light;bc.fill(shape);bc.restore();
   bc.save();bc.translate(4,5);bc.fillStyle=C.mid;bc.fill(shape);bc.restore();bc.fillStyle=C.deep;bc.fill(shape);
   const rand=rng(51);bc.save();bc.clip(shape);
   // Ink misses and raised wood grain are part of the plate, not screen noise.
   for(let i=0;i<12500;i++){let x=rand()*W,y=rand()*HH,s=.3+rand()*2;bc.fillStyle=rand()<.5?'rgba(244,232,201,.20)':'rgba(147,180,204,.18)';bc.fillRect(x,y,s*(1+rand()*3),s*.55)}
   for(let k=0;k<48;k++){const p=new Path2D(),ry=225+k*4.7;for(let j=0;j<=100;j++){const a=j/100*TAU,x=794+Math.cos(a)*(ry+23),y=387+Math.sin(a)*ry; j?p.lineTo(x,y):p.moveTo(x,y)}bc.strokeStyle=k%5===0?'rgba(244,232,201,.19)':'rgba(147,180,204,.11)';bc.lineWidth=.4+k%3*.4;bc.stroke(p)}bc.restore();
   SKY=layer();const sc=SKY.getContext('2d'),sg=sc.createLinearGradient(0,0,0,135);sg.addColorStop(0,'rgba(31,62,87,.38)');sg.addColorStop(1,'rgba(31,62,87,0)');sc.fillStyle=sg;sc.fillRect(0,0,W,135);
   STARS=layer();const st=STARS.getContext('2d'),rs=rng(409);for(let i=0;i<230;i++){const x=rs()*W,y=rs()*HH;if((x<590&&y<300)||Math.hypot(x-790,y-391)<280||y<55)continue;st.fillStyle=i%5===0?C.gold:C.white;const sz=.45+rs()*1.4;st.globalAlpha=.35+rs()*.45;st.beginPath();st.arc(x,y,sz,0,TAU);st.fill()}st.globalAlpha=1;[[414,543],[1101,430],[601,119],[1056,659]].forEach(([x,y],i)=>{st.fillStyle=i%2?C.gold:C.white;const p=new Path2D();p.moveTo(x,y-9);p.quadraticCurveTo(x+1,y-1,x+9,y);p.quadraticCurveTo(x+1,y+1,x,y+9);p.quadraticCurveTo(x-1,y+1,x-9,y);p.quadraticCurveTo(x-1,y-1,x,y-9);st.fill(p)});
   INKSCRATCH=layer();const ic=INKSCRATCH.getContext('2d'),ri=rng(208);for(let i=0;i<1600;i++){const x=ri()*W,y=ri()*HH;ic.strokeStyle=i%3?'rgba(171,198,207,.055)':'rgba(0,0,0,.12)';ic.lineWidth=.35;ic.beginPath();ic.moveTo(x,y);ic.quadraticCurveTo(x+ri()*30,y-.8,x+ri()*75,y);ic.stroke()}
 }
 function finish(c){c.save();c.globalCompositeOperation='soft-light';c.globalAlpha=.50;c.drawImage(WOOD,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.drawImage(FIBRE,0,0);H.vignette(c,W,HH,.12,'90,60,30');c.restore()}
 function backdrop(c,t,full=false){c.drawImage(PAPER,0,0);alpha(c,full?1:smooth(.25,1.1,t),()=>c.drawImage(BLUE,0,0));alpha(c,full?1:smooth(1.05,1.65,t),()=>c.drawImage(SKY,0,0));alpha(c,full?1:smooth(.7,1.4,t),()=>{c.drawImage(STARS,0,0);cloudBand(c,35,595,225,.55);cloudBand(c,1127,623,165,.65);cloudBand(c,11,326,240,.28)})}
 function darkRegion(c,x,y,r,p=1){const shape=irregularCircle(x,y,r);c.save();c.strokeStyle=C.key;c.lineWidth=2.2;c.stroke(shape);alpha(c,p,()=>{
    c.fillStyle=C.black;c.fill(shape);c.save();c.clip(shape);c.drawImage(INKSCRATCH,0,0);c.restore();
    // Separate narrow key and pale registration plates, never an emitting horizon.
    c.strokeStyle='rgba(236,223,194,.34)';c.lineWidth=1.1;c.stroke(shape);
    for(let j=0;j<6;j++){c.beginPath();c.ellipse(x+.7,y,r+4+j*1.15,r+4+j*1.15,0,.05+j*.034,TAU-.03-j*.027);c.lineWidth=j%3===0?1.3:.6;c.strokeStyle=j%3===0?'rgba(147,180,204,.29)':'rgba(236,223,194,.17)';c.stroke()}
  });c.restore()}
 function poly(fn,from=0,to=1,steps=100){const p=new Path2D();for(let i=0;i<=steps;i++){const v=fn(mix(from,to,i/steps));i?p.lineTo(v.x,v.y):p.moveTo(v.x,v.y)}return p}
 function arrow(c,p,a,size,col){c.save();c.translate(p.x,p.y);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.lineTo(-size,-size*.36);c.lineTo(-size*.73,0);c.lineTo(-size,size*.36);c.closePath();c.fill();c.restore()}
 function tangent(fn,u){const a=fn(Math.max(0,u-.001)),b=fn(Math.min(1,u+.001));return Math.atan2(b.y-a.y,b.x-a.x)}
 function spark(c,p,ang,col,size=5){c.save();c.translate(p.x,p.y);c.rotate(ang);c.fillStyle=col;c.strokeStyle=C.key;c.lineWidth=.65;c.beginPath();c.moveTo(size+2,0);c.quadraticCurveTo(0,-1,-size*1.4,-size*.57);c.lineTo(-size,0);c.lineTo(-size*1.4,size*.57);c.quadraticCurveTo(0,1,size+2,0);c.fill();c.stroke();c.restore()}
 function ray(c,fn,t,start,travel,col,end=1,opacity=1){if(t<start)return;c.save();c.globalAlpha*=opacity;const reveal=out((t-start)/1.1)*end;const path=poly(fn,0,reveal);c.strokeStyle=col;c.lineWidth=2.2;c.lineCap='round';c.stroke(path);c.lineWidth=.5;c.strokeStyle='rgba(16,44,64,.5)';c.translate(0,1.2);c.stroke(path);c.translate(0,-1.2);
   if(reveal>=end-.01)arrow(c,fn(end),tangent(fn,end),15,col);
   for(let k=0;k<3;k++){const elapsed=t-start-k*.9;if(elapsed<0)continue;const u=(elapsed%travel)/travel*end;const tail=Math.max(0,u-.065);c.strokeStyle=col;c.lineWidth=5;c.globalAlpha=opacity*.65;c.stroke(poly(fn,tail,u,12));c.globalAlpha=opacity;spark(c,fn(u),tangent(fn,u),col,9)}c.restore()}
 function drawExterior(c,t){backdrop(c,t);const h=M.hole(t),z=M.state(t).zoom;darkRegion(c,h.x,h.y,h.r,smooth(.65,1.25,t));
   const fade=1-smooth(4.95,5.6,t);ray(c,u=>M.external(u,0),t,.9,3.2,C.white,1,fade);ray(c,u=>M.external(u,1),t,1.35,3.6,C.gold,1,fade);
   alpha(c,1-smooth(4.95,5.65,t),()=>{paperTitle(c,'引力，让光路',45,65,61);paperTitle(c,'弯曲',45,145,82);plaque(c,'黑洞',1162,36,42,smooth(.3,.65,t));stamp(c,1196,239,'光',smooth(1.1,1.35,t))});
   if(z>0){const label=smooth(5.5,6.25,t);alpha(c,label,()=>{paperTitle(c,'越过这条边界',44,61,61);paperTitle(c,'光也',44,140,61);paperTitle(c,'无法逃出',166,140,61,C.red)});
     // Teaching boundary, not a luminous wall or the observed shadow edge.
     const draw=smooth(5.7,6.9,t);c.save();c.strokeStyle='#d05338';c.lineWidth=4.5;c.setLineDash([13,8]);c.beginPath();c.arc(h.x,h.y,h.r+1,-Math.PI*.5,-Math.PI*.5+draw*TAU);c.stroke();c.restore();
     alpha(c,smooth(6.25,6.7,t),()=>{plaque(c,'事件视界',1150,123,33);c.beginPath();c.moveTo(1150,231);c.lineTo(1024,294);c.strokeStyle='#d05338';c.lineWidth=2.2;c.stroke();c.fillStyle=C.red;c.beginPath();c.arc(1024,294,3.5,0,TAU);c.fill();paperTitle(c,'示意',1150,318,28,C.white);stamp(c,1200,647,'界',smooth(6.7,6.9,t))});
     for(let k=0;k<3;k++)ray(c,u=>M.incoming(u,k),t,6.65+k*.6,3.8,C.white,1,1);
     // This passing ray remains completely outside the horizon.
     const fn=u=>({x:mix(460,1250,u),y:82+22*u+23*u*u});ray(c,fn,t,8.9,3.2,C.gold,1,.75);
   }
 }
 function gasPath(r,w,a,len,seed){const p=new Path2D(),rand=rng(seed),n=24;for(let i=0;i<=n;i++){const u=i/n,ang=a+u*len,rad=r+w*.5+(rand()-.5)*1.5;const x=Math.cos(ang)*rad,y=Math.sin(ang)*rad;i?p.lineTo(x,y):p.moveTo(x,y)}for(let i=n;i>=0;i--){const u=i/n,ang=a+u*len,rad=r-w*.5+(rand()-.5)*1.4;p.lineTo(Math.cos(ang)*rad,Math.sin(ang)*rad)}p.closePath();return p}
 function gasPiece(c,g,t){const s=M.gasState(g,t);if(s.opacity<=0)return;c.save();c.translate(800,393);c.scale(1.15,1.15);c.globalAlpha*=s.opacity;const path=gasPath(s.r,s.w,s.a,s.len,g.seed);c.save();c.translate(1.4,.9);c.fillStyle=g.color;c.fill(path);c.restore();
   c.save();c.clip(path);const r=rng(g.seed);for(let k=0;k<22;k++){const a=s.a+r()*s.len,b=Math.min(s.a+s.len,a+s.len*(.15+r()*.6));c.strokeStyle=k%4===0?'rgba(16,44,64,.32)':'rgba(244,232,201,.72)';c.lineWidth=.4+r()*1.25;c.beginPath();c.arc(0,0,s.r+(r()-.5)*s.w,a,b);c.stroke()}for(let k=0;k<17;k++){const a=s.a+r()*s.len,rad=s.r+(r()-.5)*s.w;c.fillStyle=k%2?'rgba(236,223,194,.5)':'rgba(22,51,77,.2)';c.fillRect(Math.cos(a)*rad,Math.sin(a)*rad,r()*1.8+.4,.7)}c.restore();c.restore()}
 function disk(c,t){backdrop(c,5,true);darkRegion(c,800,393,137,1);
   const rand=rng(93);for(let i=0;i<24;i++){const start=13.3+i*.12,u=clamp((t-start)/3.1),a=i/24*TAU+u*.9,r=mix(440+rand()*55,329,u);if(t<start||u>=1)continue;const x=800+Math.cos(a)*r,y=393+Math.sin(a)*r;c.save();c.globalAlpha=smooth(start,start+.18,t)*(1-smooth(.85,1,u));c.translate(x,y);c.rotate(a+Math.PI/2);c.fillStyle=i%3?C.gold:C.light;const p=new Path2D();p.moveTo(-11,0);p.quadraticCurveTo(0,-6,13,0);p.quadraticCurveTo(0,4,-11,0);c.fill(p);keyline(c,p,.8);c.restore()}
   M.gas.forEach(g=>gasPiece(c,g,t));
   alpha(c,smooth(13.55,14.1,t),()=>{paperTitle(c,'亮的是',44,62,78);paperTitle(c,'外面',44,159,67,C.red);paperTitle(c,'的气体',178,159,67);plaque(c,'吸积盘',1167,64,36,smooth(15.45,16.1,t))});
   alpha(c,smooth(16.1,16.6,t),()=>{c.strokeStyle=C.key;c.lineWidth=1.4;c.beginPath();c.moveTo(1167,188);c.lineTo(1048,280);c.stroke();c.fillStyle=C.key;c.beginPath();c.arc(1048,280,3,0,TAU);c.fill()});
   const aP=smooth(17.9,18.8,t);alpha(c,aP,()=>{for(let k=0;k<2;k++){const a=2.6+k*Math.PI,r=341;c.strokeStyle=C.gold;c.lineWidth=2;c.beginPath();c.arc(800,393,r,a,a+.23);c.stroke();arrow(c,{x:800+Math.cos(a+.23)*r,y:393+Math.sin(a+.23)*r},a+.23+Math.PI/2,14,C.gold)}stamp(c,1200,649,'光',smooth(18.6,18.9,t))});
 }
 function kasumi(c,x){c.save();const top=-60,bot=790,w=145;const p=new Path2D();p.rect(x-w/2,top,w,bot-top);for(let y=top;y<bot;y+=60){p.moveTo(x-w/2+33,y+30);p.arc(x-w/2,y+30,33,0,TAU);p.moveTo(x+w/2+33,y);p.arc(x+w/2,y,33,0,TAU)}c.strokeStyle='#ad8945';c.lineWidth=1.3;c.stroke(p);const g=c.createLinearGradient(x-105,0,x+105,0);g.addColorStop(0,'#e7d8b4');g.addColorStop(.45,'#cfad62');g.addColorStop(.8,'#dec58b');g.addColorStop(1,'#eddfbd');c.fillStyle=g;c.fill(p);c.save();c.clip(p);const rr=rng(78);for(let i=0;i<1400;i++){c.fillStyle=i%4?'rgba(255,248,222,.3)':'rgba(132,98,39,.17)';c.fillRect(x-110+rr()*220,rr()*HH,rr()*2+.6,rr()*1.4+.5)}c.restore();c.restore()}
 function draw(c,t){t=clamp(t,0,22);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,W,HH);const pan=M.state(t).scroll;
   if(pan===0)drawExterior(c,t);else if(pan===1)disk(c,t);else{c.save();c.translate(pan*W,0);drawExterior(c,t);c.restore();c.save();c.translate((pan-1)*W,0);disk(c,t);c.restore();kasumi(c,pan*W)}finish(c);
 }
 function score(k){
   const stamp=(t,g=.45)=>{k.play('stamp',t,{gain:g});k.noise(t+.01,{dur:.09,color:'pink',filter:'bandpass',f:1000,gain:.025,a:.01})};
   const pluck=(t,f,g=.2)=>{k.tone(t,{f,type:'triangle',dur:.9,gain:.09*g,a:.003,verb:.18});k.tone(t,{f:f*2,type:'sawtooth',dur:.7,gain:.025*g,a:.002,filter:'lowpass',f2:[[0,1900],[.7,500]]})};
   [.28,.65,1.05,1.35].forEach((t,i)=>{stamp(t,.18);pluck(t,[146.83,220,293.66,440][i],.45)});
   k.play('stroke',.9,{material:'brush',dur:1.1,gain:.3,minor:true});
   k.play('stroke',1.35,{material:'brush',dur:1.1,gain:.22,minor:true});
   k.noise(5.2,{dur:1.2,color:'brown',filter:'bandpass',f:340,gain:.07,a:.5});
   k.play('stroke',5.7,{material:'brush',dur:1.2,gain:.3});stamp(6.8,.5);pluck(6.8,146.83,.5);
   [6.65,7.25,7.85].forEach(t=>k.play('stroke',t,{material:'brush',dur:.8,gain:.15,minor:true}));
   k.noise(12.1,{dur:1.45,color:'brown',filter:'bandpass',f:[[0,170],[.8,360],[1.45,180]],gain:.12,a:.6});k.play('paper',12.4,{dur:.9,gain:.5});
   [13.6,14.2,14.8,15.4,16.0].forEach((t,i)=>{stamp(t,.14);pluck(t,[146.83,196,220,293.66,440][i],.4)});
   for(let t=14;t<17.8;t+=.48)k.noise(t,{dur:.15,color:'pink',filter:'bandpass',f:700,gain:.018,a:.05,minor:true});
   stamp(18.8,.45);[146.83,220,293.66].forEach((f,i)=>pluck(18.8+i*.09,f,.5));
 }
 window.BHScene={init:makeFields,draw,score};
})();
