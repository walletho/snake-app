const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highscoreElement = document.getElementById("highscore");
const overlayElement = document.getElementById("overlay");
const overlayTitleElement = document.getElementById("overlayTitle");
const overlayTextElement = document.getElementById("overlayText");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const touchButtons = document.querySelectorAll("[data-direction]");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const tickMs = 120;
const highscoreKey = "snake-app-highscore";
const minSwipeDistance = 24;

let snake = [];
let direction = { x: 0, y: 0 };
let food = { x: 14, y: 10 };
let score = 0;
let gameStarted = false;
let gameOver = false;
let paused = false;
let lastFrameTime = 0;
let touchStartX = null;
let touchStartY = null;

function loadHighscore() {
  const stored = Number.parseInt(localStorage.getItem(highscoreKey) ?? "0", 10);
  return Number.isNaN(stored) ? 0 : stored;
}

let highscore = loadHighscore();
highscoreElement.textContent = String(highscore);

function showOverlay(title, text) {
  overlayTitleElement.textContent = title;
  overlayTextElement.textContent = text;
  overlayElement.classList.remove("hidden");
}

function hideOverlay() {
  overlayElement.classList.add("hidden");
}

function randomFoodPosition() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    const collides = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!collides) {
      return candidate;
    }
  }
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 0, y: 0 };
  food = { x: 14, y: 10 };
  score = 0;
  gameStarted = false;
  gameOver = false;
  paused = false;
  touchStartX = null;
  touchStartY = null;
  scoreElement.textContent = "0";
  showOverlay(
    "Spiel starten",
    "Tippe auf Start oder nutze eine Richtung. Auf dem Handy gehen auch die Pfeil-Buttons.",
  );
  draw();
}

function canTurn(nextDirection) {
  if (!gameStarted) {
    return true;
  }

  const reversingX = nextDirection.x !== 0 && nextDirection.x === -direction.x;
  const reversingY = nextDirection.y !== 0 && nextDirection.y === -direction.y;
  return !(reversingX || reversingY);
}

function startMoving(nextDirection) {
  if (gameOver) {
    resetGame();
  }

  if (!canTurn(nextDirection)) {
    return;
  }

  direction = nextDirection;

  if (!gameStarted) {
    gameStarted = true;
    hideOverlay();
  }
}

function update() {
  if (!gameStarted || gameOver || paused) {
    return;
  }

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    gameOver = true;
    showOverlay("Game Over", "Tippe auf Start oder Neu starten fuer eine neue Runde.");
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreElement.textContent = String(score);

    if (score > highscore) {
      highscore = score;
      highscoreElement.textContent = String(highscore);
      localStorage.setItem(highscoreKey, String(highscore));
    }

    food = randomFoodPosition();
  } else {
    snake.pop();
  }
}

function drawRoundedTile(x, y, color, radius = 6) {
  const px = x * gridSize;
  const py = y * gridSize;
  const size = gridSize - 2;

  context.fillStyle = color;
  context.beginPath();
  context.roundRect(px + 1, py + 1, size, size, radius);
  context.fill();
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawRoundedTile(food.x, food.y, "#bc4749", 10);

  snake.forEach((segment, index) => {
    drawRoundedTile(
      segment.x,
      segment.y,
      index === 0 ? "#1b4332" : "#2d6a4f",
      index === 0 ? 8 : 6,
    );
  });
}

function loop(timestamp) {
  if (timestamp - lastFrameTime >= tickMs) {
    update();
    draw();
    lastFrameTime = timestamp;
  }

  requestAnimationFrame(loop);
}

function togglePause() {
  if (!gameStarted || gameOver) {
    return;
  }

  paused = !paused;

  if (paused) {
    showOverlay("Pausiert", "Tippe auf Start oder druecke Leertaste zum Fortsetzen.");
  } else {
    hideOverlay();
  }
}

function directionFromKey(key) {
  if (key === "arrowup" || key === "w") return { x: 0, y: -1 };
  if (key === "arrowdown" || key === "s") return { x: 0, y: 1 };
  if (key === "arrowleft" || key === "a") return { x: -1, y: 0 };
  if (key === "arrowright" || key === "d") return { x: 1, y: 0 };
  return null;
}

function directionFromName(name) {
  if (name === "up") return { x: 0, y: -1 };
  if (name === "down") return { x: 0, y: 1 };
  if (name === "left") return { x: -1, y: 0 };
  if (name === "right") return { x: 1, y: 0 };
  return null;
}

function startGame(event) {
  if (event) {
    event.preventDefault();
  }

  if (paused) {
    togglePause();
    return;
  }

  startMoving({ x: 1, y: 0 });
}

window.addEventListener("keydown", (event) => {
  const nextDirection = directionFromKey(event.key.toLowerCase());

  if (nextDirection) {
    event.preventDefault();
    startMoving(nextDirection);
    return;
  }

  if (event.key === " ") {
    event.preventDefault();
    togglePause();
  } else if (event.key === "Enter") {
    event.preventDefault();
    resetGame();
  }
});

canvas.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (!touch) {
    return;
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];

  if (!touch || touchStartX === null || touchStartY === null) {
    return;
  }

  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  touchStartX = null;
  touchStartY = null;

  if (Math.max(absX, absY) < minSwipeDistance) {
    return;
  }

  if (absX > absY) {
    startMoving(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    return;
  }

  startMoving(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
}, { passive: true });

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);

touchButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const nextDirection = directionFromName(button.dataset.direction);
    if (nextDirection) {
      startMoving(nextDirection);
    }
  });
});

resetGame();
requestAnimationFrame(loop);
