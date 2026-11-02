// Run from the project folder: node tools/check-lore.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../dist'),errors=[];
try{
 const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'lore-content.js'),'utf8'),scope,{timeout:1000});
 const {loreSettings:settings,loreChapters:chapters}=scope.window;
 function check(ok,message){if(!ok)errors.push(message)}
 function asset(src,label){check(typeof src==='string'&&src.length>0,label+' needs a file path');if(typeof src==='string')check(fs.existsSync(path.resolve(root,src)),label+': file not found: '+src)}
 check(settings&&Array.isArray(settings.coverTitle)&&settings.coverTitle.length===2&&settings.coverTitle.every(s=>typeof s==='string'),'coverTitle must contain two quoted lines');
 for(const key of ['subtitle','kicker','runningTitle'])check(typeof settings?.[key]==='string',key+' must be quoted text');
 asset(settings?.soundtrack,'Soundtrack');
 check(Array.isArray(chapters)&&chapters.length>0,'Add at least one chapter');let total=0;
 for(const [i,c] of (chapters||[]).entries()){
  const label='Chapter '+(i+1);check(typeof c.title==='string'&&c.title.trim(),label+' needs a title');check(Array.isArray(c.pages)&&c.pages.length>0,label+' needs at least one page');
  for(const [j,p] of (c.pages||[]).entries()){
   total++;const name=label+', page '+(j+1);check(typeof p.place==='string',name+': place must be text (or "")');check(Array.isArray(p.paragraphs)&&p.paragraphs.length>0&&p.paragraphs.every(t=>typeof t==='string'),name+' needs a list of quoted paragraphs');
   check(p.art===undefined||Array.isArray(p.art),name+': art must be a list');
   for(const a of p.art||[]){asset(a.src,name+' image');for(const key of ['alt','caption'])check(a[key]===undefined||typeof a[key]==='string',name+': '+key+' must be quoted text');check(a.fit===undefined||['contain','cover'].includes(a.fit),name+': fit must be "contain" or "cover"')}
  }
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('Book OK: '+chapters.length+' chapters, '+total+' pages. All image and music files exist.');
}catch(e){console.error('Book check failed:\n'+e.message);process.exitCode=1}
