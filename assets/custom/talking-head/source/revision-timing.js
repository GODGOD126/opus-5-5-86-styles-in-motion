'use strict';
// A single geometry clock supplies both the dial position and its audible detents.
window.FILM_TIMING=(()=>{
 const start=64.15,end=67.38,steps=18,power=2.8;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const position=t=>steps*(1-Math.pow(1-clamp((t-start)/(end-start)),power));
 const ticks=Array.from({length:steps},(_,i)=>start+(end-start)*(1-Math.pow(1-(i+1)/steps,1/power)));
 return {duration:150,narrationEnd:129.033333,outroStart:129.9,outroDuration:20,carousel:{start,end,steps,position,ticks},pageTurns:[31.65,33.30]};
})();
