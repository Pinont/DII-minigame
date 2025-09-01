// Main TypeScript entry point for DII Minigame
import './firebase.js';

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

    // Limit join code input to 6 characters and only numbers
    (joinCodeInput as HTMLInputElement).addEventListener('input', () => {
      const code = joinCodeInput as HTMLInputElement;
      
      // Remove any non-numeric characters
    //   code.value = code.value.replace(/[^0-9]/g, '');
      
      // Limit to 6 characters
      if (code.value.length > 6) {
        code.value = code.value.substring(0, 6);
      }
    });

    joinButton.addEventListener("click", () => {
      const joinCode = (joinCodeInput as HTMLInputElement).value.trim();
      const playerName = (playerNameInput as HTMLInputElement).value.trim();
      
      // Validate inputs
      if (!joinCode) {
        alert('Please enter a join code');
        return;
      }
      
      if (joinCode.length !== 6) {
        alert('Invalid Code input');
        return;
      }
      
      if (!playerName) {
        alert('Please enter your name');
        return;
      }
      
      console.log("Player name:", playerName);
      console.log("Joining game with code:", joinCode);
    });
  }

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });

});

