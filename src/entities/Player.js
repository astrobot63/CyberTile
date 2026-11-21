import * as THREE from 'three';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.position = new THREE.Vector3(0, 2, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 8;
    this.jumpForce = 10;
    this.gravity = -25;
    this.isGrounded = false;
    this.radius = 0.5;
    this.material = null;
    this.trail = null;

    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
    this.createTrail();
  }

  createTrail() {
    const count = 16;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.trailPositions = Array.from({ length: count }, () => this.position.clone());
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.trailMaterial = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.trail = new THREE.Points(this.trailGeometry, this.trailMaterial);
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    this.setTrail('#00ffff');
    this.updateTrail(0);
  }

  updateTrail(delta) {
    if (delta > 0) {
      this.trailPositions.unshift(this.position.clone());
      this.trailPositions.pop();
    } else {
      this.trailPositions.fill(this.position.clone());
    }
    const positions = this.trailGeometry.attributes.position;
    this.trailPositions.forEach((point, i) => positions.setXYZ(i, point.x, point.y, point.z));
    positions.needsUpdate = true;
  }

  setSkin(color) {
    this.material.color.set(color);
    this.material.emissive.set(color);
  }

  setTrail(color) {
    this.trailColor = color;
    if (!this.trailGeometry) return;
    const colors = this.trailGeometry.attributes.color;
    const baseColor = new THREE.Color(color);
    for (let i = 0; i < colors.count; i++) {
      const fade = 1 - i / colors.count;
      colors.setXYZ(i, baseColor.r * fade, baseColor.g * fade, baseColor.b * fade);
    }
    colors.needsUpdate = true;
  }

  reset(pos = new THREE.Vector3(0, 2, 0)) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.mesh.position.copy(this.position);
    this.updateTrail(0);
  }

  update(delta, platforms, targetLaneX = 0, targetRowZ = this.position.z - 4) {
    const moveDir = new THREE.Vector3(0, 0, 0);
    const dx = targetLaneX - this.position.x;
    const dz = targetRowZ - this.position.z;
    const safeX = 0.04;
    const safeZ = 0.04;
    moveDir.x = Math.abs(dx) > safeX ? Math.sign(dx) : 0;
    moveDir.z = Math.abs(dz) > safeZ ? Math.sign(dz) : 0;

    moveDir.normalize();

    // Apply movement velocity
    this.velocity.x = moveDir.x * this.speed;
    this.velocity.z = moveDir.z * this.speed;

    // Apply gravity
    this.velocity.y += this.gravity * delta;

    // Update position
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;
    this.mesh.position.copy(this.position);
    this.updateTrail(delta);

    // Platform Collision Detection
    this.isGrounded = false;
    for (const platform of platforms) {
      // Shattered tiles are gone from the world, so let the player fall
      // through their former position instead of colliding with an invisible tile.
      if (platform.isTouched) continue;
      if (platform.checkCollision(this.position, this.radius)) {
        // Land on platform if falling
        if (this.velocity.y <= 0 && this.position.y >= platform.position.y) {
          this.position.y = platform.position.y + platform.height / 2 + this.radius;
          this.velocity.y = this.jumpForce; // Automatic bounce/jump
          this.isGrounded = true;

          // Notify platform interaction
          return platform;
        }
      }
    }

    return null;
  }
}
