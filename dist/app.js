const {surprises,finale}=window.birthdayContent;
const stars=[...document.querySelectorAll('.star')];
const dialog=document.querySelector('#surprise');
const finalButton=document.querySelector('#final');
const discovered=new Set();
let opener;
const dots=document.querySelector('#dots');
stars.forEach(()=>dots.append(document.createElement('i')));
async function show(content,source){
 if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
 opener=source;
 document.querySelector('#dialog-kind').textContent=content.kind;
 document.querySelector('#dialog-title').textContent=content.title;
 document.querySelector('#dialog-body').textContent=content.body;
 document.querySelector('#dialog-note').textContent=content.note;
 const link=document.querySelector('#song-link');
 const safeUrl=/^https?:\/\//i.test(content.songUrl||'');
 link.hidden=!safeUrl;
 if(safeUrl)link.href=content.songUrl;else link.removeAttribute('href');
 await window.windowAssets.show(dialog);
}
function openStar(index){
 if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
 discovered.add(index);
 stars[index].classList.add('discovered');
 stars[index].setAttribute('aria-label',`Reopen ${surprises[index].title}, discovered`);
 stars[index].querySelector('title').textContent=surprises[index].title;
 stars[index].querySelector('.star-name').textContent=surprises[index].title.toUpperCase();
 dots.children[index].classList.add('lit');
 document.querySelector('#progress').textContent=`${discovered.size} of ${stars.length} little discoveries`;
 if(discovered.size===stars.length){finalButton.disabled=false;document.querySelector('#unlock').textContent='Every little light found. One last wish is waiting.';}
 if(surprises[index].game)window[surprises[index].game].open(stars[index]);else show(surprises[index],stars[index]);
 document.dispatchEvent(new CustomEvent('stardiscovered',{detail:{count:discovered.size,star:stars[index]}}));
}
stars.forEach((star,i)=>{
 const hit=star.querySelector('.hit');
 hit.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')star.classList.add('is-hovered');});
 hit.addEventListener('pointerleave',()=>star.classList.remove('is-hovered'));
 star.addEventListener('click',()=>openStar(i));
 star.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openStar(i);}});
});
document.querySelector('.close').addEventListener('click',()=>dialog.close());
let backdropDown=false;
dialog.addEventListener('pointerdown',e=>{const r=dialog.getBoundingClientRect();backdropDown=e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;});
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(backdropDown&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();backdropDown=false;});
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
finalButton.addEventListener('click',()=>show(finale,finalButton));

// Play the original GIF frames once, then hold its first frame for 5–9 seconds.
const characterFrames=Array.from({length:4},(_,i)=>`cursor/frame-large-${i}.png`);
characterFrames.forEach(src=>{const image=new Image();image.src=src;});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const character=document.querySelector('.companion');
let blinkTimer;
function setCharacterFrame(index){character.src=characterFrames[index];}
function scheduleBlink(){
 clearTimeout(blinkTimer);setCharacterFrame(0);
 if(document.hidden||document.documentElement.classList.contains('intro-active'))return;
 blinkTimer=setTimeout(()=>{
  let frame=1;setCharacterFrame(frame);
  const step=()=>{frame++;if(frame<characterFrames.length){setCharacterFrame(frame);blinkTimer=setTimeout(step,100);}else scheduleBlink();};
  blinkTimer=setTimeout(step,100);
 },reducedMotion.matches?12000+Math.random()*6000:5000+Math.random()*4000);
}
document.addEventListener('visibilitychange',scheduleBlink);
reducedMotion.addEventListener('change',scheduleBlink);

scheduleBlink();
document.addEventListener('introcomplete',scheduleBlink);

const companionButton=document.querySelector('.companion-button');
const thoughtCloud=document.querySelector('.thought-cloud');
const companionFloat=document.querySelector('.companion-float');
const companionArea=document.querySelector('main');
let companionDrag=null,suppressCompanionClick=false,companionMoved=false;
function placeCompanion(x,y){
 const maxX=Math.max(0,companionArea.clientWidth-companionFloat.offsetWidth);
 const maxY=Math.max(0,companionArea.clientHeight-companionFloat.offsetHeight);
 companionFloat.style.left=`${Math.max(0,Math.min(maxX,x))}px`;
 companionFloat.style.top=`${Math.max(14,Math.min(maxY,y))}px`;
 companionFloat.style.right='auto';companionFloat.style.bottom='auto';
 companionMoved=true;
}
function placeThought(){
 if(thoughtCloud.hidden)return;
 const r=companionFloat.getBoundingClientRect(),w=thoughtCloud.offsetWidth;
 const left=Math.max(8-r.left,Math.min((r.width-w)/2,document.documentElement.clientWidth-8-r.left-w));
 thoughtCloud.style.left=`${left}px`;thoughtCloud.style.right='auto';
 thoughtCloud.style.setProperty('--thought-tail-left',`${r.width/2-left}px`);
 thoughtCloud.classList.toggle('thought-below',r.top<thoughtCloud.offsetHeight+42);
}
companionButton.title='Drag to move · Click to talk · Arrow keys to move';
companionButton.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 suppressCompanionClick=false;
 companionDrag={id:e.pointerId,x:e.clientX,y:e.clientY,left:companionFloat.offsetLeft,top:companionFloat.offsetTop,moved:false};
 companionButton.setPointerCapture(e.pointerId);
});
companionButton.addEventListener('pointermove',e=>{
 if(!companionDrag||companionDrag.id!==e.pointerId)return;
 const dx=e.clientX-companionDrag.x,dy=e.clientY-companionDrag.y;
 if(!companionDrag.moved&&Math.hypot(dx,dy)<6)return;
 companionDrag.moved=true;hideThought();
 companionFloat.classList.add('is-dragging');
 placeCompanion(companionDrag.left+dx,companionDrag.top+dy);
});
function finishCompanionDrag(){
 if(!companionDrag)return;
 suppressCompanionClick=companionDrag.moved;
 companionDrag=null;companionFloat.classList.remove('is-dragging');
}
companionButton.addEventListener('pointerup',finishCompanionDrag);
companionButton.addEventListener('pointercancel',finishCompanionDrag);
companionButton.addEventListener('lostpointercapture',finishCompanionDrag);
companionButton.addEventListener('keydown',e=>{
 const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
 if(!moves[e.key])return;
 e.preventDefault();const [dx,dy]=moves[e.key],step=e.shiftKey?30:10;
 placeCompanion(companionFloat.offsetLeft+dx*step,companionFloat.offsetTop+dy*step);placeThought();
});
function hideThought(){thoughtCloud.hidden=true;companionButton.setAttribute('aria-expanded','false');}
const characterSpeeches=['Holalalala!!','Stop poking me!','Are you stoopid?'];
const shootingStarSpeeches=['Quick! Make a wish!','Hey, you caught one!',"Careful, it's still cosmic!"];
function sayRandom(speeches){
 thoughtCloud.textContent=speeches[Math.floor(Math.random()*speeches.length)];
 thoughtCloud.hidden=false;
 companionButton.setAttribute('aria-expanded','true');
 placeThought();
}
companionButton.addEventListener('click',e=>{
 if(suppressCompanionClick&&e.detail!==0){suppressCompanionClick=false;return;}
 suppressCompanionClick=false;
 sayRandom(characterSpeeches);
});
document.addEventListener('click',e=>{if(!e.target.closest('.companion-float,.shooting-star,#birthday-moon'))hideThought();});
const birthdayMoon=document.querySelector('#birthday-moon');
function talkAboutMoon(){
 if(document.documentElement.classList.contains('intro-active')||document.querySelector('dialog[open]'))return;
 sayRandom(["That's how the moon looked like when I was born"]);
}
birthdayMoon.addEventListener('click',talkAboutMoon);
birthdayMoon.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();talkAboutMoon();}});

document.addEventListener('shootingstarcatch',()=>{
 sayRandom(shootingStarSpeeches);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideThought();});

// An occasional small turn, independent of the continuous floating motion.
let turnTimer;
let turnAnimation;
function scheduleTurn(){
 clearTimeout(turnTimer);turnAnimation?.cancel();
 if(document.hidden||document.documentElement.classList.contains('intro-active'))return;
 turnTimer=setTimeout(()=>{
  const angle=(Math.random()<.5?-1:1)*(reducedMotion.matches?3:14);
  turnAnimation=character.animate([
   {transform:'rotate(0deg)'},
   {transform:`rotate(${angle}deg)`,offset:.4},
   {transform:`rotate(${-angle/3}deg)`,offset:.75},
   {transform:'rotate(0deg)'}
  ],{duration:reducedMotion.matches?2400:1800,easing:'ease-in-out'});
  turnAnimation.onfinish=scheduleTurn;
 },9000+Math.random()*6000);
}
document.addEventListener('visibilitychange',scheduleTurn);
reducedMotion.addEventListener('change',scheduleTurn);
scheduleTurn();
document.addEventListener('introcomplete',scheduleTurn);

// Keep the artwork proportional and let visitors reach stars beyond the screen.
const universe=document.querySelector('.universe');
const sky=document.querySelector('.sky');
const middleClouds=document.querySelector('.moving-clouds');
const foregroundCloud=document.querySelector('.bottom-cloud');
let parallaxFrame=0,parallaxX=0,parallaxY=0;
let skyBounds=universe.getBoundingClientRect();
function updateParallax(x=0,y=0){
 parallaxX=x;parallaxY=y;
 if(parallaxFrame||document.hidden)return;
 parallaxFrame=requestAnimationFrame(()=>{
  parallaxFrame=0;
  const amount=reducedMotion.matches ? .2 : 1;
  middleClouds.style.transform=`translate3d(${(-parallaxX*10*amount).toFixed(2)}px,${(-parallaxY*6*amount).toFixed(2)}px,0)`;
  foregroundCloud.style.transform=`translate3d(${(-parallaxX*22*amount).toFixed(2)}px,${(-parallaxY*12*amount).toFixed(2)}px,0) scale(1.025)`;
 });
}
function cacheSkyBounds(){skyBounds=universe.getBoundingClientRect();}
universe.addEventListener('pointerenter',cacheSkyBounds);
window.addEventListener('scroll',cacheSkyBounds,{passive:true});
universe.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 updateParallax((e.clientX-skyBounds.left)/skyBounds.width-.5,(e.clientY-skyBounds.top)/skyBounds.height-.5);
},{passive:true});
universe.addEventListener('pointerleave',()=>updateParallax());
universe.addEventListener('scroll',()=>updateParallax(universe.scrollLeft/Math.max(1,universe.scrollWidth-universe.clientWidth)-.5,0),{passive:true});
reducedMotion.addEventListener('change',()=>updateParallax());
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('scene-paused',document.hidden));
new ResizeObserver(()=>{
 cacheSkyBounds();
 const scenePixel=sky.getBoundingClientRect().width/167;
 document.querySelector('.companion-float').style.setProperty('--companion-size',`${32*scenePixel}px`);
 if(companionMoved)placeCompanion(companionFloat.offsetLeft,companionFloat.offsetTop);
 placeThought();
 universe.scrollLeft=(universe.scrollWidth-universe.clientWidth)/2;
 universe.scrollTop=(universe.scrollHeight-universe.clientHeight)/2;
 const cropped=universe.scrollWidth>universe.clientWidth+2||universe.scrollHeight>universe.clientHeight+2;
 document.querySelector('.hint').textContent=cropped?'Drag the sky to explore. Tap a star to open it.':'Hover to find a little light. Tap a star to open it.';
}).observe(universe);
let pan=null;
let suppressStarClick=false;
universe.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'||e.button!==0)return;
 suppressStarClick=false;
 pan={id:e.pointerId,x:e.clientX,y:e.clientY,left:universe.scrollLeft,top:universe.scrollTop,moved:false};
});
universe.addEventListener('pointermove',e=>{
 if(!pan)return;
 const dx=e.clientX-pan.x,dy=e.clientY-pan.y;
 if(!pan.moved&&Math.hypot(dx,dy)>6){pan.moved=true;universe.classList.add('is-dragging');universe.setPointerCapture(e.pointerId);}
 if(pan.moved){universe.scrollLeft=pan.left-dx;universe.scrollTop=pan.top-dy;}
});
universe.addEventListener('pointerup',()=>{suppressStarClick=!!pan?.moved;pan=null;universe.classList.remove('is-dragging');});
universe.addEventListener('pointercancel',()=>{pan=null;suppressStarClick=false;universe.classList.remove('is-dragging');});
universe.addEventListener('lostpointercapture',()=>{pan=null;universe.classList.remove('is-dragging');});
universe.addEventListener('click',e=>{if(suppressStarClick){e.preventDefault();e.stopPropagation();suppressStarClick=false;}},true);
