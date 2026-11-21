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
    this.shards = [];

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
    this.shatter();
    return true;
  }

  shatter() {
    const sourceGeometry = this.mesh.geometry;
    const shardMaterial = new THREE.MeshStandardMaterial({
      color: 0x00dce8,
      emissive: 0x007d91,
      emissiveIntensity: 0.65,
      metalness: 0.65,
      roughness: 0.32
    });
    const columns = 3;
    const rows = 2;
    const layers = 2;
    const shardSize = new THREE.Vector3(
      this.size.width / columns * 0.92,
      this.size.height / layers * 0.9,
      this.size.depth / rows * 0.92
    );

    this.scene.remove(this.mesh);
    sourceGeometry.dispose();
    this.activeMaterial.dispose();
    this.disabledMaterial.dispose();

    for (let x = 0; x < columns; x++) {
      for (let z = 0; z < rows; z++) {
        for (let y = 0; y < layers; y++) {
          const geometry = new THREE.BoxGeometry(shardSize.x, shardSize.y, shardSize.z);
          const shard = new THREE.Mesh(geometry, shardMaterial);
          shard.position.set(
            this.position.x + (x - (columns - 1) / 2) * this.size.width / columns,
            this.position.y + (y - (layers - 1) / 2) * this.size.height / layers,
            this.position.z + (z - (rows - 1) / 2) * this.size.depth / rows
          );
          shard.castShadow = true;
          shard.userData.velocity = new THREE.Vector3(
            (x - (columns - 1) / 2) * 1.8 + (Math.random() - 0.5) * 1.2,
            2.2 + Math.random() * 2.2,
            (z - (rows - 1) / 2) * 1.8 + (Math.random() - 0.5) * 1.2
          );
          shard.userData.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
          );
          shard.userData.life = 1.1;
          this.scene.add(shard);
          this.shards.push(shard);
        }
      }
    }
    this.shardMaterial = shardMaterial;
  }

  update(delta) {
    for (const shard of this.shards) {
      shard.userData.life -= delta;
      shard.userData.velocity.y -= 12 * delta;
      shard.position.addScaledVector(shard.userData.velocity, delta);
      shard.rotation.x += shard.userData.rotationSpeed.x * delta;
      shard.rotation.y += shard.userData.rotationSpeed.y * delta;
      shard.rotation.z += shard.userData.rotationSpeed.z * delta;
      shard.scale.setScalar(Math.max(0.01, Math.min(1, shard.userData.life * 2)));
    }
    if (this.shards.length && this.shards[0].userData.life <= 0) this.clearShards();
  }

  clearShards() {
    for (const shard of this.shards) {
      this.scene.remove(shard);
      shard.geometry.dispose();
    }
    this.shards = [];
    if (this.shardMaterial) {
      this.shardMaterial.dispose();
      this.shardMaterial = null;
    }
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
    if (this.mesh.geometry) this.mesh.geometry.dispose();
    this.activeMaterial?.dispose();
    this.disabledMaterial?.dispose();
    this.clearShards();
  }
}
