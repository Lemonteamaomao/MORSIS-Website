(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Independent silhouettes, with no shared SVG gradient IDs between instruments.
  const shapes = window.morsisAnimalShapes;
  const mask = document.createElement('canvas'); mask.width = 480; mask.height = 300;
  const m = mask.getContext('2d', {willReadFrequently:true});
  const paths = Object.fromEntries(Object.entries(shapes).map(([kind, parts]) => [kind,
    Object.fromEntries(Object.entries(parts).map(([name, path]) => [name, new Path2D(path)]))]));
  const views = [];
  function install(host, kind) {
    host.replaceChildren();
    const canvas = document.createElement('canvas');
    canvas.className = 'ascii-animal';
    if (host.id === 'archiveArt' && kind === 'whale') canvas.style.transform = 'scaleX(-1)';
    canvas.width = 960; canvas.height = 600;
    canvas.setAttribute('role','img'); canvas.setAttribute('aria-label', 'Animated character illustration of a ' + kind);
    host.append(canvas);
    const old = views.findIndex(view => view.host === host);
    if (old !== -1) views.splice(old, 1);
    views.push({host, kind, canvas, ctx:canvas.getContext('2d'), phase:0, speed:1, resonance:0});
  }
  // Existing species controls continue to update the same illustration hosts.
  Object.keys(shapes).forEach(kind => {animals[kind] = '<span data-character-animal="' + kind + '"></span>';});
  const hosts = [document.getElementById('animalArt'), document.getElementById('archiveArt')];
  hosts.forEach(host => {
    new MutationObserver(() => {
      const marker = host.querySelector('[data-character-animal]');
      if (marker) install(host, marker.dataset.characterAnimal);
    }).observe(host, {childList:true});
    install(host, 'bird');
  });
  let previousFrame;
  let lastPaint=-Infinity;
  function render(ms) {
    if(document.hidden || ms-lastPaint<40){requestAnimationFrame(render);return;}
    lastPaint=ms;
    const dt = previousFrame === undefined ? 0 : Math.min(.05, (ms - previousFrame) / 1000);
    previousFrame = ms;
    const time = reduced ? 0 : ms * .001;
    views.forEach(view => {
      const {host, kind, ctx} = view;
      const bounds = host.getBoundingClientRect();
      if (!bounds.width || bounds.bottom < 0 || bounds.top > innerHeight) return;
      const active = host.closest('.sounding') !== null;
      const stage = host.closest('.resonance-stage');
      const level = stage ? Number(stage.dataset.level || 0) : (active ? .7 : 0);
      const targetSpeed = 1 + Math.min(1, level) * 1.3;
      view.speed += (targetSpeed - view.speed) * (1 - Math.exp(-dt / .08));
      // Integrate speed instead of multiplying elapsed time: voice changes cannot jump poses.
      if (!reduced) view.phase += dt * view.speed;
      const motion = view.phase;
      m.clearRect(0,0,480,300); m.fillStyle = '#fff';
      m.save();
      m.translate(240,150 + Math.sin(motion * 1.6) * 6);
      m.rotate(Math.sin(motion) * .035);m.translate(-240,-150);
      const shape = paths[kind];
      if (kind === 'bird') {
        ['far','wing'].forEach((part,i) => {
          m.save();m.translate(237,168);
          m.scale(1, .72 + Math.sin(motion * 3.5 + i * .3) * .26);
          m.translate(-237,-168);m.fill(shape[part]);m.restore();
        });
      }
      m.fill(shape.body); m.restore();
      const pixels = m.getImageData(0,0,480,300).data;
      ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,480,300);
      // Draw translucent, irregular contours behind the animal, never over its characters.
      const resonanceTarget = Math.max(level, active ? .16 : 0);
      view.resonance += (resonanceTarget - view.resonance) * (1 - Math.exp(-dt / .18));
      if (view.resonance > .005) {
        ctx.save();
        for (let ring = 0; ring < 4; ring++) {
          const pulse = reduced ? ring / 4 : (motion * .24 + ring / 4) % 1;
          const expansion = .76 + pulse * .24;
          const opacity = Math.min(.85, view.resonance * 1.45) * Math.sin(pulse * Math.PI);
          ctx.strokeStyle = `hsla(${185 + ring * 24 + time * 8},90%,86%,${opacity})`;
          ctx.lineWidth = 1.2 + view.resonance * 1.1;
          ctx.shadowColor = `hsla(${185 + ring * 24 + time * 8},90%,78%,.55)`;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          for (let step = 0; step <= 180; step++) {
            const angle = step / 180 * Math.PI * 2;
            const ripple = Math.sin(angle * 3 + motion * 1.2 + ring) * 5
              + Math.sin(angle * 7 - motion * 1.6) * (2 + view.resonance * 5)
              + Math.cos(angle * 11 + motion * .8) * view.resonance * 2;
            const x = 240 + Math.cos(angle) * (211 * expansion + ripple);
            const y = 150 + Math.sin(angle) * (119 * expansion + ripple * .7);
            if (step === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          }
          ctx.closePath();ctx.stroke();
        }
        ctx.restore();
      }
      ctx.font = 'bold 6.5px monospace';ctx.textAlign = 'center';ctx.textBaseline = 'middle';
      const glyphs = '+*#%#';
      for (let y=24;y<275;y+=6) for (let x=24;x<450;x+=5) {
        if (pixels[(y*480+x)*4+3] < 100) continue;
        const texture = (Math.sin(x*.067+y*.051)+1)*.5;
        const shimmer = .94 + Math.sin(x*.06-y*.04+time*2)*.06;
        // A slow prismatic sweep moves through the character silhouette.
        const hue = (time * 22 + x * .24 + y * .16 + (kind === 'whale' ? 35 : kind === 'dolphin' ? 70 : 0)) % 360;
        ctx.fillStyle = `hsla(${hue},90%,86%,${shimmer})`;
        const swim = kind === 'bird' ? 0 : Math.sin(x*.025-motion*2)*4;
        ctx.fillText(glyphs[Math.min(4, Math.floor(texture*5))],x,y+swim);
      }
    });
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  if (reduced || !matchMedia('(pointer:fine)').matches) return;
  const cursor = document.createElement('canvas');cursor.className='cursor-frequency';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  const c=cursor.getContext('2d');let trail=[],pointer=null,last=0;
  function resize(){const ratio=Math.min(devicePixelRatio||1,2);cursor.width=innerWidth*ratio;cursor.height=innerHeight*ratio;c.setTransform(ratio,0,0,ratio,0,0)}
  resize();addEventListener('resize',resize);
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY};trail.push({...pointer,born:performance.now()});trail=trail.slice(-36);last=performance.now()},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer=null});
  addEventListener('blur',()=>{pointer=null;trail=[]});
  function draw(now){
    c.clearRect(0,0,innerWidth,innerHeight);trail=trail.filter(p=>now-p.born<450);
    for(let i=1;i<trail.length;i++){
      const p=trail[i],before=trail[i-1],life=1-(now-p.born)/450;
      c.strokeStyle=`rgba(255,220,239,${life*.55})`;c.lineWidth=1;c.beginPath();c.moveTo(before.x,before.y);c.lineTo(p.x,p.y);c.stroke();
    }
    if(pointer && now-last<2000){
      const fade=Math.min(1,(2000-(now-last))/500);
      c.strokeStyle=`rgba(205,235,255,${fade*.8})`;c.beginPath();
      for(let x=-28;x<=28;x+=2){const envelope=Math.exp(-x*x/200);const y=Math.sin(x*.55-now*.012)*envelope*9;x===-28?c.moveTo(pointer.x+x,pointer.y+y):c.lineTo(pointer.x+x,pointer.y+y)}c.stroke();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
