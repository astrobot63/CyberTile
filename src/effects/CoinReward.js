import * as THREE from 'three';

export class CoinReward {
  constructor(scene, position, amount) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.life = 1.25;
    this.startLife = this.life;
    this.riseSpeed = 1.4;
    this.coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd34f,
      emissive: 0xa87500,
      emissiveIntensity: 0.8,
      metalness: 0.75,
      roughness: 0.25
    });
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.11, 24), this.coinMaterial);
    coin.rotation.x = Math.PI / 2;
    this.group.add(coin);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.font = 'bold 68px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineWidth = 9;
    context.strokeStyle = 'rgba(5, 10, 24, 0.9)';
    context.strokeText(`×${amount}`, 128, 65);
    context.fillStyle = '#ffe58a';
    context.fillText(`×${amount}`, 128, 65);
    this.labelTexture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.labelTexture,
      transparent: true,
      depthTest: false
    }));
    label.position.y = 0.72;
    label.scale.set(1.5, 0.75, 1);
    this.group.add(label);
    this.scene.add(this.group);
  }

  update(delta) {
    this.life -= delta;
    this.group.position.y += this.riseSpeed * delta;
    this.group.rotation.y += delta * 2.5;
    const remaining = Math.max(0, this.life / this.startLife);
    this.group.scale.setScalar(0.85 + (1 - remaining) * 0.25);
    this.coinMaterial.opacity = remaining;
    this.coinMaterial.transparent = true;
    for (const child of this.group.children) {
      if (child.isSprite) child.material.opacity = remaining;
    }
  }

  destroy() {
    this.scene.remove(this.group);
    for (const child of this.group.children) {
      if (child.geometry) child.geometry.dispose();
      if (child.material && child.material !== this.coinMaterial) child.material.dispose();
    }
    this.coinMaterial.dispose();
    this.labelTexture.dispose();
  }
}
