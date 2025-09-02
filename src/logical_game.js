document.addEventListener("DOMContentLoaded", () => {
  const levels = [
    { 
      objective: "Make the robot walk and then stop.",
      blocks: ["start", "walk", "end"],
      correct: ["start", "walk", "end"]
    },
    { 
      objective: "Make the robot walk, then jump, then stop.",
      blocks: ["start", "walk", "jump", "end"],
      correct: ["start", "walk", "jump", "end"]
    }
  ];

  let currentLevel = 0;

  function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    const levelElem = document.getElementById("level");
    if (levelElem) {
      levelElem.innerText = "Level " + (levelIndex + 1);
    }

    const objectiveElem = document.getElementById("objective");
    if (objectiveElem) {
      objectiveElem.innerText = "Objective: " + level.objective;
    }

    const blocksContainer = document.getElementById("blocks");
    if (blocksContainer) {
      blocksContainer.innerHTML = "";
      level.blocks.forEach(b => {
        const block = document.createElement("div");
        block.className = "block";
        block.innerText = b.charAt(0).toUpperCase() + b.slice(1);
        block.dataset.type = b;
        block.draggable = true;

        block.addEventListener("dragstart", e => {
          if (e.dataTransfer) {
            e.dataTransfer.setData("type", block.dataset.type || "");
            e.dataTransfer.setData("text", block.innerText);
          }
        });

        blocksContainer.appendChild(block);
      });
    }

    const dropzone = document.getElementById("dropzone");
    if (dropzone) {
      dropzone.innerHTML = "วางบล็อกที่นี่ ➡️";
    }

    const result = document.getElementById("result");
    if (result) {
      result.innerText = "";
    }
  }

  const dropzone = document.getElementById("dropzone");
  if (dropzone) {
    dropzone.addEventListener('dragover', e => e.preventDefault());
    dropzone.addEventListener('drop', e => {
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

  function checkAnswer() {
    const dropzone = document.getElementById("dropzone");
    if (!dropzone) return;

    const placed = [...dropzone.querySelectorAll('.block')].map(b => b.dataset.type);
    const correct = levels[currentLevel].correct;

    const result = document.getElementById("result");
    if (result) {
      if (JSON.stringify(placed) === JSON.stringify(correct)) {
        result.innerText = "🎉 Correct! Moving to next level...";
        result.style.color = "green";
        setTimeout(() => {
          currentLevel++;
          if (currentLevel < levels.length) {
            loadLevel(currentLevel);
          } else {
            result.innerText = "🏆 Congratulations! You finished all puzzles!";
          }
        }, 1500);
      } else {
        result.innerText = "❌ Wrong sequence, try again!";
        result.style.color = "red";
      }
    }
  }

  window.checkAnswer = checkAnswer;

  loadLevel(currentLevel);
});