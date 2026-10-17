/* Audible dolphin-inspired whistles and broadband click trains, shared by both scenes. */
(() => {
  const clickBuffers = new WeakMap();
  window.playDolphinSignal = (context, destination, start) => {
    const bus = context.createGain(), delay = context.createDelay(.2), wet = context.createGain();
    bus.gain.value = .8; delay.delayTime.value = .045; wet.gain.value = .12;
    bus.connect(destination); bus.connect(delay); delay.connect(wet).connect(destination);
    const sources = new Set(), nodes = [bus, delay, wet];
    function run(source, from, to, owned = []) {
      sources.add(source);
      source.onended = () => { sources.delete(source); source.disconnect(); owned.forEach(node => node.disconnect()); };
      source.start(from); source.stop(to);
    }
    function whistle(offset, duration, contour, volume) {
      const at = start + offset;
      const osc = context.createOscillator(), gain = context.createGain();
      const vibrato = context.createOscillator(), depth = context.createGain();
      osc.type = 'sine'; vibrato.frequency.value = 7.5; depth.gain.value = 24;
      vibrato.connect(depth).connect(osc.frequency);
      osc.frequency.setValueAtTime(contour[0], at);
      contour.slice(1).forEach((hz, i) => osc.frequency.exponentialRampToValueAtTime(hz, at + duration * (i + 1) / (contour.length - 1)));
      gain.gain.value = 0;
      gain.gain.setValueAtTime(.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume, at + .1);
      gain.gain.setValueAtTime(volume * .8, at + duration * .7);
      gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
      osc.connect(gain).connect(bus);
      run(vibrato, at, at + duration + .01, [depth]);
      run(osc, at, at + duration + .01, [gain]);
    }
    // Long curved contours, with a breath between calls, replace staccato birdlike notes.
    whistle(.1, 1.05, [2100, 2850, 4100, 3500, 2900], .095);
    whistle(1.35, .85, [3600, 3000, 2350, 2750, 3300], .075);
    let buffer = clickBuffers.get(context);
    if (!buffer) {
      const length = Math.max(32, Math.round(context.sampleRate * .003));
      buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / (length - 1)) * Math.exp(-i / length * 4);
      }
      clickBuffers.set(context, buffer);
    }
    // Short noise impulses sound like echolocation clicks rather than tiny pitched chirps.
    function clicks(offset, count, spacing) {
      let at = start + offset;
      for (let i = 0; i < count; i++) {
        const source = context.createBufferSource(), gain = context.createGain(), filter = context.createBiquadFilter();
        source.buffer = buffer; filter.type = 'highpass'; filter.frequency.value = 2200;
        gain.gain.value = .2 + (i % 3) * .025;
        source.connect(filter).connect(gain).connect(bus);
        run(source, at, at + buffer.duration, [filter, gain]);
        at += spacing * (1 - i / count * .45);
      }
    }
    clicks(0, 8, .045); clicks(1.05, 12, .035); clicks(2.2, 9, .028);
    const end = start + 2.55;
    // Audio-clock cleanup includes the final short underwater reflection.
    const completion = context.createOscillator(), silent = context.createGain();
    silent.gain.value = 0; completion.connect(silent).connect(destination);
    sources.add(completion);
    completion.onended = () => {
      sources.delete(completion); completion.disconnect(); silent.disconnect();
      nodes.forEach(node => node.disconnect());
    };
    completion.start(start); completion.stop(end);
    return {end, stop() {
      const now = context.currentTime;
      bus.gain.cancelScheduledValues(now); bus.gain.setTargetAtTime(0, now, .015);
      for (const source of sources) { try { source.stop(now + .08); } catch (_) {} }
    }};
  };
})();
