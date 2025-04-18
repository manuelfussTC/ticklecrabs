const gameBoard = document.getElementById('game-board');
const scoreBoard = document.getElementById('score');
const blueyOptionContainer = document.getElementById('bluey-option-container');
const bingoOptionContainer = document.getElementById('bingo-option-container');
const gullActiveSelect = document.getElementById('gull-active');
const gullSpeedSelect = document.getElementById('gull-speed');
const boardSize = 10; // Nur halb so viele Felder
let pacman = { x: 0, y: 0 };
let ghosts = [{ x: 9, y: 9, stuckCount: 0, lastMoves: [] }];
let foods = [];
let score = 0;
const maxFoods = 2;
let pacmanImage = 'images/Bluey.png';
let gullActive = true;
let gullSpeed = 500; // Standard: mittel (500ms)
const walls = [
    { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 },
    { x: 4, y: 4 }, { x: 4, y: 5 },
    { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 7, y: 8 },
    { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
];
let gameInterval;
let gamePaused = false;

// Event-Listener für die Möwen-Einstellungen
gullActiveSelect.addEventListener('change', updateGullSettings);
gullSpeedSelect.addEventListener('change', updateGullSettings);

function updateGullSettings() {
    gullActive = gullActiveSelect.value === 'true';
    
    // Geschwindigkeit basierend auf Auswahl setzen
    switch(gullSpeedSelect.value) {
        case 'extra-slow':
            gullSpeed = 2000; // extrem langsam: 2000ms
            break;
        case 'very-slow':
            gullSpeed = 1200; // sehr langsam: 1200ms
            break;
        case 'slow':
            gullSpeed = 800; // langsam: 800ms
            break;
        case 'medium':
            gullSpeed = 500; // mittel: 500ms
            break;
        case 'fast':
            gullSpeed = 300; // schnell: 300ms
            break;
    }
    
    // Spiel neu starten, um Einstellungen anzuwenden
    restartGameWithSettings();
}

function restartGameWithSettings() {
    stopGame();
    resetGame();
    startGame();
}

blueyOptionContainer.addEventListener('click', () => {
    pacmanImage = 'images/Bluey.png';
    updateCharacterSelection();
    drawPacman();
});

bingoOptionContainer.addEventListener('click', () => {
    pacmanImage = 'images/Bingo.png';
    updateCharacterSelection();
    drawPacman();
});

function updateCharacterSelection() {
    document.querySelectorAll('.character-option').forEach(option => option.classList.remove('selected'));
    if (pacmanImage.includes('Bluey')) {
        blueyOptionContainer.classList.add('selected');
    } else {
        bingoOptionContainer.classList.add('selected');
    }
}

function createBoard() {
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            gameBoard.appendChild(cell);
        }
    }
}

function drawPacman() {
    const cell = document.querySelector(`.cell[data-x='${pacman.x}'][data-y='${pacman.y}']`);
    cell.classList.add('pacman');
    cell.style.backgroundImage = `url('${pacmanImage}')`;
    cell.style.backgroundColor = ''; // Clear background color to maintain original
}

function drawGhosts() {
    if (!gullActive) return; // Wenn Möwe deaktiviert ist, nicht zeichnen
    
    ghosts.forEach(ghost => {
        const cell = document.querySelector(`.cell[data-x='${ghost.x}'][data-y='${ghost.y}']`);
        cell.classList.add('ghost');
        cell.style.backgroundColor = ''; // Clear background color to maintain original
    });
}

function clearPacman() {
    const cell = document.querySelector(`.cell[data-x='${pacman.x}'][data-y='${pacman.y}']`);
    cell.classList.remove('pacman');
    cell.style.backgroundImage = ''; // Clear background image
    cell.style.backgroundColor = ''; // Clear background color to maintain original
}

function clearGhosts() {
    ghosts.forEach(ghost => {
        const cell = document.querySelector(`.cell[data-x='${ghost.x}'][data-y='${ghost.y}']`);
        cell.classList.remove('ghost');
        cell.style.backgroundImage = ''; // Clear background image
        cell.style.backgroundColor = ''; // Clear background color to maintain original
    });
}

function drawWalls() {
    walls.forEach(wall => {
        const cell = document.querySelector(`.cell[data-x='${wall.x}'][data-y='${wall.y}']`);
        cell.classList.add('wall');
    });
}

function drawFoods() {
    foods.forEach(food => {
        const cell = document.querySelector(`.cell[data-x='${food.x}'][data-y='${food.y}']`);
        cell.classList.add('food');
        cell.style.backgroundColor = 'green'; // Set background color for Food
    });
}

function clearFoods() {
    foods.forEach(food => {
        const cell = document.querySelector(`.cell[data-x='${food.x}'][data-y='${food.y}']`);
        cell.classList.remove('food');
        cell.style.backgroundImage = ''; // Clear background image
        cell.style.backgroundColor = ''; // Clear background color to maintain original
    });
    foods = [];
}

function clearFood(x, y) {
    const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
    cell.classList.remove('food');
    cell.style.backgroundImage = ''; // Clear background image
    cell.style.backgroundColor = ''; // Clear background color to maintain original
}

function isWall(x, y) {
    return walls.some(wall => wall.x === x && wall.y === y);
}

function isFood(x, y) {
    return foods.some(food => food.x === x && food.y === y);
}

function movePacman(event) {
    if (gamePaused) return; // Spiel pausiert

    const key = event.key;
    let newX = pacman.x;
    let newY = pacman.y;

    if (key === 'ArrowUp') newY--;
    if (key === 'ArrowDown') newY++;
    if (key === 'ArrowLeft') newX--;
    if (key === 'ArrowRight') newX++;

    if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize && !isWall(newX, newY)) {
        clearPacman();
        pacman.x = newX;
        pacman.y = newY;
        drawPacman();
        eatFood(newX, newY);
        checkCollision();
    }
}

function moveGhosts() {
    if (gamePaused || !gullActive) return; // Nicht bewegen, wenn pausiert oder deaktiviert

    ghosts.forEach(ghost => {
        document.querySelector(`.cell[data-x='${ghost.x}'][data-y='${ghost.y}']`).classList.remove('ghost');

        let directions = [
            { x: ghost.x, y: ghost.y - 1, direction: 'up' },    // Up
            { x: ghost.x, y: ghost.y + 1, direction: 'down' },  // Down
            { x: ghost.x - 1, y: ghost.y, direction: 'left' },  // Left
            { x: ghost.x + 1, y: ghost.y, direction: 'right' }  // Right
        ];

        directions = directions.filter(dir =>
            dir.x >= 0 && dir.x < boardSize &&
            dir.y >= 0 && dir.y < boardSize &&
            !isWall(dir.x, dir.y)
        );

        // Finde die Richtung, die Pacman am nächsten kommt
        directions.sort((a, b) => {
            const distanceA = Math.abs(a.x - pacman.x) + Math.abs(a.y - pacman.y);
            const distanceB = Math.abs(b.x - pacman.x) + Math.abs(b.y - pacman.y);
            return distanceA - distanceB;
        });

        let nextMove;
        if (directions.length > 0) {
            nextMove = directions[0];
            // Überprüfen, ob der Geist zwischen zwei Feldern hin und her bewegt wird
            if (ghost.stuckCount >= 2 &&
                ghost.lastMoves[ghost.lastMoves.length - 1] === nextMove.direction &&
                ghost.lastMoves[ghost.lastMoves.length - 2] === getOppositeDirection(nextMove.direction)) {
                ghost.stuckCount++;
                // Wenn der Geist 2-mal hin und her bewegt wird, erweitere die Bewegungsvarianz
                nextMove = getExtendedMove(ghost, directions);
            } else {
                ghost.stuckCount = 0;
            }
        }

        if (nextMove) {
            ghost.x = nextMove.x;
            ghost.y = nextMove.y;
            ghost.lastMoves.push(nextMove.direction);
            if (ghost.lastMoves.length > 10) {
                ghost.lastMoves.shift(); // Begrenze die Anzahl der gespeicherten letzten Bewegungen
            }
        } else {
            // Wenn der Geist feststeckt, bewege ihn in eine zufällige Richtung
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            if (randomDirection) {
                ghost.x = randomDirection.x;
                ghost.y = randomDirection.y;
                ghost.lastMoves.push(randomDirection.direction);
                if (ghost.lastMoves.length > 10) {
                    ghost.lastMoves.shift();
                }
            }
        }

        drawGhosts();
        checkCollision();
    });
}

function getExtendedMove(ghost, directions) {
    let extendedDirections = [];
    let variance = ghost.stuckCount; // Erweitere die Varianz basierend auf der Anzahl der Feststeckungen

    for (let i = 1; i <= variance; i++) {
        extendedDirections.push({ x: ghost.x, y: ghost.y - i, direction: 'up' });
        extendedDirections.push({ x: ghost.x, y: ghost.y + i, direction: 'down' });
        extendedDirections.push({ x: ghost.x - i, y: ghost.y, direction: 'left' });
        extendedDirections.push({ x: ghost.x + i, y: ghost.y, direction: 'right' });
    }

    extendedDirections = extendedDirections.filter(dir =>
        dir.x >= 0 && dir.x < boardSize &&
        dir.y >= 0 && dir.y < boardSize &&
        !isWall(dir.x, dir.y)
    );

    extendedDirections.sort((a, b) => {
        const distanceA = Math.abs(a.x - pacman.x) + Math.abs(a.y - pacman.y);
        const distanceB = Math.abs(b.x - pacman.x) + Math.abs(b.y - pacman.y);
        return distanceA - distanceB;
    });

    return extendedDirections.length > 0 ? extendedDirections[0] : directions[0];
}

function getOppositeDirection(direction) {
    switch (direction) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
    }
}

function eatFood(x, y) {
    const foodIndex = foods.findIndex(food => food.x === x && food.y === y);
    if (foodIndex !== -1) {
        foods.splice(foodIndex, 1);
        clearFood(x, y);
        updateScore();
        generateFood();
        drawFoods();
        drawPacman();
    }
}

function generateFood() {
    while (foods.length < maxFoods) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);

        if (!isWall(x, y) && !isFood(x, y) && (x !== pacman.x || y !== pacman.y)) {
            foods.push({ x, y });
        }
    }
}

function checkCollision() {
    if (!gullActive) return; // Keine Kollisionsprüfung, wenn Möwe deaktiviert ist
    
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            stopGame();
            showOhNoOverlay();
        }
    });
}

function resetGame() {
    clearPacman();
    clearGhosts();
    clearFoods();
    pacman = { x: 0, y: 0 };
    ghosts = [{ x: 9, y: 9, stuckCount: 0, lastMoves: [] }];
    score = 0;
    scoreBoard.textContent = score;
    drawPacman();
    drawGhosts();
    generateFood();
    drawFoods();
    resetFriends(); // Freunde zurücksetzen
}

function startGame() {
    gamePaused = false;
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(moveGhosts, gullSpeed); // Geschwindigkeit aus Einstellungen verwenden
    document.addEventListener('keydown', movePacman);
}

function stopGame() {
    gamePaused = true;
    clearInterval(gameInterval);
    document.removeEventListener('keydown', movePacman);
}

// Magischer Effekt für besondere Ereignisse
let magicModeActive = false;

function activateMagicMode() {
    if (magicModeActive) return;
    
    magicModeActive = true;
    
    // Regenbogen-Effekt um das Spielfeld
    const gameBoard = document.getElementById('game-board');
    gameBoard.classList.add('rainbow-effect');
    
    // Pacman wird hüpfend
    const pacmanCell = document.querySelector('.pacman');
    if (pacmanCell) pacmanCell.classList.add('bounce');
    
    // Mache Geister drehend
    const ghostCells = document.querySelectorAll('.ghost');
    ghostCells.forEach(ghost => ghost.classList.add('spin'));
    
    // Mache Essen pulsierend
    const foodCells = document.querySelectorAll('.food');
    foodCells.forEach(food => food.classList.add('grow-shrink'));
    
    // Nach 5 Sekunden zurücksetzen
    setTimeout(() => {
        deactivateMagicMode();
    }, 5000);
}

function deactivateMagicMode() {
    magicModeActive = false;
    
    const gameBoard = document.getElementById('game-board');
    gameBoard.classList.remove('rainbow-effect');
    
    const pacmanCell = document.querySelector('.pacman');
    if (pacmanCell) pacmanCell.classList.remove('bounce');
    
    const ghostCells = document.querySelectorAll('.ghost');
    ghostCells.forEach(ghost => ghost.classList.remove('spin'));
    
    const foodCells = document.querySelectorAll('.food');
    foodCells.forEach(food => food.classList.remove('grow-shrink'));
}

// Exportiere für andere Dateien
window.activateMagicMode = activateMagicMode;

document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    drawPacman();
    drawGhosts();
    drawWalls();
    generateFood();
    drawFoods();
    startGame();
    
    // Zufällig den magischen Modus aktivieren
    setInterval(() => {
        // 10% Chance alle 30 Sekunden
        if (Math.random() < 0.1 && !gamePaused) {
            activateMagicMode();
        }
    }, 30000);
});
