(() => {
 const modal=document.createElement('dialog');
 modal.id='cosmic-terminal';modal.className='terminal-window';modal.setAttribute('aria-labelledby','terminal-title');
 modal.innerHTML=`<div class="terminal-case">
  <div class="terminal-top"><span id="terminal-title">TERMINAL / DEEP SPACE RECEIVER</span><button id="terminal-close" aria-label="Close terminal">×</button></div>
  <div class="terminal-screen">
   <div class="terminal-status"><span><i></i> SIGNAL ONLINE</span><span id="terminal-channel">CH 00 / STANDBY</span></div>
   <div class="terminal-grid">
    <section class="terminal-feed"><div class="terminal-heading">INCOMING<span>TRANSMISSIONS</span></div><div id="terminal-log" tabindex="0" aria-label="Transmission history"></div></section>
    <aside class="terminal-contact"><div class="terminal-portrait" id="terminal-portrait"><span class="terminal-radar" aria-hidden="true"></span><img id="terminal-avatar" alt="" hidden></div><span class="terminal-small">CONNECTED TO</span><strong id="terminal-caller">UNKNOWN</strong><span id="terminal-origin">Searching the stars...</span><div class="terminal-signal" aria-hidden="true">▂ ▄ ▆ █ ▆ ▄ ▂</div><span id="terminal-queue">02 SIGNALS WAITING</span></aside>
   </div>
   <div class="terminal-controls"><div id="terminal-options" aria-label="Available replies"></div><form id="terminal-form"><label for="terminal-command">C:\\COSMOS&gt;</label><input id="terminal-command" type="text" autocomplete="off" spellcheck="false" maxlength="80" aria-label="Terminal command"><button type="submit" aria-label="Send command">↵</button></form><p id="terminal-hint"></p></div>
   <span class="terminal-sr" id="terminal-announcement" role="status" aria-live="polite"></span>
  </div><div class="terminal-bottom"><span>THE MALAKY WAY</span><span class="terminal-vents" aria-hidden="true"></span><span><i></i> POWER</span></div>
 </div>`;
 document.body.append(modal);
 const $=s=>modal.querySelector(s),log=$('#terminal-log'),input=$('#terminal-command'),options=$('#terminal-options'),hint=$('#terminal-hint');
 let opener,state='idle',caller='',queue=[],afterSequence=null,timer=null,typing=null,planet='Earth',begun=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function scroll(){log.scrollTop=log.scrollHeight;}
 new ResizeObserver(()=>{if(modal.open)scroll();}).observe(log);
 function line(text,kind='system',speaker=''){
  const row=document.createElement('p');row.className=`terminal-line ${kind}`;
  if(speaker){const name=document.createElement('b');name.textContent=speaker+' > ';row.append(name);}
  const body=document.createElement('span');body.textContent=text;row.append(body);log.append(row);scroll();return body;
 }
 function choices(items,placeholder,help){
  options.replaceChildren();for(const [label,value] of items){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>command(value));options.append(button);}
  input.placeholder=placeholder;hint.textContent=help;
 }
 function finishTyping(){
  if(!typing)return;clearTimeout(timer);timer=null;typing.body.textContent=typing.text;
  $('#terminal-announcement').textContent=typing.alien?'Krobus speaks in an unknown language.':`${caller}: ${typing.text}`;
  typing=null;window.sceneAudio?.passageEnd();scroll();
  choices([['Continue ↵','next']],'Press Enter to continue','Click Continue or press Enter.');
 }
 function next(){
  if(typing){finishTyping();return;}
  if(!queue.length){const callback=afterSequence;afterSequence=null;callback?.();return;}
  const item=queue.shift(),alien=!!item.alien;
  const alphabet={a:'ᔑ',e:'ᒷ',f:'⎓',h:'⍑',i:'╎',l:'ꖎ',m:'ᒲ',n:'リ',o:'𝙹',r:'∷',s:'ᓭ',t:'ℸ̣',u:'⚍',w:'∴',y:'||'};
  const text=alien?Array.from(item.text,c=>alphabet[c]||c).join(''):item;
  const body=line('',alien?'alien':'speech',caller);
  if(alien){body.classList.add('terminal-galactic');body.setAttribute('aria-label','Unknown alien transmission');}
  choices([['Show message','next']],'Press Enter to reveal','Receiving transmission...');
  typing={body,text,alien};let index=0;const characters=Array.from(text);
  const tick=()=>{if(!typing||!modal.open)return;body.textContent=characters.slice(0,++index).join('');if(/\S/.test(characters[index-1]))window.sceneAudio?.letter();scroll();if(index>=characters.length)finishTyping();else timer=setTimeout(tick,26);};
  if(reduced.matches)finishTyping();else tick();
 }
 function say(lines,done){state='talk';queue=[...lines];afterSequence=done;next();}
 function contact(name,asset,origin,channel){
  caller=name;$('#terminal-caller').textContent=name.toUpperCase();$('#terminal-origin').textContent=origin;
  $('#terminal-avatar').src=`terminal-art/${asset}.svg`;$('#terminal-avatar').alt=name;$('#terminal-avatar').hidden=false;
  $('.terminal-radar').hidden=true;$('#terminal-channel').textContent=channel;modal.dataset.caller=asset;
 }
 function standby(second=false){
  state=second?'waiting-krobus':'idle';line(second?'[TRANSMISSION ENDED] — Another signal is waiting.':'Receiver ready. Two signals are waiting for you.');
  $('#terminal-channel').textContent='CH 00 / STANDBY';$('#terminal-caller').textContent='UNKNOWN';$('#terminal-origin').textContent='Searching the stars...';$('#terminal-avatar').hidden=true;$('.terminal-radar').hidden=false;
  $('#terminal-queue').textContent=second?'01 SIGNAL WAITING':'02 SIGNALS WAITING';
  choices([['Receive transmission','receive']],'Type receive','Type RECEIVE and press Enter, or use the button above.');
 }
 function chickette(){
  contact('Chickette','chickette','A very important caller','CH 01 / CONNECTED');
  say(['Hilo?','dis bawkday heuman?'],()=>{state='chicken-answer';choices([['Yes','yes'],['No','no']],'yes / no','Type YES or NO.');});
 }
 function krobus(){
  contact('Krobus','krobus','Origin unknown · translator offline','CH 02 / CONNECTED');
  say([{text:'hello... are you there?',alien:true},{text:'are you from this!',alien:true}],()=>{
   state='planet';line('What planet are you from?','system','SYSTEM');line('[SELECT YOUR PLANET]');
   $('#terminal-announcement').textContent='System: What planet are you from? Select your planet to calibrate the translator.';
   choices([['◉ Earth','earth'],['◉ Mars','mars'],['✦ Somewhere else...','somewhere else']],'earth / mars / somewhere else','Choose your planet to calibrate the translator.');
  });
 }
 function selectPlanet(value){
  planet=value;$('#terminal-origin').textContent=`Translator online · ${planet}`;
  line(`[TRANSLATOR CALIBRATED: ${planet.toUpperCase()}]`);
  const greetings={Earth:[{text:'earth...',alien:true},'Ah! Earth! I know that planet.',"Well... I've heard of it. I've never actually been there."],Mars:[{text:'mars...',alien:true},'Mars? The red one?','I hear it is very quiet there. That sounds rather nice.',"I hope you brought a warm coat. Space can be terribly cold."],'Somewhere else':[{text:'somewhere else...',alien:true},'Somewhere else... That is a very mysterious address.',"You don't have to tell me. I like having a secret place, too."]};
  say([...greetings[planet],'My name is Krobus. I live underground, far away from the sunlight.','Humans are a little frightening, but you seem nice.',"I heard that humans celebrate the day they were born. Is that what you're doing today?"],()=>{
   state='birthday';choices([['Yes','yes'],['Not today','no']],'yes / no','Type your reply and press Enter.');
  });
 }
 function complete(){
  state='ended';line('[TRANSMISSION ENDED]');$('#terminal-channel').textContent='CH 02 / DISCONNECTED';$('#terminal-queue').textContent='ALL SIGNALS RECEIVED';
  choices([['Receive again','replay'],['Back to the stars','exit']],'replay / exit','All messages received. Until the next signal.');
 }
 function command(raw){
  const value=raw.trim().toLowerCase().replace(/[.!?]+$/,'');input.value='';
  if(state==='talk'){if(!value||['next','continue'].includes(value))next();else hint.textContent='Press Enter or Continue to read the transmission.';return;}
  if(!value)return;
  if(value==='help'){hint.textContent='Use one of the replies above, or type it here. Commands ignore uppercase and lowercase.';return;}
  if(value==='exit'){modal.close();return;}
  const yes=['yes','y','yeah','yep'].includes(value),no=['no','n','nope','not today'].includes(value);
  if((state==='idle'||state==='waiting-krobus')&&['receive','answer','accept'].includes(value)){line('receive','reply','YOU');window.sceneAudio?.start();state==='idle'?chickette():krobus();return;}
  if(state==='chicken-answer'&&(yes||no)){line(yes?'yes':'no','reply','YOU');say([yes?'Happy bawkday <3':'sori.'],()=>standby(true));return;}
  if(state==='planet'){
   const selected={earth:'Earth','1':'Earth',mars:'Mars','2':'Mars','somewhere else':'Somewhere else',else:'Somewhere else',other:'Somewhere else','3':'Somewhere else'}[value];
   if(selected){line(selected,'reply','YOU');selectPlanet(selected);return;}
  }
  if(state==='birthday'&&(yes||no)){
   line(yes?'Yes.':'Not today.','reply','YOU');
   say([...(yes?['Then... happy birthday!']:['Oh... Then I am a little early. Or a little late.',"Please keep my birthday wish for when you need it."]), 'I hope your next trip around the sun is a good one.','And if you ever visit the stars, please bring me something interesting.','Goodbye, human.'],complete);return;
  }
  if(state==='ended'&&['replay','receive'].includes(value)){log.replaceChildren();standby();return;}
  hint.textContent='Signal not understood. Choose a reply above, or type HELP.';
 }
 $('#terminal-form').addEventListener('submit',event=>{event.preventDefault();command(input.value);});
 $('#terminal-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('close',()=>{finishTyping();window.sceneAudio?.stopLetters();opener?.focus({preventScroll:true});});
 window.cosmicTerminal={async open(source){
  if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;if(!await window.windowAssets.show(modal))return;if(!begun){standby();begun=true;}input.focus({preventScroll:true});
 }};
})();
