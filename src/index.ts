// Initialize the application
document.addEventListener('DOMContentLoaded', () => {

  const debugButton = document.getElementById("debug-btn");
  const typingButton = document.getElementById("typing-btn");
  const logicButton = document.getElementById("logic-btn");

  // Debug Game Button
  if (debugButton) {
    debugButton.addEventListener("click", (e) => {
      console.log("Starting debug game");
      window.location.href = "./debug_game.html?quiz=1&max=3&skip=[2,3,4,5]";
    });
  }

  // Typing Game Button
  if (typingButton) {
    typingButton.addEventListener("click", (e) => {
      console.log("Starting typing game");
      window.location.href = "./typing_game.html?quiz=1&max=3&skip=[2,3,5]";
    });
  }

  // Logic Game Button
  if (logicButton) {
    logicButton.addEventListener("click", (e) => {
      console.log("Starting logic game");
      window.location.href = "./logic_game.html?quiz=1&max=3&skip=[1,2,4,6]";
    });
  }
});

