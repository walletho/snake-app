const SUPABASE_URL = "https://ytmtahwjoqjyurxzpzhu.supabase.co";
const SUPABASE_KEY = "sb_publishable_bZiYyIUDFTmL055d8FIl_g_r5dKWett";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highscoreElement = document.getElementById("highscore");
const overlayElement = document.getElementById("overlay");
const overlayTitleElement = document.getElementById("overlayTitle");
const overlayTextElement = document.getElementById("overlayText");
const scoreFormElement = document.getElementById("scoreForm");
const playerNameInput = document.getElementById("playerName");
const submitScoreButton = document.getElementById("submitScoreButton");
const skipScoreButton = document.getElementById("skipScoreButton");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const mobileStartButton = document.getElementById("mobileStartButton");
const mobilePauseButton = document.getElementById("mobilePauseButton");
const leaderboardButton = document.getElementById("leaderboardButton");
const leaderboardPanel = document.getElementById("leaderboardPanel");
const leaderboardList = document.getElementById("leaderboardList");
const closeLeaderboardButton = document.getElementById("closeLeaderboardButton");
const touchButtons = document.querySelectorAll("[data-direction]");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const tickMs = 120;
const highscoreKey = "snake-app-highscore";
const minSwipeDistance = 24;
const isTouchPreferred = window.matchMedia("(pointer: coarse), (max-width: 900px)").matches;

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

function showScoreForm() {
  scoreFormElement.classList.remove("hidden");
  startButton.classList.add("hidden");
  playerNameInput.value = "";
  if (!isTouchPreferred) {
    playerNameInput.focus();
  }
}

function hideScoreForm() {
  scoreFormElement.classList.add("hidden");
  startButton.classList.remove("hidden");
}

function showGameOverOverlay() {
  overlayTitleElement.textContent = "Game Over";
  overlayTextElement.textContent = `Score: ${score}`;
  overlayElement.classList.remove("hidden");
  if (score > 0) {
    showScoreForm();
  }
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

function updateOverlayForMode() {
  if (isTouchPreferred) {
    overlayTextElement.textContent = "Tippe auf Start und steuere mit den grossen Pfeil-Buttons oder per Wischgeste.";
  } else {
    overlayTextElement.textContent = "Druecke eine Richtungstaste oder tippe auf Start, um zu beginnen.";
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
  hideScoreForm();
  showOverlay("Spiel starten", "");
  updateOverlayForMode();
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
    if (!scoreFormElement.classList.contains("hidden")) return;
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
    showGameOverOverlay();
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
      index === 0 ? "#00BFFF" : "#87CEEB",
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
    showOverlay("Pausiert", isTouchPreferred
      ? "Tippe auf Start oder Pause zum Fortsetzen."
      : "Druecke Leertaste oder Start zum Fortsetzen.");
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

async function doSubmitScore() {
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }
  submitScoreButton.disabled = true;
  await db.from("scores").insert({ name, score });
  submitScoreButton.disabled = false;
  hideScoreForm();
  showOverlay("Game Over", isTouchPreferred
    ? "Tippe auf Start oder Neu starten fuer eine neue Runde."
    : "Druecke Enter oder tippe auf Start fuer eine neue Runde.");
}

async function openLeaderboard() {
  leaderboardPanel.classList.remove("hidden");
  leaderboardList.innerHTML = "<li class='leaderboard-loading'>Wird geladen…</li>";
  const { data } = await db
    .from("scores")
    .select("name, score")
    .order("score", { ascending: false })
    .limit(20);
  const entries = data ?? [];
  if (entries.length === 0) {
    leaderboardList.innerHTML = "<li class='leaderboard-loading'>Noch keine Eintraege.</li>";
    return;
  }
  leaderboardList.innerHTML = entries
    .map((entry, i) => {
      const safeName = entry.name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return `<li class="leaderboard-item">
        <span class="rank">${i + 1}</span>
        <span class="lb-name">${safeName}</span>
        <span class="lb-score">${entry.score}</span>
      </li>`;
    })
    .join("");
}

window.addEventListener("keydown", (event) => {
  if (document.activeElement === playerNameInput) return;

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

playerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.stopPropagation();
    doSubmitScore();
  }
});

canvas.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  if (!touch || touchStartX === null || touchStartY === null) return;
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  touchStartX = null;
  touchStartY = null;
  if (Math.max(absX, absY) < minSwipeDistance) return;
  if (absX > absY) {
    startMoving(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    return;
  }
  startMoving(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
}, { passive: true });

[startButton, mobileStartButton].forEach((button) => {
  button.addEventListener("click", startGame);
});

restartButton.addEventListener("click", resetGame);

mobilePauseButton.addEventListener("click", () => {
  if (!gameStarted && !paused) {
    startGame();
    return;
  }
  togglePause();
});

touchButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const nextDirection = directionFromName(button.dataset.direction);
    if (nextDirection) {
      startMoving(nextDirection);
    }
  });
});

submitScoreButton.addEventListener("click", doSubmitScore);

skipScoreButton.addEventListener("click", () => {
  hideScoreForm();
  showOverlay("Game Over", isTouchPreferred
    ? "Tippe auf Start oder Neu starten fuer eine neue Runde."
    : "Druecke Enter oder tippe auf Start fuer eine neue Runde.");
});

leaderboardButton.addEventListener("click", openLeaderboard);
closeLeaderboardButton.addEventListener("click", () => leaderboardPanel.classList.add("hidden"));

resetGame();
requestAnimationFrame(loop);
