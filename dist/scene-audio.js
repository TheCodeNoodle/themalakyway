(() => {
 const music=document.querySelector('#background-music');
 const toggle=document.querySelector('#music-toggle');
 ['music-on.svg','music-off.svg'].forEach(src=>{const image=new Image();image.src=src;});
 const disco=document.querySelector('#disco');
 const fortune=document.querySelector('#fortune');
 const wizardMusic=document.querySelector('#fortune-music');
 const museum=document.querySelector('#museum');
 const museumMusic=document.querySelector('#museum-music');
 const day=document.querySelector('#on-this-day');
 const dayMusic=document.querySelector('#day-music');
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 let context,unlocked=false,muted=false;
 const buffers={},voices=new Set();
 // Embedded WAV data keeps sound effects working when index.html is opened offline.
 const ready=(async()=>{
  if(!AudioContextClass)return;
  context=new AudioContextClass();
  await Promise.all(Object.entries(window.dialogueAudioData).map(async([name,data])=>{
   const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
   buffers[name]=await context.decodeAudioData(bytes.buffer);
  }));
 })().catch(()=>{});
 const extraScenes=[];
 const tracks=[music,wizardMusic,museumMusic,dayMusic];
 tracks.forEach(track=>track.volume=0);
 const fades=new Map(),analysers=new WeakMap();
 // Each media element owns one cancellable ramp, including during rapid window changes.
 function fadeMedia(track,target,duration=650){
  const previous=fades.get(track);
  if(previous?.target===target)return previous.promise;
  if(previous){cancelAnimationFrame(previous.frame);previous.resolve(false);fades.delete(track);}
  if(target===0&&track.paused){track.volume=0;return Promise.resolve(true);}
  let resolve;
  const promise=new Promise(done=>resolve=done),job={target,promise,resolve,frame:0};
  fades.set(track,job);
  async function run(){
   if(target>0&&track.paused){
    track.volume=0;
    try{await track.play();}catch{if(fades.get(track)===job)fades.delete(track);resolve(false);return;}
   }
   if(fades.get(track)!==job)return;
   const from=track.volume,start=performance.now();
   function step(now){
    if(fades.get(track)!==job)return;
    const progress=duration<=0?1:Math.min(1,(now-start)/duration);
    const eased=progress*progress*(3-2*progress);
    track.volume=Math.max(0,Math.min(1,from+(target-from)*eased));
    if(progress<1){job.frame=requestAnimationFrame(step);return;}
    if(target===0)track.pause();
    fades.delete(track);resolve(true);
   }
   step(start);
  }
  run();return promise;
 }
 function stopMedia(track){
  const job=fades.get(track);
  if(job){cancelAnimationFrame(job.frame);job.resolve(false);fades.delete(track);}
  track.pause();track.volume=0;
 }
 async function analyserFor(track){
  // file:// media routing is blocked by some browsers; leave its playback intact.
  if(!context||location.protocol==='file:')return null;
  await context.resume();
  if(!analysers.has(track)){
   const source=context.createMediaElementSource(track),analyser=context.createAnalyser();
   analyser.fftSize=1024;analyser.smoothingTimeConstant=.78;
   source.connect(analyser);analyser.connect(context.destination);
   analysers.set(track,analyser);
  }
  return analysers.get(track);
 }
 function syncMusic(){
  const active=extraScenes.find(scene=>scene.modal.open)?.track || (day.open?dayMusic:museum.open?museumMusic:fortune.open?wizardMusic:music);
  if(document.hidden||!unlocked){tracks.forEach(stopMedia);return;}
  for(const track of tracks)fadeMedia(track,(track===active&&!muted&&!disco.open) ? .22 : 0);
 }
 function stopLetters(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
 function effect(name){
  if(!unlocked||document.hidden||!context||context.state!=='running'||!buffers[name])return;
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buffers[name];gain.gain.value=name==='letter'?.22:.38;
  source.connect(gain);gain.connect(context.destination);
  if(name==='letter'){
   if(voices.size>=8){const oldest=voices.values().next().value;oldest.stop();voices.delete(oldest);}
   voices.add(source);
  }
  source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
  source.start();
 }
 window.sceneAudio={
  registerMusic(modal,track){
   track.volume=0;tracks.push(track);extraScenes.push({modal,track});
   new MutationObserver(syncMusic).observe(modal,{attributes:true,attributeFilter:['open']});
  },
  fadeOut:(track,duration=300)=>fadeMedia(track,0,duration),
  playMedia:(track,duration=300)=>fadeMedia(track,1,duration),
  stopMedia,analyserFor,
  async start(){unlocked=true;const resumed=context?.resume().catch(()=>{});syncMusic();await Promise.all([ready,resumed]);},
  letter(){effect('letter');},
  passageEnd(){stopLetters();effect('close');},
  camera(){stopLetters();effect('camera');},
  stopLetters
 };
 toggle.addEventListener('click',()=>{
  muted=!muted;toggle.querySelector('img').src=muted?'music-off.svg':'music-on.svg';
  toggle.title=muted?'Turn music on':'Turn music off';
  toggle.setAttribute('aria-pressed',String(!muted));syncMusic();
 });
 new MutationObserver(syncMusic).observe(disco,{attributes:true,attributeFilter:['open']});
 new MutationObserver(syncMusic).observe(fortune,{attributes:true,attributeFilter:['open']});
 new MutationObserver(syncMusic).observe(museum,{attributes:true,attributeFilter:['open']});
 new MutationObserver(syncMusic).observe(day,{attributes:true,attributeFilter:['open']});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){stopLetters();context?.suspend().catch(()=>{});}
  else if(unlocked)context?.resume().catch(()=>{});
  syncMusic();
 });
})();
