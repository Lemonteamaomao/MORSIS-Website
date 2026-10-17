(() => {
  const button = document.getElementById('ambient');
  let session = null;
  button.setAttribute('aria-pressed', 'false');

  function start() {
    const a = initAudio();
    const bus = a.createGain();
    const nodes = [bus], sources = new Set();
    const state = {bus, nodes, sources, timer:null};
    bus.gain.setValueAtTime(0, a.currentTime);
    bus.gain.linearRampToValueAtTime(.6, a.currentTime + 2);
    bus.connect(master);
    const track = node => { nodes.push(node); return node; };
    function run(source) {
      sources.add(source);
      source.onended = () => { sources.delete(source); source.disconnect(); };
      source.start();
    }

    // Stereo, softened noise swells like distant water, without a sustained pitched drone.
    const buffer = a.createBuffer(2, a.sampleRate * 12, a.sampleRate);
    for (let channel=0;channel<2;channel++) {
      const data = buffer.getChannelData(channel);
      let previous = 0;
      for (let i=0;i<data.length;i++) {
        previous = (previous + (Math.random()*2-1)*.025) / 1.025;
        // Periodic envelope joins the loop quietly at both ends.
        data[i] = previous * 5 * (.35 + .65*Math.sin(Math.PI*i/data.length)**2);
      }
    }
    const surf = a.createBufferSource(); surf.buffer=buffer; surf.loop=true;
    const low=track(a.createBiquadFilter());low.type='lowpass';low.frequency.value=1250;
    const high=track(a.createBiquadFilter());high.type='highpass';high.frequency.value=110;
    const swell=track(a.createGain());swell.gain.value=.055;
    const tide=a.createOscillator();tide.frequency.value=.105;
    const depth=track(a.createGain());depth.gain.value=.022;
    tide.connect(depth).connect(swell.gain);
    surf.connect(high).connect(low).connect(swell).connect(bus);
    run(surf);run(tide);

    const delay=track(a.createDelay(2));delay.delayTime.value=.57;
    const feedback=track(a.createGain());feedback.gain.value=.28;
    const echo=track(a.createGain());echo.gain.value=.22;
    delay.connect(feedback).connect(delay);delay.connect(echo).connect(bus);
    const notes=[293.66,349.23,440,523.25,587.33,698.46];
    function chime() {
      if(session!==state)return;
      const now=a.currentTime;
      const oscillator=a.createOscillator(),envelope=a.createGain(),pan=a.createStereoPanner();
      oscillator.type='sine';oscillator.frequency.value=notes[Math.floor(Math.random()*notes.length)];
      pan.pan.value=(Math.random()-.5)*1.3;
      envelope.gain.setValueAtTime(0,now);
      envelope.gain.linearRampToValueAtTime(.035,now+.09);
      envelope.gain.exponentialRampToValueAtTime(.0001,now+3.8);
      oscillator.connect(envelope).connect(pan);pan.connect(bus);pan.connect(delay);
      sources.add(oscillator);
      oscillator.onended=()=>{sources.delete(oscillator);oscillator.disconnect();envelope.disconnect();pan.disconnect();};
      oscillator.start(now);oscillator.stop(now+4);
      state.timer=setTimeout(chime,2200+Math.random()*3400);
    }
    session=state;
    state.timer=setTimeout(chime,650);
  }
  function stop() {
    const state=session;if(!state)return;
    session=null;clearTimeout(state.timer);
    const now=audio.currentTime;
    state.bus.gain.cancelScheduledValues(now);
    state.bus.gain.setValueAtTime(state.bus.gain.value,now);
    state.bus.gain.linearRampToValueAtTime(0,now+.8);
    for(const source of state.sources)source.stop(now+.85);
    setTimeout(()=>state.nodes.forEach(node=>node.disconnect()),1000);
  }
  button.onclick=()=>{
    if(session)stop();else start();
    ambientOn=!!session;
    button.textContent=ambientOn?'♫ Ambient: on':'♫ Ambient: off';
    button.setAttribute('aria-pressed',String(ambientOn));
  };
})();
