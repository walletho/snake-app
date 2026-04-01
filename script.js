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

let snake;
let direction;
let queuedDirection;
let food;
let score;
let gameStarted;
let gameOver;
let paused;
let lastFrameTime = 0;
let touchStartX = null;
let touchStartY = null;

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
  touchStartX = null;
  touchStartY = null;
  scoreElement.textContent = "0";
  showOverlay(
    "Spiel starten",
    "Druecke eine Richtungstaste, den Start-Button, nutze die Buttons oder wische ueber das Spielfeld, um zu beginnen.",
  );
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
  const activeDirection = queuedDirection ?? direction;
  const reversingX = nextDirection.x !== 0 && nextDirection.x === -activeDirection.x;
  const reversingY = nextDirection.y !== 0 && nextDirection.y === -activeDirection.y;

  if (gameStarted && (reversingX || reversingY)) {
    return;
  }

  const sameDirection =
    nextDirection.x === activeDirection.x && nextDirection.y === activeDirection.y;

  if (sameDirection) {
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
    showOverlay("Game Over", "Druecke Enter, den Button oder wische erneut zum Neustart.");
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
    showOverlay("Pausiert", "Druecke Leertaste oder tippe auf den Screen zum Weiterspielen.");
  } else {
    hideOverlay();
  }
}

function directionFromKey(key) {
  if (key === "arrowup" || key === "w") {
    return { x: 0, y: -1 };
  }

  if (key === "arrowdown" || key === "s") {
    return { x: 0, y: 1 };
  }

  if (key === "arrowleft" || key === "a") {
    return { x: -1, y: 0 };
  }

  if (key === "arrowright" || key === "d") {
    return { x: 1, y: 0 };
  }

  return null;
}

function directionFromName(name) {
  if (name === "up") {
    return { x: 0, y: -1 };
  }

  if (name === "down") {
    return { x: 0, y: 1 };
  }

  if (name === "left") {
    return { x: -1, y: 0 };
  }

  if (name === "right") {
    return { x: 1, y: 0 };
  }

  return null;
}

function startGame() {
  handleDirectionalInput({ x: 1, y: 0 });
}

function handleDirectionalInput(nextDirection) {
  if (gameOver) {
    resetGame();
  }

  setDirection(nextDirection);
}

function handleTouchStart(event) {
  const touch = event.touches[0];
  if (!touch) {
    return;
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  event.preventDefault();
}

function handleTouchEnd(event) {
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
    if (gameOver) {
      resetGame();
      return;
    }

    if (paused) {
      togglePause();
    }
    return;
  }

  if (absX > absY) {
    handleDirectionalInput(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    return;
  }

  handleDirectionalInput(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const nextDirection = directionFromKey(key);

  if (nextDirection) {
    event.preventDefault();
    handleDirectionalInput(nextDirection);
    return;
  }

  if (key === " ") {
    event.preventDefault();
    togglePause();
  } else if (key === "enter") {
    event.preventDefault();
    resetGame();
  }
});

for (const element of [canvas, overlayElement]) {
  element.addEventListener("touchstart", handleTouchStart, { passive: true });
  element.addEventListener("touchmove", handleTouchMove, { passive: false });
  element.addEventListener("touchend", handleTouchEnd, { passive: true });
}

restartButton.addEventListener("click", resetGame);
restartButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  resetGame();
}, { passive: false });
startButton.addEventListener("click", startGame);
startButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  startGame();
}, { passive: false });
canvas.addEventListener("click", () => {
  if (paused) {
    togglePause();
  }
});
overlayElement.addEventListener("click", () => {
  if (gameOver) {
    resetGame();
  } else if (paused) {
    togglePause();
  }
});

for (const button of touchButtons) {
  const handler = (event) => {
    event.preventDefault();
    const nextDirection = directionFromName(button.dataset.direction);
    if (nextDirection) {
      handleDirectionalInput(nextDirection);
    }
  };

  button.addEventListener("click", handler);
  button.addEventListener("touchstart", handler, { passive: false });
}

resetGame();
requestAnimationFrame(loop);
