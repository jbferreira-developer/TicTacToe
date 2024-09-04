// Define types for players and cells in the game
/**
 * Represents a player in a game.
 * A player can be either 'X' or 'O'.
 *
 * @typedef {('X' | 'O')} Player
 */
export type Player = "X" | "O";
/**
 * Represents a cell in a game board.
 * It can either contain a player or be empty (null).
 *
 * @typedef {Player | null} Cell
 */
export type Cell = Player | null;

/**
 * Represents the play history of a game.
 *
 * @interface PlayHistory
 * @property {Player} player - The player who made the play.
 * @property {number} row - The row coordinate of the play on the game board.
 * @property {number} col - The column coordinate of the play on the game board.
 * @property {number} turn - The turn number when the play was made.
 */
export interface PlayHistory {
  player: Player;
  row: number;
  col: number;
  turn: number;
}

/**
 * The identifier for the game board element.
 *
 * This constant represents the unique identifier for the game board element in the application.
 * It is used to select and manipulate the game board element in the code.
 *
 * @type {string}
 * @const
 */
export const GAME_BOARD_ID = "game-board";

/**
 * Represents a game of Tic Tac Toe.
 * @class
 */
export class Game {
  board: Cell[][];
  currentPlayer: Player;
  turnCount: number;
  playHistory: PlayHistory[];
  boardElement: HTMLElement;
  winnerTimeoutId: number | null;

  constructor(boardElement: HTMLElement) {
    this.board = [];
    this.currentPlayer = "X";
    this.turnCount = 0;
    this.playHistory = [];
    this.boardElement = boardElement;
    this.winnerTimeoutId = null;
    this.init();
  }

  /**
   * Initializes the application by setting up the board and rendering it.
   *
   * @returns {void}
   */
  init(): void {
    this.setupBoard();
    this.renderBoard();
  }

  /**
   * Checks if the given cell coordinates are valid within the board.
   *
   * @param row - The row coordinate of the cell.
   * @param col - The column coordinate of the cell.
   *
   * @return {boolean} - True if the cell is valid, otherwise false.
   */
  private isValidCell(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.board.length &&
      col >= 0 &&
      col < this.board[row].length
    );
  }

  /**
   * Updates the game board with the player's move.
   *
   * @param {number} row - The row index of the cell where the player wants to make a move.
   * @param {number} col - The column index of the cell where the player wants to make a move.
   *
   * @throws {Error} Thrown when the provided cell is not a valid cell on the game board.
   * @throws {Error} Thrown when the cell is already taken by another player.
   *
   * @return {string | void} Returns the winner if a win condition is met, otherwise returns void.
   */
  play(row: number, col: number): string | void {
    if (!this.isValidCell(row, col)) {
      throw new Error("Invalid move. Please select a valid cell.");
    }
    if (this.board[row][col] !== null) {
      throw new Error("Cell already taken. Choose another one.");
    }

    // Update the board for the current player's move
    this.board[row][col] = this.currentPlayer;
    this.playHistory.push({
      player: this.currentPlayer,
      row,
      col,
      turn: this.turnCount,
    });
    this.turnCount++;
    this.updateBoard();
    this.renderBoard();

    // Check for a win condition
    if (this.checkWin(row, col)) {
      const winner = this.currentPlayer;
      this.resetBoard();
      this.showWinner(winner);
      return `${winner} wins!`;
    }

    // Switch to the other player
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
  }

  /**
   * Displays the winner of the game.
   *
   * @param {Player} winner - The player who won the game.
   *
   * @return {void} - This method does not return anything.
   */
  showWinner(winner: Player): void {
    if (this.winnerTimeoutId !== null) {
      clearTimeout(this.winnerTimeoutId);
      this.winnerTimeoutId = null;
    }
    const winnerMessage = document.createElement("div");
    winnerMessage.className = "winner-message";
    winnerMessage.textContent = `${winner} wins!`;
    this.boardElement.appendChild(winnerMessage);
    this.winnerTimeoutId = window.setTimeout(() => {
      if (this.boardElement.contains(winnerMessage)) {
        this.boardElement.removeChild(winnerMessage);
      }
      this.winnerTimeoutId = null;
    }, 2000);
  }

  /**
   * Clears old turns from the play history.
   * Removes play history entries that are out of bounds or older than 6 turns.
   * Updates the game board accordingly.
   *
   * @return {void}
   */
  clearOldTurnsFromPlayHistory(): void {
    this.playHistory = this.playHistory.filter((play) => {
      if (
        play.row < 0 ||
        play.row >= this.board.length ||
        play.col < 0 ||
        play.col >= this.board[play.row].length
      ) {
        console.warn("Invalid play history entry detected and removed:", play);
        return false;
      }
      if (this.turnCount - play.turn >= 6) {
        this.board[play.row][play.col] = null;
        return false;
      }
      return true;
    });
  }

  /**
   * Updates the board with a play.
   *
   * @param {PlayHistory} play - The play to be added to the board.
   *
   * @return {void}
   */
  updateBoardWithPlay(play: PlayHistory): void {
    if (
      play.row >= 0 &&
      play.row < this.board.length &&
      play.col >= 0 &&
      play.col < this.board[play.row].length
    ) {
      this.board[play.row][play.col] = play.player;
    }
  }

  /**
   * Updates the game board by processing the latest play in the play history.
   * This method first clears any old turns from the play history.
   * Then, it retrieves the last play from the play history.
   * If a last play exists, it updates the board with that play.
   *
   * @return {void}
   */
  updateBoard(): void {
    this.clearOldTurnsFromPlayHistory();
    const lastPlay = this.playHistory[this.playHistory.length - 1];
    if (lastPlay) {
      this.updateBoardWithPlay(lastPlay);
    }
  }

  /**
   * Checks if a player has won the game by checking rows, columns, and diagonals for a win condition.
   *
   * @param {number} row - The row index of the cell where the player made their move.
   * @param {number} col - The column index of the cell where the player made their move.
   * @return {boolean} - Returns true if the player has won, otherwise false.
   */
  checkWin(row: number, col: number): boolean {
    const player = this.board[row][col];
    if (!player) return false;

    // Check rows, columns, and diagonals for a win condition
    return (
      this.board[row].every((cell) => cell === player) ||
      this.board.every((row) => row[col] === player) ||
      (row === col && this.board.every((row, i) => row[i] === player)) ||
      (row + col === this.board.length - 1 &&
        this.board.every((row, i) => row[this.board.length - 1 - i] === player))
    );
  }

  /**
   * Update the content of a cell element.
   *
   * @param {Cell} cell - The cell object representing the content to be updated.
   * @param {HTMLElement} cellElement - The HTML element that represents the cell.
   * @return {void}
   */
  updateCellContent(cell: Cell, cellElement: HTMLElement): void {
    cellElement.textContent = cell;
    if (cell === "X") {
      this.adjustClassList(cellElement, "X", "O");
    } else if (cell === "O") {
      this.adjustClassList(cellElement, "O", "X");
    } else {
      cellElement.classList.remove("X", "O");
    }
  }

  /**
   * Modifies the class list of a given HTMLElement by adding and removing classes.
   *
   * @param {HTMLElement} cellElement - The HTMLElement whose class list needs to be adjusted.
   * @param {string} addClass - The class to be added to the class list of cellElement.
   * @param {string} removeClass - The class to be removed from the class list of cellElement.
   *
   * @return {void}
   */
  adjustClassList(
    cellElement: HTMLElement,
    addClass: string,
    removeClass: string
  ): void {
    cellElement.classList.add(addClass);
    cellElement.classList.remove(removeClass);
  }

  /**
   * Set the opacity of a cell element based on the number of turns ago it represents.
   *
   * @param {HTMLElement} cellElement - The cell element whose opacity to set.
   * @param {number} turnsAgo - The number of turns ago the cell represents.
   * @return {void}
   */
  setCellOpacity(cellElement: HTMLElement, turnsAgo: number): void {
    const opacityLevels: string[] = ["1", "0.8", "0.5", "0.3"];
    const turnsAgoIndex = Math.min(turnsAgo, opacityLevels.length - 1);
    cellElement.style.opacity = opacityLevels[turnsAgoIndex];
  }

  /**
   * Creates and processes a cell element.
   *
   * @param {Cell} cell - The cell to process.
   * @param {number} rowIndex - The index of the row containing the cell.
   * @param {number} colIndex - The index of the column containing the cell.
   * @return {HTMLElement} The processed cell element.
   */
  processCell(cell: Cell, rowIndex: number, colIndex: number): HTMLElement {
    const cellElement = document.createElement("div");
    cellElement.className = "cell";
    this.updateCellContent(cell, cellElement);
    const play = this.playHistory.find(
      (play) => play.row === rowIndex && play.col === colIndex
    );
    if (play) {
      const turnsAgo = this.turnCount - play.turn - 1;
      this.setCellOpacity(cellElement, turnsAgo);
    } else {
      cellElement.style.opacity = "1";
    }
    return cellElement;
  }

  /**
   * Creates a cell element for a given cell.
   *
   * @param {Cell} cell - The cell object containing the data and properties of the cell.
   * @param {number} rowIndex - The index of the cell's row in the grid.
   * @param {number} colIndex - The index of the cell's column in the grid.
   * @return {HTMLElement} The created cell element.
   */
  createCellElement(
    cell: Cell,
    rowIndex: number,
    colIndex: number
  ): HTMLElement {
    const cellElement = this.processCell(cell, rowIndex, colIndex);
    cellElement.addEventListener("click", () => this.play(rowIndex, colIndex));
    return cellElement;
  }

  /**
   * Adds the provided cell elements to the board by creating rows and appending the cells to the rows.
   *
   * @param {HTMLElement[][]} cellElements - A 2-dimensional array of HTMLElements representing cells.
   * Each inner array represents a row of cells.
   *
   * @return {void}
   */
  addCellsToBoard(cellElements: HTMLElement[][]): void {
    cellElements.forEach((rowElements) => {
      const rowElement = document.createElement("div");
      rowElement.className = "row";
      rowElements.forEach((cellElement) => {
        rowElement.appendChild(cellElement);
      });
      this.boardElement.appendChild(rowElement);
    });
  }

  /**
   * Clears the board element and renders the current state of the game board.
   * @return {void}
   */
  renderBoard(): void {
    this.boardElement.innerHTML = "";
    const cellElements: HTMLElement[][] = [];
    this.board.forEach((row, rowIndex) => {
      const rowElements: HTMLElement[] = [];
      row.forEach((cell, colIndex) => {
        const cellElement = this.createCellElement(cell, rowIndex, colIndex);
        rowElements.push(cellElement);
      });
      cellElements.push(rowElements);
    });
    this.addCellsToBoard(cellElements);
  }

  /**
   * Sets up the game board by initializing the board array, currentPlayer, turnCount, and playHistory.
   *
   * @return {void}
   */
  setupBoard(): void {
    this.board = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    this.currentPlayer = "X";
    this.turnCount = 0;
    this.playHistory = [];
  }

  /**
   * Resets the game board.
   *
   * This method resets the game board by invoking the setupBoard() and renderBoard() methods.
   *
   * @return {void} - This method does not return any value.
   */
  resetBoard(): void {
    this.setupBoard();
    this.renderBoard();
  }
}
