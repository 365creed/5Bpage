/**
 * 4B Brain: Solvable 8-Tile Puzzle Engine
 * - 100% Guaranteed Solvability (Simulated legal random moves from Goal State)
 * - Undo Stack, Timer, Move Tracker, LocalStorage Best Scores
 * - Haptic Vibration (navigator.vibrate) & Mechanical Audio
 */
class SlidingPuzzle {
  constructor(boardId) {
    this.board = document.getElementById(boardId);
    if (!this.board) return;

    this.size = 3;
    this.total = 9;
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    this.history = [];
    this.moves = 0;
    this.seconds = 0;
    this.timer = null;
    this.isPlaying = false;

    this.movesEl = document.getElementById('puzzle-moves');
    this.timerEl = document.getElementById('puzzle-timer');
    this.msgEl = document.getElementById('puzzle-message');
    this.startBtn = document.getElementById('btn-puzzle-start');
    this.undoBtn = document.getElementById('btn-puzzle-undo');
    this.overlay = document.getElementById('puzzle-overlay');
    this.bestMovesEl = document.getElementById('best-record-moves');
    this.bestTimeEl = document.getElementById('best-record-time');

    this.init();
  }

  init() {
    this.loadBestRecord();

    this.board.addEventListener('click', (e) => {
      if (!this.isPlaying) return;
      const tileEl = e.target.closest('.puzzle-tile');
      if (!tileEl || tileEl.classList.contains('empty')) return;
      const clickedIdx = parseInt(tileEl.getAttribute('data-idx'), 10);
      this.handleTileClick(clickedIdx);
    });

    this.startBtn?.addEventListener('click', () => this.startNewGame());
    this.undoBtn?.addEventListener('click', () => this.undo());

    this.render();
  }

  loadBestRecord() {
    const saved = localStorage.getItem('5b_puzzle_best');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (this.bestMovesEl) this.bestMovesEl.textContent = data.moves;
        if (this.bestTimeEl) this.bestTimeEl.textContent = this.formatTime(data.seconds);
      } catch (_) {}
    }
  }

  saveBestRecord(moves, seconds) {
    const saved = localStorage.getItem('5b_puzzle_best');
    let isBetter = false;
    if (!saved) {
      isBetter = true;
    } else {
      const data = JSON.parse(saved);
      if (moves < data.moves || (moves === data.moves && seconds < data.seconds)) {
        isBetter = true;
      }
    }

    if (isBetter) {
      localStorage.setItem('5b_puzzle_best', JSON.stringify({ moves, seconds }));
      this.loadBestRecord();
    }
  }

  startNewGame() {
    this.moves = 0;
    this.seconds = 0;
    this.history = [];
    this.isPlaying = true;
    if (this.msgEl) this.msgEl.textContent = '';
    this.overlay?.classList.add('hidden');
    this.startBtn.textContent = '🔄 새로 섞기';
    if (this.undoBtn) this.undoBtn.disabled = true;
    this.updateStats();

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.seconds++;
      this.updateStats();
    }, 1000);

    // Goal state
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

    // Mathematical guarantee: 120 valid random swaps from Goal State
    let lastSwapped = -1;
    for (let step = 0; step < 120; step++) {
      const emptyIdx = this.tiles.indexOf(0);
      const validNeighbors = this.getNeighbors(emptyIdx).filter(idx => idx !== lastSwapped);
      const chosenNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

      [this.tiles[emptyIdx], this.tiles[chosenNeighbor]] = [this.tiles[chosenNeighbor], this.tiles[emptyIdx]];
      lastSwapped = emptyIdx;
    }

    this.render();
  }

  getNeighbors(idx) {
    const row = Math.floor(idx / this.size);
    const col = idx % this.size;
    const neighbors = [];

    if (row > 0) neighbors.push(idx - this.size);
    if (row < this.size - 1) neighbors.push(idx + this.size);
    if (col > 0) neighbors.push(idx - 1);
    if (col < this.size - 1) neighbors.push(idx + 1);

    return neighbors;
  }

  render() {
    this.board.innerHTML = '';
    const emptyIdx = this.tiles.indexOf(0);
    const movableIndices = this.isPlaying ? this.getNeighbors(emptyIdx) : [];

    this.tiles.forEach((value, idx) => {
      const tile = document.createElement('div');
      tile.classList.add('puzzle-tile');
      tile.setAttribute('data-idx', idx);

      if (value === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = value;
        if (movableIndices.includes(idx)) {
          tile.classList.add('movable');
        }
      }
      this.board.appendChild(tile);
    });
  }

  handleTileClick(clickedIdx) {
    const emptyIdx = this.tiles.indexOf(0);
    const neighbors = this.getNeighbors(emptyIdx);

    if (neighbors.includes(clickedIdx)) {
      // Save for Undo
      this.history.push([...this.tiles]);
      if (this.undoBtn) this.undoBtn.disabled = false;

      [this.tiles[clickedIdx], this.tiles[emptyIdx]] = [this.tiles[emptyIdx], this.tiles[clickedIdx]];
      this.moves++;
      this.updateStats();

      // Audio & Vibration Haptic Feedback
      window.dispatchEvent(new CustomEvent('app:puzzle-move'));
      if (navigator.vibrate) navigator.vibrate(22);

      this.render();

      if (this.checkWin()) {
        this.handleWin();
      }
    }
  }

  undo() {
    if (!this.isPlaying || this.history.length === 0) return;
    this.tiles = this.history.pop();
    this.moves = Math.max(0, this.moves - 1);
    if (this.history.length === 0 && this.undoBtn) this.undoBtn.disabled = true;
    this.updateStats();

    window.dispatchEvent(new CustomEvent('app:puzzle-move'));
    this.render();
  }

  checkWin() {
    for (let i = 0; i < this.total - 1; i++) {
      if (this.tiles[i] !== i + 1) return false;
    }
    return this.tiles[this.total - 1] === 0;
  }

  handleWin() {
    this.isPlaying = false;
    clearInterval(this.timer);
    this.saveBestRecord(this.moves, this.seconds);

    if (this.msgEl) {
      this.msgEl.textContent = `🎉 4B Brain 완료! [${this.moves}회 이동 • ${this.formatTime(this.seconds)}]`;
    }
    this.startBtn.textContent = '🎮 다시 도전';
    if (this.undoBtn) this.undoBtn.disabled = true;

    this.overlay?.classList.remove('hidden');
    if (this.overlay) {
      this.overlay.innerHTML = `<p>🎉 4B Brain 완료!<br/><strong>${this.moves}회 이동 / ${this.formatTime(this.seconds)}</strong></p>`;
    }

    if (navigator.vibrate) navigator.vibrate([80, 40, 100]);
    window.dispatchEvent(new CustomEvent('app:puzzle-win'));

    // Sync to Session
    window.dispatchEvent(new CustomEvent('5b:session-update', {
      detail: { brainSolved: true, moves: this.moves, seconds: this.seconds }
    }));

    this.render();
  }

  updateStats() {
    if (this.movesEl) this.movesEl.textContent = this.moves;
    if (this.timerEl) this.timerEl.textContent = this.formatTime(this.seconds);
  }

  formatTime(s) {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}

window.SlidingPuzzle = SlidingPuzzle;
