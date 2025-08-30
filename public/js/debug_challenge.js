let editor;
let startTime = null;
let timerInterval = null;
let currentChallenge = null;

// Function to auto-scroll terminal and center the latest content
function scrollTerminalToCenter() {
  const terminalContent = document.querySelector(".terminal-content");
  const terminalOutput = document.getElementById("terminal-output");
  
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
function scrollToLastLineCenter() {
  const terminalContent = document.querySelector(".terminal-content");
  const terminalOutput = document.getElementById("terminal-output");
  
  if (!terminalContent || !terminalOutput) return;
  
  // Get all message elements
  const messages = terminalOutput.querySelectorAll('div');
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
function addToTerminal(content) {
  const terminalOutput = document.getElementById("terminal-output");
  terminalOutput.innerHTML += content;
  
  // Use requestAnimationFrame to ensure DOM is updated before scrolling
  requestAnimationFrame(() => {
    setTimeout(() => {
      scrollToLastLineCenter();
    }, 50); // Small delay to ensure content is rendered
  });
}

// Load challenge data from JSON
async function loadChallenge() {
  try {
    const response = await fetch('../resource/debug_challenge.json');
    const data = await response.json();
    
    // Get the first challenge (can be extended to support multiple challenges)
    currentChallenge = data.quiz.questions[2];
    
    // Load the code file
    const codeResponse = await fetch(`../resource/${currentChallenge.codepath}`);
    const codeContent = await codeResponse.text();
    
    // Update the page with challenge data
    updateChallengeInfo(data.quiz, currentChallenge);
    
    // Initialize Monaco Editor with the loaded code
    initializeEditor(codeContent);
    
  } catch (error) {
    console.error('Error loading challenge:', error);
    addToTerminal(`<div class="terminal-error">❌ Error loading challenge: ${error.message}</div>`);
  }
}

// Update the challenge information in the UI
function updateChallengeInfo(quiz, challenge) {
  
  // Update description
  document.querySelector('.challenge-info p').innerHTML = challenge.description;
  
  // Update expected behavior examples
  const examplesList = document.querySelector('.challenge-requirements ul');
  examplesList.innerHTML = '';
  
  // Show first few test cases as examples
  challenge.testcases.slice(0, 4).forEach(testcase => {
    const li = document.createElement('li');
    const inputDisplay = Array.isArray(testcase.input) 
      ? `[${testcase.input.join(',')}]` 
      : `"${testcase.input}"`;
    li.innerHTML = `<code>${challenge.functionName}(${inputDisplay})</code> → <strong>${testcase.expected}</strong>`;
    examplesList.appendChild(li);
  });
  
  // Update hints
  if (challenge.hints && challenge.hints.length > 0) {
    document.querySelector('.hint-section p').textContent = challenge.hints.join(' ');
  }
  
  // Update test count
  const totalTests = challenge.testcases.length;
  document.getElementById('tests-passed').textContent = `0/${totalTests}`;
  document.getElementById('success-rate').textContent = '0%';
}

// Initialize Monaco Editor with loaded code
function initializeEditor(codeContent) {
  require.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs" },
  });
  require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById("editor"), {
      value: codeContent,
      language: currentChallenge.language,
      theme: "vs-dark",
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "on",
    });

    // Add custom save command to Monaco Editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
      // Prevent default browser save dialog
      runCode('keyboard');
      
      // Visual feedback
      const submitBtn = document.getElementById("submit-btn");
      if (submitBtn) {
        submitBtn.style.transform = "scale(0.95)";
        setTimeout(() => {
          submitBtn.style.transform = "";
        }, 150);
      }
    });

    // Add custom run command to Monaco Editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
      runCode('keyboard');
    });

    // Start timer when user starts editing
    editor.onDidChangeModelContent(() => {
      if (!startTime) {
        startTimer();
      }
    });
  });
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  updateStatus("In Progress", "running");
}

function updateTimer() {
  if (!startTime) return;

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `⏱️ ${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const timerElement = document.getElementById("timer");
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

function updateStatus(text, type = "ready") {
  document.getElementById("status-text").textContent = text;
  document.getElementById("status-dot").className = `status-dot ${type}`;
}

function runCode(triggeredBy = 'button') {
  const code = editor.getValue();
  const submitBtn = document.getElementById("submit-btn");

  // Disable submit button temporarily
  submitBtn.disabled = true;
  updateStatus("Running...", "running");

  // Add running message with timestamp
  const timestamp = new Date().toLocaleTimeString();
  addToTerminal(
    `\n<div class="terminal-log">[${timestamp}] Running automated tests...</div>`
  );

  setTimeout(() => {
    try {
      // Check if challenge is loaded
      if (!currentChallenge) {
        addToTerminal(`<div class="terminal-error">❌ Error: Challenge not loaded</div>`);
        submitBtn.disabled = false;
        return;
      }

      // Use test cases from the loaded challenge
      const testCases = currentChallenge.testcases;

      // Execute the user's code in a safe environment
      let targetFunction;
      const functionName = currentChallenge.functionName; // Could be extracted from challenge in the future

      try {
        // Create a completely isolated execution environment
        // This prevents variable redeclaration errors on multiple runs
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const iframeWindow = iframe.contentWindow;

        // Execute code in iframe context
        iframeWindow.eval(code);
        targetFunction = iframeWindow[functionName];

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
          `<div class="terminal-error">❌ Syntax Error: ${error.message}</div>`
        );
        updateStatus("Syntax Error", "error");
        submitBtn.disabled = false;
        return;
      }

      // Run test cases
      let passedTests = 0;
      let totalTests = testCases.length;

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
            `<div class="terminal-error">   Runtime Error: ${error.message}</div>`
          );
        }
      });

      addToTerminal(
        `<div class="terminal-log">═══════════════════════════════════════════════</div>`
      );

      // Show final results
      const percentage = Math.round((passedTests / totalTests) * 100);

      // Update progress indicators
      document.getElementById(
        "tests-passed"
      ).textContent = `${passedTests}/${totalTests}`;
      document.getElementById("success-rate").textContent = `${percentage}%`;

      if (passedTests === totalTests) {
        addToTerminal(
          `<div class="terminal-success">🎉 All tests passed! (${passedTests}/${totalTests}) - ${percentage}%</div>`
        );
        addToTerminal(
          `<div class="terminal-success">✅ Challenge completed successfully!</div>`
        );
        updateStatus("All Tests Passed", "ready");
        document.getElementById("test-status").textContent = "Completed ✅";
      } else {
        addToTerminal(
          `<div class="terminal-error">⚠️  ${passedTests}/${totalTests} tests passed (${percentage}%)</div>`
        );
        addToTerminal(
          `<div class="terminal-hint">💡 Hint: ${currentChallenge.hints ? currentChallenge.hints[0] : 'Check your function logic'}</div>`
        );
        updateStatus(`${passedTests}/${totalTests} Tests Passed`, "error");
        document.getElementById("test-status").textContent = "Failed ❌";
      }
    } catch (error) {
      addToTerminal(
        `<div class="terminal-error">❌ Unexpected Error: ${error.message}</div>`
      );
      updateStatus("Error", "error");
    }

    // Re-enable submit button
    submitBtn.disabled = false;
  }, 500);
}

function clearTerminal() {
  document.getElementById("terminal-output").innerHTML = `
                <div class="terminal-log">Terminal cleared.</div>
            `;
  requestAnimationFrame(() => {
    setTimeout(() => {
      scrollToLastLineCenter();
    }, 50);
  });
}

function resetChallenge() {
  if (
    confirm(
      "Are you sure you want to reset the challenge? This will clear your progress."
    )
  ) {
    location.reload();
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
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
    const submitBtn = document.getElementById("submit-btn");
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
document.addEventListener('DOMContentLoaded', function() {
  // Initialize status
  updateStatus("Loading...", "running");
  
  // Load challenge data
  loadChallenge().then(() => {
    updateStatus("Ready", "ready");
    document.getElementById("test-status").textContent = "Not Started";
  }).catch((error) => {
    updateStatus("Error", "error");
    addToTerminal(`<div class="terminal-error">❌ Failed to load challenge: ${error.message}</div>`);
  });
});