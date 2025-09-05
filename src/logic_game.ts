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
