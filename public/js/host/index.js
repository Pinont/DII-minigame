function generateJoinCode() {
    // Generate a 6-digit random number as a string, padded with zeros if needed
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("join-code").textContent = code;
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Your code to run when the DOM is fully loaded
    generateJoinCode();
});