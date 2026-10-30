import * as THREE from './vendor/three.module.js';
import {createStudio} from './studio.js';
import {DURATION,BPM,BEAT,BEAT0,at,CUE,FLAG,JUMPS,clamp,win,ease,mix,punch,stateAt} from './timing.js';

// Motion study: Futurepedia #07 Papercraft Models (hinge builds, weight, contact, travelling camera).
// The user's chosen interpretation is a solid miniature editor, with a voxel Mario and smooth action.
export function createScene(canvas,{embedded=false}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
 const exportHD=new URLSearchParams(location.search).has('export');
 renderer.setPixelRatio(1);renderer.setSize(exportHD?1920:embedded?800:1600,exportHD?1080:embedded?450:900,false);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(39,16/9,.1,180);
 const studio=createStudio(renderer,scene,{embedded});
 const world=new THREE.Group();scene.add(world);
 const mats=new Map(),geos=new Map(),cube=new THREE.BoxGeometry(1,1,1);
 const mat=(c)=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.42,metalness:.05}));return mats.get(c);};
 const group=(parent=world)=>{const g=new THREE.Group();parent.add(g);return g;};
 function box(w,h,d,c,x=0,y=0,z=0,parent=world){const m=new THREE.Mesh(cube,typeof c==='string'?mat(c):c);m.scale.set(w,h,d);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function rounded(w,h,d,c,x=0,y=0,z=0,parent=world,r=.15){
  const code=[w,h,d,r].join(':');let geo=geos.get(code);
  if(!geo){const s=new THREE.Shape(),a=-w/2,b=-d/2;const rr=Math.min(r,w/3,d/3);s.moveTo(a+rr,b);s.lineTo(a+w-rr,b);s.quadraticCurveTo(a+w,b,a+w,b+rr);s.lineTo(a+w,b+d-rr);s.quadraticCurveTo(a+w,b+d,a+w-rr,b+d);s.lineTo(a+rr,b+d);s.quadraticCurveTo(a,b+d,a,b+d-rr);s.lineTo(a,b+rr);s.quadraticCurveTo(a,b,a+rr,b);const bevel=Math.min(.095,h*.22,w*.12,d*.12);geo=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:5,steps:1,curveSegments:12});geo.rotateX(-Math.PI/2);geos.set(code,geo);}
  const m=new THREE.Mesh(geo,typeof c==='string'?mat(c):c);m.position.set(x,y,z);m.castShadow=!(m.material.transmission>0);m.receiveShadow=true;parent.add(m);return m;
 }
 function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
 function plane(w,d,texture,x,y,z,parent=world){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);parent.add(m);return m;}
 function label(s,w,d,x,y,z,color='#cfddd8',parent=world,size=68,bg=null){const texture=tex(768,Math.max(64,Math.round(768*d/w)),(c,W,H)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,W,H);}c.fillStyle=color;c.font=`700 ${H*.76}px "Microsoft YaHei","Segoe UI",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(s,W/2,H/2,W*.96);});return plane(w,d,texture,x,y,z,parent);}
 function rod(a,b,r,c,parent=world){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,A.distanceTo(B),12),typeof c==='string'?mat(c):c);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());m.castShadow=true;parent.add(m);return m;}
 const C={cream:'#667887',shell:'#203147',dark:'#1a2b3c',panel:'#101d2d',rail:'#476269',white:'#faf3de',cyan:'#50c9d0',blue:'#468bb7',orange:'#ff9c5b',yellow:'#ffd25f',red:'#e33b31'};
 // One thick software window; all components share its physical coordinate system.
 rounded(28,.70,16,studio.panelGlass,0,-.78,0,world,.62);
 rounded(28.1,.17,16.1,studio.edgeGlass,0,-.13,0,world,.62);
 rounded(27.2,.10,15.2,studio.faceGlass,0,.06,0,world,.52);
 const edgeMaterial=new THREE.MeshStandardMaterial({color:'#adc5d5',emissive:'#5794ac',emissiveIntensity:.04,roughness:.18,metalness:.55});
 rounded(26.8,.025,.035,edgeMaterial,0,-.17,8.08,world,.01);
 for(let i=0;i<15;i++)rounded(.13,.12,.025,'#52726e',-6.8+i*.23,-.51,8.06,world,.02);
 label('MARIO CUT',4,.5,-8.7,.22,-7.05,C.white,world,65);
 [C.red,C.yellow,C.cyan].forEach((c,i)=>rounded(.27,.1,.27,c,-12.6+i*.45,.18,-7.05,world,.08));
 label('20 SEC',1.8,.42,11.6,.22,-7.05,'#9bafa9');
 rounded(6.25,.12,5.65,studio.subGlass,-9.55,.17,-3.7);
 label('素材',1.7,.5,-11.45,.33,-6.1,C.white);
 rounded(24.9,.12,5.5,studio.subGlass,0,.17,4.65);
 // Timeline ruler: printed onto the slab, with real raised guides.
 const rulerTexture=tex(2048,128,(c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='#849e9e';c.fillStyle='#bfd1ca';c.font='600 29px Consolas';c.textAlign='center';for(let i=0;i<=80;i++){let x=60+i*(W-120)/80;c.beginPath();c.moveTo(x,H);c.lineTo(x,H-(i%8===0?43:18));c.lineWidth=i%8===0?2:1;c.stroke();if(i%8===0)c.fillText(String(i/4).padStart(2,'0')+':00',x,49);}});
 plane(22.3,1.0,rulerTexture,.2,.325,2.0);
 label('V1',1.1,.6,-11.55,.34,3.6,'#a8cfcb');label('A1',1.1,.6,-11.55,.34,5.7,'#a8cfcb');
 rounded(20.6,.035,1.9,studio.glass('#95b4bf',.7,.22,.1),.1,.32,3.6);
 rounded(20.6,.035,1.1,studio.glass('#aacbbc',.7,.22,.1),.1,.32,5.65);
 // Preview screen is a hinged solid panel, not a flat overlay.
 const monitor=group();monitor.position.set(3.3,.38,-.92);
 rounded(15.55,.3,5.65,studio.edgeGlass,0,0,-2.82,monitor,.2);
 rounded(15.72,.14,.28,studio.chrome,0,-.03,0,monitor,.08);
 const movieCanvas=document.createElement('canvas');movieCanvas.width=1024;movieCanvas.height=420;const mc=movieCanvas.getContext('2d');
 const movieTexture=new THREE.CanvasTexture(movieCanvas);movieTexture.colorSpace=THREE.SRGBColorSpace;movieTexture.anisotropy=4;
 plane(14.92,5.05,movieTexture,0,.375,-2.83,monitor);
 const clockTexture=tex(512,80,(c,W,H)=>{c.fillStyle='#cbdad5';c.font='600 47px Consolas';c.textAlign='center';c.fillText('00:00:00',W/2,60);});
 const clockLabel=plane(2.45,.38,clockTexture,8.6,.23,-7.05);
 function updateClock(time){const c=clockTexture.image.getContext('2d');c.clearRect(0,0,512,80);c.fillStyle='#bfdbd3';c.font='600 49px Consolas';c.textAlign='center';let n=Math.round(time*24);c.fillText(`00:${String(Math.floor(n/24)).padStart(2,'0')}:${String(n%24).padStart(2,'0')}`,256,59);clockTexture.needsUpdate=true;}
 // Raised buttons: a socket, moving keycap, and thick geometry for the icon.
 function button(x,z,color,type){
  const g=group();g.position.set(x,.35,z);rounded(2.05,.12,1.8,studio.blackMetal,0,-.10,0,g,.25);
  const cap=group(g);rounded(1.9,.43,1.65,studio.glass(color,.90,.055,.7),0,0,0,cap,.28);
  rounded(1.72,.045,1.46,studio.subGlass,0,.43,0,cap,.24);
  const ink=new THREE.MeshPhysicalMaterial({color:'#f3f8ff',metalness:.18,roughness:.17,clearcoat:1});
  function icon(points){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3});geo.rotateX(-Math.PI/2);const m=new THREE.Mesh(geo,ink);m.position.y=.49;cap.add(m);}
  if(type==='plus'){rounded(.22,.13,1,ink,0,.49,0,cap,.05);rounded(1,.13,.22,ink,0,.49,0,cap,.05);}
  if(type==='play')icon([[-.29,-.47],[.48,0],[-.29,.47]]);
  if(type==='text'){rounded(1,.13,.18,ink,0,.49,-.40,cap,.04);rounded(.2,.13,.94,ink,0,.49,.04,cap,.04);}
  if(type==='fx'){icon([[0,-.58],[.16,-.16],[.56,0],[.16,.16],[0,.58],[-.16,.16],[-.56,0],[-.16,-.16]]);}
  if(type==='transition'){for(const x of [-.22,.22]){const o=rounded(.58,.1,.64,ink,x,.49,0,cap,.08);o.rotation.y=Math.PI/4;}}
  if(type==='export'){icon([[-.14,-.35],[-.4,-.35],[0,.15],[.4,-.35],[.14,-.35],[.14,-.64],[-.14,-.64]]);rounded(.96,.12,.13,ink,0,.49,.45,cap,.03);rounded(.13,.12,.36,ink,-.42,.49,.32,cap,.03);rounded(.13,.12,.36,ink,.42,.49,.32,cap,.03);}
  if(type==='cut'){for(const sign of [-1,1]){let l=box(.12,.14,1.02,ink,sign*.12,.48,-.12,cap);l.rotation.y=sign*.55;const ring=new THREE.Mesh(new THREE.TorusGeometry(.19,.064,8,18),ink);ring.rotation.x=-Math.PI/2;ring.position.set(sign*.29,.56,.43);cap.add(ring);}}
  return {g,cap};
 }
 const add=button(-10,-3.65,'#f09c51','plus');
 const split=button(2.8,.35,'#a991df','cut');
 const play=button(5.55,.35,'#5db69c','play');
 const fxButton=button(-.2,.35,'#799cf3','fx'),textButton=button(-2.8,.35,'#d592d6','text');
 const transitionButton=button(-5.4,.35,'#75c5dc','transition'),exportButton=button(8.3,.35,'#efc06d','export');
 label('添加',1.8,.45,-10,.34,-5.05,C.white);
 // Procedural footage: a sunlit coast and a sunset city. It actually scrubs and plays.
 function drawFootage(c,W,H,seconds,kind=0){
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,kind?'#ebb396':'#83c9cf');sky.addColorStop(1,kind?'#f6dfac':'#e5eac9');c.fillStyle=sky;c.fillRect(0,0,W,H);
  const sx=W*(kind?.77:.77),sy=H*.28;c.fillStyle='#fff0b0';c.beginPath();c.arc(sx,sy,H*.13,0,Math.PI*2);c.fill();
  const ofs=seconds*36;
  c.fillStyle=kind?'#c29da2':'#81a797';c.beginPath();c.moveTo(0,H*.62);for(let x=0;x<=W+20;x+=20)c.lineTo(x,H*(.52+.11*Math.sin((x+ofs*.3)/135)+.07*Math.sin((x+ofs*.3)/57)));c.lineTo(W,H);c.lineTo(0,H);c.fill();
  if(kind){for(let i=-1;i<13;i++){const x=((i*105-ofs*.5)%(W+200)+W+200)%(W+200)-100;const bh=70+(i*i%5)*22;c.fillStyle=['#80968f','#a78083','#bda891'][((i%3)+3)%3];c.fillRect(x,H*.72-bh,75,bh);c.fillStyle='#e8cd9c';for(let k=0;k<3;k++)c.fillRect(x+12+k*21,H*.72-bh+15,8,14);}}
  else{c.fillStyle='#449fa5';c.fillRect(0,H*.61,W,H*.24);c.strokeStyle='#8acbc3';c.lineWidth=3;for(let i=0;i<12;i++){const x=((i*112+seconds*40)%(W+140))-140;c.beginPath();c.moveTo(x,H*.69+Math.sin(i)*18);c.lineTo(x+60,H*.69+Math.sin(i)*18);c.stroke();}}
  c.fillStyle=kind?'#d2a183':'#a8b080';c.fillRect(0,H*.78,W,H*.22);
  c.fillStyle='#476365';c.beginPath();c.moveTo(0,H*.83);c.lineTo(W,H*.78);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  c.strokeStyle='#e4d6a2';c.lineWidth=4;c.setLineDash([40,40]);c.lineDashOffset=ofs*2;c.beginPath();c.moveTo(0,H*.95);c.lineTo(W,H*.9);c.stroke();c.setLineDash([]);
  for(let i=0;i<5;i++){const x=((i*290-ofs*1.3)%(W+300)+W+300)%(W+300)-160;c.fillStyle=kind?'#7b827b':'#528b76';c.fillRect(x,H*.59,7,H*.23);c.beginPath();c.moveTo(x-36,H*.68);c.lineTo(x+3,H*.43);c.lineTo(x+40,H*.68);c.fill();c.beginPath();c.moveTo(x-28,H*.59);c.lineTo(x+3,H*.38);c.lineTo(x+32,H*.59);c.fill();}
  const cx=W*.49+Math.sin(seconds*1.4)*W*.055,cy=H*.83+Math.sin(seconds*13)*1.4;
  c.fillStyle='rgba(19,46,42,.25)';c.beginPath();c.ellipse(cx,cy+29,91,12,0,0,Math.PI*2);c.fill();
  c.fillStyle='#df5b3b';c.fillRect(cx-77,cy-23,150,37);c.fillRect(cx-42,cy-52,85,35);c.fillStyle='#f7b35c';c.fillRect(cx-75,cy-23,149,9);c.fillStyle='#e3edcc';c.fillRect(cx-32,cy-44,29,23);c.fillRect(cx+5,cy-44,28,23);c.fillStyle='#fff2bb';c.fillRect(cx+68,cy-15,10,12);
  for(const xx of [-47,45]){c.fillStyle='#263d41';c.beginPath();c.arc(cx+xx,cy+13,17,0,Math.PI*2);c.fill();c.fillStyle='#c9d6c1';c.beginPath();c.arc(cx+xx,cy+13,8,0,Math.PI*2);c.fill();c.strokeStyle='#5e7771';c.lineWidth=3;const a=seconds*14;c.beginPath();c.moveTo(cx+xx-8*Math.cos(a),cy+13-8*Math.sin(a));c.lineTo(cx+xx+8*Math.cos(a),cy+13+8*Math.sin(a));c.stroke();}
 }
 const thumbs=[0,1].map(kind=>tex(768,300,(c,W,H)=>drawFootage(c,W,H,kind?5:1,kind)));
 function film(w,col,kind,parent=world){const g=group(parent);rounded(w,.36,1.62,studio.glass(col,.38,.12,.36),0,0,0,g,.16);const surface=group(g);let count=Math.max(1,Math.round(w/2));for(let i=0;i<count;i++){plane(w/count-.08,1.18,thumbs[kind],-w/2+(i+.5)*w/count,.47,-.04,surface);for(const side of [-1,1])box(.11,.012,.06,'#fff1d1',-w/2+(i+.5)*w/count,.475,side*.72,surface);}return g;}
 const cards=[];for(let i=0;i<3;i++){const g=group();g.position.set(-7.9,.34,-4.75+i*1.35);rounded(2.05,.12,1.05,[C.cyan,C.orange,'#b9a3dc'][i],0,0,0,g,.08);plane(1.86,.84,thumbs[i%2],0,.19,0,g);cards.push(g);}
 const material=film(3.0,C.cyan,0);material.position.set(-8,.36,-1.16);
 // The draggable card has a physical handle which meets both gloves.
 rod([-.58,.2,1.0],[-.58,1.25,1.0],.045,C.cyan,material);rod([.58,.2,1.0],[.58,1.25,1.0],.045,C.cyan,material);
 const tileHandle=rod([-.58,1.25,1.0],[.58,1.25,1.0],.065,C.white,material);
 const clipA=film(7.6,C.cyan,0);clipA.position.set(-5.2,.4,3.6);
 const offcut=film(2.8,C.cyan,0);offcut.position.set(0,.4,3.6);
 const clipB=film(7,C.orange,1);clipB.position.set(5.1,.4,3.6);
 rod([3.56,.20,-.58],[3.56,1.28,-.58],.045,C.orange,clipB);rod([3.56,.20,.58],[3.56,1.28,.58],.045,C.orange,clipB);rod([3.56,1.28,-.58],[3.56,1.28,.58],.065,C.white,clipB);
 const music=group();music.position.set(-.4,.4,5.7);rounded(19,.20,.85,'#467f66',0,0,0,music,.08);
 const wave=[];for(let i=0;i<94;i++){let h=.12+.40*(.5+.5*Math.sin(i*1.72))*(.5+.5*Math.cos(i*.51));const m=box(.072,.035,h,'#a8dfac',-9.1+i*.195,.23,0,music);m.userData.height=h;wave.push(m);}
 label('♫',.7,.6,-10.5,.44,5.7,'#a6d9bb');
 // The caption is a draggable physical clip. A front crossbar sits at glove height.
 const caption=group();caption.position.set(-2.8,.38,6.85);
 rounded(5.2,.25,.78,studio.glass('#b8a2ea',.58,.10,.3),0,0,0,caption,.16);
 label('一路向前',3.3,.44,0,.34,0,C.white,caption);
 rod([.72,.2,-1.65],[.72,1.75,-1.65],.04,studio.chrome,caption);rod([.72,.2,-.45],[.72,1.75,-.45],.04,studio.chrome,caption);rod([.72,1.75,-1.65],[.72,1.75,-.45],.06,C.white,caption);
 label('T',.65,.43,-11.55,.35,6.85,'#b9b0d7');
 const transitionToken=group();transitionToken.position.set(-1.3,.79,3.6);
 const diamond=rounded(.94,.18,.94,studio.glass('#a7d6f8',.6,.07,.3),0,0,0,transitionToken,.10);diamond.rotation.y=Math.PI/4;
 label('↔',.82,.50,0,.23,0,C.white,transitionToken);
 // A metal fader rail and glass cap control the waveform in the soundtrack lane.
 const volume=group();volume.position.set(10.3,.37,0);
 rounded(.75,.13,2.8,studio.subGlass,0,0,5.52,volume,.16);
 rounded(.07,.07,2.2,studio.chrome,0,.14,5.52,volume,.025);
 const volumeKnob=group(volume);
 rounded(.68,.24,.45,studio.glass('#b7e2ce',.7,.06,.3),0,0,0,volumeKnob,.14);
 rod([0,.2,0],[0,1.48,0],.045,studio.chrome,volumeKnob);rod([-.58,1.48,0],[.58,1.48,0],.06,C.white,volumeKnob);
 const volumeMarks=[];for(let i=0;i<7;i++)volumeMarks.push(rounded(.16,.035,.035,'#9cafb6',.54,.18,4.6+i*.3,volume,.01));
 // Export is the classic flagpole finish: the cloth, gloves and percentage share one descent value.
 const flagpole=group();flagpole.position.set(FLAG.x,0,FLAG.z);
 rounded(2.3,.20,1.65,studio.edgeGlass,0,.18,0,flagpole,.26);
 const polePaint=new THREE.MeshPhysicalMaterial({color:'#e8efe2',metalness:.40,roughness:.21,clearcoat:.6});
 const gold=new THREE.MeshPhysicalMaterial({color:'#e8be58',metalness:.68,roughness:.19,clearcoat:.7});
 rod([0,.42,0],[0,7.94,0],.085,polePaint,flagpole);
 rod([.14,.48,0],[.14,7.66,0],.018,gold,flagpole);
 const flagBall=new THREE.Mesh(new THREE.SphereGeometry(.25,32,20),gold);flagBall.position.set(0,8.05,0);flagBall.castShadow=true;flagpole.add(flagBall);
 const pennant=group(flagpole);
 const flagTexture=tex(768,512,(c,W,H)=>{c.fillStyle='#4e9c62';c.fillRect(0,0,W,H);c.fillStyle='#377c4e';c.fillRect(0,0,24,H);c.fillStyle='#fff4dc';c.beginPath();c.arc(W*.27,H*.5,118,0,Math.PI*2);c.fill();c.fillStyle='#d64933';['10001','11011','10101','10001','10001'].forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')c.fillRect(143+x*25,198+y*25,25,25);}));});
 const flagGeo=new THREE.PlaneGeometry(1,1,18,6),flagUV=flagGeo.attributes.uv,flagPos=flagGeo.attributes.position;
 const flagCloth=new THREE.Mesh(flagGeo,new THREE.MeshStandardMaterial({map:flagTexture,side:THREE.DoubleSide,roughness:.82,metalness:0}));flagCloth.castShadow=true;pennant.add(flagCloth);
 const clipRing=new THREE.Mesh(new THREE.TorusGeometry(.115,.027,8,24),gold);clipRing.rotation.x=Math.PI/2;clipRing.position.y=-.08;pennant.add(clipRing);
 const exportTexture=tex(768,512,()=>{});
 const exportText=new THREE.Sprite(new THREE.SpriteMaterial({map:exportTexture,transparent:true,toneMapped:false,depthWrite:false}));exportText.scale.set(5.2,3.4667,1);world.add(exportText);
 function updateExport(p){const c=exportTexture.image.getContext('2d');c.clearRect(0,0,768,512);c.textAlign='center';c.lineJoin='round';c.strokeStyle='rgba(30,35,30,.75)';c.lineWidth=7;c.font='700 84px "Microsoft YaHei"';const title=p>=1?'导出完成':'导出';c.fillStyle='#fff4d5';c.strokeText(title,384,126);c.fillText(title,384,126);c.font='700 224px Consolas,monospace';c.fillStyle=p>=1?'#d2f9b4':'#fff8e9';const value=Math.floor(p*100+1e-7)+'%';c.strokeText(value,384,352);c.fillText(value,384,352);exportTexture.needsUpdate=true;}
 // Playhead is a tangible sliding rail with a crossbar at hand height.
 const playhead=group();playhead.position.set(-8.2,.35,0);
 rounded(.16,.16,4.35,'#ee6654',0,.48,4.1,playhead,.04);
 rounded(.72,.17,.82,'#f17b5f',0,.02,1.65,playhead,.09);
 rod([0,.12,1.55],[0,1.3,1.55],.067,C.orange,playhead);rod([0,1.3,.95],[0,1.3,2.15],.075,C.white,playhead);
 const blade=box(.09,1.3,1.85,'#f3d8b3',0,2.4,3.6,playhead);blade.visible=false;
 // Block-built Mario, articulated at the hips and shoulders. The face has actual depth.
 const mario=group(),body=group(mario);
 const red='#d73529',redL='#ed4d32',blue='#2860ad',blueL='#3d7bc4',skin='#f3bd83',brown='#654035',glove='#fff4d7';
 box(.9,.86,.58,red,0,.83,0,body);box(.88,.44,.64,blue,0,.86,.02,body);
 box(.15,.6,.075,blue,-.28,1.18,.32,body);box(.15,.6,.075,blue,.28,1.18,.32,body);
 box(.14,.14,.08,C.yellow,-.28,1.32,.37,body);box(.14,.14,.08,C.yellow,.28,1.32,.37,body);
 const head=group(body);head.position.y=1.72;
 box(.96,.86,.76,skin,0,0,.03,head);box(.98,.36,.18,brown,0,.22,-.38,head);
 box(.18,.28,.28,skin,-.54,.26,.03,head);box(.18,.28,.28,skin,.54,.26,.03,head);
 box(1.12,.28,.90,red,0,.74,0,head);box(.85,.16,.83,redL,0,1.02,-.03,head);box(1.24,.12,.48,redL,0,.76,.51,head);
 // Pixel M on the cap, and a stepped moustache below the extruded nose.
 box(.39,.27,.03,glove,0,.79,.47,head);
 ['10001','11011','10101','10001'].forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')box(.054,.054,.025,red,(x-2)*.058,1.02-y*.059,.495,head);}));
 box(.17,.25,.04,'#faf5de',-.24,.40,.425,head);box(.17,.25,.04,'#faf5de',.24,.40,.425,head);
 const eyeL=box(.075,.20,.042,'#243338',-.20,.42,.456,head),eyeR=box(.075,.20,.042,'#243338',.28,.42,.456,head);
 box(.30,.27,.30,skin,.02,.27,.49,head);box(.21,.15,.16,'#e6a66f',.04,.25,.63,head);
 [[-.33,.18],[-.19,.14],[-.05,.12],[.09,.12],[.23,.14],[.36,.18]].forEach(([x,y])=>box(.14,.13,.09,brown,x,y,.462,head));
 const arms=[],legs=[];
 for(const sign of [-1,1]){const a=group(body);a.position.set(sign*.64,1.57,0);box(.30,.57,.37,red,0,-.51,0,a);box(.39,.37,.43,glove,0,-.81,.04,a);box(.13,.19,.24,glove,-sign*.22,-.67,.12,a);arms.push(a);const l=group(body);l.position.set(sign*.27,.94,0);box(.38,.6,.42,blueL,0,-.57,0,l);box(.44,.28,.69,brown,0,-.87,.14,l);box(.44,.10,.71,'#4d3931',0,-.94,.16,l);legs.push(l);}
 // Two linked sleeve segments give the flag grip visible elbows and keep both gloves on the pole.
 const gripArms=group(body),gripRig=[];
 for(const sign of [-1,1]){const upper=box(.30,1,.34,red,0,0,0,gripArms),fore=box(.29,1,.33,red,0,0,0,gripArms),hand=group(gripArms);box(.39,.37,.43,glove,0,-.185,0,hand);box(.13,.19,.24,glove,-sign*.20,-.04,.12,hand);gripRig.push({sign,upper,fore,hand});}
 function limb(mesh,a,b,w){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);mesh.position.copy(A).add(B).multiplyScalar(.5);mesh.scale.set(w,v.length(),.34);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}
 const shadowTex=tex(128,128,(c,W,H)=>{let g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);g.addColorStop(0,'rgba(14,31,28,.5)');g.addColorStop(1,'rgba(14,31,28,0)');c.fillStyle=g;c.fillRect(0,0,W,H);});
 const charShadow=plane(2.7,2.2,shadowTex,0,.37,0);
 // Impacts and paper-like solid chips follow the same event clock as the soundtrack.
 const bursts=[];
 const events=[{t:CUE.add,p:[-10,.95,-3.65],c:C.yellow},{t:CUE.drop,p:[-6,.7,3.6],c:C.cyan},{t:CUE.cut,p:[-1.4,.8,3.6],c:'#c7b8ef'},{t:CUE.snap,p:[-1.3,.8,3.6],c:C.orange},{t:CUE.fx,p:[-.2,.94,.35],c:'#a1c4ff'},{t:CUE.text,p:[-2.8,.94,.35],c:'#e8b8e6'},{t:CUE.captionDrop,p:[.2,.8,6.85],c:'#e3c4f8'},{t:CUE.transition,p:[-5.4,.94,.35],c:C.cyan},{t:CUE.play,p:[5.55,.9,.35],c:C.cyan},{t:CUE.flagGrab,p:[FLAG.x,FLAG.top+FLAG.gripOffset,FLAG.z],c:C.yellow},{t:CUE.finish,p:[FLAG.x,.75,FLAG.z],c:C.cyan}];
 events.forEach((event,idx)=>{const g=group();const pieces=[];for(let i=0;i<15;i++){const a=i*2.39996+idx;const m=box(.12+(i%3)*.05,.06,.16,event.c,0,0,0,g);pieces.push({m,a,v:1.1+(i%5)*.26});}const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.025,6,48),new THREE.MeshBasicMaterial({color:event.c,transparent:true}));ring.rotation.x=-Math.PI/2;g.add(ring);bursts.push({g,pieces,ring,...event});});
 const jumpRings=[];
 JUMPS.forEach((j,i)=>{for(const landing of [false,true]){if(landing&&j.grip)continue;const rings=[];for(let k=0;k<2;k++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1,k?.028:.045,6,40),new THREE.MeshBasicMaterial({color:landing?'#ffd366':'#67e8f1',transparent:true,depthWrite:false}));ring.rotation.x=-Math.PI/2;world.add(ring);rings.push(ring);}jumpRings.push({t:landing?j.b:j.a,p:landing?j.to:j.from,rings,landing});}});
 const trail=[];for(let i=0;i<10;i++){const m=box(.11,.11,.11,new THREE.MeshStandardMaterial({color:i%2?'#6ce3e8':'#ffdf86',emissive:i%2?'#49c7de':'#ffd164',emissiveIntensity:.6}));trail.push(m);}
 const stepRings=[];for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.24,.022,5,24),new THREE.MeshBasicMaterial({color:'#8cdce0',transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;world.add(m);stepRings.push(m);}
 const celebrations=[];for(let i=0;i<30;i++){let m=box(.13,.04,.22,[C.red,C.cyan,C.yellow,'#a994d4'][i%4]);celebrations.push(m);}
 // The contact line becomes a short-lived highlight at the cut; no flat screen transition.
 const slit=box(.065,.015,1.83,'#fff1ac',-1.4,.81,3.6);slit.visible=false;
 // Camera marks are musical beats. Each move frames the point of contact, then travels with Mario.
 // The opening and ending retain the tabletop, softboxes and layered glass silhouette.
 const cameraKeys=[
 [0, -1,.3,0, 24,17,29,39],
 [3, -8.9,1.3,-3, 10,12.2,16,38],
 [5, -7.8,1.2,-.3, 9.5,12.5,16,38],
 [8, -5.0,1.0,3.0, 9.5,14,18,39],
 [10,-7.4,1.1,2.3, 8,10.8,15,38],
 [13,-1.9,1.2,1.8, 8,11.0,15.5,38],
 [16,1.0,1.0,1.7, 3.5,15.2,13.5,38],
 [18,6.3,1.0,3.3, 7,10.5,15.5,38],
 [20,4.0,1.0,3.3, -5.5,11.2,17.5,38],
 [23,.5,1.4,.4, 6.7,13.5,18.2,39],
 [25,-2.4,1.1,1.0, 6.5,12.5,17.2,38],
 [27,-2.4,1.1,5.9, 5,10.5,14,38],
 [30,.1,1.1,5.9, 3.5,11.2,15,38],
 [32,-4.1,1.4,1.6, 6.5,13,17,39],
 [34,-.8,1.5,3, 8.5,13.5,18.5,39],
 [37,8.8,1.2,4.5, -6.5,11.5,15.5,38],
 [39,9.1,1.3,5.2, -7,11.5,15.5,38],
 [42,5.4,1.7,-.1, 10,13.5,19.5,39],
 [43,7.2,3.0,-1.7, 12,13,21.3,39],
 [44.5,10.3,4.9,-4.8, 14,11.8,22,39],
 [46,12.4,4.5,-5.8, 13,9.5,22,39],
 [48,12.2,3.7,-5.8, 12.5,9.8,22,39],
 [50,12,2.9,-5.4, 12,10.4,22.8,39],
 [52,10.3,2.6,-4.2, 16,12,26,39],
 [53.3,10.0,2.4,-3.8, 17,12.8,27.5,39]
 ].map(k=>[k[0]===0?0:at(k[0]),...k.slice(1)]);
 function camAt(t){for(let i=0;i<cameraKeys.length-1;i++){let a=cameraKeys[i],b=cameraKeys[i+1];if(t<=b[0]){const u=ease(t,a[0],b[0]);return a.slice(1).map((v,k)=>mix(v,b[k+1],u));}}return cameraKeys.at(-1).slice(1);}
 let frames=0,total=0;
 function render(t){
  const tic=performance.now(),s=stateAt(t),beatPhase=((t-BEAT0)/BEAT%1+1)%1,beatPulse=Math.pow(1-beatPhase,4);
  studio.update(t,BEAT);
  edgeMaterial.emissiveIntensity=.03+beatPulse*.055;
  // Subtle tactile surface, with much smoother character action than the reference's stop motion.
  const entrance=ease(t,0,.5);world.position.y=0;
  [[add,CUE.add],[split,CUE.cut],[play,CUE.play],[fxButton,CUE.fx],[textButton,CUE.text],[transitionButton,CUE.transition]].forEach(([key,hit])=>key.cap.position.y=-.23*punch(t,hit,BEAT*.9));
  cards.forEach((g,i)=>{const u=ease(t,at(3.5+i*.5),at(4+i*.5));g.visible=u>0;g.scale.setScalar(Math.max(.001,u));g.rotation.z=(1-u)*-.55;g.position.y=.34+Math.sin(u*Math.PI)*1.6;});
  material.visible=t>=at(4.5)&&t<CUE.drop+BEAT/2;
  const u=s.tileMove,flatten=ease(t,CUE.drop-BEAT/4,CUE.drop+BEAT/2);material.position.set(mix(-8,-6,u),.39+.04*Math.sin(t*Math.PI*2/BEAT)*(1-u),mix(-1.16,3.6,u));material.scale.set(1+flatten*1.4,1,1);material.rotation.y=-.08*Math.sin(u*Math.PI);tileHandle.visible=t<CUE.drop;
  clipA.visible=t>=CUE.drop;offcut.visible=t>=CUE.drop;clipB.visible=t>=CUE.drop;
  const build=ease(t,CUE.drop,CUE.drop+BEAT),bounce=Math.sin(build*Math.PI)*.7;
  clipA.position.y=.4+bounce;clipA.scale.set(1,Math.max(.02,build),1);
  const remove=ease(t,CUE.cut+BEAT/2,CUE.cut+BEAT*2.5);
  offcut.position.set(.0+remove*.6,.4+bounce+Math.sin(remove*Math.PI)*2.0,3.6+remove*2.9);offcut.rotation.x=remove*1.5;offcut.rotation.z=remove*-.5;offcut.scale.setScalar(Math.max(.001,1-remove));offcut.visible=t>=CUE.drop&&remove<1;
  clipB.position.set(5.1-3*s.slide,.4+bounce,3.6);clipB.scale.y=Math.max(.02,build);
  music.visible=s.landed;music.scale.x=Math.max(.01,build);wave.forEach((m,i)=>m.scale.z=m.userData.height*(1+s.volume*.6)*(1+.2*beatPulse));
  caption.visible=s.captionVisible;const captionIn=ease(t,CUE.text,CUE.text+BEAT);caption.scale.set(Math.max(.001,captionIn),1,1);caption.position.set(mix(-2.8,.2,s.caption),.38+Math.sin(captionIn*Math.PI)*1.8,6.85);
  transitionToken.visible=t>=CUE.transition;transitionToken.scale.setScalar(Math.max(.001,s.transition));transitionToken.position.y=.79+Math.sin(s.transition*Math.PI)*1.8;transitionToken.rotation.y=(1-s.transition)*Math.PI;
  volume.visible=s.landed;volumeKnob.position.set(0,.22,mix(4.9,6.2,s.volume));
  flagpole.visible=t>=CUE.flagRaise;flagpole.scale.y=Math.max(.001,ease(t,CUE.flagRaise,at(43.5)));pennant.position.y=s.flagY;
  if(flagpole.visible){for(let i=0;i<flagPos.count;i++){const u=flagUV.getX(i),v=1-flagUV.getY(i);flagPos.setXYZ(i,u*2.2,mix(-v*1.6,-.8,u),Math.sin(u*7-t*5)*.16*u);}flagPos.needsUpdate=true;flagGeo.computeVertexNormals();}
  exportText.visible=t>=CUE.flagGrab;updateExport(s.exportProgress);
  playhead.visible=s.landed;playhead.position.x=s.head;
  blade.visible=t>=CUE.cut-.10&&t<CUE.cut+.3;blade.position.y=mix(2.1,.25,ease(t,CUE.cut-.1,CUE.cut+.05));slit.visible=t>=CUE.cut&&t<CUE.cut+.33;
  monitor.rotation.x=ease(t,CUE.play+BEAT/2,at(44.5))*.76;
  const footageTime=t<CUE.grab?0:t<CUE.play?s.scrub*7.5:7.5+(t-CUE.play)*3.0;
  const footageKind=t>=CUE.transition&&s.transition>=1?1:0;drawFootage(mc,1024,420,footageTime,0);
  if(s.transition>0){mc.save();mc.beginPath();mc.rect(1024*(1-s.transition),0,1024*s.transition,420);mc.clip();drawFootage(mc,1024,420,footageTime,1);mc.restore();}
  if(s.fx>0){mc.globalCompositeOperation='soft-light';const grade=mc.createLinearGradient(0,420,1024,0);grade.addColorStop(0,`rgba(18,102,132,${.48*s.fx})`);grade.addColorStop(1,`rgba(255,167,75,${.55*s.fx})`);mc.fillStyle=grade;mc.fillRect(0,0,1024,420);mc.globalCompositeOperation='source-over';const scan=win(t,CUE.fx,CUE.fx+BEAT*1.5);if(scan>0&&scan<1){const x=scan*1200-100;const glow=mc.createLinearGradient(x-100,0,x+100,0);glow.addColorStop(0,'#ffffff00');glow.addColorStop(.5,'#efffffaa');glow.addColorStop(1,'#ffffff00');mc.fillStyle=glow;mc.fillRect(x-100,0,200,420);}}
  if(s.captionVisible){mc.save();mc.globalAlpha=captionIn;mc.font='700 47px "Microsoft YaHei"';mc.textAlign='center';const x=mix(390,512,s.caption);mc.fillStyle='rgba(12,24,36,.72)';mc.beginPath();mc.roundRect(x-151,320,302,65,17);mc.fill();mc.fillStyle='#fff8e9';mc.fillText('一路向前',x,369);mc.restore();}
  if(t<CUE.add){mc.fillStyle='rgba(20,39,43,.6)';mc.fillRect(0,0,1024,420);mc.fillStyle='#edf3da';mc.font='700 46px "Microsoft YaHei"';mc.textAlign='center';mc.fillText('准备开剪',512,224);}
  movieTexture.needsUpdate=true;updateClock(t<CUE.play?s.scrub*7.5:s.playProgress*13.3);
  mario.position.set(...s.p);mario.rotation.y=s.yaw;const gait=Math.sin((t-BEAT0)*2*Math.PI/BEAT),breath=Math.sin(t*Math.PI/BEAT)*.018;
  body.scale.set(1+s.squash*.28,1-s.squash,1+s.squash*.15);body.position.y=s.run&&!s.air?Math.abs(gait)*.10:breath;body.rotation.z=s.push?.15:0;body.rotation.x=s.push?.18:s.drag?-.14:0;
  legs[0].rotation.x=gait*.7*s.run;legs[1].rotation.x=-gait*.7*s.run;arms[0].rotation.x=-gait*.65*s.run;arms[1].rotation.x=gait*.65*s.run;
  arms[0].rotation.z=.05;arms[1].rotation.z=-.05;
  if(s.drag||s.push){arms[0].rotation.x=-1.36;arms[1].rotation.x=-1.36;arms[0].rotation.z=-.14;arms[1].rotation.z=.14;}
  if(s.air){arms[0].rotation.x=-2.7*s.air;arms[1].rotation.x=-1.5*s.air;legs[0].rotation.x=.65*s.air;legs[1].rotation.x=-.75*s.air;body.rotation.x=-.15*Math.sin(s.air*Math.PI);}
  gripArms.visible=t>=CUE.flagGrab-BEAT/2;arms.forEach(a=>a.visible=!gripArms.visible);
  if(gripArms.visible){gripRig.forEach(({sign,upper,fore,hand})=>{const left=sign<0,q=s.celebrate,shoulder=[sign*.64,1.57,0],startElbow=left?[-.35,1.95,.55]:[.74,1.10,.52],startHand=left?[.32,1.70,.85]:[.32,1.28,.85],elbow=startElbow.map((v,i)=>mix(v,[sign*.95,2.10,.10][i],q)),target=startHand.map((v,i)=>mix(v,[sign*.95,2.75,.10][i],q));limb(upper,shoulder,elbow,.30);limb(fore,elbow,target,.29);hand.position.set(...target);});}
  if(t>=CUE.flagGrab){body.position.y=0;body.rotation.set(0,0,0);legs[0].rotation.x=mix(-.65,0,s.celebrate);legs[1].rotation.x=mix(-.30,0,s.celebrate);}
  head.rotation.y=t>=CUE.flagGrab?mix(-.22,0,s.celebrate):.08*Math.sin(t*3);head.rotation.x=s.drag?.14:s.air?-.12:0;const blink=Math.pow(Math.max(0,Math.cos(t*1.8)),45);eyeL.scale.y=eyeR.scale.y=.20*(1-.82*blink);
  charShadow.position.set(s.p[0],.374,s.p[2]);charShadow.scale.setScalar(1+s.air*.55);charShadow.material.opacity=1-s.air*.55;
  bursts.forEach(e=>{const dt=t-e.t;e.g.visible=dt>=0&&dt<.65;if(!e.g.visible)return;e.g.position.set(...e.p);const q=dt/.65;e.pieces.forEach(({m,a,v},i)=>{m.position.set(Math.cos(a)*dt*v*2,Math.max(.02,dt*(3.2+i%3)-dt*dt*7),Math.sin(a)*dt*v*2);m.rotation.set(dt*4+a,dt*5,dt*3);m.scale.set((.12+(i%3)*.05)*(1-q),.06*(1-q),.16*(1-q));});e.ring.scale.setScalar(.35+q*2.2);e.ring.material.opacity=(1-q)*.8;});
  jumpRings.forEach(e=>{const q=(t-e.t)/BEAT;e.rings.forEach((m,k)=>{m.visible=q>=0&&q<1;if(!m.visible)return;m.position.set(e.p[0],e.p[1]+.14,e.p[2]);m.scale.setScalar(.38+q*(k?1.7:2.5));m.material.opacity=(1-q)*(k?.45:.85);});});
  trail.forEach((m,i)=>{const st=stateAt(Math.max(0,t-(i+1)*BEAT/12));m.visible=s.pose==='jump'&&st.pose==='jump';if(m.visible){m.position.set(st.p[0]+Math.sin(i*2.4)*.18,st.p[1]+.2,st.p[2]+Math.cos(i*2.4)*.18);m.scale.setScalar(.12*(1-i/12));}});
  stepRings.forEach((m,i)=>{const ti=BEAT0+(Math.floor((t-BEAT0)/(BEAT/2))-i)*BEAT/2,st=stateAt(Math.max(0,ti)),q=(t-ti)/(BEAT*.75);m.visible=ti>=0&&q<1&&st.run>0&&st.pose!=='jump';if(m.visible){m.position.set(st.p[0],.39,st.p[2]);m.scale.setScalar(.7+q*1.3);m.material.opacity=(1-q)*.5;}});
  celebrations.forEach((m,i)=>{const dt=t-CUE.finish-(i%4)*BEAT/8;m.visible=dt>0;if(!m.visible)return;const a=i*2.39996;const rr=dt*(2.6+i%4*.3);m.position.set(FLAG.x+Math.cos(a)*rr,Math.max(.4,1.4+dt*(5.5+i%3*.4)-dt*dt*3),FLAG.z+Math.sin(a)*rr);m.rotation.set(dt*3+i,dt*5+i,dt*2);m.scale.set(.13,.04,.22);});
  const c=camAt(t),target=new THREE.Vector3(c[0],c[1],c[2]);const shake=events.reduce((v,e)=>v+punch(t,e.t,.22)*.065,0);camera.position.set(c[0]+c[3]+Math.sin(t*65)*shake,c[1]+c[4]+Math.cos(t*51)*shake,c[2]+c[5]);camera.fov=c[6];camera.up.set(.012*Math.sin(t*.65),1,0);camera.lookAt(target);camera.updateProjectionMatrix();
  const textRight=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);exportText.position.set(FLAG.x,s.flagY-.7,FLAG.z);exportText.position.addScaledVector(textRight,5.1);
  renderer.render(scene,camera);frames++;if(frames>5)total+=performance.now()-tic;
  canvas.dataset.event=s.event;canvas.dataset.time=t.toFixed(3);canvas.dataset.renderMs=(total/Math.max(1,frames-5)).toFixed(2);canvas.dataset.pose=s.pose;canvas.dataset.character=s.p.map(v=>v.toFixed(3)).join(',');canvas.dataset.playhead=s.head.toFixed(3);canvas.dataset.clipGap=(3*(1-s.slide)).toFixed(3);canvas.dataset.cut=String(s.cut);canvas.dataset.preview=footageKind?'日落城市':'海岸公路';canvas.dataset.bpm=String(BPM);canvas.dataset.environment='温馨木屋 / 玻璃桌 / Liquid glass 剪辑面板';canvas.dataset.beatPhase=beatPhase.toFixed(3);canvas.dataset.fx=s.fx.toFixed(3);canvas.dataset.caption=String(s.captionVisible);canvas.dataset.transition=s.transition.toFixed(3);canvas.dataset.volume=s.volume.toFixed(3);canvas.dataset.exportProgress=s.exportProgress.toFixed(3);canvas.dataset.flagY=s.flagY.toFixed(3);canvas.dataset.exportPercent=String(Math.floor(s.exportProgress*100+1e-7));canvas.setAttribute('aria-label',s.event);
  return s;
 }
 return {render,renderer,scene,camera,ready:studio.ready};
}
