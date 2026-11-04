(() => {
 const cache=new Map(),queue=[];
 let active=0,pending=null;
 const common=['disco-art/closeButton.svg'];
 const extra={
  'last-letter':['letter-paper.svg'],
  'prank-letter':['gift-art/mail-0.png','gift-art/mail-1.png','gift-art/mail-2.png','gift-art/mail-back.svg','gift-art/mail-front.svg','gift-art/prank-paper.svg'],
  disco:['disco-art/windowBackground.svg','disco-art/SubmitButton.svg','disco-art/pauseButton.svg',...Array.from({length:3},(_,i)=>`disco-art/heart-frame-${i}.png`)],
  fortune:['fortune-art/window-table.svg','disco-art/SubmitButton.svg'],
  'cosmic-terminal':['terminal-art/border.svg','terminal-art/chickette.svg','terminal-art/krobus.svg'],
  'milestone-gift':['intro-dialogue.svg','gift-art/mail-1.png','gift-art/mail-2.png']
 };
 // Two background transfers; leave one extra slot available for user intent.
 function pump(){
  queue.sort((a,b)=>b.priority-a.priority);
  while(queue.length&&active<(queue[0].priority>=10?3:2)){
   const job=queue.shift();active++;job.state='loading';
   job.img.fetchPriority=job.priority>=10?'high':'low';job.img.src=job.url;
   job.img.decode().then(()=>{job.state='ready';},()=>{job.state='failed';cache.delete(job.url);}).finally(()=>{active--;job.resolve();pump();});
  }
 }
 function image(url,priority=0){
  if(!url)return Promise.resolve();
  const key=new URL(url,document.baseURI).href;
  let job=cache.get(key);
  if(!job){let resolve;const ready=new Promise(done=>resolve=done);job={url:key,img:new Image(),state:'queued',priority,ready,resolve};cache.set(key,job);queue.push(job);}
  else if(priority>job.priority){job.priority=priority;if(job.state==='loading')job.img.fetchPriority='high';}
  pump();return job.ready;
 }
 function prepare(modal,priority=10){
  const urls=[...common,...(extra[modal.id]||[])];
  modal.querySelectorAll('img[src],image[href]').forEach(img=>urls.push(img.currentSrc||img.getAttribute('src')||img.getAttribute('href')));
  const fonts=['24px VT323'];if(modal.id==='cosmic-terminal')fonts.push('24px MalakyGalactic','24px GalacticSyllabics','24px Eyeclipse');
  return Promise.all([...urls.map(url=>image(url,priority)),...fonts.map(font=>document.fonts.load(font).catch(()=>{}))]);
 }
 function deeperAssets(id){
  if(id==='lore')return (window.loreChapters||[]).flatMap(c=>c.pages.flatMap(p=>(p.art||[]).map(a=>a.src)));
  if(id==='museum')return ['blanket.svg','demnate.svg','malakistos-statue.svg','lost-earring.svg'].map(n=>'museum-art/'+n);
  return [];
 }
 function warm(id,priority=0){
  const modal=document.getElementById(id);if(!modal)return Promise.resolve();
  // Queue the next interactions too, without making the scene wait for them.
  const ready=prepare(modal,priority);
  deeperAssets(id).forEach((url,i)=>image(url,priority>=10&&i===0?10:0));
  return ready;
 }
 window.windowAssets={
  get pending(){return !!pending;},image,prepare,warm,
  async show(modal){
   if(pending||document.querySelector('dialog[open]'))return false;
   const request={};pending=request;document.documentElement.classList.add('window-loading');
   try{
    await warm(modal.id,20);
    // The actual elements reuse the already downloaded and decoded artwork.
    await Promise.all([...modal.querySelectorAll('img[src]')].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));
    if(pending!==request||document.querySelector('dialog[open]'))return false;
    modal.showModal();modal.dispatchEvent(new Event('windowopened',{bubbles:true}));return true;
   }finally{if(pending===request){pending=null;document.documentElement.classList.remove('window-loading');}}
  }
 };
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&pending){pending=null;document.documentElement.classList.remove('window-loading');}});
 document.addEventListener('DOMContentLoaded',()=>{
  const ids=['disco','fortune','museum','on-this-day','cosmic-terminal','lore','prank-letter'];
  document.querySelectorAll('.star').forEach((star,i)=>{
   for(const type of ['pointerenter','focusin','pointerdown'])star.addEventListener(type,()=>warm(ids[i],15),{passive:true});
  });
  const final=document.querySelector('#final');for(const type of ['pointerenter','focusin'])final.addEventListener(type,()=>warm('last-letter',15));
 });
 // Essential sky/intro requests finish first. Warm the rest while the intro is read.
 window.addEventListener('load',()=>{
  setTimeout(async()=>{
   for(const id of ['disco','fortune','museum','on-this-day','cosmic-terminal','lore','prank-letter','milestone-gift','last-letter']){
    await warm(id);await new Promise(resolve=>setTimeout(resolve,60));
   }
  },1200);
 },{once:true});
})();
