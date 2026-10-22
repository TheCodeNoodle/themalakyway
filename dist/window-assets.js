(() => {
 const cache=new Map();
 const common=['disco-art/closeButton.svg'];
 const extra={
  lore:['lore-art/paarthurnax.png'],
  disco:['disco-art/windowBackground.svg','disco-art/SubmitButton.svg','disco-art/pauseButton.svg',...Array.from({length:3},(_,i)=>`disco-art/heart-frame-${i}.png`)],
  fortune:['fortune-art/window-table.svg','disco-art/SubmitButton.svg'],
  'cosmic-terminal':['terminal-art/border.svg','terminal-art/chickette.svg','terminal-art/krobus.svg'],
  'milestone-gift':['intro-dialogue.svg','gift-art/mail-1.png','gift-art/mail-2.png']
 };
 let pending=null;
 function image(url){
  if(!url)return Promise.resolve();
  const key=new URL(url,document.baseURI).href;
  if(!cache.has(key)){
   const img=new Image();img.src=key;
   // Retain decoded images; failed files must not trap the visitor outside a window.
   cache.set(key,{img,ready:img.decode().catch(()=>{cache.delete(key);})});
  }
  return cache.get(key).ready;
 }
 function prepare(modal){
  const urls=[...common,...(extra[modal.id]||[])];
  modal.querySelectorAll('img[src],image[href]').forEach(img=>urls.push(img.currentSrc||img.getAttribute('src')||img.getAttribute('href')));
  const fonts=['24px VT323'];
  if(modal.id==='cosmic-terminal')fonts.push('24px MalakyGalactic','24px GalacticSyllabics','24px Eyeclipse');
  return Promise.all([...urls.map(image),...fonts.map(font=>document.fonts.load(font).catch(()=>{}))]);
 }
 window.windowAssets={
  get pending(){return !!pending;},prepare,
  async show(modal){
   if(pending||document.querySelector('dialog[open]'))return false;
   const request={};pending=request;
   document.documentElement.classList.add('window-loading');
   try{
    await prepare(modal);
    if(pending!==request||document.querySelector('dialog[open]'))return false;
    modal.showModal();return true;
   }finally{
    if(pending===request){pending=null;document.documentElement.classList.remove('window-loading');}
   }
  }
 };
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&pending){pending=null;document.documentElement.classList.remove('window-loading');}
 });
 // Warm the CSS-only frames during the introduction, before the first star opens.
 document.addEventListener('DOMContentLoaded',()=>{
  const warm=()=>document.querySelectorAll('dialog').forEach(prepare);
  if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:1500});else setTimeout(warm,300);
 });
})();
