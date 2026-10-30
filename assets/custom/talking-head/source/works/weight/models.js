/* Each food, cell, fascicle, filament, shaft and weight is a separate animated part. */
(() => {
  'use strict';
  const M=SceneMotion,{add,mul,mix,ease}=M;
  const {color,polygon}=SceneGeometry;
  const TAU=Math.PI*2;
  const floorOutline=[[0,0],[8,0],[8,-5],[14,-5],[14,-12],[21,-12],[21,-8],[25,-8],[25,-3],[21,-3],[21,2],[17,2],[17,6],[10,6],[10,7],[0,7]];
  function pad(r,center,radius=2,progress=1){
    if(progress<.001)return;const [x,y,z]=add(center,[0,0,-.5*(1-progress)]);
    const prev=r.layer;r.layer=-1;
    r.disk(x,y,z,radius,.17,'#c7bbdf',progress);
    r.disk(x,y,z+.17,radius-.065,.045,'#fffaf1',progress);
    r.layer=prev;
  }
  function energy(r,s){
    const at=.14;
    r.box(.86,1.3,0,.24,4,.28,'#d7d1e7',ease(s.t,.2,.65));
    if(s.intake>.01)r.shadowRect(1.1,1.4,s.intake,1,.98);
    if(s.expenditure>.01)r.shadowRect(1.1,4.1,s.expenditure,1,.98);
    r.box(1.1,1.4,at,s.intake,1,.82,'#8cbfe5');
    r.box(1.1,4.1,at,s.expenditure,1,.82,'#8bd3b4');
    const guide=s.deficit*(1-ease(s.t,11.03,11.58));
    if(guide>.001){
      const a=1.1+s.intake,b=8.6;
      r.line([[a,2.4,1.02],[a,.65,1.55]],'#ed9a89',2,guide,[7,8]);
      r.line([[b,5.1,1.02],[b,.65,1.55]],'#ed9a89',2,guide,[7,8]);
      r.line([[a,.65,1.48],[a,.65,1.73],[b,.65,1.73],[b,.65,1.48]],'#ed7d6d',5,guide);
    }
    const receiverAlpha=ease(s.t,5.3,5.7),[x,y]=M.receiver;
    r.disk(x,y,.22,.43,.12,'#efd091',receiverAlpha);
    r.disk(x,y,.34,.32,.025,'#ffe3a0',receiverAlpha);
    if(s.impact>.01){
      const ring=[];for(let i=0;i<=40;i++){const a=i*TAU/40;ring.push([x+Math.cos(a)*(.4+s.impact*.12),y+Math.sin(a)*(.4+s.impact*.12),.38]);}
      r.line(ring,'#e8af3d',3,Math.min(1,s.impact)*receiverAlpha);
    }
  }
  function hull(pts){
    pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    const lo=[],hi=[];for(const p of pts){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}
    for(const p of pts.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));
  }
  function storage(r,s){
    const [x,y]=M.fatCenter;pad(r,[x,y,0],2.15,ease(s.t,.1,.7));
    r.layer=0;ellipsePlane(r,[x+.12,y+.09,.225],1.42*s.fatScale,1.28*s.fatScale,'#81728f',.13*ease(s.t,1.3,2.5));r.layer=1;
    s.cells.forEach(cell=>{if(cell.alpha>.05)r.shadowRound(cell.position[0],cell.position[1],cell.radius*.72*cell.alpha,cell.position[2]);});
    const ghost=ease(s.t,6.9,9.1)*.58;
    if(ghost>.001){
      const points=[];
      M.state(3).cells.forEach(cell=>{const p=r.P(cell.position),rr=cell.radius*r.cam.s*Math.sqrt(1.5)+9;for(let j=0;j<16;j++)points.push([p[0]+rr*Math.cos(j*TAU/16),p[1]+rr*Math.sin(j*TAU/16)]);});
      const outline=polygon(hull(points));r.items.push({key:x+y-10,draw:()=>{const c=r.c;c.globalAlpha=ghost;c.setLineDash([9,11]);c.strokeStyle='#dfaa83';c.lineWidth=2.8;c.stroke(outline);c.setLineDash([]);}});
    }
    s.cells.forEach(cell=>r.sphere(cell.position,cell.radius,color('#edc570','#fff1ad',cell.pulse*.18),cell.alpha));
    s.particles.forEach(p=>{
      for(let j=2;j>=1;j--){const u=p.progress-j*.035;if(u>0)r.sphere(M.cubic(p.points,u),p.radius*(.48-j*.1),'#efcc76',p.alpha*.4);}
      r.sphere(p.position,p.radius,'#f2c350',p.alpha);
    });
  }
  function muscles(r,s){
    const alpha=ease(s.t,11.6,12.2);if(alpha<=.001)return;
    const [x,y]=M.muscleCenter;pad(r,[x,y,0],2.05,alpha);
    r.layer=0;ellipsePlane(r,[x,y,.225],1.1,.95,'#81728f',.14*ease(s.t,13.6,15.3));r.layer=1;
    const tissueOpacity=Math.max(...s.fascicles.map(f=>f.body));
    if(tissueOpacity>.01)r.shadowRound(x-.35,y-.5,1.1*tissueOpacity,2.1*tissueOpacity);
    const e1=M.muscleE1,e2=M.muscleE2,axis=M.muscleAxis;
    s.fascicles.forEach(f=>{
      if(f.growth<.001)return;
      r.cylinder(f.start,f.end,f.radius,'#e58580',f.body,18,[e1,e2],true);
      for(let j=0;j<12;j++){
        const theta=j*TAU/12,normal=add(mul(e1,Math.cos(theta)),mul(e2,Math.sin(theta)));
        if(normal[0]+normal[1]+normal[2]<-.1)continue;
        const points=[];
        for(let n=0;n<=22;n++){
          const u=n/22*f.filaments[j],angle=theta+.05*Math.sin(u*Math.PI),rr=f.radius*(.76+.26*Math.sin(u*Math.PI))+.008;
          points.push(add(add(mix(f.start,f.end,u),mul(e1,.1*Math.sin(u*Math.PI))),add(mul(e1,Math.cos(angle)*rr),mul(e2,Math.sin(angle)*rr))));
        }
        const fiberColor=SceneGeometry.color('#d37370',j%3?'#f7bc9f':'#cc6d70',f.body);
        r.line(points,fiberColor,M.lerp(5.3,j%3?2:2.7,f.body),ease(s.t,f.birth,f.birth+.18));
      }
      // Fine fibers inside each of the seven cut faces, independently revealed.
      const capBase=add(f.start,mul(M.norm(axis),-.012));
      for(let j=0;j<7;j++){
        const a=j*TAU/6,rad=j===6?0:.22,center=add(capBase,add(mul(e1,Math.cos(a)*rad),mul(e2,Math.sin(a)*rad)));
        const circle=[];for(let k=0;k<12;k++){const an=k*TAU/12;circle.push(add(center,add(mul(e1,Math.cos(an)*.075),mul(e2,Math.sin(an)*.075))));}
        r.face(circle,'#efb09a',f.body,'#ffd2b8');
      }
    });
  }
  function miniEnergy(r,s){
    const ctr=M.actionCenters.energy,[x,y,z]=ctr;
    pad(r,ctr,1.75,s.actionPads.energy);
    if(s.miniBars[0]>.001){r.box(x-1.3,y-.75,z+.27,2.1*s.miniBars[0],.38,.36,'#8cbfe5');r.shadowRect(x-1.3,y-.75,2.1,.38,.5);}
    if(s.miniBars[1]>.001){r.box(x-1.3,y+.16,z+.27,2.8*s.miniBars[1],.38,.36,'#8bd3b4');r.shadowRect(x-1.3,y+.16,2.8,.38,.5);}
  }
  function ellipsePlane(r,center,rx,ry,col,alpha=1){const pts=[];for(let j=0;j<40;j++){const a=j*TAU/40;pts.push(add(center,[Math.cos(a)*rx,Math.sin(a)*ry,0]));}r.face(pts,col,alpha);}
  function egg(r,p,alpha,angle){
    const c=r.c,xy=r.P(p),scale=r.cam.s;
    r.custom(p,()=>{c.save();c.globalAlpha=alpha;c.translate(...xy);c.rotate(angle-.16);const g=c.createLinearGradient(-.3*scale,-.7*scale,.45*scale,.5*scale);g.addColorStop(0,'#fff5de');g.addColorStop(.5,'#e9c9a7');g.addColorStop(1,'#cda385');c.beginPath();c.moveTo(0,-.72*scale);c.bezierCurveTo(.42*scale,-.74*scale,.59*scale,.12*scale,.29*scale,.4*scale);c.bezierCurveTo(-.1*scale,.77*scale,-.63*scale,.24*scale,-.45*scale,-.26*scale);c.bezierCurveTo(-.36*scale,-.55*scale,-.21*scale,-.71*scale,0,-.72*scale);c.fillStyle=g;c.fill();c.restore();});
  }
  function food(r,s){
    pad(r,M.actionCenters.food,1.75,s.actionPads.food);
    const p=s.plate;if(p.alpha>.001){const [x,y,z]=p.position;const prev=r.layer;r.layer=0;r.disk(x,y,z,1.58,.08,'#dad5d5',p.alpha);r.disk(x,y,z+.08,1.49,.04,'#fffdf6',p.alpha);r.layer=prev;}
    s.foodParts.forEach(part=>{
      if(part.alpha<.001)return;const [x,y,z]=part.position,a=part.alpha;r.shadowRound(x,y,.45,z);
      if(part.id==='egg')egg(r,part.position,a,part.angle);
      if(part.id==='half'){
        ellipsePlane(r,[x,y,z],.6,.43,'#d8bea0',a);ellipsePlane(r,[x,y,z+.075],.6,.43,'#fff5db',a);ellipsePlane(r,[x+.03,y,z+.09],.27,.25,'#efaf40',a);ellipsePlane(r,[x-.025,y-.04,z+.1],.2,.18,'#ffcf65',a);
      }
      if(part.id==='tofu'){
        r.box(x-.5,y-.4,z,.98,.82,.65,'#e6d9c0',a);
        for(let i=1;i<3;i++){r.line([[x-.5+i*.325,y-.4,z+.657],[x-.5+i*.325,y+.42,z+.657]],'#d5c7ad',1.2,a*.7);r.line([[x-.5,y-.4+i*.273,z+.657],[x+.48,y-.4+i*.273,z+.657]],'#d5c7ad',1.2,a*.7);}
      }
      if(part.id==='fish'){
        r.box(x-.72,y-.34,z,1.47,.68,.18,'#c5b5a8',a);r.box(x-.7,y-.33,z+.18,1.43,.66,.16,'#edaa7f',a);
        for(let j=0;j<8;j++){
          const line=[];for(let k=0;k<=14;k++){const u=k/14;line.push([x-.65+j*.17+.065*Math.sin(u*TAU),y-.3+u*.6,z+.35]);}r.line(line,'#ffe0b7',2,a);
        }
      }
    });
  }
  function strength(r,s){
    pad(r,M.actionCenters.strength,1.75,s.actionPads.strength);
    s.bells.forEach(b=>{
      if(b.alpha<.001)return;const axis=[Math.cos(b.angle),Math.sin(b.angle),0],p=b.position;
      r.shadowRound(p[0],p[1],.95,p[2]);
      r.cylinder(add(p,mul(axis,-1.18*b.shaft)),add(p,mul(axis,1.18*b.shaft)),.145,'#cf9caa',b.alpha,14);
      for(const [sign,k]of[[-1,b.leftWeight],[1,b.rightWeight]]){
        if(k<.001)continue;const center=add(p,mul(axis,sign*(1.05+1.1*(1-k))));
        r.cylinder(add(center,mul(axis,-.21)),add(center,mul(axis,.21)),.5,'#ed9a91',k*b.alpha,6);
        const collar=add(p,mul(axis,sign*.79));r.cylinder(add(collar,mul(axis,-.055)),add(collar,mul(axis,.055)),.22,'#d98489',k*b.alpha,12);
      }
      for(let i=0;i<6;i++){const ctr=add(p,mul(axis,-.42+i*.16));r.cylinder(add(ctr,mul(axis,-.014)),add(ctr,mul(axis,.014)),.152,'#ebc5c4',b.shaft*b.alpha,12);}
    });
  }
  window.SceneModels={floorOutline,energy,storage,muscles,miniEnergy,food,strength,pad};
})();
