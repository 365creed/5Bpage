/**
 * 1B Beat: 100% Procedural Web Audio Engine
 * - Zero External Audio Files (No Copyright / Royalty Free)
 * - Infinite Ambient Beat Sequencer
 * - Tactile Mechanical Plastic Click Generator
 * - Interactive Pitch Synthesis
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

    // Synth Chords (Am -> F -> C -> G)
    this.chords = [
      [220.00, 261.63, 329.63], // A3, C4, E4
      [174.61, 220.00, 261.63], // F3, A3, C4
      [130.81, 164.81, 196.00], // C3, E3, G3
      [196.00, 246.94, 293.66]  // G3, B3, D4
    ];

    this.init();
  }

  init() {
    this.dock?.addEventListener('click', () => this.toggleBgm());
    this.bgmStreamBtn?.addEventListener('click', () => this.toggleBgm());

    // Beat Pad Click Events
    document.querySelectorAll('.pad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.ensureContext();
        const note = parseFloat(btn.getAttribute('data-note'));
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 150);
        this.playTone(note, 'triangle', 0.4, 0.12);
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
      this.playTone(e.detail?.pitch || 440, 'sine', 0.2, 0.05);
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
      if (this.statusText) this.statusText.textContent = 'Procedural BGM On';
      if (this.bgmStreamBtn) this.bgmStreamBtn.textContent = '비트 시퀀서 정지';
      this.startLoop();
      this.playTone(523.25, 'sine', 0.15, 0.08);
    } else {
      this.dock?.classList.remove('playing');
      if (this.statusText) this.statusText.textContent = 'Muted';
      if (this.bgmStreamBtn) this.bgmStreamBtn.textContent = '비트 시퀀서 무한 루프 시작';
      this.stopLoop();
    }
  }

  startLoop() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    this.bgmTimer = setInterval(() => {
      if (!this.isBgmActive || !this.audioCtx) return;

      const chordIdx = Math.floor(this.step / 4) % this.chords.length;
      const chord = this.chords[chordIdx];
      const freq = chord[this.step % chord.length];

      // Play soft arpeggio
      this.playTone(freq, 'sine', 0.4, 0.035);

      // Bass beat on measure start
      if (this.step % 4 === 0) {
        this.playTone(chord[0] / 2, 'triangle', 0.8, 0.05);
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

  playMechanicalClick() {
    if (!this.isUnlocked || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Sharp pitch sweep simulates physical tile click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
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
      setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.1), idx * 110);
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
