/**
 * Sliding Tile Puzzle Module
 * Solvable check, move count, timer, and Sound Event dispatching
 */
class SlidingPuzzle {
  constructor(boardId, size = 3) {
    this.board = document.getElementById(boardId);
    if (!this.board) return;

    this.size = size;
    this.totalTiles = size * size;
    this.tiles = [];
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

    this.tiles = this.generateSolvableTiles();
    this.render();
  }

  generateSolvableTiles() {
    let arr = Array.from({ length: this.totalTiles }, (_, i) => (i + 1) % this.totalTiles);

    // Fisher-Yates Shuffle until solvable
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!this.isSolvable(arr) || this.checkVictory(arr));

    return arr;
  }

  isSolvable(arr) {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i] > arr[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
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
        tile.addEventListener('click', () => this.handleTileClick(index));
      }
      this.board.appendChild(tile);
    });
  }

  handleTileClick(index) {
    if (this.isSolved) return;
    const emptyIndex = this.tiles.indexOf(0);

    const row = Math.floor(index / this.size);
    const col = index % this.size;
    const emptyRow = Math.floor(emptyIndex / this.size);
    const emptyCol = emptyIndex % this.size;

    const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;

    if (isAdjacent) {
      // Swap tiles
      [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
      this.moves++;
      this.updateStats();

      // Trigger Audio Event
      window.dispatchEvent(new CustomEvent('app:puzzle-move'));

      this.render();

      if (this.checkVictory(this.tiles)) {
        this.handleVictory();
      }
    }
  }

  checkVictory(arr) {
    for (let i = 0; i < this.totalTiles - 1; i++) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[this.totalTiles - 1] === 0;
  }

  handleVictory() {
    this.isSolved = true;
    clearInterval(this.timerInterval);
    if (this.messageDisplay) {
      this.messageDisplay.textContent = `🎉 퍼즐 완성! ${this.moves}회 이동 / ${this.formatTime(this.timerSeconds)}`;
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
