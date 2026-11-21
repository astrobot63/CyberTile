import * as THREE from 'three';
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { CyberBackground } from '../effects/CyberBackground.js';
import { CoinReward } from '../effects/CoinReward.js';
import { Input } from '../core/Input.js';

export class GameLoop {
  constructor({ engine, audio, score }) {
    this.engine = engine;
    this.audio = audio;
    this.scoreManager = score;

    this.scene = engine.scene;
    this.background = new CyberBackground(this.scene);
    this.player = new Player(this.scene);
    this.platforms = [];
    this.coinRewards = [];

    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;
    this.landedTiles = 0;
    this.background.setTheme(0);
    this.platformSpacing = 4;
    this.platformsAhead = 9;
    this.lanePositions = [-4.5, 0, 4.5];
    this.currentLaneIndex = 1;
    this.safeLaneIndex = 1;
    this.targetLaneIndex = 1;
    this.targetRowZ = -this.platformSpacing;
    this.manualLaneChoice = false;
    this.lastLandedPlatformZ = 0;
    this.powerUps = {};

    // Register with engine update loop
    this.engine.addUpdatable(this);
  }

  awardCredits(amount) {
    if (this.onCreditsEarned) this.onCreditsEarned(amount);
  }

  start() {
    this.isPlaying = true;
    this.isPaused = false;
    this.score = 0;
    this.landedTiles = 0;
    this.background.setTheme(0);
    this.background.prepareWorld(1);
    this.scoreManager.updateScore(this.score);

    const startZ = 0;
    this.lastLandedPlatformZ = startZ;
    this.currentLaneIndex = 1;
    this.safeLaneIndex = 1;
    this.targetLaneIndex = 1;
    this.targetRowZ = startZ;
    this.manualLaneChoice = false;
    Input.clear();
    this.engine.camera.position.set(0, 10, startZ + 15);
    this.engine.camera.lookAt(0, 2, startZ);

    // Clear existing platforms
    this.clearPlatforms();

    // Spawn initial platforms
    this.spawnInitialPlatforms(startZ);

    // Reset player position on starting platform
    this.player.reset(new THREE.Vector3(0, 2, startZ));
    this.powerUps = this.onRunStart ? this.onRunStart(false) : {};
  }

  restart() {
    this.start();
  }

  clearPlatforms() {
    for (const p of this.platforms) {
      p.destroy();
    }
    this.platforms = [];
    for (const reward of this.coinRewards) reward.destroy();
    this.coinRewards = [];
  }

  spawnInitialPlatforms(startZ = 0) {
    const startPlatform = new Platform(this.scene, new THREE.Vector3(this.lanePositions[1], 0, startZ), { width: 3, height: 0.4, depth: 3 });
    startPlatform.laneIndex = 1;
    this.platforms.push(startPlatform);

    for (let i = 1; i <= this.platformsAhead; i++) {
      this.spawnPlatformRow(startZ - i * this.platformSpacing);
    }
  }

  spawnPlatform(zPos, laneIndex) {
    const xPos = this.lanePositions[laneIndex];
    const yPos = Math.sin(Math.abs(zPos) * 0.2) * 2;
    const platform = new Platform(this.scene, new THREE.Vector3(xPos, yPos, zPos), { width: 3, height: 0.4, depth: 3 });
    platform.laneIndex = laneIndex;
    this.platforms.push(platform);
  }

  spawnPlatformRow(zPos) {
    const unsafeLanes = this.lanePositions.map((_, index) => index).filter(index => index !== this.safeLaneIndex);
    const missingLane = unsafeLanes[Math.floor(Math.random() * unsafeLanes.length)];
    for (let laneIndex = 0; laneIndex < this.lanePositions.length; laneIndex++) {
      if (laneIndex !== missingLane) this.spawnPlatform(zPos, laneIndex);
    }
  }

  ensureSafeLaneAhead(laneIndex, fromZ) {
    this.safeLaneIndex = laneIndex;
    const futureRows = [...new Set(
      this.platforms
        .filter(platform => platform.position.z < fromZ - 1)
        .map(platform => platform.position.z)
    )];
    for (const zPos of futureRows) {
      const hasSafeTile = this.platforms.some(
        platform => platform.laneIndex === laneIndex && Math.abs(platform.position.z - zPos) < 0.01
      );
      if (!hasSafeTile) this.spawnPlatform(zPos, laneIndex);
    }
  }

  update(delta) {
    this.background.update(delta, this.engine.camera);
    if (this.isPaused) return;

    for (const platform of this.platforms) platform.update(delta);
    this.coinRewards = this.coinRewards.filter(reward => {
      reward.update(delta);
      if (reward.life > 0) return true;
      reward.destroy();
      return false;
    });
    if (!this.isPlaying) return;

    const laneChange = Input.consumeLaneChange();
    if (laneChange) {
      const baseLane = this.manualLaneChoice || this.targetLaneIndex !== this.currentLaneIndex
        ? this.targetLaneIndex
        : this.currentLaneIndex;
      const nextLane = THREE.MathUtils.clamp(
        baseLane + laneChange,
        0,
        this.lanePositions.length - 1
      );
      if (nextLane !== baseLane) {
        this.manualLaneChoice = true;
        this.targetLaneIndex = nextLane;
      }
    }

    // Advance automatically; taps and key presses select the next lane.
    const touchedPlatform = this.player.update(
      delta,
      this.platforms,
      this.lanePositions[this.targetLaneIndex],
      this.targetRowZ
    );

    if (touchedPlatform) {
      const success = touchedPlatform.touch();
      if (!success) {
        // Game Over! Stepped on an already touched/disabled platform!
        this.gameOver();
      } else {
        this.currentLaneIndex = touchedPlatform.laneIndex;
        if (!this.manualLaneChoice) this.targetLaneIndex = touchedPlatform.laneIndex;
        this.manualLaneChoice = false;
        this.targetRowZ = touchedPlatform.position.z - this.platformSpacing;
        this.ensureSafeLaneAhead(touchedPlatform.laneIndex, touchedPlatform.position.z);
        const tilesAdvanced = Math.max(1, Math.round(
          (this.lastLandedPlatformZ - touchedPlatform.position.z) / this.platformSpacing
        ));
        const skippedTiles = Math.max(0, tilesAdvanced - 1);
        this.lastLandedPlatformZ = touchedPlatform.position.z;
        this.landedTiles++;

        if (skippedTiles > 0) this.audio.playSkip();
        else this.audio.playJump();
        const scoreGain = this.powerUps.scoreBoost > 0 ? 20 : 10;
        if (this.powerUps.scoreBoost > 0) this.powerUps.scoreBoost--;
        this.score += scoreGain;
        this.scoreManager.updateScore(this.score);
        let coinAmount = 1 + skippedTiles * 3;
        if (this.powerUps.coinMagnet > 0) {
          coinAmount += 2;
          this.powerUps.coinMagnet--;
        }
        if (this.powerUps.doubleCoins > 0) {
          coinAmount *= 2;
          this.powerUps.doubleCoins--;
        }
        this.awardCredits(coinAmount);
        this.coinRewards.push(new CoinReward(
          this.scene,
          touchedPlatform.position.clone().add(new THREE.Vector3(0, 0.7, 0)),
          coinAmount,
          skippedTiles > 0
        ));
        this.background.setTheme(Math.floor(this.landedTiles / 75));
        const jumpsIntoWorld = this.landedTiles % 75;
        if (jumpsIntoWorld >= 60) {
          this.background.prepareWorld(Math.floor(this.landedTiles / 75) + 1);
        }

        this.maintainPlatformRunway();
      }
    }

    // Check fall out of bounds
    if (this.player.position.y < -10) {
      if (!this.rescueWithShield()) this.gameOver();
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

  rescueWithShield() {
    if (!this.powerUps.shield) return false;
    const platform = this.platforms
      .filter(candidate => !candidate.isTouched && candidate.position.z < this.player.position.z)
      .sort((a, b) => Math.abs(a.position.z - this.player.position.z) - Math.abs(b.position.z - this.player.position.z))[0];
    if (!platform) return false;

    this.powerUps.shield = false;
    this.player.position.set(
      platform.position.x,
      platform.position.y + platform.height / 2 + this.player.radius + 0.05,
      platform.position.z
    );
    this.player.velocity.set(0, 0, 0);
    this.currentLaneIndex = platform.laneIndex;
    this.safeLaneIndex = platform.laneIndex;
    this.targetLaneIndex = platform.laneIndex;
    this.targetRowZ = platform.position.z - this.platformSpacing;
    this.manualLaneChoice = false;
    this.ensureSafeLaneAhead(platform.laneIndex, platform.position.z);
    this.player.mesh.position.copy(this.player.position);
    this.lastLandedPlatformZ = Math.max(this.lastLandedPlatformZ, platform.position.z);
    return true;
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
    const requiredFurthestZ = this.player.position.z - this.platformSpacing * this.platformsAhead;
    let furthestZ = this.platforms.length
      ? Math.min(...this.platforms.map(platform => platform.position.z))
      : this.player.position.z;

    while (furthestZ > requiredFurthestZ) {
      furthestZ -= this.platformSpacing;
      this.spawnPlatformRow(furthestZ);
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
