export function getQuiz(): number {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("quiz") || "0", 10);
}