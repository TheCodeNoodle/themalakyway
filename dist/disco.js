(() => {
 const tracks=[
  ['Margaret','Lana Del Rey feat. Bleachers'],['All the Stars','Kendrick Lamar & SZA'],
  ['Lover Girl','Laufey'],['Army Dreamers','Kate Bush'],['K.','Cigarettes After Sex'],
  ['Indigo Night','Tamino'],['Smooth Operator','Sade'],['The Night We Met','Lord Huron'],
  ['Orange-coloured day','liana flores'],['Salvatore','Lana Del Rey']
 ].map(([title,artist],i)=>({title,artist,src:`music/track-${String(i+1).padStart(2,'0')}.mp3`}));
 const modal=document.querySelector('#disco');
 const $=s=>modal.querySelector(s);
 const audio=$('audio'),input=$('#disco-answer'),suggestions=$('#disco-suggestions');
 const play=$('#disco-play'),seek=$('#disco-seek'),feedback=$('#disco-feedback');
 const bars=[...modal.querySelectorAll('.disco-equalizer i')];
 let analyser,frequencyData,visualFrame=0,lastVisualTime=0,roundRequest=0;
 function stopVisualizer(){
  cancelAnimationFrame(visualFrame);visualFrame=0;
  bars.forEach(bar=>bar.style.transform='scaleY(.06)');
 }
 function drawVisualizer(now){
  if(audio.paused||audio.ended||!modal.open||document.hidden||!analyser){stopVisualizer();return;}
  if(now-lastVisualTime>=33){
   lastVisualTime=now;analyser.getByteFrequencyData(frequencyData);
   const nyquist=analyser.context.sampleRate/2;
   bars.forEach((bar,i)=>{
    const low=60*Math.pow(200,i/bars.length),high=60*Math.pow(200,(i+1)/bars.length);
    const start=Math.max(1,Math.floor(low/nyquist*frequencyData.length));
    const end=Math.min(frequencyData.length,Math.max(start+1,Math.ceil(high/nyquist*frequencyData.length)));
    let energy=0;for(let bin=start;bin<end;bin++)energy+=Math.pow(frequencyData[bin]/255,2);
    const level=Math.sqrt(energy/Math.max(1,end-start));
    bar.style.transform=`scaleY(${Math.max(.06,Math.round(level*16)/16)})`;
   });
  }
  visualFrame=requestAnimationFrame(drawVisualizer);
 }
 function startVisualizer(){cancelAnimationFrame(visualFrame);visualFrame=requestAnimationFrame(drawVisualizer);}
 audio.addEventListener('play',startVisualizer);
 audio.addEventListener('pause',stopVisualizer);
 audio.addEventListener('ended',stopVisualizer);
 let round=0,mistakes=0,resolved=false,finished=false,opener,transitionTimer;
 let selected=-1,matches=[],results=[],guesses=new Set();
 const normalize=s=>String(s ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/coloured/g,'colored').replace(/[^a-z0-9]/g,'');
 function distance(a,b){
  let row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){let next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]!==b[j-1]));row=next;}
  return row[b.length];
 }
 const catalog=[...(window.discoSongCatalog||[]),...tracks].filter((song,i,all)=>all.findIndex(s=>normalize(s.title)===normalize(song.title)&&normalize(s.artist)===normalize(song.artist))===i).map(s=>({...s,key:normalize(s.title),artistKey:normalize(s.artist)}));
 function hideSuggestions(){suggestions.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');selected=-1;}
 function choose(i){if(!matches[i])return;input.value=matches[i].title;hideSuggestions();input.focus();}
 function filter(){
  selected=-1;input.removeAttribute('aria-activedescendant');
  const query=normalize(input.value);
  if(!query||resolved){hideSuggestions();return;}
  matches=catalog.map(s=>({song:s,rank:s.key===query?0:s.key.startsWith(query)?1:s.key.includes(query)?2:s.artistKey.includes(query)?3:query.length>=3&&distance(query,s.key.slice(0,Math.max(query.length,Math.min(s.key.length,query.length+1))))<=Math.min(2,Math.floor(query.length/3))?4:99})).filter(s=>s.rank<99).sort((a,b)=>a.rank-b.rank||a.song.key.localeCompare(b.song.key)||a.song.artistKey.localeCompare(b.song.artistKey)).slice(0,6).map(s=>s.song);
  suggestions.replaceChildren();
  for(const [i,song] of matches.entries()){
   const option=document.createElement('li');option.id=`disco-option-${i}`;option.setAttribute('role','option');option.setAttribute('aria-selected','false');
   const title=document.createElement('span'),artist=document.createElement('small');title.textContent=song.title;artist.textContent=song.artist;option.append(title,artist);
   option.addEventListener('pointerdown',e=>e.preventDefault());option.addEventListener('click',()=>choose(i));suggestions.append(option);
  }
  suggestions.hidden=!matches.length;input.setAttribute('aria-expanded',String(!!matches.length));
 }
 input.addEventListener('input',filter);
 input.addEventListener('focus',filter);
 input.addEventListener('change',filter);
 input.addEventListener('blur',hideSuggestions);
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!suggestions.hidden){e.preventDefault();e.stopPropagation();hideSuggestions();return;}
  if(suggestions.hidden)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   e.preventDefault();selected=(selected+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;
   [...suggestions.children].forEach((el,i)=>el.setAttribute('aria-selected',String(i===selected)));
   input.setAttribute('aria-activedescendant',`disco-option-${selected}`);
   suggestions.children[selected].scrollIntoView({block:'nearest'});
  }else if(e.key==='Enter'&&selected>=0){e.preventDefault();choose(selected);}
 });
 function updatePlayback(){
  const time=Math.min(15,audio.currentTime||0);seek.value=time;
  seek.style.setProperty('--played',`${time/15*100}%`);
  $('#disco-time').textContent=`0:${String(Math.floor(time)).padStart(2,'0')} / 0:15`;
  const playing=!audio.paused&&!audio.ended;
  modal.classList.toggle('is-playing',playing);play.setAttribute('aria-label',playing?'Pause snippet':'Play snippet');play.setAttribute('aria-pressed',String(playing));
  play.querySelector('img').src=playing?'disco-art/pauseButton.svg':'disco-art/playButton.svg';
 }
 for(const event of ['timeupdate','play','pause','ended','loadedmetadata'])audio.addEventListener(event,updatePlayback);
 audio.addEventListener('error',()=>{feedback.textContent='The clip could not load. Close and reopen Disco to retry.';});
 play.addEventListener('click',async()=>{
  if(!audio.paused){window.sceneAudio.fadeOut(audio);return;}
  if(audio.ended||audio.currentTime>=14.99)audio.currentTime=0;
  try{
   analyser=await window.sceneAudio.analyserFor(audio).catch(()=>null);
   if(analyser&&!frequencyData)frequencyData=new Uint8Array(analyser.frequencyBinCount);
   if(!modal.open||document.hidden)return;
   if(!await window.sceneAudio.playMedia(audio))feedback.textContent='Press play again to start the snippet.';
  }catch{feedback.textContent='Press play again to start the snippet.';}
 });
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(+seek.value,Math.max(0,audio.duration-.02));updatePlayback();});
 const heartTimers=new Map();
 const heartFrames=[0,1,2].map(i=>`disco-art/heart-frame-${i}.png`);
 heartFrames.forEach(src=>{const image=new Image();image.src=src;});
 function hearts(){
  $('#disco-hearts').setAttribute('aria-label',`${3-mistakes} of 3 chances left`);
  [...$('#disco-hearts').children].forEach((heart,i)=>{
   const lost=i>=3-mistakes,img=heart.querySelector('img');
   if(!lost){
    clearTimeout(heartTimers.get(heart));heartTimers.delete(heart);
    heart.classList.remove('lost');img.src=heartFrames[0];
   }else if(!heart.classList.contains('lost')){
    heart.classList.add('lost');img.src=heartFrames[1];
    heartTimers.set(heart,setTimeout(()=>{img.src=heartFrames[2];heartTimers.delete(heart);},100));
   }
  });
 }
 async function loadRound(){
  const request=++roundRequest;
  clearTimeout(transitionTimer);resolved=false;mistakes=0;guesses.clear();modal.classList.remove('is-resolved');
  play.disabled=true;
  input.disabled=false;input.value='';$('#disco-submit').disabled=false;$('#disco-next').hidden=true;
  feedback.textContent='';feedback.className='disco-feedback';hideSuggestions();hearts();
  $('#disco-round').textContent=`TRACK ${String(round+1).padStart(2,'0')} / 10`;
  await window.sceneAudio.fadeOut(audio);
  if(request!==roundRequest)return;
  audio.src=tracks[round].src;audio.load();updatePlayback();play.disabled=false;
  if(modal.open)input.focus({preventScroll:true});
 }
 function next(){
  clearTimeout(transitionTimer);
  if(!resolved)return;
  if(round===tracks.length-1){showPlaylist();return;}
  round++;loadRound();
 }
 function resolve(correct){
  resolved=true;modal.classList.add('is-resolved');window.sceneAudio.fadeOut(audio);hideSuggestions();input.disabled=true;$('#disco-submit').disabled=true;
  results[round]=correct;feedback.classList.add(correct?'correct':'revealed');
  feedback.textContent=`${correct?'You got it!':'This one was'} ${tracks[round].title} — ${tracks[round].artist}`;
  $('#disco-next').textContent=round===9?'See your playlist ▸':'Next song ▸';$('#disco-next').hidden=false;
  $('#disco-next').focus({preventScroll:true});
  // Leave enough time to read the revealed title before automatically moving on.
  if(!correct)transitionTimer=setTimeout(()=>{if(modal.open)next();},4500);
 }
 $('#disco-form').addEventListener('submit',e=>{
  e.preventDefault();if(resolved)return;
  const guess=normalize(input.value),answer=normalize(tracks[round].title);
  if(!guess){feedback.textContent='Type a song name first.';input.focus();return;}
  if(guesses.has(guess)){feedback.textContent='You already tried that one. Try another name.';return;}
  guesses.add(guess);
  if(guess===answer||(answer.length>=5&&distance(guess,answer)<= (answer.length>=10?2:1))){resolve(true);return;}
  mistakes++;hearts();hideSuggestions();
  if(mistakes===3){resolve(false);return;}
  feedback.textContent=`Not quite. ${3-mistakes} ${3-mistakes===1?'chance':'chances'} left — listen again.`;
  input.select();
 });
 $('#disco-next').addEventListener('click',next);
 function showPlaylist(){
  finished=true;modal.classList.add('is-finale');window.sceneAudio.fadeOut(audio);hideSuggestions();$('#disco-game').hidden=true;$('#disco-finale').hidden=false;
  $('#disco-score').textContent=`${results.filter(Boolean).length} / 10 songs found. A whole playlist for you.`;
  const list=$('#disco-playlist');list.replaceChildren();
  tracks.forEach((track,i)=>{
   const row=document.createElement('li'),initial=document.createElement('b'),details=document.createElement('span'),title=document.createElement('span'),artist=document.createElement('small');
   initial.textContent=track.title[0];initial.className='disco-initial';initial.setAttribute('aria-hidden','true');
   title.textContent=track.title;artist.textContent=track.artist;details.append(title,artist);row.append(initial,details);list.append(row);
  });
  $('#disco-finale h3').focus({preventScroll:true});
 }
 $('#disco-replay').addEventListener('click',()=>{round=0;results=[];finished=false;modal.classList.remove('is-finale');$('#disco-game').hidden=false;$('#disco-finale').hidden=true;loadRound();});
 $('#disco-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('close',()=>{window.sceneAudio.fadeOut(audio);stopVisualizer();clearTimeout(transitionTimer);hideSuggestions();opener?.focus({preventScroll:true});});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){window.sceneAudio.stopMedia(audio);stopVisualizer();clearTimeout(transitionTimer);}});
 window.disco={open(source){
  if(document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;modal.showModal();
  if(!audio.getAttribute('src')&&!finished)loadRound();
  else if(!finished&&!resolved)input.focus({preventScroll:true});
  else if(!finished)$('#disco-next').focus({preventScroll:true});
 }};
})();
