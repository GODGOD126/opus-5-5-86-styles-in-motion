/* Original Journey to the West animation. Paper and loaded-brush helpers adapted
 * from Futurepedia AI Style Atlas #032 Sumi-e Ink Wash; see SOURCES.txt.
 * All poses, scenery and music are deterministic functions of film time. */
'use strict';
const W=1280, HH=720, DURATION=20;
const canvas=document.querySelector('#film'), c=canvas.getContext('2d');
const nz=H.makeNoise(5081), rnd=H.rng(9002), TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const span=(t,a,b)=>smooth((t-a)/(b-a));
const lerp=(a,b,t)=>a+(b-a)*t;
let poseClock=0,poseBow=0;
// Integral of the walking speed: stop without sliding, restart without snapping.
function walkingTime(t){
 if(t<=3)return t;
 if(t<3.6){const u=(t-3)/.6;return 3+.6*(u-u*u*u+.5*u*u*u*u)}
 if(t<=8.4)return 3.3;
 if(t<9.1){const u=(t-8.4)/.7;return 3.3+.7*(u*u*u-.5*u*u*u*u)}
 if(t<=13.8)return 3.65+t-9.1;
 if(t<14.5){const u=(t-13.8)/.7;return 8.35+.7*(u-u*u*u+.5*u*u*u*u)}
 return 8.7;
}
function bowTorso(){c.translate(0,-38);c.rotate(poseBow*.55);c.translate(0,38)}
const paper=Ink.makePaper(W,HH,nz,H.rng(302),1200);
const ink='#272923', red='#9c3e2b', cream='#e9dfc8';
const paths=new Map();
function path(s){if(/\.\d{3}/.test(s))return new Path2D(s);if(!paths.has(s)){if(paths.size>2500)paths.clear();paths.set(s,new Path2D(s))}return paths.get(s)}
function texture(color,seed){
 const a=H.layer(180,180),g=a.getContext('2d'),r=H.rng(seed);g.fillStyle=color;g.fillRect(0,0,180,180);
 g.globalCompositeOperation='destination-out';
 for(let i=0;i<2300;i++){g.globalAlpha=r.range(.04,.26);g.fillRect(r()*180,r()*180,r.range(.3,2.5),r.range(.3,1.8))}
 for(let i=0;i<180;i++){g.globalAlpha=r.range(.02,.1);g.beginPath();let x=r()*180,y=r()*180;g.moveTo(x,y);g.lineTo(x+r.range(-6,10),y+r.range(5,30));g.lineWidth=r.range(.3,1);g.stroke()}
 return c.createPattern(a,'repeat');
}
const darkTex=texture(ink,10),redTex=texture(red,11),greyTex=texture('#6a6b5e',12);
function shape(d,fill=darkTex,stroke=null,width=1){const p=path(d);if(fill){c.fillStyle=fill;c.fill(p)}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke(p)}}
function line(d,color=ink,width=1.5){shape(d,null,color,width)}
function ellipse(x,y,rx,ry,fill=ink){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill()}
function segment(x,y,angle,fn){c.save();c.translate(x,y);c.rotate(angle);fn();c.restore()}

// Cached mountains: ink pools at the ridge, then bleeds into translucent mist.
function mountain(seed,base,peaks,tone){
 const a=H.layer(2200,720),g=a.getContext('2d'),n=H.makeNoise(seed),r=H.rng(seed);
 const iw=1100,ih=360,tmp=H.layer(iw,ih),tx=tmp.getContext('2d'),img=tx.createImageData(iw,ih),tops=[];
 const ridge=x=>base-peaks.reduce((sum,p)=>sum+p[1]*Math.exp(-Math.pow((x-p[0])/p[2],2)),0)+n.fbm2(x*.014,5,4)*22+n.n2(x*.065,3)*4;
 for(let x=0;x<iw;x++){const top=ridge(x*2);tops.push(top);for(let y=Math.max(0,Math.floor(top/2));y<ih;y++){
  const dy=y*2-top,k=(y*iw+x)*4,grain=.76+n.fbm2(x*.033,y*.044,4)*.53;
  const a0=tone*Math.exp(-dy/135)*clamp((690-y*2)/120)*grain*(1+.24*Math.exp(-dy/6));
  img.data[k]=37;img.data[k+1]=43;img.data[k+2]=37;img.data[k+3]=clamp(a0)*255;
 }}
 tx.putImageData(img,0,0);g.drawImage(tmp,0,0,2200,720);
 g.lineJoin='round';g.lineCap='round';g.strokeStyle=`rgba(35,39,31,${tone*.65})`;g.lineWidth=1.5;
 g.beginPath();for(let x=0;x<2200;x+=2){const y=tops[x/2];x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
 for(let i=0;i<290;i++){let x=r()*2200,y=ridge(x);g.strokeStyle=`rgba(32,37,29,${r.range(.03,.18)*tone})`;g.lineWidth=r.range(.3,2.4);g.beginPath();g.moveTo(x,y+3);g.bezierCurveTo(x-12,y+30,x+r.range(-45,45),y+55,x+r.range(-55,55),y+r.range(60,150));g.stroke()}
 return a;
}
const far=mountain(12,535,[[130,150,190],[500,245,170],[910,160,150],[1330,310,190],[1670,140,130],[2070,260,210]],.26);
const mid=mountain(41,640,[[90,170,170],[600,170,150],[1060,330,145],[1240,260,100],[1690,210,170],[2090,180,160]],.46);
const near=mountain(69,820,[[0,250,200],[1640,300,200],[2100,200,180]],.67);

const fogs=[];
for(let j=0;j<3;j++){
 const a=H.layer(1700,240),g=a.getContext('2d'),r=H.rng(81+j);
 for(let i=0;i<28;i++){const x=r()*1700,y=r()*200;g.save();g.translate(x,y);g.scale(r.range(2,4),.7);const grad=g.createRadialGradient(0,0,1,0,0,70);grad.addColorStop(0,'rgba(241,234,217,.23)');grad.addColorStop(1,'rgba(241,234,217,0)');g.fillStyle=grad;g.fillRect(-75,-75,150,150);g.restore()}
 fogs.push(a);
}

// A windswept pine, with individually drawn dry-brush needles.
const pine=(()=>{
 const a=H.layer(1280,720),g=a.getContext('2d');
 const b=(p,w,seed)=>Ink.brush(g,p,{w,seed,ink:1,dry:.8},nz);
 b([[18,684,1],[51,531,.9],[47,406,.7],[95,292,.45],[119,227,.05]],25,31);
 b([[56,451,.8],[118,388,.5],[183,379,.05]],14,32);
 b([[67,350,.6],[19,317,.3],[0,287,.05]],11,33);
 b([[95,285,.6],[169,268,.4],[225,231,.03]],10,34);
 b([[46,515,.6],[132,477,.3],[216,487,.05]],13,35);
 const r=H.rng(9);
 for(const [x,y] of [[181,376],[137,389],[216,481],[159,475],[218,232],[179,263],[120,234],[19,313],[62,343]]){
  for(let k=0;k<32;k++){const ang=r.range(-Math.PI,0),l=r.range(13,47);g.strokeStyle=`rgba(24,30,24,${r.range(.3,.85)})`;g.lineWidth=r.range(.6,1.5);g.beginPath();g.moveTo(x+r.range(-7,7),y+r.range(-3,5));g.quadraticCurveTo(x+Math.cos(ang)*l*.5,y+Math.sin(ang)*l*.7,x+Math.cos(ang)*l,y+Math.sin(ang)*l);g.stroke()}
 }
 return a;
})();

function ground(t,offset){
 c.save();c.translate(-offset,0);
 const g=c.createLinearGradient(0,560,0,720);g.addColorStop(0,'rgba(42,46,36,.18)');g.addColorStop(.35,'rgba(42,46,36,.08)');g.addColorStop(1,'rgba(42,46,36,0)');
 shape('M-100 603 Q200 546 420 572 Q630 603 850 561 Q1070 524 1340 570 Q1600 600 2000 536 L2200 720 L-100 720Z',g);
 line('M-100 603 Q200 546 420 572 Q630 603 850 561 Q1070 524 1340 570 Q1600 600 2000 536','rgba(40,45,34,.47)',2);
 for(let i=0;i<45;i++){const x=i*47,y=592+Math.sin(i*3)*18;line(`M${x} ${y}q12 -6 24 -2`,'rgba(45,48,37,.14)',1)}
 c.restore();
}
function shoe(ang,back=false){segment(back?-12:10,-38,ang,()=>{shape('M-6 0 Q-9 17 -8 32 L-13 40 Q-10 46 14 43 L16 39 L3 34 L7 0Z',darkTex);line('M-9 42L12 42',cream,.8)})}
function eye(x,y){line(`M${x-3} ${y}l6 -.7`,ink,1.7)}
function staff(x,y,angle,length=210){segment(x,y,angle,()=>{shape(`M-2 0 L-2 ${-length} L3 ${-length} L3 0Z`,darkTex);shape(`M-3 -7h7v-17h-7z M-3 ${-length+5}h7v18h-7z`,'#a88c50');line(`M0 -30V${-length+30}`,'#a39b79',.8)})}
function robeLines(){line('M-13 -118 Q-6 -84 -20 -45 M0 -108Q19 -70 10 -31 M-29 -65L-35 -35',cream,1.2)}
function tang(t,walk){
 const ph=poseClock*5.8,bob=walk*Math.cos(ph*2)*1.7;
 c.save();c.translate(0,bob);
 shoe(walk*Math.sin(ph)*.24,true);shoe(-walk*Math.sin(ph)*.24);
 bowTorso();
 shape('M-19 -150 Q-34 -126 -34 -94 L-48 -35 Q-25 -22 7 -30 L40 -34 Q20 -74 23 -119 L10 -151Z',greyTex);
 shape('M-21 -150 Q-3 -143 19 -137 L29 -96 L40 -37 Q14 -24 -27 -32 L-16 -91 L-30 -122Z',redTex);
 line('M-18 -143Q-5 -113 20 -98 M-15 -113L-23 -38 M6 -112L12 -32 M-21 -79L31 -66 M-26 -54L37 -42','#c5a878',1.3);
 shape('M18 -134Q35 -125 40 -104L54 -110L60 -99Q47 -84 27 -91L12 -107Z',redTex);
 ellipse(57,-105,7,5,cream);staff(60,-20,.06,206);
 c.save();c.translate(49,-232);line('M1 18Q-12 6 0 -6Q14 -12 19 1Q25 13 12 19',ink,2);for(let i=0;i<3;i++){c.beginPath();c.ellipse(3+i*7,14+i%2*5,4,6,0,0,TAU);c.strokeStyle='#8e784e';c.lineWidth=1.2;c.stroke()}c.restore();
 shape('M-13 -183Q5 -194 17 -179L18 -173L25 -166L19 -162Q20 -148 6 -147L-8 -151Z',cream,ink,1.5);
 eye(13,-172);line('M17 -159l-6 1',ink,.8);
 shape('M-16 -179L-22 -196L-18 -220L-7 -209L1 -231L11 -209L22 -217L24 -193L16 -180Z',redTex,ink,1.4);
 line('M-17 -195Q2 -188 21 -196 M-12 -201L-7 -211 M3 -201L1 -222 M15 -201L19 -211','#d7bc75',1.6);
 ellipse(3,-195,3,4,'#d7bc75');line('M-15 -185L-15 -153 M19 -182L23 -152',red,2);
 c.restore();
}
function pig(t,walk){
 const ph=poseClock*5.2+2,bob=walk*Math.cos(ph*2)*2;
 c.save();c.translate(0,bob);
 shoe(walk*Math.sin(ph)*.29,true);shoe(-walk*Math.sin(ph)*.29);
 bowTorso();
 shape('M-21 -130Q-48 -116 -49 -76Q-49 -42 -31 -27L28 -29Q45 -40 45 -80Q44 -116 17 -130Z',darkTex);
 shape('M-6 -126Q35 -121 38 -83Q25 -71 -7 -79L-14 -112Z','#aaa48d',ink,1.5);
 line('M-4 -119L-15 -47 M-35 -82Q-20 -64 -30 -31 M5 -64L12 -32',cream,1.2);
 shape('M-28 -121Q-43 -121 -47 -100L-40 -82L-23 -91L-11 -111Z',greyTex);
 ellipse(-34,-88,7,6,'#bdb498');
 segment(-31,-90,-.98,()=>{staff(0,0,0,195);shape('M-21 -183Q0 -191 24 -183L24 -176Q0 -179 -21 -176Z',darkTex);for(let j=-19;j<=21;j+=5)line(`M${j} -181l-1 -15`,ink,2)});
 shape('M-19 -163Q-2 -183 17 -165L24 -152L40 -151L43 -140L29 -133Q13 -117 -9 -130L-21 -143Z','#b9ad91',ink,1.6);
 shape('M-15 -155Q-41 -166 -32 -142Q-29 -128 -16 -139Z',greyTex,ink,1.3);
 ellipse(36,-144,2,2,ink);ellipse(29,-143,1.5,2,ink);eye(15,-155);line('M26 -134Q14 -130 10 -133',ink,1.3);
 shape('M-23 -160Q-24 -184 -5 -186Q13 -187 19 -169L25 -162Z',darkTex);
 line('M-22 -160L20 -163',cream,.9);shape('M-19 -171Q-39 -175 -43 -156Q-28 -167 -19 -166Z',darkTex);
 c.restore();
}
function sha(t,walk){
 const ph=poseClock*5.6+4,bob=walk*Math.cos(ph*2)*1.7;
 c.save();c.translate(0,bob);
 shoe(walk*Math.sin(ph)*.27,true);shoe(-walk*Math.sin(ph)*.27);
 bowTorso();
 shape('M-20 -150Q-35 -118 -31 -87L-41 -32Q-20 -23 2 -32L35 -27L26 -89Q34 -128 14 -148Z',greyTex);
 shape('M-19 -140L-2 -116L20 -144L29 -124L7 -95L-21 -104Z',darkTex);robeLines();
 shape('M-28 -133Q-43 -116 -52 -112L-49 -99Q-29 -94 -14 -113Z',greyTex,ink,1.1);
 ellipse(-49,-106,7,5,'#ab9e81');
 const swing=Math.sin(ph)*walk*.05;
 segment(-3,-147,swing,()=>{
 line('M-88 4Q-2 -9 91 1',ink,5);line('M-87 3Q-2 -7 90 0','#b0a07b',1);
 for(const x of [-78,78]){line(`M${x} 3q-4 22 -2 48`,ink,1.3);segment(x,51,-swing*.7,()=>{shape('M-23 0Q-17 -8 0 -5Q18 -9 24 0L22 34Q0 39 -23 33Z',greyTex,ink,1.5);line('M-21 10L22 10M-21 25L21 25M-8 -4V35M10 -4V35','#c2b99f',1);line('M-21 -1L-23 33M22 -1L22 32',ink,2)})}
 });
 shape('M-16 -185Q3 -200 19 -181L18 -173L25 -165L18 -160L14 -144L-8 -148L-19 -165Z','#b4a789',ink,1.5);
 shape('M-19 -182Q-24 -198 -2 -200Q18 -199 20 -183L-4 -189Z',darkTex);
 shape('M-13 -163Q0 -152 18 -164Q19 -142 3 -131Q-18 -143 -13 -163Z',darkTex);line('M-5 -153L1 -137',cream,.7);eye(13,-174);
 for(let i=0;i<8;i++){const a=.1+i/7*Math.PI;ellipse(Math.cos(a)*25,-144+Math.sin(a)*22,4.4,4.4,ink)}
 c.restore();
}
function monkey(t,walk,action){
 const ph=poseClock*7.1,bob=walk*Math.cos(ph*2)*2.4;
 const strike=span(t,6.05,6.78)*(1-span(t,7.1,8.35));
 c.save();c.translate(0,bob);c.rotate(-.1*action);
 line(`M-21 -59C-64 ${-65+Math.sin(t*3)*12} -74 -103 -52 -118C-33 -128 -27 -108 -43 -104`,ink,3.4);
 if(action>.1){segment(-8,-52,-.9*action,()=>{shape('M-8 0L-10 27L-27 41L-20 47L3 34L10 3Z',darkTex)});segment(12,-50,.9*action,()=>{shape('M-7 0L-3 31L17 44L24 42L8 26L9 1Z',darkTex)})}
 else{shoe(walk*Math.sin(ph)*.46,true);shoe(-walk*Math.sin(ph)*.46)}
 bowTorso();
 shape('M-17 -133Q-28 -102 -22 -70L-33 -40L-11 -47L-1 -37L10 -47L29 -41L19 -79L23 -118L10 -133Z','#a58b54',ink,1.5);
 shape('M-24 -70L22 -73L27 -58L-23 -55Z',redTex);line('M-17 -113L-10 -76 M16 -114L7 -78',ink,1.4);
 shape('M-16 -128Q-26 -137 -32 -129L-25 -107L-13 -112Z',darkTex);
 const arm=-.35-action*1.8+strike*2.5;
 segment(18,-119,arm,()=>{shape('M-4 -3Q10 -7 14 10L27 28L20 35L3 20L-7 7Z',darkTex);ellipse(24,32,6,6,'#baaa87');staff(24,64,action*1.25+.18+strike*.85,225)});
 shape('M-13 -163Q-3 -184 14 -170Q25 -164 19 -151L28 -147L24 -140L15 -137L12 -126L-6 -129L-19 -146Z','#af986b',ink,1.6);
 shape('M-10 -157Q-7 -168 1 -161Q8 -170 17 -160L17 -150L22 -146L15 -141L9 -133L-1 -138L-8 -144Z',cream);
 ellipse(-14,-151,7,9,'#b8a37d');line('M-15 -153q6 -4 5 6',ink,1);eye(12,-156);line('M17 -142l-8 -1',ink,1.1);
 shape('M-19 -164L-23 -172L-16 -171L-13 -183L-4 -177L1 -187L7 -178L16 -182L19 -169Z',darkTex);
 line('M-17 -164Q0 -173 19 -165','#b79d59',3.2);
 // Wind-driven scarf: shape changes continuously, not a rigid rotating sticker.
 const f=Math.sin(t*6)*6;
 shape(`M-10 -132Q-37 -128 -56 ${-143+f}Q-70 -152 -87 ${-137+f}L-68 -136Q-38 -113 -10 -125Z`,redTex);
 c.restore();
}

function shadow(x,y,s,alpha=.13){c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(s,1);const g=c.createRadialGradient(0,0,0,0,0,40);g.addColorStop(0,ink);g.addColorStop(1,'rgba(35,37,31,0)');c.scale(1,.2);c.fillStyle=g;c.fillRect(-40,-40,80,80);c.restore()}
const smokeTexture=(()=>{
 const a=H.layer(600,620),g=a.getContext('2d'),n=H.makeNoise(49),im=g.createImageData(600,620);
 for(let y=0;y<620;y++)for(let x=0;x<600;x++){
  const dx=(x-290)/220,dy=(y-330)/230,r=Math.hypot(dx,dy),v=n.fbm2(x*.013,y*.013,4);
  const alpha=clamp((1-r+.9*v)*.8)*(.7+.4*n.n2(x*.05,y*.05));const k=(y*600+x)*4;im.data[k]=32;im.data[k+1]=36;im.data[k+2]=31;im.data[k+3]=alpha*220;
 }g.putImageData(im,0,0);return a;
})();
function smoke(t){
 const grow=span(t,2.4,3.7),breakup=span(t,6.8,8.6);
 if(grow<=0||breakup>=1)return;
 c.save();c.globalAlpha=grow*(1-breakup)*.63;
 for(let i=0;i<3;i++){c.save();c.translate(1035+(i-1)*55+breakup*(i-1)*230,380-breakup*(95+i*45));c.rotate(Math.sin(t*.7+i)*.12+breakup*(i-1)*.5);const s=.65+grow*.2+i*.06;c.scale(s,s);c.drawImage(smokeTexture,-300,-310);c.restore()}
 c.restore();
}
function sweep(t){
 const u=clamp((t-6.1)/.85),a=Math.sin(u*Math.PI)*.65;
 if(a<=0)return;c.save();c.globalAlpha=a;
 const p=[];for(let i=0;i<=30;i++){const an=-2.5+i/30*4.5*u;p.push([955+Math.cos(an)*190,360+Math.sin(an)*130,.25+Math.sin(i/30*Math.PI)*.7])}
 Ink.brush(c,p,{w:19,dry:1.4,seed:713,ink:.8,pool:0,rim:0},nz);c.restore();
}
function birds(t){c.save();c.globalAlpha=.5;for(let i=0;i<5;i++){const x=820+i*25-t*7,y=155+Math.sin(i*1.7)*16;const wing=Math.sin(t*5+i)*5;line(`M${x-7} ${y+wing}Q${x-2} ${y-2} ${x} ${y+2}Q${x+2} ${y-2} ${x+7} ${y+wing}`,ink,1.2)}c.restore()}
function seal(x,y,text,alpha=1){c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(-.035);c.fillStyle=redTex;c.fillRect(0,0,28,30);c.strokeStyle='#ead8b8';c.lineWidth=.8;c.strokeRect(2,2,24,26);c.font='19px JourneyKai';c.fillStyle='#eee2c7';c.textAlign='center';c.fillText(text,14,22);c.restore()}
function caption(t){
 const beats=[
  [0,2.5,'一念向西，踏入万重山。'],
  [2.5,5.4,'黑风拦路，妖怪现身。'],
  [5.4,8.6,'悟空挥棒，降妖破障。'],
  [8.6,13.1,'越过万山，终见灵山。'],
  [13.1,17.5,'师徒四人，躬身拜见如来。'],
  [17.5,20.4,'千山万水，终得真经。']
 ];
 for(const [a,b,text] of beats){if(t<a||t>b)continue;const opacity=span(t,a,a+.32)*(1-span(t,b-.25,b));c.save();c.globalAlpha=opacity;c.font='27px JourneyKai';c.fillStyle='#404337';c.textAlign='center';c.fillText(text,640,671);c.restore()}
}
function draw(t){
 poseClock=walkingTime(t);poseBow=0;
 c.clearRect(0,0,W,HH);c.drawImage(paper,0,0);
 const arrival=span(t,9,14),cam=t*10+arrival*155;
 c.save();c.globalCompositeOperation='multiply';
 c.save();c.globalAlpha=.19*(1-span(t,2.4,3.7))+.05*arrival;ellipse(1010-cam*.15,163,49,49,redTex);c.restore();
 c.drawImage(far,-cam*.24,0);c.globalAlpha=1-arrival*.52;c.drawImage(mid,-210-cam*.46,12+arrival*20);c.restore();
 c.drawImage(fogs[0],-190+(t*9)%150,352,1700,240);birds(t);
 c.save();c.globalAlpha=.55*(1-arrival*.5);c.drawImage(near,-cam*.8,0);c.restore();
 ground(t,cam*.5);temple(t);
 // Dark wind gives way to the demon, so the obstacle has an identifiable cause.
 smoke(t);demon(t);
 c.save();const zoom=1-arrival*.14;c.translate(640-arrival*112,555);c.scale(zoom,zoom);c.translate(-640,-555);
 const halt=clamp(1-span(t,3,3.6)+span(t,8.4,9.1)-span(t,13.8,14.5));
 const haltTravel=poseClock*11;
 const actors=[{x:260,fn:sha,scale:.91,phase:.2},{x:406,fn:pig,scale:.94,phase:.5},{x:565,fn:tang,scale:.98,phase:0}];
 for(const [i,o] of actors.entries()){
  const x=o.x+haltTravel-cam*.22;poseBow=span(t,15.1+i*.17,16.3+i*.17)*(1-span(t,18.1,19.1)*.72);
  shadow(x,571,1.2);c.save();c.translate(x,566);c.scale(o.scale,o.scale);o.fn(t+o.phase,halt);c.restore();
 }
 const leap=span(t,4.9,6),land=span(t,7.2,8.5),air=leap*(1-land);
 const mx=755+haltTravel-cam*.22+145*leap-145*land;
 poseBow=span(t,15.2,16.4)*(1-span(t,18.1,19.1)*.72);
 shadow(mx,568,1-air*.55,.15*(1-air*.65));c.save();c.translate(mx,565-air*190);c.scale(.94,.94);monkey(t,halt,air);c.restore();c.restore();
 sweep(t);demonFragments(t);
 // A moving bank of pale mist joins the mountain road to the temple forecourt.
 const veil=Math.sin(Math.PI*clamp((t-8.9)/3.5))*.65;
 if(veil>0){c.save();c.globalAlpha=veil;c.drawImage(fogs[2],-500+(t-8.9)*145,230,2100,430);c.restore()}
 buddha(t);sutra(t);
 c.save();c.globalAlpha=.65;c.drawImage(fogs[1],-240+t*13,526,1700,180);c.restore();
 c.save();c.translate(-75-cam*.65,28);c.drawImage(pine,0,0);c.restore();
 c.save();c.globalAlpha=.65;Ink.brush(c,[[0,665,1],[80,637,.6],[151,641,.2]],{w:32,seed:99,dry:1.4,rim:.1,pool:.2},nz);c.restore();
 c.save();c.globalAlpha=1-span(t,1.8,2.7);c.font='62px JourneyKai';c.fillStyle=ink;c.textAlign='center';c.fillText('西',1134,180);c.fillText('行',1134,252);seal(1120,275,'记');c.restore();
 if(arrival>0){c.save();c.globalAlpha=span(t,12.1,13.4);c.font='45px JourneyKai';c.fillStyle=ink;c.textAlign='center';['终','见','灵','山'].forEach((ch,i)=>c.fillText(ch,112,164+i*54));seal(98,355,'悟');c.restore()}
 caption(t);
}

// Sparse pentatonic plucks + footsteps + moving air. No network or speech APIs.
let audioContext=null,audioBus=null,audioNodes=[],soundEnabled=true;
const score=[];const notes=[196,246.94,293.66,392,440,392,293.66,246.94,196,293.66,392,587.33,440,392,293.66,246.94];
notes.forEach((n,i)=>score.push({t:.35+i*1.19,f:n,d:2.2,g:.055,type:'pluck'}));
for(let t=.5;t<14.5;t+=.54)if(t<3.5||t>8.6)score.push({t,f:110+(Math.round(t*10)%3)*25,d:.075,g:.025,type:'step'});
score.push({t:2.5,d:2.3,g:.09,type:'wind'},{t:6.05,d:.9,g:.18,type:'wind'},{t:6.68,f:73.42,d:.6,g:.13,type:'pluck'},{t:12.4,f:293.66,d:3.6,g:.065,type:'pluck'},{t:17.65,f:587.33,d:2.2,g:.05,type:'pluck'});
function stopSound(){for(const n of audioNodes){try{n.stop()}catch{}}audioNodes=[];if(audioBus){audioBus.disconnect();audioBus=null}document.body.dataset.audio='stopped'}
function startSound(from){
 stopSound();if(!soundEnabled)return;
 audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();
 audioBus=audioContext.createGain();audioBus.gain.value=.75;audioBus.connect(audioContext.destination);
 const base=audioContext.currentTime+.025;
 for(const e of score){if(e.t+e.d<=from)continue;const elapsed=Math.max(0,from-e.t),when=base+Math.max(0,e.t-from),remain=e.d-elapsed;
  const gain=audioContext.createGain();gain.connect(audioBus);const level=e.g*Math.exp(-elapsed/(e.d*.27));gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,level),when+.016);gain.gain.exponentialRampToValueAtTime(.0001,when+Math.max(.03,remain));
  if(e.type==='wind'){
   const len=Math.ceil(audioContext.sampleRate*remain),buf=audioContext.createBuffer(1,len,audioContext.sampleRate),data=buf.getChannelData(0),r=H.rng(Math.round(e.t*100));let prev=0;for(let j=0;j<len;j++){prev=.97*prev+.03*(r()*2-1);data[j]=prev*3}
   const src=audioContext.createBufferSource();src.buffer=buf;const filter=audioContext.createBiquadFilter();filter.type='bandpass';filter.frequency.value=520;filter.Q.value=.5;src.connect(filter);filter.connect(gain);src.start(when);src.stop(when+remain);audioNodes.push(src);
  }else{for(let j=1;j<=(e.type==='pluck'?3:1);j++){const osc=audioContext.createOscillator(),partial=audioContext.createGain();osc.type='sine';osc.frequency.value=e.f*j;partial.gain.value=1/(j*j);osc.connect(partial);partial.connect(gain);osc.start(when);osc.stop(when+remain+.02);audioNodes.push(osc)}}
 }
 document.body.dataset.audio='running';
}
const playButton=document.querySelector('#play'),startButton=document.querySelector('#start'),slider=document.querySelector('#progress'),timeLabel=document.querySelector('#time'),soundButton=document.querySelector('#sound');
let current=0,playing=false,origin=0,ready=false;
const startIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l15 9-15 9z"/></svg>',pauseIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h4v18H6zM14 3h4v18h-4z"/></svg>';
function update(){slider.value=current;timeLabel.value=`00:${String(Math.floor(current)).padStart(2,'0')} / 00:20`;const label=playing?'暂停':'播放';if(playButton.getAttribute('aria-label')!==label){playButton.innerHTML=playing?pauseIcon:startIcon;playButton.setAttribute('aria-label',label);}startButton.hidden=playing||current>0;document.body.dataset.state=playing?'playing':'paused';document.body.dataset.time=current.toFixed(3)}
function pause(){playing=false;stopSound();update()}
function play(){if(!ready)return;if(current>=DURATION)current=0;playing=true;origin=performance.now()-current*1000;startSound(current);update()}
function seek(t){current=clamp(Number(t)||0,0,DURATION);if(current>=DURATION)pause();else if(playing){origin=performance.now()-current*1000;startSound(current)}draw(current);update()}
function toggle(){playing?pause():play()}
playButton.onclick=toggle;startButton.onclick=play;canvas.onclick=toggle;
document.querySelector('#replay').onclick=()=>{pause();seek(0);play()};
slider.addEventListener('input',()=>seek(slider.value));
soundButton.onclick=()=>{soundEnabled=!soundEnabled;soundButton.setAttribute('aria-pressed',String(soundEnabled));soundButton.setAttribute('aria-label',soundEnabled?'关闭声音':'开启声音');soundButton.style.opacity=soundEnabled?'1':'.4';if(playing&&soundEnabled)startSound(current);else stopSound()};
document.addEventListener('keydown',e=>{if(e.target===slider)return;if(e.code==='Space'){e.preventDefault();toggle()}if(e.code==='ArrowRight'){e.preventDefault();seek(current+1)}if(e.code==='ArrowLeft'){e.preventDefault();seek(current-1)}});
window.seek=seek;window.DURATION=DURATION;window.renderFrame=draw;
window.addEventListener('error',e=>{const box=document.querySelector('#error');box.hidden=false;box.textContent=e.message});
window.addEventListener('pagehide',stopSound);
function tick(now){if(playing){current=Math.min(DURATION,(now-origin)/1000);draw(current);if(current>=DURATION)pause();update()}requestAnimationFrame(tick)}
document.fonts.load('32px JourneyKai').then(()=>{ready=true;const q=new URLSearchParams(location.search);seek(q.get('t')||0);document.body.dataset.ready='true';requestAnimationFrame(tick)});
