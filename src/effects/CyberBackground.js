import * as THREE from 'three';

// A camera-following city canyon, scrolling traffic, and drifting starfield.
export class CyberBackground {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    this.city = new THREE.Group();
    this.traffic = [];
    this.satellites = [];
    this.beams = [];
    this.orbiting = [];
    this.stars = this.createStarfield();
    this.createCity();
    scene.add(this.city, this.stars);
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

  createCity() {
    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x202849, emissive: 0x111c42, emissiveIntensity: 0.75, metalness: 0.65, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x352044, emissive: 0x291044, emissiveIntensity: 0.65, metalness: 0.7, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ color: 0x173849, emissive: 0x0b3448, emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.3 })
    ];
    const cyan = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
    const pink = new THREE.MeshBasicMaterial({ color: 0xff20bd });
    const gold = new THREE.MeshBasicMaterial({ color: 0xffbd55 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x123b5c, emissive: 0x06365c, emissiveIntensity: 1.1, metalness: 0.8, roughness: 0.18, transparent: true, opacity: 0.82 });
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const trimGeometry = new THREE.BoxGeometry(1, 1, 1);
    const windowMaterials = [cyan, pink, gold];

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
    // Anchor the scenery to the camera so the horizon never runs out as play advances.
    this.city.position.set(camera.position.x * 0.35, camera.position.y * 0.35, camera.position.z);
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
      vehicle.position.y = data.baseY + Math.sin(this.time * 1.4 + data.phase) * 0.45;
      if (vehicle.position.x > 42) vehicle.position.x = -42;
      if (vehicle.position.x < -42) vehicle.position.x = 42;
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
}
