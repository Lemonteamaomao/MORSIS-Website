(() => {
  const blocked = 'a,button,input,select,textarea,label,[role="button"],[role="tab"],[contenteditable],h1,h2,h3,p,.eyebrow,.brand,.lab-nav,.species,.status,.small,.animal-tag';
  let gesture = null;
  function stop() {
    const g=gesture;if(!g)return;
    gesture=null;clearTimeout(g.idle);
    document.documentElement.classList.remove('frequency-drag');
    if(!g.osc)return;
    const now=g.audio.currentTime;
    g.gain.gain.cancelScheduledValues(now);
    g.gain.gain.setTargetAtTime(0,now,.025);
    g.osc.stop(now+.18);
    g.osc.onended=()=>{g.osc.disconnect();g.gain.disconnect();g.pan.disconnect()};
  }
  addEventListener('pointerdown',e=>{
    if(gesture||e.button!==0||!e.isPrimary||e.pointerType==='touch'||e.target.closest(blocked))return;
    // Unlock audio on press, but remain silent until the pointer actually drags.
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY,audio:initAudio(),osc:null,idle:null};
  });
  addEventListener('pointermove',e=>{
    const g=gesture;if(!g||g.id!==e.pointerId)return;
    if(!(e.buttons&1)){stop();return}
    if(!g.osc&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<5)return;
    if(e.target.closest(blocked)){
      if(g.gain)g.gain.gain.setTargetAtTime(0,g.audio.currentTime,.02);
      return;
    }
    const a=g.audio;
    if(!g.osc){
      g.osc=a.createOscillator();g.gain=a.createGain();g.pan=a.createStereoPanner();
      g.osc.type='sine';g.gain.gain.value=0;
      g.osc.connect(g.gain).connect(g.pan).connect(master);
      g.osc.start();document.documentElement.classList.add('frequency-drag');
    }
    const x=Math.max(0,Math.min(1,e.clientX/innerWidth));
    const y=Math.max(0,Math.min(1,e.clientY/innerHeight));
    g.osc.frequency.setTargetAtTime(130*Math.pow(6,1-y),a.currentTime,.035);
    g.pan.pan.setTargetAtTime((x-.5)*1.4,a.currentTime,.04);
    g.gain.gain.setTargetAtTime(.055,a.currentTime,.025);
    clearTimeout(g.idle);
    // Holding still falls silent; another drag resumes the same smooth tone.
    g.idle=setTimeout(()=>g.gain.gain.setTargetAtTime(0,a.currentTime,.035),100);
    e.preventDefault();
  },{passive:false});
  addEventListener('pointerup',e=>{if(gesture?.id===e.pointerId)stop()});
  addEventListener('pointercancel',stop);
  addEventListener('blur',stop);
  document.addEventListener('pointerleave',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
