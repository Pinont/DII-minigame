import { getQuiz } from "./utils/quiz.js";

// Game state
let currentQuestion: any = null;
let currentCode = "";
let userInput = "";
let allQuestions: any[] = [];
let currentQuestionIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
    currentQuestionIndex = getQuiz();
    console.log("Starting quiz at index:", currentQuestionIndex);
    await loadQuestions();
    setupInputHandler();
    setupSubmitHandler();
});

async function loadQuestions() {
  try {
      const response = await fetch('../resources/typing_code/questions.json');
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      allQuestions = await response.json();
      displayQuestion(allQuestions[currentQuestionIndex]);
  } catch (error) {
      console.error('Error loading questions:', error);
  }
}

async function displayQuestion(question: any) {
  const titleEl = document.getElementById("title");
  const targetEl = document.getElementById("target");
  const inputEl = document.getElementById("input") as HTMLTextAreaElement;
  
  if (titleEl && targetEl) {
      currentQuestion = question;
      titleEl.textContent = `Question ${currentQuestionIndex + 1}/${allQuestions.length}: ${question.title}`;
      
      const codeResponse = await fetch(`../resources/typing_code/${question.codePath}`);
      currentCode = await codeResponse.text();
      
      // Reset user input
      userInput = "";
      if (inputEl) {
          inputEl.value = "";
          inputEl.disabled = false;
      }
      
      // Render the code with highlighting
      renderCodeWithHighlight(targetEl, currentCode, 0);
  }
}

function renderCodeWithHighlight(targetEl: HTMLElement, code: string, typedLength: number, errorIndex: number = -1) {
    targetEl.innerHTML = "";
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const span = document.createElement("span");
        
        if (i < typedLength) {
            // Correctly typed characters - glowing green effect
            if (i === errorIndex) {
                span.className = "char typed-wrong";
            } else {
                span.className = "char typed-correct";
            }
        } else if (i === typedLength) {
            // Current cursor position
            span.className = "char current-char";
        } else {
            // Not yet typed
            span.className = "char";
        }
        
        // Handle special characters for display
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

function setupInputHandler() {
    const inputEl = document.getElementById("input") as HTMLTextAreaElement;
    const targetEl = document.getElementById("target");
    
    if (!inputEl || !targetEl) return;
    
    inputEl.addEventListener("input", (e) => {
        userInput = inputEl.value;
        const typedLength = userInput.length;
        
        // Find the first incorrect character
        let errorIndex = -1;
        let correctUpTo = 0;
        
        for (let i = 0; i < Math.min(userInput.length, currentCode.length); i++) {
            if (userInput[i] === currentCode[i]) {
                correctUpTo = i + 1;
            } else {
                errorIndex = i;
                break;
            }
        }
        
        // Check if we're typing beyond the code length
        if (userInput.length > currentCode.length) {
            errorIndex = currentCode.length;
        }
        
        if (errorIndex === -1) {
            // All typed characters are correct
            renderCodeWithHighlight(targetEl, currentCode, typedLength);
            
            // Check if completed
            if (userInput === currentCode) {
                showCompletionMessage();
            }
        } else {
            // There's an error - highlight up to the error point
            renderCodeWithHighlight(targetEl, currentCode, correctUpTo, errorIndex);
            
            // Optional: Add visual feedback to input field
            inputEl.style.borderColor = "#f44336";
            setTimeout(() => {
                inputEl.style.borderColor = "";
            }, 500);
        }
    });
    
    // Handle tab key for proper indentation
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = inputEl.selectionStart ?? 0;
            const end = inputEl.selectionEnd ?? 0;
            const spaces = "    "; // 4 spaces
            
            inputEl.value = inputEl.value.substring(0, start) + spaces + inputEl.value.substring(end);
            inputEl.selectionStart = inputEl.selectionEnd = start + spaces.length;
            
            // Trigger input event to update highlighting
            inputEl.dispatchEvent(new Event('input'));
        }
    });
}

function showCompletionMessage() {
    const titleEl = document.getElementById("title");
    if (titleEl) {
        titleEl.innerHTML = `<span style="color: #4CAF50;">✅ Completed: ${currentQuestion.title}</span>`;
    }
}

function setupSubmitHandler() {
    const submitBtn = document.getElementById("submit") as HTMLButtonElement;
    if (!submitBtn) return;
    
    submitBtn.addEventListener("click", () => {
        // Check if the current question is completed
        if (userInput === currentCode) {
            // Move to next question
            goToNextQuestion();
        } else {
            // Show error message if not completed
            showIncompleteMessage();
        }
    });
}

function goToNextQuestion() {
    if (currentQuestionIndex < allQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(allQuestions[currentQuestionIndex]);
    } else {
        // All questions completed
        showAllQuestionsCompleted();
    }
}

function showIncompleteMessage() {
    const titleEl = document.getElementById("title");
    if (titleEl) {
        const originalTitle = currentQuestion.title;
        titleEl.innerHTML = `<span style="color: #f44336;">❌ Please complete the code first!</span>`;
        
        // Restore original title after 2 seconds
        setTimeout(() => {
            titleEl.textContent = originalTitle;
        }, 2000);
    }
}

function showAllQuestionsCompleted() {
    const titleEl = document.getElementById("title");
    const targetEl = document.getElementById("target");
    const inputEl = document.getElementById("input") as HTMLTextAreaElement;
    const submitBtn = document.getElementById("submit") as HTMLButtonElement;
    
    if (titleEl) {
        titleEl.innerHTML = `<span style="color: #4CAF50;">🎉 All Questions Completed! Great job!</span>`;
    }
    
    if (targetEl) {
        targetEl.innerHTML = `<div style="text-align: center; color: #4CAF50; font-size: 1.5rem;">
            <p>🎊 Congratulations! 🎊</p>
            <p>You have completed all ${allQuestions.length} coding challenges!</p>
        </div>`;
    }
    
    if (inputEl) {
        inputEl.disabled = true;
        inputEl.placeholder = "All challenges completed!";
    }
    
    if (submitBtn) {
        submitBtn.textContent = "Restart";
        submitBtn.onclick = () => {
            location.reload();
        };
    }
}
  