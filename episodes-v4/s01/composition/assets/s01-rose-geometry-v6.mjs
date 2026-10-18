// S01 V7 repairs the canonical rose's botanical connections. The39 petal
// bodies and whorl arrangement remain; basal tissue, leaf attachments, veins
// and the stem/prickle skin now share their actual supporting surfaces.
// Provenance: research/s01-v6-rose-3d-provenance.json; revision-v7-rose.json.
import * as THREE from './vendor/three.module.js?v=20261018-detail-7';

// All positions derive from scene time. No RAF, random seed, external assets or
// elapsed-time simulation is involved in this scene.
const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const color = hex => new THREE.Color(hex);

function smoothCoincidentNormals(geometry) {
  const p=geometry.attributes.position,n=geometry.attributes.normal,groups=new Map();
  for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e7)).join('/');
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);
  }
  for(const indices of groups.values()){
    if(indices.length<2)continue;
    const normal=new THREE.Vector3();for(const i of indices)normal.add(new THREE.Vector3().fromBufferAttribute(n,i));
    if(normal.lengthSq()<1e-15)normal.set(0,0,1);else normal.normalize();
    for(const i of indices)n.setXYZ(i,normal.x,normal.y,normal.z);
  }
  n.needsUpdate=true;return geometry;
}

function geometryFromGrid(columns, rows, point) {
  const positions = [], colors = [], indices = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= columns; i++) {
      const p = point(i / columns, j / rows);
      positions.push(p.x, p.y, p.z);
      if (p.color) colors.push(p.color.r, p.color.g, p.color.b);
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const a = j * (columns + 1) + i, b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (colors.length) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return smoothCoincidentNormals(geometry);
}

function tube(points, radius, material, segments = 28, sides = 7) {
  const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, segments, radius, sides, false), material);
  mesh.castShadow = true;
  return mesh;
}

function taperedRoot(points, radius, material, segments = 12) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const sides=8;
  const geometry = new THREE.TubeGeometry(curve, segments, radius, sides, false);
  const positions = geometry.getAttribute('position');
  const center = new THREE.Vector3();
  for (let ring = 0; ring <= segments; ring++) {
    const t = ring / segments;
    curve.getPointAt(t, center);
    const taper = Math.pow(1 - t, .82) * .92 + .08;
    for (let side = 0; side <= sides; side++) {
      const index = ring * (sides+1) + side;
      positions.setXYZ(index,
        center.x + (positions.getX(index) - center.x) * taper,
        center.y + (positions.getY(index) - center.y) * taper,
        center.z + (positions.getZ(index) - center.z) * taper,
      );
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  smoothCoincidentNormals(geometry);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function petalGeometry({ width, length, flare, curl, seed, ring, attachment }) {
  const base = color('#651d35'), body = color('#a4475a'), rim = color('#dd9991');
  return geometryFromGrid(18, 24, (s, v) => {
    const u = s * 2 - 1;
    // A wide, rounded terminal lip; the top is scalloped and rolled rather
    // than closing into the pointed tip of an ellipse.
    const silhouette = Math.pow(Math.sin(Math.PI * (.035 + .83 * v)), .75);
    const breadth = width * silhouette * (1 + .045 * Math.sin(v * 12 + seed));
    const edge = Math.pow(Math.abs(u), 2.5);
    let x = u * breadth;
    let y = length * v - .20 * edge * Math.pow(v, 4)
      + .020 * Math.sin(u * 5 + seed) * Math.sin(Math.PI * v);
    let z = flare * Math.pow(v, 1.48)
      + .16 * u * u * Math.sin(Math.PI * v)
      - .12 * (1 - u * u) * Math.sin(Math.PI * v)
      + curl * Math.pow(v, 7) * (1 - .15 * u * u)
      + .025 * Math.sin(u * 8 + seed) * Math.pow(v, 4);
    // The formerly elevated inner-whorl roots floated above the receptacle.
    // A short basal strip now reaches inside it; v>=.23 is byte-for-byte the
    // original petal surface. The visible rolled lip is not redrawn.
    const basal=1-ease(v/.23);
    x=mix(x,attachment.x+u*.012,basal);
    y=mix(y,attachment.y,basal);z=mix(z,attachment.z,basal);
    const petalColor = base.clone().lerp(body, clamp(v * 1.35))
      .lerp(rim, (.18 + .30 * Math.pow(v, 4) + .10 * edge) * (1 - ring * .075));
    petalColor.multiplyScalar(.96 + .055 * Math.sin(seed * 2.3));
    return { x, y, z, color: petalColor };
  });
}

function leafPoint(length,width,seed,u,t){
  const spread=Math.pow(Math.max(0,Math.sin(Math.PI*t)),.82);
  return new THREE.Vector3(u*width*spread*(1+.035*Math.sin(t*58+seed)),length*t,
    .12*Math.sin(Math.PI*t)-.19*u*u*spread+.13*t*t);
}
function leafNormal(length,width,seed,u,t){
  const du=leafPoint(length,width,seed,Math.min(1,u+.001),t).sub(leafPoint(length,width,seed,Math.max(-1,u-.001),t));
  const dt=leafPoint(length,width,seed,u,Math.min(1,t+.001)).sub(leafPoint(length,width,seed,u,Math.max(0,t-.001)));
  const n=du.cross(dt);return n.lengthSq()>1e-15?n.normalize():new THREE.Vector3(0,0,1);
}

function leafGeometry(length, width, seed = 0) {
  const base = color('#243c2c'), edgeColor = color('#617048');
  return geometryFromGrid(24, 48, (s, t) => {
    const u = s * 2 - 1;
    const {x,y,z}=leafPoint(length,width,seed,u,t);
    return { x, y, z, color: base.clone().lerp(edgeColor, .22 + .28 * Math.abs(u)) };
  });
}

function stemParameterAtY(curve,y){
  let lo=0,hi=1;for(let k=0;k<48;k++){const mid=(lo+hi)/2;if(curve.getPointAt(mid).y<y)lo=mid;else hi=mid}return(lo+hi)/2;
}
function stemFrame(curve,t){
  const center=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();
  const normal=new THREE.Vector3(1,0,0).addScaledVector(tangent,-tangent.x).normalize();
  return{center,tangent,normal,binormal:normal.clone().cross(tangent).normalize()};
}
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
function connectedPrickleStem(curve){
  const radius=.035,length=curve.getLength(),halfLength=.115,halfAngle=.84,height=.205,curl=.082;
  // Rotate the same five-step spiral around its real axis so the selected
  // third prickle faces the macro camera. The old flat extrusion stayed
  // visible from behind; a solid connected prickle must actually face it.
  const spiralOffset=TAU+.86-2*2.41;
  const specs=Array.from({length:5},(_,i)=>({t:stemParameterAtY(curve,-1.95+i*.43),theta:(i*2.41+spiralOffset)%TAU}));
  const ts=Array.from({length:193},(_,i)=>i/192);
  const angles=Array.from({length:96},(_,i)=>i*TAU/96);
  for(const p of specs){ts.push(p.t,p.t-halfLength/length,p.t+halfLength/length);angles.push(p.theta,(p.theta-halfAngle+TAU)%TAU,(p.theta+halfAngle)%TAU)}
  const unique=values=>[...new Set(values.map(x=>+x.toFixed(12)))].sort((a,b)=>a-b);
  const rows=unique(ts.filter(t=>t>=0&&t<=1)),columns=unique(angles),positions=[],colors=[],indices=[],weights=[];
  const green=color('#42513c'),prickle=color('#88694d');
  for(const t of rows){
    const frame=stemFrame(curve,t);
    for(const theta of columns){
      const radial=frame.normal.clone().multiplyScalar(Math.cos(theta)).addScaledVector(frame.binormal,Math.sin(theta));
      const point=frame.center.clone().addScaledVector(radial,radius);let maximum=0;
      for(const spec of specs){
        const u=(t-spec.t)*length/halfLength,v=wrapAngle(theta-spec.theta)/halfAngle;
        const distance=Math.hypot(u,v),weight=distance<1?(1-distance)**2:0;
        // This displacement belongs to the indexed stem skin itself. At the
        // patch boundary its value AND first derivative are zero: no separate
        // extrusion, buried card, floating root or intersecting base tube.
        if(weight){point.addScaledVector(radial,height*weight);point.addScaledVector(frame.tangent,curl*weight**1.25)}
        maximum=Math.max(maximum,weight);
      }
      const c=green.clone().lerp(prickle,ease(Math.min(1,maximum*3.2)));
      positions.push(point.x,point.y,point.z);colors.push(c.r,c.g,c.b);weights.push(maximum);
    }
  }
  const w=columns.length;
  for(let i=0;i<rows.length-1;i++)for(let j=0;j<w;j++){
    const a=i*w+j,b=(i+1)*w+j,c=i*w+(j+1)%w,d=(i+1)*w+(j+1)%w;
    indices.push(a,b,c,c,b,d);
  }
  // Closed ends are inside the receptacle/root crown. Circular indexing also
  // welds the angular seam instead of leaving coincident, disconnected edges.
  const bottom=positions.length/3;const bp=curve.getPointAt(0);positions.push(bp.x,bp.y,bp.z);colors.push(green.r,green.g,green.b);
  const top=positions.length/3;const tp=curve.getPointAt(1);positions.push(tp.x,tp.y,tp.z);colors.push(green.r,green.g,green.b);
  for(let j=0;j<w;j++){indices.push(bottom,j,(j+1)%w);const a=(rows.length-1)*w+j,b=(rows.length-1)*w+(j+1)%w;indices.push(top,b,a)}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.76,metalness:0});
  const mesh=new THREE.Mesh(geometry,material);mesh.name='Bent botanical stem';mesh.castShadow=true;mesh.receiveShadow=true;
  const hooks=specs.map((spec,i)=>{
    const frame=stemFrame(curve,spec.t),normal=frame.normal.clone().multiplyScalar(Math.cos(spec.theta)).addScaledVector(frame.binormal,Math.sin(spec.theta));
    const pivot=new THREE.Object3D();pivot.name=`Recurved prickle ${i+1} — connected skin focus`;
    pivot.position.copy(frame.center).addScaledVector(normal,radius);
    pivot.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,frame.tangent,normal.clone().cross(frame.tangent)));
    const row=rows.findIndex(t=>Math.abs(t-spec.t)<1e-10),column=columns.findIndex(a=>Math.abs(a-spec.theta)<1e-10),tipVertex=row*w+column;
    const inPatch=new Set();for(let r=0;r<rows.length;r++)for(let c=0;c<w;c++)if(Math.hypot((rows[r]-spec.t)*length/halfLength,wrapAngle(columns[c]-spec.theta)/halfAngle)<.97)inPatch.add(r*w+c);
    const edges=new Set();for(let k=0;k<indices.length;k+=3)for(const[a,b]of[[0,1],[1,2],[2,0]]){const x=indices[k+a],y=indices[k+b];if(inPatch.has(x)&&inPatch.has(y))edges.add(x<y?`${x}/${y}`:`${y}/${x}`)}
    pivot.userData={stemT:spec.t,center:frame.center.toArray(),theta:spec.theta,tipLocal:[height,curl,0],tipVertex,patchInternalEdges:[...edges],source:'S01 V7 continuous stem-skin prickle'};
    return pivot;
  });
  return{mesh,material,hooks,topology:{component_count:1,stem_radius:radius,rows:rows.length,columns:w,prickles:5,shared_indexed_surface:true}};
}

function makeRose() {
  const group = new THREE.Group();
  group.name = 'Botanical rose — curved petals, calyx, thorns and veined foliage';
  const flower = new THREE.Group();
  flower.position.y = .51;
  flower.rotation.z = -.10;
  flower.rotation.x = .20;
  group.add(flower);
  const petalMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: .57, metalness: .025,
    side: THREE.DoubleSide,
  });
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: '#ce997b', wireframe: true, transparent: true, opacity: 0,
    depthWrite: false,
  });
  const foliageMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: .72, side: THREE.DoubleSide,
  });
  const green = new THREE.MeshStandardMaterial({ color: '#42513c', roughness: .74 });
  const veins = new THREE.MeshStandardMaterial({ color: '#8b9060', roughness: .85 });
  const rootMaterial = new THREE.MeshStandardMaterial({ color: '#72614a', roughness: .91 });
  const petals = [];
  const rings = [
    { count: 11, width: .67, length: 1.03, flare: .84, curl: .28, base: -.09, radius: .12 },
    { count: 10, width: .53, length: 1.12, flare: .60, curl: .19, base: -.015, radius: .10 },
    { count: 8, width: .38, length: 1.08, flare: .39, curl: .16, base: .10, radius: .075 },
    { count: 6, width: .26, length: .95, flare: .20, curl: .10, base: .20, radius: .055 },
    { count: 4, width: .16, length: .74, flare: .09, curl: .075, base: .37, radius: .035 },
  ];
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.count; i++) {
      const theta = i * TAU / ring.count + ri * 1.27 + .03 * Math.sin(i * 3);
      const seed = i * 1.73 + ri * 4.1;
      const pivot = new THREE.Group();
      pivot.name = `Whorl ${ri + 1}, petal ${i + 1}`;
      pivot.position.set(Math.sin(theta) * ring.radius, ring.base + .018 * Math.sin(seed), Math.cos(theta) * ring.radius);
      pivot.rotation.y = theta;
      pivot.updateMatrix();
      const attachment=new THREE.Vector3(Math.sin(theta)*.035,-.025,Math.cos(theta)*.035).applyMatrix4(pivot.matrix.clone().invert());
      const geometry = petalGeometry({
        ...ring, ring: ri, seed,attachment,
        width: ring.width * (1 + .07 * Math.sin(seed * 3.1)),
        length: ring.length * (1 + .035 * Math.cos(seed * 2.3)),
      });
      const mesh = new THREE.Mesh(geometry, petalMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const wire = new THREE.Mesh(geometry, wireMaterial);
      wire.visible = false;
      pivot.add(mesh, wire);
      flower.add(pivot);
      petals.push({ pivot, mesh, wire, theta, ring: ri, original: pivot.position.clone() });
    }
  });

  const stemPoints = [[-.04, -2.24, 0], [.035, -1.56, -.025], [-.105, -.72, .045], [0, .02, 0], [0, .53, 0]];
  const stemCurve=new THREE.CatmullRomCurve3(stemPoints.map(p=>new THREE.Vector3(...p)));
  const skin=connectedPrickleStem(stemCurve);
  const stem=skin.mesh;group.add(stem,...skin.hooks);
  const hip = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), green);
  hip.position.y = .52;
  hip.scale.set(.8, .9, .8);
  hip.name='Flower receptacle';hip.castShadow=true;hip.receiveShadow=true;
  group.add(hip);

  // Five sharply tapered recurved sepals cradle the petal whorls.
  for (let i = 0; i < 5; i++) {
    const sepal = new THREE.Mesh(leafGeometry(.61, .085, i), foliageMaterial);
    const pivot = new THREE.Group();
    pivot.position.y = .50;
    pivot.rotation.y = i * TAU / 5 + .3;
    pivot.rotation.x = 1.9;
    pivot.add(sepal);
    group.add(pivot);
  }

  const leaves = [
    { y: -1.13, theta: -1.02, lean: .86, length: .82, width: .21 },
    { y: -.51, theta: 1.18, lean: .91, length: .73, width: .19 },
    { y: -1.61, theta: 2.28, lean: 1.04, length: .60, width: .16 },
  ];
  const leafBranches=[];
  leaves.forEach((leaf, index) => {
    const branch = new THREE.Group();
    const stemT=stemParameterAtY(stemCurve,leaf.y);
    branch.position.copy(stemCurve.getPointAt(stemT));
    branch.name=`Leaf branch ${index+1} — actual stem attachment`;
    branch.rotation.y = leaf.theta;
    branch.rotation.z = index === 1 ? -.82 : .85;
    branch.rotation.x = leaf.lean * .32;
    const blade = new THREE.Mesh(leafGeometry(leaf.length, leaf.width, index), foliageMaterial);
    const petioleLength=.10;
    blade.position.y=petioleLength;blade.name=`Leaf blade ${index+1}`;
    blade.castShadow = true;
    blade.receiveShadow = true;
    branch.add(blade);
    const petiole=taperedRoot([[0,0,0],[0,.045,-.004],[0,petioleLength,0]],.016,green,12);
    petiole.name=`Leaf petiole ${index+1}`;branch.add(petiole);
    const veinPoint=(u,t,offset)=>leafPoint(leaf.length,leaf.width,index,u,t).addScaledVector(leafNormal(leaf.length,leaf.width,index,u,t),offset).add(new THREE.Vector3(0,petioleLength,0));
    const addVein=(name,point,radius,segments)=>{
      const points=Array.from({length:33},(_,i)=>point(i/32).toArray());
      const vein=tube(points,radius,veins,segments,6);vein.name=name;branch.add(vein);
    };
    addVein(`Leaf midrib ${index+1}`,s=>veinPoint(0,s,.003),.0055,40);
    for (let v = .23; v < .82; v += .16) {
      for (const side of [-1, 1]) {
        addVein(`Leaf vein ${index+1}/${v.toFixed(2)}/${side}`,s=>veinPoint(side*.82*s,v-.10+.10*s+.012*Math.sin(Math.PI*s),.0012),.0022,18);
      }
    }
    branch.userData.stemT=stemT;branch.userData.blade=blade.name;branch.userData.petiole=petiole.name;
    group.add(branch);
    leafBranches.push(branch);
  });
  const roots = new THREE.Group();
  roots.name = 'Living root system — tapered main roots and fine branching rootlets';
  const rootCrown = [-.04, -2.18, 0];
  roots.add(taperedRoot([rootCrown, [-.045, -2.28, .004], [-.015, -2.37, .013], [-.035, -2.42, .018]], .026, rootMaterial, 14));
  for (let i = 0; i < 7; i++) {
    const theta = i * TAU / 7 + .28;
    const reach = .25 + .055 * Math.sin(i * 2.1);
    const direction = (distance, y, turn = 0) => [
      -.04 + Math.cos(theta + turn) * distance,
      y,
      Math.sin(theta + turn) * distance * .68,
    ];
    const points = [rootCrown, direction(reach * .30, -2.25, -.12), direction(reach * .69, -2.32, .04), direction(reach, -2.385, .13)];
    const main = taperedRoot(points, .019, rootMaterial, 14);
    main.name = `Primary root ${i + 1}`;
    roots.add(main);
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    for (const t of [.42, .70]) {
      const start = curve.getPoint(t);
      for (const side of [-1, 1]) {
        const turn = theta + side * .77;
        const endX = start.x + Math.cos(turn) * .12;
        const endZ = start.z + Math.sin(turn) * .075;
        roots.add(taperedRoot([
          start.toArray(),
          [mix(start.x, endX, .48), start.y - .031, mix(start.z, endZ, .43)],
          [endX, Math.max(-2.405, start.y - .068), endZ],
        ], .007, rootMaterial, 9));
      }
    }
  }
  group.add(roots);
  return {group,flower,roots,petals,petalMaterial,wireMaterial,stemCurve,stem,
    hooks:skin.hooks,leafBranches,originalConePrickles:[],prickleTopology:skin.topology,
    materials:[petalMaterial,foliageMaterial,green,veins,rootMaterial,skin.material]};
}


/** Geometry only. No renderer, camera, clock, RAF, animation or book asset. */
export function createRose() {
  return makeRose();
}
