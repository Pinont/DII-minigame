document.addEventListener('DOMContentLoaded', function () {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('joinCode');
    const playerName = urlParams.get('name') || 'Anonymous Player';
    
    // Update display elements
    const gameCodeElement = document.getElementById('game_code');
    const playerNameElement = document.getElementById('player_name');
    
    if (gameCodeElement && joinCode) {
        gameCodeElement.textContent = joinCode;
    } else {
        alert('Invalid game code');
        // redirect to home page
        window.location.href = 'index.html';
    }
    
    if (playerNameElement) {
        playerNameElement.textContent = playerName;
    }
    
    console.log('Game room initialized with joinCode:', joinCode);
});