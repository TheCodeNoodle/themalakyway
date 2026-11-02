(() => {
 const selector='.letter-scroll,.lore-reading,.day-scroll,#terminal-log,#disco-levels,#disco-suggestions,#disco-finale';
 const entries=new Map();let frame=0,drag=null,nextId=0;
 const resize=new ResizeObserver(schedule);
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 function update(){
  frame=0;
  document.querySelectorAll(selector).forEach(source=>{
   if(source.closest('.lore-flip-snapshot')||entries.has(source))return;
   const host=source.closest('dialog');if(!host)return;
   source.classList.add('pixel-scroll-source');
   const bar=document.createElement('div'),thumb=document.createElement('div');bar.className='pixel-scrollbar';thumb.className='pixel-scroll-thumb';bar.append(thumb);bar.tabIndex=0;bar.setAttribute('role','scrollbar');bar.setAttribute('aria-orientation','vertical');bar.setAttribute('aria-label','Scroll '+(source.getAttribute('aria-label')||'content'));
   if(!source.id)source.id='pixel-scroll-region-'+nextId++;
   bar.setAttribute('aria-controls',source.id);host.append(bar);const entry={source,host,bar,thumb};entries.set(source,entry);resize.observe(source);source.addEventListener('scroll',schedule,{passive:true});
   bar.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;event.preventDefault();event.stopPropagation();
    const rect=bar.getBoundingClientRect(),thumbRect=thumb.getBoundingClientRect(),onThumb=event.clientY>=thumbRect.top&&event.clientY<=thumbRect.bottom;
    if(!onThumb)source.scrollTop=(event.clientY-rect.top-thumbRect.height/2)/Math.max(1,rect.height-thumbRect.height)*(source.scrollHeight-source.clientHeight);
    drag={entry,y:event.clientY,scroll:source.scrollTop};bar.setPointerCapture(event.pointerId);document.documentElement.classList.add('pixel-scroll-dragging');schedule();
   });
   bar.addEventListener('pointermove',event=>{if(drag?.entry!==entry)return;source.scrollTop=drag.scroll+(event.clientY-drag.y)/Math.max(1,bar.clientHeight-thumb.offsetHeight)*(source.scrollHeight-source.clientHeight);schedule();});
   const release=()=>{if(drag?.entry===entry){drag=null;document.documentElement.classList.remove('pixel-scroll-dragging');}};
   ['pointerup','pointercancel','lostpointercapture'].forEach(type=>bar.addEventListener(type,release));
   bar.addEventListener('click',event=>event.stopPropagation());
   bar.addEventListener('wheel',event=>{const unit=event.deltaMode===1?20:event.deltaMode===2?source.clientHeight:1;source.scrollTop+=event.deltaY*unit;event.preventDefault();},{passive:false});
   bar.addEventListener('keydown',event=>{let value;const max=source.scrollHeight-source.clientHeight;
    if(event.key==='ArrowDown')value=source.scrollTop+40;if(event.key==='ArrowUp')value=source.scrollTop-40;
    if(event.key==='PageDown')value=source.scrollTop+source.clientHeight*.85;if(event.key==='PageUp')value=source.scrollTop-source.clientHeight*.85;
    if(event.key==='Home')value=0;if(event.key==='End')value=max;
    if(value!==undefined){event.preventDefault();event.stopPropagation();source.scrollTop=value;schedule();}
   });
  });
  for(const [source,entry] of entries){
   const {host,bar,thumb}=entry;
   if(!source.isConnected){resize.unobserve(source);bar.remove();entries.delete(source);continue;}
   const max=source.scrollHeight-source.clientHeight,rect=source.getBoundingClientRect(),parent=host.getBoundingClientRect();
   bar.hidden=!host.open||!source.checkVisibility({visibilityProperty:true})||(host.id==='lore'&&!host.querySelector('.lore-cover').hidden)||rect.height<1||max<2;
   if(bar.hidden){if(drag?.entry===entry){drag=null;document.documentElement.classList.remove('pixel-scroll-dragging');}continue;}
   const height=source.clientHeight,thumbHeight=Math.min(height,Math.max(24,height*height/source.scrollHeight));
   bar.style.left=(rect.right-parent.left-host.clientLeft-11)+'px';bar.style.top=(rect.top-parent.top-host.clientTop)+'px';bar.style.height=height+'px';
   thumb.style.height=thumbHeight+'px';thumb.style.transform=`translateY(${Math.max(0,source.scrollTop)/max*Math.max(0,height-thumbHeight-2)}px)`;
   bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(Math.round(max)));bar.setAttribute('aria-valuenow',String(Math.round(source.scrollTop)));
  }
 }
 new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('.pixel-scrollbar')))schedule();}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['open','hidden','class']});
 document.addEventListener('animationend',schedule,true);window.addEventListener('resize',schedule);document.addEventListener('scroll',schedule,true);document.addEventListener('close',schedule,true);schedule();
})();
