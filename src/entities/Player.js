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
