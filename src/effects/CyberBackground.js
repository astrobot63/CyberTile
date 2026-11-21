import * as THREE from 'three';

const WORLDS = [
  { name: 'Cyber Megacity', kind: 'cyber', background: 0x05050a, fog: 0x05050a, stars: [0x00d9ff, 0xb000ff] },
  { name: 'New York City', kind: 'nyc', background: 0x101d36, fog: 0x263753, stars: [0xc4d8ff, 0xffd08a] },
  { name: 'Amazon Rainforest', kind: 'amazon', background: 0x09251d, fog: 0x1d4830, stars: [0xa7edbf, 0xf6d887] },
  { name: 'Desert Canyon', kind: 'desert', background: 0x3c1d27, fog: 0x9b5540, stars: [0xffd299, 0xff9a6b] },
  { name: 'Arctic Aurora', kind: 'arctic', background: 0x071a32, fog: 0x29506a, stars: [0xa9ffff, 0x8a9dff] },
  { name: 'Coral Reef', kind: 'reef', background: 0x031b3b, fog: 0x075278, stars: [0x7df9ff, 0xffb0d2] },
  { name: 'Volcanic Frontier', kind: 'volcano', background: 0x180b12, fog: 0x4b1b1a, stars: [0xff8a58, 0xffd18a] },
  { name: 'Bamboo Forest', kind: 'bamboo', background: 0x0b241c, fog: 0x315b3b, stars: [0xa9e9a1, 0xffdf9d] },
  { name: 'Sakura Valley', kind: 'sakura', background: 0x382333, fog: 0x9a637d, stars: [0xffc4db, 0xffedcc] },
  { name: 'Ancient Ruins', kind: 'ruins', background: 0x242638, fog: 0x77705a, stars: [0xf2d995, 0xd6c6a4] },
  { name: 'Lunar Outpost', kind: 'moon', background: 0x03050c, fog: 0x171b28, stars: [0xd7e7ff, 0xffffff] },
  { name: 'Cloud Kingdom', kind: 'clouds', background: 0x4682b4, fog: 0xa9d6f5, stars: [0xffffff, 0xffedb0] },
  { name: 'Alien Jungle', kind: 'alien', background: 0x160c31, fog: 0x452a70, stars: [0xd6a8ff, 0x8dffe0] },
  { name: 'Mediterranean Coast', kind: 'mediterranean', background: 0x4c9ac0, fog: 0xa9d9d8, stars: [0xfff0c4, 0xdefcff] },
  { name: 'Golden Savanna', kind: 'savanna', background: 0x4a3440, fog: 0xd49a58, stars: [0xffe6a3, 0xffa764] }
];

function makeWorldTexture(style, baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const base = new THREE.Color(baseColor);
  const rgb = [base.r, base.g, base.b].map(channel => Math.round(channel * 255));
  context.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  context.fillRect(0, 0, 256, 256);

  if (style.startsWith('facade')) {
    for (let row = 0; row < 12; row++) {
      const y = row * 21 + 4;
      context.fillStyle = row % 4 === 0 ? 'rgba(225,215,193,.24)' : 'rgba(15,20,31,.24)';
      context.fillRect(0, y + 15, 256, 3);
      for (let column = 0; column < 7; column++) {
        const x = column * 36 + 7 + (row % 2) * 3;
        const isLit = Math.random() > 0.38;
        context.fillStyle = isLit ? `rgba(255, ${185 + Math.floor(Math.random() * 55)}, ${105 + Math.floor(Math.random() * 70)}, .88)` : 'rgba(20,32,47,.95)';
        context.fillRect(x, y, 18, 12);
        context.strokeStyle = 'rgba(20,25,36,.9)';
        context.lineWidth = 2;
        context.strokeRect(x, y, 18, 12);
      }
    }
  } else if (style.startsWith('brick') || style.startsWith('stone')) {
    for (let row = 0; row < 16; row++) {
      const y = row * 16;
      context.strokeStyle = style.startsWith('brick') ? 'rgba(28,20,19,.32)' : 'rgba(31,31,30,.3)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y);
      context.stroke();
      const offset = row % 2 ? -16 : 0;
      for (let x = offset; x < 256; x += style.startsWith('brick') ? 48 : 84) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + 16);
        context.stroke();
      }
    }
  } else if (style.startsWith('bark')) {
    for (let i = 0; i < 48; i++) {
      const x = Math.random() * 256;
      context.strokeStyle = `rgba(25, 17, 11, ${0.12 + Math.random() * 0.25})`;
      context.lineWidth = 1 + Math.random() * 3;
      context.beginPath();
      context.moveTo(x, 0);
      context.bezierCurveTo(x - 9, 80, x + 8, 170, x + (Math.random() - 0.5) * 12, 256);
      context.stroke();
    }
  } else if (style.startsWith('leaf')) {
    for (let i = 0; i < 180; i++) {
      const hue = Math.random() > 0.5 ? 'rgba(10,45,18,' : 'rgba(170,205,82,';
      context.fillStyle = `${hue}${0.12 + Math.random() * 0.28})`;
      context.beginPath();
      context.ellipse(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 12, 2 + Math.random() * 5, Math.random() * 3, 0, Math.PI * 2);
      context.fill();
    }
  } else if (style.startsWith('water')) {
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      context.strokeStyle = `rgba(190, 235, 244, ${0.06 + Math.random() * 0.2})`;
      context.lineWidth = 1 + Math.random() * 2;
      context.beginPath();
      context.ellipse(x, y, 5 + Math.random() * 22, 1 + Math.random() * 3, 0, 0, Math.PI * 2);
      context.stroke();
    }
  } else {
    for (let i = 0; i < 1800; i++) {
      const shade = Math.random() > 0.5 ? 255 : 0;
      context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${Math.random() * 0.07})`;
      const size = 1 + Math.random() * 2;
      context.fillRect(Math.random() * 256, Math.random() * 256, size, size);
    }
    if (style.includes('rock') || style.includes('sand')) {
      for (let row = 0; row < 12; row++) {
        context.strokeStyle = `rgba(35, 23, 20, ${0.08 + Math.random() * 0.12})`;
        context.beginPath();
        context.moveTo(0, row * 24 + Math.random() * 9);
        context.bezierCurveTo(70, row * 24 + 8, 160, row * 24 - 6, 256, row * 24 + 5);
        context.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// A camera-following city canyon, scrolling traffic, and drifting starfield.
export class CyberBackground {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    this.city = new THREE.Group();
    this.textureCache = new Map();
    this.worldCache = new Map();
    this.activeBundle = null;
    this.worldTransition = null;
    this.traffic = [];
    this.satellites = [];
    this.beams = [];
    this.orbiting = [];
    this.stars = this.createStarfield();
    scene.add(this.stars);
    this.setTheme(0);
    this.prepareWorld(1);
  }

  createStarfield() {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color(0x00d9ff);
    const violet = new THREE.Color(0xb000ff);

    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      positions[offset] = (Math.random() - 0.5) * 150;
      positions[offset + 1] = Math.random() * 75 - 10;
      positions[offset + 2] = -Math.random() * 150;
      const color = Math.random() > 0.72 ? violet : cyan;
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false
    });
    return new THREE.Points(geometry, material);
  }

  getSurfaceTexture(style, color) {
    const key = `${style}:${color}`;
    if (!this.textureCache.has(key)) this.textureCache.set(key, makeWorldTexture(style, color));
    return this.textureCache.get(key);
  }

  createCity() {
    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x202849, map: this.getSurfaceTexture('facade', 0x202849), emissive: 0x111c42, emissiveIntensity: 0.75, metalness: 0.5, roughness: 0.58 }),
      new THREE.MeshStandardMaterial({ color: 0x352044, map: this.getSurfaceTexture('facade', 0x352044), emissive: 0x291044, emissiveIntensity: 0.65, metalness: 0.5, roughness: 0.58 }),
      new THREE.MeshStandardMaterial({ color: 0x173849, map: this.getSurfaceTexture('facade', 0x173849), emissive: 0x0b3448, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.58 })
    ];
    const cyan = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
    const pink = new THREE.MeshBasicMaterial({ color: 0xff20bd });
    const gold = new THREE.MeshBasicMaterial({ color: 0xffbd55 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x123b5c, emissive: 0x06365c, emissiveIntensity: 1.1, metalness: 0.8, roughness: 0.18, transparent: true, opacity: 0.82 });
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const trimGeometry = new THREE.BoxGeometry(1, 1, 1);
    const windowMaterials = [cyan, pink, gold];
    this.themeMaterials = { buildingMaterials, neonMaterials: [cyan, pink, gold], glass };

    // Surround the player with towers in all directions, leaving a clear central lane.
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 36; i++) {
        const width = 4 + Math.random() * 4;
        const height = 9 + Math.random() * 20;
        const depth = 5 + Math.random() * 7;
        const x = side * (10 + Math.random() * 20);
        const z = (Math.random() - 0.5) * 220;
        const baseY = -8 + Math.random() * 12;
        const building = new THREE.Mesh(buildingGeometry, buildingMaterials[i % buildingMaterials.length]);
        building.position.set(x, baseY - height / 2, z);
        building.scale.set(width, height, depth);
        this.city.add(building);

        // Bright corner rails and stepped crowns break up the plain block silhouette.
        const accent = i % 3 === 0 ? pink : cyan;
        for (const edge of [-1, 1]) {
          const rail = new THREE.Mesh(trimGeometry, accent);
          rail.position.set(x + edge * (width * 0.43), baseY - height / 2, z + depth / 2 + 0.06);
          rail.scale.set(0.1, height, 0.12);
          this.city.add(rail);
        }

        const crown = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.26, width * 0.42, 2.2, 6), buildingMaterials[(i + 1) % buildingMaterials.length]);
        crown.position.set(x, baseY - height - 1.1, z);
        this.city.add(crown);
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3 + Math.random() * 3, 6), accent);
        beacon.position.set(x, baseY - height - 3.5, z);
        this.city.add(beacon);

        // Individual lit windows across the camera-facing facade.
        const rows = Math.floor(height / 2.1);
        const columns = Math.max(2, Math.floor(width / 1.25));
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            if (Math.random() < 0.22) continue;
            const windowLight = new THREE.Mesh(trimGeometry, windowMaterials[Math.floor(Math.random() * windowMaterials.length)]);
            windowLight.position.set(
              x - width * 0.35 + column * (width * 0.7 / Math.max(columns - 1, 1)),
              baseY - 1.1 - row * 1.9,
              z + depth / 2 + 0.07
            );
            windowLight.scale.set(0.2, 0.65, 0.08);
            this.city.add(windowLight);
          }
        }

        // A wide illuminated sign panel gives some towers a readable city detail.
        if (i % 4 === 0) {
          const sign = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 1.15, 0.12), i % 8 === 0 ? pink : cyan);
          sign.position.set(x, baseY - height * 0.48, z + depth / 2 + 0.1);
          this.city.add(sign);
        }
      }
    }

    // Floating platforms add landmarks around the player without crossing the play lane.
    for (let i = 0; i < 18; i++) {
      const pod = new THREE.Group();
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 2.8), glass);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(3, 0.08, 3), i % 3 ? cyan : pink);
      edge.position.y = -0.12;
      pod.add(deck, edge);
      const side = Math.random() < 0.5 ? -1 : 1;
      pod.position.set(side * (14 + Math.random() * 24), -5 + Math.random() * 18, (Math.random() - 0.5) * 180);
      pod.userData = { baseY: pod.position.y, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() };
      this.city.add(pod);
      this.orbiting.push({ mesh: pod, float: true, speed: pod.userData.speed });
    }

    // Hologram panels fill the side space without spanning across the player's view.
    for (let i = 0; i < 10; i++) {
      const z = (Math.random() - 0.5) * 200;
      const billboard = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.25), glass);
      billboard.position.set(i % 2 ? -18 : 18, -2, z);
      this.city.add(billboard);
      const glyphs = new THREE.Group();
      for (let line = 0; line < 4; line++) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(0.35 + Math.random() * 1.1, 0.07, 0.08), line % 2 ? pink : cyan);
        dash.position.set((Math.random() - 0.5) * 2.6, 0.8 - line * 0.45, 0.18);
        glyphs.add(dash);
      }
      glyphs.position.copy(billboard.position);
      this.city.add(glyphs);
    }

    // Floating orbital beacons add motion high above the city skyline.
    for (let i = 0; i < 7; i++) {
      const satellite = new THREE.Group();
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), i % 2 ? cyan : pink);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.045, 6, 24), gold);
      ring.rotation.x = Math.PI / 2.7;
      satellite.add(core, ring);
      satellite.position.set((Math.random() - 0.5) * 80, 18 + Math.random() * 32, (Math.random() - 0.5) * 190);
      satellite.userData = { baseY: satellite.position.y, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.6 };
      this.city.add(satellite);
      this.satellites.push(satellite);
    }

    // Slow flying vehicles add visible motion beneath and beside the platforms.
    for (let i = 0; i < 8; i++) {
      const vehicle = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.8), i % 2 ? pink : cyan);
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.38, 0.55), buildingMaterials[0]);
      canopy.position.y = 0.28;
      vehicle.add(body, canopy);
      vehicle.position.set((Math.random() - 0.5) * 70, -7 - Math.random() * 7, (Math.random() - 0.5) * 190);
      vehicle.userData = {
        baseY: vehicle.position.y,
        speed: 3 + Math.random() * 5,
        direction: Math.random() > 0.5 ? 1 : -1,
        phase: Math.random() * Math.PI * 2
      };
      this.city.add(vehicle);
      this.traffic.push(vehicle);
    }

    const grid = new THREE.GridHelper(180, 72, 0x075580, 0x141333);
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    grid.material.depthWrite = false;
    grid.position.y = -13;
    this.city.add(grid);
  }

  update(delta, camera) {
    this.time += delta;
    if (this.worldTransition) this.updateWorldTransition(delta);
    // Anchor the scenery to the camera so the horizon never runs out as play advances.
    this.city.position.set(camera.position.x * 0.35, camera.position.y * 0.35, camera.position.z);
    if (this.worldTransition) {
      this.worldTransition.previous.city.position.copy(this.city.position);
    }
    this.stars.position.set(camera.position.x, camera.position.y, camera.position.z - 75);

    const positions = this.stars.geometry.attributes.position.array;
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += 2.5 * delta;
      if (positions[i] > 75) positions[i] -= 150;
    }
    this.stars.geometry.attributes.position.needsUpdate = true;

    for (const vehicle of this.traffic) {
      const data = vehicle.userData;
      vehicle.position.x += data.speed * data.direction * delta;
      vehicle.position.y = data.baseY + Math.sin(this.time * 1.4 + data.phase) * data.bobAmount;
      if (data.wings) {
        for (const { wing, side } of data.wings) {
          wing.rotation.x = side * (0.25 + Math.sin(this.time * 9 + data.phase) * 0.55);
        }
      }
      if (data.xLimits) {
        if (vehicle.position.x > data.xLimits[1]) vehicle.position.x = data.xLimits[0];
        if (vehicle.position.x < data.xLimits[0]) vehicle.position.x = data.xLimits[1];
      } else {
        if (vehicle.position.x > 42) vehicle.position.x = -42;
        if (vehicle.position.x < -42) vehicle.position.x = 42;
      }
    }

    for (const satellite of this.satellites) {
      const data = satellite.userData;
      satellite.position.y = data.baseY + Math.sin(this.time * data.speed + data.phase) * 1.1;
      satellite.rotation.y += delta * 0.35;
    }
    for (const beacon of this.beams) {
      beacon.mesh.material.opacity = 0.65 + Math.sin(this.time * 2 + beacon.phase) * 0.3;
    }
    for (const item of this.orbiting) {
      if (item.float) {
        item.mesh.position.y = item.mesh.userData.baseY + Math.sin(this.time * item.speed + item.mesh.userData.phase) * 0.6;
      }
    }
  }

  createScenicWorld(worldIndex) {
    const world = WORLDS[worldIndex];
    const presets = {
      nyc: { buildings: [0x464650, 0x69615a, 0x35404c], windows: 0xffd47a, foliage: 0x253042, accent: 0xffc928, skyGlow: 0x87b9e9, terrain: 0x353840, surface: 'concrete' },
      amazon: { buildings: [0x49392a, 0x594630, 0x403b2c], windows: 0xffd46c, foliage: 0x28613a, accent: 0xa6d56b, skyGlow: 0x62b782, terrain: 0x263d27, surface: 'leaf' },
      desert: { buildings: [0x8f4635, 0xb65d3b, 0x70413b], windows: 0xffcf79, foliage: 0x54713d, accent: 0xf2ae58, skyGlow: 0xf18c54, terrain: 0xa76643, surface: 'sand' },
      arctic: { buildings: [0x527589, 0x91b4c4, 0x344e70], windows: 0xd6f5ff, foliage: 0xd7f5ff, accent: 0x72f4d1, skyGlow: 0x9cf1d2, terrain: 0x9eb9c8, surface: 'rock' },
      reef: { buildings: [0x1f6372, 0x347b87, 0x594c77], windows: 0x9efcff, foliage: 0xf07491, accent: 0xffce8c, skyGlow: 0x27b9c2, terrain: 0x155276, surface: 'rock' },
      volcano: { buildings: [0x302e34, 0x494047, 0x252630], windows: 0xffa13d, foliage: 0xff542e, accent: 0xff722e, skyGlow: 0xff5d36, terrain: 0x30272b, surface: 'rock' },
      bamboo: { buildings: [0x334a37, 0x46563d, 0x293a37], windows: 0xf1d987, foliage: 0x397849, accent: 0xb8d877, skyGlow: 0x9fca70, terrain: 0x354c32, surface: 'leaf' },
      sakura: { buildings: [0x493847, 0x66535b, 0x363d50], windows: 0xffdd9b, foliage: 0xf3a8c4, accent: 0xffd18c, skyGlow: 0xffbad5, terrain: 0x655653, surface: 'leaf' },
      ruins: { buildings: [0x88785d, 0xa18e69, 0x635d52], windows: 0xf8d58b, foliage: 0x73864a, accent: 0xe4c67a, skyGlow: 0xd7ac68, terrain: 0x786d58, surface: 'stone' },
      moon: { buildings: [0x626775, 0x828994, 0x4c5360], windows: 0x9cdbff, foliage: 0xa2bbd1, accent: 0x83d2ff, skyGlow: 0x6389c0, terrain: 0x515865, surface: 'rock' },
      clouds: { buildings: [0xc4d5e6, 0xf1e7d7, 0x93b3d1], windows: 0xffecb3, foliage: 0xffffff, accent: 0xffdc8b, skyGlow: 0xffffff, terrain: 0xffffff, surface: 'concrete' },
      alien: { buildings: [0x37304e, 0x51416a, 0x263f51], windows: 0xc8ffbd, foliage: 0x8b53b0, accent: 0x73f5d2, skyGlow: 0xc583ed, terrain: 0x382b4e, surface: 'leaf' },
      mediterranean: { buildings: [0xe4d7ba, 0xf0e7d5, 0xcdbb9d], windows: 0x5d9bc2, foliage: 0x328353, accent: 0x54b4d0, skyGlow: 0xb6e5ef, terrain: 0x4a948a, surface: 'stone' },
      savanna: { buildings: [0x71553b, 0x9b7040, 0x584b3c], windows: 0xffdf8b, foliage: 0x859047, accent: 0xe5b35c, skyGlow: 0xffd37b, terrain: 0xa87b47, surface: 'sand' }
    };
    const palette = presets[world.kind];
    const structureStyle = world.kind === 'nyc'
      ? 'facade'
      : ['amazon', 'bamboo', 'sakura', 'savanna'].includes(world.kind)
        ? 'bark'
        : ['ruins', 'mediterranean'].includes(world.kind) ? 'stone' : 'rock';
    const solid = (color, style = structureStyle) => new THREE.MeshStandardMaterial({ color, map: this.getSurfaceTexture(style, color), roughness: 0.9, metalness: 0.01 });
    const lit = color => new THREE.MeshBasicMaterial({ color });
    const materials = {
      buildings: palette.buildings.map(color => solid(color)),
      windows: lit(palette.windows),
      foliage: solid(palette.foliage, 'leaf'),
      accent: lit(palette.accent),
      glow: lit(palette.skyGlow),
      dark: solid(0x292b35, 'concrete'),
      road: solid(0x25282e, 'concrete'),
      water: solid(0x176a91, 'water'),
      sand: solid(0xd29a58, 'sand'),
      stone: solid(palette.buildings[1], 'stone'),
      terrain: solid(palette.terrain, palette.surface)
    };
    const add = (geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);
      mesh.castShadow = material.isMeshStandardMaterial && geometry.type !== 'PlaneGeometry';
      mesh.receiveShadow = material.isMeshStandardMaterial;
      this.city.add(mesh);
      return mesh;
    };
    const box = (material, position, scale, rotation) => add(new THREE.BoxGeometry(1, 1, 1), material, position, scale, rotation);
    const cylinder = (material, position, radiusTop, radiusBottom, height, radial = 8, rotation = [0, 0, 0]) =>
      add(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial), material, position, [1, 1, 1], rotation);
    const cone = (material, position, radius, height, radial = 7) => add(new THREE.ConeGeometry(radius, height, radial), material, position);
    const sphere = (material, position, scale) => add(new THREE.SphereGeometry(1, 10, 8), material, position, scale);
    const scatterX = side => side * (13 + Math.random() * 34);
    const scatterZ = () => (Math.random() - 0.5) * 190;
    const addMover = (mesh, speed, direction = 1, xLimits = null, bobAmount = 0.45) => {
      mesh.userData = { baseY: mesh.position.y, speed, direction, xLimits, bobAmount, phase: Math.random() * Math.PI * 2 };
      this.traffic.push(mesh);
    };
    const addFloat = (mesh, speed = 0.5) => {
      mesh.userData = { baseY: mesh.position.y, speed, phase: Math.random() * Math.PI * 2 };
      this.orbiting.push({ mesh, float: true, speed });
    };

    if (!['clouds', 'reef', 'mediterranean', 'nyc'].includes(world.kind)) {
      const terrainTexture = materials.terrain.map;
      terrainTexture.repeat.set(7, 7);
      const terrainGeometry = new THREE.PlaneGeometry(260, 260, 36, 36);
      const terrainPositions = terrainGeometry.attributes.position;
      const heightScale = world.kind === 'desert' || world.kind === 'savanna' ? 1.6 : world.kind === 'arctic' || world.kind === 'alien' ? 2.8 : 0.6;
      for (let i = 0; i < terrainPositions.count; i++) {
        const x = terrainPositions.getX(i);
        const z = terrainPositions.getY(i);
        terrainPositions.setZ(i, (Math.sin(x * 0.045) + Math.cos(z * 0.038)) * heightScale * 0.5);
      }
      terrainGeometry.computeVertexNormals();
      const ground = new THREE.Mesh(terrainGeometry, materials.terrain);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -13, 0);
      ground.receiveShadow = true;
      ground.castShadow = true;
      this.city.add(ground);
    }

    if (world.kind === 'nyc') {
      // Dense Manhattan-style towers, warm apartment windows, rooftops, and yellow cabs.
      box(materials.road, [0, -14, 0], [150, 1, 220]);
      for (let side of [-1, 1]) {
        for (let i = 0; i < 20; i++) {
          const width = 5 + Math.random() * 6;
          const height = 13 + Math.random() * 32;
          const depth = 7 + Math.random() * 9;
          const x = side * (12 + Math.random() * 26);
          const z = scatterZ();
          const material = materials.buildings[i % materials.buildings.length];
          box(material, [x, -8 - height / 2, z], [width, height, depth]);
          // Occasional air conditioners and narrow fire escapes add facade depth.
          for (let floor = 0; floor < Math.floor(height / 5); floor++) {
            if (Math.random() < 0.55) {
              box(materials.windows, [x + side * (width / 2 + 0.16), -11 - floor * 5, z + depth / 2 + 0.1], [0.24, 0.4, 0.3]);
            }
            if (i % 5 === 0) {
              box(materials.dark, [x - width * 0.25, -10 - floor * 4, z + depth / 2 + 0.11], [width * 0.55, 0.11, 0.18]);
              box(materials.dark, [x - width * 0.5, -11.8 - floor * 4, z + depth / 2 + 0.11], [0.1, 3.4, 0.18]);
              box(materials.dark, [x, -11.8 - floor * 4, z + depth / 2 + 0.11], [0.1, 3.4, 0.18]);
            }
          }
          if (i % 3 === 0) {
            box(materials.dark, [x, -8 - height - 0.7, z], [width * 0.48, 1.4, depth * 0.45]);
            cylinder(materials.accent, [x, -9 - height - 2.6, z], 0.035, 0.035, 4, 6);
          }
          if (i % 4 === 0) {
            box(materials.dark, [x, -8 - height - 1.3, z], [1.7, 1.5, 1.6]);
            box(materials.accent, [x, -8 - height - 0.5, z], [2.2, 0.12, 2]);
          }
        }
      }
      // A recognizable stepped Manhattan tower with a narrow crown and antenna.
      box(materials.buildings[0], [28, -23, -92], [10, 30, 9]);
      box(materials.buildings[1], [28, -6, -92], [7, 5, 7]);
      box(materials.buildings[2], [28, -2.5, -92], [4, 2, 4]);
      cylinder(materials.dark, [28, 0, -92], 0.12, 0.22, 3, 8);
      cylinder(materials.accent, [28, 2, -92], 0.035, 0.06, 1.2, 6);

      for (let i = 0; i < 5; i++) {
        const cab = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 1.15), materials.accent);
        cab.add(body);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 0.9), materials.buildings[0]);
        roof.position.y = 0.48;
        cab.add(roof);
        for (const wheelX of [-0.72, 0.72]) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.12, 10), materials.dark);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wheelX, -0.31, 0.48);
          cab.add(wheel);
          const farWheel = wheel.clone();
          farWheel.position.z = -0.48;
          cab.add(farWheel);
        }
        const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.3), materials.windows);
        headlight.position.set(1.08, 0, 0.32);
        cab.add(headlight, headlight.clone());
        cab.children[cab.children.length - 1].position.z = -0.32;
        const side = i % 2 ? 1 : -1;
        const xLimits = side < 0 ? [-42, -13] : [13, 42];
        cab.position.set(side * (15 + Math.random() * 18), -10, (Math.random() - 0.5) * 150);
        this.city.add(cab);
        addMover(cab, 4 + Math.random() * 3, i % 2 ? -1 : 1, xLimits);
      }
      for (let side of [-1, 1]) {
        for (let i = 0; i < 12; i++) {
          const x = side * (10 + Math.random() * 4);
          const z = -90 + i * 16;
          cylinder(materials.dark, [x, -5, z], 0.1, 0.14, 7, 6);
          sphere(materials.windows, [x, -1.6, z], [0.28, 0.28, 0.28]);
        }
      }
      return;
    }

    if (world.kind === 'amazon' || world.kind === 'bamboo' || world.kind === 'sakura' || world.kind === 'savanna' || world.kind === 'alien') {
      const treeCount = world.kind === 'bamboo' ? 90 : world.kind === 'alien' ? 34 : 42;
      for (let i = 0; i < treeCount; i++) {
        const side = i % 2 ? 1 : -1;
        const x = scatterX(side);
        const z = scatterZ();
        if (world.kind === 'bamboo') {
          const height = 13 + Math.random() * 15;
          cylinder(materials.buildings[i % 3], [x, -13 + height / 2, z], 0.13, 0.24, height, 7);
          for (let leaf = 0; leaf < 3; leaf++) {
            cone(materials.foliage, [x + (Math.random() - 0.5) * 1.5, -11 + Math.random() * height, z], 0.55, 2.6, 5).rotation.z = (Math.random() - 0.5) * 1.4;
          }
        } else if (world.kind === 'alien') {
          const stemHeight = 5 + Math.random() * 10;
          cylinder(materials.buildings[i % 3], [x, -13 + stemHeight / 2, z], 0.45, 0.85, stemHeight, 9);
          sphere(materials.foliage, [x, -13 + stemHeight, z], [2.4 + Math.random() * 2, 1.3, 2.4 + Math.random() * 2]);
          sphere(materials.accent, [x + side * 1.5, -11 + stemHeight, z], [0.26, 0.26, 0.26]);
          if (i % 3 === 0) cone(materials.glow, [x + side * 2.4, -11, z + 1], 1.1, 5, 6);
        } else {
          const trunkHeight = world.kind === 'savanna' ? 7 + Math.random() * 5 : 11 + Math.random() * 14;
          cylinder(materials.buildings[i % 3], [x, -13 + trunkHeight / 2, z], 0.55, 1.1, trunkHeight, 8);
          const canopyY = -13 + trunkHeight;
          if (world.kind === 'amazon') {
            for (let cluster = 0; cluster < 4; cluster++) {
              sphere(cluster % 2 ? materials.foliage : materials.accent, [x + (Math.random() - 0.5) * 5, canopyY + Math.random() * 2, z + (Math.random() - 0.5) * 5], [3.2, 2.6, 3.4]);
            }
            if (i % 3 === 0) cylinder(materials.foliage, [x + side * 1.3, canopyY - 5, z], 0.035, 0.08, 9, 5, [0, 0, side * 0.12]);
          } else if (world.kind === 'sakura') {
            sphere(materials.foliage, [x, canopyY + 1.4, z], [4.4, 3.1, 4.3]);
            for (let blossom = 0; blossom < 5; blossom++) sphere(materials.accent, [x + (Math.random() - 0.5) * 5, canopyY + 1 + Math.random() * 2, z + (Math.random() - 0.5) * 5], [1.5, 1.1, 1.5]);
          } else {
            sphere(materials.foliage, [x + side * 1.4, canopyY + 1.7, z], [5.2, 1.4, 2.5]);
            cylinder(materials.buildings[1], [x + side * 1.6, canopyY + 0.1, z], 0.5, 0.2, 4, 6, [0, 0, side * 0.5]);
          }
        }
      }
      if (world.kind === 'sakura') {
        for (let i = 0; i < 8; i++) {
          const x = (i % 2 ? 1 : -1) * (15 + Math.random() * 5);
          const z = -80 + i * 22;
          box(materials.buildings[0], [x, -5.5, z], [2.5, 5, 2.5]);
          cone(materials.accent, [x, -2.5, z], 3.2, 2, 4);
        }
      }
      if (world.kind === 'amazon') {
        const animalMaterial = color => new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
        const capybaraFur = animalMaterial(0x806143);
        const capybaraFace = animalMaterial(0x9a7854);
        const caimanScale = animalMaterial(0x38583b);
        const snakeScale = animalMaterial(0x526b35);
        const snakeMarking = animalMaterial(0x263a25);
        const spiderMaterial = animalMaterial(0x29221e);
        const jaguarFur = animalMaterial(0xc3944f);
        const jaguarSpot = animalMaterial(0x30241b);
        const birdBody = animalMaterial(0x173f60);
        const birdWing = animalMaterial(0x167b84);
        const birdBeak = animalMaterial(0xf2a33a);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x100d0a });

        const sideLimits = side => side < 0 ? [-43, -13] : [13, 43];
        const createCapybara = (side, z) => {
          const animal = new THREE.Group();
          const body = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), capybaraFur);
          body.position.set(0, 0.7, 0);
          body.scale.set(1.25, 0.72, 0.72);
          animal.add(body);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 9), capybaraFace);
          head.position.set(0.9, 0.9, 0);
          head.scale.set(0.9, 0.8, 0.85);
          animal.add(head);
          const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), capybaraFace);
          muzzle.position.set(1.28, 0.68, 0);
          muzzle.scale.set(1.2, 0.7, 0.8);
          animal.add(muzzle);
          for (const zSide of [-0.43, 0.43]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), eyeMaterial);
            eye.position.set(1.02, 1.12, zSide);
            animal.add(eye);
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), capybaraFur);
            ear.position.set(0.62, 1.35, zSide * 0.9);
            ear.scale.set(0.65, 0.8, 0.55);
            animal.add(ear);
          }
          for (const x of [-0.72, 0.75]) {
            for (const zSide of [-0.42, 0.42]) {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.52, 7), capybaraFur);
              leg.position.set(x, 0.22, zSide);
              animal.add(leg);
            }
          }
          animal.position.set(side * (17 + Math.random() * 16), -12.7, z);
          if (side < 0) animal.rotation.y = Math.PI;
          this.city.add(animal);
          addMover(animal, 0.7 + Math.random() * 0.5, side < 0 ? -1 : 1, sideLimits(side), 0.035);
        };

        const createAnaconda = (side, z) => {
          const snake = new THREE.Group();
          const points = [];
          for (let point = 0; point <= 18; point++) {
            const along = point / 18;
            points.push(new THREE.Vector3(Math.sin(along * Math.PI * 3) * 0.8, 0.18 + Math.sin(along * Math.PI * 5) * 0.08, -7 + along * 14));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          snake.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.34, 10, false), snakeScale));
          for (let marking = 0; marking < 10; marking++) {
            const t = 0.08 + marking * 0.092;
            const center = curve.getPoint(t);
            const spot = new THREE.Mesh(new THREE.SphereGeometry(0.23, 8, 6), snakeMarking);
            spot.position.set(center.x, center.y + 0.22, center.z);
            spot.scale.set(1, 0.35, 1.2);
            snake.add(spot);
          }
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), snakeScale);
          head.position.copy(curve.getPoint(1));
          head.scale.set(1.35, 0.7, 1.1);
          snake.add(head);
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), eyeMaterial);
          eye.position.set(head.position.x + 0.23, head.position.y + 0.18, head.position.z + 0.16);
          snake.add(eye, eye.clone());
          snake.children[snake.children.length - 1].position.z -= 0.3;
          snake.position.set(side * (18 + Math.random() * 12), -12.6, z);
          if (side < 0) snake.rotation.y = Math.PI;
          this.city.add(snake);
          addMover(snake, 0.35 + Math.random() * 0.25, side < 0 ? -1 : 1, sideLimits(side), 0.04);
        };

        const createSpider = (side, z) => {
          const spider = new THREE.Group();
          const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), spiderMaterial);
          abdomen.position.set(-0.2, 0.62, 0);
          abdomen.scale.set(1.2, 0.85, 1.1);
          spider.add(abdomen);
          const cephalothorax = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), spiderMaterial);
          cephalothorax.position.set(0.52, 0.66, 0);
          spider.add(cephalothorax);
          for (const legSide of [-1, 1]) {
            for (let leg = 0; leg < 4; leg++) {
              const zOffset = (leg - 1.5) * 0.3;
              const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.85, 6), spiderMaterial);
              upper.position.set(0.28 + (leg - 1.5) * 0.22 + legSide * 0.3, 0.5, zOffset + legSide * 0.26);
              upper.rotation.z = legSide * 0.68;
              upper.rotation.x = legSide * 0.38;
              spider.add(upper);
              const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.8, 6), spiderMaterial);
              lower.position.set(upper.position.x + legSide * 0.48, 0.22, zOffset + legSide * 0.52);
              lower.rotation.z = -legSide * 0.45;
              spider.add(lower);
            }
          }
          for (let eye = 0; eye < 4; eye++) {
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), materials.accent);
            bead.position.set(0.78, 0.82, -0.16 + eye * 0.11);
            spider.add(bead);
          }
          spider.position.set(side * (15 + Math.random() * 23), -12.85, z);
          this.city.add(spider);
          addMover(spider, 0.8 + Math.random() * 0.5, side < 0 ? -1 : 1, sideLimits(side), 0.025);
        };

        const createJaguar = (side, z) => {
          const jaguar = new THREE.Group();
          const body = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), jaguarFur);
          body.position.set(0, 0.8, 0);
          body.scale.set(1.5, 0.72, 0.72);
          jaguar.add(body);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), jaguarFur);
          head.position.set(1.28, 0.98, 0);
          jaguar.add(head);
          for (const zSide of [-0.36, 0.36]) {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), jaguarSpot);
            ear.position.set(1.05, 1.4, zSide);
            jaguar.add(ear);
          }
          for (let spot = 0; spot < 14; spot++) {
            const rosette = new THREE.Mesh(new THREE.TorusGeometry(0.11 + Math.random() * 0.07, 0.035, 5, 8), jaguarSpot);
            rosette.position.set(-0.95 + Math.random() * 1.9, 1.04 + Math.random() * 0.34, (Math.random() - 0.5) * 0.9);
            rosette.rotation.x = Math.PI / 2;
            jaguar.add(rosette);
          }
          for (const x of [-0.85, 0.95]) {
            for (const zSide of [-0.43, 0.43]) {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.7, 7), jaguarFur);
              leg.position.set(x, 0.36, zSide);
              jaguar.add(leg);
            }
          }
          const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.5, 7), jaguarFur);
          tail.position.set(-1.65, 0.65, 0);
          tail.rotation.z = Math.PI / 3;
          jaguar.add(tail);
          jaguar.position.set(side * (17 + Math.random() * 18), -12.8, z);
          if (side < 0) jaguar.rotation.y = Math.PI;
          this.city.add(jaguar);
          addMover(jaguar, 1 + Math.random() * 0.5, side < 0 ? -1 : 1, sideLimits(side), 0.04);
        };

        const createMacaw = (side, z) => {
          const bird = new THREE.Group();
          const body = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), birdBody);
          body.scale.set(1.25, 0.8, 0.8);
          bird.add(body);
          const breast = new THREE.Mesh(new THREE.SphereGeometry(0.48, 9, 7), materials.accent);
          breast.position.set(0.2, -0.18, 0);
          breast.scale.set(0.8, 0.8, 0.86);
          bird.add(breast);
          const beak = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.7, 6), birdBeak);
          beak.rotation.z = -Math.PI / 2;
          beak.position.set(0.9, 0.03, 0);
          bird.add(beak);
          const wings = [];
          for (const wingSide of [-1, 1]) {
            const wing = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), birdWing);
            wing.scale.set(1.15, 0.16, 0.6);
            wing.position.set(-0.05, 0.13, wingSide * 0.55);
            wing.rotation.x = wingSide * 0.3;
            bird.add(wing);
            wings.push({ wing, side: wingSide });
          }
          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.25, 5), birdWing);
          tail.rotation.z = Math.PI / 2;
          tail.position.set(-1.05, -0.05, 0);
          bird.add(tail);
          bird.position.set(side * (16 + Math.random() * 22), 7 + Math.random() * 5, z);
          this.city.add(bird);
          addMover(bird, 1.5 + Math.random(), side < 0 ? -1 : 1, sideLimits(side), 0.35);
          bird.userData.wings = wings;
        };

        for (let i = 0; i < 8; i++) {
          const side = i % 2 ? 1 : -1;
          const z = scatterZ();
          createCapybara(side, z);
          createAnaconda(-side, scatterZ());
          createSpider(side, scatterZ());
          if (i % 2 === 0) createJaguar(-side, scatterZ());
          createMacaw(side, scatterZ());
        }
      }
      return;
    }

    if (world.kind === 'desert' || world.kind === 'arctic' || world.kind === 'volcano' || world.kind === 'moon') {
      for (let side of [-1, 1]) {
        for (let i = 0; i < 24; i++) {
          const x = side * (15 + Math.random() * 40);
          const z = scatterZ();
          const height = world.kind === 'arctic' ? 12 + Math.random() * 30 : 8 + Math.random() * 20;
          const peak = cone(materials.buildings[i % 3], [x, -10 + height / 2, z], 5 + Math.random() * 8, height, world.kind === 'desert' ? 5 : 7);
          peak.rotation.z = (Math.random() - 0.5) * 0.35;
          if (world.kind === 'arctic') {
            cone(materials.foliage, [x, -10 + height * 0.78, z], 2.8 + Math.random() * 3, height * 0.38, 7);
          } else if (world.kind === 'volcano') {
            const lava = cylinder(materials.accent, [x + side * 2, -10 + height * 0.42, z + 2], 0.12, 0.35, height * 0.7, 5, [0, 0, side * 0.18]);
            lava.material = materials.accent;
            if (i % 4 === 0) for (let smoke = 0; smoke < 4; smoke++) sphere(materials.dark, [x + (Math.random() - 0.5) * 5, -2 + smoke * 2, z], [2.5, 1.8, 2.5]);
          } else if (world.kind === 'moon') {
            for (let rock = 0; rock < 3; rock++) sphere(materials.dark, [x + (Math.random() - 0.5) * 7, -10 + Math.random() * 3, z + Math.random() * 6], [1.5, 1.1, 1.3]);
          } else if (i % 2 === 0) {
            cylinder(materials.foliage, [x + side * 5, -4, z], 0.55, 0.8, 7, 7);
            cylinder(materials.foliage, [x + side * 4.1, -5, z], 0.35, 0.45, 3, 7, [0, 0, side * 0.8]);
          }
        }
      }
      if (world.kind === 'arctic') {
        const auroraColors = [0x57ffc2, 0x66a8ff, 0xc56cff];
        for (let i = 0; i < 6; i++) {
          const curtainMaterial = new THREE.MeshBasicMaterial({
            color: auroraColors[i % auroraColors.length],
            transparent: true,
            opacity: 0.24,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const curtain = new THREE.Mesh(new THREE.PlaneGeometry(28, 16, 1, 1), curtainMaterial);
          curtain.position.set((i % 2 ? 1 : -1) * (22 + (i % 3) * 9), 27 + (i % 2) * 3, -80 + i * 30);
          curtain.rotation.y = (i % 2 ? -1 : 1) * 0.28;
          this.city.add(curtain);
          this.beams.push({ mesh: curtain, phase: i * 0.8 });
        }
      }
      if (world.kind === 'moon') {
        const earth = new THREE.Mesh(
          new THREE.SphereGeometry(1, 18, 14),
          new THREE.MeshStandardMaterial({ color: 0x225b9c, emissive: 0x102c58, roughness: 1 })
        );
        earth.position.set(35, 35, -75);
        earth.scale.set(9, 9, 9);
        this.city.add(earth);
        for (let i = 0; i < 8; i++) {
          const x = (i % 2 ? 1 : -1) * (14 + Math.random() * 8);
          const z = scatterZ();
          box(materials.buildings[i % 3], [x, -5, z], [4, 4, 4]);
          cylinder(materials.accent, [x, -2.7, z], 0.05, 0.05, 2, 6);
        }
      }
      if (world.kind === 'desert') {
        for (let i = 0; i < 8; i++) {
          const side = i % 2 ? 1 : -1;
          sphere(materials.sand, [side * (20 + Math.random() * 30), -13, scatterZ()], [13, 1.8, 18]);
        }
      }
      return;
    }

    if (world.kind === 'reef') {
      box(materials.water, [0, -18, 0], [150, 2, 220]);
      const coralColors = [solid(0xff6d87), solid(0xffbd62), solid(0xa583e7), solid(0x65d8c4)];
      for (let i = 0; i < 42; i++) {
        const x = scatterX(i % 2 ? 1 : -1);
        const z = scatterZ();
        const material = coralColors[i % coralColors.length];
        cylinder(material, [x, -10, z], 0.35, 0.7, 5 + Math.random() * 5, 6);
        for (let branch = 0; branch < 3; branch++) {
          cylinder(material, [x + (Math.random() - 0.5) * 2, -8 + Math.random() * 2, z + (Math.random() - 0.5) * 2], 0.12, 0.32, 3 + Math.random() * 2, 5, [(Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.8]);
        }
      }
      for (let i = 0; i < 10; i++) {
        const fish = new THREE.Group();
        fish.add(new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), materials.accent));
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 4), materials.windows);
        tail.rotation.z = Math.PI / 2;
        tail.position.x = -0.85;
        fish.add(tail);
        fish.position.set((Math.random() - 0.5) * 50, -4 - Math.random() * 10, scatterZ());
        this.city.add(fish);
        addMover(fish, 2 + Math.random() * 3, i % 2 ? -1 : 1);
      }
      for (let i = 0; i < 24; i++) addFloat(sphere(materials.glow, [scatterX(i % 2 ? 1 : -1), -9 + Math.random() * 8, scatterZ()], [0.15, 0.15, 0.15]), 0.4 + Math.random());
      return;
    }

    if (world.kind === 'ruins') {
      for (let side of [-1, 1]) {
        for (let i = 0; i < 12; i++) {
          const x = side * (14 + Math.random() * 20);
          const z = -90 + i * 16;
          const height = 5 + Math.random() * 8;
          cylinder(materials.stone, [x, -9 + height / 2, z], 0.75, 1, height, 8);
          if (i % 2 === 0) box(materials.stone, [x, -9 + height, z], [2.2, 0.8, 2.2]);
          if (i % 3 === 0) cylinder(materials.buildings[0], [x + side * 2, -10, z + 3], 0.7, 0.9, 6, 7, [Math.PI / 2, 0, 0.4]);
        }
      }
      for (let i = 0; i < 9; i++) {
        const x = (i % 2 ? 1 : -1) * (16 + Math.random() * 18);
        cone(materials.foliage, [x, -5, scatterZ()], 2.8, 6, 5);
        box(materials.stone, [x, -12, scatterZ()], [4 + Math.random() * 5, 1, 3]);
      }
      return;
    }

    if (world.kind === 'clouds') {
      for (let i = 0; i < 42; i++) {
        const side = i % 2 ? 1 : -1;
        const x = scatterX(side);
        const z = scatterZ();
        const y = -3 + Math.random() * 30;
        const cloud = new THREE.Group();
        for (let puff = 0; puff < 5; puff++) {
          const shape = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 7), materials.foliage);
          shape.position.set((Math.random() - 0.5) * 5, Math.random() * 2, (Math.random() - 0.5) * 4);
          shape.scale.set(2 + Math.random() * 2, 1.3 + Math.random(), 1.7 + Math.random());
          cloud.add(shape);
        }
        cloud.position.set(x, y, z);
        this.city.add(cloud);
        addFloat(cloud, 0.2 + Math.random() * 0.3);
        if (i % 3 === 0) cone(materials.buildings[0], [x, y - 5, z], 4.5, 8, 6);
      }
      sphere(materials.accent, [36, 26, -80], [5, 5, 5]);
      return;
    }

    if (world.kind === 'mediterranean') {
      box(materials.water, [0, -16, 0], [150, 1.5, 220]);
      for (let side of [-1, 1]) {
        for (let i = 0; i < 16; i++) {
          const x = side * (13 + Math.random() * 23);
          const z = scatterZ();
          const width = 4 + Math.random() * 4;
          box(materials.buildings[i % 3], [x, -5, z], [width, 8 + Math.random() * 5, 5 + Math.random() * 4]);
          cone(materials.accent, [x, 1, z], width * 0.72, 2.4, 4);
          if (i % 3 === 0) {
            cylinder(materials.buildings[2], [x + side * 5, -4, z], 0.28, 0.45, 9, 7);
            for (let frond = 0; frond < 5; frond++) cone(materials.foliage, [x + side * 5 + Math.cos(frond) * 1.2, 1 + Math.sin(frond) * 0.5, z + Math.sin(frond) * 1.2], 0.45, 4, 5).rotation.z = Math.cos(frond) * 0.7;
          }
        }
      }
      for (let i = 0; i < 12; i++) box(materials.glow, [0, -14.7 + Math.sin(i) * 0.2, -100 + i * 18], [120, 0.045, 0.12]);
      return;
    }
  }

  setTheme(themeNumber) {
    const themeIndex = ((Math.floor(themeNumber) % WORLDS.length) + WORLDS.length) % WORLDS.length;
    if (this.activeThemeIndex === themeIndex) return;
    if (this.worldTransition) this.finishWorldTransition();

    const previous = this.activeBundle;
    let next = this.worldCache.get(themeIndex);
    if (next) this.worldCache.delete(themeIndex);
    else next = this.buildWorldBundle(themeIndex);
    for (const cached of this.worldCache.values()) this.disposeWorldBundle(cached);
    this.worldCache.clear();

    this.activateBundle(next);
    next.city.visible = true;
    this.scene.add(next.city);
    this.activeBundle = next;
    this.activeThemeIndex = themeIndex;

    if (previous) {
      previous.city.visible = true;
      this.beginWorldTransition(previous, next, themeIndex);
    } else {
      this.applyThemeVisuals(themeIndex);
    }
  }

  buildWorldBundle(worldIndex) {
    const previous = {
      city: this.city,
      textureCache: this.textureCache,
      traffic: this.traffic,
      satellites: this.satellites,
      beams: this.beams,
      orbiting: this.orbiting,
      themeMaterials: this.themeMaterials
    };
    this.city = new THREE.Group();
    this.textureCache = new Map();
    this.traffic = [];
    this.satellites = [];
    this.beams = [];
    this.orbiting = [];
    this.themeMaterials = null;

    if (WORLDS[worldIndex].kind === 'cyber') this.createCity();
    else this.createScenicWorld(worldIndex);

    const bundle = {
      index: worldIndex,
      city: this.city,
      textureCache: this.textureCache,
      traffic: this.traffic,
      satellites: this.satellites,
      beams: this.beams,
      orbiting: this.orbiting,
      themeMaterials: this.themeMaterials
    };
    Object.assign(this, previous);
    return bundle;
  }

  activateBundle(bundle) {
    this.city = bundle.city;
    this.textureCache = bundle.textureCache;
    this.traffic = bundle.traffic;
    this.satellites = bundle.satellites;
    this.beams = bundle.beams;
    this.orbiting = bundle.orbiting;
    this.themeMaterials = bundle.themeMaterials;
  }

  prepareWorld(themeNumber) {
    const worldIndex = ((Math.floor(themeNumber) % WORLDS.length) + WORLDS.length) % WORLDS.length;
    if (worldIndex === this.activeThemeIndex || this.worldCache.has(worldIndex) || this.pendingWorldIndex === worldIndex) return;

    const build = deadline => {
      this.pendingWorldIndex = null;
      if (worldIndex === this.activeThemeIndex || this.worldCache.has(worldIndex)) return;
      if (deadline && !deadline.didTimeout && deadline.timeRemaining() < 12) {
        this.pendingWorldIndex = worldIndex;
        requestIdleCallback(build, { timeout: 700 });
        return;
      }
      for (const cached of this.worldCache.values()) this.disposeWorldBundle(cached);
      this.worldCache.clear();
      const bundle = this.buildWorldBundle(worldIndex);
      bundle.city.visible = false;
      this.scene.add(bundle.city);
      this.worldCache.set(worldIndex, bundle);
    };

    this.pendingWorldIndex = worldIndex;
    if ('requestIdleCallback' in window) requestIdleCallback(build, { timeout: 700 });
    else window.setTimeout(() => build(null), 0);
  }

  disposeWorldBundle(bundle) {
    this.scene.remove(bundle.city);
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set(bundle.textureCache.values());
    bundle.city.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (Array.isArray(object.material)) object.material.forEach(material => materials.add(material));
      else if (object.material) materials.add(object.material);
    });
    materials.forEach(material => {
      ['map', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap'].forEach(key => {
        if (material[key]) textures.add(material[key]);
      });
      material.dispose();
    });
    geometries.forEach(geometry => geometry.dispose());
    textures.forEach(texture => texture.dispose());
    bundle.city.clear();
  }

  getLightingSettings(themeIndex) {
    return [
      [0xffffff, 0.4, 0x00ffff, 0.8, 0xff00ff, 1],
      [0xffe9ce, 0.58, 0xffe2c3, 1.15, 0xffc779, 0.3],
      [0xd5ffd8, 0.62, 0xfff0bd, 0.9, 0x9bffad, 0.35],
      [0xffe1c0, 0.58, 0xffbb8d, 1.05, 0xff8c5a, 0.35],
      [0xd4ecff, 0.5, 0xd9f2ff, 0.9, 0x72f4d1, 0.45],
      [0x9cecff, 0.55, 0x6bd9ff, 0.85, 0x47d8cf, 0.35],
      [0xffd0b0, 0.48, 0xff9b68, 0.9, 0xff542e, 0.65],
      [0xe1f1cf, 0.62, 0xffe8b3, 0.8, 0xb8d877, 0.3],
      [0xffe7ed, 0.62, 0xffd5df, 0.88, 0xffb8d3, 0.3],
      [0xf7ebcc, 0.62, 0xffe5b0, 0.9, 0xd9bd7f, 0.25],
      [0xcad7ed, 0.34, 0xd8e4ff, 0.68, 0x83d2ff, 0.35],
      [0xffffff, 0.75, 0xfff5df, 0.85, 0xffdc8b, 0.25],
      [0xe3d6ff, 0.5, 0xc8a4ff, 0.82, 0x73f5d2, 0.4],
      [0xfff0d6, 0.7, 0xfff0d0, 0.92, 0x54b4d0, 0.28],
      [0xffefce, 0.66, 0xffd49a, 0.92, 0xe5b35c, 0.3]
    ][themeIndex];
  }

  applyThemeVisuals(themeIndex) {
    const theme = WORLDS[themeIndex];
    this.scene.background.setHex(theme.background);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(theme.fog);
      this.scene.fog.density = [0.015, 0.008, 0.012, 0.006, 0.009, 0.012, 0.011, 0.012, 0.008, 0.01, 0.006, 0.008, 0.012, 0.007, 0.008][themeIndex];
    }
    this.stars.visible = [0, 3, 4, 6, 8, 10, 12, 14].includes(themeIndex);
    this.stars.material.opacity = this.stars.visible ? 0.9 : 0;
    const starColors = this.stars.geometry.attributes.color;
    const colorA = new THREE.Color(theme.stars[0]);
    const colorB = new THREE.Color(theme.stars[1]);
    for (let i = 0; i < starColors.count; i++) {
      const color = i % 4 === 0 ? colorB : colorA;
      starColors.setXYZ(i, color.r, color.g, color.b);
    }
    starColors.needsUpdate = true;

    const lightSettings = this.getLightingSettings(themeIndex);
    const ambientLight = this.scene.getObjectByName('worldAmbientLight');
    const directionalLight = this.scene.getObjectByName('worldDirectionalLight');
    const accentLight = this.scene.getObjectByName('worldAccentLight');
    if (ambientLight) { ambientLight.color.setHex(lightSettings[0]); ambientLight.intensity = lightSettings[1]; }
    if (directionalLight) { directionalLight.color.setHex(lightSettings[2]); directionalLight.intensity = lightSettings[3]; }
    if (accentLight) { accentLight.color.setHex(lightSettings[4]); accentLight.intensity = lightSettings[5]; }
  }

  getVisualState() {
    return {
      background: this.scene.background.clone(),
      fogColor: this.scene.fog ? this.scene.fog.color.clone() : new THREE.Color(0x000000),
      fogDensity: this.scene.fog ? this.scene.fog.density : 0,
      lights: ['worldAmbientLight', 'worldDirectionalLight', 'worldAccentLight'].map(name => {
        const light = this.scene.getObjectByName(name);
        return light ? { color: light.color.clone(), intensity: light.intensity } : null;
      }),
      starsVisible: this.stars.visible,
      starsOpacity: this.stars.material.opacity
    };
  }

  setMaterialFade(group, fadeIn) {
    const entries = [];
    const seen = new Set();
    group.traverse(object => {
      const list = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of list) {
        if (seen.has(material)) continue;
        seen.add(material);
        const base = { opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite };
        material.userData.worldFadeBase = base;
        material.transparent = true;
        material.depthWrite = false;
        if (fadeIn) material.opacity = 0;
        entries.push({ material, from: fadeIn ? 0 : base.opacity, to: fadeIn ? base.opacity : 0 });
      }
    });
    return entries;
  }

  beginWorldTransition(previous, next, themeIndex) {
    const from = this.getVisualState();
    this.applyThemeVisuals(themeIndex);
    const to = this.getVisualState();
    this.scene.background.copy(from.background);
    if (this.scene.fog) {
      this.scene.fog.color.copy(from.fogColor);
      this.scene.fog.density = from.fogDensity;
    }
    ['worldAmbientLight', 'worldDirectionalLight', 'worldAccentLight'].forEach((name, index) => {
      const light = this.scene.getObjectByName(name);
      if (light && from.lights[index]) {
        light.color.copy(from.lights[index].color);
        light.intensity = from.lights[index].intensity;
      }
    });
    this.stars.visible = from.starsVisible || to.starsVisible;
    this.stars.material.opacity = from.starsOpacity;
    this.worldTransition = {
      elapsed: 0,
      duration: 1,
      previous,
      next,
      from,
      to,
      outgoingMaterials: this.setMaterialFade(previous.city, false),
      incomingMaterials: this.setMaterialFade(next.city, true)
    };
  }

  updateWorldTransition(delta) {
    const transition = this.worldTransition;
    if (!transition) return;
    transition.elapsed = Math.min(transition.elapsed + delta, transition.duration);
    const progress = transition.elapsed / transition.duration;
    const eased = progress * progress * (3 - 2 * progress);
    this.scene.background.copy(transition.from.background).lerp(transition.to.background, eased);
    if (this.scene.fog) {
      this.scene.fog.color.copy(transition.from.fogColor).lerp(transition.to.fogColor, eased);
      this.scene.fog.density = THREE.MathUtils.lerp(transition.from.fogDensity, transition.to.fogDensity, eased);
    }
    ['worldAmbientLight', 'worldDirectionalLight', 'worldAccentLight'].forEach((name, index) => {
      const light = this.scene.getObjectByName(name);
      const start = transition.from.lights[index];
      const end = transition.to.lights[index];
      if (light && start && end) {
        light.color.copy(start.color).lerp(end.color, eased);
        light.intensity = THREE.MathUtils.lerp(start.intensity, end.intensity, eased);
      }
    });
    for (const entry of transition.outgoingMaterials) entry.material.opacity = THREE.MathUtils.lerp(entry.from, entry.to, eased);
    for (const entry of transition.incomingMaterials) entry.material.opacity = THREE.MathUtils.lerp(entry.from, entry.to, eased);
    this.stars.material.opacity = THREE.MathUtils.lerp(transition.from.starsOpacity, transition.to.starsOpacity, eased);
    if (progress >= 1) this.finishWorldTransition();
  }

  finishWorldTransition() {
    const transition = this.worldTransition;
    if (!transition) return;
    this.worldTransition = null;
    for (const { material } of transition.incomingMaterials) {
      const base = material.userData.worldFadeBase;
      if (!base) continue;
      material.opacity = base.opacity;
      material.transparent = base.transparent;
      material.depthWrite = base.depthWrite;
      delete material.userData.worldFadeBase;
    }
    this.disposeWorldBundle(transition.previous);
    this.stars.visible = transition.to.starsVisible;
    this.stars.material.opacity = transition.to.starsOpacity;
  }
}
