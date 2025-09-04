let timer = 0;
let timerInterval = null;

function startTimer() {
    timer = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timer++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    const minElem = document.getElementById('timer-minutes');
    const secElem = document.getElementById('timer-seconds');
    if (minElem && secElem) {
        minElem.textContent = min;
        secElem.textContent = sec;
    }
}

// เรียก startTimer() เมื่อเริ่มเกม
document.addEventListener("DOMContentLoaded", () => {
    startTimer();
});