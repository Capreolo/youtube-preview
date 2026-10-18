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
        const at = t + (part.dataset.v7At !== undefined ? Number(part.dataset.v7At) : (anchored(part) ?? (part.dataset.enter !== undefined ? cue(part.dataset.enter) : .45 + (i / Math.max(1, parts.length)) * Math.min(d * .58, 5.2))));
        tl.fromTo(part, {opacity: 0}, {opacity: 1, duration: .6, ease: 'power2.out'}, at);
        const wordTime=beat.word_anchors?.[part.dataset.anchor];
        if(typeof wordTime==='number')tl.fromTo(part,{filter:'brightness(1)'},
          {filter:'brightness(1.35)',duration:.22,repeat:1,yoyo:true,ease:'sine.inOut'},t+wordTime);
        if (part.dataset.exit !== undefined) tl.to(part,{opacity:0,duration:.4},t+cue(part.dataset.exit));
      });
      const paths = [...el.querySelectorAll('.draw')];
      paths.forEach((path, i) => {
        const length = path.getTotalLength ? path.getTotalLength() : 1000;
        const base=path.dataset.v7At !== undefined ? Number(path.dataset.v7At) : (path.dataset.enter !== undefined ? cue(path.dataset.enter) : .6 + (i/Math.max(1,paths.length))*Math.min(d*.42,3));
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
        const start=part.dataset.v7At !== undefined ? Number(part.dataset.v7At) : d*Number(part.dataset.actStart);
        const span=Math.min(part.dataset.v7Span !== undefined ? Number(part.dataset.v7Span) : d*Number(part.dataset.actSpan||.76),d-start-.08);
        const f={x:Number(part.dataset.actXFrom||0),y:Number(part.dataset.actYFrom||0),rotation:Number(part.dataset.actRotationFrom||0)};
        const z={x:Number(part.dataset.actXTo||0),y:Number(part.dataset.actYTo||0),rotation:Number(part.dataset.actRotationTo||0),duration:Math.max(.1,span),ease:'sine.inOut'};
        tl.fromTo(part,f,z,t+start);
      });
      el.querySelectorAll('.v5-trace-path').forEach((path) => {
        const len=path.getTotalLength?path.getTotalLength():1000;
        const start=path.dataset.v7At !== undefined ? Number(path.dataset.v7At) : d*Number(path.dataset.teachStart||.25);
        const span=Math.min(path.dataset.v7Span !== undefined ? Number(path.dataset.v7Span) : d*Number(path.dataset.teachDuration||.38),d-start-.12);
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
      // V7 authored diagrams: every relation has its own spoken anchor and finite clock.
      el.querySelectorAll('.v7-enter').forEach((part) => {
        const at=Number(part.dataset.v7At||0);
        tl.fromTo(part,{opacity:0},{opacity:1,duration:.42,ease:'sine.out'},t+at);
        if(part.dataset.v7Out !== undefined)tl.to(part,{opacity:0,duration:.08,ease:'none'},t+Number(part.dataset.v7Out));
      });
      el.querySelectorAll('[data-v7-draw-at]').forEach((path) => {
        const at=Math.min(Number(path.dataset.v7DrawAt),d-.25);
        const len=path.getAttribute('pathLength')==='1'?1:path.getTotalLength();
        const span=Math.max(.1,Math.min(Number(path.dataset.v7DrawSpan||1.3),d-at-.12));
        tl.fromTo(path,{strokeDasharray:len,strokeDashoffset:len,opacity:.08},
          {strokeDashoffset:0,opacity:.92,duration:span,ease:'sine.inOut'},t+at);
      });
      el.querySelectorAll('.v7-bar').forEach((bar) => {
        const at=Number(bar.dataset.v7At||.4),enter=Number(bar.dataset.v7BarEnter||.2);
        tl.fromTo(bar,{opacity:0},{opacity:1,duration:.3,ease:'none'},t+enter);
        tl.fromTo(bar,{scaleX:Number(bar.dataset.v7BarFrom||.03),svgOrigin:bar.dataset.v7Pivot},
          {scaleX:Number(bar.dataset.v7BarTo||1),svgOrigin:bar.dataset.v7Pivot,duration:Math.min(Number(bar.dataset.v7BarSpan||1.4),d-at-.15),ease:'sine.inOut'},t+at);
      });
      // Original vector objects retain authored outer transforms. Their inner
      // anatomical/work layers are animated in local coordinates by attributes.
      el.querySelectorAll('.v7-vector-act').forEach((part) => {
        const at=Number(part.dataset.v7At||.5),span=Math.max(.1,Math.min(Number(part.dataset.v7Span||1.8),d-at-.2));
        const pivot=(part.dataset.v7Pivot||'0 0').split(/\s+/).map(Number),turn=Number(part.dataset.v7Turn||.65);
        tl.fromTo(part,{attr:{transform:`rotate(0 ${pivot[0]} ${pivot[1]})`}},
          {attr:{transform:`rotate(${turn} ${pivot[0]} ${pivot[1]})`},duration:span,ease:'sine.inOut'},t+at);
      });
      el.querySelectorAll('[data-v7-vector-show]').forEach((part) => {
        const at=Number(part.dataset.v7At||1.8);
        tl.fromTo(part,{opacity:0},{opacity:1,duration:Math.min(1.6,d-at-.15),ease:'sine.inOut'},t+at);
      });
      el.querySelectorAll('[data-v7-reject-erasure]').forEach((part) => {
        const at=Number(part.dataset.v7RejectErasure);
        tl.fromTo(part,{opacity:1},{opacity:.22,duration:.65,ease:'sine.inOut'},t+at);
        tl.to(part,{opacity:1,duration:.75,ease:'sine.inOut'},t+Math.min(at+1.0,d-1.1));
      });
      if (beat.endFade !== false) tl.to(el, {opacity: 0, duration: .23, ease: 'none'}, t + d - .23);
    });
    return tl;
  }
};
