// Simplified Typing Game - Continuous typing with completion popup

interface Question {
  id: number;
  title: string;
  codePath: string;
}

// Configuration: Limit how many questions to display (default: all questions)
let maxQuestionsToDisplay: number | null = null;

// Game state
let currentQuestion: Question | null = null;
let currentCode = "";
let userInput = "";
let allQuestions: Question[] = [];
let currentQuestionIndex = 0;
let isCompleted = false;

document.addEventListener("DOMContentLoaded", async () => {
  await loadQuestions();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const maxParam = urlParams.get('max');
  
  // Set maxQuestionsToDisplay from URL parameter or default to all questions
  if (maxParam && !isNaN(parseInt(maxParam)) && parseInt(maxParam) > 0) {
    maxQuestionsToDisplay = parseInt(maxParam);
  } else if (maxQuestionsToDisplay === null) {
    maxQuestionsToDisplay = allQuestions.length;
  }
  
  // Apply question limit
  const questionsToShow = getQuestionsToShow();
  
  // Get quiz parameter from URL
  let quizParam = urlParams.get('quiz');
  let quizNumber = quizParam ? parseInt(quizParam) - 1 : 0; // Convert to 0-based index
  
  // Validate quiz number
  if (quizNumber < 0 || quizNumber >= questionsToShow.length) {
    // Preserve max parameter if it exists when redirecting
    const maxParam = urlParams.get('max');
    const redirectUrl = maxParam ? `?quiz=1&max=${maxParam}` : "?quiz=1";
    window.location.href = redirectUrl;
    return;
  }
  
  currentQuestionIndex = quizNumber;
  await displayQuestion(questionsToShow[currentQuestionIndex]);
  
  setupEventListeners();
  focusInput();
  // Ensure the main typing area has focused class immediately
  const mainTypingArea = document.querySelector(".main-typing-area") as HTMLElement;
  if (mainTypingArea) {
    mainTypingArea.classList.add("typing-area-focused");
  }
});

async function loadQuestions() {
  try {
    const response = await fetch('../resources/typing_code/questions.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allQuestions = await response.json();
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

function getQuestionsToShow(): Question[] {
  // Apply question limit if set
  if (maxQuestionsToDisplay !== null && maxQuestionsToDisplay > 0) {
    return allQuestions.slice(0, maxQuestionsToDisplay);
  }
  
  return allQuestions;
}

async function displayQuestion(question: Question) {
  const titleEl = document.getElementById("title");
  const targetEl = document.getElementById("target");
  const inputEl = document.getElementById("input") as HTMLTextAreaElement;
  
  if (titleEl && targetEl && inputEl) {
    currentQuestion = question;
    const questionsToShow = getQuestionsToShow();
    titleEl.textContent = `Question ${currentQuestionIndex + 1}/${questionsToShow.length}: ${question.title}`;
    
    // Load the code
    const codeResponse = await fetch(`../resources/typing_code/${question.codePath}`);
    currentCode = await codeResponse.text();
    
    // Reset game state
    resetGame();
    
    // Render the code
    renderCode(targetEl, currentCode);
    
    // Focus input
    focusInput();
  }
}

function resetGame() {
  userInput = "";
  isCompleted = false;
  
  const inputEl = document.getElementById("input") as HTMLTextAreaElement;
  if (inputEl) {
    inputEl.value = "";
    inputEl.disabled = false;
  }
}

function renderCode(targetEl: HTMLElement, code: string) {
  targetEl.innerHTML = "";
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const span = document.createElement("span");
    
    // Set initial cursor position at the first character
    if (i === 0) {
      span.className = "char current-char";
    } else {
      span.className = "char";
    }
    
    if (char === '\n') {
      span.innerHTML = '\n';
    } else if (char === ' ') {
      span.innerHTML = '&nbsp;';
    } else if (char === '\t') {
      span.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
    } else {
      span.textContent = char;
    }
    
    targetEl.appendChild(span);
  }
}

function setupEventListeners() {
  const inputEl = document.getElementById("input") as HTMLTextAreaElement;
  const mainTypingArea = document.querySelector(".main-typing-area") as HTMLElement;
  
  if (inputEl) {
    inputEl.addEventListener("input", handleTyping);
    inputEl.addEventListener("keydown", handleKeyDown);
    
    // Add keyup listener to prevent any lingering selections
    inputEl.addEventListener("keyup", (e) => {
      const inputEl = e.target as HTMLTextAreaElement;
      // Always reset selection to cursor position
      inputEl.selectionStart = inputEl.value.length;
      inputEl.selectionEnd = inputEl.value.length;
    });
    
    // Prevent paste, copy, cut, and select all operations
    inputEl.addEventListener("paste", (e) => e.preventDefault());
    inputEl.addEventListener("copy", (e) => e.preventDefault());
    inputEl.addEventListener("cut", (e) => e.preventDefault());
    inputEl.addEventListener("selectstart", (e) => e.preventDefault());
    inputEl.addEventListener("contextmenu", (e) => e.preventDefault());
    
    // Add focus/blur listeners to show/hide cursor
    inputEl.addEventListener("focus", () => {
      if (mainTypingArea) {
        mainTypingArea.classList.add("typing-area-focused");
      }
    });
    
    inputEl.addEventListener("blur", () => {
      if (mainTypingArea) {
        mainTypingArea.classList.remove("typing-area-focused");
      }
    });
  }
  
  // Refocus input when clicking on the typing area
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(".main-typing-area") && !isCompleted) {
      focusInput();
    }
  });
  
  // Also add click listener directly to the code display area
  const codeDisplay = document.getElementById("target");
  if (codeDisplay) {
    codeDisplay.addEventListener("click", () => {
      if (!isCompleted) {
        focusInput();
        // Ensure the focused class is added immediately
        if (mainTypingArea) {
          mainTypingArea.classList.add("typing-area-focused");
        }
      }
    });
  }
}

function handleKeyDown(e: KeyboardEvent) {
  // Prevent copy/paste/cut keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a') {
      e.preventDefault();
      return;
    }
  }
  
  // Prevent text selection with shift + arrow keys
  if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Home' || e.key === 'End')) {
    e.preventDefault();
    return;
  }
  
  // Prevent tab from moving focus
  if (e.key === "Tab") {
    e.preventDefault();
    
    const inputEl = e.target as HTMLTextAreaElement;
    const start = inputEl.selectionStart ?? 0;
    const end = inputEl.selectionEnd ?? 0;
    const tabChar = "    "; // 4 spaces
    
    const newValue = inputEl.value.substring(0, start) + tabChar + inputEl.value.substring(end);
    inputEl.value = newValue;
    inputEl.selectionStart = inputEl.selectionEnd = start + tabChar.length;
    
    // Trigger input event
    inputEl.dispatchEvent(new Event('input'));
  }
}

function handleTyping(e: Event) {
  const inputEl = e.target as HTMLTextAreaElement;
  userInput = inputEl.value;
  
  // Reset any text selection that might have occurred
  inputEl.selectionStart = inputEl.value.length;
  inputEl.selectionEnd = inputEl.value.length;
  
  // Update display - allow continuous typing
  updateDisplay();
  
  // Check if completed correctly
  if (userInput === currentCode) {
    completeTyping();
  }
}

function updateDisplay() {
  const targetEl = document.getElementById("target");
  if (!targetEl) return;
  
  const chars = targetEl.querySelectorAll('.char');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i] as HTMLElement;
    
    if (i < userInput.length) {
      // Character has been typed
      if (userInput[i] === currentCode[i]) {
        char.className = "char typed-correct";
      } else {
        char.className = "char typed-wrong";
      }
    } else if (i === userInput.length) {
      // Current cursor position
      char.className = "char current-char";
    } else {
      // Not yet typed
      char.className = "char";
    }
  }
}

function completeTyping() {
  if (isCompleted) return;
  
  isCompleted = true;
  
  const inputEl = document.getElementById("input") as HTMLTextAreaElement;
  if (inputEl) inputEl.disabled = true;
  
  showCompletionPopup();
}

function showCompletionPopup() {
  const questionsToShow = getQuestionsToShow();
  const isLastQuestion = currentQuestionIndex >= questionsToShow.length - 1;
  
  // Create popup HTML similar to debug game style
  const popupHTML = `
    <div id="completion-popup" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      ">
        <h2 style="color: #4CAF50; margin-bottom: 20px; font-size: 1.5rem;">🎉 Well Done!</h2>
        <p style="margin-bottom: 20px; color: #333;">
          You've successfully completed:<br><strong>${currentQuestion?.title}</strong>
        </p>
        ${isLastQuestion ? `
          <p style="color: #4CAF50; font-weight: bold; margin-bottom: 30px;">All questions completed! 🎊</p>
          <button id="restart-all-btn" style="
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.2s ease;
          ">Restart All</button>
        ` : `
          <p style="margin-bottom: 30px; color: #666; font-size: 0.9em;">
            Press Enter to continue or click the button below
          </p>
          <button id="next-question-btn" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.2s ease;
          ">⏎ Next Question</button>
        `}
      </div>
    </div>
  `;
  
  // Add popup to DOM
  document.body.insertAdjacentHTML('beforeend', popupHTML);
  
  // Add event listeners
  const nextBtn = document.getElementById('next-question-btn');
  const restartBtn = document.getElementById('restart-all-btn');
  const popup = document.getElementById('completion-popup');
  
  // Handle next question button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      document.removeEventListener('keydown', handleEnterKey);
      if (popup) popup.remove();
      goToNextQuestion();
    });
    
    // Add hover effect
    nextBtn.addEventListener('mouseenter', () => {
      nextBtn.style.background = '#45a049';
    });
    nextBtn.addEventListener('mouseleave', () => {
      nextBtn.style.background = '#4CAF50';
    });
  }
  
  // Handle restart button
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      // Preserve max parameter if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const maxParam = urlParams.get('max');
      const restartUrl = maxParam ? `?quiz=1&max=${maxParam}` : "?quiz=1";
      window.location.href = restartUrl;
    });
    
    // Add hover effect
    restartBtn.addEventListener('mouseenter', () => {
      restartBtn.style.background = '#ff5252';
    });
    restartBtn.addEventListener('mouseleave', () => {
      restartBtn.style.background = '#ff6b6b';
    });
  }
  
  // Add Enter key listener for next question
  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isLastQuestion) {
      document.removeEventListener('keydown', handleEnterKey);
      if (popup) popup.remove();
      goToNextQuestion();
    }
  };
  
  if (!isLastQuestion) {
    document.addEventListener('keydown', handleEnterKey);
  }
  
  // Close popup when clicking outside (optional)
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup && !isLastQuestion) {
        document.removeEventListener('keydown', handleEnterKey);
        popup.remove();
      }
    });
  }
}

function goToNextQuestion() {
  const nextQuizNumber = currentQuestionIndex + 2; // Convert to 1-based for URL
  const questionsToShow = getQuestionsToShow();
  
  if (currentQuestionIndex < questionsToShow.length - 1) {
    // Preserve max parameter if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const maxParam = urlParams.get('max');
    const nextUrl = maxParam ? `?quiz=${nextQuizNumber}&max=${maxParam}` : `?quiz=${nextQuizNumber}`;
    window.location.href = nextUrl;
  }
}

function focusInput() {
  const inputEl = document.getElementById("input") as HTMLTextAreaElement;
  if (inputEl && !isCompleted) {
    inputEl.focus();
  }
}

// Export to make this a module and avoid global scope conflicts
export { };

