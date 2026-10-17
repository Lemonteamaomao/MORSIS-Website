/* Pointer-shaped water contours; a press sends a pulse through the surface. */
(() => {
 const experience=document.getElementById('research');if(!experience)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const art=document.createElement('button');art.type='button';art.className='experience-art';
 art.setAttribute('aria-label','Interactive sound ripples. Drag the contour shapes to move them; release to let them glide.');
 art.innerHTML='<canvas width="603" height="750" aria-hidden="true"></canvas><span>DRAG TO PUSH / RELEASE TO GLIDE</span>';
 experience.append(art);
 const canvas=art.querySelector('canvas'),ctx=canvas.getContext('2d');
 const shapes=[{x:85,y:92,size:73},{x:224,y:263,size:115},{x:104,y:407,size:78}].map(s=>({...s,x:s.x+42,vx:0,vy:0}));
 let dragged=null,dragOffset={x:0,y:0},dragStamp=0;
 const W=402,H=500;ctx.setTransform(1.5,0,0,1.5,0,0);
 let visible=false,frame=null,last=0,time=0,pressed=false,nextPulse=0;
 let pointer={x:180,y:245},smooth={x:180,y:245},hover=0,target=0;
 let pulses=[],sound=null,soundReleaseTimer=null;
 function tuneSound(){
  if(!sound)return;
  const hz=170+(1-pointer.y/H)*110+pointer.x/W*35;
  sound.osc.frequency.setTargetAtTime(hz,sound.context.currentTime,.09);
  sound.harmonic.frequency.setTargetAtTime(hz*1.5,sound.context.currentTime,.09);
 }
 function startSound(){
  clearTimeout(soundReleaseTimer);if(sound)return;
  const context=initAudio(),osc=context.createOscillator(),harmonic=context.createOscillator();
  const gain=context.createGain(),overtone=context.createGain();
  gain.gain.value=0;overtone.gain.value=.18;osc.type=harmonic.type='sine';
  osc.connect(gain);harmonic.connect(overtone).connect(gain);gain.connect(master);
  sound={context,osc,harmonic,gain};tuneSound();
  gain.gain.setTargetAtTime(.045,context.currentTime,.08);
  let ended=0;const cleanup=()=>{if(++ended===2){osc.disconnect();harmonic.disconnect();gain.disconnect();overtone.disconnect();}};
  osc.onended=harmonic.onended=cleanup;osc.start();harmonic.start();
 }
 function stopSound(){
  clearTimeout(soundReleaseTimer);if(!sound)return;
  const current=sound;sound=null;const now=current.context.currentTime;
  current.gain.gain.cancelScheduledValues(now);
  current.gain.gain.setTargetAtTime(0,now,.025);
  current.osc.stop(now+.16);current.harmonic.stop(now+.16);
 }
 function position(event){const r=canvas.getBoundingClientRect();pointer={x:Math.max(0,Math.min(W,(event.clientX-r.left)/r.width*W)),y:Math.max(0,Math.min(H,(event.clientY-r.top)/r.height*H))};}
 function pulse(){
  if(pulses.length>=6)pulses.shift();
  pulses.push({x:pointer.x,y:pointer.y,born:time});nextPulse=time+.35;
  if(reduced)paint(performance.now());
 }
 function release(){pressed=false;dragged=null;art.classList.remove('is-dragging');stopSound();}
 function moveShape(event){
  if(!dragged)return;
  const now=performance.now(),dt=Math.max(.008,(now-dragStamp)/1000);
  const x=Math.max(dragged.size*.55,Math.min(W-dragged.size*.55,pointer.x-dragOffset.x));
  const y=Math.max(dragged.size*.55,Math.min(H-dragged.size*.55,pointer.y-dragOffset.y));
  dragged.vx= Math.max(-450,Math.min(450,(x-dragged.x)/dt));
  dragged.vy= Math.max(-450,Math.min(450,(y-dragged.y)/dt));
  dragged.x=x;dragged.y=y;dragStamp=now;
 }

 art.addEventListener('pointerenter',event=>{position(event);target=1;});
 art.addEventListener('pointermove',event=>{position(event);moveShape(event);target=1;tuneSound();if(reduced)paint(performance.now());});
 art.addEventListener('pointerleave',()=>{if(dragged)return;target=0;release();if(reduced)paint(performance.now());});
 art.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary)return;
  position(event);
  dragged=[...shapes].reverse().find(s=>Math.hypot(pointer.x-s.x,pointer.y-s.y)<s.size*1.1)||null;
  if(!dragged)return;
  dragOffset={x:pointer.x-dragged.x,y:pointer.y-dragged.y};dragStamp=performance.now();
  dragged.vx=dragged.vy=0;art.setPointerCapture(event.pointerId);art.classList.add('is-dragging');
  pressed=true;target=1;pulse();startSound();
 });
 art.addEventListener('click',event=>{if(event.detail===0&&!pressed){pointer={x:180,y:245};pulse();startSound();soundReleaseTimer=setTimeout(release,200);}});
 art.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  event.preventDefault();if(event.repeat)return;
  pointer={x:180,y:245};pressed=true;target=1;pulse();startSound();
 });
 art.addEventListener('keyup',event=>{
  if(event.key==='Enter'||event.key===' '){event.preventDefault();release();}
 });
 addEventListener('pointerup',release);addEventListener('pointercancel',release);art.addEventListener('lostpointercapture',release);
 art.addEventListener('blur',()=>{release();target=0;});
 addEventListener('blur',()=>{release();target=0;});
 function paint(ms){
  frame=null;
  if(!visible||document.hidden){last=0;return;}
  if(!reduced&&last&&ms-last<33){frame=requestAnimationFrame(paint);return;}
  const dt=last?Math.min(.05,(ms-last)/1000):0;last=ms;
  if(!reduced)time+=dt;
  const ease=reduced?1:1-Math.exp(-dt*8);
  smooth.x+=(pointer.x-smooth.x)*ease;smooth.y+=(pointer.y-smooth.y)*ease;hover+=(target-hover)*ease;
  if(pressed&&!reduced&&time>=nextPulse)pulse();
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#c9d1e5';

  for(const shape of shapes){
   if(shape!==dragged&&!reduced){
    shape.x+=shape.vx*dt;shape.y+=shape.vy*dt;
    shape.vx*=Math.exp(-dt*2.8);shape.vy*=Math.exp(-dt*2.8);
    const edge=shape.size*.55;
    if(shape.x<edge||shape.x>W-edge){shape.x=Math.max(edge,Math.min(W-edge,shape.x));shape.vx*=-.5;}
    if(shape.y<edge||shape.y>H-edge){shape.y=Math.max(edge,Math.min(H-edge,shape.y));shape.vy*=-.5;}
   }
   const cx=shape.x+(smooth.x-180)*hover*.025,cy=shape.y+(smooth.y-245)*hover*.025;
   for(let ring=0;ring<16;ring++){
    const f=ring/15,radius=shape.size*(.12+f*.88);ctx.beginPath();
    for(let step=0;step<=160;step++){
     const angle=step/160*Math.PI*2;
     const px=cx+Math.cos(angle)*radius,py=cy+Math.sin(angle)*radius;
     const distance=Math.hypot(px-smooth.x,py-smooth.y);
     let ripple=0;
     if(!reduced)for(const p of pulses){const age=time-p.born;const d=Math.hypot(px-p.x,py-p.y);ripple+=Math.sin(d*.085-age*7)*Math.exp(-Math.pow((d-age*105)/35,2))*Math.exp(-age*.9)*4;}
     const lobes=Math.cos(angle*3+.4)*(1-f)*.23+Math.sin(angle*2-.7)*.065;
     const r=radius*(1+lobes)+Math.exp(-distance*distance/4200)*hover*6+ripple;
     const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.94;
     if(step===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.globalAlpha=.42-f*.15+hover*.1;ctx.lineWidth=.8;ctx.stroke();
   }
  }
  pulses=pulses.filter(p=>reduced||time-p.born<2.5);
  for(const p of pulses){
   const age=reduced?.45:time-p.born;
   ctx.globalAlpha=Math.max(0,1-age/2.5)*.45;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(p.x,p.y,12+age*85,10+age*70,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.globalAlpha=1;
  if(!reduced)frame=requestAnimationFrame(paint);
 }
 const observer=new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting&&art.getBoundingClientRect().width>0;
  if(visible&&!frame){last=0;frame=requestAnimationFrame(paint);}
  if(!visible){release();if(frame)cancelAnimationFrame(frame);frame=null;last=0;}
 });observer.observe(art);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){release();if(frame)cancelAnimationFrame(frame);frame=null;last=0;}
  else if(visible&&!frame)frame=requestAnimationFrame(paint);
 });
})();
