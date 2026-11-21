import { Engine } from './core/Engine.js';
import { Input } from './core/Input.js';
import { GameLoop } from './systems/GameLoop.js';
import { AudioManager } from './systems/AudioManager.js';
import { ScoreManager } from './systems/ScoreManager.js';
import { ShopManager } from './systems/ShopManager.js';

class App {
  async init() {
    // Initialize managers and core engine
    ScoreManager.init();
    AudioManager.init();
    Input.init();

    const canvas = document.getElementById('game-canvas');
    this.engine = new Engine(canvas);
    
    this.gameLoop = new GameLoop({
      engine: this.engine,
      audio: AudioManager,
      score: ScoreManager
    });
    ShopManager.init(this.gameLoop.player);
    this.gameLoop.onCreditsEarned = amount => ShopManager.earn(amount);
    this.gameLoop.onRunStart = testRun => ShopManager.activateForRun(this.gameLoop, testRun);

    this.setupUI();
    this.engine.start();
  }

  setupUI() {
    const mainMenu = document.getElementById('main-menu');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const testStartBtn = document.getElementById('test-start-btn');
    const testJumpCount = document.getElementById('test-jump-count');
    const restartBtn = document.getElementById('restart-btn');
    const shopScreen = document.getElementById('shop-screen');
    const shopOpenBtn = document.getElementById('shop-open-btn');
    const shopCloseBtn = document.getElementById('shop-close-btn');
    const musicToggle = document.getElementById('music-toggle');
    const settingsScreen = document.getElementById('settings-screen');
    const settingsOpenBtn = document.getElementById('settings-open-btn');
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    const resetConfirmScreen = document.getElementById('reset-confirm-screen');
    const resetCancelBtn = document.getElementById('reset-cancel-btn');
    const resetConfirmBtn = document.getElementById('reset-confirm-btn');
    const sfxVolume = document.getElementById('sfx-volume');
    const musicVolume = document.getElementById('music-volume');
    const sfxVolumeValue = document.getElementById('sfx-volume-value');
    const musicVolumeValue = document.getElementById('music-volume-value');
    let activePanel = null;

    const openPanel = (panel, name) => {
      activePanel = name;
      this.gameLoop.isPaused = true;
      panel.classList.remove('hidden');
    };
    const closePanel = panel => {
      panel.classList.add('hidden');
      if (activePanel === 'shop' || activePanel === 'settings') activePanel = null;
      this.gameLoop.isPaused = activePanel === 'reset-confirm';
    };

    const setGameButtonsVisible = visible => {
      shopOpenBtn.style.display = visible ? 'block' : 'none';
      settingsOpenBtn.style.display = visible ? 'block' : 'none';
    };
    setGameButtonsVisible(true);

    const savedSfxVolume = Math.round(AudioManager.sfxVolume * 100);
    const savedMusicVolume = Math.round(AudioManager.musicVolume * 100);
    sfxVolume.value = savedSfxVolume;
    musicVolume.value = savedMusicVolume;
    sfxVolumeValue.value = `${savedSfxVolume}%`;
    musicVolumeValue.value = `${savedMusicVolume}%`;

    startBtn.addEventListener('click', () => {
      mainMenu.classList.add('hidden');
      setGameButtonsVisible(false);
      AudioManager.startMusic();
      this.gameLoop.start();
    });

    testStartBtn.addEventListener('click', () => {
      const jumpCount = Number.parseInt(testJumpCount.value, 10);
      if (!Number.isFinite(jumpCount)) {
        testJumpCount.focus();
        return;
      }
      mainMenu.classList.add('hidden');
      setGameButtonsVisible(false);
      AudioManager.startMusic();
      this.gameLoop.startTestAtJumpCount(jumpCount);
    });

    restartBtn.addEventListener('click', () => {
      gameOverScreen.classList.add('hidden');
      setGameButtonsVisible(false);
      this.gameLoop.restart();
    });

    shopOpenBtn.addEventListener('click', () => openPanel(shopScreen, 'shop'));
    shopCloseBtn.addEventListener('click', () => closePanel(shopScreen));
    musicToggle.addEventListener('click', () => AudioManager.toggleMusic());
    settingsOpenBtn.addEventListener('click', () => openPanel(settingsScreen, 'settings'));
    settingsCloseBtn.addEventListener('click', () => closePanel(settingsScreen));
    sfxVolume.addEventListener('input', () => {
      AudioManager.setSfxVolume(sfxVolume.value / 100);
      sfxVolumeValue.value = `${sfxVolume.value}%`;
    });
    musicVolume.addEventListener('input', () => {
      AudioManager.setMusicVolume(musicVolume.value / 100);
      musicVolumeValue.value = `${musicVolume.value}%`;
    });
    resetProgressBtn.addEventListener('click', () => openPanel(resetConfirmScreen, 'reset-confirm'));
    resetCancelBtn.addEventListener('click', () => {
      resetConfirmScreen.classList.add('hidden');
      activePanel = 'settings';
      this.gameLoop.isPaused = true;
    });
    resetConfirmBtn.addEventListener('click', () => {
      ShopManager.resetProgress();
      ScoreManager.resetProgress();
      AudioManager.resetVolumes();
      sfxVolume.value = '100';
      musicVolume.value = '100';
      sfxVolumeValue.value = '100%';
      musicVolumeValue.value = '100%';
      resetConfirmScreen.classList.add('hidden');
      settingsScreen.classList.add('hidden');
      activePanel = null;
      this.gameLoop.isPaused = false;
    });
    AudioManager.updateMusicButton();

    // Listen for game over events
    window.addEventListener('game-over', (e) => {
      const finalScoreEl = document.getElementById('final-score');
      finalScoreEl.textContent = e.detail.score;
      gameOverScreen.classList.remove('hidden');
      this.gameLoop.isPaused = false;
      setGameButtonsVisible(true);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
