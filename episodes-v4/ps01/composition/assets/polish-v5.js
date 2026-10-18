/* Local V5 adapter. Every action belongs to the existing paused timeline.
 * Source art remains immutable. Layer articulation is editorial explanation,
 * not documentary footage, a simulated experiment or a moving human portrait.
 */
(() => {
  const owner = window.PhilosophyMotion;
  if (!owner || owner.__polishV5) return;
  const original = owner.animate;
  owner.__polishV5 = true;
  owner.animate = function (tl, rootSelector, beats) {
    original.call(this, tl, rootSelector, beats);
    const root = document.querySelector(rootSelector);
    beats.forEach(beat => {
      const el = root.querySelector('[data-beat="' + beat.id + '"]');
      if (!el) return;
      const scale = beat.cue_scale || 1;
      const timing = node => {
        const local = Math.max(0, Math.min(beat.duration - 1.0,
          Number(node.dataset.v5At || 0) * scale));
        return { at: beat.start + local,
          duration: Math.max(.18, Math.min(1.45, (beat.duration - local - .28) * .52)) };
      };
      el.querySelectorAll('[data-v5-piece]').forEach(part => {
        const {at, duration} = timing(part);
        const kind = part.dataset.v5Piece;
        const origin = part.dataset.v5Origin || '0 0';
        const side = /left/.test(kind) ? -1 : 1;
        if (/page-(left|right)/.test(kind)) {
          // Two real page halves hinge at their actual source crease.
          tl.fromTo(part, {rotation: side * 7, scaleX: .91, svgOrigin: origin},
            {rotation: 0, scaleX: 1, svgOrigin: origin, duration, ease: 'sine.inOut'}, at);
        } else if (kind === 'rose-part') {
          const max = Number(part.dataset.v5MaxRotation || 0);
          const sign = /left/.test(part.dataset.v5Part || '') ? -1 : 1;
          if (max) tl.fromTo(part, {rotation: sign * max, svgOrigin: origin},
            {rotation: 0, svgOrigin: origin, duration, ease: 'sine.inOut'}, at);
        } else if (kind === 'page-sheet') {
          tl.fromTo(part, {scaleY: .88, skewX: -3, svgOrigin: origin},
            {scaleY: 1, skewX: 0, svgOrigin: origin, duration, ease: 'sine.inOut'}, at);
        } else if (kind === 'material-stratum') {
          // A visible separation of real material strata makes divisio tangible.
          const index = Number(part.dataset.v5Index || 0);
          tl.fromTo(part, {y: (index - 1) * 38, svgOrigin: origin},
            {y: 0, svgOrigin: origin, duration, ease: 'sine.inOut'}, at);
        }
      });
      el.querySelectorAll('[data-v5-outline]').forEach(path => {
        const {at, duration} = timing(path);
        const length = path.getTotalLength();
        if (!(length > 0 && Number.isFinite(length))) return;
        tl.fromTo(path, {strokeDasharray: length, strokeDashoffset: length},
          {strokeDashoffset: 0, duration, ease: 'sine.inOut'}, at);
        tl.to(path, {strokeOpacity: .24, duration: .35, ease: 'sine.inOut'}, at + duration);
      });
      el.querySelectorAll('[data-v5-flow]').forEach(dot => {
        const {at, duration} = timing(dot);
        const points = JSON.parse(dot.dataset.v5Flow);
        if (points.length < 2) return;
        const step = duration / (points.length - 1);
        tl.set(dot, {opacity: 0}, beat.start);
        tl.set(dot, {opacity: .85, attr: {cx: points[0][0], cy: points[0][1]}}, at);
        points.slice(1).forEach((point, index) => tl.to(dot,
          {attr: {cx: point[0], cy: point[1]}, duration: step, ease: 'none'}, at + step * index));
        tl.to(dot, {opacity: 0, duration: .25, ease: 'sine.inOut'}, at + duration);
      });
      if (/^ps01-c02-b0[123]$/.test(beat.id)) {
        const marker = el.querySelector('circle');
        if (marker) tl.fromTo(marker, {attr: {r: 2}},
          {attr: {r: 8}, duration: .8, ease: 'sine.inOut'}, beat.start + .8);
        el.querySelectorAll('rect[fill="#9E805B"]').forEach((strip, i) =>
          tl.fromTo(strip, {attr: {width: 0}},
            {attr: {width: 90}, duration: .9, ease: 'sine.inOut'}, beat.start + (3.2 + i * .45) * scale));
      }
    });
    return tl;
  };
})();
