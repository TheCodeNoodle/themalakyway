(() => {
 const modal=document.createElement('dialog');modal.id='prank-letter';modal.className='gift-window prank-window';modal.setAttribute('aria-label','A letter for you');
 const paper='<div class="prank-paper"><img loading="lazy" src="gift-art/prank-paper.svg" alt=""><strong>GOOOD<br>GIIIRRRRRLL!!!!</strong></div>';
 modal.innerHTML=`<button class="prank-close" aria-label="Close letter"><img loading="lazy" src="disco-art/closeButton.svg" alt=""></button><div class="prank-delivery"><div class="prank-stage"><div class="gift-envelope"><button class="gift-open" aria-label="Open the envelope"><img loading="lazy" src="gift-art/mail-0.png" alt="Sealed envelope"></button><div class="gift-layers" hidden><img loading="lazy" class="gift-back" src="gift-art/mail-back.svg" alt=""><div class="gift-card">${paper}</div><img loading="lazy" class="gift-front" src="gift-art/mail-front.svg" alt=""></div></div></div><p class="gift-hint">Click the envelope</p></div><div class="prank-reveal" hidden>${paper}</div>`;
 document.body.append(modal);const $=s=>modal.querySelector(s);let version=0,busy=false,opener;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 async function animate(el,frames,duration){const a=el.animate(frames,{duration:reduced.matches?120:duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});await a.finished.catch(()=>{});}
 function reset(){modal.querySelectorAll('*').forEach(el=>el.getAnimations().forEach(a=>a.cancel()));busy=false;$('.prank-delivery').hidden=false;$('.prank-reveal').hidden=true;$('.gift-layers').hidden=true;$('.gift-open').hidden=false;$('.gift-open').disabled=false;$('.gift-open img').src='gift-art/mail-0.png';$('.gift-hint').textContent='Click the envelope';}
 $('.gift-open').onclick=async()=>{
  if(busy)return;busy=true;const run=version;$('.gift-open').disabled=true;$('.gift-hint').textContent='';
  for(let i=1;i<=2;i++){$('.gift-open img').src=`gift-art/mail-${i}.png`;await new Promise(r=>setTimeout(r,100));if(run!==version)return;}
  $('.gift-open').hidden=true;$('.gift-layers').hidden=false;
  await animate($('.gift-card'),[{transform:'translateX(0)'},{transform:'translateX(110.7%)'}],850);if(run!==version)return;
  $('.prank-reveal').hidden=false;
  await Promise.all([animate($('.prank-delivery'),[{opacity:1},{opacity:0}],450),animate($('.prank-reveal'),[{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'scale(1)'}],750)]);
  if(run!==version)return;$('.prank-delivery').hidden=true;$('.prank-close').focus({preventScroll:true});
 };
 $('.prank-close').onclick=()=>modal.close();modal.addEventListener('close',()=>{version++;reset();opener?.focus({preventScroll:true});});
 window.prankLetter={async open(source){if(window.windowAssets.pending||document.querySelector('dialog[open]'))return;opener=source;version++;reset();if(await window.windowAssets.show(modal))$('.gift-open').focus({preventScroll:true});}};
})();
