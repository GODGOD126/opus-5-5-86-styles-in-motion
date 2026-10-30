// Story additions for sample revision 2: demon, Ling Mountain and audience with Buddha.
function demon(t){
 const reveal=span(t,3.25,4.3),hit=span(t,6.62,7.05),gone=span(t,6.95,8.35);
 if(!reveal||gone>=1)return;
 c.save();c.globalAlpha=reveal*(1-gone);c.translate(1080+hit*30,561+hit*22);c.rotate(hit*.21);const size=.82+reveal*.18;c.scale(size,size);
 const breath=Math.sin(t*3)*2;c.translate(0,breath);
 // Broad shoulders, curled horns and a ragged coat make a readable silhouette in the mist.
 shape('M-60 -187L-84 -169L-72 -147L-93 -131L-74 -111L-78 -82L-56 -68L-49 -30L-64 -8L-20 -6L-8 -52L13 -52L25 -6L69 -8L50 -35L59 -76L80 -95L71 -127L86 -147L65 -175L46 -190Z',darkTex,ink,1.6);
 shape('M-40 -169Q0 -190 38 -165L50 -109Q23 -77 -12 -85L-49 -111Z',greyTex);
 for(let i=0;i<6;i++)line(`M${-35+i*13} -151q-14 23 -5 45`,'#9d9b83',1.2);
 const reach=span(t,4,5.8)*(1-hit);
 segment(-63,-160,-.3-reach*.5,()=>{
  shape('M6 0Q-19 -8 -30 17L-57 38L-52 53L-19 41L12 16Z',darkTex);
  shape('M-51 35L-73 35L-81 44L-66 41L-74 54L-60 47L-62 61L-49 49Z',greyTex,ink,1.2);
 });
 segment(58,-156,.25+Math.sin(t*2)*.06,()=>{shape('M-4 -1Q24 -5 28 27L44 61L27 72L8 37L-10 12Z',darkTex);shape('M28 63L26 84L35 77L40 88L44 75L52 82L49 63Z',greyTex,ink,1.2)});
 shape('M-39 -220Q-49 -248 -69 -250Q-57 -225 -42 -207Z',darkTex,ink,1.3);
 shape('M26 -224Q44 -251 62 -250Q56 -225 35 -208Z',darkTex,ink,1.3);
 shape('M-39 -223L-51 -204L-42 -181L-24 -168L-12 -154L0 -167L12 -154L25 -171L43 -182L49 -205L33 -224Z',darkTex,ink,2);
 shape('M-35 -206L-9 -200L-24 -193Z','#bd9f5e');shape('M7 -200L35 -208L25 -193Z','#bd9f5e');
 line('M-4 -204L-10 -188L4 -185',cream,1.3);
 shape('M-29 -182Q0 -167 29 -184L15 -170L-14 -169Z','#121910');
 shape('M-25 -182L-15 -178L-19 -164Z M17 -179L25 -183L22 -164Z',cream);
 shape('M-58 -83Q0 -66 60 -86L54 -67Q0 -54 -57 -66Z',redTex);
 ellipse(0,-72,10,11,'#b59c60');line('M-3 -78l7 12 M4 -78l-7 12',ink,1.6);
 c.restore();
}

function demonFragments(t){
 const u=clamp((t-6.82)/1.65),alpha=Math.sin(Math.PI*u);
 if(alpha<=0)return;
 const r=H.rng(311);c.save();c.globalAlpha=alpha*.8;
 for(let i=0;i<84;i++){
  const x=1080+r.range(-60,65),y=r.range(335,545),angle=r.range(-Math.PI,Math.PI),speed=r.range(50,235),size=r.range(2,8);
  c.save();c.translate(x+Math.cos(angle)*speed*u,y+Math.sin(angle)*speed*u+u*u*70);c.rotate(angle+u*3);shape(`M0 0L${size} ${-size*.4}L${size*.4} ${size*1.5}Z`,i%7===0?redTex:darkTex);c.restore();
 }c.restore();
}

function temple(t){
 const p=span(t,9.5,12.8);if(!p)return;
 c.save();c.globalAlpha=p*.28;c.translate(1040,475+(1-p)*45);
 // The same mountain scroll opens into a temple forecourt, without a hard cut.
 for(const [x,s] of [[-210,.66],[210,.66],[0,1]]){
  c.save();c.translate(x,-30);c.scale(s,s);
  shape('M-108 0L-108 -134L108 -134L108 0Z','#a69d7f');
  shape('M-154 -120Q-96 -122 -55 -162L0 -191L55 -162Q96 -122 154 -120L137 -111Q73 -118 0 -139Q-73 -118 -137 -111Z',darkTex);
  shape('M-125 -178Q-65 -177 0 -229Q65 -177 125 -178L107 -167Q49 -178 0 -197Q-49 -178 -107 -167Z',greyTex);
  line('M-81 -122V-2M-33 -132V-2M33 -132V-2M81 -122V-2',ink,5);
  shape('M-22 0V-72Q0 -102 22 -72V0Z',darkTex);
  for(let y=-101;y<-30;y+=21)line(`M-75 ${y}h32M43 ${y}h32`,ink,2);
  line('M-127 2H127M-138 13H138M-148 24H148',ink,3);c.restore();
 }
 c.restore();
}

function buddha(t){
 const arrive=span(t,12.2,14),bless=span(t,15.7,17.1);if(!arrive)return;
 c.save();c.globalAlpha=arrive;c.translate(1045,546+(1-arrive)*28);c.scale(1.04,1.04);
 // Restrained ochre halo, textured against the paper rather than a neon glow.
 const gold='#a28a50';c.save();c.globalAlpha*=.17;
 const glow=c.createRadialGradient(0,-192,20,0,-192,154);glow.addColorStop(0,'#b49a56');glow.addColorStop(1,'rgba(180,154,86,0)');c.fillStyle=glow;c.fillRect(-158,-350,316,316);c.restore();
 for(let j=0;j<2;j++){c.save();c.globalAlpha*=j?.32:.55;c.strokeStyle=gold;c.lineWidth=j?1:2;c.beginPath();for(let i=0;i<=140;i++){const a=i/140*TAU,rr=(j?121:111)+Math.sin(a*5)*.8;const x=Math.cos(a)*rr,y=-192+Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.restore()}
 // Lotus petals, from the rear ring to the folded front ring.
 for(let i=-3;i<=3;i++){c.save();c.translate(i*28,4+Math.abs(i)*2);c.rotate(i*.18);shape('M0 22Q-35 -9 -23 -38Q0 -28 0 -15Q0 -28 23 -38Q35 -9 0 22Z','#b6a47e','#796d50',1.1);c.restore()}
 shape('M-44 -194Q-70 -170 -74 -113L-86 -56L-49 -31L47 -30L82 -60L67 -123Q66 -174 38 -195Z','#b99d62',ink,1.6);
 shape('M-39 -197Q-15 -166 39 -157L63 -105L78 -48Q39 -20 -36 -34L-66 -58L-51 -134Z',redTex,ink,1.5);
 line('M-37 -187Q-29 -147 45 -129M-37 -153Q-47 -93 -29 -48M-14 -129Q-6 -85 26 -44M12 -113L49 -49','#c7ac76',2);
 shape('M-55 -80Q-94 -81 -111 -43Q-115 -15 -76 -14L43 -25L55 -42Q-2 -70 -55 -80Z',redTex,ink,1.7);
 shape('M48 -78Q92 -83 111 -44Q119 -16 76 -13L-44 -22L-58 -42Q3 -65 48 -78Z',redTex,ink,1.7);
 shape('M-45 -35Q-10 -51 16 -40L37 -30Q9 -17 -25 -21Z','#c3ad7a',ink,1.3);
 line('M-99 -36Q-55 -47 -27 -30M26 -29Q62 -45 99 -34','#ceb886',1.4);
 // Ears, calm face, curled hair and ushnisha.
 ellipse(-30,-230,8,24,'#c7b383');ellipse(30,-230,8,24,'#c7b383');
 shape('M-28 -255Q-32 -286 0 -290Q32 -286 28 -255L27 -224Q20 -198 0 -194Q-20 -198 -27 -224Z','#ceba89',ink,1.3);
 shape('M-30 -252Q-37 -283 -16 -297Q-12 -316 1 -315Q16 -316 18 -297Q38 -282 29 -252L21 -263Q0 -273 -21 -263Z',darkTex);
 for(let y=-292;y<-264;y+=8)for(let x=-22;x<=22;x+=9){if(Math.abs(x)<28-(Math.abs(y+275)*.23))ellipse(x+(y%3),y,2.5,2.5,'#646858')}
 line('M-21 -243Q-13 -249 -5 -244M5 -244Q13 -249 21 -243',ink,1.6);
 line('M-20 -236Q-13 -231 -6 -236M6 -236Q13 -231 20 -236',ink,1.2);
 line('M0 -239L-3 -224L3 -223M-8 -214Q0 -210 8 -214',ink,1.2);ellipse(0,-253,2,2,red);
 // Palm rises slowly in greeting; shoulder and forearm move together.
 segment(47,-155,-bless*.15,()=>{
  shape('M-3 1Q12 5 19 -14L23 -44L10 -49L4 -22L-9 -11Z','#c2ab79',ink,1.5);
  shape('M10 -45L7 -62L9 -77Q12 -81 14 -75L15 -63L16 -82Q20 -86 22 -80L23 -62L25 -78Q29 -81 30 -74L29 -57L33 -68Q37 -70 37 -64L34 -48L28 -37L17 -38Z','#cdb987',ink,1.2);
  line('M13 -56Q24 -63 30 -50M23 -61L23 -47','#8b774f',1);
 });
 shape('M-58 -143Q-76 -104 -41 -80L-17 -74L-10 -83L-37 -96L-38 -129Z','#c2aa77',ink,1.2);
 // Front lotus petals anchor the figure to the platform.
 for(let i=-3;i<=3;i++){c.save();c.translate(i*25,12);c.rotate(i*.13);shape('M-20 -5Q-15 15 0 22Q15 15 20 -5Q0 3 -20 -5Z','#b5a074','#796d50',1);c.restore()}
 line('M-109 36Q0 48 109 36',gold,3);c.restore();
}

function sutra(t){
 const appear=span(t,17.6,18.1);if(!appear)return;
 const fly=span(t,18.1,19.45),x=lerp(958,585,fly),y=lerp(433,476,fly)-Math.sin(fly*Math.PI)*42;
 c.save();c.globalAlpha=appear;c.translate(x,y);c.rotate(-.08+Math.sin(fly*Math.PI)*.1);
 shape('M-34 -19L32 -23L38 22L-30 25Z','#ab8c4e',ink,1.4);
 shape('M-31 -16L29 -19L34 17L-27 21Z','#dfcf9f','#78663b',1);
 shape('M-31 -16L-22 -17L-18 20L-27 21Z',redTex);
 for(let i=0;i<4;i++)line(`M-29 ${-11+i*8}l8 -1`,'#e5d6ac',1);
 c.fillStyle=ink;c.font='19px JourneyKai';c.textAlign='center';c.fillText('真经',7,8);c.restore();
}
