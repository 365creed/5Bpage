/**
 * 5Bpage Sound Controller & Procedural Audio Engine
 * - Zero Copyright: Synthesizes procedural ambient BGM via Web Audio API
 * - Mechanical Tile FX & Slide Frequency Shifter
 * - Unlocks automatically on the very first touch/click
 */
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.isUnlocked = false;
    this.isBgmActive = false;
    this.bgmTimer = null;
    this.bgmStep = 0;

    // 5B Pentatonic Harmony Table (Hz): F3, G3, A3, C4, D4, E4, G4, A4
    this.scale = [174.61, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

    this.dockEl = document.getElementById('audio-dock');
    this.toggleBtn = document.getElementById('btn-sound-toggle');
    this.statusLabel = document.getElementById('audio-status-label');

    this.init();
  }

  init() {
    this.toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleBgm();
    });

    // Auto-unlock Web Audio on first gesture
    const unlock = () => {
      this.ensureAudioContext();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    // Listen to custom application events
    window.addEventListener('app:slide-change', (e) => {
      const pitch = e.detail?.pitch || 440;
      this.playSlideSwoosh(pitch);
    });

    window.addEventListener('app:puzzle-move', () => {
      this.playMechanicalClick();
    });

    window.addEventListener('app:puzzle-win', () => {
      this.playWinChime();
    });
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.isUnlocked = true;
  }

  toggleBgm() {
    this.ensureAudioContext();
    this.isBgmActive = !this.isBgmActive;

    if (this.isBgmActive) {
      this.dockEl?.classList.add('playing');
      if (this.statusLabel) this.statusLabel.textContent = 'BGM 재생 중 (Live Synth)';
      this.startProceduralBgm();
    } else {
      this.dockEl?.classList.remove('playing');
      if (this.statusLabel) this.statusLabel.textContent = '음소거 됨';
      this.stopProceduralBgm();
    }
  }

  /**
   * Procedural Ambient Looper (Generative Music, No MP3 Needed)
   */
  startProceduralBgm() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);

    const playAmbientNote = () => {
      if (!this.isBgmActive || !this.audioCtx) return;

      // Select mellow pentatonic note with chord intervals
      const rootNote = this.scale[this.bgmStep % this.scale.length];
      const fifthNote = rootNote * 1.5;

      this.synthesizeTone(rootNote, 'sine', 1.8, 0.04, true);
      if (this.bgmStep % 2 === 0) {
        this.synthesizeTone(fifthNote, 'triangle', 2.2, 0.02, true);
      }

      this.bgmStep++;
    };

    playAmbientNote();
    this.bgmTimer = setInterval(playAmbientNote, 900);
  }

  stopProceduralBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /**
   * Mechanical Tile Snap Sound Effect
   */
  playMechanicalClick() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Sharp mechanical transient
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  /**
   * Slide Transition Swoosh Synth
   */
  playSlideSwoosh(freq = 440) {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (_) {}
  }

  /**
   * Tone Synthesizer helper with low-pass filtering
   */
  synthesizeTone(freq, type = 'sine', duration = 1.0, volume = 0.05, filterOn = false) {
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      if (filterOn) {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  }

  playWinChime() {
    this.ensureAudioContext();
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((note, i) => {
      setTimeout(() => {
        this.synthesizeTone(note, 'sine', 0.8, 0.15);
      }, i * 140);
    });
  }
}

window.soundCtrl = new SoundController();
