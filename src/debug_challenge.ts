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
    debug_challenge: {
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
  currentChallenge: null
};

// Function to auto-scroll terminal and center the latest content
function scrollTerminalToCenter(): void {
  const terminalContent = document.querySelector(".terminal-content") as HTMLElement;
  const terminalOutput = document.getElementById("terminal-output") as HTMLElement;
  
  if (!terminalContent || !terminalOutput) return;
  
  // Get the height of the terminal content area and content
  const containerHeight = terminalContent.clientHeight;
  const contentHeight = terminalOutput.scrollHeight;
  const padding = 40; // Extra padding for better visual centering
  
  // Calculate scroll position to center the latest content
  const idealCenter = contentHeight - (containerHeight / 2) + padding;
  const maxScroll = contentHeight - containerHeight + padding;
  const targetScroll = Math.max(0, Math.min(idealCenter, maxScroll));
  
  // Smooth scroll to center position
  terminalContent.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
}

// Function to scroll to the very last line and keep it in center view
function scrollToLastLineCenter(): void {
  const terminalContent = document.querySelector(".terminal-content") as HTMLElement;
  const terminalOutput = document.getElementById("terminal-output") as HTMLElement;
  
  if (!terminalContent || !terminalOutput) return;
  
  // Get all message elements
  const messages = terminalOutput.querySelectorAll<HTMLDivElement>('div');
  if (messages.length === 0) return;
  
  // Get the last message
  const lastMessage = messages[messages.length - 1];
  const containerHeight = terminalContent.clientHeight;
  
  // Calculate position to center the last message
  const messageTop = lastMessage.offsetTop;
  const messageHeight = lastMessage.offsetHeight;
  const centerOffset = (containerHeight / 2) - (messageHeight / 2);
  const targetScroll = Math.max(0, messageTop - centerOffset);
  
  // Smooth scroll to center the last message
  terminalContent.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
}

// Function to add output to terminal and auto-scroll to center
function addToTerminal(content: string): void {
  const terminalOutput = document.getElementById("terminal-output") as HTMLElement;
  if (!terminalOutput) return;
  
  terminalOutput.innerHTML += content;
  
  // Use requestAnimationFrame to ensure DOM is updated before scrolling
  requestAnimationFrame(() => {
    setTimeout(() => {
      scrollToLastLineCenter();
    }, 50); // Small delay to ensure content is rendered
  });
}

// Load challenge data from JSON
async function loadChallenge(): Promise<void> {
  try {
    console.log('Loading challenge data from: ../resources/debug_challenge/debug_challenge.json');
    const response = await fetch('../resources/debug_challenge/debug_challenge.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as QuizData;
    console.log('Challenge data loaded successfully:', data);
    
    // Get the first challenge (can be extended to support multiple challenges)
    debugState.currentChallenge = data.debug_challenge.questions[1];
    
    if (!debugState.currentChallenge) {
      throw new Error('No challenge found at index 1');
    }
    
    // Load the code file
    console.log('Loading code file from:', `../resources/debug_challenge/${debugState.currentChallenge.codepath}`);
    const codeResponse = await fetch(`../resources/debug_challenge/${debugState.currentChallenge.codepath}`);

    if (!codeResponse.ok) {
      throw new Error(`HTTP error loading code file! status: ${codeResponse.status}`);
    }
    
    const codeContent = await codeResponse.text();
    
    // Update the page with challenge data
    updateChallengeInfo(data.debug_challenge, debugState.currentChallenge);
    
    // Initialize Monaco Editor with the loaded code
    await initializeEditor(codeContent);
    
  } catch (error) {
    console.error('Error loading challenge:', error);
    addToTerminal(`<div class="terminal-error">❌ Error loading challenge: ${(error as Error).message}</div>`);
  }
}

// Update the challenge information in the UI
function updateChallengeInfo(quiz: QuizData['debug_challenge'], challenge: DebugChallengeQuestion): void {
  // Update description
  const challengeInfoElement = document.querySelector('.challenge-info p') as HTMLParagraphElement;
  if (challengeInfoElement) {
    challengeInfoElement.innerHTML = challenge.description;
  }
  
  // Update expected behavior examples
  const examplesList = document.querySelector('.challenge-requirements ul') as HTMLUListElement;
  if (examplesList) {
    examplesList.innerHTML = '';
    
    // Show first few test cases as examples
    challenge.testcases.slice(0, 4).forEach(testcase => {
      const li = document.createElement("li");
      const inputDisplay = Array.isArray(testcase.input) 
        ? `[${testcase.input.join(',')}]` 
        : `"${testcase.input}"`;
      li.innerHTML = `<code>${challenge.functionName}(${inputDisplay})</code> → <strong>${testcase.expected}</strong>`;
      examplesList.appendChild(li);
    });
  }
  
  // Update hints
  if (challenge.hints && challenge.hints.length > 0) {
    const hintElement = document.querySelector('.hint-section p') as HTMLParagraphElement;
    if (hintElement) {
      hintElement.textContent = challenge.hints.join(' ');
    }
  }
  
  // Update test count
  const totalTests = challenge.testcases.length;
  const testsPassedElement = document.getElementById('tests-passed') as HTMLElement;
  const successRateElement = document.getElementById('success-rate') as HTMLElement;
  
  if (testsPassedElement) testsPassedElement.textContent = `0/${totalTests}`;
  if (successRateElement) successRateElement.textContent = '0%';
}

// Initialize Monaco Editor with loaded code
async function initializeEditor(codeContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use the global require function for Monaco Editor
    const requireConfig = (window as any).require;
    
    if (typeof requireConfig?.config === 'function') {
      requireConfig.config({
        paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs" },
      });
      
      requireConfig(["vs/editor/editor.main"], function () {
        if (!debugState.currentChallenge) {
          reject(new Error('No current challenge available'));
          return;
        }
        
        const editorContainer = document.getElementById("editor") as HTMLElement;
        if (!editorContainer) {
          reject(new Error('Editor container not found'));
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
        debugState.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
          // Prevent default browser save dialog
          runCode('keyboard');
          
          // Visual feedback
          const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
          if (submitBtn) {
            submitBtn.style.transform = "scale(0.95)";
            setTimeout(() => {
              submitBtn.style.transform = "";
            }, 150);
          }
        });

        // Add custom run command to Monaco Editor
        debugState.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
          runCode('keyboard');
        });

        // Start timer when user starts editing
        debugState.editor.onDidChangeModelContent(() => {
          if (!debugState.startTime) {
            startTimer();
          }
        });
        
        resolve();
      });
    } else {
      reject(new Error('Monaco Editor require function not available'));
    }
  });
}

function startTimer(): void {
  debugState.startTime = Date.now();
  debugState.timerInterval = setInterval(updateTimer, 1000);
  updateStatus("In Progress", "running");
}

function updateTimer(): void {
  if (!debugState.startTime) return;

  const elapsed = Math.floor((Date.now() - debugState.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `⏱️ ${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const timerElement = document.getElementById("timer") as HTMLElement;
  if (timerElement) {
    timerElement.textContent = timeString;

    // Change timer color based on time
    timerElement.className = "timer";
    if (elapsed > 300) {
      // 5 minutes
      timerElement.classList.add("danger");
    } else if (elapsed > 180) {
      // 3 minutes
      timerElement.classList.add("warning");
    }
  }
}

function updateStatus(text: string, type: string = "ready"): void {
  const statusTextElement = document.getElementById("status-text") as HTMLElement;
  const statusDotElement = document.getElementById("status-dot") as HTMLElement;
  
  if (statusTextElement) statusTextElement.textContent = text;
  if (statusDotElement) statusDotElement.className = `status-dot ${type}`;
}

function runCode(triggeredBy: string = 'button'): void {
  if (!debugState.editor || !debugState.currentChallenge) {
    addToTerminal(`<div class="terminal-error">❌ Error: Editor or challenge not ready</div>`);
    return;
  }
  
  const code = debugState.editor.getValue();
  const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;

  // Disable submit button temporarily
  if (submitBtn) submitBtn.disabled = true;
  updateStatus("Running...", "running");

  // Add running message with timestamp
  const timestamp = new Date().toLocaleTimeString();
  addToTerminal(
    `\n<div class="terminal-log">[${timestamp}] Running automated tests...</div>`
  );

  setTimeout(() => {
    try {
      // Check if challenge is loaded
      if (!debugState.currentChallenge) {
        addToTerminal(`<div class="terminal-error">❌ Error: Challenge not loaded</div>`);
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
          `<div class="terminal-error">❌ Syntax Error: ${(error as Error).message}</div>`
        );
        updateStatus("Syntax Error", "error");
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
            `<div class="terminal-error">   Runtime Error: ${(error as Error).message}</div>`
          );
        }
      });

      addToTerminal(
        `<div class="terminal-log">═══════════════════════════════════════════════</div>`
      );

      // Show final results
      const percentage = Math.round((passedTests / totalTests) * 100);

      // Update progress indicators
      const testsPassedElement = document.getElementById("tests-passed") as HTMLElement;
      const successRateElement = document.getElementById("success-rate") as HTMLElement;
      
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
        updateStatus("All Tests Passed", "ready");
        const testStatusElement = document.getElementById("test-status") as HTMLElement;
        if (testStatusElement) testStatusElement.textContent = "Completed ✅";
      } else {
        addToTerminal(
          `<div class="terminal-error">⚠️  ${passedTests}/${totalTests} tests passed (${percentage}%)</div>`
        );
        addToTerminal(
          `<div class="terminal-hint">💡 Hint: ${debugState.currentChallenge.hints ? debugState.currentChallenge.hints[0] : 'Check your function logic'}</div>`
        );
        updateStatus(`${passedTests}/${totalTests} Tests Passed`, "error");
        const testStatusElement = document.getElementById("test-status") as HTMLElement;
        if (testStatusElement) testStatusElement.textContent = "Failed ❌";
      }
    } catch (error) {
      addToTerminal(
        `<div class="terminal-error">❌ Unexpected Error: ${(error as Error).message}</div>`
      );
      updateStatus("Error", "error");
    }

    // Re-enable submit button
    if (submitBtn) submitBtn.disabled = false;
  }, 500);
}

function clearTerminal(): void {
  const terminalOutput = document.getElementById("terminal-output") as HTMLElement;
  if (terminalOutput) {
    terminalOutput.innerHTML = `
      <div class="terminal-log">Terminal cleared.</div>
    `;
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollToLastLineCenter();
      }, 50);
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

// Keyboard shortcuts
document.addEventListener("keydown", function (e: KeyboardEvent): void {
  // Ctrl/Cmd + Enter to run code
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runCode('keyboard');
  }

  // Ctrl/Cmd + S to save and run code automatically
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    // Prevent browser's default save dialog
    runCode('keyboard');
    
    // Optional: Show visual feedback that auto-run was triggered
    const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.style.transform = "scale(0.95)";
      setTimeout(() => {
        submitBtn.style.transform = "";
      }, 150);
    }
  }

  // Ctrl/Cmd + Shift + C to clear terminal
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
    e.preventDefault();
    clearTerminal();
  }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function(): void {
  // Initialize status
  updateStatus("Loading...", "running");
  
  // Load challenge data
  loadChallenge().then(() => {
    updateStatus("Ready", "ready");
    const testStatusElement = document.getElementById("test-status") as HTMLElement;
    if (testStatusElement) testStatusElement.textContent = "Not Started";
  }).catch((error) => {
    updateStatus("Error", "error");
    addToTerminal(`<div class="terminal-error">❌ Failed to load challenge: ${(error as Error).message}</div>`);
  });
});

