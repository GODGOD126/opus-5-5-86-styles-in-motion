const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const M=require('./motion.js');
const close=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);

test('the full timeline is finite, deterministic, and preserves tissue part counts',()=>{
  function finite(v){if(typeof v==='number')assert.ok(Number.isFinite(v));else if(v&&typeof v==='object')Object.values(v).forEach(finite);}
  for(let frame=0;frame<=M.DURATION*60;frame++){
    const s=M.state(frame/60);finite(s);assert.equal(s.cells.length,13);assert.equal(s.fascicles.length,7);
    assert.equal(new Set(s.cells.map(x=>x.id)).size,13);
    for(const c of s.cells){assert.ok(c.radius>0);assert.ok(c.alpha>=0&&c.alpha<=1);}
  }
  for(const t of [1.2,3.5,8.6,13.1,17.3,19.2,24])assert.deepEqual(M.state(t),M.state(t));
});

test('particles remain visible through the middle and reach the deficit receiver',()=>{
  for(let id=0;id<18;id++){
    const birth=5.82+id*.23;
    for(const u of [.1,.25,.5,.75,.9]){
      const p=M.state(birth+u*1.62).particles.find(x=>x.id===id);
      assert.ok(p);assert.ok(p.alpha>.98);assert.ok(p.radius>.1);
    }
    const near=M.state(birth+.999*1.62).particles.find(x=>x.id===id);
    const destination=M.add(M.receiver,[(id%3-1)*.15,0,0]);
    assert.ok(Math.hypot(...near.position.map((v,i)=>v-destination[i]))<.015);
  }
  assert.equal(M.state(11.4).arrivals,18);
  assert.equal(M.state(11.4).particles.length,0);
});

test('bars grow, form a deficit, and do not lengthen when stored energy is used',()=>{
  close(M.state(0).intake,0);close(M.state(0).expenditure,0);
  assert.ok(M.state(1.2).intake>0&&M.state(1.2).intake<7.5);
  close(M.state(2.7).intake,7.5);close(M.state(2.7).expenditure,7.5);
  close(M.state(5).intake,5.25);close(M.state(10).intake,5.25);
  close(M.state(10).expenditure,7.5);
  assert.ok(M.state(10).fatScale<M.state(5).fatScale);
});

test('assembly, independent food landings, and dumbbell weights finish before the final hold',()=>{
  const scattered=M.state(1.15).cells,assembled=M.state(3).cells;
  assert.ok(scattered.some((c,i)=>Math.hypot(...c.position.map((v,j)=>v-assembled[i].position[j]))>1));
  assert.ok(assembled.every(c=>c.assembled===1));
  const mid=M.state(13.4).fascicles;
  assert.ok(mid.some(f=>f.body<1&&f.growth>0));assert.ok(mid.some(f=>f.assemble<1));
  const final=M.state(20.7);
  assert.ok(final.fascicles.every(f=>f.assemble===1&&f.body===1&&f.filaments.every(x=>x===1)));
  const plate=M.state(16.3).foodParts;
  assert.ok(plate.find(x=>x.id==='egg').alpha>0);assert.equal(plate.find(x=>x.id==='fish').alpha,0);
  assert.ok(M.state(18.8).bells.some(b=>b.leftWeight<1||b.rightWeight<1));
  assert.ok(final.foodParts.every(p=>p.progress===1&&p.alpha===1));
  assert.ok(final.bells.every(b=>b.shaft===1&&b.leftWeight===1&&b.rightWeight===1));
  assert.ok(Object.values(final.labels).every(x=>x===1));
});

test('all solids use one true 30-degree isometric projection',()=>{
  const sandbox={SceneMotion:M,window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'geometry.js'),'utf8'),sandbox);
  const r=new sandbox.window.SceneGeometry.Renderer({},M.state(8).camera);
  const origin=r.P([0,0,0]),axes=[[1,0,0],[0,1,0],[0,0,1]].map(a=>r.P(a).map((v,i)=>v-origin[i]));
  close(Math.atan2(axes[0][1],axes[0][0])*180/Math.PI,30);
  close(Math.atan2(axes[1][1],axes[1][0])*180/Math.PI,150);
  axes.forEach(a=>close(Math.hypot(...a),r.cam.s));
});
