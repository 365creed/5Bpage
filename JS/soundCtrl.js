/**
 * 1B Beat: Procedural Web Audio Synthesis Engine
 * - Zero External MP3 (No copyright/404 issues)
 * - Real-time Chords + Kick/Percussion Synthesizer
 * - Live Equalizer Animation Controller
 * - Tactile Mechanical Tile Click Audio
 */
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.isUnlocked = false;
    this.isBgmActive = false;
    this.bgmTimer = null;
    this.step = 0;

    this.dock = document.getElementById('audio-dock');
    this.statusText = document.getElementById('audio-status-text');
    this.bgmStreamBtn = document.getElementById('btn-bgm-stream');
    this.eqDisplay = document.getElementById('eq-display');

    // Chords: Am -> F -> C -> G (Lo-Fi Ambient Progression)
    this.chords = [
      [220.00, 261.63, 329.63], // A3, C4, E4
      [174.61, 220.00, 261.63], // F3, A3, C4
      [130.81, 164.81, 196.00], // C3, E3, G3
      [196.00, 246.94, 293.66]  // G3, B3, D4
    ];

    this.init();
  }

  init() {
    // Single delegated toggle for Audio Dock
    this.dock?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleBgm();
    });

    this.bgmStreamBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleBgm();
    });

    // 1B Beat Pads
    document.querySelectorAll('.pad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.ensureContext();
        const note = parseFloat(btn.getAttribute('data-note'));
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 150);
        this.playTone(note, 'triangle', 0.45, 0.22);
      });
    });

    // Auto-unlock AudioContext on first gesture
    const unlock = () => {
      this.ensureContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // Event Bus Listeners
    window.addEventListener('app:slide-change', (e) => {
      this.playTone(e.detail?.pitch || 440, 'sine', 0.25, 0.12);
    });

    window.addEventListener('app:puzzle-move', () => {
      this.playMechanicalClick();
    });

    window.addEventListener('app:puzzle-win', () => {
      this.playWinFanfare();
    });
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.isUnlocked = true;
    if (this.statusText && !this.isBgmActive) {
      this.statusText.textContent = 'Audio Engine Ready';
    }
  }

  toggleBgm() {
    this.ensureContext();
    this.isBgmActive = !this.isBgmActive;

    if (this.isBgmActive) {
      this.dock?.classList.add('playing');
      this.eqDisplay?.classList.add('active');
      if (this.statusText) this.statusText.textContent = '🎵 BGM 재생 중 (Looping)';
      if (this.bgmStreamBtn) this.bgmStreamBtn.textContent = '비트 시퀀서 정지 (BGM OFF)';
      this.startLoop();
      this.playTone(523.25, 'triangle', 0.2, 0.15); // Power-on sound
    } else {
      this.dock?.classList.remove('playing');
      this.eqDisplay?.classList.remove('active');
      if (this.statusText) this.statusText.textContent = '음소거 (클릭하여 재생)';
      if (this.bgmStreamBtn) this.bgmStreamBtn.textContent = '비트 시퀀서 루프 시작 (BGM ON)';
      this.stopLoop();
    }
  }

  startLoop() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    this.step = 0;

    this.bgmTimer = setInterval(() => {
      if (!this.isBgmActive || !this.audioCtx) return;

      const chordIdx = Math.floor(this.step / 4) % this.chords.length;
      const chord = this.chords[chordIdx];
      const freq = chord[this.step % chord.length];

      // Melodic Arpeggio Tone
      this.playTone(freq, 'sine', 0.45, 0.08);

      // Procedural Bass Kick on Measure Start
      if (this.step % 4 === 0) {
        this.playSyntheticKick();
      }

      this.step++;
    }, 320);
  }

  stopLoop() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /**
   * Synthesize deep 808-style bass kick
   */
  playSyntheticKick() {
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  /**
   * Tactile Mechanical Tile Click Audio
   */
  playMechanicalClick() {
    if (!this.isUnlocked || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.035);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  playWinFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.4, 0.16), idx * 110);
    });
  }

  playTone(freq, type, duration, volume) {
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  }
}

window.soundCtrl = new SoundController();
