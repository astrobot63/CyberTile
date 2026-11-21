import * as THREE from 'three';
import { Input } from '../core/Input.js';

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
  }

  setSkin(color) {
    this.material.color.set(color);
    this.material.emissive.set(color);
  }

  reset(pos = new THREE.Vector3(0, 2, 0)) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.mesh.position.copy(this.position);
  }

  update(delta, platforms) {
    // Handle input direction
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (Input.isPressed('KeyW') || Input.isPressed('ArrowUp')) moveDir.z -= 1;
    if (Input.isPressed('KeyS') || Input.isPressed('ArrowDown')) moveDir.z += 1;
    if (Input.isPressed('KeyA') || Input.isPressed('ArrowLeft')) moveDir.x -= 1;
    if (Input.isPressed('KeyD') || Input.isPressed('ArrowRight')) moveDir.x += 1;
    const touchMovement = Input.getTouchMovement();
    if (Input.autoForward) {
      const nextPlatform = platforms
        .filter(platform => !platform.isTouched && platform.position.z < this.position.z - 1)
        .sort((a, b) => b.position.z - a.position.z)[0];

      if (nextPlatform) {
        const dx = nextPlatform.position.x - this.position.x;
        const dz = nextPlatform.position.z - this.position.z;
        const safeX = Math.max(0, nextPlatform.size.width / 2 - this.radius);
        const safeZ = Math.max(0, nextPlatform.size.depth / 2 - this.radius);
        moveDir.x = Math.abs(dx) > safeX ? Math.sign(dx) : 0;
        moveDir.z = Math.abs(dz) > safeZ ? Math.sign(dz) : 0;
      } else {
        moveDir.z = -1;
      }

      // Side-to-side dragging still steers the ball while it advances safely.
      if (Math.abs(touchMovement.x) > 0.04) moveDir.x = touchMovement.x;
      if (Math.abs(touchMovement.z) > 0.04) moveDir.z = touchMovement.z;
    } else {
      moveDir.x += touchMovement.x;
      moveDir.z += touchMovement.z;
    }

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

    this.mesh.position.copy(this.position);
    return null;
  }
}
