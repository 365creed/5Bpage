/**
 * 4B Brain: Solvable 8-Tile Puzzle Engine
 * - 100% Guaranteed Solvability (Simulated legal random moves from Goal State)
 * - Click Event Delegation: Flawlessly supports Mouse Click, Trackpad, Touch, and Mobile Taps
 */
class SlidingPuzzle {
  constructor(boardId) {
    this.board = document.getElementById(boardId);
    if (!this.board) return;

    this.size = 3;
    this.total = 9;
    this.tiles = [];
    this.moves = 0;
    this.seconds = 0;
    this.timer = null;
    this.isSolved = false;

    this.movesEl = document.getElementById('puzzle-moves');
    this.timerEl = document.getElementById('puzzle-timer');
    this.msgEl = document.getElementById('puzzle-message');
    this.resetBtn = document.getElementById('btn-puzzle-reset');

    this.init();
  }

  init() {
    // Event delegation on the board container (handles both desktop click & mobile tap cleanly)
    this.board.addEventListener('click', (e) => {
      const tileEl = e.target.closest('.puzzle-tile');
      if (!tileEl || tileEl.classList.contains('empty')) return;
      const clickedIdx = parseInt(tileEl.getAttribute('data-idx'), 10);
      this.handleTileClick(clickedIdx);
    });

    this.resetBtn?.addEventListener('click', () => this.startNewGame());
    this.startNewGame();
  }

  startNewGame() {
    this.moves = 0;
    this.seconds = 0;
    this.isSolved = false;
    if (this.msgEl) this.msgEl.textContent = '';
    this.updateStats();

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.seconds++;
      this.updateStats();
    }, 1000);

    // Goal State: 1 to 8 in order, 0 is empty
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

    // Mathematical guarantee: 120 valid random swaps starting from solved state
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
    this.tiles.forEach((value, idx) => {
      const tile = document.createElement('div');
      tile.classList.add('puzzle-tile');
      tile.setAttribute('data-idx', idx);

      if (value === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = value;
      }
      this.board.appendChild(tile);
    });
  }

  handleTileClick(clickedIdx) {
    if (this.isSolved) return;

    const emptyIdx = this.tiles.indexOf(0);
    const neighbors = this.getNeighbors(emptyIdx);

    if (neighbors.includes(clickedIdx)) {
      // Valid adjacent move -> Swap
      [this.tiles[clickedIdx], this.tiles[emptyIdx]] = [this.tiles[emptyIdx], this.tiles[clickedIdx]];
      this.moves++;
      this.updateStats();

      // Trigger mechanical tile sound
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
    this.isSolved = true;
    clearInterval(this.timer);
    if (this.msgEl) {
      this.msgEl.textContent = `🎉 4B Brain 완료! [${this.moves}회 이동 • ${this.formatTime(this.seconds)}]`;
    }
    window.dispatchEvent(new CustomEvent('app:puzzle-win'));
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
