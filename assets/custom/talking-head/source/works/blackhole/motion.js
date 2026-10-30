/* Deterministic diagram geometry; conceptual paths, not GR ray tracing. */
(function(root){
  'use strict';
  const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,p)=>a+(b-a)*p;
  const smooth=(a,b,t)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p)};
  const out=p=>1-Math.pow(1-clamp(p),3);
  const rng=seed=>()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  function state(t){return{t:clamp(t,0,22),zoom:smooth(5.15,6.4,t),scroll:smooth(12.1,13.6,t),build:smooth(13.5,18.7,t)}}
  function hole(t){const z=state(t).zoom;return{x:mix(792,790,z),y:mix(386,391,z),r:mix(202,251,z)}}
  // Rays passing below the hole bend upward toward it and still escape.
  function external(u,lane=0){const x=mix(-100,1380,u),a=.52-lane*.12,s=180,dx=x-830;
    const f=x=>x+s*Math.log(Math.cosh(x/s));
    return{x,y:638+lane*45-a*.5*(f(dx)-f(-930))};}
  function incoming(u,lane=0){const endX=790-lane*25,endY=380+lane*35;
    const p0={x:-70,y:398+lane*101},p1={x:500,y:190+lane*115},p2={x:620,y:200+lane*100},p3={x:endX,y:endY},v=1-u;
    return{x:v*v*v*p0.x+3*v*v*u*p1.x+3*v*u*u*p2.x+u*u*u*p3.x,y:v*v*v*p0.y+3*v*v*u*p1.y+3*v*u*u*p2.y+u*u*u*p3.y};}
  const gas=[];let rand=rng(921);
  const rings=[{r:162,w:30,color:'#f3e7bb'},{r:188,w:31,color:'#d8ac58'},{r:215,w:31,color:'#c54a32'},{r:242,w:31,color:'#d8ac58'},{r:269,w:27,color:'#8caec2'}];
  rings.forEach((ring,k)=>{for(let j=0;j<14;j++)gas.push({id:gas.length,ring:k,r:ring.r,w:ring.w,color:ring.color,a:j/14*TAU+rand()*.03,len:TAU/14*(1.08+rand()*.06),start:13.48+k*.31+j*.116,duration:1.45+rand()*.35,seed:Math.floor(rand()*1e6),offset:rand()*.2})});
  function gasState(g,t){const p=out((t-g.start)/g.duration),r=g.r+(1-p)*(110+g.r*.12),rotation=Math.max(0,t-13.48)*(.19-g.r*.00028);
    return{p,r,a:g.a+rotation-(1-p)*.75,w:mix(4,g.w,p),len:g.len*(.22+.78*p),opacity:smooth(g.start,g.start+.18,t)};}
  const api={TAU,clamp,mix,smooth,out,rng,state,hole,external,incoming,gas,gasState,duration:22};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BHMotion=api;
})(typeof window==='undefined'?globalThis:window);
