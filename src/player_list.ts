import gameDB from "./firebase.js";

let gameSession: any;

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    showLoading(true);
    await loadGame();
});

let joinCode: HTMLElement | null = document.getElementById("game-join-code");
let gameType: HTMLElement | null = document.getElementById("game-type");

// Try to get join code from cookie first, fallback to URL parameter
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
    return null;
}

async function loadGame(): Promise<void> {
    let cookieCode = getCookie("diiminigame_joinCode");
    if (!cookieCode) {
        alert("Could not found join code");
        const urlParams = new URLSearchParams(window.location.search);
        cookieCode = urlParams.get("diiminigame_joinCode");
    }
  console.log("Join code:", cookieCode);

  gameDB.getGameSession(cookieCode ?? "").then(response => {
      if (response) {
        if (joinCode && gameType) {
          joinCode.textContent = response.session?.joinCode || "------";
          gameType.textContent = response.session?.gameType.toUpperCase().replace("_", " ") || "-";
        }
      } else {
        console.error("No game session found.");
      }
  });
  showLoading(false);
}

function showLoading(show: boolean): void {
    const loadingElement = document.getElementById('loading-state');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

function displayPlayers(players: { id: string; name: string; }[]) {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;

    // Clear existing player list
    playersList.innerHTML = '';

    if (players.length === 0) {
        playersList.innerHTML = `
            <div class="no-players">
                <div class="no-players-icon">🎯</div>
                <p>No players have joined yet</p>
                <p class="join-instruction">Share the join code with players!</p>
            </div>
        `;
        return;
    }

    // Display each player
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <span class="player-name">${player.name}</span>
            <button class="btn btn-remove" data-player-id="${player.id}">Remove</button>
        `;
        playersList.appendChild(playerItem);
    });
}
