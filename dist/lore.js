(() => {
 const chapters=window.loreChapters,roman=['I','II','III','IV'];
 const modal=document.createElement('dialog');modal.id='lore';modal.className='lore-window';modal.setAttribute('aria-labelledby','lore-title');
 modal.innerHTML=`<div class="lore-toolbar"><span>LORE / THE CHRONICLES</span><button id="lore-close" aria-label="Close Lore">Close <span aria-hidden="true">×</span></button></div>
 <div class="lore-binding">
  <div class="lore-spread" inert>
   <section class="lore-art-page" aria-label="Chapter illustrations"><span class="lore-running">THE CHRONICLES OF MALAKISTOS</span><div id="lore-art"></div><span class="lore-place"></span></section>
   <section class="lore-story-page"><div class="lore-chapter-line"><span id="lore-chapter-number"></span><span aria-hidden="true">✦</span></div><div class="lore-reading" tabindex="0" aria-label="Scroll to read this chapter"><h2 id="lore-title"></h2><div id="lore-story"></div><div class="lore-end-mark" aria-hidden="true">✧</div></div><nav class="lore-navigation" aria-label="Book pages"><button id="lore-prev" aria-label="Previous page">← <span>Previous</span></button><span id="lore-page-number" aria-live="polite"></span><button id="lore-next" aria-label="Next page"><span>Next</span> →</button></nav></section>
  </div>
  <div class="lore-cover"><div class="lore-cover-border"><span class="lore-cover-kicker">A TALE FROM SKYRIM</span><div class="lore-seal" aria-hidden="true">✧</div><h2>Malakistos<br><em>the Great</em></h2><div class="lore-cover-rule" aria-hidden="true"></div><p>The Dragonborn’s story</p><button id="lore-read">Open the book <span aria-hidden="true">→</span></button><span class="lore-cover-foot">FOUR CHAPTERS · ONE LEGEND</span></div></div>
 </div><div class="lore-bottom"><button id="lore-cover-button" hidden>↖ Back to cover</button><span id="lore-help">An illustrated chronicle</span></div>`;
 document.body.append(modal);
 const soundtrack=new Audio('music/lore-solitude.mp3');soundtrack.id='lore-music';soundtrack.loop=true;soundtrack.preload='metadata';document.body.append(soundtrack);
 window.sceneAudio.registerMusic(modal,soundtrack);
 const $=s=>modal.querySelector(s),cover=$('.lore-cover'),spread=$('.lore-spread');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let page=0,opener,opened=false,busy=false,version=0;
 const images=new Map();
 function preload(){return Promise.all(chapters.flatMap(c=>c.art).map(a=>{
  if(!images.has(a.src)){const img=new Image();img.src=a.src;images.set(a.src,img.decode().catch(()=>{}));}return images.get(a.src);
 }));}
 const ornament=`<svg viewBox="0 0 400 420" class="lore-cartography" aria-hidden="true"><g fill="none" stroke="currentColor"><circle cx="200" cy="192" r="136" stroke-width=".7"/><circle cx="200" cy="192" r="128" stroke-dasharray="2 10"/><path d="M200 32V68M200 316V352M40 192H76M324 192H360M86 78l22 22M292 284l22 22M314 78l-22 22M108 284l-22 22"/><path d="m72 258 61-100 28 40 50-104 80 136 28-37 26 65H72Z" stroke-width="1.2"/><path d="m176 165 35-71 31 53-22-8-10 13-11-9-23 22Zm-61 23 18-30 28 40-17-5-9 7-9-16-11 4Z"/><path d="m100 279 44 5 64-7 91 5M140 296l58 3 60-4M192 24h16m-8-8v16" stroke-width=".7"/></g><text x="200" y="388" text-anchor="middle" fill="currentColor" font-family="Georgia,serif" font-size="12" letter-spacing="7">SKYRIM</text></svg>`;
 $('.lore-seal').innerHTML=ornament;
 function renderArt(){
  const root=$('#lore-art'),items=chapters[page].art;root.replaceChildren();
  if(!items.length){root.innerHTML=ornament;const n=document.createElement('span');n.className='lore-plate-number';n.textContent=roman[page];root.append(n);return;}
  root.classList.toggle('lore-art-stack',items.length>1);
  for(const a of items){
   const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
   img.src=a.src;img.alt=a.alt;img.className='lore-illustration';caption.textContent=a.caption||'';
   figure.append(img,caption);root.append(figure);
  }
 }
 function render(){
  const chapter=chapters[page];$('#lore-title').textContent=chapter.title;$('#lore-chapter-number').textContent=`CHAPTER ${roman[page]}`;$('.lore-place').textContent=chapter.place;
  const story=$('#lore-story');story.replaceChildren();chapter.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text.replaceAll('—',',');story.append(p);});
  $('#lore-page-number').textContent=`${page+1} / ${chapters.length}`;$('#lore-prev').disabled=page===0;$('#lore-next').disabled=page===chapters.length-1;renderArt();$('.lore-reading').scrollTop=0;
 }
 const motion=new Set();
 function animateBook(element,frames,duration=650){
  const animation=element.animate(reduced.matches?[{opacity:frames[0].opacity??1},{opacity:frames[frames.length-1].opacity??1}]:frames,{duration:reduced.matches?120:duration,easing:'cubic-bezier(.22,.68,.2,1)',fill:'both'});
  motion.add(animation);
  return animation.finished.catch(()=>{}).finally(()=>{animation.cancel();motion.delete(animation);});
 }
 async function turn(direction){
  if(busy||!opened||page+direction<0||page+direction>=chapters.length)return;
  busy=true;const request=version;
  const artPage=$('.lore-art-page'),storyPage=$('.lore-story-page');
  modal.classList.add('is-turning');
  // Move the entire paper, including its illustration. Swap both pages only at the fold.
  await Promise.all([artPage,storyPage].map((sheet,i)=>animateBook(sheet,[
   {transform:'rotateY(0deg)',opacity:1},
   {transform:`rotateY(${(i? -1:1)*direction*88}deg)`,opacity:0}
  ],360)));
  if(version!==request)return;
  page+=direction;render();
  await Promise.all([artPage,storyPage].map((sheet,i)=>animateBook(sheet,[
   {transform:`rotateY(${(i?1:-1)*direction*80}deg)`,opacity:0},
   {transform:'rotateY(0deg)',opacity:1}
  ],500)));
  if(version!==request)return;modal.classList.remove('is-turning');busy=false;$('.lore-reading').focus({preventScroll:true});
 }
 async function openBook(){
  if(busy||opened)return;busy=true;const request=version;await preload();if(version!==request||!modal.open){busy=false;return;}
  spread.inert=false;modal.classList.add('is-reading');
  await Promise.all([
   animateBook(cover,[{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY(-75deg)',opacity:1,offset:.7},{transform:'rotateY(-110deg)',opacity:0}],1000),
   animateBook(spread,[{opacity:0,transform:'scaleX(.76) scaleY(.96)'},{opacity:1,transform:'scaleX(1) scaleY(1)'}],1000)
  ]);
  if(version!==request)return;cover.hidden=true;opened=true;busy=false;$('#lore-cover-button').hidden=false;$('#lore-help').textContent='Scroll to read · Arrows to turn the pages';$('.lore-reading').focus({preventScroll:true});
 }
 function showCover(){version++;motion.forEach(a=>a.cancel());busy=false;opened=false;cover.getAnimations().forEach(a=>a.cancel());cover.hidden=false;spread.inert=true;modal.classList.remove('is-reading');$('#lore-cover-button').hidden=true;$('#lore-help').textContent='An illustrated chronicle';$('#lore-read').focus({preventScroll:true});}
 $('#lore-read').onclick=openBook;$('#lore-prev').onclick=()=>turn(-1);$('#lore-next').onclick=()=>turn(1);$('#lore-close').onclick=()=>modal.close();$('#lore-cover-button').onclick=async()=>{
  if(busy)return;busy=true;const request=version;cover.hidden=false;
  await Promise.all([
   animateBook(cover,[{transform:'rotateY(-110deg)',opacity:0},{transform:'rotateY(-60deg)',opacity:1,offset:.3},{transform:'rotateY(0deg)',opacity:1}],850),
   animateBook(spread,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.94)'}],850)
  ]);
  if(request===version)showCover();
 };
 modal.addEventListener('keydown',event=>{if(opened&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();turn(event.key==='ArrowRight'?1:-1);}});
 modal.addEventListener('close',()=>{version++;busy=false;motion.forEach(a=>a.cancel());modal.classList.remove('is-turning');modal.querySelectorAll('.lore-turning-leaf').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.remove();});opener?.focus({preventScroll:true});});
 render();
 window.lore={async open(source){
  if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;showCover();if(!await window.windowAssets.show(modal))return;preload();animateBook($('.lore-binding'),[{opacity:0,transform:'translateY(30px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],700);$('#lore-read').focus({preventScroll:true});
 }};
})();
