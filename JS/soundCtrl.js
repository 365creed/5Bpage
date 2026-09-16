/**
 * Sound Controller Engine
 * - Handles browser Autoplay Policy unlock on first gesture
 * - Web Audio API Synthesizer for UI sound cues (zero external dependency)
 * - HTML5 Audio BGM loop management with fade in/out
 */
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.isUnlocked = false;
    this.isPlaying = false;
    this.bgmAudio = null;
    this.dockEl = document.getElementById('audio-dock');
    this.toggleBtn = document.getElementById('btn-sound-toggle');
    this.statusText = document.querySelector('.audio-status');

    this.init();
  }

  init() {
    // 1. Prepare HTML5 Audio (Optional fallback for actual mp3)
    this.bgmAudio = new Audio();
    // Assets 폴더에 mp3 파일이 있다면 아래 경로 지정 가능
    // this.bgmAudio.src = 'assets/bgm.mp3';
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.5;

    // 2. Event Listeners
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.togglePlayback());
    }

    // Global unlock on first touch or click
    const unlockHandler = () => {
      this.unlockAudioContext();
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };
    window.addEventListener('click', unlockHandler);
    window.addEventListener('keydown', unlockHandler);
    window.addEventListener('touchstart', unlockHandler);

    // Subscribe to Slide/Puzzle custom events
    window.addEventListener('app:slide-change', (e) => {
      const pitch = e.detail?.pitch || 440;
      this.playTone(pitch, 'sine', 0.15, 0.08);
    });

    window.addEventListener('app:puzzle-move', () => {
      this.playTone(320, 'triangle', 0.06, 0.05);
    });

    window.addEventListener('app:puzzle-win', () => {
      this.playWinFanfare();
    });
  }

  unlockAudioContext() {
    if (this.isUnlocked) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.isUnlocked = true;
      if (this.statusText) this.statusText.textContent = 'Active (Web Audio)';
    }
  }

  togglePlayback() {
    this.unlockAudioContext();
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.dockEl?.classList.add('playing');
      if (this.statusText) this.statusText.textContent = 'Audio FX & Sync On';
      // BGM 음원 파일이 있을 경우 재생 시도
      if (this.bgmAudio.src) {
        this.bgmAudio.play().catch(() => {});
      }
      // 토글 확인 차임 사운드 생성
      this.playTone(523.25, 'sine', 0.2, 0.1);
    } else {
      this.dockEl?.classList.remove('playing');
      if (this.statusText) this.statusText.textContent = 'Muted';
      if (this.bgmAudio) this.bgmAudio.pause();
    }
  }

  /**
   * Synthesize real-time audio tone via Web Audio API
   */
  playTone(frequency = 440, type = 'sine', duration = 0.2, volume = 0.1) {
    if (!this.isUnlocked || !this.isPlaying || !this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      // Attack & Release Envelope
      gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, this.audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {
      console.warn('Audio Synthesis Warning:', err);
    }
  }

  playWinFanfare() {
    if (!this.isUnlocked || !this.isPlaying) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.12);
      }, idx * 120);
    });
  }
}

window.soundCtrl = new SoundController();
