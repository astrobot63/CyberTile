import { Engine } from './core/Engine.js';
import { Input } from './core/Input.js';
import { GameLoop } from './systems/GameLoop.js';
import { AudioManager } from './systems/AudioManager.js';
import { ScoreManager } from './systems/ScoreManager.js';
import { ShopManager } from './systems/ShopManager.js';

const MUSIC_TRACKS = [
  ['Daft Punk', 'Harder, Better, Faster, Stronger', 'gAjR4_CbPpQ', 123],
  ['The Weeknd', 'Blinding Lights', '4NRXx6U8ABQ', 86, 33.5],
  ['Marshmello', 'Alone', 'ALZHF5UqnU4', 142],
  ['Imagine Dragons', 'Believer', '7wtfhZwyrcc', 125, 0, [{ atBeat: 34, duration: 1.92 }]],
  ['Dua Lipa', 'Levitating', 'N000qglmmY0', 103, 0],
  ['Alan Walker', 'Faded', '60ItHLz5WEA', 90, 0.5],
  ['Avicii', 'Wake Me Up', 'IcrbM1l_BoI', 124],
  ['Swedish House Mafia', "Don't You Worry Child", '1y6smkh6c-0', 129],
  ['Daft Punk', 'One More Time', 'FGBhQbmPwH8', 123],
  ['Daft Punk', 'Get Lucky', '5NV6Rdv1a3I', 116, 0],
  ['David Guetta ft. Sia', 'Titanium', 'JRfuAukYTKg', 126],
  ['Zedd ft. Foxes', 'Clarity', 'IxxstCcJlsc', 128],
  ['Lady Gaga', 'Bad Romance', 'qrO4YZeyl0I', 119, 0],
  ['Linkin Park', 'Numb', 'kXYiU_JCYtU', 110, 3.9],
  ['Billie Eilish', 'bad guy', 'DyDfgMOUjCI', 135],
  ['Coldplay', 'Adventure of a Lifetime', 'QtXby3twMmI', 112, 30.2],
  ['Ed Sheeran', 'Shape of You', 'JGwWNGJdvx8', 96, 6],
  ['Mark Ronson ft. Bruno Mars', 'Uptown Funk', 'OPf0YbXqDm0', 115, 0],
  ['Luis Fonsi ft. Daddy Yankee', 'Despacito', 'kJQP7kiw5Fk', 89, 10.9],
  ['Shakira', 'Waka Waka', 'pRpeEdMmmQ0', 127],
  ['Michael Jackson', 'Billie Jean', 'Zi_XLOBDo_Y', 117, 0],
  ['Queen', 'Another One Bites the Dust', 'rY0WxgSXdEE', 110],
  ['M83', 'Midnight City', 'dX3k_QDnzHE', 105],
  ['Darude', 'Sandstorm', 'y6120QOlsfU', 136],
  ['Skrillex', 'Bangarang', 'YJVmu6yttiw', 110],
  ['Fatboy Slim', 'Right Here, Right Now', 'ub747pprmJ8', 123],
  ['The Chainsmokers ft. Halsey', 'Closer', 'PT2_F-1esPk', 95, 0],
  ['Martin Garrix', 'Animals', 'gCYcHz2k5x0', 128],
  ['Calvin Harris', 'Summer', 'EB9D7kR0wFQ', 128],
  ['ODESZA', 'A Moment Apart', 'xarC5jAiO7w', 100]
].map(([artist, title, videoId, bpm, startAt = 0, holdSections = []]) => ({ artist, title, videoId, bpm, startAt, holdSections }));

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
    this.gameLoop.onRunStart = testRun => ShopManager.activateForRun(testRun);

    this.setupUI();
    this.engine.start();
  }

  setupUI() {
    const mainMenu = document.getElementById('main-menu');
    const gameOverScreen = document.getElementById('game-over-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const resumeBtn = document.getElementById('resume-btn');
    const startBtn = document.getElementById('start-btn');
    const testStartBtn = document.getElementById('test-start-btn');
    const testJumpCount = document.getElementById('test-jump-count');
    const restartBtn = document.getElementById('restart-btn');
    const reviveBtn = document.getElementById('revive-btn');
    const reviveCountdownScreen = document.getElementById('revive-countdown-screen');
    const reviveCountdownValue = document.getElementById('revive-countdown-value');
    const changeSongBtn = document.getElementById('change-song-btn');
    const shopScreen = document.getElementById('shop-screen');
    const shopOpenBtn = document.getElementById('shop-open-btn');
    const shopCloseBtn = document.getElementById('shop-close-btn');
    const shopBalance = document.getElementById('shop-balance');
    const musicToggle = document.getElementById('music-toggle');
    const musicScreen = document.getElementById('music-screen');
    const songsOpenBtn = document.getElementById('songs-open-btn');
    const musicCloseBtn = document.getElementById('music-close-btn');
    const songList = document.getElementById('song-list');
    const musicStatus = document.getElementById('music-status');
    const musicPlayerFrame = document.getElementById('music-player-frame');
    const noMusicBtn = document.getElementById('no-music-btn');
    const selectedSongStatus = document.getElementById('selected-song-status');
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
      AudioManager.pauseForGame();
      panel.classList.remove('hidden');
    };
    const closePanel = panel => {
      panel.classList.add('hidden');
      if (activePanel === 'shop' || activePanel === 'settings' || activePanel === 'music') activePanel = null;
      this.gameLoop.isPaused = activePanel === 'reset-confirm';
      if (this.gameLoop.isPlaying && !this.gameLoop.isPaused && panel !== musicScreen) {
        AudioManager.resumeForGame();
      }
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
      AudioManager.startMusic(true);
      this.gameLoop.start();
    });

    testStartBtn.addEventListener('click', () => {
      const jumpCount = Number.parseInt(testJumpCount.value, 10);
      if (!Number.isFinite(jumpCount)) {
        testJumpCount.focus();
        return;
      }
      mainMenu.classList.add('hidden');
      pauseScreen.classList.add('hidden');
      setGameButtonsVisible(false);
      AudioManager.startMusic(true);
      this.gameLoop.startTestAtJumpCount(jumpCount);
    });

    restartBtn.addEventListener('click', () => {
      gameOverScreen.classList.add('hidden');
      pauseScreen.classList.add('hidden');
      setGameButtonsVisible(false);
      AudioManager.startMusic(true);
      this.gameLoop.restart();
    });
    const reviveCost = 50;
    let reviveTimer = null;
    reviveBtn.textContent = `REVIVE · ${reviveCost} COINS`;
    reviveBtn.addEventListener('click', () => {
      if (ShopManager.credits < reviveCost) {
        ShopManager.showNotice(`Not enough coins. ${reviveCost} needed; you have ${ShopManager.credits}.`, 'error');
        return;
      }
      if (!this.gameLoop.canRevive()) {
        ShopManager.showNotice('No safe tile nearby to revive onto.', 'error');
        return;
      }
      if (!ShopManager.spendCredits(reviveCost)) return;

      this.gameLoop.isPaused = true;
      let secondsLeft = 3;
      reviveCountdownValue.textContent = String(secondsLeft);
      reviveCountdownScreen.classList.remove('hidden');
      reviveTimer = window.setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft > 0) {
          reviveCountdownValue.textContent = String(secondsLeft);
          return;
        }
        window.clearInterval(reviveTimer);
        reviveTimer = null;
        reviveCountdownScreen.classList.add('hidden');
        if (!this.gameLoop.revive()) {
          ShopManager.earn(reviveCost);
          gameOverScreen.classList.remove('hidden');
          return;
        }
        gameOverScreen.classList.add('hidden');
        setGameButtonsVisible(false);
        AudioManager.resumeForGame();
      }, 1000);
    });
    changeSongBtn.addEventListener('click', () => openPanel(musicScreen, 'music'));

    shopOpenBtn.addEventListener('click', () => {
      openPanel(shopScreen, 'shop');
      shopCloseBtn.style.display = 'block';
      shopBalance.style.display = 'block';
    });
    shopCloseBtn.addEventListener('click', () => {
      closePanel(shopScreen);
      shopCloseBtn.style.display = 'none';
      shopBalance.style.display = 'none';
    });
    musicToggle.addEventListener('click', () => AudioManager.toggleMusic());
    let youtubePlayer = null;
    let pendingTrack = null;
    const selectTrack = track => {
      AudioManager.setSelectedTrack(track);
      if (!track) {
        pendingTrack = null;
        musicStatus.textContent = 'No song selected. You can play without music.';
        selectedSongStatus.textContent = 'NO SONG PICKED · THE GAME WILL BE SILENT';
        startBtn.textContent = 'PLAY WITHOUT MUSIC';
        AudioManager.updateMusicButton();
        return;
      }
      for (const button of songList.querySelectorAll('.song-choice')) {
        button.classList.toggle('selected', Number(button.dataset.trackIndex) === MUSIC_TRACKS.indexOf(track));
      }
      musicStatus.textContent = `SELECTED · ${track.artist} — ${track.title}. Music starts when the game begins.`;
      selectedSongStatus.textContent = `SELECTED SONG · ${track.artist} — ${track.title}`;
      startBtn.textContent = 'PLAY GAME';
      if (!window.YT?.Player) {
        pendingTrack = track;
        musicStatus.textContent = `Loading player for ${track.title}…`;
        return;
      }
      if (!youtubePlayer) {
        musicPlayerFrame.innerHTML = '<div id="youtube-music-player"></div>';
        youtubePlayer = new window.YT.Player('youtube-music-player', {
          width: '640', height: '360', videoId: track.videoId,
          playerVars: { autoplay: 0, controls: 1, playsinline: 1, rel: 0, start: Math.floor(track.startAt) },
          events: {
            onReady: event => {
              const readyTrack = pendingTrack ?? track;
              pendingTrack = null;
              event.target.cueVideoById({ videoId: readyTrack.videoId, startSeconds: readyTrack.startAt });
              AudioManager.setOnlineMusicPlayer(event.target);
            },
            onError: () => {
              musicStatus.textContent = 'This video cannot play in an embedded player. Please choose another song.';
            }
          }
        });
        return;
      }
      pendingTrack = null;
      const video = { videoId: track.videoId, startSeconds: track.startAt };
      youtubePlayer.cueVideoById(video);
    };
    const difficultyGroups = [
      { title: 'EASY', tracks: track => track.bpm < 100 },
      { title: 'MEDIUM', tracks: track => track.bpm >= 100 && track.bpm < 120 },
      { title: 'HARD', tracks: track => track.bpm >= 120 && track.bpm < 130 },
      { title: 'IMPOSSIBLE', tracks: track => track.bpm >= 130 }
    ];
    difficultyGroups.forEach(group => {
      const tracks = MUSIC_TRACKS.filter(group.tracks);
      const section = document.createElement('section');
      section.className = 'song-group';
      const heading = document.createElement('h2');
      heading.textContent = group.title;
      const grid = document.createElement('div');
      grid.className = 'song-group-grid';
      tracks.forEach(track => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'song-choice';
        button.dataset.trackIndex = String(MUSIC_TRACKS.indexOf(track));
        button.innerHTML = `<span>${track.artist} — ${track.title}</span><span>${track.bpm} BPM · SELECT</span>`;
        button.addEventListener('click', () => {
          selectTrack(track);
          closePanel(musicScreen);
        });
        grid.append(button);
      });
      section.append(heading, grid);
      songList.append(section);
    });
    noMusicBtn.addEventListener('click', () => {
      selectTrack(null);
      closePanel(musicScreen);
    });
    window.addEventListener('youtube-api-ready', () => {
      if (pendingTrack) selectTrack(pendingTrack);
    });
    songsOpenBtn.addEventListener('click', () => openPanel(musicScreen, 'music'));
    musicCloseBtn.addEventListener('click', () => closePanel(musicScreen));
    settingsOpenBtn.addEventListener('click', () => openPanel(settingsScreen, 'settings'));
    settingsCloseBtn.addEventListener('click', () => closePanel(settingsScreen));
    const resumeGame = () => {
      this.gameLoop.isPaused = false;
      pauseScreen.classList.add('hidden');
      AudioManager.resumeForGame();
    };
    resumeBtn.addEventListener('click', resumeGame);
    window.addEventListener('keydown', event => {
      if (event.code !== 'Escape' || event.repeat) return;
      if (!resetConfirmScreen.classList.contains('hidden')) {
        resetCancelBtn.click();
        return;
      }
      if (!shopScreen.classList.contains('hidden')) {
        shopCloseBtn.click();
        return;
      }
      if (!settingsScreen.classList.contains('hidden')) {
        settingsCloseBtn.click();
        return;
      }
      if (!musicScreen.classList.contains('hidden')) {
        musicCloseBtn.click();
        return;
      }
      if (!this.gameLoop.isPlaying) return;
      event.preventDefault();
      if (this.gameLoop.isPaused) resumeGame();
      else {
        this.gameLoop.isPaused = true;
        AudioManager.pauseForGame();
        pauseScreen.classList.remove('hidden');
      }
    });
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
      pauseScreen.classList.add('hidden');
      this.gameLoop.isPaused = false;
      setGameButtonsVisible(true);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
