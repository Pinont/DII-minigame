import type {
    DebugChallengeQuestion,
    GameSession,
    GameSettings,
    GameType,
    QuizData
} from './types/index.js';

// Global variables
let debugChallengeData: QuizData | null = null;
let currentGameSession: GameSession | null = null;

function generateJoinCode(): string {
    // Generate a new join code (this will be used when creating a new session)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const joinCodeElement = document.getElementById("join-code");
    if (joinCodeElement) {
        joinCodeElement.textContent = code;
    }
    console.log("Generated join code:", code);
    
    // Reset any existing game session
    currentGameSession = null;
    
    // Reset UI
    const startBtn = document.getElementById('start-game') as HTMLButtonElement;
    if (startBtn) {
        startBtn.textContent = 'Start Game';
        startBtn.disabled = false;
        startBtn.style.backgroundColor = '#28a745';
    }
    
    return code;
}

// Load debug challenge data from JSON
async function loadDebugChallengeData(): Promise<QuizData | null> {
    try {
        const response = await fetch('../resources/debug_challenge.json');
        debugChallengeData = await response.json() as QuizData;
        console.log('Debug challenge data loaded:', debugChallengeData);
        return debugChallengeData;
    } catch (error) {
        console.error('Error loading debug challenge data:', error);
        return null;
    }
}

// Dynamically populate quiz options
function populateQuizOptions(): void {
    const container = document.getElementById('quiz-options-container') as HTMLElement;
    const loadingElement = document.getElementById('quiz-loading') as HTMLElement;
    
    if (!container || !loadingElement) return;
    
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
    debugChallengeData.debug_challenge.questions.forEach((question: DebugChallengeQuestion, index: number) => {
      const label = document.createElement("label");
      label.className = "quiz-checkbox";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = question.id.toString();
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

async function selectMinigame(gameName: GameType): Promise<void> {
    // Remove active class from all game options
    document.querySelectorAll('.game-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected game
    const selectedOption = document.querySelector(`[data-game="${gameName}"]`) as HTMLElement;
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Update selected game display
    const selectedGameElement = document.getElementById('selected-game');
    if (selectedGameElement) {
        selectedGameElement.textContent = getGameDisplayName(gameName);
    }
    
    // Show/hide quiz selection based on game type
    const quizSelection = document.getElementById('quiz-selection') as HTMLElement;
    if (quizSelection) {
        if (gameName === 'debug_challenge') {
            quizSelection.style.display = 'block';
            
            // Load quiz data if not already loaded
            if (!debugChallengeData) {
                const loadingElement = document.getElementById('quiz-loading') as HTMLElement;
                const containerElement = document.getElementById('quiz-options-container') as HTMLElement;
                
                if (loadingElement) loadingElement.style.display = 'block';
                if (containerElement) containerElement.innerHTML = '';
                
                await loadDebugChallengeData();
            }
            
            // Populate quiz options
            populateQuizOptions();
        } else {
            quizSelection.style.display = 'none';
        }
    }
    
    // Enable start game button
    const startGameBtn = document.getElementById('start-game') as HTMLButtonElement;
    if (startGameBtn) {
        startGameBtn.disabled = false;
    }
    
    console.log("Selected minigame:", gameName);
}

function getGameDisplayName(gameName: GameType): string {
    const gameNames: Record<GameType, string> = {
        'debug_challenge': 'Debug Challenge',
        'code_typing': 'Code Typing',
        'logic': 'Logic Challenge'
    };
    return gameNames[gameName] || gameName;
}

async function startGame(): Promise<void> {
    const selectedGame = document.querySelector('.game-option.active') as HTMLElement;
    if (!selectedGame) {
        alert('Please select a minigame first!');
        return;
    }
    
    const gameName = selectedGame.dataset.game as GameType;
    
    // For debug challenge, check which quizzes are selected
    let selectedQuizzes: number[] = [];
    let selectedQuizNames: string[] = [];
    
    if (gameName === 'debug_challenge') {
        const checkboxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]:checked') as NodeListOf<HTMLInputElement>;
        selectedQuizzes = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        if (selectedQuizzes.length === 0) {
            alert('Please select at least one quiz question!');
            return;
        }
        
        // Get quiz names for display
        if (debugChallengeData && debugChallengeData.debug_challenge && debugChallengeData.debug_challenge.questions) {
            selectedQuizNames = selectedQuizzes.map(id => {
                const question = debugChallengeData!.debug_challenge.questions.find(q => q.id === id);
                return question ? question.question : `Quiz ${id + 1}`;
            });
        }
        
        console.log(`Selected quiz questions: ${selectedQuizzes.join(', ')}`);
        console.log('Selected quiz names:', selectedQuizNames);
    }
    
    // Prepare game settings
    const gameSettings: GameSettings = {
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
        
        if (result.success && result.joinCode) {
            currentGameSession = result.sessionData || null;
            const joinCode = result.joinCode;
            
            // Save join code in cookie with 4 hour timeout
            const expires = new Date(Date.now() + 4 * 60 * 60 * 1000).toUTCString();
            document.cookie = `diiminigame_joinCode=${joinCode}; expires=${expires}; path=/`;

            // Update the displayed join code
            const joinCodeElement = document.getElementById('join-code');
            if (joinCodeElement) {
                joinCodeElement.textContent = joinCode;
            }
            
            // Show success message
            let gameInfo: string;
            if (gameName === 'debug_challenge') {
                gameInfo = `Game "${getGameDisplayName(gameName)}" created successfully!\n\nJoin Code: ${joinCode}\n\nSelected Quizzes (${selectedQuizzes.length}):\n${selectedQuizNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\nWaiting for players to join...`;
            } else {
                gameInfo = `Game "${getGameDisplayName(gameName)}" created successfully!\nJoin Code: ${joinCode}\n\nWaiting for players to join...`;
            }
            
            // Redirect to player list page after a short delay
            setTimeout(() => {
                window.location.href = `host_lobby`;
            }, 2000);
            
        } else {
            alert(`Error creating game session: ${result.error}`);
        }
    } catch (error) {
        console.error('Error starting game:', error);
        alert(`Error starting game: ${(error as Error).message}`);
    }
}

// Function to update UI when game becomes active
function updateUIForActiveGame(): void {
    const startBtn = document.getElementById('start-game') as HTMLButtonElement;
    if (startBtn) {
        startBtn.textContent = 'Game Active';
        startBtn.disabled = true;
        startBtn.style.backgroundColor = '#28a745';
    }
}


// Quiz selection functions
function selectAllQuizzes(): void {
    const checkboxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    updateSelectedCount();
}

function deselectAllQuizzes(): void {
    const checkboxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateSelectedCount();
}

function updateSelectedCount(): void {
    const checkedBoxes = document.querySelectorAll('#quiz-options-container input[type="checkbox"]:checked') as NodeListOf<HTMLInputElement>;
    const count = checkedBoxes.length;
    const selectedCountElement = document.getElementById('selected-count');
    if (selectedCountElement) {
        selectedCountElement.textContent = count.toString();
    }
    
    // Update start game button state
    const startBtn = document.getElementById('start-game') as HTMLButtonElement;
    const selectedGame = document.querySelector('.game-option.active') as HTMLElement;
    
    if (startBtn && selectedGame && selectedGame.dataset.game === 'debug_challenge') {
        startBtn.disabled = count === 0;
    }
}

document.addEventListener('DOMContentLoaded', function(): void {
    // Generate initial join code when page loads
    generateJoinCode();
    
    // Pre-load debug challenge data for faster loading later
    loadDebugChallengeData();
    
    // Add click event listeners to game option buttons
    document.querySelectorAll('.game-option').forEach(option => {
        option.addEventListener('click', function(this: HTMLElement) {
            const gameName = this.dataset.game as GameType;
            selectMinigame(gameName);
        });
    });
    
    // Add click event listener to start game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }
});

// Export functions for global access
(window as any).generateJoinCode = generateJoinCode;
(window as any).selectMinigame = selectMinigame;
(window as any).startGame = startGame;
(window as any).selectAllQuizzes = selectAllQuizzes;
(window as any).deselectAllQuizzes = deselectAllQuizzes;
