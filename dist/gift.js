(() => {
 const passages=[
  'Citizen! Agent 01 reporting in. Four stars discovered! Congratulations on reaching your first cosmic milestone.',
  'Such impressive exploration deserves a reward. Mission Control has approved a special delivery, just for you.',
  'One gift, sealed and ready. Go on, Citizen. Open your mail!'
 ];
 const description='Malakistos the Great is the legendary warrior who conquered the Seven Realms. Known for her strength, courage, and unmatched fighting skills, she defeated countless enemies and built an empire that would never be forgotten.';
 const cardFace=`<div class="gift-card-face"><img src="gift-art/card.svg" alt="Malakistos the Great"><p class="gift-card-description">${description}</p><span class="gift-strength" aria-label="Strength: 90">90</span><span class="gift-defense" aria-label="Defense: 75">75</span></div>`;
 const modal=document.createElement('dialog');modal.id='milestone-gift';modal.className='gift-window';
 modal.setAttribute('aria-label','A gift from Agent 01');
 modal.innerHTML=`<button class="gift-transmission" type="button" aria-label="Continue Agent 01 transmission">
  <span class="transmission-card"><img class="transmission-art" src="intro-dialogue.svg" alt="Agent 01"><span class="transmission-text" id="gift-text"></span></span>
  <span class="gift-hint" id="gift-dialogue-hint">Click to continue ▸</span></button>
 <div class="gift-scene" hidden><div class="gift-stage">
  <div class="gift-envelope"><button class="gift-open" type="button" aria-label="Open your gift envelope"><img src="gift-art/mail-0.png" alt="Sealed envelope"></button>
   <div class="gift-layers" hidden><img class="gift-back" src="gift-art/mail-back.svg" alt=""><div class="gift-card">${cardFace}</div><img class="gift-front" src="gift-art/mail-front.svg" alt=""></div>
  </div></div><p class="gift-hint" id="gift-envelope-hint">A delivery for you. Click the seal to open it.</p></div>
 <div class="gift-collection" hidden>${cardFace}<button class="gift-return" type="button">Back to the stars ↗</button></div>`;
 // Reuse the current opening frame, including its cropped SVG viewport and any manual styling.
 const openingFrame=document.querySelector('#transmission-card').cloneNode(true);
 openingFrame.removeAttribute('id');openingFrame.hidden=false;
 const openingText=openingFrame.querySelector('.transmission-text');
 openingText.id='gift-text';openingText.replaceChildren();openingText.removeAttribute('aria-label');
 modal.querySelector('.transmission-card').replaceWith(openingFrame);
 document.body.append(modal);
 const $=s=>modal.querySelector(s),advance=$('.gift-transmission'),text=$('#gift-text'),hint=$('#gift-dialogue-hint');
 const envelope=$('.gift-envelope'),open=$('.gift-open'),layers=$('.gift-layers'),card=$('.gift-card');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pending=false,started=false,trigger,passage=0,offset=0,nextOffset=0,timer,typing=false,letters=[],state='waiting';
 const sounded=new Set();
 const assets=['gift-art/mail-0.png','gift-art/mail-1.png','gift-art/mail-2.png','gift-art/mail-back.svg','gift-art/mail-front.svg','gift-art/card.svg'];
 let ready;
 function preload(){return ready??=Promise.all(assets.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});}));}
 function stop(){clearTimeout(timer);window.sceneAudio.stopLetters();}
 const words=()=>passages[passage].match(/\S+\s*/g)||[];
 function complete(){
  stop();letters.forEach(el=>el.style.visibility='visible');typing=false;
  hint.textContent='Click to continue ▸';
  if(nextOffset===words().length&&!sounded.has(passage)){sounded.add(passage);window.sceneAudio.passageEnd();}
 }
 function render(){
  stop();const tokens=words();let low=offset+1,high=tokens.length,best=low;
  while(low<=high){const mid=Math.floor((low+high)/2);text.textContent=tokens.slice(offset,mid).join('');
   if(text.scrollHeight<=text.clientHeight+1){best=mid;low=mid+1;}else high=mid-1;
  }
  nextOffset=best;const page=tokens.slice(offset,best).join('');text.setAttribute('aria-label',page);text.replaceChildren();letters=[];
  for(const ch of page){const el=document.createElement('span');el.textContent=ch;el.style.visibility='hidden';el.setAttribute('aria-hidden','true');letters.push(el);text.append(el);}
  typing=true;hint.textContent='Click to reveal ▸';let i=0;
  function tick(){if(!modal.open)return;if(i===letters.length){complete();return;}const el=letters[i++];el.style.visibility='visible';
   if(/[\p{L}\p{N}]/u.test(el.textContent))window.sceneAudio.letter();
   timer=setTimeout(tick,/[.!?]/.test(el.textContent)?160:/[,;:]/.test(el.textContent)?85:26);
  }tick();
 }
 async function animate(el,frames,duration){const a=el.animate(frames,{duration:reduced.matches?Math.min(duration,250):duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});await a.finished;return a;}
 async function showEnvelope(){
  state='envelope-entering';stop();advance.disabled=true;
  await animate(advance,[{opacity:1},{opacity:0}],250);advance.hidden=true;
  await preload();$('.gift-scene').hidden=false;
  await animate(envelope,[{opacity:0,transform:'translateY(35px) rotate(-7deg)'},{opacity:1,transform:'translateY(0) rotate(0deg)'}],700);
  state='envelope';open.focus({preventScroll:true});
 }
 advance.addEventListener('click',()=>{
  if(state!=='dialogue')return;if(typing){complete();return;}
  if(nextOffset<words().length)offset=nextOffset;
  else if(passage<passages.length-1){passage++;offset=0;}
  else{showEnvelope();return;}render();
 });
 open.addEventListener('click',async()=>{
  if(state!=='envelope')return;state='opening';open.disabled=true;$('#gift-envelope-hint').textContent='';
  // Play the supplied GIF's three frames once, preserving its 100 ms timings.
  for(let i=1;i<=2;i++){open.querySelector('img').src=`gift-art/mail-${i}.png`;await new Promise(resolve=>setTimeout(resolve,100));}
  open.hidden=true;layers.hidden=false;
  await animate(envelope,[{transform:'translateX(0)'},{transform:'translateX(-49.68%)'}],600);
  await animate(card,[{transform:'translateX(0)'},{transform:'translateX(110.7%)'}],1100);
  const from=card.getBoundingClientRect();
  $('.gift-return').style.visibility='hidden';$('.gift-collection').hidden=false;const display=$('.gift-collection .gift-card-face'),to=display.getBoundingClientRect();
  card.style.visibility='hidden';
  const moving=animate(display,[{transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width})`,transformOrigin:'top left'},{transform:'translate(0,0) scale(1)',transformOrigin:'top left'}],850);
  await animate($('.gift-scene'),[{opacity:1},{opacity:0}],650);$('.gift-scene').hidden=true;
  await moving;state='collected';$('.gift-return').style.visibility='visible';$('.gift-return').focus({preventScroll:true});
 });
 $('.gift-return').addEventListener('click',()=>modal.close());
 modal.addEventListener('cancel',e=>{if(state!=='collected')e.preventDefault();});
 modal.addEventListener('close',()=>{stop();trigger?.focus({preventScroll:true});});
 async function maybeStart(){
  if(!pending||started||document.hidden||window.windowAssets.pending||document.querySelector('dialog[open]'))return;
  started=true;pending=false;state='dialogue';preload();if(!await window.windowAssets.show(modal)){started=false;pending=true;return;}render();advance.focus({preventScroll:true});
 }
 document.addEventListener('stardiscovered',event=>{
  if(event.detail.count<4||started)return;pending=true;trigger=event.detail.star;preload();requestAnimationFrame(maybeStart);
 });
 document.querySelectorAll('dialog').forEach(dialog=>{if(dialog!==modal)dialog.addEventListener('close',()=>requestAnimationFrame(maybeStart));});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)maybeStart();});
 let resizing;window.addEventListener('resize',()=>{cancelAnimationFrame(resizing);resizing=requestAnimationFrame(()=>{if(modal.open&&state==='dialogue')render();});});
})();
