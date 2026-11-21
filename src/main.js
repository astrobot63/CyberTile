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

    this.setupUI();
    this.engine.start();
  }

  setupUI() {
    const mainMenu = document.getElementById('main-menu');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const shopScreen = document.getElementById('shop-screen');
    const shopOpenBtn = document.getElementById('shop-open-btn');
    const shopCloseBtn = document.getElementById('shop-close-btn');

    startBtn.addEventListener('click', () => {
      mainMenu.classList.add('hidden');
      AudioManager.startMusic();
      this.gameLoop.start();
    });

    restartBtn.addEventListener('click', () => {
      gameOverScreen.classList.add('hidden');
      this.gameLoop.restart();
    });

    shopOpenBtn.addEventListener('click', () => shopScreen.classList.remove('hidden'));
    shopCloseBtn.addEventListener('click', () => shopScreen.classList.add('hidden'));

    // Listen for game over events
    window.addEventListener('game-over', (e) => {
      const finalScoreEl = document.getElementById('final-score');
      finalScoreEl.textContent = e.detail.score;
      gameOverScreen.classList.remove('hidden');
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
