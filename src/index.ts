// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('DII Minigame TypeScript app initialized');

  const joinButton = document.getElementById("join-game-btn");
  const joinCodeInput = document.getElementById("join-code-input");
  const playerNameInput = document.getElementById("player-name-input");

  if (joinButton && joinCodeInput && playerNameInput) {
    // Limit player name input to 16 characters
    (playerNameInput as HTMLInputElement).addEventListener('input', () => {
      const name = playerNameInput as HTMLInputElement;

      if (name.value.length > 28) {
        name.value = name.value.substring(0, 28);
      }
    });

    joinButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const joinCode = (joinCodeInput as HTMLInputElement).value.trim();
      const playerName = (playerNameInput as HTMLInputElement).value.trim();

      // Validate inputs as needed...

      console.log("Player name:", playerName);
      console.log("Joining game with code:", joinCode);

      if (!joinCode) {
        alert("Please enter a join code.");
        return;
      } 
      if (!playerName) {
        alert("Please enter your name.");
        return;
      }

      if (joinCode.toLowerCase() === "debug") {
        window.location.href = "debug_challenge.html";
      } else if (joinCode.toLowerCase() === "typing") {
        window.location.href = "code_typing.html";
      } else if (joinCode.toLowerCase() === "logic") {
        window.location.href = "logic_game.html";
      } else {
        alert("Unknown or game not exist");
      }
    });
  }
});

