/* One waveform language for the hero, journey, microphone and archive. */
window.drawMorsisWave = (ctx, options) => {
  const {width, height, time = 0, vertical = false, offset = 0, level = .3, samples = null, pointer = null} = options;
  if (!width || !height) return;
  const length = vertical ? height : width;
  const amplitude = options.amplitude ?? (vertical ? width * .1 : height * .36);
  const center = options.center ?? (vertical ? width / 2 : height / 2);
  const total = options.totalLength || length;
  ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
  const gradient=vertical?ctx.createLinearGradient(0,-offset,0,total-offset):ctx.createLinearGradient(0,0,width,0);
  gradient.addColorStop(0,'#c0a4ff');gradient.addColorStop(.5,'#f7efff');gradient.addColorStop(1,'#8ee7f7');
  ctx.strokeStyle=gradient;
  function envelope(at){return Math.pow(.5+.5*Math.sin(at*.008-time*.65),2);}
  function sample(at){return samples?((samples[Math.min(samples.length-1,Math.floor(Math.max(0,at)/length*samples.length))]-128)/128):0;}
  function point(axis,displacement){return vertical?[center+displacement,axis]:[axis,center+displacement];}
  const spacing=7;
  for(let axis=-(offset%spacing);axis<length;axis+=spacing){
    const at=axis+offset,env=envelope(at),travel=at*.026-time*2.2;
    const detail=.22+.78*Math.abs(Math.sin(travel)*Math.cos(travel*.41)+.2*Math.sin(travel*2.7));
    const influence=pointer?Math.exp(-Math.pow((axis/length-pointer.x)*5,2))*pointer.strength:0;
    let strength;
    if(samples){strength=0;for(let j=0;j<5;j++)strength=Math.max(strength,Math.abs(sample(Math.min(length,Math.max(0,axis+j-2)))));}
    else strength=Math.min(1,env*detail*(.35+level*.9+influence*.5));
    const size=1+amplitude*strength;
    ctx.globalAlpha=.3+(samples?Math.min(1,strength):env)*.5;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(...point(axis,-size));ctx.lineTo(...point(axis,size));ctx.stroke();
  }
  ctx.globalAlpha=.9;ctx.lineWidth=1.2;ctx.beginPath();
  for(let axis=0;axis<=length;axis+=2){
    const at=axis+offset;
    const signal=samples?sample(axis):Math.sin(at*.19-time*5)*.35*envelope(at)*(.35+level*.9);
    const p=point(axis,signal*amplitude);
    if(axis===0)ctx.moveTo(...p);else ctx.lineTo(...p);
  }
  ctx.stroke();ctx.restore();
};
