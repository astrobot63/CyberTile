export class Input {
  static keys = {};
  static listeners = {};

  static init() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
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
    });
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