/* Independent, deterministic motion tracks. Both the renderer and checks use these states. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SceneMotion=api;})(typeof window!=='undefined'?window:globalThis,()=>{
  'use strict';
  const DURATION=24,TAU=Math.PI*2;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,u)=>a+(b-a)*u;
  const phase=(t,a,b)=>clamp((t-a)/(b-a));
  const smooth=u=>u*u*u*(u*(u*6-15)+10);
  const ease=(t,a,b)=>smooth(phase(t,a,b));
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const mul=(a,k)=>a.map(v=>v*k);
  const mix=(a,b,u)=>a.map((v,i)=>lerp(v,b[i],u));
  const norm=a=>mul(a,1/Math.hypot(...a));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const fatCenter=[11.4,-2,0.25],muscleCenter=[17.8,-8.4,.8];
  const receiver=[7.7,3.35,.88];
  const cells=[];
  for(let i=0;i<6;i++){const a=i*TAU/6;cells.push([Math.cos(a)*1.08,Math.sin(a)*1.08,.73,.69]);}
  cells.push([0,0,.78,.7]);
  for(let i=0;i<5;i++){const a=i*TAU/5+.25;cells.push([Math.cos(a)*.76,Math.sin(a)*.76,1.86,.69]);}
  cells.push([0,0,2.96,.7]);
  const launches=Array.from({length:18},(_,i)=>({id:i,time:5.82+i*.23,cell:(i*5)%13,duration:1.62}));
  const depleted=t=>launches.reduce((v,b)=>v+ease(t,b.time,b.time+.38),0)/launches.length;
  const fatScale=t=>Math.cbrt(1-.58*depleted(t));
  function cellState(t,i){
    const def=cells[i],a=i*2.39996,ready=ease(t,.45+i*.065,1.65+i*.065);
    const scatter=[Math.cos(a)*2.5,Math.sin(a)*2.5,1.1+(i%3)*.25];
    const breathing=1+.04*Math.sin((t-2.9)*TAU/2.8)*ease(t,2.7,3.4);
    const scale=fatScale(t)*breathing;
    const pulse=launches.filter(b=>b.cell===i).reduce((v,b)=>v+(t>=b.time&&t<b.time+.25?Math.sin(Math.PI*(t-b.time)/.25):0),0);
    return {id:i,position:add(fatCenter,add(mul(def.slice(0,3),scale),mul(scatter,1-ready))),radius:def[3]*scale*lerp(.55,1,ready),alpha:ease(t,.4+i*.065,.65+i*.065),assembled:ready,pulse};
  }
  function cubic(points,u){const v=1-u;return points[0].map((x,i)=>v*v*v*x+3*v*v*u*points[1][i]+3*v*u*u*points[2][i]+u*u*u*points[3][i]);}
  function particleEnvelope(u){return clamp(u/.09)*clamp((1-u)/.075);}
  function particleState(t,b){
    const u=(t-b.time)/b.duration;if(u<0||u>1)return null;
    const source=cellState(b.time,b.cell);
    const start=add(source.position,[-source.radius*.45,source.radius*.5,.15]);
    const destination=add(receiver,[(b.id%3-1)*.15,0,0]);
    const points=[start,add(start,[-.8,.5,1.5]),add(destination,[.6,-.75,2]),destination];
    return {id:b.id,cell:b.cell,progress:u,position:cubic(points,u),points,radius:.145,alpha:particleEnvelope(u)};
  }
  function camera(t){
    const keys=[
      [0,7,2.7,69,900,650],[2.7,7,2.7,75,900,650],
      [5.0,7,2.7,75,900,650],[6.0,8.1,1.5,82,920,650],
      [11.15,8.1,1.5,82,920,650],[12.85,15,-5.4,80,1000,550],
      [20.8,15,-5.4,80,1000,550],[22.4,15,-5.4,76,1000,540],[24,15,-5.4,76,1000,540]
    ];
    let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;
    const a=keys[i],b=keys[i+1],u=ease(t,a[0],b[0]);
    return {fx:lerp(a[1],b[1],u),fy:lerp(a[2],b[2],u),s:lerp(a[3],b[3],u),cx:lerp(a[4],b[4],u),cy:lerp(a[5],b[5],u),rise:lerp(-1.15,0,ease(t,0,.75))};
  }
  const muscleAxis=[-1,-2.6,1],axisUnit=norm(muscleAxis);
  const muscleE1=norm(cross(axisUnit,[0,0,1])),muscleE2=norm(cross(axisUnit,muscleE1));
  const fascicleOffsets=[[0,0],...Array.from({length:6},(_,i)=>[Math.cos(i*TAU/6)*.78,Math.sin(i*TAU/6)*.78])];
  function fascicleState(t,i){
    const at=12.3+i*.11,assemble=ease(t,13.65+i*.08,14.7+i*.08),o=fascicleOffsets[i];
    const spread=lerp(2.9,1,assemble);
    const shift=add(mul(muscleE1,o[0]*spread),mul(muscleE2,o[1]*spread));
    const start=add(muscleCenter,add(shift,mul(muscleAxis,-.35*(1-assemble))));
    const grow=ease(t,at,at+.95);
    return {id:i,birth:at,start,end:add(start,mul(muscleAxis,grow)),growth:grow,assemble,body:ease(t,at+.55,at+1.3),radius:.44,filaments:Array.from({length:12},(_,j)=>ease(t,at+j*.025,at+.7+j*.025))};
  }
  const actionCenters={energy:[14.222,2.128,.05],food:[18.047,-1.697,.05],strength:[21.872,-5.522,.05]};
  function landing(t,at,duration,start,end,angle=0){
    const p=phase(t,at,at+duration),u=smooth(p),position=mix(start,end,u);
    position[2]+=Math.sin(Math.PI*p)*.6;
    const settling=t>at+duration?Math.sin((t-at-duration)*19)*Math.exp(-(t-at-duration)*11)*.07:0;
    position[2]+=settling;
    return {position,alpha:ease(t,at,at+.18),angle:angle*(1-u),progress:u};
  }
  function state(time){
    const t=clamp(Number(time)||0,0,DURATION);
    const foodC=actionCenters.food,strengthC=actionCenters.strength;
    const foodParts=[
      {id:'egg',at:16.1,d:.82,start:[-2.4,.1,2.9],end:[-.68,.3,.68],angle:-.45},
      {id:'tofu',at:16.5,d:.82,start:[.9,-2.1,2.8],end:[.05,-.4,.25],angle:.32},
      {id:'fish',at:16.9,d:.82,start:[2.2,.9,2.3],end:[.38,.56,.25],angle:-.5},
      {id:'half',at:17.2,d:.8,start:[-1.9,1.7,2.4],end:[-.85,1,.29],angle:.5}
    ].map(p=>({id:p.id,...landing(t,p.at,p.d,add(foodC,p.start),add(foodC,p.end),p.angle)}));
    const bells=[0,1].map(i=>{
      const end=add(strengthC,[i===0?0:-.1,i===0?-.6:.65,.62]);
      return {id:i,...landing(t,18.15+i*.55,.8,add(end,[i===0?-2.6:2.3,i===0?-1:1,2.4]),end,i===0?-.85:.7),shaft:ease(t,18.15+i*.55,18.65+i*.55),leftWeight:ease(t,18.65+i*.55,19.35+i*.55),rightWeight:ease(t,18.82+i*.55,19.52+i*.55)};
    });
    const impacts=launches.reduce((a,b)=>{const dt=t-b.time-b.duration;return a+(dt>=0&&dt<.32?Math.sin(dt/.32*Math.PI):0);},0);
    return {t,camera:camera(t),intake:7.5*ease(t,.55,1.75)*lerp(1,.7,ease(t,3.15,4.65)),expenditure:7.5*ease(t,.92,2.2),deficit:ease(t,4.25,4.95),cells:cells.map((_,i)=>cellState(t,i)),fatScale:fatScale(t),particles:launches.map(b=>particleState(t,b)).filter(Boolean),arrivals:launches.filter(b=>t>=b.time+b.duration).length,impact:impacts,fascicles:fascicleOffsets.map((_,i)=>fascicleState(t,i)),foodParts,bells,plate:landing(t,15.8,.6,add(foodC,[-1.8,.5,.7]),add(foodC,[0,0,.15]),-.35),actionPads:{energy:ease(t,15.25,15.8),food:ease(t,15.55,16.05),strength:ease(t,17.85,18.35)},miniBars:[ease(t,15.6,16.3),ease(t,15.82,16.52)],labels:{fat:ease(t,2.6,3),muscle:ease(t,14.7,15.3),energy:ease(t,16.2,16.7),food:ease(t,17.9,18.3),strength:ease(t,20.15,20.55)}};
  }
  return {DURATION,state,clamp,lerp,phase,ease,add,mul,mix,norm,cross,cubic,particleEnvelope,fatCenter,muscleCenter,muscleAxis,muscleE1,muscleE2,actionCenters,receiver};
});
