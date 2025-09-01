// เมื่อกดปุ่มเกม จะเปลี่ยนค่า Selected Game
   document.addEventListener("DOMContentLoaded", () => {
    // เมื่อกดปุ่มเกม จะเปลี่ยนค่า Selected Game
    document.querySelectorAll(".game-option").forEach(button => {
        button.addEventListener("click", () => {
            const selectedGame = button.getAttribute("data-game");
            const selectedGameElem = document.getElementById("selected-game");
            if (selectedGameElem) {
                selectedGameElem.textContent = selectedGame;
            }
        });
    });
});
