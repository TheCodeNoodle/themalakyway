(() => {
 const modal=document.querySelector('#on-this-day');
 const pages=[...modal.querySelectorAll('.day-page')];
 const tabs=[...modal.querySelectorAll('.day-tab')];
 const previous=modal.querySelector('#day-previous'),next=modal.querySelector('#day-next');
 const counter=modal.querySelector('#day-counter'),scroll=modal.querySelector('.day-scroll');
 let page=0,opener;
 function showPage(index,focus=false){
  page=index;
  pages.forEach((el,i)=>{el.hidden=i!==page;});
  tabs.forEach((el,i)=>{el.setAttribute('aria-pressed',String(i===page));});
  previous.disabled=page===0;
  next.textContent=page===pages.length-1?'Back to the stars ↗':'Turn the page →';
  counter.textContent=`${String(page+1).padStart(2,'0')} / 03`;
  scroll.scrollTop=0;
  if(focus)pages[page].querySelector('h3').focus({preventScroll:true});
 }
 tabs.forEach((tab,i)=>tab.addEventListener('click',()=>showPage(i,true)));
 previous.addEventListener('click',()=>showPage(Math.max(0,page-1),true));
 next.addEventListener('click',()=>page===pages.length-1?modal.close():showPage(page+1,true));
 modal.querySelector('#day-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 window.onThisDay={open(source){
  if(document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;showPage(page);modal.showModal();modal.querySelector('#day-close').focus({preventScroll:true});
 }};
})();
