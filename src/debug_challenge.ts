document.addEventListener("DOMContentLoaded", () => {
  initializeButton();
  const codeContent = `console.log("hello world");`;
  initializeEditor(codeContent);
});

function initializeButton() {
  const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      runCode();
    });

    // Listen for Ctrl+S or Cmd+S to run code
    document.addEventListener("keydown", (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        runCode();
      }
    });
  }
}

// Initialize Monaco Editor with loaded code
async function initializeEditor(codeContent: string = ""): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Monaco Editor loader is available
    const requireFunc = (window as any).require;

    if (typeof requireFunc === "function") {
      requireFunc.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs",
        },
      });

      requireFunc(["vs/editor/editor.main"], function () {
        const monaco = (window as any).monaco;
        
        const editorContainer = document.getElementById("editor") as HTMLElement;
        if (!editorContainer) {
          reject(new Error("Editor container not found"));
          return;
        }

        // Create Monaco Editor instance
        const editor = monaco.editor.create(editorContainer, {
          value: codeContent,
          language: "javascript",
          theme: "vs-dark",
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
        });

        // Store editor instance globally for access
        (window as any).monacoEditor = editor;
        
        resolve();
      });
    } else {
      reject(new Error("Monaco Editor require function not available"));
    }
  });
}

function runCode(): void {
  const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;

  if (submitBtn) submitBtn.disabled = true;
  const editor = (window as any).monacoEditor;
  
  if (editor) {
    const code = editor.getValue();
    try {
      // Clear terminal output before displaying new output
      const terminalOutput = document.getElementById("terminal-output") as HTMLElement;
      if (terminalOutput) terminalOutput.innerHTML = "";

      const capturedOutput: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        const msg = args.map(String).join(" ") + "<br/>";
        capturedOutput.push(msg);
        originalLog.apply(console, args);
      };

      try {
        eval(code);
      } finally {
        if (capturedOutput.length > 0) {
          output(capturedOutput.join(""));
        }
      }
      console.log("Code executed successfully");
    } catch (error) {
      console.error("Code execution error:", error);
    } finally {
      setTimeout(() => {
        if (submitBtn) submitBtn.disabled = false;
      }, 500);
    }
  }
}

// Function to add output to terminal and auto-scroll to center
function output(content: string): void {
  try {
    const terminalOutput = document.getElementById("terminal-output") as HTMLElement;
    if (!terminalOutput) return;
    
    terminalOutput.innerHTML += content;
  } finally {
    setTimeout(() => {
      scrollTerminalToCenter();
    }, 500);
  }
}

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