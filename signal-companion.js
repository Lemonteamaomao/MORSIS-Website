/* A quiet companion to the archive, rather than another navigation card. */
(() => {
 const title=document.getElementById('signalCompanionName'),spectrum=document.getElementById('signalSpectrum');
 if(!title||!spectrum)return;
 const profiles={
  bird:{name:'Bird',caption:'Little phrases, rising notes, and space between each call.',rhythm:'Short phrases',tone:'Bright & melodic',listen:'Notice the pauses between chirps.'},
  whale:{name:'Whale',caption:'Long, unhurried tones that rise and fall through the water.',rhythm:'Slow & sustained',tone:'Low & resonant',listen:'Follow the gradual change in pitch.'},
  dolphin:{name:'Dolphin',caption:'Curving whistles with quick bursts of crisp clicks.',rhythm:'Whistles & click trains',tone:'Clear & sweeping',listen:'Hear the clicks between the whistles.'}
 };
 function update(){
  const kind=document.querySelector('[data-species].selected')?.dataset.species||'bird',profile=profiles[kind];
  title.textContent=profile.name;
  document.getElementById('signalCompanionCaption').textContent=profile.caption;
  document.getElementById('signalCompanionDetails').innerHTML='<div><dt>Rhythm</dt><dd>'+profile.rhythm+'</dd></div><div><dt>Tone</dt><dd>'+profile.tone+'</dd></div><div class="companion-prompt"><dt>Listen for</dt><dd>'+profile.listen+'</dd></div>';
  let marks='';
  for(let x=8;x<314;x+=6){
   for(let band=0;band<7;band++){
    const phrase=kind==='bird'?Math.max(0,Math.sin(x*.085))**3:kind==='whale'?.55+.4*Math.sin(x*.016):.3+.7*Math.max(0,Math.sin(x*.055));
    const ridge=kind==='whale'?4+Math.sin(x*.018)*1.3:kind==='dolphin'?2+Math.sin(x*.025)*2:2+Math.sin(x*.06)*1.8;
    const strength=phrase*Math.exp(-Math.pow(band-ridge,2)*.8);
    if(strength>.06)marks+='<rect x="'+x+'" y="'+(18+band*20)+'" width="3" height="12" rx="1.5" fill="'+(band>3?'#b7a4ec':'#a6dceb')+'" opacity="'+(.12+strength*.8).toFixed(2)+'"/>';
   }
  }
  spectrum.innerHTML=marks;
  document.getElementById('companionListen').setAttribute('aria-label','Play '+profile.name.toLowerCase()+' signal');
 }
 document.querySelectorAll('[data-species]').forEach(button=>button.addEventListener('click',update));
 document.getElementById('companionListen').addEventListener('click',()=>document.getElementById('play').click());
 update();
})();
