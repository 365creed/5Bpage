/**
 * 5Bpage Sliding Tile Puzzle Engine
 * - 100% Solvable Guarantee via Valid-Move Random Walk Shuffle
 * - Fluid Mobile Touch & Click Binding
 * - Timer, Move Counter, and Audio Event Dispatcher
 */
class SlidingPuzzle {
  constructor(boardId) {
    this.board = document.getElementById(boardId);
    if (!this.board) return;

    this.size = 3;
    this.totalTiles = 9;
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 is blank
    this.moves = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isSolved = false;

    this.movesDisplay = document.getElementById('puzzle-moves');
    this.timerDisplay = document.getElementById('puzzle-timer');
    this.messageDisplay = document.getElementById('puzzle-message');
    this.resetBtn = document.getElementById('btn-puzzle-reset');

    this.init();
  }

  init() {
    this.resetBtn?.addEventListener('click', () => this.startNewGame());

    // Keyboard Arrow Control Support
    window.addEventListener('keydown', (e) => {
      const emptyIdx = this.tiles.indexOf(0);
      const row = Math.floor(emptyIdx / this.size);
      const col = emptyIdx % this.size;

      if (e.key === 'ArrowUp' && row < this.size - 1) {
        this.moveTile(emptyIdx + this.size);
      } else if (e.key === 'ArrowDown' && row > 0) {
        this.moveTile(emptyIdx - this.size);
      } else if (e.key === 'ArrowLeft' && col < this.size - 1) {
        this.moveTile(emptyIdx + 1);
      } else if (e.key === 'ArrowRight' && col > 0) {
        this.moveTile(emptyIdx - 1);
      }
    });

    this.startNewGame();
  }

  startNewGame() {
    this.moves = 0;
    this.timerSeconds = 0;
    this.isSolved = false;
    this.updateStats();
    if (this.messageDisplay) this.messageDisplay.textContent = '';

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateStats();
    }, 1000);

    // 100% Solvable Guaranteed Shuffle
    this.shuffleByValidMoves(80);
    this.render();
  }

  /**
   * Shuffles by simulating legitimate tile moves from the solved state.
   * Mathematically impossible to produce an unsolvable configuration.
   */
  shuffleByValidMoves(iterations = 80) {
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let lastMoved = -1;

    for (let i = 0; i < iterations; i++) {
      const emptyIdx = this.tiles.indexOf(0);
      const neighbors = this.getValidNeighbors(emptyIdx).filter(idx => idx !== lastMoved);
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Swap
      [this.tiles[emptyIdx], this.tiles[chosen]] = [this.tiles[chosen], this.tiles[emptyIdx]];
      lastMoved = emptyIdx;
    }

    // Ensure it does not start in solved state
    if (this.checkVictory()) {
      this.shuffleByValidMoves(10);
    }
  }

  getValidNeighbors(index) {
    const row = Math.floor(index / this.size);
    const col = index % this.size;
    const neighbors = [];

    if (row > 0) neighbors.push(index - this.size); // Up
    if (row < this.size - 1) neighbors.push(index + this.size); // Down
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < this.size - 1) neighbors.push(index + 1); // Right

    return neighbors;
  }

  render() {
    this.board.innerHTML = '';
    this.tiles.forEach((value, index) => {
      const tile = document.createElement('div');
      tile.classList.add('puzzle-tile');

      if (value === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = value;
        // Pointer down handles both mobile touch and desktop click instantly
        tile.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.moveTile(index);
        });
      }
      this.board.appendChild(tile);
    });
  }

  moveTile(index) {
    if (this.isSolved) return;
    const emptyIndex = this.tiles.indexOf(0);
    const validMoves = this.getValidNeighbors(emptyIndex);

    if (validMoves.includes(index)) {
      // Swap tile with blank
      [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
      this.moves++;
      this.updateStats();

      // Trigger Mechanical Sound Effect
      window.dispatchEvent(new CustomEvent('app:puzzle-move'));

      this.render();

      if (this.checkVictory()) {
        this.handleVictory();
      }
    }
  }

  checkVictory() {
    for (let i = 0; i < this.totalTiles - 1; i++) {
      if (this.tiles[i] !== i + 1) return false;
    }
    return this.tiles[this.totalTiles - 1] === 0;
  }

  handleVictory() {
    this.isSolved = true;
    clearInterval(this.timerInterval);
    if (this.messageDisplay) {
      this.messageDisplay.textContent = `🎉 4B Brain 미션 완료! (${this.moves}회 이동 / ${this.formatTime(this.timerSeconds)})`;
    }
    window.dispatchEvent(new CustomEvent('app:puzzle-win'));
  }

  updateStats() {
    if (this.movesDisplay) this.movesDisplay.textContent = this.moves;
    if (this.timerDisplay) this.timerDisplay.textContent = this.formatTime(this.timerSeconds);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}

window.SlidingPuzzle = SlidingPuzzle;
