import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createBurst(position, colorHex = 0x00ffff, count = 20) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions.push(position.x, position.y, position.z);
      
      const speed = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      velocities.push(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.cos(phi),
        speed * Math.sin(phi) * Math.sin(theta)
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.2,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);

    this.particles.push({
      mesh: particleSystem,
      velocities: velocities,
      life: 1.0
    });
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta * 2;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      const positions = p.mesh.geometry.attributes.position.array;
      for (let j = 0; j < p.velocities.length / 3; j++) {
        positions[j * 3] += p.velocities[j * 3] * delta;
        positions[j * 3 + 1] += p.velocities[j * 3 + 1] * delta;
        positions[j * 3 + 2] += p.velocities[j * 3 + 2] * delta;
      }
      p.mesh.geometry.attributes.position.needsUpdate = true;
      p.mesh.material.opacity = p.life;
    }
  }
}