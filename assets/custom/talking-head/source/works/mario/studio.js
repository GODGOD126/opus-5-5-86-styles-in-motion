import * as THREE from './vendor/three.module.js';
import {Reflector} from './vendor/Reflector.js';
import {createCabin} from './cabin.js';

// A photographed product set: a warm timber cabin, reflected strip boxes, optical glass and polished metal.
// The environment map is a local scene, so the panel's moving highlights are real view-dependent reflections.
export function createStudio(renderer,scene,{embedded=false}={}){
 scene.background=new THREE.Color('#3b2a20');
 scene.fog=new THREE.FogExp2('#44362c',.0025);
 renderer.toneMappingExposure=.93;
 renderer.transmissionResolutionScale=.65;
 const env=new THREE.Scene();env.background=new THREE.Color('#30271f');
 function lightCard(w,h,x,y,z,strength,color='#ffffff',target=[0,0,0]){
  const c=new THREE.Color(color).multiplyScalar(strength);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,toneMapped:false}));m.position.set(x,y,z);m.lookAt(...target);env.add(m);return m;
 }
 lightCard(17,3,-12,20,6,3.6,'#fff1dc');
 lightCard(3,22,19,9,0,2.7,'#dce9ef');
 lightCard(25,2,0,9,-18,3.7,'#e4f0ff');
 lightCard(3,15,-20,4,-5,2.4,'#e9c4ff');
 lightCard(8,3,2,1,22,1.1,'#fff2db');
 lightCard(28,14,-22,4,-33,1.5,'#bfced8');
 lightCard(7,9,18,3,-28,1.5,'#ffcc91');
 const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileCubemapShader();
 const envTarget=pmrem.fromScene(env,.025,.1,100);scene.environment=envTarget.texture;scene.environmentIntensity=.72;pmrem.dispose();
 scene.add(new THREE.HemisphereLight('#e9dcc9','#3a2b21',.50));
 const key=new THREE.DirectionalLight('#fff1df',3.0);key.position.set(-12,25,10);key.castShadow=true;key.shadow.mapSize.set(embedded?1024:2048,embedded?1024:2048);Object.assign(key.shadow.camera,{left:-27,right:27,top:25,bottom:-25,near:1,far:75});key.shadow.bias=-.00018;key.shadow.normalBias=.025;key.shadow.radius=4;scene.add(key);
 const rim=new THREE.DirectionalLight('#c2d5e3',1.7);rim.position.set(15,12,-18);scene.add(rim);
 const warm=new THREE.DirectionalLight('#ffd7ae',.75);warm.position.set(-18,9,-12);scene.add(warm);
 const chrome=new THREE.MeshPhysicalMaterial({color:'#8b96a4',metalness:1,roughness:.16,clearcoat:1,clearcoatRoughness:.08});
 const blackMetal=new THREE.MeshStandardMaterial({color:'#0a0b0e',metalness:.65,roughness:.27});
 const glassCache=new Map();
 function glass(color='#c9e5ef',transmission=.9,roughness=.1,thickness=.65){
  const k=[color,transmission,roughness,thickness].join('/');if(glassCache.has(k))return glassCache.get(k);
  const tint=new THREE.Color(color).lerp(new THREE.Color('#ffffff'),.22);
  const m=new THREE.MeshPhysicalMaterial({color:tint,metalness:0,roughness,transmission,thickness,ior:1.46,attenuationColor:color,attenuationDistance:3,clearcoat:.65,clearcoatRoughness:.045,envMapIntensity:.86,specularIntensity:.8});glassCache.set(k,m);return m;
 }
 const panelGlass=glass('#96bed1',.97,.045,.88);
 const faceGlass=new THREE.MeshPhysicalMaterial({color:'#d4e4ec',transparent:true,opacity:.055,roughness:.12,metalness:0,clearcoat:.6,envMapIntensity:.22,depthWrite:false});
 const subGlass=new THREE.MeshPhysicalMaterial({color:'#bfdce9',transparent:true,opacity:.12,roughness:.19,metalness:0,clearcoat:.5,envMapIntensity:.32,depthWrite:false});
 const edgeGlass=glass('#d3f6ff',.96,.045,.45);
 const cube=new THREE.BoxGeometry(1,1,1);
 function block(w,h,d,m,x,y,z){const o=new THREE.Mesh(cube,m);o.scale.set(w,h,d);o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
 function slab(w,h,d,m,x,y,z,r=.4){const s=new THREE.Shape(),a=-w/2,b=-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);const geo=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:.055,bevelThickness:.035,bevelSegments:4,steps:1,curveSegments:12});geo.rotateX(-Math.PI/2);const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=m.transmission===undefined;o.receiveShadow=true;scene.add(o);return o;}
 const cabin=createCabin(renderer,scene);
 // Clear, thick table with separate polished edges, supporting rails and four tapered chrome legs.
 const desk=slab(38,.46,23,glass('#96c4d2',.98,.055,.46),0,-1.53,0,.65);
 for(const x of [-16.8,16.8])for(const z of [-9.2,9.2]){
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.12,.20,6.0,16),chrome);leg.position.set(x,-4.6,z);leg.castShadow=true;scene.add(leg);
  slab(1.2,.11,1.2,chrome,x,-1.68,z,.2);slab(1.1,.08,1.1,blackMetal,x,-7.75,z,.2);
 }
 for(const z of [-9.2,9.2])block(33.6,.13,.12,chrome,0,-1.75,z);
 for(const x of [-16.8,16.8])block(.12,.13,18.4,chrome,x,-1.75,0);
 // Planar reflection is faint and layered over the transmitted glass, with actual scene objects reflected.
 const mirror=new Reflector(new THREE.PlaneGeometry(37.8,22.8),{color:'#aeb7c0',textureWidth:embedded?512:1024,textureHeight:embedded?288:576,clipBias:.002,multisample:embedded?0:2});
 mirror.rotation.x=-Math.PI/2;mirror.position.y=-1.015;mirror.material.transparent=true;mirror.material.depthWrite=false;
 mirror.material.fragmentShader=mirror.material.fragmentShader.replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4( blendOverlay( base.rgb, color ), 0.17 )');
 scene.add(mirror);
 // Four discreet pads physically separate the floating editor pane from the desk.
 for(const x of [-11.9,11.9])for(const z of [-6,6])slab(.7,.23,.7,chrome,x,-1.04,z,.16);
 // A few intentional coloured objects, each with an optically smooth surface and reflected softboxes.
 const sphereGeo=new THREE.SphereGeometry(1,64,40),spheres=[];
 const specs=[[-16.9,-.26,6.7,.7,'#cf515d',0],[16.5,-.34,7.1,.62,'#e6b867',0],[17.25,-.58,4.9,.38,'#60c8dd',1],[-16.1,-.52,-6.2,.45,'#9a8cda',1],[-17.7,-.58,5.3,.36,'#6fa5c3',1],[16.3,-.57,-6.6,.40,'#d8a076',0]];
 specs.forEach(([x,y,z,r,color,isGlass],i)=>{
  const material=isGlass?new THREE.MeshPhysicalMaterial({color:'#ffffff',transmission:.82,thickness:r*2,attenuationColor:color,attenuationDistance:r*2,ior:1.47,roughness:.035,clearcoat:1,envMapIntensity:1.7,iridescence:.22}):new THREE.MeshPhysicalMaterial({color,metalness:.62,roughness:.13,clearcoat:1,clearcoatRoughness:.035,iridescence:.18,envMapIntensity:1.4});
  const m=new THREE.Mesh(sphereGeo,material);m.scale.setScalar(r);m.position.set(x,y,z);m.castShadow=!isGlass;m.receiveShadow=true;scene.add(m);spheres.push({m,x,y,z,r,i});
 });
 // Visible edge highlights are thin, dim and fixed to the glass instead of glowing outlines.
 const edge=new THREE.MeshBasicMaterial({color:'#9ec3ce',transparent:true,opacity:.25});
 block(36.5,.012,.018,edge,0,-1.02,11.49);block(.018,.012,21.8,edge,18.98,-1.02,0);
 return {ready:cabin.ready,glass,panelGlass,faceGlass,subGlass,edgeGlass,chrome,blackMetal,desk,mirror,update(t,beat){spheres.forEach(({m,x,y,z,r,i})=>{m.position.set(x,y,z);m.rotation.y=t*.10+i;});}};
}
