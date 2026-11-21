import { Howl } from 'howler';

export class AudioManager {
  static jumpSound = null;
  static gameOverSound = null;
  static bgMusic = null;
  static isMuted = false;
  static audioContext = null;
  static musicEnabled = true;
  static musicVoices = [];
  static musicNodes = [];
  static musicBus = null;
  static musicTimer = null;
  static melodyTimer = null;
  static chordIndex = 0;
  static sfxVolume = 1;
  static musicVolume = 1;

  static getAudioContext() {
    if (!this.audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return null;
      this.audioContext = new Context();
    }
    return this.audioContext;
  }

  static init() {
    // Synthesize or set up lightweight audio effects using Web Audio API or fallback synth sounds
    // To keep things robust without external asset dependencies, we use clean oscillator tones or placeholders.
    this.sfxVolume = this.loadVolume('cybertile_sfx_volume');
    this.musicVolume = this.loadVolume('cybertile_music_volume');
  }

  static loadVolume(key) {
    const saved = Number(localStorage.getItem(key));
    return localStorage.getItem(key) === null ? 1 : Math.max(0, Math.min(1, saved));
  }

  static setSfxVolume(value) {
    this.sfxVolume = Math.max(0, Math.min(1, Number(value)));
    localStorage.setItem('cybertile_sfx_volume', String(this.sfxVolume));
  }

  static setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, Number(value)));
    localStorage.setItem('cybertile_music_volume', String(this.musicVolume));
    if (this.musicBus && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.musicBus.master.gain.setTargetAtTime(this.musicVolume * 0.34, now, 0.08);
    }
  }

  static resetVolumes() {
    localStorage.removeItem('cybertile_sfx_volume');
    localStorage.removeItem('cybertile_music_volume');
    this.sfxVolume = 1;
    this.musicVolume = 1;
    if (this.musicBus && this.audioContext) {
      this.musicBus.master.gain.setTargetAtTime(0.34, this.audioContext.currentTime, 0.08);
    }
  }

  static playJump() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext not allowed before user interaction
    }
  }

  static playSkip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(760, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1180, ctx.currentTime + 0.13);
      gain.gain.setValueAtTime(0.24 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      // AudioContext may not be available before user interaction.
    }
  }

  static playGameOver() {
    if (this.isMuted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  static startMusic() {
    if (!this.musicEnabled || this.musicVoices.length) return;

    const context = this.getAudioContext();
    if (!context) return;
    context.resume();

    const master = context.createGain();
    const lowPass = context.createBiquadFilter();
    const reverb = context.createConvolver();
    const dry = context.createGain();
    const wet = context.createGain();
    const delay = context.createDelay(2);
    const feedback = context.createGain();
    const delayWet = context.createGain();
    master.gain.setValueAtTime(0, context.currentTime);
    master.gain.linearRampToValueAtTime(this.musicVolume * 0.34, context.currentTime + 7);
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 720;
    lowPass.Q.value = 0.5;
    const impulseLength = Math.floor(context.sampleRate * 4.5);
    const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const samples = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        const fade = 1 - i / impulseLength;
        samples[i] = (Math.random() * 2 - 1) * fade * fade * fade;
      }
    }
    reverb.buffer = impulse;
    dry.gain.value = 0.8;
    wet.gain.value = 0.34;
    delay.delayTime.value = 0.72;
    feedback.gain.value = 0.2;
    delayWet.gain.value = 0.12;

    lowPass.connect(dry);
    dry.connect(master);
    lowPass.connect(reverb);
    reverb.connect(wet);
    wet.connect(master);
    lowPass.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayWet);
    delayWet.connect(master);
    master.connect(context.destination);
    this.musicBus = { master, lowPass, reverb, dry, wet, delay, feedback, delayWet };

    const frequencies = [
      [65.41, 130.81, 196.0, 261.63, 329.63, 392.0], // Cmaj9
      [55.0, 110.0, 164.81, 220.0, 261.63, 329.63], // Am9
      [43.65, 87.31, 130.81, 174.61, 220.0, 261.63], // Fmaj9
      [49.0, 98.0, 146.83, 196.0, 220.0, 293.66] // G6sus2
    ];

    this.musicVoices = frequencies[0].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();
      oscillator.type = index === 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index % 2 === 0 ? -3 : 3;
      voiceGain.gain.setValueAtTime(0, context.currentTime);
      voiceGain.gain.linearRampToValueAtTime(index < 2 ? 0.11 : 0.055, context.currentTime + 7);
      oscillator.connect(voiceGain);
      voiceGain.connect(lowPass);
      oscillator.start();
      this.musicNodes.push(oscillator);
      return { oscillator, voiceGain };
    });

    this.chordIndex = 0;
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled || !this.audioContext) return;
      this.chordIndex = (this.chordIndex + 1) % frequencies.length;
      const now = context.currentTime;
      frequencies[this.chordIndex].forEach((frequency, index) => {
        this.musicVoices[index].oscillator.frequency.setTargetAtTime(frequency, now, 2.8);
      });
    }, 14000);

    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 659.25, 523.25, 440.0, 587.33, 659.25, 523.25];
    let melodyIndex = 0;
    const playMelodyNote = () => {
      if (!this.musicEnabled || !this.musicBus) return;
      const now = context.currentTime;
      const note = melody[melodyIndex % melody.length];
      melodyIndex += 1;
      const pan = context.createStereoPanner();
      pan.pan.value = Math.sin(melodyIndex * 1.7) * 0.55;
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(0.045, now + 0.8);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);
      const bell = context.createOscillator();
      const shimmer = context.createOscillator();
      bell.type = 'sine';
      shimmer.type = 'sine';
      bell.frequency.setValueAtTime(note, now);
      shimmer.frequency.setValueAtTime(note * 2.003, now);
      const shimmerGain = context.createGain();
      shimmerGain.gain.value = 0.12;
      bell.connect(envelope);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(envelope);
      envelope.connect(pan);
      pan.connect(lowPass);
      bell.start(now);
      shimmer.start(now);
      bell.stop(now + 6.7);
      shimmer.stop(now + 6.7);
      this.musicNodes.push(bell, shimmer);
      const removeEndedNode = event => {
        this.musicNodes = this.musicNodes.filter(node => node !== event.target);
      };
      bell.addEventListener('ended', removeEndedNode, { once: true });
      shimmer.addEventListener('ended', removeEndedNode, { once: true });
      this.melodyTimer = window.setTimeout(playMelodyNote, 5200 + Math.random() * 1200);
    };
    this.melodyTimer = window.setTimeout(playMelodyNote, 1600);

    this.updateMusicButton();
  }

  static stopMusic() {
    const context = this.audioContext;
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.melodyTimer) {
      window.clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (context && this.musicBus) {
      const now = context.currentTime;
      this.musicBus.master.gain.setTargetAtTime(0, now, 0.8);
      for (const oscillator of this.musicNodes) {
        try {
          oscillator.stop(now + 4);
        } catch (error) {
          // The note may already have been scheduled to stop.
        }
      }
    }
    this.musicVoices = [];
    this.musicNodes = [];
    this.musicBus = null;
    this.updateMusicButton();
  }

  static toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) this.startMusic();
    else this.stopMusic();
    this.updateMusicButton();
  }

  static updateMusicButton() {
    const button = document.getElementById('music-toggle');
    if (!button) return;
    button.textContent = this.musicEnabled ? '♫ MUSIC ON' : '♫ MUSIC OFF';
    button.setAttribute('aria-pressed', String(this.musicEnabled));
  }
}
