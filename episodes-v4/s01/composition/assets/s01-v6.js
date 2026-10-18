(() => {
  const T=window.S01Timing;
  window.__timelines=window.__timelines||{};
  window.__hf=window.__hf||{};
  window.__hf.buildReady=window.__hf.buildReady||{};
  const clean=t=>t.toLowerCase().replace(/[^a-z]/g,'');
  const cue=(b,word)=>T.words.find(w=>w.start>=T.beats[b].spoken_start-.001&&w.start<T.beats[b].spoken_end&&clean(w.text)===clean(word))?.start??T.beats[b].start;
  window.__hf.buildReady['s01-main']=Promise.all([document.fonts.ready,window.S01RoseReady]).then(([,rose])=>{
    const tl=gsap.timeline({paused:true,defaults:{ease:'sine.inOut'}});
    function appear(target,at,duration=.9){tl.to(target,{opacity:1,duration},at)}
    function leave(target,at,duration=.8){tl.to(target,{opacity:0,duration},at)}
    function draw(target,at,duration=1.5,stagger=.09){
      appear(target,at,.35);
      tl.to(`${target} .draw`,{strokeDashoffset:0,duration,stagger,ease:'power1.inOut'},at);
    }
    // A: start at the physical thorn, then discover the entire living rose.
    appear('#opening',.18,1.25);
    draw('#thorn-focus',cue(0,'thorns'),1.1,.08);appear('#thorn-label',1.9,.6);
    leave('#thorn-focus,#thorn-label',3.15,.7);
    draw('#mind-study',3.65,1.65,.17);
    draw('#mind-register',5.52,1.3,.14);
    leave('#mind-study,#mind-register',8.9,.9);
    tl.to('.paper-light',{x:25,y:-30,duration:58,ease:'none'},0);
    tl.to('#marginalia .s01-v6-marginalia-stem',{strokeDashoffset:0,duration:2.8,stagger:.12},.5);
    tl.to('#marginalia .s01-v6-marginalia-tendril',{strokeDashoffset:0,duration:2.8,stagger:.13},1.1);
    tl.to('#marginalia .s01-v6-marginalia-leaf',{strokeDashoffset:0,duration:2.1,stagger:.12},2.1);
    tl.to('#marginalia .s01-v6-marginalia-vein,#marginalia .s01-v6-marginalia-hatch',{strokeDashoffset:0,duration:1.6,stagger:.08},3.5);
    // B: a carefully masked painting enters only for the human act of knowing.
    leave('#opening',8.9,1);appear('#reception-title',10.2,1.1);
    tl.fromTo('#observer',{x:-85,y:285,opacity:0},{x:0,y:230,opacity:1,duration:2.4,ease:'power2.out',immediateRender:false},9.6);
    tl.set('#observer-halo',{y:230},0);
    appear('#observer-halo',10.3,1.5);
    tl.to('#s01-observer-page',{rotation:-.35,svgOrigin:'1242 2598',duration:2.1},12.8);
    tl.to('#s01-observer-page',{rotation:0,duration:1.9},15);
    draw('#outside-rule',cue(1,'matter'),1.4);appear('#matter-label',13.8);
    tl.set('#recognition',{x:-140,y:330},0);
    draw('#reception-connection',cue(1,'What'),1.8,.12);
    draw('#recognition',cue(1,'becomes'),1.8,.16);
    tl.to('.knowledge-node',{opacity:1,duration:.6,stagger:.25},18);
    leave('#reception-title',19.1,.8);
    tl.to('#observer',{x:-55,y:335,opacity:0,duration:1.7},19.3);
    leave('#observer-halo,#outside-rule,#matter-label,#reception-connection',19.5,.9);
    // C: the plant becomes a botanical scene; roots take hold in the ground.
    tl.set('#ground',{x:198,y:182},0);
    appear('#ground',20.5,1);
    tl.to('#ground .ground-draw',{strokeDashoffset:0,duration:2.6,stagger:.06},20.7);
    tl.to('#recognition',{x:110,y:150,opacity:.55,duration:2.9},23.6);
    tl.fromTo('#real-label',{x:-95,y:60,opacity:0},{x:0,y:0,opacity:1,duration:1.1,immediateRender:false},cue(2,'garden'));
    tl.fromTo('#known-label',{x:40,y:0,opacity:0},{x:0,y:0,opacity:1,duration:1.3,immediateRender:false},cue(2,'know'));
    draw('#act-of-knowing',26.943170732,1.3,.18);
    // D: one organism becomes the root of two explanatory branches.
    leave('#ground,#recognition,#act-of-knowing',29.3,.8);
    appear('#distinction',29.95,1.15);draw('#two-modes',31.1,1.75,.19);
    appear('#one-label',33.4,.8);leave('#one-label',36.8,.8);
    leave('#distinction,#two-modes,#real-label,#known-label',38.5,.85);
    // E: an independent dark close-up traces intentional reference all the
    // way to the external object. The intermediate likeness never replaces it.
    appear('#forest-field',38.9,1.3);tl.to('#marginalia',{opacity:.26,duration:1.3},38.9);
    tl.set('.relation-line,.relation-tip,.relation-echo,#likeness-mark path,#object-resolve path',{stroke:'#D5B877'},38.9);
    appear('#intellect-label',39.6,.9);
    draw('#intentional-relation',cue(4,'reaches'),1.65,.2);
    appear('#object-tip,#res-label',42.1,.45);
    draw('#likeness-mark',cue(4,'through'),1.35,.12);appear('#likeness-label',43.25,.65);
    tl.to('#likeness-mark,#likeness-label',{opacity:.3,duration:1.2},cue(4,'replace'));
    draw('#object-resolve',46.5,1.2,.1);
    // F: return to the person at a new scale. Person and external rose keep
    // their identities; only a restrained page movement accompanies reception.
    leave('#likeness-mark,#likeness-label,#intentional-relation,#object-resolve,#intellect-label,#res-label',49.1,.9);
    leave('#forest-field',49.1,1.4);tl.to('#marginalia',{opacity:.65,duration:1.4},49.1);
    tl.set('#observer',{x:-12,y:430,scale:1.04,opacity:0},49);
    tl.to('#observer',{x:0,y:380,scale:1.04,opacity:1,duration:2},50);
    appear('#closing',50.7,.8);
    tl.fromTo('#closing-first',{opacity:0,y:18},{opacity:1,y:0,duration:1.2,immediateRender:false},51.05);
    tl.fromTo('#closing-last',{opacity:0,y:18},{opacity:1,y:0,duration:1.2,immediateRender:false},54.6);
    tl.to('#s01-observer-page',{rotation:.35,svgOrigin:'1242 2598',duration:1.9},52.1);
    tl.to('#s01-observer-page',{rotation:0,duration:2.2},54);
    tl.to('#observer-halo',{opacity:.8,y:370,duration:2},51.5);
    draw('#final-reception',cue(5,'receives'),1.5,.17);
    tl.to('#final-reception',{opacity:.58,duration:1.7},54.6);
    const clock={time:0};
    tl.to(clock,{time:58,duration:58,ease:'none',onUpdate:()=>rose.renderAt(clock.time)},0);
    window.S01Rose=rose;
    window.S01Art={version:6,scenes:1,visualModes:6,canonicalRose3D:true,observer:'Van der Neer — The Reader',continuousStage:true,timing:T};
    window.__timelines['s01-main']=tl;
  });
})();
