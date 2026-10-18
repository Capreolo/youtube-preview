/* Seek-safe teaching diagrams. Timing belongs to the composition, never a clock. */
window.PhilosophyMotion = {
  animate(tl, rootSelector, beats) {
    const root = document.querySelector(rootSelector);
    if (window.PhilosophyCraft && !root.querySelector('[data-art-version="4"]')) window.PhilosophyCraft.decorate(root, tl, beats);
    beats.forEach((beat) => {
      const el = root.querySelector('[data-beat="' + beat.id + '"]');
      if (!el) throw new Error('Missing teaching beat: ' + beat.id);
      const t = beat.start, d = beat.duration;
      const cue = (value) => Number(value) * (beat.cue_scale || 1);
      // A short fade begins before the word so the named object is visible as
      // it is spoken. Anchors are actual ASR word times, not paper estimates.
      const anchored = (part) => {
        const named=part.closest('[data-anchor]');
        const at=named && beat.word_anchors?.[named.dataset.anchor];
        if(typeof at!=='number')return null;
        const texts=[...named.querySelectorAll('text')];
        const longest=Math.max(0,...texts.map(n=>n.textContent.trim().length));
        const reading=longest/15+1.5;
        return Math.max(0,Math.min(at-.35,d-reading-.75));
      };
      tl.fromTo(el, {opacity: 0}, {opacity: 1, duration: .26, ease: 'none'}, t);
      const heading = el.querySelector('.heading');
      if (heading) tl.fromTo(heading, {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: .65, ease: 'power3.out'}, t + .12);
      const parts = [...el.querySelectorAll('.reveal')];
      parts.forEach((part, i) => {
        const at = t + (anchored(part) ?? (part.dataset.enter !== undefined ? cue(part.dataset.enter) : .45 + (i / Math.max(1, parts.length)) * Math.min(d * .58, 5.2)));
        tl.fromTo(part, {opacity: 0}, {opacity: 1, duration: .6, ease: 'power2.out'}, at);
        const wordTime=beat.word_anchors?.[part.dataset.anchor];
        if(typeof wordTime==='number')tl.fromTo(part,{filter:'brightness(1)'},
          {filter:'brightness(1.35)',duration:.22,repeat:1,yoyo:true,ease:'sine.inOut'},t+wordTime);
        if (part.dataset.exit !== undefined) tl.to(part,{opacity:0,duration:.4},t+cue(part.dataset.exit));
      });
      const paths = [...el.querySelectorAll('.draw')];
      paths.forEach((path, i) => {
        const length = path.getTotalLength ? path.getTotalLength() : 1000;
        const base=path.dataset.enter !== undefined ? cue(path.dataset.enter) : .6 + (i/Math.max(1,paths.length))*Math.min(d*.42,3);
        const begin=Math.max(base,anchored(path) ?? 0);
        tl.fromTo(path, {strokeDasharray: length, strokeDashoffset: length},
          {strokeDashoffset: 0, duration: Math.max(.1,Math.min(3.8, d * .38,d-begin-.35)), ease: 'power1.inOut'},t+begin);
      });
      el.querySelectorAll('.move').forEach((part) => {
        const start=cue(part.dataset.moveStart||1),duration=Math.min(cue(part.dataset.moveDuration||3),d-start-.3);
        tl.fromTo(part,{x:Number(part.dataset.xFrom||0),y:Number(part.dataset.yFrom||0)},
          {x:Number(part.dataset.xTo||0),y:Number(part.dataset.yTo||0),duration:Math.max(.1,duration),ease:'power2.inOut'},t+start);
      });
      el.querySelectorAll('.turn').forEach((part, i) => {
        tl.fromTo(part, {rotation: -8 + i * 4}, {rotation: 18 + i * 4, svgOrigin: '800 490', duration: d - .5, ease: 'none'}, t + .2);
      });
      el.querySelectorAll('.grow').forEach((part, i) => {
        tl.fromTo(part, {scaleX: .08, transformOrigin: 'left center'}, {scaleX: 1, duration: Math.min(d * .64, 6), ease: 'power2.inOut'}, t + .55 + i * .45);
      });
      el.querySelectorAll('.lift').forEach((part, i) => {
        tl.fromTo(part, {y: 28 + i * 8}, {y: -14 - i * 6, duration: d - .5, ease: 'sine.inOut'}, t + .2);
      });
      el.querySelectorAll('[data-art-camera]').forEach((part) => {
        tl.fromTo(part, {scale:Number(part.dataset.scaleFrom||1), x:0},
          {scale:Number(part.dataset.scaleTo||1),x:Number(part.dataset.panTo||0),duration:Math.max(.1,d-.8),ease:'sine.inOut'},t+.25);
      });
      el.querySelectorAll('[data-art-wipe]').forEach((part) => {
        tl.fromTo(part,{clipPath:'inset(0% 84% 0% 0%)'},
          {clipPath:'inset(0% 0% 0% 0%)',duration:Math.min(5.2,d*.68),ease:'sine.inOut'},t+.7);
      });

      // V5: articulate source objects and register explanation to their parts.
      // Fractions use the actual locked beat duration; original ASR cues stay intact.
      el.querySelectorAll('.v5-art-part[data-act-start]').forEach((part) => {
        const start=d*Number(part.dataset.actStart), span=Math.min(d*Number(part.dataset.actSpan||.76),d-start-.08);
        const f={x:Number(part.dataset.actXFrom||0),y:Number(part.dataset.actYFrom||0),rotation:Number(part.dataset.actRotationFrom||0)};
        const z={x:Number(part.dataset.actXTo||0),y:Number(part.dataset.actYTo||0),rotation:Number(part.dataset.actRotationTo||0),duration:Math.max(.1,span),ease:'sine.inOut'};
        tl.fromTo(part,f,z,t+start);
      });
      el.querySelectorAll('.v5-trace-path').forEach((path) => {
        const len=path.getTotalLength?path.getTotalLength():1000;
        const start=d*Number(path.dataset.teachStart||.25),span=Math.min(d*Number(path.dataset.teachDuration||.38),d-start-.12);
        tl.fromTo(path,{strokeDasharray:len,strokeDashoffset:len,opacity:.88},
          {strokeDashoffset:0,duration:Math.max(.1,span),ease:'sine.inOut'},t+start);
        // One continuing light drift supports a visible flow only on the use diagram.
        if(path.closest('[data-trace-role="water-purpose"]')){
          tl.to(path,{strokeDasharray:'7 13',strokeDashoffset:-54,duration:Math.max(.1,d-start-span-.08),ease:'none'},t+start+span);
        }
      });
      el.querySelectorAll('.v5-lunar-phase').forEach((phase) => {
        if(Number(phase.dataset.phaseIndex)===0)return;
        const start=d*Number(phase.dataset.phaseStart),span=d*Number(phase.dataset.phaseSpan||.32);
        // Curved fronts reveal actual exposure pixels on one fixed lunar body.
        // This is an editorial phase demonstration, not synthesized moving footage.
        tl.fromTo(phase,{clipPath:'ellipse(95% 0% at 50% 0%)'},
          {clipPath:'ellipse(95% 150% at 50% 0%)',duration:Math.min(span,d-start-.08),ease:'sine.inOut'},t+start);
      });
      if (beat.endFade !== false) tl.to(el, {opacity: 0, duration: .23, ease: 'none'}, t + d - .23);
    });
    return tl;
  }
};
