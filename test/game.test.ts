import { Game, GAME_BOARD_ID } from "@client/game";

describe("Game", () => {
  let game: Game;
  let boardElement: HTMLElement;

  const initializeBoardElement = () => {
    const element = document.createElement("div");
    element.id = GAME_BOARD_ID;
    document.body.appendChild(element);
    return element;
  };

  const removeBoardElement = (element: HTMLElement) => {
    document.body.removeChild(element);
  };

  const expectBoardToBeInitial = (gameInstance: Game) => {
    expect(gameInstance.board).toEqual([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
    expect(gameInstance.currentPlayer).toBe("X");
    expect(gameInstance.turnCount).toBe(0);
  };

  beforeEach(() => {
    boardElement = initializeBoardElement();
    game = new Game(boardElement);
  });

  afterEach(() => {
    removeBoardElement(boardElement);
  });

  it("should initialize the game board correctly", () => {
    expectBoardToBeInitial(game);
    expect(game.playHistory).toEqual([]);
  });

  it("should throw an error if trying to play on an invalid cell", () => {
    expect(() => game.play(3, 3)).toThrow(
      "Invalid move. Please select a valid cell."
    );
  });

  it("should throw an error if trying to play on a cell that is already taken", () => {
    game.play(0, 0);
    expect(() => game.play(0, 0)).toThrow(
      "Cell already taken. Choose another one."
    );
  });

  it("should update the board and switch players after a valid move", () => {
    game.play(0, 0);
    expect(game.board[0][0]).toBe("X");
    expect(game.currentPlayer).toBe("O");
    expect(game.turnCount).toBe(1);
  });

  const setupHorizontalWin = () => {
    game.play(0, 0); // X
    game.play(1, 0); // O
    game.play(0, 1); // X
    game.play(1, 1); // O
  };

  it("should detect a horizontal win", () => {
    setupHorizontalWin();
    const result = game.play(0, 2); // X - this should be a win
    expect(result).toBe("X wins!");
    expectBoardToBeInitial(game);
  });

  it("should detect a vertical win", () => {
    game.play(0, 0); // X
    game.play(0, 1); // O
    game.play(1, 0); // X
    game.play(1, 1); // O
    const result = game.play(2, 0); // X - this should be a win
    expect(result).toBe("X wins!");
    expectBoardToBeInitial(game);
  });

  it("should detect a diagonal win", () => {
    game.play(0, 0); // X
    game.play(0, 1); // O
    game.play(1, 1); // X
    game.play(1, 0); // O
    const result = game.play(2, 2); // X - this should be a win
    expect(result).toBe("X wins!");
    expectBoardToBeInitial(game);
  });

  it("should clear old turns from play history", () => {
    for (let i = 0; i < 7; i++) {
      game.play(Math.floor(i / 3), i % 3); // Play 7 moves
    }
    expect(game.playHistory.length).toBe(0); // Check if play history is cleared after the game reset
  });

  it("should reset the board after a win", () => {
    setupHorizontalWin();
    game.play(0, 2); // X - X wins
    expectBoardToBeInitial(game);
  });

  it("should render the board correctly after initialization", () => {
    const cells = boardElement.querySelectorAll(".cell");
    expect(cells.length).toBe(9);
    cells.forEach((cell) => {
      expect(cell.textContent).toBe("");
    });
  });

  it("should update the board visually after a move", () => {
    game.play(0, 0); // Make a move
    const cell = boardElement.querySelector(
      ".row:nth-child(1) .cell:nth-child(1)"
    );
    expect(cell?.textContent).toBe("X");
  });

  it("should clear the winner message after 2 seconds", () => {
    jest.useFakeTimers();
    game.showWinner("X");
    let winnerMessage = boardElement.querySelector(".winner-message");
    expect(winnerMessage).not.toBeNull();
    jest.advanceTimersByTime(2000);
    winnerMessage = boardElement.querySelector(".winner-message");
    expect(winnerMessage).toBeNull();
  });
});
