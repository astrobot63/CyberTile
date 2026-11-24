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
    this.basePlatformSpacing = 6.4;
    this.platformSpacing = this.basePlatformSpacing;
    this.platformsAhead = 9;
    this.runStartZ = 0;
    this.nextBeatIndex = 1;
    this.nextLaneAfterHold = null;
    this.lastSpawnedLane = 1;
    this.lanePositions = [-4.5, 0, 4.5];
    this.currentLaneIndex = 1;
    this.safeLaneIndex = 1;
    this.targetLaneIndex = 1;
    this.manualLaneChoice = false;
    this.powerUps = {};
    this.isTestRun = false;
    this.testStartJumpCount = 0;

    // Register with engine update loop
    this.engine.addUpdatable(this);
  }

  awardCredits(amount) {
    if (this.onCreditsEarned) this.onCreditsEarned(amount);
  }

  start(startingJumps = 0, testRun = false, continueSong = false) {
    this.isPlaying = true;
    this.isPaused = false;
    this.isTestRun = testRun;
    this.testStartJumpCount = startingJumps;
    this.score = startingJumps * 10;
    this.landedTiles = startingJumps;
    this.background.setTheme(Math.floor(startingJumps / 75));
    this.background.prepareWorld(Math.floor(startingJumps / 75) + 1);
    if (continueSong) this.audio.syncBeatClockToSong?.();
    else this.audio.resetBeatClock?.();
    this.runBeatOrigin = this.audio.beatIndex ?? 0;
    this.updateBeatMovement();
    this.scoreManager.updateScore(this.score, !testRun);

    const startZ = -startingJumps * this.platformSpacing;
    this.runStartZ = startZ;
    this.nextBeatIndex = 1;
    this.nextLaneAfterHold = null;
    this.lastSpawnedLane = 1;
    this.currentLaneIndex = 1;
    this.safeLaneIndex = 1;
    this.targetLaneIndex = 1;
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
    this.powerUps = this.onRunStart ? this.onRunStart(testRun) : {};
  }

  startTestAtJumpCount(jumpCount) {
    const startingJumps = THREE.MathUtils.clamp(Math.floor(jumpCount), 0, 10000);
    this.start(startingJumps, true);
  }

  restart() {
    this.start(this.testStartJumpCount, this.isTestRun, false);
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
    this.lastSpawnedLane = 1;

    let beatIndex = 1;
    while (beatIndex <= this.platformsAhead) {
      beatIndex += this.spawnPlatformRow(startZ - beatIndex * this.platformSpacing, beatIndex);
    }
    this.nextBeatIndex = beatIndex;
  }

  spawnPlatform(zPos, laneIndex, size, special = {}) {
    const xPos = this.lanePositions[laneIndex];
    const platform = new Platform(
      this.scene,
      new THREE.Vector3(xPos, 0, zPos),
      size ?? { width: 3, height: 0.4, depth: 3 },
      special
    );
    platform.laneIndex = laneIndex;
    this.platforms.push(platform);
  }

  spawnPlatformRow(zPos, beatIndex = this.nextBeatIndex) {
    const rowAlreadyExists = this.platforms.some(platform => Math.abs(platform.position.z - zPos) < 0.01);
    if (rowAlreadyExists) return 1;

    const holdSection = this.audio.getHoldSectionAtBeat?.(this.runBeatOrigin + beatIndex);
    const beatDuration = this.audio.getBeatDuration?.() ?? 0.8;
    const holdBeats = holdSection ? Math.max(1, Math.round(holdSection.duration / beatDuration)) : 0;
    const tileStartZ = this.runStartZ - beatIndex * this.platformSpacing;
    let laneIndex = this.nextLaneAfterHold ?? Math.floor(Math.random() * this.lanePositions.length);
    this.nextLaneAfterHold = null;

    if (holdBeats > 0) {
      const holdDistance = holdBeats * this.platformSpacing;
      // Keep the hold section in the lane the player just reached so the
      // special tile never asks for a last-second lane change.
      laneIndex = this.lastSpawnedLane;
      const approachBuffer = 1.2;
      this.spawnPlatform(
        tileStartZ - holdDistance / 2 + approachBuffer / 2,
        laneIndex,
        { width: 3, height: 0.4, depth: holdDistance + approachBuffer },
        { holdBeats, holdDuration: holdBeats * beatDuration, holdApproachBuffer: approachBuffer }
      );
      this.nextLaneAfterHold = laneIndex;
      this.lastSpawnedLane = laneIndex;
      return holdBeats + 1;
    }

    this.spawnPlatform(tileStartZ, laneIndex);
    this.lastSpawnedLane = laneIndex;
    return 1;
  }

  removeDuplicatePlatformRows() {
    const occupiedRows = new Set();
    this.platforms = this.platforms.filter(platform => {
      const rowKey = Math.round(platform.position.z * 100);
      if (occupiedRows.has(rowKey)) {
        platform.destroy();
        return false;
      }
      occupiedRows.add(rowKey);
      return true;
    });
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
      Input.isHolding()
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
        this.safeLaneIndex = touchedPlatform.laneIndex;
        this.landedTiles++;
        this.audio.advanceBeat?.(touchedPlatform.isHoldTile ? touchedPlatform.holdBeats + 1 : 1);
        this.updateBeatMovement();
        this.player.velocity.y = this.player.jumpForce;

        this.audio.playJump();
        const scoreGain = this.powerUps.scoreBoost > 0 ? 20 : 10;
        if (this.powerUps.scoreBoost > 0) this.powerUps.scoreBoost--;
        this.score += scoreGain;
        this.scoreManager.updateScore(this.score, !this.isTestRun);
        let coinAmount = 1;
        if (this.powerUps.coinMagnet > 0) {
          coinAmount += 2;
          this.powerUps.coinMagnet--;
        }
        if (this.powerUps.doubleCoins > 0) {
          coinAmount *= 2;
          this.powerUps.doubleCoins--;
        }
        if (!this.isTestRun) this.awardCredits(coinAmount);
        this.coinRewards.push(new CoinReward(
          this.scene,
          this.player.position.clone().add(new THREE.Vector3(0, 0.7, 0)),
          coinAmount
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

  updateBeatMovement() {
    this.platformSpacing = this.basePlatformSpacing;
    const beatDuration = THREE.MathUtils.clamp(this.audio.getBeatDuration?.() ?? 0.8, 0.25, 1.5);
    const jumpHeight = 2;
    this.player.speed = this.platformSpacing / beatDuration;
    this.player.jumpForce = (4 * jumpHeight) / beatDuration;
    this.player.gravity = (-8 * jumpHeight) / (beatDuration * beatDuration);
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
    this.manualLaneChoice = false;
    this.player.mesh.position.copy(this.player.position);
    return true;
  }

  getRevivePlatform() {
    return this.platforms
      .filter(platform => !platform.isTouched && !platform.isHoldTile)
      .sort((a, b) => Math.abs(a.position.z - this.player.position.z) - Math.abs(b.position.z - this.player.position.z))[0] ?? null;
  }

  canRevive() {
    return Boolean(this.getRevivePlatform());
  }

  revive() {
    const platform = this.getRevivePlatform();
    if (!platform || this.isPlaying) return false;

    this.player.position.set(
      platform.position.x,
      platform.position.y + platform.height / 2 + this.player.radius + 0.05,
      platform.position.z
    );
    this.player.velocity.set(0, 0, 0);
    this.player.autoAdvance = true;
    this.player.holdTile = null;
    this.player.failedHoldTile = null;
    this.player.mesh.position.copy(this.player.position);
    this.currentLaneIndex = platform.laneIndex;
    this.safeLaneIndex = platform.laneIndex;
    this.targetLaneIndex = platform.laneIndex;
    this.manualLaneChoice = false;
    this.runStartZ = platform.position.z;
    this.nextBeatIndex = 1;
    this.nextLaneAfterHold = null;
    this.lastSpawnedLane = platform.laneIndex;
    this.maintainPlatformRunway();
    Input.clear();
    this.audio.syncBeatClockToSong?.();
    this.updateBeatMovement();
    this.isPaused = false;
    this.isPlaying = true;
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

    const requiredFurthestZ = this.player.position.z - this.platformSpacing * this.platformsAhead;
    let nextTileZ = this.runStartZ - this.nextBeatIndex * this.platformSpacing;
    while (nextTileZ > requiredFurthestZ) {
      const beatsUsed = this.spawnPlatformRow(nextTileZ, this.nextBeatIndex);
      this.nextBeatIndex += beatsUsed;
      nextTileZ = this.runStartZ - this.nextBeatIndex * this.platformSpacing;
    }
  }

  gameOver() {
    this.isPlaying = false;
    this.audio.pauseForGame?.();
    this.audio.playGameOver();
    if (!this.isTestRun) this.scoreManager.saveBestScore(this.score);

    window.dispatchEvent(new CustomEvent('game-over', {
      detail: { score: this.score }
    }));
  }
}
