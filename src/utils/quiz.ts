export function getQuiz(): number {
    const urlParams = new URLSearchParams(window.location.search);
    return Math.max(0, parseInt(urlParams.get("quiz") || "0", 10) - 1);
}