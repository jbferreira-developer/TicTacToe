import { Game, GAME_BOARD_ID } from "./game";

// Wait for the DOM content to be loaded before executing the script
document.addEventListener("DOMContentLoaded", () => {
  const boardElement = document.getElementById(GAME_BOARD_ID);
  if (boardElement) {
    const _ = new Game(boardElement);
  }
});
