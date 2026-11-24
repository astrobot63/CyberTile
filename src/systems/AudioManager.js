export class AudioManager {
  static jumpSound = null;
  static gameOverSound = null;
  static onlineMusicPlayer = null;
  static selectedTrack = null;
  static beatIndex = 0;
  static isMuted = false;
  static audioContext = null;
  static musicEnabled = false;
  static startWhenReady = false;
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
    const stored = localStorage.getItem(key);
    if (stored === null) return 1;
    const saved = Number(stored);
    return Number.isFinite(saved) ? Math.max(0, Math.min(1, saved)) : 1;
  }

  static setSfxVolume(value) {
    this.sfxVolume = Math.max(0, Math.min(1, Number(value)));
    localStorage.setItem('cybertile_sfx_volume', String(this.sfxVolume));
  }

  static setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, Number(value)));
    localStorage.setItem('cybertile_music_volume', String(this.musicVolume));
    if (this.onlineMusicPlayer?.setVolume) this.onlineMusicPlayer.setVolume(Math.round(this.musicVolume * 100));
  }

  static resetVolumes() {
    localStorage.removeItem('cybertile_sfx_volume');
    localStorage.removeItem('cybertile_music_volume');
    this.sfxVolume = 1;
    this.musicVolume = 1;
    if (this.onlineMusicPlayer?.setVolume) this.onlineMusicPlayer.setVolume(100);
  }

  static playJump() {
    if (this.isMuted || this.sfxVolume <= 0) return;
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
      gain.gain.exponentialRampToValueAtTime(0.01 * this.sfxVolume, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext not allowed before user interaction
    }
  }

  static playGameOver() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * this.sfxVolume, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  static setOnlineMusicPlayer(player) {
    this.onlineMusicPlayer = player;
    if (player?.setVolume) player.setVolume(Math.round(this.musicVolume * 100));
    if (this.startWhenReady && this.selectedTrack && this.musicEnabled) {
      this.startWhenReady = false;
      this.startMusic(true);
    } else if (!this.musicEnabled && player?.pauseVideo) {
      player.pauseVideo();
    }
  }

  static setSelectedTrack(track) {
    this.selectedTrack = track;
    this.musicEnabled = Boolean(track);
    this.startWhenReady = false;
    if (!track) this.onlineMusicPlayer?.pauseVideo?.();
    this.updateMusicButton();
  }

  static getBeatDuration() {
    const intervalPattern = this.selectedTrack?.beatIntervals;
    if (Array.isArray(intervalPattern) && intervalPattern.length > 0) {
      return intervalPattern[this.beatIndex % intervalPattern.length];
    }
    const bpm = Number(this.selectedTrack?.bpm);
    return Number.isFinite(bpm) && bpm > 0 ? 60 / bpm : null;
  }

  static getHoldSectionAtBeat(beatIndex) {
    return this.selectedTrack?.holdSections?.find(section => section.atBeat === beatIndex) ?? null;
  }

  static resetBeatClock() {
    this.beatIndex = 0;
  }

  static syncBeatClockToSong() {
    const track = this.selectedTrack;
    const currentTime = this.onlineMusicPlayer?.getCurrentTime?.();
    const beatDuration = this.getBeatDuration();
    if (!track || !Number.isFinite(currentTime) || !beatDuration) return;
    this.beatIndex = Math.max(0, Math.floor((currentTime - track.startAt) / beatDuration));
  }

  static advanceBeat(count = 1) {
    this.beatIndex += Math.max(1, Math.floor(count));
  }

  static startMusic(restartTrack = false) {
    if (this.musicEnabled && this.selectedTrack) {
      if (restartTrack) {
        this.resetBeatClock();
        if (this.onlineMusicPlayer?.loadVideoById) {
          this.onlineMusicPlayer.loadVideoById({
            videoId: this.selectedTrack.videoId,
            startSeconds: this.selectedTrack.startAt
          });
        } else {
          this.startWhenReady = true;
        }
      } else {
        this.onlineMusicPlayer?.playVideo?.();
      }
    }
    this.updateMusicButton();
  }

  static stopMusic() {
    this.onlineMusicPlayer?.pauseVideo?.();
    this.updateMusicButton();
  }

  static pauseForGame() {
    if (this.musicEnabled) this.onlineMusicPlayer?.pauseVideo?.();
  }

  static resumeForGame() {
    if (!this.musicEnabled || !this.onlineMusicPlayer?.playVideo) return;
    const endedState = window.YT?.PlayerState?.ENDED;
    if (endedState !== undefined && this.onlineMusicPlayer.getPlayerState?.() === endedState) return;
    this.onlineMusicPlayer.playVideo();
  }

  static toggleMusic() {
    if (!this.selectedTrack) return;
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) this.startMusic();
    else this.stopMusic();
    this.updateMusicButton();
  }
  static updateMusicButton() {
    const button = document.getElementById('music-toggle');
    if (!button) return;
    button.textContent = !this.selectedTrack ? '♫ NO SONG' : this.musicEnabled ? '♫ MUSIC ON' : '♫ MUSIC OFF';
    button.setAttribute('aria-pressed', String(this.musicEnabled));
    button.disabled = !this.selectedTrack;
  }
}
