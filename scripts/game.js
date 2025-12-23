// Basic Frogger game structure
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 50;
const ROWS = 12;
const COLS = 12;

const frog = {
    x: Math.floor(COLS / 2),
    y: ROWS - 1,
    size: GRID_SIZE,
    color: 'lime',
    radius: GRID_SIZE / 2 - 4,
};


const cars = [];
const logs = [];
let score = 0;
let gameOver = false;
let gameTick = 0;
let GAME_SPEED = 12; // Lower is faster, higher is slower

function drawFrog() {
    // Draw frog as a circle with eyes
    const cx = frog.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = frog.y * GRID_SIZE + GRID_SIZE / 2;
    // Body
    const grad = ctx.createRadialGradient(cx, cy, frog.radius / 2, cx, cy, frog.radius);
    grad.addColorStop(0, '#7fff7f');
    grad.addColorStop(1, '#228B22');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, frog.radius, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 10, 6, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 10, 2, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 10, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawCars() {
    cars.forEach(car => {
        const x = car.x * GRID_SIZE;
        const y = car.y * GRID_SIZE;
        // Car body
        const grad = ctx.createLinearGradient(x, y, x + car.size, y + car.size);
        grad.addColorStop(0, '#ff4d4d');
        grad.addColorStop(1, '#b30000');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + 4, y + 10, car.size - 8, car.size - 20, 10);
        ctx.fill();
        // Windows
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 12, y + 16, car.size - 24, 12);
        // Wheels
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(x + 12, y + car.size - 8, 6, 0, Math.PI * 2);
        ctx.arc(x + car.size - 12, y + car.size - 8, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawLogs() {
    logs.forEach(log => {
        const x = log.x * GRID_SIZE;
        const y = log.y * GRID_SIZE;
        // Log body
        const grad = ctx.createLinearGradient(x, y, x + log.size, y);
        grad.addColorStop(0, '#deb887');
        grad.addColorStop(1, '#8b5a2b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 8, log.size - 4, GRID_SIZE - 16, 12);
        ctx.fill();
        // Log rings
        ctx.strokeStyle = '#fff8dc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 12, y + GRID_SIZE / 2, 8, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function draw() {
    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Water rows
    for (let y = 2; y <= 4; y++) {
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(0, y * GRID_SIZE, canvas.width, GRID_SIZE);
    }
    // Road rows
    for (let y = 8; y <= 10; y++) {
        ctx.fillStyle = '#444';
        ctx.fillRect(0, y * GRID_SIZE, canvas.width, GRID_SIZE);
        // Lane lines
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE + GRID_SIZE / 2);
        ctx.lineTo(canvas.width, y * GRID_SIZE + GRID_SIZE / 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    // Grass rows
    ctx.fillStyle = '#43a047';
    ctx.fillRect(0, 0, canvas.width, GRID_SIZE * 2);
    ctx.fillRect(0, 5 * GRID_SIZE, canvas.width, GRID_SIZE * 3);
    ctx.fillRect(0, 11 * GRID_SIZE, canvas.width, GRID_SIZE);
    drawLogs();
    drawCars();
    drawFrog();
    // UI overlay
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, 40);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 28);
    if (gameOver) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#000';
        ctx.fillRect(60, 220, 480, 160);
        ctx.restore();
        ctx.fillStyle = '#ff5252';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', 180, 300);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Press R to restart', 200, 340);
    }
}

function update() {
    if (gameOver) return;
    gameTick++;
    if (gameTick % GAME_SPEED !== 0) return;
    // Move cars
    cars.forEach(car => {
        car.x += car.speed;
        if (car.x < 0) car.x = COLS - 1;
        if (car.x >= COLS) car.x = 0;
    });
    // Move logs
    logs.forEach(log => {
        log.x += log.speed;
        if (log.x < 0) log.x = COLS - 1;
        if (log.x >= COLS) log.x = 0;
    });

    // Log riding and drowning mechanic
    let onLog = false;
    if (frog.y >= 2 && frog.y <= 4) {
        logs.forEach(log => {
            // Check if frog is on a log (log can be 2 grid wide)
            if (
                frog.y === log.y &&
                frog.x >= log.x &&
                frog.x < log.x + log.size / GRID_SIZE
            ) {
                onLog = true;
                // Move frog with log
                frog.x += log.speed;
            }
        });
        if (!onLog) {
            gameOver = true; // Drown
        } else {
            // If frog moves off screen with log, game over
            if (frog.x < 0 || frog.x >= COLS) {
                gameOver = true;
            }
        }
    }

    // Check collisions
    cars.forEach(car => {
        if (car.x === frog.x && car.y === frog.y) {
            gameOver = true;
        }
    });
    // Win condition
    if (frog.y === 0) {
        score++;
        resetFrog();
    }
}

// Game speed control
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
if (speedRange && speedValue) {
    speedRange.addEventListener('input', (e) => {
        GAME_SPEED = parseInt(speedRange.value, 10);
        speedValue.textContent = speedRange.value;
    });
}

function resetFrog() {
    frog.x = Math.floor(COLS / 2);
    frog.y = ROWS - 1;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function spawnCarsAndLogs() {
    // Cars on rows 8, 9, 10
    for (let y = 8; y <= 10; y++) {
        for (let i = 0; i < 3; i++) {
            cars.push({
                x: Math.floor(Math.random() * COLS),
                y: y,
                size: GRID_SIZE,
                color: 'red',
                speed: y % 2 === 0 ? 1 : -1,
            });
        }
    }
    // Logs on rows 2, 3, 4
    for (let y = 2; y <= 4; y++) {
        for (let i = 0; i < 2; i++) {
            logs.push({
                x: Math.floor(Math.random() * COLS),
                y: y,
                size: GRID_SIZE * 2,
                color: 'brown',
                speed: y % 2 === 0 ? 1 : -1,
            });
        }
    }
}

document.addEventListener('keydown', e => {
    if (gameOver) {
        if (e.key === 'r' || e.key === 'R') {
            // Restart game
            cars.length = 0;
            logs.length = 0;
            score = 0;
            gameOver = false;
            gameTick = 0;
            resetFrog();
            spawnCarsAndLogs();
        }
        return;
    }
    if (e.key === 'ArrowUp' && frog.y > 0) frog.y--;
    if (e.key === 'ArrowDown' && frog.y < ROWS - 1) frog.y++;
    if (e.key === 'ArrowLeft' && frog.x > 0) frog.x--;
    if (e.key === 'ArrowRight' && frog.x < COLS - 1) frog.x++;
});

spawnCarsAndLogs();
gameLoop();
