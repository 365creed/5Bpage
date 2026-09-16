/**
 * 4B Brain: Solvable 8-Tile Puzzle Engine
 * - Clear Lifecycle: IDLE (Start Button) -> PLAYING (100% Solvable Scramble) -> SOLVED
 * - Neighbor Highlight: Movable tiles have .movable class and cyan glow
 * - Unified Click/Touch Support
 */
class SlidingPuzzle {
  constructor(boardId) {
    this.board = document.getElementById(boardId);
    if (!this.board) return;

    this.size = 3;
    this.total = 9;
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // Goal state
    this.moves = 0;
    this.seconds = 0;
    this.timer = null;
    this.isPlaying = false;

    this.movesEl = document.getElementById('puzzle-moves');
    this.timerEl = document.getElementById('puzzle-timer');
    this.msgEl = document.getElementById('puzzle-message');
    this.startBtn = document.getElementById('btn-puzzle-start');
    this.overlay = document.getElementById('puzzle-overlay');

    this.init();
  }

  init() {
    // Event delegation on board container
    this.board.addEventListener('click', (e) => {
      if (!this.isPlaying) return;
      const tileEl = e.target.closest('.puzzle-tile');
      if (!tileEl || tileEl.classList.contains('empty')) return;
      const clickedIdx = parseInt(tileEl.getAttribute('data-idx'), 10);
      this.handleTileClick(clickedIdx);
    });

    this.startBtn?.addEventListener('click', () => {
      this.startNewGame();
    });

    // Render initial goal state
    this.render();
  }

  startNewGame() {
    this.moves = 0;
    this.seconds = 0;
    this.isPlaying = true;
    if (this.msgEl) this.msgEl.textContent = '';
    this.overlay?.classList.add('hidden');
    this.startBtn.textContent = '🔄 다시 섞기';
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
      [this.tiles[clickedIdx], this.tiles[emptyIdx]] = [this.tiles[emptyIdx], this.tiles[clickedIdx]];
      this.moves++;
      this.updateStats();

      // Trigger mechanical sound
      window.dispatchEvent(new CustomEvent('app:puzzle-move'));
      this.render();

      if (this.checkWin()) {
        this.handleWin();
      }
    }
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
    if (this.msgEl) {
      this.msgEl.textContent = `🎉 4B Brain 완료! [${this.moves}회 이동 • ${this.formatTime(this.seconds)}]`;
    }
    this.startBtn.textContent = '🎮 다시 도전';
    this.overlay?.classList.remove('hidden');
    if (this.overlay) this.overlay.innerHTML = '<p>🎉 퍼즐 완성! 축하합니다!</p>';
    window.dispatchEvent(new CustomEvent('app:puzzle-win'));
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
