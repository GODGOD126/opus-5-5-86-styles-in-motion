import * as THREE from './vendor/three.module.js';

// Physical, locally packaged wood surfaces. Poly Haven CC0 sources are listed in assets/cabin/credits.txt.
// The surrounding room is still geometry: window reveals, wall boards, beams, furniture and a warm practical lamp.
export function createCabin(renderer,scene){
 const pending=[],loader=new THREE.TextureLoader(),cube=new THREE.BoxGeometry(1,1,1);
 function texture(file,colour=false){
  let done,fail;pending.push(new Promise((resolve,reject)=>{done=resolve;fail=reject}));
  const t=loader.load(`./assets/cabin/${file}.jpg`,()=>done(),undefined,fail);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if(colour)t.colorSpace=THREE.SRGBColorSpace;return t;
 }
 const cedarMaps={map:texture('cedar-diff',true),normalMap:texture('cedar-normal'),roughnessMap:texture('cedar-rough')};
 const oakMaps={map:texture('oak-diff',true),normalMap:texture('oak-normal'),roughnessMap:texture('oak-rough')};
 const cedar=new THREE.MeshStandardMaterial({...cedarMaps,color:'#b4aa9d',roughness:.94,normalScale:new THREE.Vector2(.35,.35),envMapIntensity:.18});
 const oak=new THREE.MeshStandardMaterial({...oakMaps,color:'#c9bcae',roughness:.8,normalScale:new THREE.Vector2(.48,.48),envMapIntensity:.20});
 const beamMat=new THREE.MeshStandardMaterial({...oakMaps,color:'#68513e',roughness:.72,normalScale:new THREE.Vector2(.25,.25),envMapIntensity:.22});
 const brass=new THREE.MeshPhysicalMaterial({color:'#9e7949',metalness:.84,roughness:.26,clearcoat:.3});
 const dark=new THREE.MeshStandardMaterial({color:'#251b17',roughness:.82});
 const cream=new THREE.MeshPhysicalMaterial({color:'#d7c8b6',roughness:.34,clearcoat:.35});
 function block(w,h,d,material,x,y,z){const m=new THREE.Mesh(cube,material);m.scale.set(w,h,d);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
 function plankPlane(w,h,x,y,z,rotation,material,scale=22){
  const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(g.attributes.position.getX(i)+x)/scale,(g.attributes.position.getY(i)+y)/scale);
  const m=new THREE.Mesh(g,material);m.position.set(x,y,z);m.rotation.set(...rotation);m.receiveShadow=true;scene.add(m);return m;
 }
 // A small room surrounds the table. Wall segments leave an actual opening for the window.
 const floor=plankPlane(180,150,0,-7.8,15,[-Math.PI/2,0,0],oak,30);
 const wallZ=-33,wallLeft=-80,wallRight=80,wallTop=34,wallBottom=-7.8;
 const wx=-22,ww=28,wb=-3,wh=14,wl=wx-ww/2,wr=wx+ww/2,wt=wb+wh;
 plankPlane(wl-wallLeft,wallTop-wallBottom,(wallLeft+wl)/2,(wallTop+wallBottom)/2,wallZ,[0,0,0],cedar);
 plankPlane(wallRight-wr,wallTop-wallBottom,(wr+wallRight)/2,(wallTop+wallBottom)/2,wallZ,[0,0,0],cedar);
 plankPlane(ww,wallTop-wt,wx,(wallTop+wt)/2,wallZ,[0,0,0],cedar);
 plankPlane(ww,wb-wallBottom,wx,(wb+wallBottom)/2,wallZ,[0,0,0],cedar);
 plankPlane(100,41.8,-52,13.1,17,[0,Math.PI/2,0],cedar);
 // Weight-bearing posts and beams frame the room, and a low skirting board casts a contact shadow.
 for(const x of [-51,-38,-6,27,60])block(.80,41.8,.85,beamMat,x,-7.8,-32.4);
 block(132,.55,.80,beamMat,0,-6.9,-32.3);block(132,.90,1.0,beamMat,0,23,-32.2);
 block(1.15,1.35,84,beamMat,-38,23,4);block(1.15,1.35,84,beamMat,23,23,4);
 // Deep timber window reveals and a sill; the exterior has its own quiet blue-hour landscape.
 block(ww+2,.85,1.45,beamMat,wx,wb-.85,-32.05);block(ww+2,.85,1.45,beamMat,wx,wt,-32.05);
 for(const x of [wl-.55,wr+.55])block(.9,wh+1.6,1.45,beamMat,x,wb-.8,-32.05);
 block(ww+3,.32,2.9,beamMat,wx,wb-.92,-31.5);
 const skyMat=new THREE.ShaderMaterial({uniforms:{upper:{value:new THREE.Color('#52768c')},lower:{value:new THREE.Color('#d8ad94')}},vertexShader:`varying vec2 uvPoint;void main(){uvPoint=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform vec3 upper,lower;varying vec2 uvPoint;void main(){vec2 p=uvPoint;vec3 c=mix(lower,upper,smoothstep(.08,.94,p.y));float ridge=.20+.052*sin(p.x*8.)+.028*sin(p.x*21.);float mountain=1.-smoothstep(ridge,ridge+.012,p.y);c=mix(c,vec3(.055,.092,.109),mountain*.72);float ridge2=.10+.035*sin(p.x*14.+1.);c=mix(c,vec3(.026,.057,.064),1.-smoothstep(ridge2,ridge2+.007,p.y));float disk=1.-smoothstep(.029,.032,length((p-vec2(.72,.43))*vec2(2.,1.)));c=mix(c,vec3(.92,.70,.45),disk*.65);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}`});
 const sky=new THREE.Mesh(new THREE.PlaneGeometry(ww+.4,wh+.4),skyMat);sky.position.set(wx,wb+wh/2,-34.0);scene.add(sky);
 const pineMat=new THREE.MeshStandardMaterial({color:'#203a36',roughness:1,envMapIntensity:.1});
 for(let i=0;i<11;i++){
  const x=wl+1.0+i*2.6,h=3.2+((i*17)%9)*.26,z=-33.65;
  const trunk=block(.12,h,.12,dark,x,wb-.2,z);
  for(let layer=0;layer<3;layer++){
   const cone=new THREE.Mesh(new THREE.ConeGeometry(.8+layer*.21,h*.62,7),pineMat);
   cone.position.set(x,wb+h*.80-layer*h*.18,z);cone.castShadow=false;scene.add(cone);
  }
 }
 for(const x of [wx-ww/6,wx+ww/6])block(.28,wh,.48,beamMat,x,wb,-31.55);
 block(ww,.28,.48,beamMat,wx,wb+wh*.49,-31.55);
 const windowGlass=new THREE.Mesh(new THREE.PlaneGeometry(ww,wh),new THREE.MeshPhysicalMaterial({color:'#d9e3e5',transparent:true,opacity:.045,roughness:.18,metalness:.08,envMapIntensity:.35,depthWrite:false}));windowGlass.position.set(wx,wb+wh/2,-31.45);scene.add(windowGlass);
 // A low cabinet, a few books and one linen-shaded lamp make the set feel lived in.
 block(19,4.9,5.6,beamMat,13,-7.8,-28.8);block(19.5,.32,6.1,oak,13,-2.9,-28.8);
 for(const x of [8.3,17.7]){block(8.9,4.2,.08,oak,x,-7.35,-25.95);block(.6,.12,.15,brass,x,-5.1,-25.84);}
 const bookColours=['#687d79','#c3a47f','#80594f','#a9b4a7'];
 for(let i=0;i<4;i++){const book=new THREE.Mesh(new THREE.BoxGeometry(.65,2.1+(i%2)*.3,2.3),new THREE.MeshStandardMaterial({color:bookColours[i],roughness:.85}));book.position.set(6.2+i*.72,-1.5,-28.6);book.rotation.z=i===3?-.15:0;book.castShadow=true;scene.add(book);}
 const lx=17.8,lz=-28.4;
 const lampBase=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.7,.25,48),brass);lampBase.position.set(lx,-2.47,lz);scene.add(lampBase);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,3.8,20),brass);stem.position.set(lx,-.5,lz);scene.add(stem);
 const shadeMat=new THREE.MeshPhysicalMaterial({color:'#e8d1ad',roughness:.88,side:THREE.DoubleSide,emissive:'#e3ab62',emissiveIntensity:.18,envMapIntensity:.15});
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(1.65,2.8,3.5,64,1,true),shadeMat);shade.position.set(lx,2.3,lz);shade.castShadow=true;scene.add(shade);
 for(const [yy,r] of [[.55,2.8],[4.05,1.65]]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.045,8,64),brass);ring.rotation.x=Math.PI/2;ring.position.set(lx,yy,lz);scene.add(ring);}
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.36,24,16),new THREE.MeshBasicMaterial({color:'#fff0ca'}));bulb.position.set(lx,1.4,lz);scene.add(bulb);
 const lamp=new THREE.PointLight('#ffcb86',190,58,2);lamp.position.set(lx,1.4,lz);scene.add(lamp);
 const wash=new THREE.SpotLight('#ffc995',360,72,Math.PI*.29,.75,2);wash.position.set(lx,3.1,lz+1);wash.target.position.set(17,3,-32.8);scene.add(wash,wash.target);
 const windowLight=new THREE.DirectionalLight('#a7c3d5',.85);windowLight.position.set(-22,12,-38);scene.add(windowLight);
 // A quiet ceramic planter at the back corner; leaves have curved silhouettes and individual rotations.
 const px=-29,pz=-18.5;
 const pot=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.3,3.1,48),cream);pot.position.set(px,-6.23,pz);pot.castShadow=true;scene.add(pot);
 const soil=new THREE.Mesh(new THREE.CircleGeometry(1.52,40),dark);soil.rotation.x=-Math.PI/2;soil.position.set(px,-4.66,pz);scene.add(soil);
 const leafMaterial=new THREE.MeshStandardMaterial({color:'#526c43',roughness:.7,side:THREE.DoubleSide});
 for(let i=0;i<8;i++){
  const a=i*2.399,h=3.4+(i%3)*.6;const path=new THREE.CatmullRomCurve3([new THREE.Vector3(px,-4.6,pz),new THREE.Vector3(px+Math.cos(a)*.6,-4.6+h*.6,pz+Math.sin(a)*.6),new THREE.Vector3(px+Math.cos(a)*1.9,-4.6+h,pz+Math.sin(a)*1.9)]);
  const stem=new THREE.Mesh(new THREE.TubeGeometry(path,12,.04,5,false),leafMaterial);scene.add(stem);
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(1.0,.45,1.0,2.0,0,2.6);shape.bezierCurveTo(-.7,2,-.7,.4,0,0);
  const leaf=new THREE.Mesh(new THREE.ShapeGeometry(shape,12),leafMaterial);leaf.position.copy(path.getPoint(.7));leaf.rotation.set(-.8,a,.25);leaf.scale.setScalar(.7);leaf.castShadow=true;scene.add(leaf);
 }
 // A woven oval rug is a soft visual layer under the transparent desk, leaving the oak floor exposed.
 const rugCanvas=document.createElement('canvas');rugCanvas.width=rugCanvas.height=256;const rc=rugCanvas.getContext('2d');rc.fillStyle='#a69984';rc.fillRect(0,0,256,256);
 for(let i=0;i<256;i+=4){rc.strokeStyle=i%8?'#b6aa95':'#938776';rc.lineWidth=1;rc.beginPath();rc.moveTo(i,0);rc.lineTo(i,256);rc.stroke();rc.strokeStyle='rgba(225,216,196,.21)';rc.beginPath();rc.moveTo(0,i);rc.lineTo(256,i);rc.stroke();}
 const rugTexture=new THREE.CanvasTexture(rugCanvas);rugTexture.colorSpace=THREE.SRGBColorSpace;rugTexture.wrapS=rugTexture.wrapT=THREE.RepeatWrapping;rugTexture.repeat.set(12,10);rugTexture.anisotropy=8;
 const rug=new THREE.Mesh(new THREE.CircleGeometry(1,96),new THREE.MeshStandardMaterial({map:rugTexture,color:'#9b9386',roughness:1,envMapIntensity:.12}));rug.rotation.x=-Math.PI/2;rug.scale.set(26,18,1);rug.position.set(0,-7.73,1.5);rug.receiveShadow=true;scene.add(rug);
 return {ready:Promise.all(pending),floor};
}
