import { createGame, getGameType } from "./firebase.js";

const startIcon = document.createElement("span");
startIcon.classList.add("play-icon");

const stopIcon = document.createElement("span");
stopIcon.classList.add("stop-icon");

let gameStarted = false;

// เมื่อกดปุ่มเกม จะเปลี่ยนค่า Selected Game
   document.addEventListener("DOMContentLoaded", () => {
    const start_game_button = document.getElementById("start-game");

    const gameType = getGameType("dii07").then((result) => {
      const selectedGameElem = document.getElementById("selected-game");
      if (selectedGameElem) {
        if (result && result.gameType) {
          updateGameStatus(start_game_button, true);
          console.log("Fetched game type:", result.gameType);
          selectedGameElem.textContent = result.gameType;
        } else {
            registerGameSelectorButton();
        }
      }
    });

    if (start_game_button) {
        start_game_button.addEventListener("click", () => {
            const selectedGameElem = document.getElementById("selected-game");
            if (!selectedGameElem) return;
            if (!gameStarted) {
                if (selectedGameElem.textContent == "None") {
                  alert("Please select a game before starting.");
                } else {
                  console.log("Starting game:", selectedGameElem.textContent);
                  createGame(selectedGameElem.textContent, "dii07");
                  // Change button to red and text to Stop Game
                  updateGameStatus(start_game_button, true);
                  unregisterGameSelectorButton();
                }
            } else {
                updateGameStatus(start_game_button, false);
                selectedGameElem.textContent = "None";
                registerGameSelectorButton();
            }
        });
    }
});

/**
 * @param {HTMLElement | null} start_game_button
 * @param {boolean} status
 */
function updateGameStatus(start_game_button, status) {
    if (!start_game_button) return;
    if (!status) {
        start_game_button.classList.remove("stop");
        start_game_button.innerHTML =
          '<span class="play-icon" aria-hidden="true"></span> Start Game';
    } else {
        start_game_button.classList.add("stop");
        start_game_button.innerHTML =
          '<span class="stop-icon" aria-hidden="true"></span> Stop Game';
    }
    gameStarted = status;
}

function registerGameSelectorButton() {
  // เมื่อกดปุ่มเกม จะเปลี่ยนค่า Selected Game
  document.querySelectorAll(".game-option").forEach((button) => {
    button.addEventListener("click", () => gameSelector(button));
  });
}

/**
 * @param {Element} button
 */
function gameSelector(button) {
    const selectedGame = button.getAttribute("data-game");
    const selectedGameElem = document.getElementById("selected-game");
    if (selectedGameElem) {
      selectedGameElem.textContent = selectedGame;
    }
}

function unregisterGameSelectorButton() {
  // เมื่อกดปุ่มเกม จะเปลี่ยนค่า Selected Game
  document.querySelectorAll(".game-option").forEach((button) => {
    button.replaceWith(button.cloneNode(true));
  });
}
