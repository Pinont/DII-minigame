import { getQuiz } from "./utils/quiz.js";

let quizNumber = 0;

// Configuration: Limit how many questions to display (default: all questions)
let maxQuestionsToDisplay: number | null = null;

// Type declarations for module="None" compatibility
interface DebugChallengeQuestion {
  id: number;
  question: string;
  description: string;
  functionName: string;
  codepath: string;
  language: string;
  hints?: string[];
  testcases: Array<{
    description: string;
    input: any;
    expected: any;
  }>;
}

interface DebugChallengeState {
  editor: any;
  startTime: number | null;
  timerInterval: any;
  currentChallenge: DebugChallengeQuestion | null;
}

interface QuizData {
  questions: {
    title: string;
    description: string;
    questions: DebugChallengeQuestion[];
  };
}

// Debug Challenge State
const debugState: DebugChallengeState = {
  editor: null,
  startTime: null,
  timerInterval: null,
  currentChallenge: null,
};

let questionsData: QuizData | null = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Load questions data first
  await loadQuestionsData();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const maxParam = urlParams.get('max');
  
  // Set maxQuestionsToDisplay from URL parameter or default to all questions
  if (maxParam && !isNaN(parseInt(maxParam)) && parseInt(maxParam) > 0) {
    maxQuestionsToDisplay = parseInt(maxParam);
  } else if (maxQuestionsToDisplay === null) {
    maxQuestionsToDisplay = questionsData?.questions.questions.length || 0;
  }
  
  // get param quiz=?
  quizNumber = getQuiz();
  if (quizNumber < 0 || quizNumber >= getQuestions().length) {
    // Preserve max parameter if it exists when redirecting
    const urlParams = new URLSearchParams(window.location.search);
    const maxParam = urlParams.get('max');
    const redirectUrl = maxParam ? `?quiz=1&max=${maxParam}` : "?quiz=1";
    window.location.href = redirectUrl;
  }

  // Load challenge data
  if (questionsData && questionsData.questions.questions.length > 0) {
    // Get the challenge from filtered questions
    const filteredQuestions = getQuestions();
    if (quizNumber < filteredQuestions.length) {
      debugState.currentChallenge = filteredQuestions[quizNumber];

      if (debugState.currentChallenge) {
        try {
          // Load the code file
          console.log(
            "Loading code file from:",
            `../resources/debug_challenge/${debugState.currentChallenge.codepath}`
          );
          const codeResponse = await fetch(
            `../resources/debug_challenge/${debugState.currentChallenge.codepath}`
          );

          if (!codeResponse.ok) {
            throw new Error(
              `HTTP error loading code file! status: ${codeResponse.status}`
            );
          }

          const codeContent = await codeResponse.text();

          // Update the page with challenge data
          updateChallengeInfo(
            questionsData.questions,
            debugState.currentChallenge
          );

          // Initialize Monaco Editor with the loaded code
          await initializeEditor(codeContent);

          const testStatusElement = document.getElementById(
            "test-status"
          ) as HTMLElement;
          if (testStatusElement) testStatusElement.textContent = "Not Started";
        } catch (error) {
          addToTerminal(
            `<div class="terminal-error">❌ Failed to load challenge: ${
              (error as Error).message
            }</div>`
          );
        }
      }
    }
  }
});

function getQuestions(): any[] {
  if (!questionsData || !questionsData.questions || !questionsData.questions.questions) {
    return [];
  }
  const allQuestions = Array.isArray(questionsData.questions.questions)
    ? questionsData.questions.questions
    : [];
  
  // Apply question limit if set
  if (maxQuestionsToDisplay !== null && maxQuestionsToDisplay > 0) {
    return allQuestions.slice(0, maxQuestionsToDisplay);
  }
  
  return allQuestions;
}

// Function to auto-scroll terminal and center the latest content
function scrollTerminalToCenter(): void {
  const terminalContent = document.querySelector(
    ".terminal-content"
  ) as HTMLElement;
  const terminalOutput = document.getElementById(
    "terminal-output"
  ) as HTMLElement;

  if (!terminalContent || !terminalOutput) return;

  // Get the height of the terminal content area and content
  const containerHeight = terminalContent.clientHeight;
  const contentHeight = terminalOutput.scrollHeight;
  const padding = 40; // Extra padding for better visual centering

  // Calculate scroll position to center the latest content
  const idealCenter = contentHeight - containerHeight / 2 + padding;
  const maxScroll = contentHeight - containerHeight + padding;
  const targetScroll = Math.max(0, Math.min(idealCenter, maxScroll));

  // Smooth scroll to center position
  terminalContent.scrollTo({
    top: targetScroll,
    behavior: "smooth",
  });
}

// Function to scroll to the very last line and keep it in center view
function scrollToLastLineCenter(): void {
  const terminalContent = document.querySelector(
    ".terminal-content"
  ) as HTMLElement;
  const terminalOutput = document.getElementById(
    "terminal-output"
  ) as HTMLElement;

  if (!terminalContent || !terminalOutput) return;

  // Get all message elements
  const messages = terminalOutput.querySelectorAll<HTMLDivElement>("div");
  if (messages.length === 0) return;

  // Get the last message
  const lastMessage = messages[messages.length - 1];
  const containerHeight = terminalContent.clientHeight;
  const contentHeight = terminalOutput.scrollHeight;

  // Calculate position to show the last message with extra bottom padding
  const messageTop = lastMessage.offsetTop;
  const messageHeight = lastMessage.offsetHeight;
  const extraPadding = 50; // Extra padding to ensure full message is visible
  
  // Try to center, but ensure the last message is fully visible
  const centerOffset = containerHeight / 2 - messageHeight / 2;
  const targetScroll = Math.max(0, messageTop - centerOffset);
  
  // Make sure we don't scroll past the content, and add padding for the last message
  const maxScroll = Math.max(0, contentHeight - containerHeight + extraPadding);
  const finalScroll = Math.min(targetScroll, maxScroll);

  // Smooth scroll to show the complete last message
  terminalContent.scrollTo({
    top: finalScroll,
    behavior: "smooth",
  });
}

// Function to add output to terminal and auto-scroll to center
function addToTerminal(content: string): void {
  const terminalOutput = document.getElementById(
    "terminal-output"
  ) as HTMLElement;
  if (!terminalOutput) return;

  terminalOutput.innerHTML += content;

  // Use requestAnimationFrame to ensure DOM is updated before scrolling
  requestAnimationFrame(() => {
    setTimeout(() => {
      scrollToLastLineCenter();
      // Double-check scrolling after a longer delay to ensure content is fully rendered
      setTimeout(() => {
        scrollToLastLineCenter();
      }, 100);
    }, 50); // Small delay to ensure content is rendered
  });
}

// Load challenge data from JSON
async function loadQuestionsData() {
  try {
    const response = await fetch("../resources/debug_challenge/debug_challenge.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    questionsData = await response.json();
    console.log("Questions data loaded successfully");
  } catch (error) {
    console.error("Failed to load questions data:", error);
    questionsData = {
      questions: {
        title: "",
        description: "",
        questions: [],
      },
    }; // Fallback
  }
}

// Update the challenge information in the UI
function updateChallengeInfo(
  quiz: QuizData["questions"],
  challenge: DebugChallengeQuestion
): void {
  // Update title with Question x/max format
  const titleElement = document.getElementById("title") as HTMLElement;
  if (titleElement) {
    const totalQuestions = getQuestions().length;
    const currentQuestionNumber = quizNumber + 1;
    titleElement.textContent = `Question ${currentQuestionNumber}/${totalQuestions}: ${challenge.question}`;
  }

  // Update description
  const challengeInfoElement = document.querySelector(
    ".challenge-info p"
  ) as HTMLParagraphElement;
  if (challengeInfoElement) {
    challengeInfoElement.innerHTML = challenge.description;
  }

  // Update expected behavior examples
  const examplesList = document.querySelector(
    ".challenge-requirements ul"
  ) as HTMLUListElement;
  if (examplesList) {
    examplesList.innerHTML = "";

    // Show first few test cases as examples
    challenge.testcases.slice(0, 4).forEach((testcase) => {
      const li = document.createElement("li");
      const inputDisplay = Array.isArray(testcase.input)
        ? `[${testcase.input.join(",")}]`
        : `"${testcase.input}"`;
      li.innerHTML = `<code>${inputDisplay}</code> → <strong>${testcase.expected}</strong>`;
      examplesList.appendChild(li);
    });
  }

  // Update hints
  if (challenge.hints && challenge.hints.length > 0) {
    const hintElement = document.querySelector(
      ".hint-section p"
    ) as HTMLParagraphElement;
    if (hintElement) {
      hintElement.textContent = challenge.hints.join(" ");
    }
  }

  // Update test count
  const totalTests = challenge.testcases.length;
  const testsPassedElement = document.getElementById(
    "tests-passed"
  ) as HTMLElement;
  const successRateElement = document.getElementById(
    "success-rate"
  ) as HTMLElement;

  if (testsPassedElement) testsPassedElement.textContent = `0/${totalTests}`;
  if (successRateElement) successRateElement.textContent = "0%";
}

// Initialize Monaco Editor with loaded code
async function initializeEditor(codeContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use the global require function for Monaco Editor
    const requireConfig = (window as any).require;

    if (typeof requireConfig?.config === "function") {
      requireConfig.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs",
        },
      });

      requireConfig(["vs/editor/editor.main"], function () {
        if (!debugState.currentChallenge) {
          reject(new Error("No current challenge available"));
          return;
        }

        const editorContainer = document.getElementById(
          "editor"
        ) as HTMLElement;
        if (!editorContainer) {
          reject(new Error("Editor container not found"));
          return;
        }

        debugState.editor = monaco.editor.create(editorContainer, {
          value: codeContent,
          language: debugState.currentChallenge.language,
          theme: "vs-dark",
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
        });

        // Add custom save command to Monaco Editor
        debugState.editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
          function () {
            // Prevent default browser save dialog
            runCode();

            // Visual feedback
            const submitBtn = document.getElementById(
              "submit-btn"
            ) as HTMLButtonElement;
            if (submitBtn) {
              submitBtn.style.transform = "scale(0.95)";
              setTimeout(() => {
                submitBtn.style.transform = "";
              }, 150);
            }
          }
        );

        // Add custom run command to Monaco Editor
        debugState.editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
          function () {
            runCode();
          }
        );

        resolve();
      });
    } else {
      reject(new Error("Monaco Editor require function not available"));
    }
  });
}

async function runCode(): Promise<void> {
  await clearTerminal();
  if (!debugState.editor || !debugState.currentChallenge) {
    addToTerminal(
      `<div class="terminal-error">❌ Error: Editor or challenge not ready</div>`
    );
    return;
  }

  const code = debugState.editor.getValue();
  const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;

  // Disable submit button temporarily
  if (submitBtn) submitBtn.disabled = true;

  // Add running message with timestamp
  const timestamp = new Date().toLocaleTimeString();
  addToTerminal(
    `\n<div class="terminal-log">[${timestamp}] Running automated tests...</div>`
  );

  setTimeout(() => {
    try {
      // Check if challenge is loaded
      if (!debugState.currentChallenge) {
        addToTerminal(
          `<div class="terminal-error">❌ Error: Challenge not loaded</div>`
        );
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      // Use test cases from the loaded challenge
      const testCases = debugState.currentChallenge.testcases;

      // Execute the user's code in a safe environment
      let targetFunction: Function;
      const functionName = debugState.currentChallenge.functionName;

      try {
        // Create a completely isolated execution environment
        // This prevents variable redeclaration errors on multiple runs
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const iframeWindow = iframe.contentWindow as Window;

        // Execute code in iframe context
        iframeWindow.eval(code);
        targetFunction = (iframeWindow as any)[functionName] as Function;

        // Clean up iframe
        document.body.removeChild(iframe);

        // Check if target function exists
        if (typeof targetFunction !== "function") {
          throw new Error(
            `${functionName} function not found or not properly defined`
          );
        }
      } catch (error) {
        addToTerminal(
          `<div class="terminal-error">❌ Syntax Error: ${
            (error as Error).message
          }</div>`
        );
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      // Run test cases
      let passedTests = 0;
      const totalTests = testCases.length;

      addToTerminal(
        `<div class="terminal-log">🧪 Running ${totalTests} test cases...</div>`
      );
      addToTerminal(
        `<div class="terminal-log">═══════════════════════════════════════════════</div>`
      );

      testCases.forEach((testCase, index) => {
        try {
          const result = targetFunction(testCase.input);
          const passed = result === testCase.expected;

          if (passed) {
            passedTests++;
            addToTerminal(
              `<div class="terminal-success">✅ Test ${index + 1}: ${
                testCase.description
              }</div>`
            );
            const inputDisplay = Array.isArray(testCase.input)
              ? `[${testCase.input.join(", ")}]`
              : `"${testCase.input}"`;
            addToTerminal(
              `<div class="terminal-log">   Input: ${inputDisplay}</div>`
            );
            addToTerminal(
              `<div class="terminal-log">   Expected: ${testCase.expected}, Got: ${result}</div>`
            );
          } else {
            addToTerminal(
              `<div class="terminal-error">❌ Test ${index + 1}: ${
                testCase.description
              }</div>`
            );
            const inputDisplay = Array.isArray(testCase.input)
              ? `[${testCase.input.join(", ")}]`
              : `"${testCase.input}"`;
            addToTerminal(
              `<div class="terminal-log">   Input: ${inputDisplay}</div>`
            );
            addToTerminal(
              `<div class="terminal-log">   Expected: ${testCase.expected}, Got: ${result}</div>`
            );
          }
        } catch (error) {
          addToTerminal(
            `<div class="terminal-error">❌ Test ${index + 1}: ${
              testCase.description
            }</div>`
          );
          addToTerminal(
            `<div class="terminal-error">   Runtime Error: ${
              (error as Error).message
            }</div>`
          );
        }
      });

      addToTerminal(
        `<div class="terminal-log">═══════════════════════════════════════════════</div>`
      );

      // Show final results
      const percentage = Math.round((passedTests / totalTests) * 100);

      // Update progress indicators
      const testsPassedElement = document.getElementById(
        "tests-passed"
      ) as HTMLElement;
      const successRateElement = document.getElementById(
        "success-rate"
      ) as HTMLElement;

      if (testsPassedElement) {
        testsPassedElement.textContent = `${passedTests}/${totalTests}`;
      }
      if (successRateElement) {
        successRateElement.textContent = `${percentage}%`;
      }

      if (passedTests === totalTests) {
        addToTerminal(
          `<div class="terminal-success">🎉 All tests passed! (${passedTests}/${totalTests}) - ${percentage}%</div>`
        );
        addToTerminal(
          `<div class="terminal-success">✅ Challenge completed successfully!</div>`
        );
        const testStatusElement = document.getElementById(
          "test-status"
        ) as HTMLElement;
        if (testStatusElement) testStatusElement.textContent = "Completed ✅";
        
        // Show popup and move to next question - increased delay to ensure terminal scrolling completes
        setTimeout(() => {
          showNextQuestionPopup();
        }, 1000); // Wait 1000 milliseconds before showing popup

      } else {
        addToTerminal(
          `<div class="terminal-error">⚠️  ${passedTests}/${totalTests} tests passed (${percentage}%)</div>`
        );
        addToTerminal(
          `<div class="terminal-hint">💡 Hint: ${
            debugState.currentChallenge.hints
              ? debugState.currentChallenge.hints[0]
              : "Check your function logic"
          }</div>`
        );
        const testStatusElement = document.getElementById(
          "test-status"
        ) as HTMLElement;
        if (testStatusElement) testStatusElement.textContent = "Failed ❌";
      }
    } catch (error) {
      addToTerminal(
        `<div class="terminal-error">❌ Unexpected Error: ${
          (error as Error).message
        }</div>`
      );
    }
    addToTerminal(`<div class="terminal-log"><br></div>`);

    // Re-enable submit button
    if (submitBtn) submitBtn.disabled = false;
  }, 500);
}

async function clearTerminal(): Promise<void> {
  const terminalOutput = document.getElementById(
    "terminal-output"
  ) as HTMLElement;
  if (terminalOutput) {
    terminalOutput.innerHTML = `
      <div class="terminal-log"></div>
    `;
    requestAnimationFrame(() => {
      scrollToLastLineCenter();
    });
  }
}

function resetChallenge(): void {
  if (
    confirm(
      "Are you sure you want to reset the challenge? This will clear your progress."
    )
  ) {
    location.reload();
  }
}

// Function to show popup and navigate to next question
function showNextQuestionPopup(): void {
  const nextQuizNumber = quizNumber + 2;

  const maxQuiz = getQuestions().length;

  // Check if there are more questions available (use filtered questions length)
  if (nextQuizNumber <= maxQuiz) {
    // Create popup HTML
    const popupHTML = `
      <div id="next-question-popup" style="
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
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="color: #28a745; margin-bottom: 20px;">🎉 Congratulations!</h2>
          <p style="margin-bottom: 20px; color: #333;">
            You've successfully completed this question!
          </p>
          <div>
            <button id="next-question-btn" style="
              background: #28a745;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              margin-right: 10px;
              font-size: 16px;
              transition: background 0.2s ease;
            ">⏎ Next Question</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add event listeners
    const nextBtn = document.getElementById('next-question-btn');
    const popup = document.getElementById('next-question-popup');
    
    // Function to navigate to next question
    const goToNextQuestion = () => {
      document.removeEventListener('keydown', handleEnterKey);
      // Preserve max parameter if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const maxParam = urlParams.get('max');
      const nextUrl = maxParam ? `?quiz=${nextQuizNumber}&max=${maxParam}` : `?quiz=${nextQuizNumber}`;
      window.location.href = nextUrl;
    };
    
    // Add Enter key listener
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        goToNextQuestion();
      }
    };
    
    document.addEventListener('keydown', handleEnterKey);
    
    if (nextBtn) {
      nextBtn.addEventListener('click', goToNextQuestion);
      
      // Add hover effect
      nextBtn.addEventListener('mouseenter', () => {
        nextBtn.style.background = '#218838';
      });
      nextBtn.addEventListener('mouseleave', () => {
        nextBtn.style.background = '#28a745';
      });
    }
    
    // Close popup when clicking outside
    if (popup) {
      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          document.removeEventListener('keydown', handleEnterKey);
          popup.remove();
        }
      });
    }
  } else {
    // No more questions available
    const completionPopupHTML = `
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
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        ">
          <h2 style="color: #ffc107; margin-bottom: 20px;">🏆 All Challenges Complete!</h2>
          <p style="margin-bottom: 20px; color: #333;">
            Congratulations! You've completed all available debug challenges.
          </p>
          <p style="margin-bottom: 30px; color: #666;">
            You're now a debugging master!
          </p>
          <button id="restart-btn" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          ">Restart from Beginning</button>
        </div>
      </div>
    `;
    
    // Add completion popup to DOM
    document.body.insertAdjacentHTML('beforeend', completionPopupHTML);
    
    // Add event listener for restart
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        // Preserve max parameter if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const maxParam = urlParams.get('max');
        const restartUrl = maxParam ? `?quiz=1&max=${maxParam}` : '?quiz=1';
        window.location.href = restartUrl;
      });
    }
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e: KeyboardEvent): void {

  // Ctrl/Cmd + S to save and run code automatically
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    // Prevent browser's default save dialog
    runCode();

    // Optional: Show visual feedback that auto-run was triggered
    const submitBtn = document.getElementById(
      "submit-btn"
    ) as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.style.transform = "scale(0.95)";
      setTimeout(() => {
        submitBtn.style.transform = "";
      }, 150);
    }
  }
});



// Expose functions to global scope for HTML access
(window as any).runCode = runCode;
(window as any).clearTerminal = clearTerminal;
(window as any).resetChallenge = resetChallenge;
(window as any).showNextQuestionPopup = showNextQuestionPopup;