const gameBody = document.getElementById("game-body");

// Function to load and display quiz
async function loadQuiz() {
    try {
        const response = await fetch('../resource/debug_challenge.json');
        const data = await response.json();
        const quiz = data.quiz;
        
        displayQuiz(quiz);
    } catch (error) {
        console.error('Error loading quiz:', error);
        if (window.showErrorScreen) {
            showErrorScreen();
        } else {
            gameBody.innerHTML = "<p>Error loading quiz. Please try again.</p>";
        }
    }
}

// Global function to show error screen
window.showErrorScreen = function() {
    const gameBody = document.getElementById('game-body');
    const template = document.getElementById('error-template');
    gameBody.innerHTML = template.innerHTML;
};

// Global function to start quiz (will be called from welcome screen)
window.startQuiz = function() {
    // This will be handled by the existing loadQuiz function in app.js
    if (window.loadQuiz) {
        loadQuiz();
    }
};

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Function to display quiz
function displayQuiz(quiz) {
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    
    function showQuestion(index) {
        const question = quiz.questions[index];
        
        const questionHTML = `
            <div class="quiz-container">
                <h2>${quiz.title}</h2>
                <p>${quiz.description}</p>
                <div class="question-progress">
                    Question ${index + 1} of ${quiz.questions.length}
                </div>
                <div class="question">
                    <h3>${question.question}</h3>
                    <div class="options">
                        ${question.options.map((option, optionIndex) => `
                            <button class="option-btn" onclick="selectAnswer(${optionIndex})" data-option="${optionIndex}">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="navigation">
                    <button id="next-btn" onclick="nextQuestion()" disabled>Next</button>
                </div>
            </div>
        `;
        
        gameBody.innerHTML = questionHTML;
    }
    
    // Make functions global so they can be called from HTML
    window.selectAnswer = function(selectedOption) {
        const question = quiz.questions[currentQuestionIndex];
        userAnswers[currentQuestionIndex] = selectedOption;
        
        // Remove previous selection styling
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection styling
        document.querySelector(`[data-option="${selectedOption}"]`).classList.add('selected');
        
        // Enable next button
        document.getElementById('next-btn').disabled = false;
    };
    
    window.nextQuestion = function() {
        const question = quiz.questions[currentQuestionIndex];
        const selectedAnswer = userAnswers[currentQuestionIndex];
        
        if (selectedAnswer === question.correctAnswer) {
            score++;
        }
        
        currentQuestionIndex++;
        
        if (currentQuestionIndex < quiz.questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            showResults();
        }
    };
    
    function showResults() {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        
        let resultsHTML = `
            <div class="quiz-container">
                <h2>Quiz Complete!</h2>
                <div class="score">
                    <h3>Your Score: ${score}/${quiz.questions.length} (${percentage}%)</h3>
                </div>
                <div class="results-detail">
        `;
        
        quiz.questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            resultsHTML += `
                <div class="question-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <h4>Question ${index + 1}: ${question.question}</h4>
                    <p><strong>Your answer:</strong> ${question.options[userAnswer]}</p>
                    <p><strong>Correct answer:</strong> ${question.options[question.correctAnswer]}</p>
                    <p><strong>Explanation:</strong> ${question.explanation}</p>
                </div>
            `;
        });
        
        resultsHTML += `
            </div>
                <button onclick="restartQuiz()">Restart Quiz</button>
            </div>
        `;
        
        gameBody.innerHTML = resultsHTML;
    }
    
    window.restartQuiz = function() {
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        showQuestion(0);
    };
    
    // Start the quiz
    showQuestion(0);
}

// Global function to show welcome screen
window.showWelcomeScreen = function() {
    const gameBody = document.getElementById('game-body');
    const template = document.getElementById('welcome-template');
    gameBody.innerHTML = template.innerHTML;
};

// Load welcome screen when page loads, instead of immediately loading quiz
document.addEventListener('DOMContentLoaded', function() {
  // Add some animation to the header
  const header = document.querySelector(".header");
  header.style.opacity = "0";
  header.style.transform = "translateY(-20px)";

  setTimeout(() => {
    header.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    header.style.opacity = "1";
    header.style.transform = "translateY(0)";
  }, 100);

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const nextBtn = document.getElementById("next-btn");
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.click();
      }
    }

    // Number keys for option selection
    if (e.key >= "1" && e.key <= "4") {
      const optionIndex = parseInt(e.key) - 1;
      const optionBtns = document.querySelectorAll(".option-btn");
      if (optionBtns[optionIndex]) {
        optionBtns[optionIndex].click();
      }
    }
  });

  // Show welcome screen first
  if (window.showWelcomeScreen) {
    showWelcomeScreen();
  } else {
    // Fallback to loading quiz directly
    loadQuiz();
  }
});