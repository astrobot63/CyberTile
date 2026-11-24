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
    this.autoAdvance = false;
    this.holdTile = null;
    this.failedHoldTile = null;

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
    this.trailPointCount = 24;
    this.trailRebuildTimer = 0;
    this.trailPositions = Array.from({ length: this.trailPointCount }, (_, i) =>
      this.position.clone().add(new THREE.Vector3(0, 0, i * 0.08))
    );
    this.trailCurve = new THREE.CatmullRomCurve3(this.trailPositions);
    this.trailGeometry = new THREE.TubeGeometry(this.trailCurve, 48, 0.2, 8, false);
    this.trailMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.trail = new THREE.Mesh(this.trailGeometry, this.trailMaterial);
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    this.setTrail('#00ffff');
    this.updateTrail(0);
  }

  updateTrail(delta) {
    if (delta > 0) {
      this.trailRebuildTimer += delta;
      if (this.trailRebuildTimer < 1 / 30) return;
      this.trailRebuildTimer = 0;
    }
    if (delta > 0 && this.position.distanceToSquared(this.trailPositions[0]) > 0.0125) {
      this.trailPositions.unshift(this.position.clone());
      this.trailPositions.pop();
    } else if (delta === 0) {
      this.trailPositions = Array.from({ length: this.trailPointCount }, (_, i) =>
        this.position.clone().add(new THREE.Vector3(0, 0, i * 0.08))
      );
    }
    this.trailCurve.points = this.trailPositions;
    this.trailGeometry.dispose();
    this.trailGeometry = new THREE.TubeGeometry(this.trailCurve, 48, 0.2, 8, false);
    this.trail.geometry = this.trailGeometry;
  }

  setSkin(color) {
    this.material.color.set(color);
    this.material.emissive.set(color);
  }

  setTrail(color) {
    this.trailColor = color;
    if (this.trailMaterial) this.trailMaterial.color.set(color);
  }

  reset(pos = new THREE.Vector3(0, 2, 0)) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.autoAdvance = false;
    this.holdTile = null;
    this.failedHoldTile = null;
    this.mesh.position.copy(this.position);
    this.updateTrail(0);
  }

  update(delta, platforms, targetLaneX = 0, holdActive = false) {
    const previousPosition = this.position.clone();
    const dx = targetLaneX - this.position.x;
    const desiredXVelocity = THREE.MathUtils.clamp(dx * 18, -this.speed * 3.5, this.speed * 3.5);
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, desiredXVelocity, 40, delta);
    if (Math.abs(dx) < 0.035 && Math.abs(this.velocity.x) < 0.25) {
      this.position.x = targetLaneX;
      this.velocity.x = 0;
    }
    this.velocity.z = this.autoAdvance ? -this.speed : 0;

    if (this.holdTile) {
      if (!holdActive) {
        this.failedHoldTile = this.holdTile;
        this.holdTile = null;
      } else {
        const tile = this.holdTile;
        const tileTop = tile.position.y + tile.height / 2;
        const exitZ = tile.position.z - tile.size.depth / 2 + this.radius * 0.5;
        this.position.x = tile.position.x;
        this.position.y = tileTop + this.radius;
        this.position.z += this.velocity.z * delta;
        this.velocity.y = 0;
        this.isGrounded = true;
        if (this.position.z <= exitZ) {
          this.position.z = exitZ;
          this.holdTile = null;
          this.velocity.y = this.jumpForce;
          this.isGrounded = false;
          this.mesh.position.copy(this.position);
          this.updateTrail(0);
          return tile;
        }
        this.mesh.position.copy(this.position);
        this.updateTrail(delta);
        return null;
      }
    }

    // Apply gravity, then check the whole movement step so a fast frame cannot
    // move the ball from above a tile to below it without a collision check.
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
      if (platform === this.failedHoldTile) continue;
      const platformTop = platform.position.y + platform.height / 2;
      const crossedPlatformTop = previousPosition.y - this.radius >= platformTop
        && this.position.y - this.radius <= platformTop;
      const overlapsPlatformXZ = this.position.x >= platform.position.x - platform.size.width / 2 - this.radius
        && this.position.x <= platform.position.x + platform.size.width / 2 + this.radius
        && this.position.z >= platform.position.z - platform.size.depth / 2 - this.radius
        && this.position.z <= platform.position.z + platform.size.depth / 2 + this.radius;

      if (this.velocity.y <= 0 && crossedPlatformTop && overlapsPlatformXZ) {
        // Place the ball on the surface at the crossing point to prevent tunneling.
        this.position.y = platformTop + this.radius;
        this.mesh.position.copy(this.position);
        if (platform.isHoldTile) {
          if (!holdActive) {
            this.failedHoldTile = platform;
            continue;
          }
          this.holdTile = platform;
          this.position.x = platform.position.x;
          this.position.y = platform.position.y + platform.height / 2 + this.radius;
          this.velocity.y = 0;
          this.isGrounded = true;
          this.autoAdvance = true;
          this.mesh.position.copy(this.position);
          this.updateTrail(0);
          return null;
        }
        this.position.x = platform.position.x;
        this.position.z = platform.position.z;
        this.position.y = platform.position.y + platform.height / 2 + this.radius;
        this.mesh.position.copy(this.position);
        this.updateTrail(0);
        this.velocity.y = this.jumpForce; // Automatic bounce/jump
        this.isGrounded = true;
        this.autoAdvance = true;

        // Notify platform interaction
        return platform;
      }
    }

    return null;
  }
}
