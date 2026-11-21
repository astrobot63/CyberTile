export class ScoreManager {
  static score = 0;
  static bestScore = 0;

  static init() {
    const saved = Number(localStorage.getItem('dtts_best_score'));
    this.bestScore = Number.isFinite(saved) && saved >= 0 ? Math.floor(saved) : 0;
    this.updateDisplay();
  }

  static updateScore(newScore, updateBest = true) {
    this.score = newScore;
    if (updateBest && this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('dtts_best_score', this.bestScore);
    }
    this.updateDisplay();
  }

  static saveBestScore(finalScore) {
    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      localStorage.setItem('dtts_best_score', this.bestScore);
    }
    this.updateDisplay();
  }

  static resetProgress() {
    this.score = 0;
    this.bestScore = 0;
    localStorage.removeItem('dtts_best_score');
    this.updateDisplay();
  }

  static updateDisplay() {
    const scoreEl = document.getElementById('score-val');
    const bestEl = document.getElementById('best-val');
    if (scoreEl) scoreEl.textContent = this.score;
    if (bestEl) bestEl.textContent = this.bestScore;
  }
}
