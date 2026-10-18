import * as THREE from './vendor/three.module.js';
import {createRose} from './s01-rose-geometry-v6.mjs';

// The original channel rose is restaged for S01. Every pose is a function of
// narration time; there is no wall clock, playback loop or perpetual turntable.
const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t)};
const poses=[
  {t:0,x:510,y:220,s:3.05,ry:-.12,rx:.0,bloom:.98},
  {t:2.5,x:500,y:240,s:3.05,ry:.06,rx:.0,bloom:.98},
  {t:5.8,x:380,y:1020,s:1.16,ry:-.30,rx:.06,bloom:1},
  {t:8.7,x:380,y:1010,s:1.17,ry:-.36,rx:.06,bloom:1},
  {t:11.8,x:820,y:900,s:.70,ry:-.36,rx:.04,bloom:1},
  {t:18.7,x:820,y:900,s:.70,ry:-.19,rx:.04,bloom:1},
  {t:22.7,x:540,y:1015,s:1.20,ry:-.22,rx:.04,bloom:1},
  {t:27.8,x:540,y:1015,s:1.20,ry:-.05,rx:.04,bloom:1},
  {t:31.8,x:540,y:735,s:.74,ry:-.08,rx:.04,bloom:1},
  {t:37.4,x:540,y:735,s:.74,ry:-.13,rx:.04,bloom:1},
  {t:41.9,x:920,y:1180,s:1.75,ry:-.50,rx:.16,bloom:1},
  {t:47.8,x:910,y:1170,s:1.75,ry:-.67,rx:.12,bloom:1},
  {t:51.7,x:795,y:1100,s:.84,ry:-.30,rx:.04,bloom:1},
  {t:58,x:795,y:1100,s:.84,ry:-.34,rx:.04,bloom:1}
];
function poseAt(t){
  const hi=poses.findIndex(p=>p.t>t);if(hi<0)return poses.at(-1);if(!hi)return poses[0];
  const a=poses[hi-1],b=poses[hi],q=smooth((t-a.t)/(b.t-a.t));
  return Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+(b[k]-a[k])*q]));
}
export async function createS01Rose(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(1);renderer.setSize(1080,1920,false);renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;
  const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-2.7,2.7,4.8,-4.8,.1,50);
  camera.position.set(0,0,14);camera.lookAt(0,0,0);
  const rose=createRose();scene.add(rose.group);
  const hemi=new THREE.HemisphereLight('#FFF1D8','#4E5549',1.9);scene.add(hemi);
  const key=new THREE.DirectionalLight('#FFE5CE',2.65);key.position.set(-3,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight('#E1A79C',1.1);rim.position.set(4,3,-4);scene.add(rim);
  const fill=new THREE.DirectionalLight('#D9E6DC',.7);fill.position.set(3,-1,5);scene.add(fill);
  rose.petalMaterial.roughness=.72;
  // Keep the material boundary physically exact: WebGL alpha comes from
  // silhouette coverage, not a painted rectangle or a chroma-key threshold.
  const vector=new THREE.Vector3();
  function project(v){vector.copy(v).project(camera);return{x:(vector.x+1)*540,y:(1-vector.y)*960}}
  function renderAt(time){
    const t=Math.max(0,Math.min(58,Number(time)||0));const p=poseAt(t);
    rose.group.position.set((p.x-540)/200,(960-p.y)/200,0);rose.group.scale.setScalar(p.s);
    rose.group.rotation.set(p.rx,p.ry,-.025);
    rose.flower.rotation.set(.2,0,-.1);
    for(const petal of rose.petals){
      petal.pivot.position.copy(petal.original);
      // Tiny differential settling belongs to the flower, not the full plane.
      petal.pivot.rotation.x=.007*Math.sin(t*.21+petal.ring*.7);
      petal.pivot.scale.set(1,1,1);petal.wire.visible=false;petal.mesh.visible=true;
    }
    const dark=smooth((t-38.8)/1.6)*(1-smooth((t-48.8)/1.5));
    hemi.intensity=1.9-dark*.38;rim.intensity=1.1+dark*.65;
    rose.group.updateMatrixWorld(true);
    const hook=(rose.hooks||[])[2];
    const thorn=hook?project(hook.localToWorld(new THREE.Vector3(.17,.08,0))):{x:540,y:1000};
    const ring=document.getElementById('thorn-focus');
    if(ring)ring.setAttribute('transform',`translate(${thorn.x-354} ${thorn.y-1080})`);
    const label=document.getElementById('thorn-label');
    if(label){label.style.left=`${thorn.x+105}px`;label.style.top=`${thorn.y+43}px`}
    renderer.render(scene,camera);
    canvas.dataset.threeStatus='ready';canvas.dataset.threeTime=t.toFixed(3);
    canvas.dataset.threeShot=t<3?'thorn-macro':t<10?'whole-rose':t<20.4?'matter-outside':t<30?'garden':t<39.4?'two-modes':t<49.2?'corolla-reference':'retained-identities';
    canvas.dataset.thornPoint=JSON.stringify(thorn);
    canvas.dataset.pose=JSON.stringify(p);
  }
  if(renderer.compileAsync)await renderer.compileAsync(scene,camera);
  renderAt(0);
  window.addEventListener('hf-seek',e=>renderAt(e.detail.time));
  return{renderAt,renderer,scene,camera,rose,poses,project};
}
