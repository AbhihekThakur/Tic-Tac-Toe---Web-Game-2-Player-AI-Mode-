const boardEl = document.getElementById('board');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const pauseBtn = document.getElementById('pauseBtn');
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popupTitle');
const popupMessage = document.getElementById('popupMessage');
const themeToggle = document.getElementById('themeToggle');
const muteToggle = document.getElementById('muteToggle');
const modeSelect = document.getElementById('modeSelect');

const bgMusic = new Audio('sounds/bg-music.mp3');
const winSound = new Audio('sounds/win-sound.wav');
const drawSound = new Audio('sounds/draw-sound.wav');

bgMusic.loop = true;
bgMusic.volume = 0.4;
winSound.volume = 0.8;
drawSound.volume = 0.7;

let board = Array(9).fill('');
let currentPlayer = 'X';
let score = { X: 0, O: 0 };
let paused = false;
let gameEnded = false;
let gameMode = modeSelect.value;

function createBoard() {
  boardEl.innerHTML = '';
  board.forEach((cell, i) => {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    cellEl.textContent = cell;
    cellEl.style.color = cell === 'X'
      ? (document.body.classList.contains('dark-mode') ? '#00f5ff' : '#0033cc')
      : cell === 'O'
      ? (document.body.classList.contains('dark-mode') ? '#ff00c8' : '#cc0066')
      : '';
    cellEl.addEventListener('click', () => makeMove(i));
    boardEl.appendChild(cellEl);
  });
}

function makeMove(i) {
  if (paused || gameEnded || board[i]) return;

  board[i] = currentPlayer;
  createBoard();
  if (!muteToggle.checked && bgMusic.paused) bgMusic.play();

  if (checkWin(currentPlayer)) {
    const winnerMsg = currentPlayer === 'O' && gameMode === "1" ? "💻 AI Wins!" : `Player ${currentPlayer} wins!`;
    showPopup("🎉 Congratulations!", winnerMsg);
    score[currentPlayer]++;
    updateScores();
    gameEnded = true;
    return;
  }

  if (board.every(cell => cell)) {
    showPopup("🤝 It's a Draw!", "Well played both sides!");
    gameEnded = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (gameMode === "1" && currentPlayer === 'O' && !gameEnded) {
    setTimeout(makeAIMove, 300);
  }
}

function makeAIMove() {
  if (gameEnded || paused) return;

  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  if (move !== undefined) {
    board[move] = 'O';
    createBoard();

    if (checkWin('O')) {
      showPopup("💻 AI Wins!", "Better luck next time!");
      score.O++;
      updateScores();
      gameEnded = true;
      return;
    }

    if (board.every(cell => cell)) {
      showPopup("🤝 It's a Draw!", "Well played!");
      gameEnded = true;
      return;
    }

    currentPlayer = 'X';
  }
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWin('O')) return 10 - depth;
  if (checkWin('X')) return depth - 10;
  if (newBoard.every(cell => cell)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWin(player) {
  const winConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winConditions.some(([a,b,c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
}

function restartGame() {
  stopAllSounds();
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameEnded = false;
  paused = false;
  pauseBtn.textContent = 'Pause';
  popup.classList.add('hidden');
  createBoard();
  if (!muteToggle.checked) {
    bgMusic.currentTime = 0;
    bgMusic.volume = 0.4;
    bgMusic.play();
  }
}

function resetScores() {
  score = { X: 0, O: 0 };
  updateScores();
}

function updateScores() {
  scoreXEl.textContent = score.X;
  scoreOEl.textContent = score.O;
}

function togglePause() {
  if (gameEnded) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (paused) bgMusic.pause();
  else if (!muteToggle.checked) bgMusic.play();
}

function showPopup(title, message) {
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  popup.classList.remove('hidden');

  // Lower bg music
  bgMusic.volume = 0.1;

  // Play sounds
  if (!muteToggle.checked) {
    if (title.includes("Congratulations")) {
      winSound.currentTime = 0;
      winSound.play();
    } else if (title.includes("Draw")) {
      drawSound.currentTime = 0;
      drawSound.play();
    }
  }
}

function stopAllSounds() {
  winSound.pause();
  drawSound.pause();
  winSound.currentTime = 0;
  drawSound.currentTime = 0;
  bgMusic.volume = muteToggle.checked ? 0 : 0.4;
}

function closePopup() {
  popup.classList.add('hidden');
  stopAllSounds();
  restartGame();
}

// Theme Load on Page Load
window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("theme") === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.checked = isDark;
});

// Theme Switch
themeToggle.addEventListener('change', () => {
  const isDark = themeToggle.checked;
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  createBoard();
});

// Mute Toggle
muteToggle.addEventListener('change', () => {
  const isMuted = muteToggle.checked;
  bgMusic.muted = isMuted;
  winSound.muted = isMuted;
  drawSound.muted = isMuted;

  if (isMuted) {
    bgMusic.pause();
  } else if (!paused) {
    bgMusic.play();
    bgMusic.volume = popup.classList.contains('hidden') ? 0.4 : 0.1;
  }
});

// Game mode switch
modeSelect.addEventListener('change', () => {
  gameMode = modeSelect.value;
  restartGame();
});

createBoard();
