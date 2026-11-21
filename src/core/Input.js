export class Input {
  static laneChanges = [];
  static pointerStart = null;

  static init() {
    window.addEventListener('keydown', event => {
      if (event.repeat) return;
      const key = event.code;
      if (key === 'ArrowLeft' || key === 'KeyA') {
        event.preventDefault();
        this.laneChanges.push(-1);
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        event.preventDefault();
        this.laneChanges.push(1);
      }
    });

    window.addEventListener('pointerdown', event => {
      const canvas = document.getElementById('game-canvas');
      if (event.pointerType !== 'touch' || event.target !== canvas) return;
      this.pointerStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture is optional; pointerup is also listened for on window.
      }
    });

    window.addEventListener('pointerup', event => this.finishTap(event));
    window.addEventListener('pointercancel', event => this.cancelTap(event));
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    });
  }

  static finishTap(event) {
    if (!this.pointerStart || event.pointerId !== this.pointerStart.pointerId) return;
    const start = this.pointerStart;
    this.pointerStart = null;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 22) return;
    this.laneChanges.push(start.x < window.innerWidth / 2 ? -1 : 1);
  }

  static cancelTap(event) {
    if (!this.pointerStart || event.pointerId === this.pointerStart.pointerId) this.pointerStart = null;
  }

  static consumeLaneChange() {
    return this.laneChanges.shift() || 0;
  }

  static clear() {
    this.pointerStart = null;
    this.laneChanges = [];
  }
}
