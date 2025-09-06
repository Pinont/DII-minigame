// Dynamic import for Sortable
declare var Sortable: any;

// Configuration: Limit how many questions to display (default: all questions)
let maxQuestionsToDisplay: number | null = null;
let skipQuestions: number[] = [];

const levels = [
  {
    title: "Level 1: IF ฝนตก → หยิบร่ม",
    description: "ลากบล็อกเข้าไปใน Branch True/False ของ IF ได้",
    blocks: [
      "Start",
      "ตื่นนอน",
      "อาบน้ำ",
      "แต่งตัว",
      "หยิบร่ม",
      "ไปโรงเรียน",
      "End",
      "IF ฝนตก?",
    ],
    correctMain: ["Start", "ตื่นนอน", "อาบน้ำ", "แต่งตัว", "IF ฝนตก?", "End"],
    correctTrue: ["หยิบร่ม"],
    correctFalse: ["ไปโรงเรียน"],
  },
  {
    title: "Level 2: Prime Number ",
    description: "รับตัวเลขจำนวนเต็มจากผู้ใช้ ถ้าเป็นจำนวนเฉพาะ (Prime Number) ให้แสดงข้อความว่า “เป็นจำนวนเฉพาะ” แต่ถ้าไม่ใช่ให้แสดง “ไม่ใช่จำนวนเฉพาะ”",
    blocks: [
      "Start",
      "เป็นจำนวนเฉพาะ",
      "รับตัวเลขจากผู้ใช้",
      "ไม่ใช่จำนวนเฉพาะ",
      "IF ตัวเลขเป็นจำนวนเฉพาะ?",
      "End",
    ],
    correctMain: [
      "Start",
      "รับตัวเลขจากผู้ใช้",
      "IF ตัวเลขเป็นจำนวนเฉพาะ?",
      "End"
    ],
    correctTrue: ["เป็นจำนวนเฉพาะ"],
    correctFalse: ["ไม่ใช่จำนวนเฉพาะ"],
  },
  {
    title: "Level 3: เปรียบเทียบรหัสผ่าน",
    description: "ถ้ารหัสผ่านตรงกับ “abc123” ให้แสดง “เข้าสู่ระบบสำเร็จ” ถ้าไม่ตรง ให้แสดง “รหัสผ่านผิด”",
    blocks: [  "IF รหัสผ่าน == abc123?", "เข้าสู่ระบบสำเร็จ","รับรหัสผ่านจากผู้ใช้","Start", "รหัสผ่านผิด", "End"],
    correctMain: ["Start", "รับรหัสผ่านจากผู้ใช้", "IF รหัสผ่าน == abc123?", "End"],
    correctTrue: ["เข้าสู่ระบบสำเร็จ"],
    correctFalse: ["รหัสผ่านผิด"],
  },
  {
    title: "Level 4: ระบบส่วนลด",
    description: "รับยอดซื้อสินค้าจากผู้ใช้ ถ้ายอดซื้อมากกว่า 1000 บาทให้แสดง “ได้ส่วนลด 10%” ถ้าน้อยกว่าหรือเท่ากับ 1000 บาทให้แสดง “ไม่ได้ส่วนลด”",
    blocks: [
      "Start",
      "ได้ส่วนลด 10%",
      "IF ยอดซื้อ > 1000?",
      "ไม่ได้ส่วนลด",
      "End",
      "รับยอดซื้อจากผู้ใช้"
    ],
    correctMain: ["Start", "รับยอดซื้อจากผู้ใช้", "IF ยอดซื้อ > 1000?", "End"],
    correctTrue: ["ได้ส่วนลด 10%"],
    correctFalse: ["ไม่ได้ส่วนลด"],
  },
  {
    title: "Level 5: เช็คเลขคู่หรือเลขคี่",
    description: "รับตัวเลขจำนวนเต็มจากผู้ใช้ ถ้าเลขนั้นเป็นเลขคู่ ให้แสดง “เลขคู่” ถ้าเป็นเลขคี่ ให้แสดง “เลขคี่”",
    blocks: ["เลขคู่","Start",  "IF ตัวเลข % 2 == 0?",  "เลขคี่","รับตัวเลขจากผู้ใช้", "End"],
    correctMain: ["Start", "รับตัวเลขจากผู้ใช้", "IF ตัวเลข % 2 == 0?", "End"],
    correctTrue: ["เลขคู่"],
    correctFalse: ["เลขคี่"],
  },
  {
    title: "Level 6: IF ฝนตก → หยิบร่ม, IF หนาว → ใส่เสื้อกันหนาว",
    description: "เพิ่ม IF ซ้อนกันใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "IF ฝนตก?",
      "หยิบร่ม",
      "IF หนาว?",
      "ใส่เสื้อกันหนาว",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: [
      "Start",
      "ตื่นนอน",
      "IF ฝนตก?",
      "IF หนาว?",
      "ไปโรงเรียน",
      "End",
    ],
    correctTrue: ["หยิบร่ม", "ใส่เสื้อกันหนาว"],
    correctFalse: [],
  },
  {
    title: "Level 7: IF หิว → กินข้าว, IF มีเวลา → อ่านหนังสือ",
    description: "เพิ่ม IF ซ้อนกันใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "IF หิว?",
      "กินข้าว",
      "IF มีเวลา?",
      "อ่านหนังสือ",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: [
      "Start",
      "ตื่นนอน",
      "IF หิว?",
      "IF มีเวลา?",
      "ไปโรงเรียน",
      "End",
    ],
    correctTrue: ["กินข้าว", "อ่านหนังสือ"],
    correctFalse: [],
  },
  {
    title: "Level 8: IF มีงาน → ทำงาน, IF มีเวลา → อ่านหนังสือ",
    description: "เพิ่ม IF ซ้อนกันใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "IF มีงาน?",
      "ทำงาน",
      "IF มีเวลา?",
      "อ่านหนังสือ",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: [
      "Start",
      "ตื่นนอน",
      "IF มีงาน?",
      "IF มีเวลา?",
      "ไปโรงเรียน",
      "End",
    ],
    correctTrue: ["ทำงาน", "อ่านหนังสือ"],
    correctFalse: [],
  },
  {
    title: "Level 9: IF ฝนตก → หยิบร่ม, IF มีงาน → ทำงาน",
    description: "เพิ่ม IF ซ้อนกันใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "IF ฝนตก?",
      "หยิบร่ม",
      "IF มีงาน?",
      "ทำงาน",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: [
      "Start",
      "ตื่นนอน",
      "IF ฝนตก?",
      "IF มีงาน?",
      "ไปโรงเรียน",
      "End",
    ],
    correctTrue: ["หยิบร่ม", "ทำงาน"],
    correctFalse: [],
  },
  {
    title: "Level 10: IF หิว → กินข้าว, IF หนาว → ใส่เสื้อกันหนาว",
    description: "เพิ่ม IF ซ้อนกันใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "IF หิว?",
      "กินข้าว",
      "IF หนาว?",
      "ใส่เสื้อกันหนาว",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: [
      "Start",
      "ตื่นนอน",
      "IF หิว?",
      "IF หนาว?",
      "ไปโรงเรียน",
      "End",
    ],
    correctTrue: ["กินข้าว", "ใส่เสื้อกันหนาว"],
    correctFalse: [],
  },
];

let currentLevel = 0;

// Function to get filtered levels based on maxQuestionsToDisplay and skipQuestions
function getLevels() {
  // Filter out skipped questions (convert to 0-based index)
  let filteredLevels = levels.filter((_, index) => !skipQuestions.includes(index + 1));
  
  // Apply question limit if set
  if (maxQuestionsToDisplay !== null && maxQuestionsToDisplay > 0) {
    filteredLevels = filteredLevels.slice(0, maxQuestionsToDisplay);
  }
  
  return filteredLevels;
}

function createIfBlock(label: string) {
  const wrapper = document.createElement("li");
  wrapper.className = "if-block";
  const title = document.createElement("div");
  title.className = "if-title";
  title.innerText = label;
  wrapper.appendChild(title);
  const trueDiv = document.createElement("div");
  trueDiv.innerHTML =
    '<span class="branch-label">TRUE:</span><ul class="branch list"></ul>';
  wrapper.appendChild(trueDiv);
  const falseDiv = document.createElement("div");
  falseDiv.innerHTML =
    '<span class="branch-label">FALSE:</span><ul class="branch list"></ul>';
  wrapper.appendChild(falseDiv);
  return wrapper;
}

function loadLevel(levelIndex: number) {
  const availableLevels = getLevels();
  const level = availableLevels[levelIndex];
  if (!level) return; // Check if level exists
  
  const levelTitleElement = document.getElementById("level-title");
  const levelDescriptionElement = document.getElementById("level-description");
  const blocksContainer = document.getElementById("blocks");
  
  if (levelTitleElement) {
    // Show level number with total available levels
    const totalLevels = availableLevels.length;
    const currentLevelNumber = levelIndex + 1;
    levelTitleElement.innerText = `Level ${currentLevelNumber}/${totalLevels}: ${level.title.replace(/^Level \d+: /, '')}`;
  }
  if (levelDescriptionElement) levelDescriptionElement.innerText = level.description;
  if (!blocksContainer) return;
  
  blocksContainer.innerHTML = "";
  level.blocks.forEach((block) => {
    if (block.startsWith("IF")) {
      blocksContainer.appendChild(createIfBlock(block));
    } else {
      const li = document.createElement("li");
      li.innerText = block;
      li.className = "block";
      blocksContainer.appendChild(li);
    }
  });
  const dropzone = document.getElementById("dropzone");
  if (!dropzone) return;
  dropzone.innerHTML = "";
  const resultElement = document.getElementById("result");
  if (resultElement) resultElement.innerText = "";
  new Sortable(blocksContainer, { group: "shared", animation: 150 });
  new Sortable(dropzone, { group: "shared", animation: 150 });
  
  Array.from(document.querySelectorAll(".branch")).forEach((branch) => {
    new Sortable(branch, { group: "shared", animation: 150 });
  });
}
function checkAnswer() {
  const availableLevels = getLevels();
  const level = availableLevels[currentLevel];
  if (!level) return; // Check if level exists

  // ดึงข้อมูลจาก Flow หลัก
  const mainFlow = Array.from(
    document.querySelectorAll("#dropzone > .block, #dropzone > .if-block")
  ).map((el) => {
    const text = (el as HTMLElement).innerText.trim();
    // ลบข้อความ TRUE และ FALSE branch ออกจากบล็อก IF
    return text.includes("TRUE") || text.includes("FALSE")
      ? text.split("\n")[0] // แยกเฉพาะข้อความก่อน newline
      : text;
  });

  // ดึงข้อมูลจาก TRUE branch
  const trueBranch = Array.from(document.querySelectorAll(".branch-label"))
    .filter((label) => (label as HTMLElement).innerText.includes("TRUE"))
    .map((label) => label.nextElementSibling)
    .filter((branch) => branch !== null)
    .flatMap((branch) => Array.from(branch.querySelectorAll(".block")))
    .map((el) => (el as HTMLElement).innerText.trim());

  // ดึงข้อมูลจาก FALSE branch
  const falseBranch = Array.from(document.querySelectorAll(".branch-label"))
    .filter((label) => (label as HTMLElement).innerText.includes("FALSE"))
    .map((label) => label.nextElementSibling)
    .filter((branch) => branch !== null)
    .flatMap((branch) => Array.from(branch.querySelectorAll(".block")))
    .map((el) => (el as HTMLElement).innerText.trim());

  // Debug: แสดงข้อมูลที่ดึงมา
  console.log("mainFlow:", mainFlow);
  console.log("trueBranch:", trueBranch);
  console.log("falseBranch:", falseBranch);
  console.log("correctMain:", level.correctMain);
  console.log("correctTrue:", level.correctTrue);
  console.log("correctFalse:", level.correctFalse);

  // ตรวจสอบผลลัพธ์
  let result = document.getElementById("result");
  if (!result) return;

  if (
    JSON.stringify(mainFlow) === JSON.stringify(level.correctMain) &&
    JSON.stringify(trueBranch) === JSON.stringify(level.correctTrue) &&
    JSON.stringify(falseBranch) === JSON.stringify(level.correctFalse)
  ) {
    result.innerText = "✅ ถูกต้อง! IF ทำงานตามโจทย์แล้ว";
    
    // Check if this is the last level and show completion popup
    setTimeout(() => {
      showCompletionPopup();
    }, 1000);
  } else {
    result.innerText = "❌ ยังไม่ถูก ลองลากบล็อกใหม่อีกครั้ง";
  }
}

// Function to show completion popup and navigate to next level
function showCompletionPopup() {
  const availableLevels = getLevels();
  const isLastLevel = currentLevel >= availableLevels.length - 1;
  
  // Create popup HTML similar to other games
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
          You've successfully completed:<br><strong>Level ${currentLevel + 1}</strong>
        </p>
        ${isLastLevel ? `
          <p style="color: #4CAF50; font-weight: bold; margin-bottom: 30px;">All levels completed! 🎊</p>
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
          <button id="next-level-btn" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.2s ease;
          ">⏎ Next Level</button>
        `}
      </div>
    </div>
  `;
  
  // Add popup to DOM
  document.body.insertAdjacentHTML('beforeend', popupHTML);
  
  // Add event listeners
  const nextBtn = document.getElementById('next-level-btn');
  const restartBtn = document.getElementById('restart-all-btn');
  const popup = document.getElementById('completion-popup');
  
  // Handle next level button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      document.removeEventListener('keydown', handleEnterKey);
      if (popup) popup.remove();
      goToNextLevel();
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
      // Preserve max and skip parameters if they exist
      const urlParams = new URLSearchParams(window.location.search);
      const maxParam = urlParams.get('max');
      const skipParam = urlParams.get('skip');
      
      let restartUrl = '?quiz=1';
      if (maxParam) restartUrl += `&max=${maxParam}`;
      if (skipParam) restartUrl += `&skip=${skipParam}`;
      
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
  
  // Add Enter key listener for next level
  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isLastLevel) {
      document.removeEventListener('keydown', handleEnterKey);
      if (popup) popup.remove();
      goToNextLevel();
    }
  };
  
  if (!isLastLevel) {
    document.addEventListener('keydown', handleEnterKey);
  }
  
  // Close popup when clicking outside (optional)
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup && !isLastLevel) {
        document.removeEventListener('keydown', handleEnterKey);
        popup.remove();
      }
    });
  }
}

// Function to navigate to next level
function goToNextLevel() {
  const availableLevels = getLevels();
  
  if (currentLevel < availableLevels.length - 1) {
    // Get the current level from filtered list
    const currentFilteredLevel = availableLevels[currentLevel];
    
    // Find this level's original index in the full levels array
    const currentOriginalIndex = levels.findIndex(level => level.title === currentFilteredLevel.title);
    
    // Find the next non-skipped level
    let nextOriginalIndex = currentOriginalIndex + 1;
    while (nextOriginalIndex < levels.length && skipQuestions.includes(nextOriginalIndex + 1)) {
      nextOriginalIndex++;
    }
    
    if (nextOriginalIndex < levels.length) {
      // Preserve max and skip parameters if they exist
      const urlParams = new URLSearchParams(window.location.search);
      const maxParam = urlParams.get('max');
      const skipParam = urlParams.get('skip');
      
      let nextUrl = `?quiz=${nextOriginalIndex + 1}`; // Convert to 1-based for URL
      if (maxParam) nextUrl += `&max=${maxParam}`;
      if (skipParam) nextUrl += `&skip=${skipParam}`;
      
      window.location.href = nextUrl;
    }
  }
}

// Initialize the game when DOM and Sortable are ready
function initializeGame() {
  if (typeof Sortable !== 'undefined') {
    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const maxParam = urlParams.get('max');
    const quizParam = urlParams.get('quiz');
    const skipParam = urlParams.get('skip');
    
    // Parse skip parameter
    if (skipParam) {
      try {
        skipQuestions = JSON.parse(skipParam);
        if (!Array.isArray(skipQuestions)) {
          skipQuestions = [];
        }
      } catch (e) {
        console.warn('Invalid skip parameter format, expected JSON array');
        skipQuestions = [];
      }
    }
    
    // Set maxQuestionsToDisplay from URL parameter or default to all levels
    if (maxParam && !isNaN(parseInt(maxParam)) && parseInt(maxParam) > 0) {
      maxQuestionsToDisplay = parseInt(maxParam);
    } else if (maxQuestionsToDisplay === null) {
      maxQuestionsToDisplay = levels.length;
    }
    
    // Set current level from quiz parameter
    if (quizParam && !isNaN(parseInt(quizParam))) {
      const originalQuizNumber = parseInt(quizParam) - 1; // Convert to 0-based index
      
      // Check if this quiz number is valid and not skipped
      if (originalQuizNumber < 0 || originalQuizNumber >= levels.length || skipQuestions.includes(originalQuizNumber + 1)) {
        // Redirect to first available question
        const maxParam = urlParams.get('max');
        const skipParam = urlParams.get('skip');
        
        // Find first non-skipped level
        let firstAvailableQuiz = 1;
        while (firstAvailableQuiz <= levels.length && skipQuestions.includes(firstAvailableQuiz)) {
          firstAvailableQuiz++;
        }
        
        let redirectUrl = `?quiz=${firstAvailableQuiz}`;
        if (maxParam) redirectUrl += `&max=${maxParam}`;
        if (skipParam) redirectUrl += `&skip=${skipParam}`;
        
        window.location.href = redirectUrl;
        return;
      }
      
      // Find the index of this level in the filtered array
      const availableLevels = getLevels();
      const targetLevel = levels[originalQuizNumber];
      currentLevel = availableLevels.findIndex((level, index) => {
        // Compare by content since levels don't have unique IDs
        return level.title === targetLevel.title;
      });
      
      // Fallback if not found (shouldn't happen)
      if (currentLevel === -1) {
        currentLevel = 0;
      }
    }
    
    loadLevel(currentLevel);
  } else {
    // If Sortable is not yet loaded, wait a bit and try again
    setTimeout(initializeGame, 100);
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

// Make functions available globally for HTML onclick handlers
(window as any).checkAnswer = checkAnswer;
