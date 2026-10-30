'use strict';
// All movement is derived from the narration clock, including arbitrary seeks.
const LATER=(()=>{
  const posters=[],promptSheets=[],journeyThumbs=[];let repository;
  const ink='#25334c',muted='#6c7584',blue='#5579b8';
  const gate=(t,a,b,r=.55)=>smooth(a,a+r,t)*(1-smooth(b-r,b,t));
  function ui(s,x,y,size=24,color=ink,weight=500,align='left'){
    c.save();c.fillStyle=color;c.font=`${weight} ${size}px "Segoe UI", "Microsoft YaHei", sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);c.restore();
  }
  function fit(s,x,y,max,size=24,color=ink,weight=500,align='left'){
    c.save();c.font=`${weight} ${size}px "Segoe UI", "Microsoft YaHei", sans-serif`;
    const width=c.measureText(s).width;ui(s,x,y,Math.min(size,size*max/Math.max(1,width)),color,weight,align);c.restore();
  }
  function panel(x,y,w,h,draw,angle=0,alpha=1){
    c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);glassFrame(w,h);
    glassContent(w,h,(a,b,d,e)=>{c.fillStyle='#fffffff2';c.fillRect(a,b,d,e);draw?.(a,b,d,e)});c.restore();
  }
  function poster(id,x,y,w,h=w*9/16,angle=0,alpha=1){
    const image=posters[id-1];if(!image||alpha<.002)return;
    panel(x,y,w,h+20,(a,b,d,e)=>c.drawImage(image,a,b,d,e),angle,alpha);
  }
  function cursor(x,y,click=0){
    c.save();c.translate(x,y);c.shadowColor='#0002';c.shadowBlur=7;
    c.fillStyle='#20242a';c.strokeStyle='#ffffff';c.lineWidth=2.5;
    c.beginPath();c.moveTo(0,0);c.lineTo(0,35);c.lineTo(10,26);c.lineTo(17,43);c.lineTo(25,39);c.lineTo(18,23);c.lineTo(33,22);c.closePath();c.fill();c.stroke();
    if(click>0&&click<1){c.shadowBlur=0;c.globalAlpha*=1-click;c.strokeStyle='#5e88d0';c.lineWidth=3;c.beginPath();c.arc(8,15,14+click*30,0,7);c.stroke()}
    c.restore();
  }
  function check(x,y,color=blue){c.save();c.strokeStyle=color;c.lineWidth=3.5;c.lineCap='round';c.beginPath();c.moveTo(x-8,y);c.lineTo(x-2,y+6);c.lineTo(x+10,y-8);c.stroke();c.restore()}
  function imageFrame(source,x,y,w,h,alpha=1){
    panel(x,y,w,h,(a,b,d,e)=>{if(source&&source.width)c.drawImage(source,a,b,d,e)},0,alpha);
  }
  function promptDocument(t){
    const enter=smooth(29.75,30.28,t),leave=smooth(35.9,36.65,t);if(!enter||leave>=1)return;
    c.save();c.globalAlpha*=enter*(1-leave);c.translate(0,(1-enter)*75);
    panel(1138,556,1340,790,(x,y,w,h)=>{
      const turns=FILM_TIMING.pageTurns;let page=0,p=0;
      for(let i=0;i<turns.length;i++){if(t>=turns[i]){page=i;p=smooth(turns[i],turns[i]+.73,t)}}
      if(p>=1){page=Math.min(page+1,2);p=0}
      const current=promptSheets[page],next=promptSheets[Math.min(page+1,2)];
      c.drawImage(next,x,y,w,h);
      if(p<=0)c.drawImage(current,x,y,w,h);
      else{
        const fold=w*(1-p),bend=Math.sin(p*Math.PI)*100;
        if(fold>1)c.drawImage(current,0,0,current.width*(1-p),current.height,x,y,fold,h);
        const shadow=c.createLinearGradient(x+fold-bend*.6,0,x+fold+bend*.4,0);shadow.addColorStop(0,'#242e3d00');shadow.addColorStop(.6,'#242e3d32');shadow.addColorStop(1,'#242e3d00');c.fillStyle=shadow;c.fillRect(x+fold-bend*.6,y,bend,h);
        const face=c.createLinearGradient(x+fold-bend,0,x+fold,0);face.addColorStop(0,'#e3e8ef');face.addColorStop(.66,'#fff');face.addColorStop(1,'#d5dce5');c.fillStyle=face;c.beginPath();c.moveTo(x+fold,y);c.quadraticCurveTo(x+fold-bend*.28,y+h*.48,x+fold,y+h);c.lineTo(x+fold-bend,y+h-26*Math.sin(Math.PI*p));c.quadraticCurveTo(x+fold-bend*.72,y+h*.5,x+fold-bend,y+26*Math.sin(Math.PI*p));c.closePath();c.fill();
      }
    },-.012*(1-enter));c.restore();
  }
  function research(t){
    const alpha=gate(t,23.65,43.95,.65);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const good=smooth(35.95,37.15,t),stack=smooth(40.8,43.55,t);
    const heading=good?'从作品本身学':'让 Codex 做出好动效';
    c.save();c.globalAlpha*=1-smooth(29.75,30.28,t)*(1-good);displayText(heading,1130,230,76,ink,'center');c.restore();
    const toPrompts=smooth(29.85,30.75,t);
    c.save();c.globalAlpha*=(1-good)*(1-smooth(29.75,30.28,t));
    const prompts=['丝滑转场','电影感运镜','更高级一点'];
    for(let i=0;i<3;i++){
      const p=out(cl((t-24.3-i*.35)/.6)),attempt=smooth(30.2+i*1.17,30.8+i*1.17,t);
      const x=mix(780,775-i*20,toPrompts)+Math.sin(i+1)*8,y=425+i*150;
      c.save();c.translate((1-p)*-90-good*100,0);c.globalAlpha*=p;
      panel(x,y,610,116,(a,b,w,h)=>{
        if(i===0)c.drawImage(codexLogo,a+20,b+20,54,54);
        ui(prompts[i],a+(i===0?96:32),b+h/2,34,ink,650);
        if(attempt>.8)ui('↗',a+w-54,b+h/2,32,'#758497');
      },(i-1)*.012*toPrompts);c.restore();
    }
    const target=out(cl((t-26.1)/.85));
    poster(13,1483,575,620,349,-.025*(1-target),target);
    c.save();c.globalAlpha*=toPrompts;
    for(let i=0;i<3;i++){const p=out(cl((t-31.1-i*1.0)/.6));if(p>0){c.strokeStyle=`rgba(97,113,141,${.2*p})`;c.lineWidth=1.5;c.beginPath();c.moveTo(1090,425+i*150);c.bezierCurveTo(1195,425+i*150,1120,575,1163,575);c.stroke()}}
    c.restore();c.restore();
    promptDocument(t);
    if(good>0){
      const image=posters[20];
      for(let i=9;i>=0;i--){
        const p=out(cl((t-40.9-i*.06)/.7));if(p<=0)continue;
        poster([11,37,15,66,32,46,83,1,13,21][i],1125+(i-4.5)*17,577+(i-4.5)*11,740,416,(i-4.5)*.018,p*stack);
      }
      c.save();c.globalAlpha*=good*(1-stack*.35);
      panel(1135,567,950,558,(a,b,w,h)=>c.drawImage(image,a,b,w,h));
      const files=smooth(38.233,39.2,t);
      for(const [i,label] of ['ukiyo-e.js','prompt.txt','explainer.mp4'].entries()){
        const p=out(cl((t-38.233-i*.24)/.6));
        c.save();c.globalAlpha*=p*(1-stack);panel(780+i*350,841+(1-p)*50,320,80,(a,b,w,h)=>ui(label,a+w/2,b+h/2,26,ink,600,'center'));c.restore();
      }
      c.restore();
    }
    c.restore();
  }
  function mosaicTile(i,x,y,w,h,alpha,angle){
    const source=$('#atlasMotion'),canPlay=source.readyState>=2;
    c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);
    box(-w/2-3,-h/2-3,w+6,h+6,8,'#ffffffb8',12);
    rr(-w/2,-h/2,w,h,6);c.clip();
    if(canPlay)c.drawImage(source,(i%12)*160,Math.floor(i/12)*90,160,90,-w/2,-h/2,w,h);
    else c.drawImage(posters[i],-w/2,-h/2,w,h);
    c.restore();
  }
  function gallery(t){
    const alpha=gate(t,43.4,50.4,.55);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const web=smooth(47.30,48.6,t),arrival=cl((t-43.733)/3.25);
    panel(1138,553,1450,828,(x,y,w,h)=>{
      c.fillStyle='#fafaf8';c.fillRect(x,y,w,h);
      ui('Opus 5.5 — 86 Styles in Motion',x+44,y+52,35,'#272e39',700);
      ui('找到你喜欢的风格。',x+44,y+105,39,'#252c39',650);
      c.save();c.globalAlpha*=web;box(x+43,y+148,760,52,13,'#ffffff');ui('搜索名称、编号、分类',x+67,y+175,22,'#9298a1');ui('全部分类',x+846,y+175,22,muted);ui('86 / 86',x+w-50,y+175,23,muted,600,'right');c.restore();
      c.save();c.globalAlpha*=1-web;
      displayText(String(Math.min(86,Math.round(arrival*86))),x+w-58,y+99,90,ink,'right');c.restore();
      const order=[10,20,36,65,14,31,12,45,82,...Array.from({length:86},(_,i)=>i).filter(i=>![10,20,36,65,14,31,12,45,82].includes(i))];
      for(let i=85;i>=0;i--){
        const start=43.733+i*.035,q=out(cl((t-start)/.56));if(q<=0)continue;
        const col=i%12,row=Math.floor(i/12),tx=x+91+col*114.8,ty=y+253+row*67;
        const sx=1135+(i%7-3)*24,sy=570+(Math.floor(i/7)%5-2)*12;
        const px=mix(sx,tx,q),py=mix(sy,ty,q)-Math.sin(q*Math.PI)*135;
        if(web<.999)mosaicTile(i,px,py,mix(270,107,q),mix(152,60,q),q*(1-web),((i%5)-2)*.055*(1-q));
      }
      if(web>0){
        c.save();c.globalAlpha*=web;
        for(let j=0;j<9;j++){
          const id=order[j],col=j%3,row=Math.floor(j/3),xx=x+48+col*452,yy=y+236+row*293;
          const slide=(1-web)*(j%3-1)*48;
          box(xx+slide,yy,420,268,16,'#ffffff',8);
          c.save();rr(xx+slide,yy,420,236,14);c.clip();c.drawImage(posters[id],xx+slide,yy,420,236);c.restore();
          ui(ATLAS[id].zh,xx+slide+18,yy+252,21,'#333e4b',650);
        }
        c.restore();
      }
    });c.restore();
  }
  function sourceCodeCard(x,y,w,h,alpha=1){
    panel(x,y,w,h,(a,b,d,e)=>{
      c.fillStyle='#202735';c.fillRect(a,b,d,e);
      ui('ukiyo-e.js',a+28,b+36,25,'#e1e8f4',600);line(a+20,b+67,a+d-20,b+67,'#ffffff17');
      const lines=['draw(c0, W, HH, t) {','  const swell = Math.sin(t * 0.9) * 6;','  const scene = (c) => {','    // ---------- paper ----------','    c.fillStyle = C.paper;','    c.fillRect(0, 0, W, HH);','','    // sky: bokashi from the top','    c.fillStyle = C.sky;'];
      lines.forEach((s,i)=>{ui(String(i+1),a+34,b+103+i*31,18,'#6d7a90',400,'right');fit(s,a+55,b+103+i*31,d-76,20,i%3===0?'#a3b7f5':'#cdd8e8',500)});
    },-.018,alpha);
  }
  function resources(t){
    const alpha=gate(t,49.65,64.45,.55);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const deliver=smooth(55.93,58.1,t),made=smooth(59.47,60.35,t);
    if(deliver<1){
      const q=smooth(49.65,50.35,t),p1=smooth(52.63,53.1,t),p2=smooth(54.23,54.85,t);
      sourceCodeCard(mix(930,1120,deliver),mix(565,540,deliver),640*(1-deliver*.65),548*(1-deliver*.65),q*(1-deliver));
      poster(21,1510-deliver*330,410+deliver*130,500*(1-deliver*.7),281*(1-deliver*.7),.035,p1*(1-deliver));
      panel(1510-deliver*330,735-deliver*190,500*(1-deliver*.7),232*(1-deliver*.7),(a,b,w,h)=>{
        ui('prompt.txt',a+24,b+33,24,muted,600);
        ui('Ukiyo-e Woodblock',a+24,b+83,31,ink,700);
        ui('Use them as your style guide',a+24,b+128,23,muted);
        ui('and rebuild it around my content.',a+24,b+163,23,muted);
      },-.025,p1*(1-p2*.65)*(1-deliver));
      const video=videoFrame($('#styleReference'),styleHeld);
      imageFrame(video,1360-deliver*200,650-deliver*110,760*(1-deliver*.72),448*(1-deliver*.72),p2*(1-deliver));
      if(p2>0){c.save();c.globalAlpha*=p2*(1-deliver);ui('00:00  /  00:15',1685,842,21,'#ffffff',500,'right');c.restore()}
    }
    if(deliver>0){
      c.save();c.globalAlpha*=deliver;
      const g=1-made;
      box(1016,420,228,228,64,'#ffffffd9',35);c.drawImage(codexLogo,1040,444,180,180);
      for(let i=0;i<4;i++){
        const p=smooth(55.94+i*.29,57.15+i*.29,t),a=i*Math.PI/2-.8;
        if(p<1){poster([21,37,11,66][i],1130+Math.cos(a)*(1-p)*420,534+Math.sin(a)*(1-p)*280,190*(1-p*.8),107*(1-p*.8),a*.1,(1-p)*deliver)}
      }
      c.save();c.globalAlpha*=g;displayText('黑洞为什么连光都逃不出去？',1130,769,49,ink,'center');c.restore();
      const work=workTexture(3);
      if(made>0){imageFrame(work,1135,538,mix(240,1340,made),mix(140,762.5,made),made)}
      c.restore();
    }
    c.restore();
  }
  function packageIcon(x,y,size,t,scale=1){
    c.save();c.translate(x,y);c.scale(scale,scale);
    const k=size/540;c.scale(k,k);
    for(let i=4;i>=0;i--){const angle=(i-2)*.032;poster([21,37,11,66,15][i],(i-2)*31,-132-i*18,320,180,angle,.88)}
    const fill=c.createLinearGradient(-260,-120,260,240);fill.addColorStop(0,'#fffdf7f5');fill.addColorStop(.45,'#e2e8eff1');fill.addColorStop(1,'#b8c9e8c9');
    box(-270,-76,540,338,46,fill,35);box(-270,-119,204,95,31,'#edf1f5');
    c.strokeStyle='#ffffff';c.lineWidth=2;rr(-267,-74,534,333,43);c.stroke();
    displayText('86',0,39,138,ink,'center');ui('Styles in Motion',0,158,35,ink,650,'center');ui('SKILL.md',0,217,23,'#69788c',500,'center');
    c.restore();
  }
  function packaging(t){
    const alpha=gate(t,64.05,75.85,.65);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const pack=smooth(68.40,70.35,t);
    if(pack<1){
      const wheel=FILM_TIMING.carousel,position=wheel.position(t),settle=smooth(67.38,67.65,t);
      const cards=[];
      for(let n=Math.floor(position)-4;n<=Math.floor(position)+4;n++){
        const angle=(n-position)*.46;if(Math.abs(angle)>1.72)continue;
        const depth=Math.cos(angle),id=n===18?32:((n*13%86)+86)%86+1;
        cards.push({n,angle,depth,id});
      }
      cards.sort((a,b)=>a.depth-b.depth);
      for(const card of cards){
        const center=card.n===18,width=(310+card.depth*160)*(1-pack*.6)*(1+(center?settle*.08:0));
        const x=1138+Math.sin(card.angle)*800,y=495+(1-card.depth)*255;
        poster(card.id,mix(x,1130,pack),mix(y,510,pack),width,width*9/16,card.angle*.15*(1-pack),(1-pack)*(center?1:1-settle*.30));
        if(center&&settle>0){c.save();c.globalAlpha*=settle*(1-pack);box(x-132,y+width*9/32+39,264,56,22,'#edf2faf2');displayText('中国水墨',x,y+width*9/32+66,30,ink,'center');c.restore()}
      }
      c.save();c.globalAlpha*=1-pack;
      const last=wheel.ticks.filter(q=>q<=t).at(-1),kick=last===undefined?0:Math.exp(-(t-last)*24)*Math.sin((t-last)*50)*.22;
      const yy=875;box(1072,yy-66,132,132,66,'#f6f9fff2',23);
      c.save();c.translate(1138,yy);c.rotate(-position*Math.PI/12);
      for(let i=0;i<24;i++){const a=i*Math.PI/12;line(Math.sin(a)*44,-Math.cos(a)*44,Math.sin(a)*54,-Math.cos(a)*54,i%3?'#b4c2d4':'#627eaa',i%3?2:3)}c.restore();
      c.save();c.translate(1138,yy-8);c.rotate(kick);c.fillStyle='#344e79';c.beginPath();c.moveTo(0,-111);c.lineTo(16,-70);c.lineTo(7,-72);c.lineTo(7,14);c.lineTo(-7,14);c.lineTo(-7,-72);c.lineTo(-16,-70);c.closePath();c.fill();dot(0,14,12,'#edf3fb');dot(0,14,5,'#526b93');c.restore();c.restore();
    }
    if(pack>0){
      c.save();c.globalAlpha*=pack;packageIcon(1130,548,550,t,.8+.2*pack);c.restore();
      c.save();c.globalAlpha*=pack;displayText('Opus 5.5',1130,175,77,ink,'center');c.restore();
      for(let i=0;i<10;i++){
        const q=out(cl((t-68.4-i*.07)/1.3));if(q<=0||q>=1)continue;
        const a=i*2.399,rad=(1-q)*590;
        poster(1+(i*9)%86,1130+Math.cos(a)*rad,548+Math.sin(a)*rad*.52-q*100,145*(1-q*.6),82*(1-q*.6),a*.02,1-q);
      }
    }
    c.restore();
  }
  function composer(x,y,w,topic='',skill=false,model='GPT-6 Astra · Max'){
    box(x+17,y-43,w-34,65,22,'#f4f4f4');
    ui('▱  视频创作',x+34,y-20,21,'#303238');ui('▱  This computer',x+218,y-20,21,'#303238');
    box(x,y,w,157,30,'#ffffff',12);c.strokeStyle='#e6e6e6';c.lineWidth=1;rr(x,y,w,157,30);c.stroke();
    if(skill){box(x+20,y+17,334,37,13,'#eef1f7');ui('$claude-opus-5-5-new',x+33,y+36,23,'#43557a',600)}
    ui(topic||'Do anything',x+24,y+(skill?84:40),27,topic?'#2b2d31':'#b6b8bc');
    ui('+',x+29,y+128,28,'#3b3f47');ui('⚙  Custom',x+68,y+128,20,'#8b9098');
    box(x+w-315,y+106,248,37,18,'#f4f4f4');ui(model,x+w-191,y+125,19,'#535961',500,'center');
    box(x+w-52,y+108,33,33,17,topic?'#292c33':'#427ae9');ui(topic?'↑':'Ⅱ',x+w-35,y+124,23,'#fff',600,'center');
  }
  function codexShell(draw){
    panel(1138,531,1462,830,(x,y,w,h)=>{
      c.save();c.translate(x,y);c.fillStyle='#fff';c.fillRect(0,0,w,h);
      c.fillStyle='#f6f6f6';c.fillRect(0,0,231,h);line(231,0,231,h,'#e9e9e9');
      c.drawImage(codexLogo,26,26,35,35);ui('Codex',73,43,25,'#27282a',650);ui('⌄',197,43,20,'#777');
      ui('+  New chat',26,109,23,'#303238',550);ui('◇  Skills',26,164,23,'#303238',550);
      ui('Projects',26,249,18,'#98999d',550);box(13,276,205,48,12,'#e9e9e9');ui('▱  视频创作',28,300,22,'#3a3b3e',550);
      ui('西游记 · 师徒四人的取经之路',29,356,16,'#7d7f84');
      ui('◉  Settings',26,h-37,19,'#656970');
      draw(w,h);c.restore();
    });
  }
  function workflow(t){
    const alpha=gate(t,75.25,95.82,.65);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const focusInput=smooth(75.9,76.5,t)*(1-smooth(79.7,80.25,t));
    const focusChoice=smooth(82.55,83.1,t)*(1-smooth(84.05,84.6,t));
    const focusFeedback=smooth(87.8,88.4,t)*(1-smooth(92.1,92.8,t));
    const zoom=1+.18*focusInput+.07*focusChoice+.12*focusFeedback,focusY=mix(520,800,Math.max(focusInput,focusFeedback));
    c.translate(1180,focusY);c.scale(zoom,zoom);c.translate(-1180,-focusY);
    codexShell((w,h)=>{
      const selected=smooth(76.62,76.94,t),sent=smooth(79.6,80.2,t),choice=smooth(83.63,84.03,t),sample=smooth(84.55,85.15,t),extend=smooth(92.25,94.9,t);
      if(t<80.25){
        c.save();c.globalAlpha*=1-sent;ui('What should we build?',827,267,40,'#202226',500,'center');c.restore();
        const topic='用中国水墨讲一段西游记';const count=Math.floor(cl((t-77.633)/1.55)*topic.length);
        composer(285,598,1095,selected>0?topic.slice(0,count):'$',selected>.4);
        if(t<76.94){
          const p=smooth(75.5,75.95,t);c.save();c.globalAlpha*=p*(1-selected);box(301,422,686,156,20,'#ffffff',26);
          ui('Skills',327,449,20,'#96999f',600);box(315,473,657,86,12,'#f3f5f9');
          ui('Opus 5.5 — 86 Styles in Motion',337,501,27,'#283344',650);ui('$claude-opus-5-5-new',337,536,21,'#7b8492');c.restore();
        }
        if(t>76.05&&t<77.3)cursor(805-130*smooth(76.05,76.62,t),548-34*smooth(76.05,76.62,t),cl((t-76.62)/.45));
        if(t>79.18)cursor(1345,722,cl((t-79.6)/.4));
      }
      if(sent>0&&sample<1){
        c.save();c.globalAlpha*=sent*(1-sample);
        ui('选一个视觉方向',292,112,30,'#303238',600);
        const choices=[32,21,1];
        for(let i=0;i<3;i++){
          const p=out(cl((t-80.35-i*.18)/.58)),xx=292+i*358;
          c.save();c.globalAlpha*=p;c.translate(0,(1-p)*35);
          box(xx,160,330,240,15,'#fafafa',8);c.save();rr(xx,160,330,186,14);c.clip();c.drawImage(posters[choices[i]-1],xx,160,330,186);c.restore();
          ui(ATLAS[choices[i]-1].zh,xx+17,374,24,'#343a44',650);c.restore();
        }
        box(292,417,1046,173,18,'#fcfcfc');c.strokeStyle='#e3e5e9';c.lineWidth=1;rr(292,417,1046,173,18);c.stroke();
        ['A  中国水墨','B  浮世绘木版画','C  扁平矢量科普'].forEach((label,i)=>{
          const yy=451+i*56;if(i===0&&choice>0)box(307,yy-22,1014,45,10,`rgba(226,234,249,${choice})`);
          c.strokeStyle=i===0&&choice>.5?blue:'#c2c7d0';c.lineWidth=1.7;c.beginPath();c.arc(335,yy,9,0,7);c.stroke();
          if(i===0&&choice>.5)dot(335,yy,5,blue);ui(label,362,yy,24,'#414650');
        });
        composer(285,637,1095,'',false);
        if(t>82.6)cursor(mix(1150,795,smooth(82.6,83.63,t)),mix(666,451,smooth(82.6,83.63,t)),cl((t-83.63)/.45));
        c.restore();
      }
      if(sample>0){
        if(!journeyThumbs.length){const win=engines[1].contentWindow,source=workTexture(1);for(const at of [1.2,3.8,6.6,8.4,11.5,14.3,16.7,19.6]){win.renderFrame(at);const thumb=document.createElement('canvas');thumb.width=480;thumb.height=270;thumb.getContext('2d').drawImage(source,0,0,480,270);journeyThumbs.push(thumb)}win.renderFrame(engineTime(1,t));}
        c.save();c.globalAlpha*=sample;
        ui('index.html',295,45,23,'#747a83',500);
        const source=workTexture(1);const yy=303;
        box(288,89,1088,472,18,'#e8e8e5');
        c.save();rr(288,89,1088,472,18);c.clip();if(source)c.drawImage(source,420,93.25,824,463.5);c.restore();
        const progress=cl((t-84.733)/2.30),endBar=extend>0?cl(extend):progress;
        box(304,577,916,7,4,'#e5e7eb');box(304,577,916*endBar,7,4,'#758cab');
        ui(extend>0?'完整视频':'00:20',1356,580,24,'#5d6676',600,'right');
        if(extend>.97)check(1242,580,'#5a8c75');
        if(t<92.25){
          const approved=t>=90.95,feedback=approved?'可以，按这个风格完成全片':'加强悟空打妖怪和取经的运镜';const n=Math.floor(cl((t-(approved?90.95:88.4))/1.05)*feedback.length);
          composer(285,637,1095,t>88.4?feedback.slice(0,n):'',false);
          if(t>89.4&&t<90.4)cursor(1345,761,cl((t-89.65)/.4));
          if(t>91.7)cursor(1345,761,cl((t-92.1)/.4));
        }else{
          const p=smooth(92.25,92.75,t);
          c.save();c.globalAlpha*=p;
          for(let i=0;i<8;i++){
            const q=out(cl((t-92.3-i*.27)/.4));if(!q)continue;
            const xx=304+i*130;box(xx,647,120,92,11,'#e8edf4');
            c.save();rr(xx,647,120,68,10);c.clip();c.drawImage(journeyThumbs[i],xx,647,120,68);c.restore();
            box(xx,728,120*q,6,3,'#6e8dbe');
          }
          c.restore();
        }
        c.restore();
      }
    });c.restore();
  }
  function examples(t){
    const alpha=gate(t,95.2,107.8,.55);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const entries=[{a:95.2,b:99.8,i:0,title:'Anthropic'},{a:99.3,b:103.6,i:2,title:'奥卡姆剃刀'},{a:103.08,b:107.8,i:5,title:'3D 剪辑台'}];
    for(const e of entries){const p=gate(t,e.a,e.b,.36);if(!p)continue;
      c.save();c.globalAlpha*=p;const enter=out(cl((t-e.a)/.5));c.translate((1-enter)*90,0);
      imageFrame(workTexture(e.i),1138,525,1428,812);c.restore();
    }
    c.restore();
  }
  function model(t){
    const alpha=gate(t,107.45,111.68,.46);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    panel(1138,550,1436,762,(x,y,w,h)=>{
      ui('What should we build?',x+w/2,y+80,37,'#24262b',500,'center');
      composer(x+60,y+534,w-120,'',false,t<109.25?'GPT-6 Sol · Extra High':'GPT-6 Astra · Max');
      const show=smooth(107.8,108.2,t),selected=smooth(109.1,109.45,t);
      c.save();c.globalAlpha*=show;
      const px=x+w-505,py=y+145;
      box(px,py,438,436,28,'#ffffff',25);c.strokeStyle='#e6e6e6';c.lineWidth=1;rr(px,py,438,436,28);c.stroke();
      ui('Select model',px+25,py+34,23,'#989da5');
      const labels=['Default','GPT-6.1 Sol','GPT-6 Astra','GPT-6 Sol','GPT-6 Luna','GPT-5.6 Sol'];
      labels.forEach((label,i)=>{const yy=py+86+i*57;if(i===2)box(px+11,yy-23,416,47,12,`rgba(232,237,247,${selected})`);ui(label,px+25,yy,27,'#30343b',i===2&&selected>.5?650:450);if((i===3&&selected<.5)||(i===2&&selected>.5))check(px+400,yy,'#535a66')});
      c.restore();
      const reveal=smooth(109.3,109.8,t);c.save();c.globalAlpha*=reveal;
      displayText('GPT-6 Astra',x+370,y+315,68,ink,'center');box(x+257,y+382,224,83,26,'#edf2fa');displayText('Max',x+369,y+422,54,'#536f9c','center');c.restore();
      if(t>108.25&&t<110.2)cursor(px+250,py+195,cl((t-109.1)/.45));
    });c.restore();
  }
  function size(t){
    const alpha=gate(t,111.1,116.15,.58);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    packageIcon(885,564,500,t);
    const p=smooth(113.9,114.55,t);c.save();c.globalAlpha*=p;c.translate(0,(1-p)*25);displayText('440',1448,504,176,ink,'center');displayText('MB',1448,655,68,'#69809f','center');c.restore();
    c.restore();
  }
  function openSource(t){
    const alpha=gate(t,115.30,120.8,.6);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const p=out(cl((t-115.3)/.65));
    panel(1138,475+(1-p)*75,1376,674,(x,y,w,h)=>{
      // The screenshot is untouched; only the card's viewport clips its lower edge.
      c.drawImage(repository,x,y,w,w*repository.height/repository.width);
    },-.018*(1-p));
    displayText('github.com/GODGOD126/',1138,842,41,ink,'center');
    displayText('opus-5-5-86-styles-in-motion',1138,895,42,ink,'center');
    c.restore();
  }
  function topics(t){
    const alpha=gate(t,119.6,124.15,.6);if(!alpha)return;
    c.save();c.globalAlpha*=alpha;
    const choose=smooth(121.767,122.6,t),works=[4,3,2],titles=[['越努力，为什么','反而减不下来？'],['黑洞为什么','连光都逃不出去？'],['假设越多','答案越好吗？']];
    c.save();c.globalAlpha*=choose;displayText('选题',1138,225,104,ink,'center');c.restore();
    for(const i of [0,2,1]){
      const center=i===1,scale=center?mix(1,1.17,choose):mix(1,.84,choose);
      const x=1138+(i-1)*(430+choose*65),y=590+(center?-25:35)*choose,w=416*scale,h=480*scale;
      panel(x,y,w,h,(a,b,d,e)=>{
        const source=workTexture(works[i]);if(source)c.drawImage(source,a,b,d,d*9/16);
        titles[i].forEach((s,j)=>fit(s,a+d/2,b+d*9/16+70+j*55,d-35,35,ink,700,'center'));
      },(i-1)*.04*(1-choose),center?1:1-choose*.38);
    }
    if(choose>0&&choose<1)cursor(1148,614,choose);
    c.restore();
  }
  const styleHeld=document.createElement('canvas'),outroHeld=document.createElement('canvas');
  function ending(t){
    const name=smooth(125.35,125.92,t),slogan=smooth(126.333,126.95,t),leave=1-smooth(128.98,129.50,t);
    if(name>0&&leave>0){
      c.save();c.globalAlpha*=name*leave;c.translate((1-name)*-80,0);
      const shade=c.createRadialGradient(40,620,80,70,620,770);shade.addColorStop(0,'#101827a8');shade.addColorStop(.45,'#10182766');shade.addColorStop(1,'#10182700');c.fillStyle=shade;c.fillRect(0,0,900,H);
      c.shadowColor='#0005';c.shadowBlur=16;ui('我是',110,463,40,'#e5edf7',600);displayText('阿朱',104,571,150,'#ffffff');
      line(112,670,112+330*name,670,'#e7eef9',3);c.shadowBlur=0;
      c.save();c.globalAlpha*=slogan;c.translate(0,(1-slogan)*25);displayText('让我们一起',110,748,48,'#f5f8ff');displayText('在 AI 潮头冲浪',110,819,54,'#f5f8ff');c.restore();
      c.restore();
      c.save();c.globalAlpha*=name*leave;
      panel(1514,198,660,272,(x,y,w,h)=>{
        ui('SKILL',x+28,y+36,22,'#6c7890',650);
        ui('github.com/GODGOD126/',x+28,y+82,28,ink,650);
        ui('opus-5-5-86-styles-in-motion',x+28,y+125,27,ink,650);
        line(x+28,y+162,x+w-28,y+162,'#dce2eb');
        ui('本 Skill 中的示例与源码来源',x+28,y+190,22,muted,500);
        ui('Futurepedia · AI Style Atlas',x+28,y+226,26,ink,650);
      });c.restore();
    }
    if(t>=129.033){
      const p=smooth(129.033,129.9,t),source=outroTexture(outroHeld);
      c.save();c.globalAlpha*=p;const w=mix(1330,1724,p),h=(w-20)*9/16+20;
      imageFrame(source,960,540+(1-p)*45,w,h);
      ui('音乐：Pinball Spring 160 · Kevin MacLeod · CC BY 4.0',960,1057,23,'#66758b',500,'center');c.restore();
    }
  }
  async function load(){
    const image=url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('图片加载失败：'+url));img.src=url});
    const all=await Promise.all(ATLAS.map(a=>image(a.poster)));posters.push(...all);repository=await image('assets/github-repository.png');
    for(const [i,page] of PROMPT_PAGES.entries()){
      const sheet=document.createElement('canvas');sheet.width=1320;sheet.height=770;const ctx=sheet.getContext('2d');
      ctx.fillStyle='#fdfdfb';ctx.fillRect(0,0,1320,770);ctx.fillStyle='#25334c';ctx.font='700 46px "Segoe UI", sans-serif';ctx.fillText(page.title,70,88);
      ctx.fillStyle='#74839a';ctx.font='600 26px "Segoe UI", sans-serif';ctx.fillText(page.section,72,137);
      ctx.strokeStyle='#dfe5ee';ctx.beginPath();ctx.moveTo(70,167);ctx.lineTo(1250,167);ctx.stroke();
      page.lines.forEach((s,j)=>{ctx.fillStyle=s.endsWith(':')?'#44658d':'#334155';ctx.font=(s.endsWith(':')?'700':'400')+' 28px Consolas, monospace';ctx.fillText(s,73,217+j*38)});
      ctx.fillStyle='#8b95a4';ctx.font='21px "Segoe UI", sans-serif';ctx.fillText('rari / @0xwhrrari',72,735);ctx.textAlign='right';ctx.fillText(`${i+1} / 3`,1247,735);promptSheets.push(sheet);
    }
  }
  function draw(t){research(t);gallery(t);resources(t);packaging(t);workflow(t);examples(t);model(t);size(t);openSource(t);topics(t)}
  function engineTime(i,t){
    if(t>=119.6&&t<124.15){if(i===4)return 9+(t-119.6)*.55;if(i===3)return 8+(t-119.6)*.5;}
    if(i===3&&t>=59.0&&t<64.45)return cl(7.3+(t-59.47)*3,6,21.9);
    if(i===1&&t>=84.0&&t<95.82)return cl(1.5+(t-84)*1.65,0,19.95);
    if(i===0&&t>=95.0&&t<100)return 5.4+(t-95)*.9;
    return null;
  }
  function mediaTime(v,t){
    if(v.id==='marioFull')return t>=129.033?cl(t-FILM_TIMING.outroStart,0,19.999):null;
    if(v.id==='atlasMotion')return t>=43.25&&t<50.4?cl(t-43.25,0,7.9):null;
    if(v.id==='styleReference')return t>=53.8&&t<58.2?cl(2.3+t-53.8,0,14):null;
    if(v.id==='occamPreview')return t<8.8?t:(t>=99.2&&t<103.7?cl(.8+t-99.2,0,8.7):(t>=119.6&&t<124.15?cl(1.8+t-119.6,0,8.7):null));
    if(v.id==='marioPreview')return t<8.8?t:(t>=103&&t<107.9?cl(1.8+t-103,0,8.7):null);
    return null;
  }
  return {load,draw,after:ending,engineTime,mediaTime};
})();
