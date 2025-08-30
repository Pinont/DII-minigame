// Global variables
let debugChallengeData = null;
let currentGameSession = null;

function generateJoinCode() {
    // Generate a new join code (this will be used when creating a new session)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("join-code").textContent = code;
    console.log("Generated join code:", code);
    
    // Reset any existing game session
    currentGameSession = null;
    
    // Reset UI
    const startBtn = document.getElementById('start-game');
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
    startBtn.style.backgroundColor = '#28a745';
    
    return code;
}

// Load debug challenge data from JSON
async function loadDebugChallengeData() {
    try {
        const response = await fetch('../src/resource/debug_challenge.json');
        debugChallengeData = await response.json();
        console.log('Debug challenge data loaded:', debugChallengeData);
        return debugChallengeData;
    } catch (error) {
        console.error('Error loading debug challenge data:', error);
        return null;
    }
}

// Dynamically populate quiz options
function populateQuizOptions() {
    const container = document.getElementById('quiz-options-container');
    const loadingElement = document.getElementById('quiz-loading');
    
    if (!debugChallengeData || !debugChallengeData.debug_challenge || !debugChallengeData.debug_challenge.questions) {
        container.innerHTML = '<p style="color: red;">Error loading quiz questions. Please refresh the page.</p>';
        loadingElement.style.display = 'none';
        return;
    }
    
    // Clear loading message
    loadingElement.style.display = 'none';
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create quiz options dynamically
    debugChallengeData.debug_challenge.questions.forEach((question, index) => {
      const label = document.createElement("label");
      label.className = "quiz-checkbox";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = question.id;
      checkbox.checked = true; // All selected by default
      checkbox.addEventListener("change", updateSelectedCount);

      const span = document.createElement("span");
      span.textContent = `Quiz ${question.id + 1}: ${question.question}`;

      label.appendChild(checkbox);
      label.appendChild(span);
      container.appendChild(label);
    });
    
    // Update the initial count
    updateSelectedCount();
}

async function selectMinigame(gameName) {
    // Remove active class from all game options
    document.querySelectorAll('.game-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected game
    const selectedOption = document.querySelector(`[data-game="${gameName}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Update selected game display
    document.getElementById('selected-game').textContent = getGameDisplayName(gameName);
    
    // Show/hide quiz selection based on game type
    const quizSelection = document.getElementById('quiz-selection');
    if (gameName === 'debug_challenge') {
        quizSelection.style.display = 'block';
        
        // Load quiz data if not already loaded
        if (!debugChallengeData) {
            document.getElementById('quiz-loading').style.display = 'block';
            document.getElementById('quiz-options-container').innerHTML = '';
            await loadDebugChallengeData();
        }
        
        // Populate quiz options
        populateQuizOptions();
    } else {
        quizSelection.style.display = 'none';
    }
    
    // Enable start game button
    document.getElementById('start-game').disabled = false;
    
    console.log("Selected minigame:", gameName);
}

function getGameDisplayName(gameName) {
    const gameNames = {
        'debug_challenge': 'Debug Challenge',
        'code_typing': 'Code Typing',
        'logic': 'Logic Challenge'
    };
    return gameNames[gameName] || gameName;
}

async function startGame() {
    const selectedGame = document.querySelector('.game-option.active');
    if (!selectedGame) {
        alert('Please select a minigame first!');
        return;
    }
    
    const gameName = selectedGame.dataset.game;
    
    // For debug challenge, check which quizzes are selected
    let selectedQuizzes = [];
    let selectedQuizNames = [];
    if (gameName === 'debug_challenge') {
        const checkboxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]:checked');
        selectedQuizzes = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        if (selectedQuizzes.length === 0) {
            alert('Please select at least one quiz question!');
            return;
        }
        
        // Get quiz names for display
        if (debugChallengeData && debugChallengeData.quiz && debugChallengeData.quiz.questions) {
            selectedQuizNames = selectedQuizzes.map(id => {
                const question = debugChallengeData.quiz.questions.find(q => q.id === id);
                return question ? question.question : `Quiz ${id + 1}`;
            });
        }
        
        console.log(`Selected quiz questions: ${selectedQuizzes.join(', ')}`);
        console.log('Selected quiz names:', selectedQuizNames);
    }
    
    // Prepare game settings
    const gameSettings = {
        gameType: gameName,
        selectedQuizzes: selectedQuizzes,
        selectedQuizNames: selectedQuizNames,
        totalQuestions: selectedQuizzes.length
    };
    
    // Wait for Firebase to be ready
    if (!window.gameDB) {
        alert('Firebase is not ready yet. Please wait a moment and try again.');
        return;
    }
    
    try {
        // Create game session in Firebase
        const result = await window.gameDB.createGameSession(gameName, gameSettings);
        
        if (result.success) {
            currentGameSession = result;
            const joinCode = result.joinCode;
            
            // Update the displayed join code
            document.getElementById('join-code').textContent = joinCode;
            
            // Show success message
            let gameInfo;
            if (gameName === 'debug_challenge') {
                gameInfo = `Game "${getGameDisplayName(gameName)}" created successfully!\n\nJoin Code: ${joinCode}\n\nSelected Quizzes (${selectedQuizzes.length}):\n${selectedQuizNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\nWaiting for players to join...`;
            } else {
                gameInfo = `Game "${getGameDisplayName(gameName)}" created successfully!\nJoin Code: ${joinCode}\n\nWaiting for players to join...`;
            }
            
            alert(gameInfo);
            
            // Start listening for players
            listenForPlayers(joinCode);
            
            // Update UI to show game is active
            updateUIForActiveGame();
            
        } else {
            alert(`Error creating game session: ${result.error}`);
        }
    } catch (error) {
        console.error('Error starting game:', error);
        alert(`Error starting game: ${error.message}`);
    }
}

// Function to listen for players joining
function listenForPlayers(joinCode) {
    if (window.gameDB) {
        window.gameDB.listenToPlayers(joinCode, (players) => {
            console.log('Players updated:', players);
            updatePlayersList(players);
        });
    }
}

// Function to update UI when game becomes active
function updateUIForActiveGame() {
    const startBtn = document.getElementById('start-game');
    startBtn.textContent = 'Game Active';
    startBtn.disabled = true;
    startBtn.style.backgroundColor = '#28a745';
}

// Function to update players list display (you can customize this)
function updatePlayersList(players) {
    const playerCount = Object.keys(players).length;
    console.log(`${playerCount} players connected`);
    // Add UI update logic here if needed
}

// Quiz selection functions
function selectAllQuizzes() {
    const checkboxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    updateSelectedCount();
}

function deselectAllQuizzes() {
    const checkboxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateSelectedCount();
}

function updateSelectedCount() {
    const checkedBoxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]:checked');
    const count = checkedBoxes.length;
    document.getElementById('selected-count').textContent = count;
    
    // Update start game button state
    const startBtn = document.getElementById('start-game');
    const selectedGame = document.querySelector('.game-option.active');
    
    if (selectedGame && selectedGame.dataset.game === 'debug_challenge') {
        startBtn.disabled = count === 0;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Generate initial join code when page loads
    generateJoinCode();
    
    // Pre-load debug challenge data for faster loading later
    loadDebugChallengeData();
    
    // Add click event listeners to game option buttons
    document.querySelectorAll('.game-option').forEach(option => {
        option.addEventListener('click', function() {
            const gameName = this.dataset.game;
            selectMinigame(gameName);
        });
    });
    
    // Add click event listener to start game button
    document.getElementById('start-game').addEventListener('click', startGame);
});
