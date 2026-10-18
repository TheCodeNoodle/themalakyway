import fs from 'node:fs';
const sky = fs.readFileSync('../Sky Background.svg','utf8').replace(/<\?xml[^>]*\?>\s*/, '');
const movingClouds=fs.readFileSync('../Moving Clouds.svg','utf8').replace(/<\?xml[^>]*\?>\s*/, '');
const bottomCloud=fs.readFileSync('../Bottom Cloud.svg','utf8').replace(/<\?xml[^>]*\?>\s*/, '');
const stars = fs.readFileSync('../Stars Transition.svg','utf8').replace(/<\?xml[^>]*\?>\s*/, '');
const pixels = [...stars.matchAll(/<rect\b[^>]*\/>/g)].map(([source]) => ({source, x:+source.match(/x="(\d+)"/)[1], y:+source.match(/y="(\d+)"/)[1]}));
const remaining = new Map(pixels.map(p=>[`${p.x},${p.y}`,p]));
const groups=[];
while(remaining.size){
  const queue=[remaining.values().next().value], group=[];
  remaining.delete(`${queue[0].x},${queue[0].y}`);
  while(queue.length){const p=queue.pop();group.push(p);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const key=`${p.x+dx},${p.y+dy}`;if(remaining.has(key)){queue.push(remaining.get(key));remaining.delete(key);}}}
  groups.push(group);
}
groups.sort((a,b)=>Math.min(...a.map(p=>p.x))-Math.min(...b.map(p=>p.x)));
if(groups.length!==7 || groups.some(g=>g.length!==13)) throw Error('Unexpected star structure');
const overlay=groups.map((g,i)=>{
 const x=Math.min(...g.map(p=>p.x)),y=Math.min(...g.map(p=>p.y));
 return `<g class="star" id="star-${i}" role="button" tabindex="0" aria-label="???" aria-haspopup="dialog" data-index="${i}"><title>???</title><text class="star-name" x="${x+3.5}" y="${y-2}" text-anchor="middle">???</text><g class="alternate">${g.map(p=>p.source).join('')}</g><rect class="hit" x="${x-1}" y="${y-1}" width="9" height="9" fill="transparent"/><rect class="focus-ring" x="${x-1}" y="${y-1}" width="9" height="9" fill="none" stroke-width=".3"/></g>`;
}).join('');
const root=stars.slice(0,stars.indexOf('>')+1);
// Isolate small dots from the supplied pixels, excluding nebulae and surprise stars.
const skyPixels=[...sky.matchAll(/<rect\b[^>]*\/>/g)].map(([source])=>({source,x:+source.match(/x="(\d+)"/)[1],y:+source.match(/y="(\d+)"/)[1],fill:source.match(/fill="([^"]+)"/)[1]}));
const dotsLeft=new Map(skyPixels.filter(p=>p.fill!=='#020E32').map(p=>[`${p.x},${p.y}`,p]));
const dots=[];
while(dotsLeft.size){
 const seed=dotsLeft.values().next().value,queue=[seed],component=[];dotsLeft.delete(`${seed.x},${seed.y}`);
 while(queue.length){const p=queue.pop();component.push(p);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const key=`${p.x+dx},${p.y+dy}`;if(dotsLeft.has(key)){queue.push(dotsLeft.get(key));dotsLeft.delete(key);}}}
 if(component.length<=2&&component.every(p=>p.fill==='#0B1C57'||p.fill==='#1F318C')&&!component.some(p=>pixels.some(s=>Math.abs(s.x-p.x)<3&&Math.abs(s.y-p.y)<3)))dots.push(component);
}
const palette=['#7597D9','#C9BFC8','#5D7AC6'];
const twinkles=dots.map((g,i)=>{
 const duration=5+(i%7)*.8;
 return g.map(p=>`<span class="twinkle" style="left:${p.x/167*100}%;top:${p.y/94*100}%;--light:${palette[i%palette.length]};--twinkle-duration:${duration}s;--twinkle-delay:-${((i*.83+2.5)%duration).toFixed(2)}s"></span>`).join('');
}).join('');
const html=fs.readFileSync('template.html','utf8').replace('<!-- SKY -->',sky).replace('<!-- STARS -->',root+overlay+'</svg>').replace('<!-- TWINKLES -->',twinkles).replace('<!-- MOVING CLOUDS -->',movingClouds).replace('<!-- BOTTOM CLOUD -->',bottomCloud);
fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/index.html',html);
// Lossless row-run packing: preserve every source pixel/color, just reduce SVG commands.
function compactArtwork(source,name,width=167,height=94){
 const rects=[...source.matchAll(/<rect\b[^>]*\/>/g)].map(([s])=>({x:+s.match(/x="(\d+)"/)[1],y:+s.match(/y="(\d+)"/)[1],fill:s.match(/fill="([^"]+)"/)[1]}));
 const sourceMap=new Map(rects.map(p=>[`${p.x},${p.y}`,p.fill]));
 if(sourceMap.size!==rects.length)throw Error('Overlapping source pixels need explicit handling');
 const paths=new Map(), reconstructed=new Map();
 for(let y=0;y<height;y++)for(let x=0;x<width;){
  const color=sourceMap.get(`${x},${y}`);if(!color){x++;continue;}
  const start=x;while(x<width&&sourceMap.get(`${x},${y}`)===color){reconstructed.set(`${x},${y}`,color);x++;}
  paths.set(color,(paths.get(color)||'')+`M${start} ${y}h${x-start}v1H${start}z`);
 }
 if(reconstructed.size!==sourceMap.size||[...sourceMap].some(([key,color])=>reconstructed.get(key)!==color))throw Error(`Pixel preservation failed: ${name}`);
 fs.writeFileSync(`dist/${name}`,`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${[...paths].map(([fill,d])=>`<path fill="${fill}" d="${d}"/>`).join('')}</svg>`);
 console.log(`${name}: ${rects.length} pixels verified, ${paths.size} color paths`);
}
compactArtwork(sky,'sky-render.svg');
compactArtwork(movingClouds,'moving-clouds-render.svg');
compactArtwork(bottomCloud,'bottom-cloud-render.svg');
compactArtwork(fs.readFileSync('../astronaut dialogue.svg','utf8'),'intro-dialogue.svg');
compactArtwork(fs.readFileSync('../Driver Licence.svg','utf8'),'rocketship-license.svg',102,73);
console.log(`Twinkling dots: ${dots.length}`);
console.log(JSON.stringify({dimensions:[167,94],skyPixels:(sky.match(/<rect /g)||[]).length,stars:groups.map((g,i)=>({id:`star-${i}`,pixels:g.length,x:Math.min(...g.map(p=>p.x)),y:Math.min(...g.map(p=>p.y))}))},null,2));
