/* One 30-degree isometric projection for floors, solids, paths and shadows. */
(() => {
  'use strict';
  const {add,mul,mix,norm,cross}=SceneMotion;
  const C30=Math.sqrt(3)/2;
  const color=(a,b,u)=>{
    const aa=a.slice(1).match(/../g).map(v=>parseInt(v,16)),bb=b.slice(1).match(/../g).map(v=>parseInt(v,16));
    return '#'+aa.map((v,i)=>Math.round(v+(bb[i]-v)*u).toString(16).padStart(2,'0')).join('');
  };
  const depth=p=>p[0]+p[1]+p[2];
  const polygon=pts=>{const p=new Path2D();p.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)p.lineTo(...pts[i]);p.closePath();return p;};
  class Renderer {
    constructor(ctx,cam){this.c=ctx;this.cam=cam;this.items=[];this.shadows=[];this.layer=1;}
    P(v){const {fx,fy,s,cx,cy,rise}=this.cam;const x=v[0]-fx,y=v[1]-fy;return [cx+(x-y)*C30*s,cy+(x+y)*.5*s-(v[2]+rise)*s];}
    path(pts){return polygon(pts.map(p=>this.P(p)));}
    face(pts,col,alpha=1,edge=null){if(alpha<.001)return;const path=this.path(pts),key=pts.reduce((v,p)=>v+depth(p),0)/pts.length;this.items.push({key,layer:this.layer,draw:()=>{this.c.globalAlpha=alpha;this.c.fillStyle=col;this.c.fill(path);if(edge){this.c.lineWidth=1.25;this.c.strokeStyle=edge;this.c.stroke(path);}}});}
    custom(p,fn){this.items.push({key:depth(p)+.01,layer:this.layer,draw:fn});}
    line(pts,col,width=2,alpha=1,dash=[]){if(alpha<.001||pts.length<2)return;const key=pts.reduce((v,p)=>v+depth(p),0)/pts.length+.03;const p=new Path2D();p.moveTo(...this.P(pts[0]));pts.slice(1).forEach(v=>p.lineTo(...this.P(v)));this.items.push({key,layer:this.layer,draw:()=>{this.c.globalAlpha=alpha;this.c.strokeStyle=col;this.c.lineWidth=width;this.c.lineCap='round';this.c.lineJoin='round';this.c.setLineDash(dash);this.c.stroke(p);this.c.setLineDash([]);}});}
    box(x,y,z,w,d,h,base,alpha=1){
      if(Math.min(w,d,h)<=.002||alpha<.001)return;
      this.face([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],color(base,'#706b9c',.23),alpha);
      this.face([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],color(base,'#ffffff',.08),alpha);
      this.face([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],color(base,'#ffffff',.4),alpha,'#fdfcf9');
      this.line([[x,y+d,z+h],[x+w,y+d,z+h],[x+w,y,z+h]],'#ffffff',1.8,alpha*.7);
    }
    shadowRect(x,y,w,d,h,alpha=1){
      const dx=.95*h,dy=.14*h;
      this.shadows.push({points:[[x,y,0],[x+w,y,0],[x+w+dx,y+dy,0],[x+w+dx,y+d+dy,0],[x+dx,y+d+dy,0],[x,y+d,0]],alpha});
    }
    shadowRound(x,y,r,h){
      const pts=[];for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const k=Math.cos(a)>.0?1:0;pts.push([x+Math.cos(a)*r+.95*h*k,y+Math.sin(a)*r+.14*h*k,0]);}this.shadows.push({points:pts,alpha:1});
    }
    disk(x,y,z,r,h,base,alpha=1,n=48){
      const top=[],bottom=[];
      for(let i=0;i<n;i++){const a=i*Math.PI*2/n;top.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z+h]);bottom.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z]);}
      for(let i=0;i<n;i++){const j=(i+1)%n,a=(i+.5)*Math.PI*2/n;if(Math.cos(a)+Math.sin(a)>.0)this.face([bottom[i],bottom[j],top[j],top[i]],color(base,'#77729e',.15+.13*Math.cos(a)),alpha);}
      this.face(top,color(base,'#ffffff',.39),alpha,'#ffffff');
    }
    sphere(position,r,base='#f1c35c',alpha=1,stretch=[1,1]){
      if(r<=.001||alpha<.001)return;const c=this.c,p=this.P(position),rr=r*this.cam.s*Math.sqrt(1.5);
      this.custom(position,()=>{c.globalAlpha=alpha;c.save();c.translate(...p);c.scale(stretch[0],stretch[1]);
        const g=c.createRadialGradient(-rr*.38,-rr*.42,rr*.08,rr*.1,rr*.12,rr*1.16);
        g.addColorStop(0,color(base,'#ffffff',.56));g.addColorStop(.48,color(base,'#ffffff',.15));g.addColorStop(1,color(base,'#9e8050',.2));
        c.beginPath();c.arc(0,0,rr,0,Math.PI*2);c.fillStyle=g;c.fill();
        c.beginPath();c.arc(0,0,rr-.8,Math.PI*1.06,Math.PI*1.65);c.lineWidth=1.5;c.strokeStyle='rgba(255,252,231,.55)';c.stroke();c.restore();});
    }
    cylinder(a,b,r,base,alpha=1,n=16,basis=null,bulge=false){
      if(Math.hypot(...b.map((v,i)=>v-a[i]))<.005||alpha<.001)return;
      const axis=norm(b.map((v,i)=>v-a[i]));
      const e1=basis?basis[0]:norm(cross(axis,Math.abs(axis[2])<.8?[0,0,1]:[0,1,0]));
      const e2=basis?basis[1]:norm(cross(axis,e1));
      const ks=bulge?[0,.13,.5,.85,1]:[0,1];
      const rings=ks.map(k=>Array.from({length:n},(_,i)=>{const ang=i*Math.PI*2/n;const size=r*(bulge?(.76+.26*Math.sin(k*Math.PI)):1);const bend=bulge?mul(e1,.1*Math.sin(k*Math.PI)):[0,0,0];return add(add(mix(a,b,k),bend),add(mul(e1,Math.cos(ang)*size),mul(e2,Math.sin(ang)*size)));}));
      for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
        const next=(i+1)%n,ang=(i+.5)*Math.PI*2/n,normal=add(mul(e1,Math.cos(ang)),mul(e2,Math.sin(ang)));
        if(normal[0]+normal[1]+normal[2]<-.05)continue;
        const light=Math.max(-1,Math.min(1,-normal[0]*.4-normal[1]*.55+normal[2]*.7));
        const shade=light>=0?color(base,'#fff3df',light*.34):color(base,'#995a72',-light*.26);
        this.face([rings[j][i],rings[j][next],rings[j+1][next],rings[j+1][i]],shade,alpha);
      }
      const facing=axis[0]+axis[1]+axis[2];
      this.face(facing<0?rings[0].slice().reverse():rings.at(-1),color(base,'#ffe2c9',.22),alpha,'#ffdbc3');
    }
    floor(outline){
      const c=this.c,top=outline.map(p=>[...p,0]);
      const ground=outline.map(p=>this.P([p[0]+1.1,p[1]+.25,-1.25]));
      c.save();c.fillStyle='rgba(110,91,150,.16)';c.filter='blur(23px)';c.fill(polygon(ground));c.restore();
      const sides=[];
      for(let i=0;i<top.length;i++){
        const a=top[i],b=top[(i+1)%top.length];
        const edge=[b[0]-a[0],b[1]-a[1]];
        if(edge[1]-edge[0]<=0)continue;
        sides.push({key:(depth(a)+depth(b))/2,a,b,col:Math.abs(edge[0])>.1?'#d5cce6':'#b8aad3'});
      }
      sides.sort((a,b)=>a.key-b.key);
      for(const s of sides){
        c.fillStyle=s.col;c.fill(this.path([s.a,s.b,add(s.b,[0,0,-.5]),add(s.a,[0,0,-.5])]));
        c.fillStyle=color(s.col,'#8a78b0',.15);c.fill(this.path([add(s.a,[0,0,-.5]),add(s.b,[0,0,-.5]),add(s.b,[0,0,-.78]),add(s.a,[0,0,-.78])]));
      }
      c.fillStyle='#fcfaf4';c.fill(this.path(top));c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.95)';c.stroke(this.path(top));
      this.floorClip=this.path(top);
    }
    flush(){
      const c=this.c;c.save();if(this.floorClip)c.clip(this.floorClip);
      const p=new Path2D();for(const shadow of this.shadows)p.addPath(this.path(shadow.points));
      c.filter='blur(3px)';c.fillStyle='rgba(109,94,146,.15)';c.fill(p);c.restore();
      this.items.sort((a,b)=>(a.layer??1)-(b.layer??1)||a.key-b.key);
      for(const o of this.items){c.save();o.draw();c.restore();}c.globalAlpha=1;
    }
  }
  window.SceneGeometry={Renderer,color,polygon};
})();
