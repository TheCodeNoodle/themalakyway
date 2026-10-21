(() => {
 const passages=[
  'Hello, Citizen. Can you hear us?',
  "Excellent. This is the National Aeronautics and Space Administration calling. We've received a notification that you've officially turned 18.",
  'First of all, congratulations on surviving 18 rotations around the Sun. Impressive work.',
  'Now, as you may know, turning 18 comes with certain privileges. The right to vote, making questionable decisions, and, most importantly...',
  'obtaining a legal permit to roam freely through outer space!!',
  "And since we're feeling generous today, we've decided to approve your application.",
  'But before we can issue your official Rocketship License, we need one last thing from you.',
  'Please look directly at the nearest camera, put on your best astronaut smile, and hold still.',
  'Three... two... one... CHEESE!',
  "Alriight, you're cleared for takeoff. Grab your helmet and go ride the Saturn V Rocketship. There's a whole universe out there waiting for you.",
  'Transmission terminated. Happy 18th Birthday!'
 ];
 const scene=document.querySelector('#intro-scene');
 const advance=document.querySelector('#intro-advance');
 const card=document.querySelector('#transmission-card');
 const text=document.querySelector('#transmission-text');
 const hint=document.querySelector('#transmission-hint');
 const license=document.querySelector('#license-reveal');
 const flash=document.querySelector('#camera-flash');
 const main=document.querySelector('main');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const agency='National Aeronautics and Space Administration';
 window.scrollTo(0,0);
 let passage=0,offset=0,nextOffset=0,state='opening';
 let typingTimer,letters=[],revealed=0,continueHint='';
 const soundedPassages=new Set();
 function completeTyping(){
  clearTimeout(typingTimer);
  for(const letter of letters)letter.style.visibility='visible';
  revealed=letters.length;scene.dataset.typing='false';hint.textContent=continueHint;
  window.sceneAudio.stopLetters();
  if(nextOffset===words().length&&!soundedPassages.has(passage)){
   soundedPassages.add(passage);window.sceneAudio.passageEnd();
  }
 }
 function typePage(){
  letters=[];revealed=0;
  // Keep the final layout in place so words never jump while being typed.
  const walker=document.createTreeWalker(text,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  text.setAttribute('aria-label',text.textContent);
  for(const node of nodes){
   const fragment=document.createDocumentFragment();
   for(const character of node.textContent){
    const span=document.createElement('span');span.textContent=character;
    span.style.visibility='hidden';span.setAttribute('aria-hidden','true');
    fragment.append(span);letters.push(span);
   }
   node.replaceWith(fragment);
  }
  scene.dataset.typing='true';hint.textContent='Click to reveal ▸';
  function tick(){
   if(revealed>=letters.length){completeTyping();return;}
   const letter=letters[revealed++];letter.style.visibility='visible';
   if(/[\p{L}\p{N}]/u.test(letter.textContent))window.sceneAudio.letter();
   typingTimer=setTimeout(tick,/[.!?]/.test(letter.textContent)?160:/[,;:]/.test(letter.textContent)?85:26);
  }
  tick();
 }
 function words(){
  const raw=passages[passage],start=raw.indexOf(agency);
  return [...raw.matchAll(/\S+\s*/g)].map(m=>({text:m[0],strong:passage===1&&m.index>=start&&m.index<start+agency.length}));
 }
 function write(tokens,start,end){
  const fragment=document.createDocumentFragment();
  for(const token of tokens.slice(start,end)){
   if(token.strong){const strong=document.createElement('strong');strong.textContent=token.text;fragment.append(strong);}
   else fragment.append(document.createTextNode(token.text));
  }
  text.replaceChildren(fragment);
 }
 function render(){
  clearTimeout(typingTimer);
  window.sceneAudio.stopLetters();
  const tokens=words();
  card.hidden=false;license.hidden=true;hint.hidden=false;
  let low=offset+1,high=tokens.length,best=low;
  // Fit at word boundaries without shrinking mobile text to unreadable sizes.
  text.setAttribute('aria-busy','true');
  while(low<=high){const mid=Math.floor((low+high)/2);write(tokens,offset,mid);
   if(text.scrollHeight<=text.clientHeight+1){best=mid;low=mid+1;}else high=mid-1;
  }
  nextOffset=best;write(tokens,offset,best);text.removeAttribute('aria-busy');
  continueHint=nextOffset<tokens.length?'Click to continue ▸':passage===11?'Click to enter your universe ▸':'Click to continue ▸';
  advance.setAttribute('aria-label',passage===11?'Enter your birthday universe':'Continue transmission');
  scene.dataset.passage=String(passage+1);scene.dataset.state='dialogue';
  typePage();
 }
 async function photograph(){
  state='photograph';scene.dataset.state=state;advance.disabled=true;card.hidden=true;hint.hidden=true;
  // A visual camera flash only; no camera access or photo capture.
  window.sceneAudio.camera();
  await flash.animate([{opacity:0},{opacity:reduced.matches ? .35 : .85,offset:.15},{opacity:0}],{duration:reduced.matches?360:480,easing:'ease-out'}).finished;
  license.hidden=false;
  const animation=license.animate(reduced.matches?[
   {opacity:0,transform:'translateY(24px) rotate(-3deg)'},{opacity:1,transform:'translateY(0) rotate(-6deg)'}
  ]:[
   {opacity:0,transform:'translate3d(0,65vh,0) rotate(14deg) scale(.85)'},
   {opacity:1,transform:'translate3d(0,-12px,0) rotate(-8deg) scale(1)',offset:.8},
   {opacity:1,transform:'translate3d(0,0,0) rotate(-6deg) scale(1)'}
  ],{duration:reduced.matches?400:1050,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
  await animation.finished;
  state='license';scene.dataset.state=state;hint.textContent='Click when you’re ready to continue ▸';hint.hidden=false;advance.disabled=false;
  advance.setAttribute('aria-label','Continue after viewing your Rocketship License');
  advance.focus({preventScroll:true});
 }
 async function finish(){
  state='transition';scene.dataset.state=state;advance.disabled=true;
  window.sceneAudio.stopLetters();
  const curtain=document.createElement('div');
  curtain.setAttribute('aria-hidden','true');curtain.id='intro-transition';
  Object.assign(curtain.style,{position:'fixed',inset:'0',background:'#000',opacity:'0',zIndex:'10000',pointerEvents:'all'});
  document.body.append(curtain);
  const fade=async(from,to,duration,delay=0)=>{
   const animation=curtain.animate([{opacity:from},{opacity:to}],{duration,delay,easing:'ease-in-out',fill:'forwards'});
   await animation.finished;curtain.style.opacity=String(to);animation.cancel();
  };
  await fade(0,1,reduced.matches?250:550);
  scene.hidden=true;document.documentElement.classList.remove('intro-active');
  document.dispatchEvent(new CustomEvent('introcomplete'));
  await fade(1,0,reduced.matches?300:750,150);
  curtain.remove();main.inert=false;main.removeAttribute('aria-hidden');
  state='complete';scene.dataset.state=state;
  // Leave the character unfocused on arrival; Tab still reveals its keyboard focus ring.
 }
 advance.addEventListener('click',async e=>{
  if(e.button!==0||advance.disabled)return;
  if(state==='ready'){
   state='starting';advance.disabled=true;
   await window.sceneAudio.start();
   state='dialogue';render();advance.disabled=false;
   advance.focus({preventScroll:true});
   card.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
   return;
  }
  if(state==='license'){passage=9;offset=0;state='dialogue';render();return;}
  if(state!=='dialogue')return;
  if(scene.dataset.typing==='true'){completeTyping();return;}
  if(nextOffset<words().length){offset=nextOffset;render();return;}
  if(passage===8){photograph();return;}
  if(passage===10){finish();return;}
  passage++;offset=0;render();
 });
 let resizeFrame;
 window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(state==='dialogue')render();});});
 const assets=['intro-dialogue.svg','rocketship-license.svg'].map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});});
 Promise.all([...assets,document.fonts.load('24px "VT323"').catch(()=>{})]).then(()=>setTimeout(()=>{
  state='ready';scene.dataset.state=state;advance.disabled=false;
  hint.hidden=false;hint.textContent='Click to receive transmission ▸';
  advance.setAttribute('aria-label','Receive transmission and start music');
  advance.focus({preventScroll:true});
 },650));
})();
