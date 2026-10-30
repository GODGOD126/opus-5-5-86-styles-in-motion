/* Original subject-specific animation. Reference: Futurepedia #15 Isometric Pastel.
 * Model parts, projection and motion tracks are separated in the adjacent modules.
 * Assembly and breathing are visual presentation; no cell creation/destruction is implied.
 */
(() => {
  'use strict';
  const canvas=document.getElementById('scene'),c=canvas.getContext('2d',{alpha:false});
  const M=SceneMotion,{ease,lerp}=M,{Renderer}=SceneGeometry,models=SceneModels;
  const INK='#223454',CORAL='#e97868';
  function text(str,x,y,size=52,col=INK,weight=850,align='center'){
    c.font=weight+' '+size+'px SceneSans, sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(str,x,y);
  }
  function tag(str,x,y,size=49,alpha=1,opts={}){
    if(alpha<.001)return;c.save();c.globalAlpha=alpha;
    c.font='850 '+size+'px SceneSans';const w=opts.w||c.measureText(str).width+43,h=opts.h||size+27;
    c.shadowColor='rgba(91,75,135,.17)';c.shadowBlur=18;c.shadowOffsetY=6;
    c.fillStyle='#fffdfa';c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,16);c.fill();c.shadowColor='transparent';
    c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();text(str,x,y+1,size,opts.color||INK);c.restore();
  }
  function phrase(runs,x,y,size=102,alpha=1){
    if(alpha<.001)return;c.save();c.globalAlpha=alpha;
    for(const [str,col]of runs){text(str,x,y,size,col||INK,900,'left');x+=c.measureText(str).width;}c.restore();
  }
  function headings(t){
    const a=ease(t,5.08,5.31),b=ease(t,5.36,5.65),d=ease(t,11.15,11.4),e=ease(t,11.47,11.77);
    phrase([['减脂，需要持续的',INK],['热量缺口',CORAL]],99,124-10*a,102,1-a);
    phrase([['缺口持续，',INK],['身体动用储能',CORAL]],99,124+15*(1-b)-10*d,102,b*(1-d));
    phrase([['减',INK],['脂肪','#c69b40'],['，也要尽量保住',INK],['肌肉',CORAL]],99,124+15*(1-e),102,e);
  }
  function annotations(r,s){
    const leave=1-ease(s.t,11.03,11.58);
    for(const [name,p,alpha]of[['摄入',[1.1,1.4,1.8],ease(s.t,.9,1.25)],['消耗',[1.1,4.1,1.8],ease(s.t,1.25,1.6)]]){
      const xy=r.P(p);tag(name,xy[0],Math.max(245,xy[1]-14),50,alpha*leave);
    }
    if(s.deficit>.001){const p=r.P([(1.1+s.intake+8.6)/2,.65,1.73]);c.save();c.globalAlpha=s.deficit*leave;text('缺口',p[0],p[1]-47,54,CORAL,900);c.restore();}
    const fp=r.P([M.fatCenter[0],M.fatCenter[1],0]);
    const pan=ease(s.t,11.15,12.85);
    tag(s.t<11.55?'身体储能':'脂肪',fp[0],fp[1]+lerp(135,86,pan),51,s.labels.fat);
    const mp=r.P([M.muscleCenter[0],M.muscleCenter[1],0]);tag('肌肉',mp[0],mp[1]+80,51,s.labels.muscle);
    for(const [key,label]of[['energy','适度缺口'],['food','足量蛋白质'],['strength','力量训练']]){
      const p=r.P(M.actionCenters[key]);tag(label,p[0],p[1]+1.72*r.cam.s,47,s.labels[key]);
    }
    const a=ease(s.t,2.25,2.65)*leave;if(a>.001){
      tag('',620,955,79,a,{w:605,h:116});
      c.save();c.globalAlpha=a;text('摄入',461,955,77,INK,900);text('消耗',779,955,77,INK,900);
      const p=ease(s.t,3.15,3.8);c.strokeStyle=SceneGeometry.color('#86bdab',CORAL,p);c.lineWidth=10;c.lineCap='round';
      c.beginPath();c.moveTo(649,lerp(939,924,p));c.lineTo(592,lerp(939,955,p));c.moveTo(592,lerp(971,955,p));c.lineTo(649,lerp(971,986,p));c.stroke();c.restore();
    }
  }
  function renderFrame(t){
    const s=M.state(t);c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;
    const bg=c.createLinearGradient(0,0,1920,1080);bg.addColorStop(0,'#f9f5ed');bg.addColorStop(.48,'#f3f0ef');bg.addColorStop(1,'#e9e6f2');c.fillStyle=bg;c.fillRect(0,0,1920,1080);
    const r=new Renderer(c,s.camera);r.floor(models.floorOutline);
    models.energy(r,s);models.storage(r,s);models.muscles(r,s);
    models.miniEnergy(r,s);models.food(r,s);models.strength(r,s);r.flush();
    annotations(r,s);headings(s.t);
    canvas.dataset.time=s.t.toFixed(3);canvas.dataset.stage=s.t<5.4?'部件汇集与热量缺口':s.t<11.5?'储能颗粒传递':'肌纤维与行动物体拼合';
    canvas.dataset.cellCount=String(s.cells.length);canvas.dataset.arrivals=String(s.arrivals);
  }
  window.DURATION=M.DURATION;window.renderFrame=renderFrame;window.getSceneState=M.state;
  window.sceneMetadata=Object.freeze({duration:M.DURATION,width:1920,height:1080,cellCount:13,fascicleCount:7,foodCount:4,dumbbellCount:2,version:'isometric-sample-2'});
})();
