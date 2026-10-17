/* Animal calls use the existing audio context, without microphone permission. */
(() => {
  const animals = [...document.querySelectorAll('.animal-3d')];
  const voices = new Set();
  let repeat = null, feedback = null, held = null;

  let dolphinCall = null;
  function quiet() {
    dolphinCall?.stop(); dolphinCall = null;
    for (const voice of voices) {
      const now = voice.context.currentTime;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0, now, .018);
      try { voice.osc.stop(now + .08); } catch (_) {}
    }
  }
  function tone(context, start, duration, from, to, volume, type = 'sine') {
    const osc = context.createOscillator(), gain = context.createGain();
    gain.gain.value = 0;
    const voice = {osc, gain, context};
    voices.add(voice);
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + duration * .75);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + Math.min(.08, duration * .2));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain).connect(master);
    osc.onended = () => { voices.delete(voice); osc.disconnect(); gain.disconnect(); };
    osc.start(start); osc.stop(start + duration + .02);
  }
  function call(animal) {
    quiet();
    const context = initAudio(), now = context.currentTime + .025;
    const kind = animal.closest('.sound-chapter').dataset.animal;
    let duration;
    if (kind === 'bird') {
      duration = .85;
      [0, .17, .36, .58].forEach((offset, i) => {
        tone(context, now + offset, .14, 1800 + i * 220, 3200 - i * 110, .11);
      });
    } else if (kind === 'whale') {
      duration = 2.7;
      tone(context, now, 2.4, 145, 62, .22);
      tone(context, now + .15, 2.25, 221, 110, .065);
      tone(context, now + .65, 1.6, 88, 125, .09);
    } else {
      dolphinCall = window.playDolphinSignal(context, master, now);
      duration = dolphinCall.end - context.currentTime;
    }
    clearTimeout(feedback);
    animals.forEach(other => other.classList.toggle('calling', other === animal));
    feedback = setTimeout(() => animal.classList.remove('calling'), duration * 1000);
    return duration;
  }
  function release() {
    clearTimeout(repeat); repeat = null;
    if (held) held.removeAttribute('aria-pressed');
    held = null;
  }
  function begin(animal) {
    release(); held = animal; animal.setAttribute('aria-pressed', 'true');
    function pulse() {
      if (held !== animal) return;
      const duration = call(animal);
      repeat = setTimeout(pulse, duration * 1000 + 180);
    }
    pulse();
  }
  animals.forEach(animal => {
    const hint = document.createElement('span');
    hint.className = 'animal-call-hint'; hint.textContent = 'CLICK TO LISTEN / HOLD TO REPEAT';
    hint.setAttribute('aria-hidden', 'true'); animal.append(hint);
    animal.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      begin(animal);
    });
    // Assistive technology can dispatch click without a pointer or key event.
    animal.addEventListener('click', event => { if (event.detail === 0 && !held) call(animal); });
    animal.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault(); if (!event.repeat) begin(animal);
    });
    animal.addEventListener('keyup', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); release(); }
    });
    animal.addEventListener('blur', release);
    animal.addEventListener('pointerleave', release);
  });
  addEventListener('pointerup', release);
  addEventListener('pointercancel', () => { release(); quiet(); });
  addEventListener('blur', () => { release(); quiet(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { release(); quiet(); } });
})();
