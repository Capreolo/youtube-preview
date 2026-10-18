/* Original engraved ornament and material treatment. All motion belongs to the
   chapter's existing paused timeline; seeking never depends on wall-clock time. */
window.PhilosophyCraft = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const theme = document.documentElement.dataset.episode || 'f1';
  const svgNode = (name, attrs = {}) => {
    const n = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => n.setAttribute(key, value));
    return n;
  };
  const corner = {
    f1: `<path d="M4 142V4H142M14 118V14H118M29 88V29H88" class="engrave"/>
      <path d="M18 116A98 98 0 0 0 116 18M29 99A74 74 0 0 0 99 29" class="filigree"/>
      <circle cx="48" cy="48" r="15" class="ornament-disc"/><path d="M48 23V73M23 48H73M31 31L65 65M31 65L65 31" class="filigree"/>
      <path d="M4 150L4 177M150 4H177M34 111L45 106M55 99L65 92M76 80L84 70M94 57L99 46" class="engrave"/>
      <path d="M117 6L124 13L117 20L110 13Z M6 117L13 124L20 117L13 110Z" class="ornament-inlay"/>`,
    c1: `<path d="M4 150V4H150M13 130V13H130" class="engrave"/>
      <path d="M28 125C27 74 82 85 81 44C80 18 43 17 43 43C43 63 65 64 68 52M28 125C45 109 60 98 81 100C116 104 112 72 92 74C74 76 77 95 90 94" class="filigree"/>
      <path d="M34 87C8 66 18 44 34 47C49 51 47 70 34 87M57 67C75 58 86 68 77 81C68 87 59 81 57 67M87 34C66 8 44 18 47 34C51 49 70 47 87 34" class="ornament-inlay"/>
      <path d="M25 25L32 19L39 25L32 32Z M123 5L130 12L137 5M5 123L12 130L5 137" class="engrave"/>`,
    o0: `<path d="M4 166V4H166M15 139V15H139" class="engrave"/>
      <path d="M28 151C29 116 66 110 56 77C46 45 65 21 92 29C113 35 102 61 89 53C77 44 97 37 102 47M28 151C68 148 91 127 87 100C82 73 113 68 126 84C140 102 118 115 111 101" class="filigree"/>
      <path d="M50 103C8 100 15 72 34 73C52 75 55 87 50 103M57 76C35 48 45 28 60 38C75 49 72 63 57 76M76 129C66 96 89 88 95 104C101 121 91 128 76 129M108 65C92 29 115 17 125 34C134 49 123 60 108 65" class="ornament-inlay"/>
      <path d="M40 139C50 127 58 124 68 125M103 77C111 67 120 64 137 67" class="filigree"/>
      <circle cx="34" cy="34" r="8" class="ornament-disc"/><circle cx="145" cy="17" r="3" class="ornament-disc"/><circle cx="17" cy="145" r="3" class="ornament-disc"/>`,
    ps01: `<path d="M4 155V4H155M15 131V15H131" class="engrave"/>
      <path d="M27 113V27H113V39H39V99H51V51H99V63H63V87H75V75H87" class="filigree"/>
      <path d="M18 153Q38 138 57 153T96 153T135 153M153 18Q138 38 153 57T153 96T153 135" class="filigree"/>
      <path d="M112 101C94 86 95 112 112 122C129 112 130 86 112 101M112 122V132M100 129H124" class="ornament-inlay"/>
      <circle cx="27" cy="27" r="3" class="ornament-disc"/>`,
    s01: `<path d="M5 145V5H145M14 108V14H108" class="engrave"/>
      <path d="M26 137C53 117 33 82 66 66C85 57 105 42 126 25M35 117C6 110 14 88 35 91C49 94 48 106 35 117M51 88C53 57 78 51 81 68C84 80 69 85 51 88M77 59C68 32 88 20 98 32C108 44 96 54 77 59M104 42C110 12 135 14 131 30C129 40 118 43 104 42" class="botanical-leaf"/>
      <path d="M38 112L30 101M60 81L72 69M84 50L91 37M112 34L124 24M27 137L42 136" class="filigree"/>
      <circle cx="35" cy="35" r="7" class="ornament-disc"/><path d="M35 20V50M20 35H50" class="filigree"/>`
  };

  function materialDefs(svg, key) {
    if (svg.dataset.craftMaterials) return;
    svg.dataset.craftMaterials = key;
    const defs = svgNode('defs');
    defs.innerHTML = `<linearGradient id="${key}-surface" x1="0" y1="0" x2=".9" y2="1">
      <stop offset="0" style="stop-color:var(--surface-high)"/><stop offset=".5" style="stop-color:var(--surface)"/><stop offset="1" style="stop-color:var(--surface-low)"/></linearGradient>
      <linearGradient id="${key}-stone" x1="0" y1="0" x2="1" y2=".65"><stop style="stop-color:var(--stone-light)"/><stop offset=".48" style="stop-color:var(--stone-mid)"/><stop offset="1" style="stop-color:var(--stone-dark)"/></linearGradient>
      <linearGradient id="${key}-water" x1="0" y1="0" x2=".5" y2="1"><stop style="stop-color:var(--water-light)"/><stop offset="1" style="stop-color:var(--water-dark)"/></linearGradient>
      <linearGradient id="${key}-metal" x1="0" y1="0" x2="1" y2=".4"><stop style="stop-color:var(--metal-shadow)"/><stop offset=".27" style="stop-color:var(--metal)"/><stop offset=".48" style="stop-color:var(--metal-light)"/><stop offset=".62" style="stop-color:var(--metal)"/><stop offset="1" style="stop-color:var(--metal-shadow)"/></linearGradient>
      <pattern id="${key}-paper" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M0 9L44 7M0 32L44 35" stroke="var(--ink)" stroke-opacity=".04" stroke-width=".7"/></pattern>`;
    svg.prepend(defs);
    const style = svgNode('style');
    style.textContent = `svg[data-craft-materials="${key}"] .surface:not([fill]):not([style*="fill"]),svg[data-craft-materials="${key}"] .node:not([fill]):not([style*="fill"]){fill:url(#${key}-surface)}
      svg[data-craft-materials="${key}"] .stone:not([fill]):not([style*="fill"]){fill:url(#${key}-stone)}
      svg[data-craft-materials="${key}"] .water:not([fill]):not([style*="fill"]){fill:url(#${key}-water)}
      svg[data-craft-materials="${key}"] .material-metal{fill:url(#${key}-metal)}`;
    svg.append(style);
  }

  function background(width, height, key) {
    const svg = svgNode('svg', {viewBox:`0 0 ${width} ${height}`, class:'craft-ground', 'aria-hidden':'true'});
    let detail = '';
    if (theme === 'f1') {
      for (let i=0;i<45;i++) {
        const x=90+(i*317)%1740, y=80+(i*179)%910, r=i%5===0?1.8:.8;
        detail+=`<circle cx="${x}" cy="${y}" r="${r}" fill="var(--fg)" opacity="${i%3===0?.3:.12}"/>`;
      }
      detail+='<g fill="none" stroke="var(--secondary)" stroke-width="1" opacity=".11"><ellipse cx="1430" cy="250" rx="475" ry="180" transform="rotate(-28 1430 250)"/><circle cx="1430" cy="250" r="316"/><circle cx="1430" cy="250" r="324"/><path d="M1350 250H1510M1430 170V330"/></g>';
    } else if (theme==='c1') {
      for(let y=92;y<height-60;y+=34) detail+=`<path d="M85 ${y}H${width-85}" stroke="var(--ink)" stroke-width=".65" opacity=".035"/>`;
      detail+='<g stroke="var(--secondary)" fill="none" opacity=".075"><circle cx="1515" cy="310" r="192"/><circle cx="1515" cy="310" r="138"/><path d="M1290 310H1740M1515 85V535"/></g>';
    } else if(theme==='o0') {
      detail+='<g stroke="var(--metal)" fill="none" opacity=".07" stroke-width="1.2"><path d="M590 1000V220Q960 -155 1330 220V1000M630 1000V240Q960 -90 1290 240V1000M685 1000V280Q960 8 1235 280V1000"/><circle cx="960" cy="290" r="112"/><circle cx="960" cy="290" r="98"/></g>';
    } else if(theme==='ps01') {
      for(let i=0;i<8;i++) detail+=`<path d="M70 ${height-98-i*8}C400 ${height-140-i*8} 660 ${height-65-i*8} 980 ${height-105-i*8}S1480 ${height-140-i*8} 1850 ${height-96-i*8}" fill="none" stroke="var(--secondary)" stroke-width="1" opacity=".045"/>`;
      detail+='<g fill="none" stroke="var(--metal)" opacity=".09"><circle cx="1540" cy="240" r="112"/><circle cx="1540" cy="240" r="99"/><path d="M1540 109V371M1409 240H1671M1470 170L1610 310M1470 310L1610 170"/></g>';
    } else {
      for(let i=0;i<17;i++) detail+=`<path d="M${70+i*58} 130Q${90+i*58} 960 ${70+i*58} 1790" stroke="var(--ink)" stroke-width=".65" opacity=".023" fill="none"/>`;
      detail+='<ellipse cx="540" cy="1000" rx="400" ry="630" fill="none" stroke="var(--secondary)" stroke-width="1.2" opacity=".08"/>';
    }
    svg.innerHTML = `<defs><pattern id="${key}-fibers" width="91" height="71" patternUnits="userSpaceOnUse"><path d="M3 17L21 16M42 48L72 50M21 67L34 66M67 7L88 8M8 41L11 59" stroke="var(--fg)" stroke-opacity=".08" stroke-width=".6"/></pattern></defs><rect width="100%" height="100%" fill="url(#${key}-fibers)"/>${detail}`;
    return svg;
  }

  function decorate(root, tl, beats) {
    if (root.querySelector(':scope > .craft-frame')) return;
    const portrait=theme==='s01', width=portrait?1080:1920,height=portrait?1920:1080;
    const key='craft-'+root.id.replace(/[^a-z0-9-]/gi,'');
    root.prepend(background(width,height,key));
    const frame=svgNode('svg',{viewBox:`0 0 ${width} ${height}`,class:'craft-frame','aria-hidden':'true'});
    const inset=portrait?36:35, size=portrait?.84:1;
    frame.innerHTML=`<g transform="translate(${inset} ${inset}) scale(${size})">${corner[theme]}</g>
      <g transform="translate(${width-inset} ${inset}) scale(${-size} ${size})">${corner[theme]}</g>
      <g transform="translate(${inset} ${height-inset}) scale(${size} ${-size})">${corner[theme]}</g>
      <g transform="translate(${width-inset} ${height-inset}) scale(${-size} ${-size})">${corner[theme]}</g>
      <path d="M${portrait?215:252} ${inset+12}H${width/2-36}M${width/2+36} ${inset+12}H${width-(portrait?215:252)}M${portrait?215:252} ${height-inset-12}H${width/2-36}M${width/2+36} ${height-inset-12}H${width-(portrait?215:252)}" class="frame-rule"/>
      <path d="M${width/2} ${inset+5}l7 7-7 7-7-7Z M${width/2} ${height-inset-19}l7 7-7 7-7-7Z" class="ornament-inlay"/>`;
    root.append(frame);
    tl.fromTo(frame,{opacity:0},{opacity:1,duration:1.1,ease:'power2.out'},0);
    frame.querySelectorAll('.engrave').forEach((path,index)=>{
      const length=path.getTotalLength();
      tl.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:1.45,ease:'power2.inOut'},.1+(index%2)*.12);
    });
    root.querySelectorAll('svg.diagram').forEach((svg,index)=>materialDefs(svg,`${key}-${index}`));
    root.dataset.artDirection='v2';
  }
  return {decorate};
})();
