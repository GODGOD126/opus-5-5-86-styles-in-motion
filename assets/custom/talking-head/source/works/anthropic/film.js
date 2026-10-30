/* Anthropic, 20 seconds. Actual official photography, logos and browser captures.
 * Style helpers adapted from Futurepedia #011. See sources in index.html. */
'use strict';
const DURATION=20,canvas=document.querySelector('#film'),ctx=canvas.getContext('2d'),C=Collage;
const INK='#1a1816',PAPER='#f0e9d9',RED='#b8483a',NEWS='#e9e1cb';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const span=(t,a,b)=>ease((t-a)/(b-a));
const mix=(a,b,u)=>a+(b-a)*u;
const imgs={},S={};
const fonts={head:'EssayHei',serif:'EssaySong',number:'EssayImpact'};
const assets={dario:'dario.webp',daniela:'daniela.webp',anthropic:'anthropic-logo.svg',claude:'claude-logo.svg',announcement:'claude-announcement-title.png',date:'claude-announcement-date.png',pro:'pricing-pro.png',api:'pricing-api.png'};
function photo(img,w,h){
 return C.treat(w,h,24,(g)=>{const s=Math.max(w/img.width,h/img.height);g.filter='grayscale(1)';g.drawImage(img,(w-img.width*s)/2,(h-img.height*s)/2,img.width*s,img.height*s);g.filter='none'}, {cell:3.1,mix:.77,con:1.07,blur:.2,lift:.05});
}
function nativePrint(img,w,seed){const h=Math.round(w*img.height/img.width),a=H.layer(w,h),g=a.getContext('2d');g.drawImage(img,0,0,w,h);return C.makePrint(a,seed,[0,1,1,0],11,5)}
function strip(text,size=52,o={}){return C.makeStrip(text,`${o.weight||400} ${size}px ${o.font||fonts.head}`,{seed:o.seed||12,sh:.65,padX:18,padY:12,...o})}
function logo(img,w,h,seed){return C.sprite(w,h,30,g=>{const p=C.edgePoly(w,h,[0,0,0,0],seed,4);C.shadowFill(g,p,'#faf6eb',.8);C.texture(g,p,.36,30,20);const iw=w-42,ih=iw*img.height/img.width;g.drawImage(img,-iw/2,-ih/2,iw,ih)})}
function plain(g,text,x,y,size=28,col=INK,font=fonts.head,align='left'){g.save();g.fillStyle=col;g.font=`${size}px ${font}`;g.textAlign=align;g.fillText(text,x,y);g.restore()}
function at(g,x,y,r,scale,fn){g.save();g.translate(x,y);g.rotate(r);g.scale(scale,scale);fn(g);g.restore()}
function pop(g,s,x,y,t,a,rot=0,scale=1,kind='drop',extra){
 const p=C.arrive(C.q12(t),a,kind);if(!p)return;
 at(g,x+p.dx,y+p.dy,rot+p.r,scale*p.s,gg=>{C.drawSpr(gg,s);if(extra)extra(gg)});
}
function taped(g,s,x,y,t,a,rot=0,scale=1,kind='drop'){
 pop(g,s,x,y,t,a,rot,scale,kind,gg=>{if(t>a+.18)C.tape(gg,-s.w*.28,-s.h/2+3,92,26,-.23,8);if(t>a+.3)C.tape(gg,s.w*.32,-s.h/2+3,76,24,.3,19)});
}
function board(g,x,y,w,h,rot,color,seed){at(g,x,y,rot,1,gg=>{const p=C.edgePoly(w,h,[1,1,1,1],seed,7);C.shadowFill(gg,p,color,.6);C.texture(gg,p,.58,100,80)})}
function base(g,t,tint=PAPER){g.fillStyle=tint;g.fillRect(0,0,1280,720);g.save();g.globalCompositeOperation='multiply';g.drawImage(C.fibre(),-210-t*2,-130,1700,935);g.restore()}
function kicker(g,n,label){plain(g,`0${n} / ${label}`,58,46,23,'#6c6150');g.strokeStyle='#1a18162b';g.lineWidth=1;g.beginPath();g.moveTo(58,61);g.lineTo(1222,61);g.stroke()}
function source(g,text){plain(g,text,1218,649,17,'#756b5d',fonts.head,'right')}
function underline(g,x,y,w,t,a){C.hilite(g,[x,y,w,45],span(t,a,a+.55),12)}

async function initFilm(){
 await Promise.all(Object.entries(assets).map(([key,file])=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{imgs[key]=im;res()};im.onerror=()=>rej(new Error('素材加载失败：'+file));im.src='assets/'+file})));
 await Promise.all(['54px EssayHei','30px EssaySong','100px EssayImpact'].map(f=>document.fonts.load(f)));
 C.fibre();
 S.dario=C.makePrint(photo(imgs.dario,286,358),72,[0,1,1,0],14,7);
 S.daniela=C.makePrint(photo(imgs.daniela,286,358),73,[1,0,1,0],14,7);
 S.company=logo(imgs.anthropic,410,100,41);S.product=logo(imgs.claude,420,126,42);
 S.productSmall=logo(imgs.claude,290,97,43);
 S.ann=nativePrint(imgs.announcement,480,44);S.date=nativePrint(imgs.date,225,45);
 S.pro=nativePrint(imgs.pro,360,46);S.api=nativePrint(imgs.api,405,47);
 S.hook1=strip('Claude 背后',76,{seed:1});S.hook2=strip('是谁？',100,{bg:INK,fg:PAPER,seed:2});
 S.n2021=strip('2021',118,{font:fonts.number,seed:4});S.n2023=strip('2023',92,{font:fonts.number,seed:5});
 S.darioName=strip('Dario Amodei',30,{bg:INK,fg:PAPER,seed:6});S.danielaName=strip('Daniela Amodei',30,{bg:INK,fg:PAPER,seed:7});
 S.founder=strip('兄妹等人联合创办',38,{seed:8,hl:'联合创办'});
 S.companyTag=strip('公司',40,{seed:9,bg:INK,fg:PAPER});S.productTag=strip('产品',40,{seed:10,bg:INK,fg:PAPER});
 S.revenue=strip('它怎样赚钱？',62,{seed:11});
 S.sub=strip('付费订阅',46,{seed:13,hl:'付费订阅'});S.usage=strip('API 按量计费',46,{seed:14,hl:'按量计费'});
 S.final1=strip('把模型能力',82,{seed:16,bg:INK,fg:PAPER});S.final2=strip('变成可购买的服务',72,{seed:17,hl:'可购买的服务'});
 S.business=strip('订阅  +  API',35,{seed:18});S.token=strip('Token',22,{seed:19,padY:7,padX:9,sh:.3});
 S.brand=logo(imgs.anthropic,340,90,20);
}

function opening(g,t){
 base(g,t);kicker(g,1,'CLAUDE 的幕后公司');
 board(g,1045,330,570,880,.02,RED,21);
 // Actual founders' photos arrive on separate depth planes, retaining their identities.
 taped(g,S.daniela,990,324,t,0,.055,.87,'slideU');
 taped(g,S.dario,760,355,t,.17,-.07,.96,'drop');
 pop(g,S.hook1,320,272,t,0,-.025,1);
 pop(g,S.hook2,300,409,t,.42,.015,1);
 underline(g,110,291,416,t,.92);
 pop(g,S.brand,356,548,t,1.35,-.02,.96,'slideU');
 C.marker(g,C.loopPts(770,292,93,120,3.2),span(t,1.65,2.25),RED,5);
}

function founding(g,t){
 base(g,t);kicker(g,2,'创始团队');
 board(g,390,320,650,550,-.013,'#c9a878',22);
 taped(g,S.dario,225,321,t,3.08,-.035,.92,'slideL');
 taped(g,S.daniela,522,317,t,3.25,.035,.92,'drop');
 pop(g,S.darioName,229,527,t,3.58,-.022,.95);
 pop(g,S.danielaName,528,527,t,3.75,.018,.95);
 plain(g,'联合创始人 · CEO',227,581,28,INK,fonts.head,'center');
 plain(g,'联合创始人 · 总裁',529,581,28,INK,fonts.head,'center');
 pop(g,S.n2021,955,218,t,3.45,.018,1.08,'slideD');
 pop(g,S.company,957,370,t,4.05,-.02,1,'slideR');
 C.inkArrow(g,C.quadPts(718,331,765,302,751,359),span(t,4.38,4.85),3.5,INK);
 pop(g,S.founder,951,478,t,4.65,.012,1,'slideU',gg=>C.hilite(gg,S.founder.hl,span(t,5.12,5.7),3));
 plain(g,'AI 研究与产品公司',956,562,32,INK,fonts.head,'center');
}

function product(g,t){
 base(g,t);kicker(g,3,'从公司到产品');
 board(g,1090,355,480,850,.035,RED,23);
 // The same company mark is carried forward and connected to the product it develops.
 pop(g,S.companyTag,284,181,t,7.02,-.03);
 pop(g,S.company,285,285,t,7.08,-.016,1.02,'slideL');
 pop(g,S.productTag,948,181,t,7.28,.022);
 pop(g,S.product,950,288,t,7.42,.025,1.12,'slideR');
 C.inkArrow(g,C.quadPts(530,277,635,215,711,278),span(t,7.76,8.32),4,INK);
 if(t>8.1)plain(g,'研发 · 推出',620,222,28,INK,fonts.head,'center');
 pop(g,S.n2023,285,486,t,8.38,-.025,.9,'drop');
 taped(g,S.ann,803,462,t,8.65,.012,.94,'slideU');
 pop(g,S.date,1052,554,t,8.95,-.03,.85,'drop');
 C.hilite(g,[615,454,320,34],span(t,9.3,9.85),30);
}

function business(g,t){
 base(g,t);kicker(g,4,'两种收费入口');
 board(g,1180,396,370,720,.01,RED,24);
 // One product fans out into two observable charging mechanisms.
 pop(g,S.productSmall,640,126,t,11.25,-.014,1,'drop');
 C.inkArrow(g,C.quadPts(520,164,385,180,326,214),span(t,11.55,12.05),3.2,INK);
 C.inkArrow(g,C.quadPts(760,164,900,180,950,214),span(t,11.82,12.32),3.2,INK);
 if(t>11.85)plain(g,'个人与团队',323,243,36,INK,fonts.head,'center');
 if(t>12.12)plain(g,'开发者与企业',955,243,36,INK,fonts.head,'center');
 taped(g,S.pro,320,421,t,12.05,-.018,.96,'slideU');
 taped(g,S.api,957,424,t,12.38,.014,.98,'slideU');
 pop(g,S.sub,319,616,t,12.9,-.015,1,'drop',gg=>C.hilite(gg,S.sub.hl,span(t,13.45,14.05),40));
 pop(g,S.usage,955,616,t,13.2,.012,1,'drop',gg=>C.hilite(gg,S.usage.hl,span(t,14.15,14.8),41));
 // Paper token slips travel along the API branch; a marker emphasizes real Input/Output rows.
 if(t>14.2&&t<16.7){const u=((C.q12(t)-14.2)%1.0)/1.0;const pts=C.quadPts(760,164,900,180,950,214);const [x,y]=pts[Math.floor(clamp(u)*31)];at(g,x,y,-.04,.7,gg=>C.drawSpr(gg,S.token))}
 C.marker(g,C.linePts(811,500,1103,500,19,12,1.8),span(t,15,15.45),RED,3.2);
}

function ending(g,t){
 base(g,t);kicker(g,5,'商业逻辑');
 board(g,647,358,1070,416,-.016,RED,26);
 taped(g,S.dario,114,160,t,17.12,-.09,.34,'drop');
 taped(g,S.daniela,1158,534,t,17.28,.07,.34,'drop');
 pop(g,S.final1,508,279,t,17.42,-.021,1,'drop');
 C.inkArrow(g,C.quadPts(1016,257,1126,267,1078,346),span(t,17.72,18.15),7.2,INK);
 pop(g,S.final2,654,405,t,17.82,.015,1,'drop',gg=>C.hilite(gg,S.final2.hl,span(t,18.35,19.02),51));
 pop(g,S.business,657,544,t,18.45,-.01,1,'slideU');
}

const scenes=[opening,founding,product,business,ending];
const cuts=[3,7,11.2,17];
const surface=H.layer(1280,720),sc=surface.getContext('2d');
function camera(t){
 let id=cuts.filter(x=>t>=x).length;const start=id?cuts[id-1]:0;
 let x=(t-start)*2.3,y=0,z=1+Math.min(.018,(t-start)*.0035),blur=0;
 const prev=id?cuts[id-1]:-99,next=id<cuts.length?cuts[id]:99;
 if(t<prev+.32){const u=1-clamp((t-prev)/.32);if(id%2)x-=1350*u*u*u;else y-=820*u*u*u;blur=19*u}
 if(t>next-.25){const u=clamp((t-next+.25)/.25);if((id+1)%2)x+=1350*u*u*u;else y+=820*u*u*u;blur=19*u}
 return {id,x,y,z,blur};
}
function caption(t){
 const beats=[[0,3,'Claude 背后，是一家怎样的公司？'],[3,7,'2021 年，Amodei 兄妹等人创办 Anthropic。'],[7,11.2,'2023 年推出 Claude，走向产品化。'],[11.2,17,'付费订阅与 API 调用，让模型能力变成收入。'],[17,20.4,'把模型能力，变成可购买的服务。']];
 const b=beats.find(([a,z])=>t>=a&&t<z);if(!b)return;
 ctx.save();ctx.globalAlpha=span(t,b[0]+.1,b[0]+.36)*(1-span(t,b[1]-.18,b[1]));ctx.fillStyle='rgba(240,233,217,.94)';ctx.fillRect(0,668,1280,52);plain(ctx,b[2],640,703,27,INK,fonts.head,'center');ctx.restore();
}
function draw(t){
 const cam=camera(t);sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,1280,720);base(sc,t);
 sc.save();sc.translate(640,360);sc.scale(cam.z,cam.z);sc.translate(-640-cam.x,-360-cam.y);scenes[cam.id](sc,t);sc.restore();
 ctx.fillStyle=PAPER;ctx.fillRect(0,0,1280,720);ctx.save();if(cam.blur>.7)ctx.filter=`blur(${cam.blur*.35}px)`;ctx.drawImage(surface,0,0);ctx.restore();
 C.finish(ctx,t,.24);caption(t);
 document.body.dataset.scene=String(cam.id+1);
}
window.DURATION=DURATION;window.renderFrame=draw;

