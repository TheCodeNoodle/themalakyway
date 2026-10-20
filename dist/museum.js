(() => {
 const exhibits={
  blanket:{title:"Malakistos' Blanket",image:'blanket.svg',width:'76%'},
  demnate:{title:'Imi-n-Ifri, Demnate',image:'demnate.svg',width:'96%'},
  statue:{title:'Malakistos the Great',image:'malakistos-statue.svg',width:'55%'},
  earring:{title:'The Lost Earring — 22 April 2025',image:'lost-earring.svg',width:'50%'}
 };
 const modal=document.querySelector('#museum'),gallery=document.querySelector('#museum-gallery');
 const detail=document.querySelector('#museum-detail'),art=document.querySelector('#museum-artwork');
 const title=document.querySelector('#museum-item-title'),label=document.querySelector('#museum-hover-label');
 const close=document.querySelector('#museum-close');
 let opener,selected,viewRequest=0;
 const discovered=new Set();
 for(const item of Object.values(exhibits)){const img=new Image();img.src=`museum-art/${item.image}`;}
 async function showExhibit(button){
  const exhibit=exhibits[button.dataset.exhibit],request=++viewRequest;
  art.src=`museum-art/${exhibit.image}`;art.alt=exhibit.title;art.style.width=exhibit.width;
  await art.decode().catch(()=>{});
  if(request!==viewRequest||!modal.open)return;
  selected=button;
  discovered.add(button.dataset.exhibit);
  button.setAttribute('aria-label',exhibit.title);
  label.textContent=exhibit.title;
  title.textContent=exhibit.title;detail.hidden=false;gallery.inert=true;gallery.setAttribute('aria-hidden','true');
  modal.classList.add('is-viewing');close.setAttribute('aria-label','Close enlarged exhibit');
  modal.setAttribute('aria-labelledby','museum-item-title');title.focus({preventScroll:true});
 }
 function returnToGallery(){
  detail.hidden=true;gallery.inert=false;gallery.removeAttribute('aria-hidden');modal.classList.remove('is-viewing');
  close.setAttribute('aria-label','Close Museum');modal.setAttribute('aria-labelledby','museum-title');
  selected?.focus({preventScroll:true});
 }
 document.querySelectorAll('.museum-exhibit').forEach(button=>{
  const exhibit=exhibits[button.dataset.exhibit];button.setAttribute('aria-label','???');
  const showLabel=()=>{label.textContent=discovered.has(button.dataset.exhibit)?exhibit.title:'???';label.classList.add('visible');};
  const hideLabel=()=>label.classList.remove('visible');
  button.addEventListener('pointerenter',showLabel);button.addEventListener('pointerleave',hideLabel);
  button.addEventListener('focus',showLabel);button.addEventListener('blur',hideLabel);
  button.addEventListener('click',()=>showExhibit(button));
 });
 close.addEventListener('click',()=>{if(detail.hidden)modal.close();else returnToGallery();});
 modal.addEventListener('cancel',e=>{if(!detail.hidden){e.preventDefault();returnToGallery();}});
 modal.addEventListener('close',()=>{viewRequest++;detail.hidden=true;gallery.inert=false;gallery.removeAttribute('aria-hidden');opener?.focus({preventScroll:true});});
 window.museum={async open(source){
  if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;selected=null;detail.hidden=true;label.classList.remove('visible');modal.classList.remove('is-viewing');
  gallery.inert=false;gallery.removeAttribute('aria-hidden');modal.setAttribute('aria-labelledby','museum-title');close.setAttribute('aria-label','Close Museum');
  if(!await window.windowAssets.show(modal))return;close.focus({preventScroll:true});
 }};
})();
