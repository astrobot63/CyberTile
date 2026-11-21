import * as THREE from 'three';
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { CyberBackground } from '../effects/CyberBackground.js';

export class GameLoop {
  constructor({ engine, audio, score }) {
    this.engine = engine;
    this.audio = audio;
    this.scoreManager = score;

    this.scene = engine.scene;
    this.background = new CyberBackground(this.scene);
    this.player = new Player(this.scene);
    this.platforms = [];

    this.isPlaying = false;
    this.score = 0;
    this.platformSpacing = 4;
    this.platformsAhead = 9;

    // Register with engine update loop
    this.engine.addUpdatable(this);
  }

  awardCredits(amount) {
    if (this.onCreditsEarned) this.onCreditsEarned(amount);
  }

  start() {
    this.isPlaying = true;
    this.score = 0;
    this.scoreManager.updateScore(0);

    // Clear existing platforms
    this.clearPlatforms();

    // Spawn initial platforms
    this.spawnInitialPlatforms();

    // Reset player position on starting platform
    this.player.reset(new THREE.Vector3(0, 2, 0));
  }

  restart() {
    this.start();
  }

  clearPlatforms() {
    for (const p of this.platforms) {
      p.destroy();
    }
    this.platforms = [];
  }

  spawnInitialPlatforms() {
    // Starting platform
    const startPlatform = new Platform(this.scene, new THREE.Vector3(0, 0, 0), { width: 4, height: 0.4, depth: 4 });
    this.platforms.push(startPlatform);

    // Spawn subsequent floating platforms
    for (let i = 1; i <= this.platformsAhead; i++) {
      this.spawnPlatform(i * -this.platformSpacing);
    }
  }

  spawnPlatform(zPos) {
    const xPos = (Math.random() - 0.5) * 8;
    const yPos = Math.sin(Math.abs(zPos) * 0.2) * 2;
    const platform = new Platform(this.scene, new THREE.Vector3(xPos, yPos, zPos), { width: 3, height: 0.4, depth: 3 });
    this.platforms.push(platform);
  }

  update(delta) {
    this.background.update(delta, this.engine.camera);
    if (!this.isPlaying) return;

    // Update player and check platform collisions
    const touchedPlatform = this.player.update(delta, this.platforms);

    if (touchedPlatform) {
      const success = touchedPlatform.touch();
      if (!success) {
        // Game Over! Stepped on an already touched/disabled platform!
        this.gameOver();
      } else {
        this.audio.playJump();
        this.score += 10;
        this.scoreManager.updateScore(this.score);
        this.awardCredits(10);

        this.maintainPlatformRunway();
      }
    }

    // Check fall out of bounds
    if (this.player.position.y < -10) {
      this.gameOver();
    }

    // Smooth camera follow
    const targetCameraPos = new THREE.Vector3(
      this.player.position.x * 0.5,
      this.player.position.y + 6,
      this.player.position.z + 10
    );
    this.engine.camera.position.lerp(targetCameraPos, 0.1);
    this.engine.camera.lookAt(this.player.position.x, this.player.position.y, this.player.position.z);
  }

  maintainPlatformRunway() {
    // Remove platforms well behind the player so skipped tiles cannot leave a
    // stale "furthest" position that causes the next tile to spawn nearby.
    this.platforms = this.platforms.filter(platform => {
      if (platform.position.z > this.player.position.z + 8) {
        platform.destroy();
        return false;
      }
      return true;
    });

    // Keep a fixed number of tiles ahead of the player's progress. Starting
    // from the player's position also handles large jumps over several tiles.
    const furthestZ = this.platforms.length
      ? Math.min(...this.platforms.map(platform => platform.position.z))
      : this.player.position.z;
    const requiredFurthestZ = this.player.position.z - this.platformSpacing * this.platformsAhead;
    const targetFurthestZ = Math.min(furthestZ, requiredFurthestZ);

    while (this.platforms.length < this.platformsAhead + 1 ||
           Math.min(...this.platforms.map(platform => platform.position.z)) > requiredFurthestZ) {
      const nextZ = this.platforms.length
        ? Math.min(...this.platforms.map(platform => platform.position.z)) - this.platformSpacing
        : targetFurthestZ;
      this.spawnPlatform(nextZ);
    }
  }

  gameOver() {
    this.isPlaying = false;
    this.audio.playGameOver();
    this.scoreManager.saveBestScore(this.score);

    window.dispatchEvent(new CustomEvent('game-over', {
      detail: { score: this.score }
    }));
  }
}
