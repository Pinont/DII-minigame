// Initialize the application
document.addEventListener('DOMContentLoaded', () => {

  const joinButton = document.getElementById("btn");
  const joinCodeInput = document.getElementById("code");

  if (joinButton && joinCodeInput) {

    joinButton.addEventListener("click", async (e) => {
      let joinCode = (joinCodeInput as HTMLInputElement).value.trim();

      console.log("Joining game with code:", joinCode);

      if (!joinCode) {
        alert("Please enter a join code.");
        return;
      }

      joinCode = joinCode.toLowerCase();

      if (joinCode === "debug") {
        window.location.href = "./debug_game.html";
      } else if (joinCode === "typing") {
        window.location.href = "./typing_game.html";
      } else if (joinCode === "logic") {
        window.location.href = "./logic_game.html";
      } else {
        alert("Unknown or game not exist");
      }
    });
  }
});

