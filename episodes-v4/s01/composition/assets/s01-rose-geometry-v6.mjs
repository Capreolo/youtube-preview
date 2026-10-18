// S01 V6 geometry asset: canonical project rose + existing S01 V3 recurved prickles.
// Canonical helpers/makeRose are copied without geometry/material edits.
// Provenance and hashes: research/s01-v6-rose-3d-provenance.json.
import * as THREE from './vendor/three.module.js';

// All positions derive from scene time. No RAF, random seed, external assets or
// elapsed-time simulation is involved in this scene.
const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const color = hex => new THREE.Color(hex);

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
  return geometry;
}

function tube(points, radius, material, segments = 28, sides = 7) {
  const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, segments, radius, sides, false), material);
  mesh.castShadow = true;
  return mesh;
}

function taperedRoot(points, radius, material, segments = 12) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 5, false);
  const positions = geometry.getAttribute('position');
  const center = new THREE.Vector3();
  for (let ring = 0; ring <= segments; ring++) {
    const t = ring / segments;
    curve.getPointAt(t, center);
    const taper = Math.pow(1 - t, .82) * .92 + .08;
    for (let side = 0; side <= 5; side++) {
      const index = ring * 6 + side;
      positions.setXYZ(index,
        center.x + (positions.getX(index) - center.x) * taper,
        center.y + (positions.getY(index) - center.y) * taper,
        center.z + (positions.getZ(index) - center.z) * taper,
      );
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function petalGeometry({ width, length, flare, curl, seed, ring }) {
  const base = color('#651d35'), body = color('#a4475a'), rim = color('#dd9991');
  return geometryFromGrid(18, 24, (s, v) => {
    const u = s * 2 - 1;
    // A wide, rounded terminal lip; the top is scalloped and rolled rather
    // than closing into the pointed tip of an ellipse.
    const silhouette = Math.pow(Math.sin(Math.PI * (.035 + .83 * v)), .75);
    const breadth = width * silhouette * (1 + .045 * Math.sin(v * 12 + seed));
    const edge = Math.pow(Math.abs(u), 2.5);
    const x = u * breadth;
    const y = length * v - .20 * edge * Math.pow(v, 4)
      + .020 * Math.sin(u * 5 + seed) * Math.sin(Math.PI * v);
    const z = flare * Math.pow(v, 1.48)
      + .16 * u * u * Math.sin(Math.PI * v)
      - .12 * (1 - u * u) * Math.sin(Math.PI * v)
      + curl * Math.pow(v, 7) * (1 - .15 * u * u)
      + .025 * Math.sin(u * 8 + seed) * Math.pow(v, 4);
    const petalColor = base.clone().lerp(body, clamp(v * 1.35))
      .lerp(rim, (.18 + .30 * Math.pow(v, 4) + .10 * edge) * (1 - ring * .075));
    petalColor.multiplyScalar(.96 + .055 * Math.sin(seed * 2.3));
    return { x, y, z, color: petalColor };
  });
}

function leafGeometry(length, width, seed = 0) {
  const base = color('#243c2c'), edgeColor = color('#617048');
  return geometryFromGrid(14, 22, (s, t) => {
    const u = s * 2 - 1;
    const serration = 1 + .035 * Math.sin(t * 58 + seed);
    const spread = Math.pow(Math.sin(Math.PI * t), .82);
    const x = u * width * spread * serration;
    const y = length * t;
    const z = .12 * Math.sin(Math.PI * t) - .19 * u * u * spread + .13 * t * t;
    return { x, y, z, color: base.clone().lerp(edgeColor, .22 + .28 * Math.abs(u)) };
  });
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
    side: THREE.DoubleSide, transparent: true,
  });
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: '#ce997b', wireframe: true, transparent: true, opacity: 0,
    depthWrite: false,
  });
  const foliageMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: .72, side: THREE.DoubleSide,
    transparent: true,
  });
  const green = new THREE.MeshStandardMaterial({ color: '#42513c', roughness: .67, transparent: true });
  const veins = new THREE.MeshStandardMaterial({ color: '#8b9060', roughness: .85, transparent: true });
  const thorns = new THREE.MeshStandardMaterial({ color: '#7b584a', roughness: .78, transparent: true });
  const rootMaterial = new THREE.MeshStandardMaterial({ color: '#72614a', roughness: .91, transparent: true });
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
      const geometry = petalGeometry({
        ...ring, ring: ri, seed,
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
  const stem = tube(stemPoints, .035, green, 42, 9);
  stem.name = 'Bent botanical stem';
  group.add(stem);
  const hip = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), green);
  hip.position.y = .52;
  hip.scale.set(.8, .9, .8);
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
  leaves.forEach((leaf, index) => {
    const branch = new THREE.Group();
    branch.position.set(-.025, leaf.y, 0);
    branch.rotation.y = leaf.theta;
    branch.rotation.z = index === 1 ? -.82 : .85;
    branch.rotation.x = leaf.lean * .32;
    const blade = new THREE.Mesh(leafGeometry(leaf.length, leaf.width, index), foliageMaterial);
    blade.castShadow = true;
    blade.receiveShadow = true;
    branch.add(blade);
    branch.add(tube([[0, 0, .005], [0, leaf.length * .5, .125], [0, leaf.length, .14]], .007, veins, 15, 4));
    for (let v = .23; v < .82; v += .16) {
      const w = leaf.width * Math.pow(Math.sin(Math.PI * v), .82) * .82;
      for (const side of [-1, 1]) {
        branch.add(tube([[0, leaf.length * (v - .10), .09], [side * w * .56, leaf.length * (v -.035), .06], [side * w, leaf.length * v, .018]], .0025, veins, 6, 3));
      }
    }
    group.add(branch);
  });
  for (let i = 0; i < 5; i++) {
    const thorn = new THREE.Mesh(new THREE.ConeGeometry(.035, .16, 6), thorns);
    const theta = i * 2.41;
    thorn.position.set(Math.cos(theta) * .055, -1.95 + i * .43, Math.sin(theta) * .055);
    thorn.rotation.set(Math.cos(theta) * 1.0, 0, Math.sin(theta) * 1.0);
    group.add(thorn);
  }
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
  return { group, flower, roots, petals, petalMaterial, wireMaterial, materials: [petalMaterial, foliageMaterial, green, veins, thorns, rootMaterial] };
}


/** Geometry only. No renderer, camera, clock, RAF, animation or book asset. */
export function createRose() {
  const rose = makeRose();
  const originalConePrickles = [];
  rose.group.traverse(object => {
    if (object.isMesh && object.geometry.type === 'ConeGeometry') {
      object.visible = false;
      originalConePrickles.push(object);
    }
  });
  const hooks = [];
  const profile = new THREE.Shape();
  profile.moveTo(0,-.085);
  profile.bezierCurveTo(.08,-.072,.17,-.01,.205,.105);
  profile.bezierCurveTo(.16,.071,.113,.067,.08,.092);
  profile.bezierCurveTo(.045,.115,.023,.12,0,.105);
  profile.closePath();
  const geometry = new THREE.ExtrudeGeometry(profile,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3,steps:1,curveSegments:12});
  const material = new THREE.MeshStandardMaterial({color:'#88694D',roughness:.8});
  for(let i=0;i<5;i++) {
    const theta=i*2.41;
    const hook=new THREE.Mesh(geometry,material);
    hook.position.set(Math.cos(theta)*.032,-1.95+i*.43,Math.sin(theta)*.032);
    hook.rotation.y=-theta;
    hook.castShadow=true; hook.receiveShadow=true;
    rose.group.add(hook);
    hook.name = `Recurved prickle ${i + 1}`;
    hook.userData.source = 'S01 v3 recurved prickle refinement';
    hooks.push(hook);
  }
  const leafBranches = rose.group.children.filter(object =>
    object.isGroup && object !== rose.roots && object.position.y < 0 &&
    object.children.some(child => child.isMesh && child.material === rose.materials[1]));
  return { ...rose, hooks, leafBranches, originalConePrickles,
    materials: [...rose.materials, material] };
}
