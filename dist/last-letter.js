(() => {
 const modal=document.createElement('dialog');modal.id='last-letter';modal.setAttribute('aria-labelledby','letter-salutation');
 const paragraphs=[
  'You finally found all the stars, and now you are reading one last thing from me.',
  "I honestly don't know where to begin, I thought that a simple happy birthday message wasn't enough for you and especially for your 18th birthday, so I decided to make something a little different. I spent quite some time putting all of this together, and I had so much fun doing it. I hope you enjoyed it as much as I enjoyed making it.",
  "I find it a little funny how someone you meet behind a screen can become a part of your life. You suddenly became someone whose presence I look forward to, and someone that I'm genuinely grateful to have in my life.",
  "There's so much I'd like to tell you, but I never quite know how to put it into words. I just hope that somewhere between all the little details and the time I spent making this, you'll find a glimpse of how much you mean to me and how much I care about you.",
  'I hope life is kind to you, and that this new year brings you countless reasons to smile, and wonderful memories to look back on. You deserve so many beautiful things, and I hope you get to experience them.',
  "Selfishly enough, I would also love to be around for a lot of those moments too. I would love to see where life takes you, and hear about everything that happens along the way.",
  "Happy 18th birthday. I'm really really glad I met you. Thank you for being such a wonderful friend to me. May life bring you all the happiness you deserve."
 ];
 modal.innerHTML=`<button class="letter-close" type="button" aria-label="Close letter"><img loading="lazy" src="letter-close.svg" alt="" draggable="false"></button><article class="letter-paper"><div class="letter-scroll" tabindex="0" aria-label="Birthday letter"><h2 id="letter-salutation">Dear Malak</h2><div class="letter-paragraphs"></div><p class="letter-dedication">To Malakistos, the friend that I love most &lt;3</p><p class="letter-signature">- Mohamed</p></div></article>`;
 for(const text of paragraphs){const p=document.createElement('p');p.textContent=text;modal.querySelector('.letter-paragraphs').append(p);}
 document.body.append(modal);
 const music=document.createElement('audio');music.src='audio/letter-music-box.mp3';music.loop=true;music.preload='none';modal.append(music);window.sceneAudio.registerMusic(modal,music);
 let opener;
 modal.querySelector('.letter-close').onclick=()=>modal.close();
 modal.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 window.lastLetter={async open(source){
  if(window.windowAssets.pending||document.querySelector('dialog[open]')||document.documentElement.classList.contains('intro-active'))return;
  opener=source;modal.querySelector('.letter-scroll').scrollTop=0;
  if(!await window.windowAssets.show(modal))return;
  modal.querySelector('.letter-close').focus({preventScroll:true});
 }};
})();
