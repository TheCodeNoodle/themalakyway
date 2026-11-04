(() => {
 const star=document.querySelector('.shooting-star');
 const picture=star.querySelector('img');
 const stage=document.querySelector('.shooting-star-stage');
 const frames=Array.from({length:7},(_,i)=>`shooting-star/frame-${i+1}.png`);
 let launchTimer,frameTimer,flight,state='waiting',frame=0;
 const preloads=frames.map(src=>{const image=new Image();image.src=src;return image.decode().catch(()=>{});});
 function display(index){picture.src=frames[index];star.dataset.frame=String(index+1);}
 function schedule(delay=12000+Math.random()*10000){
  clearTimeout(launchTimer);
  if(!document.hidden&&!document.documentElement.classList.contains('intro-active'))launchTimer=setTimeout(launch,delay);
 }
 function retire(){
  const hadFocus=document.activeElement===star;
  state='waiting';star.dataset.state=state;star.hidden=true;clearTimeout(frameTimer);
  if(flight){flight.onfinish=null;flight.cancel();flight=null;}
  if(hadFocus)document.querySelector('.companion-button').focus({preventScroll:true});
  schedule();
 }
 function animateTrail(){
  if(state!=='flying')return;
  frame=(frame+1)%4;display(frame);
  frameTimer=setTimeout(animateTrail,100);
 }
 function launch(){
  if(document.hidden||document.documentElement.classList.contains('intro-active'))return;
  if(document.querySelector('dialog[open]')){schedule(3000);return;}
  state='flying';star.dataset.state=state;star.hidden=false;frame=0;display(frame);
  const w=stage.clientWidth,h=stage.clientHeight;
  const pixelScale=document.querySelector('.sky').getBoundingClientRect().width/167;
  const spriteWidth=30*pixelScale,spriteHeight=20*pixelScale;
  star.style.width=`${spriteWidth}px`;
  star.style.height=`${spriteHeight}px`;
  // Vary the entry point along the top and left edges. The whole sprite
  // starts outside, then continues until its trailing edge has left the viewport.
  const fromTop=Math.random()<.5,slope=.4;
  const startX=fromTop?Math.random()*w*.75:-spriteWidth-16;
  const startY=fromTop?-spriteHeight-16:Math.random()*h*.55;
  const travel=Math.min(w+16-startX,(h+16-startY)/slope);
  const endX=startX+travel,endY=startY+travel*slope;
  const speed=Math.max(500,Math.hypot(w,h)/2.8);
  star.style.transform='';
  flight=star.animate([
   {transform:`translate3d(${startX}px,${startY}px,0)`,opacity:1},
   {transform:`translate3d(${endX}px,${endY}px,0)`,opacity:1}
  ],{duration:Math.hypot(travel,travel*slope)/speed*1000,easing:'linear',fill:'forwards'});
  flight.onfinish=()=>{if(state==='flying')retire();};
  frameTimer=setTimeout(animateTrail,100);
 }
 function catchStar(event){
  if(state!=='flying')return;
  if(event.type==='pointerdown'&&event.button!==0)return;
  event.stopPropagation();
  state='caught';star.dataset.state=state;clearTimeout(frameTimer);
  // Continue the flight while playing exactly the authored dimming frames 5–7.
  display(4);
  document.dispatchEvent(new CustomEvent('shootingstarcatch'));
  frameTimer=setTimeout(()=>{
   display(5);
   frameTimer=setTimeout(()=>{display(6);frameTimer=setTimeout(retire,100);},100);
  },100);
 }
 // Catch on press so the fast-moving target cannot slip away before release.
 star.addEventListener('pointerdown',catchStar);
 star.addEventListener('click',catchStar); // Native keyboard Enter/Space support.
 document.addEventListener('visibilitychange',()=>{
  clearTimeout(launchTimer);
  if(document.hidden){retire();}else schedule(5000);
 });
 document.addEventListener('windowopened',()=>{if(state!=='waiting')retire();});
 window.addEventListener('resize',()=>{if(state!=='waiting')retire();});
 Promise.all(preloads).then(()=>schedule(2200));
 document.addEventListener('introcomplete',()=>schedule(5000));
})();
