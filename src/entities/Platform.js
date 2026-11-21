import * as THREE from 'three';

export class Platform {
  constructor(scene, position, size = { width: 3, height: 0.4, depth: 3 }) {
    this.scene = scene;
    this.position = position;
    this.size = size;
    this.height = size.height;
    this.isTouched = false;
    this.isVanishing = false;
    this.vanishTimer = 0;

    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth);
    
    // Active material (Glowing cyan/neon)
    this.activeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.8
    });

    // Touched/Disabled material (Dark red/gray)
    this.disabledMaterial = new THREE.MeshStandardMaterial({
      color: 0x331111,
      emissive: 0xff0044,
      emissiveIntensity: 0.2,
      roughness: 0.7,
      metalness: 0.2
    });

    this.mesh = new THREE.Mesh(geometry, this.activeMaterial);
    this.mesh.position.copy(this.position);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  touch() {
    if (this.isTouched) return false; // Already touched! Game over condition if stepped on again.
    
    this.isTouched = true;
    this.mesh.material = this.disabledMaterial;
    return true;
  }

  checkCollision(playerPos, radius) {
    const halfW = this.size.width / 2;
    const halfD = this.size.depth / 2;

    // Check X and Z bounds within platform edges
    const withinX = playerPos.x >= this.position.x - halfW - radius && playerPos.x <= this.position.x + halfW + radius;
    const withinZ = playerPos.z >= this.position.z - halfD - radius && playerPos.z <= this.position.z + halfD + radius;
    
    // Check Y bounds (top surface)
    const platformTop = this.position.y + this.height / 2;
    const withinY = playerPos.y - radius <= platformTop && playerPos.y >= platformTop - 0.8;

    return withinX && withinZ && withinY;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.activeMaterial.dispose();
    this.disabledMaterial.dispose();
  }
}