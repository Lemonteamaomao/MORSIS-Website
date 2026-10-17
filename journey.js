(()=>{
const host=document.getElementById('journeyChapters'),canvas=document.getElementById('journeyWave'),journey=document.getElementById('soundJourney');if(!host||!canvas||!journey)return;
const animals=[
 {key:'bird',name:'Bird',num:'01',subtitle:'A language of flight',desc:'Bright calls travel through the air. Follow a songbird’s voice, then try shaping your own voice into a bird-inspired signal.',color:'#ffc5ed',secondary:'#b9a7ff',path:'M82 225 Q137 208 182 173 Q213 143 256 151 Q281 112 320 104 Q302 139 300 157 Q349 169 367 196 Q397 202 431 199 L473 212 L430 223 Q393 225 369 220 Q344 249 300 252 Q252 275 210 308 Q228 268 247 242 Q187 255 143 280 Q170 240 206 215 Q143 235 82 225 Z',details:'M175 223 Q247 170 339 203 M208 252 Q259 214 315 219 M255 150 Q277 168 296 186'},
 {key:'dolphin',name:'Dolphin',num:'02',subtitle:'Clicks, whistles, connections',desc:'Fast clicks and whistles trace patterns through the water. Explore playful dolphin-inspired frequencies.',color:'#ffcaed',secondary:'#91ddff',path:'M53 253 Q105 210 160 204 Q210 183 243 157 Q258 136 286 104 Q288 149 274 169 Q333 159 381 184 Q412 201 436 218 L474 218 L441 234 Q425 256 403 260 Q409 236 395 226 Q347 222 305 243 Q264 263 224 259 Q202 284 188 313 Q178 283 181 255 Q110 273 53 253 Z',details:'M105 246 Q212 209 313 201 M211 238 Q279 222 355 218 M261 175 Q278 190 287 206'},
 {key:'whale',name:'Whale',num:'03',subtitle:'Voices beneath the surface',desc:'Low, sweeping calls travel across vast underwater distances. Explore the slower rhythms of a whale-inspired soundscape.',color:'#9ee5ff',secondary:'#afa6ff',path:'M61 239 Q106 194 172 195 Q216 144 295 148 Q348 154 375 183 Q396 196 416 198 Q436 169 467 166 Q456 197 443 214 Q460 238 476 253 Q435 250 412 224 Q390 225 374 243 Q325 278 270 278 Q209 284 176 251 Q120 263 61 239 Z',details:'M136 232 Q233 263 339 222 M180 197 Q237 177 298 189 M375 204 Q397 216 423 210'}
];
function svg(a,layer){const id=`g-${a.key}-${layer}`;return `<svg class="animal-${layer}" viewBox="0 0 520 400" aria-hidden="true"><defs><linearGradient id="${id}" x1=".15" y1=".05" x2=".85" y2="1"><stop offset="0" stop-color="#fffafc"/><stop offset=".26" stop-color="${a.color}"/><stop offset=".62" stop-color="${a.secondary}"/><stop offset="1" stop-color="#33345f"/></linearGradient><linearGradient id="shine-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="${a.path}" fill="${layer==='shadow'?'#050b20':`url(#${id})`}" stroke="${layer==='front'?'#f4e6ffbb':'none'}" stroke-width="1.4" stroke-linejoin="round"/>${layer==='front'?`<path d="${a.details}" fill="none" stroke="url(#shine-${id})" stroke-width="2" stroke-linecap="round"/><circle cx="${a.key==='whale'?129: a.key==='bird'?398:399}" cy="${a.key==='whale'?220:a.key==='bird'?210:221}" r="3.5" fill="#192342"/>`:''}</svg>`}
host.innerHTML=animals.map(a=>`<section class="sound-chapter" id="chapter-${a.key}" data-animal="${a.key}"><div class="chapter-copy"><span class="chapter-index">SIGNAL ${a.num} / ${a.subtitle.toUpperCase()}</span><h3><em>${a.name}</em></h3><p>${a.desc}</p><button type="button" class="chapter-try" data-try="${a.key}">✧ TRY ${a.name.toUpperCase()} MICROPHONE <span aria-hidden="true">↗</span></button></div><div class="animal-3d" role="button" tabindex="0" aria-label="Play ${a.name.toLowerCase()} call; press and hold to repeat"><div class="sculpture"><canvas class="ascii-creature" width="780" height="600" aria-hidden="true"></canvas></div></div><span class="chapter-side-label">MORSIS / ${a.num} / LISTEN DEEPER</span></section>`).join('');
// A lightweight sky scene sits behind the bird without covering its controls.
const birdChapter=host.querySelector('#chapter-bird');
const sky=document.createElement('div');sky.className='bird-sky';sky.setAttribute('aria-hidden','true');
sky.innerHTML='<div class="sky-sun"></div><div class="sky-cloud cloud-high"></div><div class="sky-cloud cloud-low"></div><div class="sky-cloud cloud-horizon"></div>';
birdChapter.prepend(sky);
const skyNote=document.createElement('div');skyNote.className='sky-field-note';
skyNote.innerHTML='<span>01 / ABOVE THE SURFACE</span>';
const birdScene=document.createElement('div');birdScene.className='bird-scene';
const birdAnimal=birdChapter.querySelector('.animal-3d');
birdAnimal.before(birdScene);birdScene.append(birdAnimal,skyNote);
// An ocean threshold: the sound trace breaks the surface before the dolphin.
const firstUnderwaterChapter=host.querySelector('#chapter-dolphin');
const threshold=document.createElement('div');threshold.className='water-threshold';threshold.setAttribute('aria-hidden','true');
threshold.innerHTML='<div class="water-surface"></div><span>DESCENDING BELOW THE SURFACE</span><div class="water-ripples"></div>';
firstUnderwaterChapter.before(threshold);
const ocean=document.createElement('div');ocean.className='ocean-atmosphere';ocean.setAttribute('aria-hidden','true');
ocean.innerHTML='<canvas class="ocean-particles"></canvas>';
journey.append(ocean);
const asciiCanvases=animals.map((animal,i)=>({animal,canvas:host.querySelectorAll('.ascii-creature')[i]}));
const glyphs=['·',':','+','*','/','\\','~','o','O','#','@','%'];
// Cache the shared character artwork once; animate the finished sprite.
const sprites=animals.map(a=>Array.from({length:a.key==='bird'?16:1},(_,frame)=>{
 const sprite=document.createElement('canvas');sprite.width=780;sprite.height=600;
 const c=sprite.getContext('2d');c.scale(1.5,1.5);c.translate(15,45);
 const shape=new Path2D(),parts=[];
 Object.entries(window.morsisAnimalShapes[a.key]).forEach(([part,p])=>{
  if(a.key==='bird'&&part!=='body'){
   const flap=.62+Math.sin(frame/16*Math.PI*2+(part==='far'?.35:0))*.36;
   const matrix=new DOMMatrix().translate(237,168).scale(1,flap).translate(-237,-168);
   const wing=new Path2D();wing.addPath(new Path2D(p),matrix);parts.push(wing);shape.addPath(wing);
  }else{const body=new Path2D(p);parts.push(body);shape.addPath(body);}
 });
 // Fill each part separately so overlapping wings cannot cut holes in the body.
 c.save();c.fillStyle='#fff';parts.forEach(part=>c.fill(part));
 c.globalCompositeOperation='source-in';
 const fill=c.createLinearGradient(80,50,330,250);
 fill.addColorStop(0,a.color);fill.addColorStop(.55,a.secondary);fill.addColorStop(1,'#506a92');
 c.fillStyle=fill;c.fillRect(0,0,520,400);
 c.globalCompositeOperation='source-atop';
 c.fillStyle='#07152a';c.globalAlpha=.42;c.fillRect(0,0,520,400);c.globalAlpha=1;
 c.font='bold 7px monospace';
 for(let y=30;y<275;y+=6)for(let x=25;x<445;x+=5){
 const seed=Math.abs(Math.sin(x*12.9898+y*78.233)*43758.5453)%1;
 c.fillStyle='hsla('+(a.key==='whale'?192:a.key==='dolphin'?205:285)+',75%,'+(75+seed*23)+'%,.9)';
 c.fillText('+*:#'[Math.floor(seed*4)],x,y);
 }
 c.restore();c.strokeStyle=a.color;c.lineWidth=.65;c.globalAlpha=.65;c.stroke(shape);
 const eye=a.key==='bird'?[295,144]:a.key==='whale'?[85,150]:[328,162];
 c.fillStyle='#f4fdff';c.globalAlpha=1;c.beginPath();c.arc(...eye,2,0,Math.PI*2);c.fill();return sprite;
}));
function drawAscii(time){asciiCanvases.forEach((view,i)=>{
 const {canvas,animal}=view,rect=canvas.getBoundingClientRect();
 if(rect.bottom<0||rect.top>innerHeight){view.lastTime=null;return;}
 const dt=view.lastTime==null?0:Math.min(.05,(time-view.lastTime)/1000);
 view.lastTime=time;view.motion=(view.motion||0)+(reduced?0:dt);
 const t=view.motion,bird=animal.key==='bird',whale=animal.key==='whale';
 const phase=t*(bird?.65:whale?.27:.46)+i*.8;
 const x=reduced?0:Math.sin(phase)*(bird?80:whale?65:90);
 const y=reduced?0:Math.sin(phase*2+(bird?.5:0))*(bird?48:whale?22:38);
 // Slow banking at each turn preserves a continuous route, with the nose leading.
 const direction=reduced?1:Math.tanh(Math.cos(phase)*5);
 // Keep a readable silhouette throughout turns instead of collapsing to zero width.
 const turn=(direction<0?-1:1)*(.7+.3*Math.abs(direction));
 const facing=whale?-turn:turn;
 const bank=reduced?0:Math.cos(phase*2)*(bird?.13:whale?.045:.085)*direction;
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();
 c.translate(canvas.width/2+x,canvas.height/2+y);c.rotate(bank);
 const size=whale?1.06:.78;
 c.scale(size*facing,size);c.translate(-canvas.width/2,-canvas.height/2);
 const frame=bird&&!reduced?Math.floor(t*12)%sprites[i].length:0;
 const sprite=sprites[i][frame];
 if(bird||reduced)c.drawImage(sprite,0,0);
 else{
  // A travelling body flex grows toward the tail, like a swimming stroke.
  for(let sx=0;sx<sprite.width;sx+=6){
   const tail=whale?sx/sprite.width:1-sx/sprite.width;
   const flex=Math.sin(t*(whale?2:3.8)+sx*.012)*tail*tail*(whale?13:21);
   c.drawImage(sprite,sx,0,Math.min(6,sprite.width-sx),sprite.height,sx,flex,Math.min(6,sprite.width-sx),sprite.height);
  }
 }
 c.restore();
});}
// Move the existing instrument beside the selected animal, preserving its audio pipeline.
const livePanel=document.getElementById('modeTitle').closest('.panel');
livePanel.classList.add('journey-instrument');
livePanel.hidden=false;
livePanel.removeAttribute('role');
livePanel.removeAttribute('aria-labelledby');
// Keep the privacy explanation available without extending the whole chapter.
const privacyNote=livePanel.querySelector('.small');
const privacyDetails=document.createElement('details');privacyDetails.className='audio-details';
const privacySummary=document.createElement('summary');privacySummary.textContent='About this voice effect & privacy';
privacyNote.before(privacyDetails);privacyDetails.append(privacySummary,privacyNote);
function placeInstrument(species,focus=false,syncMode=true){
 const section=host.querySelector('#chapter-'+species);
 section.querySelector('.chapter-copy').append(livePanel);
 livePanel.hidden=false;
 host.querySelectorAll('[data-try]').forEach(button=>button.hidden=button.dataset.try===species);
 if(syncMode&&voiceMode!==species)document.querySelector('.voice-modes [data-voice="'+species+'"]').click();
 if(focus)document.getElementById('mic').focus({preventScroll:true});
}
// Species buttons navigate with the shared instrument, after the existing audio handler.
livePanel.querySelectorAll('[data-voice]').forEach(button=>{
 button.addEventListener('click',()=>{
  const species=button.dataset.voice;
  placeInstrument(species,false,false);
  host.querySelector('#chapter-'+species).scrollIntoView({
   behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'
  });
 });
});
host.querySelectorAll('[data-try]').forEach(button=>{
 button.textContent='Speak in '+button.dataset.try[0].toUpperCase()+button.dataset.try.slice(1)+'  \u2197';
 button.addEventListener('click',()=>placeInstrument(button.dataset.try,true));
});
placeInstrument('bird');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{threshold:.15});
host.querySelectorAll('.sound-chapter').forEach(s=>observer.observe(s));
const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Render the wave beyond the chapter bounds without adding page height.
const waveTail=220;
journey.parentElement.append(canvas);
let width=1,height=1,dpr=1,scroll=0,mouseX=0,offset=0,totalHeight=1;
function resize(){
 const waterY=threshold.offsetTop+threshold.offsetHeight;
 journey.style.setProperty('--surface-y',threshold.offsetTop+'px');
 journey.style.setProperty('--water-y',waterY+'px');
 width=journey.clientWidth;totalHeight=journey.offsetHeight+waveTail*2;height=Math.min(totalHeight,innerHeight+240);dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
resize();addEventListener('resize',resize,{passive:true});
new ResizeObserver(resize).observe(host);
const waterCanvas=ocean.querySelector('canvas'),waterCtx=waterCanvas.getContext('2d');
const bubbles=Array.from({length:45},(_,i)=>({x:((i*67.19)%100)/100,y:((i*23.71)%100)/100,r:.5+(i%5)*.6,speed:7+(i%9)*4}));
function drawOcean(t){const rect=ocean.getBoundingClientRect(),W=rect.width,H=Math.min(rect.height,innerHeight+240);waterCanvas.style.position="absolute";waterCanvas.style.height=H+"px";waterCanvas.style.top=Math.max(0,-rect.top-120)+"px";if(!W||!H)return;
const d=Math.min(devicePixelRatio||1,2);if(waterCanvas.width!==Math.round(W*d)||waterCanvas.height!==Math.round(H*d)){waterCanvas.width=Math.round(W*d);waterCanvas.height=Math.round(H*d)}
waterCtx.setTransform(d,0,0,d,0,0);waterCtx.clearRect(0,0,W,H);
for(const b of bubbles){const y=(b.y*H-t*.001*b.speed%H+H)%H,x=b.x*W+Math.sin(y*.012+t*.0006+b.r)*12;
waterCtx.beginPath();waterCtx.arc(x,y,b.r,0,Math.PI*2);waterCtx.strokeStyle='rgba(179,231,255,.24)';waterCtx.stroke();}
}

journey.addEventListener('pointermove',e=>{mouseX=(e.clientX/innerWidth-.5)*2},{passive:true});
let lastFrame=-Infinity;
function draw(ms){requestAnimationFrame(draw);if(document.hidden||ms-lastFrame<33)return;lastFrame=ms;
 const bounds=journey.getBoundingClientRect();if(bounds.bottom+waveTail<0||bounds.top-waveTail>innerHeight)return;
 offset=Math.max(0,Math.min(totalHeight-height,-bounds.top+waveTail-120));canvas.style.top=(journey.offsetTop-waveTail+offset)+'px';
 const t=reduced?0:ms*.001;ctx.clearRect(0,0,width,height);drawAscii(reduced?0:ms);drawOcean(reduced?0:ms);
 const narrow=width<760;
 // The same audio bars and trace, rotated along the journey.
 window.drawMorsisWave(ctx,{
  width,height,time:t,vertical:true,offset,totalLength:totalHeight,
  center:width*(narrow?.91:.51),amplitude:Math.min(width*(narrow?.065:.105),145),
  level:typeof micVisualLevel==='number'?Math.max(.3,micVisualLevel):.3
 });
 // Feather against global wave endpoints, rather than the moving viewport slice.
 ctx.save();ctx.globalCompositeOperation='destination-in';
 const fade=ctx.createLinearGradient(0,-offset,0,totalHeight-offset);
 const edge=Math.min(.3,420/totalHeight);
 fade.addColorStop(0,'rgba(255,255,255,0)');
 fade.addColorStop(edge*.4,'rgba(255,255,255,.15)');
 fade.addColorStop(edge,'rgba(255,255,255,1)');
 fade.addColorStop(1-edge,'rgba(255,255,255,1)');
 fade.addColorStop(1-edge*.4,'rgba(255,255,255,.15)');
 fade.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=fade;ctx.fillRect(0,0,width,height);ctx.restore();
 const viewport=innerHeight;
 const entry=threshold.getBoundingClientRect();const plunge=Math.max(0,Math.min(1,(viewport*.75-entry.top)/(viewport*.85)));
 journey.style.setProperty('--plunge',plunge.toFixed(3));
 journey.style.setProperty('--entry-flash',reduced?0:(Math.sin(plunge*Math.PI)**8).toFixed(3));
 journey.classList.toggle('is-submerged',plunge>.55);
 
 host.querySelectorAll('.sound-chapter').forEach((section,i)=>{const r=section.getBoundingClientRect();const mid=(r.top+r.height/2-viewport/2)/viewport;const sculpture=section.querySelector('.sculpture');if(!reduced){sculpture.style.setProperty('--turn',`${Math.max(-25,Math.min(25,-mid*18+mouseX*8+(i-1)*7))}deg`);sculpture.style.setProperty('--tilt',`${5+Math.sin(t*.55+i)*4}deg`);sculpture.style.setProperty('--rise',`${Math.sin(t*.85+i*2)*9}px`)}});

}
requestAnimationFrame(draw);
})();