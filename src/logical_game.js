const levels = [
  { 
    objective: "Make the robot walk and then stop.",
    blocks: ["start", "walk", "end"],
    correct: ["start","walk","end"]
  },
  { 
    objective: "Make the robot walk, then jump, then stop.",
    blocks: ["start", "walk", "jump", "end"],
    correct: ["start","walk","jump","end"]
  },
  { 
    objective: "Make the robot pick an item, walk, jump, then stop.",
    blocks: ["start", "pick", "walk", "jump", "end"],
    correct: ["start","pick","walk","jump","end"]
  },
  { 
    objective: "Make the robot walk twice, then stop.",
    blocks: ["start", "walk", "walk", "end"],
    correct: ["start","walk","walk","end"]
  },
  { 
    objective: "Make the robot jump, pick an item, walk, then stop.",
    blocks: ["start", "jump", "pick", "walk", "end"],
    correct: ["start","jump","pick","walk","end"]
  },
  { 
    objective: "Final: Make the robot pick, walk, jump, walk, then stop.",
    blocks: ["start", "pick", "walk", "jump", "walk", "end"],
    correct: ["start","pick","walk","jump","walk","end"]
  }
];

let currentLevel = 0;

function loadLevel(levelIndex) {
  const level = levels[levelIndex];
  document.getElementById("level").innerText = "Level " + (levelIndex + 1);
  document.getElementById("objective").innerText = "Objective: " + level.objective;

  const blocksContainer = document.getElementById("blocks");
  blocksContainer.innerHTML = "";

  level.blocks.forEach(b => {
    const block = document.createElement("div");
    block.className = "block";
    block.innerText = b.charAt(0).toUpperCase() + b.slice(1);
    block.dataset.type = b;
    block.draggable = true;

    block.addEventListener("dragstart", e => {
      e.dataTransfer.setData("type", block.dataset.type);
      e.dataTransfer.setData("text", block.innerText);
    });

    blocksContainer.appendChild(block);
  });

  document.getElementById("dropzone").innerHTML = "วางบล็อกที่นี่ ➡️";
  document.getElementById("result").innerText = "";
}

const dropzone = document.getElementById('dropzone');
dropzone.addEventListener('dragover', e => e.preventDefault());
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  const text = e.dataTransfer.getData('text');
  const newBlock = document.createElement('div');
  newBlock.className = 'block';
  newBlock.dataset.type = type;
  newBlock.innerText = text;
  dropzone.appendChild(newBlock);
});

function checkAnswer() {
  const placed = [...dropzone.querySelectorAll('.block')].map(b => b.dataset.type);
  const correct = levels[currentLevel].correct;
  const result = document.getElementById('result');

  if (JSON.stringify(placed) === JSON.stringify(correct)) {
    result.innerText = "🎉 Correct! Moving to next level...";
    result.style.color = "green";
    setTimeout(() => {
      currentLevel++;
      if (currentLevel < levels.length) {
        loadLevel(currentLevel);
      } else {
        result.innerText = "🏆 Congratulations! You finished all 6 puzzles!";
      }
    }, 1500);
  } else {
    result.innerText = "❌ Wrong sequence, try again!";
    result.style.color = "red";
  }
}

// เริ่มเลเวลแรก
loadLevel(currentLevel);