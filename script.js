const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highscoreElement = document.getElementById("highscore");
const overlayElement = document.getElementById("overlay");
const overlayTitleElement = document.getElementById("overlayTitle");
const overlayTextElement = document.getElementById("overlayText");
const restartButton = document.getElementById("restartButton");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const tickMs = 120;
const highscoreKey = "snake-app-highscore";

let snake;
let direction;
let queuedDirection;
let food;
let score;
let gameStarted;
let gameOver;
let paused;
let lastFrameTime = 0;

function loadHighscore() {
  const stored = Number.parseInt(localStorage.getItem(highscoreKey) ?? "0", 10);
  return Number.isNaN(stored) ? 0 : stored;
}

let highscore = loadHighscore();
highscoreElement.textContent = String(highscore);

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
  queuedDirection = null;
  food = { x: 14, y: 10 };
  score = 0;
  gameStarted = false;
  gameOver = false;
  paused = false;
  scoreElement.textContent = "0";
  showOverlay("Spiel starten", "Druecke eine Richtungstaste, um zu beginnen.");
  draw();
}

function showOverlay(title, text) {
  overlayTitleElement.textContent = title;
  overlayTextElement.textContent = text;
  overlayElement.classList.remove("hidden");
}

function hideOverlay() {
  overlayElement.classList.add("hidden");
}

function setDirection(nextDirection) {
  const reversingX = nextDirection.x !== 0 && nextDirection.x === -direction.x;
  const reversingY = nextDirection.y !== 0 && nextDirection.y === -direction.y;

  if (gameStarted && (reversingX || reversingY)) {
    return;
  }

  queuedDirection = nextDirection;

  if (!gameStarted) {
    gameStarted = true;
    hideOverlay();
  }
}

function update() {
  if (!gameStarted || gameOver || paused) {
    return;
  }

  if (queuedDirection) {
    direction = queuedDirection;
    queuedDirection = null;
  }

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;

  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    gameOver = true;
    showOverlay("Game Over", "Druecke Enter oder den Button, um neu zu starten.");
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
    showOverlay("Pausiert", "Druecke Leertaste, um weiterzuspielen.");
  } else {
    hideOverlay();
  }
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    setDirection({ x: 0, y: -1 });
  } else if (key === "arrowdown" || key === "s") {
    setDirection({ x: 0, y: 1 });
  } else if (key === "arrowleft" || key === "a") {
    setDirection({ x: -1, y: 0 });
  } else if (key === "arrowright" || key === "d") {
    setDirection({ x: 1, y: 0 });
  } else if (key === " ") {
    event.preventDefault();
    togglePause();
  } else if (key === "enter") {
    resetGame();
  }
});

restartButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(loop);
