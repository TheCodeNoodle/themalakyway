(() => {
 const passages=[
  'Hmmm… interesting… very interesting…',
  'Oh, my crystal ball is showing me something… In 18 years, you shall become… a dentist. A dentist who likes men, specifically.',
  'Fascinating. Truly fascinating.',
  'Wait… WAIT. I see children. One… two… three… FOUR!',
  "Oh, hold on… there's a fifth one coming your way.",
  "I'm afraid the crystal ball doesn't offer refunds on these predictions my dear."
 ];
 const modal=document.querySelector('#fortune'),idle=document.querySelector('#fortune-idle');
 const ball=document.querySelector('#fortune-ball'),dialogue=document.querySelector('#fortune-dialogue');
 const text=document.querySelector('#fortune-text'),hint=document.querySelector('#fortune-hint');
 const again=document.querySelector('#fortune-again');
 let opener,passage=0,offset=0,nextOffset=0,timer,letters=[],typing=false,started=false,done=false;
 const sounded=new Set();
 function tokens(){return passages[passage].match(/\S+\s*/g)||[];}
 function stop(){clearTimeout(timer);window.sceneAudio.stopLetters();}
 function complete(){
  stop();letters.forEach(el=>el.style.visibility='visible');typing=false;modal.dataset.typing='false';
  const last=nextOffset===tokens().length;
  if(last&&!sounded.has(passage)){sounded.add(passage);window.sceneAudio.passageEnd();}
  done=last&&passage===passages.length-1;
  hint.textContent=done?'The crystal ball has spoken.':'Click to continue ▸';
  again.hidden=!done;
 }
 function render(){
  stop();idle.hidden=true;dialogue.hidden=false;hint.hidden=false;again.hidden=true;
  const words=tokens();let low=offset+1,high=words.length,best=low;
  text.setAttribute('aria-busy','true');
  while(low<=high){const mid=Math.floor((low+high)/2);text.textContent=words.slice(offset,mid).join('');
   if(text.scrollHeight<=text.clientHeight+1){best=mid;low=mid+1;}else high=mid-1;
  }
  // Avoid leaving a single trailing word alone on the following page.
  if(best<words.length&&words.length-best<(best-offset)*.3){
   for(let i=best-1;i>offset+4;i--){if(/[.!?]$/.test(words[i-1].trim())){best=i;break;}}
  }
  nextOffset=best;const page=words.slice(offset,best).join('');
  text.setAttribute('aria-label',page);text.replaceChildren();letters=[];
  for(const character of page){const el=document.createElement('span');el.textContent=character;el.style.visibility='hidden';el.setAttribute('aria-hidden','true');letters.push(el);text.append(el);}
  text.removeAttribute('aria-busy');typing=true;done=false;modal.dataset.typing='true';modal.dataset.passage=String(passage+1);
  hint.textContent='Click to reveal ▸';let i=0;
  function tick(){
   if(!modal.open)return;
   if(i===letters.length){complete();return;}
   const el=letters[i++];el.style.visibility='visible';
   if(/[\p{L}\p{N}]/u.test(el.textContent))window.sceneAudio.letter();
   timer=setTimeout(tick,/[.!?…]/.test(el.textContent)?160:/[,;:]/.test(el.textContent)?85:26);
  }
  tick();
 }
 function begin(){started=true;passage=0;offset=0;sounded.clear();render();dialogue.focus({preventScroll:true});}
 ball.addEventListener('click',begin);again.addEventListener('click',begin);
 dialogue.addEventListener('click',()=>{
  if(typing){complete();return;}
  if(done)return;
  if(nextOffset<tokens().length)offset=nextOffset;else{passage++;offset=0;}
  render();
 });
 document.querySelector('#fortune-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('close',()=>{stop();opener?.focus({preventScroll:true});});
 let resizeFrame;
 window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(modal.open&&started)render();});});
 window.fortune={async open(source){
  if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;started=false;done=false;typing=false;idle.hidden=false;dialogue.hidden=true;hint.hidden=true;again.hidden=true;
  if(!await window.windowAssets.show(modal))return;ball.focus({preventScroll:true});
 }};
})();
