interface Level {
  objective: string;
  blocks: string[];
  correct: string[];
}

const levels: Level[] = [
  {
    objective: "Make the robot walk and then stop.",
    blocks: ["start", "walk", "end"],
    correct: ["start", "walk", "end"],
  },
  {
    objective: "Make the robot walk, then jump, then stop.",
    blocks: ["start", "walk", "jump", "end"],
    correct: ["start", "walk", "jump", "end"],
  },
  {
    objective: "Make the robot pick an item, walk, jump, then stop.",
    blocks: ["start", "pick", "walk", "jump", "end"],
    correct: ["start", "pick", "walk", "jump", "end"],
  },
  {
    objective: "Make the robot walk twice, then stop.",
    blocks: ["start", "walk", "walk", "end"],
    correct: ["start", "walk", "walk", "end"],
  },
  {
    objective: "Make the robot jump, pick an item, walk, then stop.",
    blocks: ["start", "jump", "pick", "walk", "end"],
    correct: ["start", "jump", "pick", "walk", "end"],
  },
  {
    objective: "Final: Make the robot pick, walk, jump, walk, then stop.",
    blocks: ["start", "pick", "walk", "jump", "walk", "end"],
    correct: ["start", "pick", "walk", "jump", "walk", "end"],
  },
];

let currentLevel = 0;

// ฟังก์ชันสุ่มตำแหน่งบล็อก
function shuffleBlocks(blocks: string[]): string[] {
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }
  return blocks;
}

function loadLevel(levelIndex: number): void {
  const level = levels[levelIndex];
  const levelElement = document.getElementById("level");
  const objectiveElement = document.getElementById("objective");

  if (levelElement) {
    levelElement.innerText = "Level " + (levelIndex + 1);
  }
  if (objectiveElement) {
    objectiveElement.innerText = "Objective: " + level.objective;
  }

  const blocksContainer = document.getElementById("blocks");
  if (blocksContainer) {
    blocksContainer.innerHTML = "";

    // สุ่มตำแหน่งบล็อกก่อนแสดงผล
    const shuffledBlocks = shuffleBlocks([...level.blocks]);

    shuffledBlocks.forEach((b: string) => {
      const block = document.createElement("div");
      block.className = "block";
      block.innerText = b.charAt(0).toUpperCase() + b.slice(1);
      block.dataset.type = b;
      block.draggable = true;

      block.addEventListener("dragstart", (e: DragEvent) => {
        if (e.dataTransfer && block.dataset.type) {
          e.dataTransfer.setData("type", block.dataset.type);
          e.dataTransfer.setData("text", block.innerText);
        }
      });

      blocksContainer.appendChild(block);
    });
  }

  const dropzoneElement = document.getElementById("dropzone");
  const resultElement = document.getElementById("result");

  if (dropzoneElement) {
    dropzoneElement.innerHTML = "วางบล็อกที่นี่ ➡️";
  }
  if (resultElement) {
    resultElement.innerText = "";
  }
}

const dropzone = document.getElementById("dropzone");
if (dropzone) {
  dropzone.addEventListener("dragover", (e: DragEvent) => e.preventDefault());
  dropzone.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      const type = e.dataTransfer.getData("type");
      const text = e.dataTransfer.getData("text");
      const newBlock = document.createElement("div");
      newBlock.className = "block";
      newBlock.dataset.type = type;
      newBlock.innerText = text;
      dropzone.appendChild(newBlock);
    }
  });
}

function checkAnswer(): void {
  if (!dropzone) return;

  const placed = [...dropzone.querySelectorAll(".block")].map(
    (b: Element) => (b as HTMLElement).dataset.type
  );
  const correct = levels[currentLevel].correct;
  const result = document.getElementById("result");

  if (JSON.stringify(placed) === JSON.stringify(correct)) {
    if (result) {
      result.innerText = "🎉 Correct! Moving to next level...";
      result.style.color = "green";
    }
    setTimeout(() => {
      currentLevel++;
      if (currentLevel < levels.length) {
        loadLevel(currentLevel);
      } else {
        if (result) {
          result.innerText = "🏆 Congratulations! You finished all 6 puzzles!";
        }
      }
    }, 1500);
  } else {
    if (result) {
      result.innerText = "❌ Wrong sequence, try again!";
      result.style.color = "red";
    }
  }
}

// ฟังก์ชันเคลียร์บล็อกใน dropzone
function clearBlocks(): void {
  const dropzone = document.getElementById("dropzone");
  if (dropzone) {
    dropzone.innerHTML = "วางบล็อกที่นี่ ➡้";
  }
}

// Expose functions to global scope for HTML access
(window as any).checkAnswer = checkAnswer;
(window as any).clearBlocks = clearBlocks;

// เริ่มเลเวลแรก
loadLevel(currentLevel);
