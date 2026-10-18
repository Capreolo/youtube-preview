import * as THREE from './vendor/three.module.js';
import bookType from './book-title-data.mjs';

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
  const petalMaterial = new THREE.MeshPhysicalMaterial({
    // Fabric-like grazing sheen reveals curled petal surfaces while keeping
    // the canonical carmine vertex colours and all botanical geometry.
    vertexColors: true, roughness: .51, metalness: .015,
    sheen: .54, sheenColor: '#cf898b', sheenRoughness: .73,
    clearcoat: .08, clearcoatRoughness: .72,
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

function roundedPrism(width, height, depth, radius, material) {
  const shape = new THREE.Shape();
  const x = -width / 2, y = -height / 2, r = radius;
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .017, bevelThickness: .017, curveSegments: 5 });
  geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function rectangleTooling(width, height, radius, z, material, weight = .009) {
  const points = [];
  const centers = [[width/2-radius, height/2-radius], [-width/2+radius, height/2-radius], [-width/2+radius, -height/2+radius], [width/2-radius, -height/2+radius]];
  centers.forEach(([x, y], corner) => {
    for (let i = 0; i <= 8; i++) {
      const a = corner * Math.PI / 2 + i / 8 * Math.PI / 2;
      points.push([x + Math.cos(a) * radius, y + Math.sin(a) * radius, z]);
    }
  });
  points.push(points[0]);
  return tube(points, weight, material, 96, 4);
}

function bookGrid(columns, rows, point) {
  const geometry = geometryFromGrid(columns, rows, point);
  const uv = [];
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) uv.push(column / columns, row / rows);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return geometry;
}

function leatherGrain() {
  const size = 256, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hash = Math.imul((x + 47) ^ 0x45d9f3b, (y + 103) ^ 0x27d4eb2d);
      hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
      const noise = (hash >>> 0) / 4294967295;
      const pores = Math.abs(Math.sin(x * .67 + Math.sin(y * .21) * 1.9) * Math.sin(y * .71 + Math.sin(x * .19)));
      const value = Math.round(102 + 72 * noise + 52 * pores);
      const index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = value;
      pixels[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.name = 'Deterministic fine calfskin grain';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.4);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function coverType(text, width, material, depth = .007) {
  const shapes = [], tracking = 37;
  let cursor = 0;
  for (const letter of text) {
    const glyph = bookType.glyphs[letter];
    if (!glyph) continue;
    const path = new THREE.ShapePath();
    for (const command of glyph.path) {
      const p = command.slice(1);
      for (let i = 0; i < p.length; i += 2) p[i] += cursor;
      if (command[0] === 'M') path.moveTo(...p);
      if (command[0] === 'L') path.lineTo(...p);
      if (command[0] === 'Q') path.quadraticCurveTo(...p);
      if (command[0] === 'C') path.bezierCurveTo(...p);
      if (command[0] === 'Z') path.currentPath.closePath();
    }
    shapes.push(...path.toShapes(false));
    cursor += glyph.advance + tracking;
  }
  const rawGeometry = new THREE.ExtrudeGeometry(shapes, {
    depth: depth * bookType.units, bevelEnabled: false,
    steps: 1, curveSegments: 2,
  });
  // ExtrudeGeometry repeats each face's vertices. Keep distinct hard-edge
  // normals, but index identical corners so the cover lettering stays light.
  const p = rawGeometry.getAttribute('position'), n = rawGeometry.getAttribute('normal');
  const positions = [], normals = [], indices = [], corners = new Map();
  for (let i = 0; i < p.count; i++) {
    const values = [p.getX(i), p.getY(i), p.getZ(i), n.getX(i), n.getY(i), n.getZ(i)];
    const key = values.map((value, j) => Math.round(value * (j < 3 ? 1e5 : 1e4))).join(',');
    let index = corners.get(key);
    if (index === undefined) {
      index = positions.length / 3;
      corners.set(key, index);
      positions.push(...values.slice(0, 3));
      normals.push(...values.slice(3));
    }
    indices.push(index);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  rawGeometry.dispose();
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const factor = width / (bounds.max.x - bounds.min.x);
  geometry.translate(-(bounds.max.x + bounds.min.x) / 2, -(bounds.max.y + bounds.min.y) / 2, 0);
  geometry.scale(factor, factor, 1 / bookType.units);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `Gilt raised EB Garamond lettering: ${text}`;
  mesh.userData.coverText = text;
  mesh.castShadow = true;
  return mesh;
}

function mergeBookDetail(geometries) {
  const positions = [], normals = [], indices = [];
  for (const geometry of geometries) {
    const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal');
    const offset = positions.length / 3;
    positions.push(...p.array);
    normals.push(...n.array);
    const source = geometry.index ? geometry.index.array : Array.from({ length: p.count }, (_, i) => i);
    for (const index of source) indices.push(index + offset);
    geometry.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setIndex(indices);
  return merged;
}

function makeBook() {
  const group = new THREE.Group();
  group.name = 'Metaphysica Disputatio — original sculpted archival binding';
  group.userData = { title: 'Metaphysica Disputatio', coverTypeface: 'EB Garamond', titleMethod: 'Extruded outline meshes from the local font', historicalBinding: 'Interpretive binding, not a facsimile of a surviving copy' };
  const grain = leatherGrain();
  const leather = new THREE.MeshStandardMaterial({ color: '#542b34', roughness: .69, metalness: .045, bumpMap: grain, bumpScale: .015 });
  leather.name = 'Antique oxblood calfskin — procedural grain';
  const leatherInset = new THREE.MeshStandardMaterial({ color: '#41232c', roughness: .77, bumpMap: grain, bumpScale: .012 });
  leatherInset.name = 'Recessed oxblood calfskin panel';
  const wornLeather = new THREE.MeshStandardMaterial({ color: '#8f624b', roughness: .82, bumpMap: grain, bumpScale: .009 });
  wornLeather.name = 'Hand worn calfskin at board edges';
  const paper = new THREE.MeshStandardMaterial({ color: '#e5d8b9', roughness: .95, side: THREE.DoubleSide });
  paper.name = 'Warm laid-paper folios';
  const pageShade = new THREE.MeshStandardMaterial({ color: '#ba9e75', roughness: .99 });
  pageShade.name = 'Aged folio edge incisions';
  const brass = new THREE.MeshStandardMaterial({ color: '#c59d60', roughness: .38, metalness: .72 });
  brass.name = 'Aged brass and binding gold';
  const gold = new THREE.MeshStandardMaterial({ color: '#ead097', roughness: .31, metalness: .66 });
  gold.name = 'Bright raised gold leaf lettering';
  const ribbon = new THREE.MeshStandardMaterial({ color: '#9a5358', roughness: .84, side: THREE.DoubleSide });
  ribbon.name = 'Woven burgundy bookmark';

  const block = roundedPrism(2.07, 2.88, .51, .035, paper);
  block.position.x = .035;
  block.name = 'Rounded laid-paper text block';
  group.add(block);
  for (const z of [-.345, .345]) {
    const board = roundedPrism(2.28, 3.12, .105, .065, leather);
    board.position.z = z;
    board.name = z > 0 ? 'Front leather covered board with beveled edges' : 'Back leather covered board with beveled edges';
    group.add(board);
    const wornEdge = rectangleTooling(2.20, 3.04, .055, z + Math.sign(z) * .051, wornLeather, .008);
    wornEdge.name = 'Softly worn leather turn in at cover edge';
    group.add(wornEdge);
  }
  const front = roundedPrism(2.01, 2.85, .009, .04, leatherInset);
  front.position.z = .412;
  front.name = 'Inset blind tooled cover field';
  group.add(front);
  group.add(rectangleTooling(2.08, 2.91, .055, .439, brass, .007));
  group.add(rectangleTooling(1.94, 2.77, .035, .439, brass, .0028));

  const spineGeometry = bookGrid(28, 18, (s, t) => {
    const a = -Math.PI / 2 + s * Math.PI;
    return { x: -1.065 - .255 * Math.cos(a), y: (t - .5) * 3.13, z: .418 * Math.sin(a) };
  });
  // This arc runs back-to-front: reverse the generic grid winding so its
  // single-sided leather normals face out of the binding, including the rim.
  const spineIndices = spineGeometry.index.array;
  for (let i = 0; i < spineIndices.length; i += 3) {
    const swap = spineIndices[i + 1];
    spineIndices[i + 1] = spineIndices[i + 2];
    spineIndices[i + 2] = swap;
  }
  spineGeometry.index.needsUpdate = true;
  spineGeometry.computeVertexNormals();
  const spine = new THREE.Mesh(spineGeometry, leather);
  spine.name = 'Continuously rounded leather spine';
  spine.castShadow = true;
  group.add(spine);
  for (const y of [-1.18, -.67, 0, .67, 1.18]) {
    const points = [], toolingAbove = [], toolingBelow = [];
    for (let i = 0; i <= 22; i++) {
      const a = -Math.PI / 2 + i / 22 * Math.PI;
      const x = -1.067 - .270 * Math.cos(a), z = .423 * Math.sin(a);
      points.push([x, y, z]);
      toolingAbove.push([x, y + .052, z]);
      toolingBelow.push([x, y - .052, z]);
    }
    const rib = tube(points, .025, leatherInset, 26, 6);
    rib.name = 'Raised cord supporting the rounded spine';
    group.add(rib, tube(toolingAbove, .004, brass, 26, 4), tube(toolingBelow, .004, brass, 26, 4));
  }
  for (const y of [-1.462, 1.462]) {
    const headband = tube([[-1.03, y, -.255], [-1.05, y, 0], [-1.03, y, .255]], .022, wornLeather, 16, 6);
    headband.name = 'Sewn headband at spine end';
    group.add(headband);
  }

  // Separate slightly cockled folios create genuine layers; all fine edge
  // incisions are merged into one mesh to keep the live draw count modest.
  const edgeGeometries = [];
  for (let i = 0; i < 34; i++) {
    const z = -.25 + i / 33 * .50;
    const geometry = bookGrid(5, 12, (s, t) => {
      const ripple = .0045 * Math.sin(t * 11 + i * .91) * Math.pow(s, 3);
      return { x: -.96 + s * 2.03, y: (t - .5) * 2.88 + .003 * Math.sin(i * 2.4), z: z + ripple };
    });
    const folio = new THREE.Mesh(geometry, paper);
    folio.name = `Individually curved folio ${i + 1}`;
    group.add(folio);
    const edge = [];
    for (let j = 0; j <= 16; j++) {
      const t = j / 16;
      edge.push([1.073 + .004 * Math.sin(i * 1.7), (t - .5) * 2.88, z + .0045 * Math.sin(t * 11 + i * .91)]);
    }
    edgeGeometries.push(tube(edge, .0014, pageShade, 16, 3).geometry);
    for (const y of [-1.441, 1.441]) {
      edgeGeometries.push(tube([[-.96, y, z], [.05, y + .002 * Math.sin(i), z + .002], [1.072, y, z]], .0013, pageShade, 10, 3).geometry);
    }
  }
  const edges = new THREE.Mesh(mergeBookDetail(edgeGeometries), pageShade);
  edges.name = 'Merged fine folio edge grooves';
  group.add(edges);

  // Real raised corner shoes, with scalloped inner edges and inset rivets.
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(.275, 0);
      shape.lineTo(.245, .045);
      shape.lineTo(.112, .052);
      shape.quadraticCurveTo(.060, .067, .052, .112);
      shape.lineTo(.045, .245);
      shape.lineTo(0, .275);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: .013, bevelEnabled: true, bevelSize: .004, bevelThickness: .003, bevelSegments: 1, curveSegments: 6 });
      const corner = new THREE.Mesh(geometry, brass);
      corner.position.set(sx * 1.055, sy * 1.477, .440);
      corner.scale.set(-sx, -sy, 1);
      corner.name = 'Scalloped brass board corner';
      corner.castShadow = true;
      group.add(corner);
      for (const [x, y] of [[.04, .18], [.18, .04]]) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(.015, 8, 6), gold);
        rivet.scale.z = .4;
        rivet.position.set(sx * (1.055 - x), sy * (1.477 - y), .461);
        group.add(rivet);
      }
    }
  }

  const title = new THREE.Group();
  title.name = 'Metaphysica Disputatio — light receiving extruded gold cover type';
  const lines = [
    ['METAPHYSICA', 1.75, .91],
    ['DISPUTATIO', 1.62, .61],
    ['DE ENTE', .73, .26],
    ['DIEGO MAS O.P.', 1.08, -.98],
    ['MDLXXXVII', .74, -1.18],
  ];
  for (const [text, width, y] of lines) {
    const letters = coverType(text, width, gold);
    letters.position.set(.045, y, .444);
    title.add(letters);
  }
  group.add(title);
  group.add(tube([[-.57, .405, .443], [0, .405, .443], [.66, .405, .443]], .003, brass, 3, 4));
  const rosette = new THREE.Group();
  rosette.name = 'Small gilt binding rosette below title';
  rosette.position.set(.045, -.34, 0);
  for (let ring = 0; ring < 2; ring++) {
    const points = [];
    for (let i = 0; i <= 80; i++) {
      const a = i / 80 * TAU;
      const r = .25 + ring * .055 + .012 * Math.cos(a * 8);
      points.push([Math.cos(a) * r, Math.sin(a) * r, .445]);
    }
    rosette.add(tube(points, .0035, brass, 80, 4));
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    rosette.add(tube([[0, 0, .448], [Math.cos(a + .3) * .14, Math.sin(a + .3) * .14, .450], [Math.cos(a) * .225, Math.sin(a) * .225, .448]], .0035, gold, 12, 4));
  }
  group.add(rosette);
  const bookmark = new THREE.Mesh(bookGrid(3, 20, (s, t) => ({ x: .43 + (s - .5) * .10, y: -1.28 - t * .54, z: -.08 + .07 * Math.sin(t * 3) + .005 * Math.sin(s * 18) })), ribbon);
  bookmark.name = 'Fine folded cloth bookmark';
  group.add(bookmark);
  return { group, title, materials: [leather, leatherInset, wornLeather, paper, pageShade, brass, gold, ribbon], textures: [grain] };
}

/** Geometry-only entry point for source export and numerical validation. */
export function createAssets() {
  return { rose: makeRose(), book: makeBook() };
}

/**
 * @param {HTMLCanvasElement} canvas fixed 1920×1080 transparent canvas
 * @returns {{renderAt: Function, dispose: Function, diagnostics: object, scene: object}}
 * shot.x is the normalized horizontal screen position (0..1; .5 centers).
 * bloom controls botanical opening, explode separates the whorls; wire fades
 * the solid botanical model to a copper technical mesh. rotation is radians.
 */
export function createWorld(canvas, options = {}) {
const width=options.width||1920,height=options.height||1080;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, width / height, .1, 50);
  camera.position.set(0, .55, 8.45);
  camera.lookAt(0, -.05, 0);
  scene.add(new THREE.HemisphereLight('#f4e9d6', '#52664f', 1.65));
  const key = new THREE.DirectionalLight('#ffe6c6', 3.1);
  key.position.set(-3.8, 4.8, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = .026;
  key.shadow.bias = -.0001;
  key.shadow.radius = 4;
  scene.add(key);
  const edge = new THREE.DirectionalLight('#dbaf94', 1.8);
  edge.position.set(3.3, 2.6, -2.8);
  scene.add(edge);
  const fill = new THREE.DirectionalLight('#dae4d0', .58);
  fill.position.set(3, -.2, 4);
  scene.add(fill);

  const assets = createAssets();
  const stage = new THREE.Group();
  stage.name = 'Seek-safe specimen stage';
  stage.add(assets.rose.group, assets.book.group);
  scene.add(stage);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: .19, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.445;
  floor.receiveShadow = true;
  scene.add(floor);

  const uniqueGeometries = new Set();
  let meshCount = 0, vertices = 0;
  scene.traverse(object => {
    if (object.isMesh) {
      meshCount++;
      if (!uniqueGeometries.has(object.geometry)) {
        uniqueGeometries.add(object.geometry);
        vertices += object.geometry.getAttribute('position').count;
      }
    }
  });
  const diagnostics = { renderer: 'Three.js', deterministic: true, width, height, meshCount, vertices, petalCount: assets.rose.petals.length, modes: ['rose', 'anatomy', 'book', 'none'], shadows: true, bookTitle: assets.book.group.userData.title, bookTitleMethod: assets.book.group.userData.titleMethod };
  canvas.dataset.threeStatus = 'ready';
  canvas.dataset.meshCount = String(meshCount);
  canvas.dataset.vertexCount = String(vertices);

  function renderAt(time, shot = {}) {
    const mode = shot.mode || 'rose';
    const rotation = Number(shot.rotation || 0);
    const bloom = clamp(shot.bloom ?? 1);
    const explode = clamp(shot.explode ?? (mode === 'anatomy' ? .35 : 0));
    const wire = clamp(shot.wire ?? 0);
    const scale = Math.max(.1, shot.scale ?? 1);
    const position = clamp(shot.x ?? .68);
    const viewWidth = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * camera.position.z * camera.aspect;
    stage.position.x = (position - .5) * viewWidth;
    stage.position.y = Number(shot.y || 0);
    stage.scale.setScalar(scale);
    const roseVisible = mode === 'rose' || mode === 'anatomy';
    assets.rose.group.visible = roseVisible;
    assets.book.group.visible = mode === 'book';
    assets.rose.group.rotation.set(.015 * Math.sin(time * .17), rotation, -.025 + .015 * Math.sin(time * .11));
    assets.rose.flower.rotation.z = -.10 + .018 * Math.sin(time * .18);
    for (const petal of assets.rose.petals) {
      const separation = explode * (.30 + (4 - petal.ring) * .16);
      petal.pivot.position.copy(petal.original);
      petal.pivot.position.x += Math.sin(petal.theta) * separation;
      petal.pivot.position.z += Math.cos(petal.theta) * separation;
      petal.pivot.position.y += explode * (petal.ring * .11 - .10);
      petal.pivot.rotation.x = -.48 * (1 - ease(bloom)) + explode * .08;
      petal.pivot.scale.set(mix(.82, 1, bloom), 1, mix(.72, 1, bloom));
      petal.wire.visible = wire > .001;
      petal.mesh.visible = wire < .999;
    }
    assets.rose.petalMaterial.opacity = 1 - wire;
    assets.rose.petalMaterial.depthWrite = wire < .5;
    assets.rose.wireMaterial.opacity = wire * .62;
    for (const material of assets.rose.materials.slice(1)) material.opacity = 1 - wire * .6;
    assets.book.group.position.set(0, -.08, 0);
    assets.book.group.rotation.set(.13 + .025 * Math.sin(time * .13), rotation - .42, -.065);
    floor.visible = mode !== 'none' && wire < .8;
    floor.position.x = stage.position.x;
    // Keep the contact plane under the translated specimen. Previously the
    // portrait's y offset left the plane above the root tips.
    floor.position.y = stage.position.y + (mode === 'book' ? -1.70 * scale : -2.445 * scale);
    renderer.render(scene, camera);
    canvas.dataset.threeMode = mode;
    canvas.dataset.threeTime = Number(time).toFixed(3);
  }

  function dispose() {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.filter(Boolean).forEach(material => {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      });
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
    renderer.dispose();
  }

  renderAt(0, { mode: 'none' });
  return { renderAt, dispose, diagnostics, scene, camera, renderer, assets };
}
