export class Input {
  static keys = {};
  static listeners = {};
  static pointerStart = null;
  static touchMovement = { x: 0, z: 0 };
  static autoForward = false;

  static init() {
    const hasTouchScreen = navigator.maxTouchPoints > 0;
    this.autoForward = hasTouchScreen;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        this.autoForward = false;
      }
      if (this.listeners['keydown']) {
        this.listeners['keydown'].forEach(callback => callback(e.code));
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch support for mobile/tablets
    window.addEventListener('pointerdown', (e) => {
      if (this.listeners['pointerdown']) {
        this.listeners['pointerdown'].forEach(callback => callback(e));
      }

      const canvas = document.getElementById('game-canvas');
      if (e.pointerType !== 'touch' || e.target !== canvas) return;
      this.pointerStart = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      this.touchMovement = { x: 0, z: 0 };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (error) {
        // Pointer capture is optional; pointerup is also listened for on window.
      }
    });

    window.addEventListener('pointermove', e => this.updateTouchMovement(e));
    window.addEventListener('pointerup', e => this.endTouch(e));
    window.addEventListener('pointercancel', e => this.endTouch(e));
    const clearInput = () => {
      this.keys = {};
      this.endTouch();
    };
    window.addEventListener('blur', clearInput);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInput();
    });
  }

  static updateTouchMovement(event) {
    if (!this.pointerStart || event.pointerId !== this.pointerStart.pointerId) return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    const distance = Math.hypot(dx, dy);
    const deadZone = 8;
    if (distance <= deadZone) {
      this.touchMovement = { x: 0, z: 0 };
      return;
    }

    const strength = Math.min(1, (distance - deadZone) / 52);
    this.touchMovement = {
      x: (dx / distance) * strength,
      z: (-dy / distance) * strength
    };
  }

  static endTouch(event) {
    if (event && this.pointerStart && event.pointerId !== this.pointerStart.pointerId) return;
    this.pointerStart = null;
    this.touchMovement = { x: 0, z: 0 };
  }

  static getTouchMovement() {
    return this.touchMovement;
  }

  static isPressed(keyCode) {
    return !!this.keys[keyCode];
  }

  static on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  static off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
}
