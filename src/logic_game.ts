// Dynamic import for Sortable
declare var Sortable: any;

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
    title: "Level 2: IF หนาว → ใส่เสื้อกันหนาว",
    description: "เพิ่ม IF หนาวใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "อาบน้ำ",
      "แต่งตัว",
      "IF หนาว?",
      "ใส่เสื้อกันหนาว",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: [
      "Start",
      "ตื่นนอน",
      "อาบน้ำ",
      "แต่งตัว",
      "IF หนาว?",
      "ไปโรงเรียน",
      "End",
    ],
    correctTrue: ["ใส่เสื้อกันหนาว"],
    correctFalse: [],
  },
  {
    title: "Level 3: IF หิว → กินข้าว",
    description: "เพิ่ม IF หิวใน Flowchart",
    blocks: ["Start", "ตื่นนอน", "IF หิว?", "กินข้าว", "ไปโรงเรียน", "End"],
    correctMain: ["Start", "ตื่นนอน", "IF หิว?", "ไปโรงเรียน", "End"],
    correctTrue: ["กินข้าว"],
    correctFalse: [],
  },
  {
    title: "Level 4: IF มีเวลา → อ่านหนังสือ",
    description: "เพิ่ม IF มีเวลาใน Flowchart",
    blocks: [
      "Start",
      "ตื่นนอน",
      "IF มีเวลา?",
      "อ่านหนังสือ",
      "ไปโรงเรียน",
      "End",
    ],
    correctMain: ["Start", "ตื่นนอน", "IF มีเวลา?", "ไปโรงเรียน", "End"],
    correctTrue: ["อ่านหนังสือ"],
    correctFalse: [],
  },
  {
    title: "Level 5: IF มีงาน → ทำงาน",
    description: "เพิ่ม IF มีงานใน Flowchart",
    blocks: ["Start", "ตื่นนอน", "IF มีงาน?", "ทำงาน", "ไปโรงเรียน", "End"],
    correctMain: ["Start", "ตื่นนอน", "IF มีงาน?", "ไปโรงเรียน", "End"],
    correctTrue: ["ทำงาน"],
    correctFalse: [],
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
function selectLevel() {
  const levelSelectElement = document.getElementById("level-select") as HTMLSelectElement;
  if (!levelSelectElement) return;
  const selectedLevel = levelSelectElement.value;
  currentLevel = parseInt(selectedLevel, 10); // เปลี่ยนค่าที่เลือกเป็นตัวเลข
  loadLevel(currentLevel); // โหลดโจทย์ที่เลือก
}
function loadLevel(levelIndex: number) {
  const level = levels[levelIndex];
  const levelTitleElement = document.getElementById("level-title");
  const levelDescriptionElement = document.getElementById("level-description");
  const blocksContainer = document.getElementById("blocks");
  
  if (levelTitleElement) levelTitleElement.innerText = level.title;
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
  const level = levels[currentLevel];
  const mainFlow = Array.from(
    document.querySelectorAll("#dropzone > .block, #dropzone > .if-block")
  ).map((el) => (el as HTMLElement).innerText.split("\n")[0]); // แค่ชื่อบล็อก
  const trueBranch = Array.from(document.querySelectorAll(".branch-label"))
    .filter((label) => (label as HTMLElement).innerText.includes("TRUE"))
    .map((label) => label.nextElementSibling)
    .filter((branch) => branch !== null)
    .flatMap((branch) => Array.from(branch.querySelectorAll(".block")))
  const falseBranch = Array.from(document.querySelectorAll(".branch-label"))
    .filter((label) => (label as HTMLElement).innerText.includes("FALSE"))
    .map((label) => label.nextElementSibling)
    .filter((branch) => branch !== null)
    .flatMap((branch) => Array.from(branch.querySelectorAll(".block")))
    .map((el) => (el as HTMLElement).innerText);
  let result = document.getElementById("result");
  if (!result) return;
  
  if (
    JSON.stringify(mainFlow) === JSON.stringify(level.correctMain) &&
    JSON.stringify(trueBranch) === JSON.stringify(level.correctTrue) &&
    JSON.stringify(falseBranch) === JSON.stringify(level.correctFalse)
  ) {
    result.innerText = "✅ ถูกต้อง! IF ทำงานตามโจทย์แล้ว";
  } else {
    result.innerText = "❌ ยังไม่ถูก ลองลากบล็อกใหม่อีกครั้ง";
  }
}

// Initialize the game when DOM and Sortable are ready
function initializeGame() {
  if (typeof Sortable !== 'undefined') {
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
(window as any).selectLevel = selectLevel;
(window as any).checkAnswer = checkAnswer;
