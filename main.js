document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    const modal = document.getElementById('rules-modal');
    const closeButton = document.querySelector('.close-button');
    const rulesButton = document.getElementById('rules-button');

    let board = [];
    let moveCount = 0;
    let isGameActive = false;
    let selectedPeg = null;

    const boardSizes = [5, 7, 9, 11, 13];
    const difficulties = ['超易', '较易', '中等', '较难', '超难'];

    // Default to easiest (slider value 1 = index 0)
    let boardSize = boardSizes[0];

    // ── Difficulty slider ──────────────────────────────────────────────────────
    difficultySlider.addEventListener('input', (event) => {
        const idx = event.target.value - 1;
        difficultyLabel.textContent = difficulties[idx];
        boardSize = boardSizes[idx];
        initializeBoard();
        drawBoard();
    });

    // ── Start button ───────────────────────────────────────────────────────────
    startButton.addEventListener('click', () => {
        messageDiv.textContent = '';
        messageDiv.style.color = '';
        moveCount = 0;
        isGameActive = true;
        updateMoveCounter();
        initializeBoard();
        drawBoard();
    });

    // ── Canvas click ───────────────────────────────────────────────────────────
    canvas.addEventListener('click', (event) => {
        if (!isGameActive) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        const cellSize = canvas.width / boardSize;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return;

        if (selectedPeg) {
            if (isValidMove(selectedPeg.row, selectedPeg.col, row, col)) {
                movePeg(selectedPeg.row, selectedPeg.col, row, col);
                moveCount++;
                updateMoveCounter();
                selectedPeg = null;
                drawBoard();

                if (isGameWon()) {
                    messageDiv.style.color = '#00E676';
                    messageDiv.textContent = `🎉 恭喜成功！共用了 ${moveCount} 步！`;
                    isGameActive = false;
                } else {
                    checkNoValidMoves();
                }
            } else if (board[row][col] === 1) {
                // Allow switching selection to another peg
                selectedPeg = { row, col };
                drawBoard();
            } else {
                selectedPeg = null;
                drawBoard();
            }
        } else {
            if (board[row][col] === 1) {
                selectedPeg = { row, col };
                drawBoard();
            }
        }
    });

    // ── Board initialisation ───────────────────────────────────────────────────
    function initializeBoard() {
        board = Array.from({ length: boardSize }, () => Array(boardSize).fill(1));
        const center = Math.floor(boardSize / 2);
        board[center][center] = 0;
        selectedPeg = null;
    }

    // ── Move validation ────────────────────────────────────────────────────────
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        if (toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) return false;
        if (board[toRow][toCol] !== 0) return false;
        const dRow = toRow - fromRow;
        const dCol = toCol - fromCol;
        const absDRow = Math.abs(dRow);
        const absDCol = Math.abs(dCol);
        if (absDRow === 2 && absDCol === 0) {
            return board[fromRow + dRow / 2][fromCol] === 1;
        }
        if (absDRow === 0 && absDCol === 2) {
            return board[fromRow][fromCol + dCol / 2] === 1;
        }
        return false;
    }

    function movePeg(fromRow, fromCol, toRow, toCol) {
        board[toRow][toCol] = 1;
        board[fromRow][fromCol] = 0;
        board[fromRow + (toRow - fromRow) / 2][fromCol + (toCol - fromCol) / 2] = 0;
    }

    // ── Win / lose checks ──────────────────────────────────────────────────────
    function isGameWon() {
        let pegCount = 0;
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === 1) pegCount++;
            }
        }
        return pegCount === 1;
    }

    function hasValidMoves() {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === 1) {
                    if (isValidMove(r, c, r - 2, c) ||
                        isValidMove(r, c, r + 2, c) ||
                        isValidMove(r, c, r, c - 2) ||
                        isValidMove(r, c, r, c + 2)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function checkNoValidMoves() {
        if (!hasValidMoves()) {
            // Count remaining pegs for feedback
            let remaining = 0;
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === 1) remaining++;
                }
            }
            messageDiv.style.color = '#FF6B6B';
            messageDiv.textContent = `😓 无法继续，剩余 ${remaining} 颗棋子，再来一次！`;
            isGameActive = false;
        }
    }

    function updateMoveCounter() {
        moveCounter.textContent = `步数: ${moveCount}`;
    }

    // ── Canvas drawing ─────────────────────────────────────────────────────────
    function drawBoard() {
        const size = canvas.width;
        const cellSize = size / boardSize;
        const padding = cellSize * 0.08;
        const pegRadius = (cellSize / 2) - padding;
        const holeRadius = pegRadius * 0.92;

        context.clearRect(0, 0, size, size);

        // Board background
        const bgGrad = context.createLinearGradient(0, 0, size, size);
        bgGrad.addColorStop(0, '#1a1050');
        bgGrad.addColorStop(1, '#0d0d2b');
        context.fillStyle = bgGrad;
        roundRect(context, 0, 0, size, size, 14);
        context.fill();

        // Grid lines (subtle)
        context.strokeStyle = 'rgba(255,255,255,0.04)';
        context.lineWidth = 1;
        for (let i = 0; i <= boardSize; i++) {
            context.beginPath();
            context.moveTo(i * cellSize, 0);
            context.lineTo(i * cellSize, size);
            context.stroke();
            context.beginPath();
            context.moveTo(0, i * cellSize);
            context.lineTo(size, i * cellSize);
            context.stroke();
        }

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cx = col * cellSize + cellSize / 2;
                const cy = row * cellSize + cellSize / 2;
                const isSelected = selectedPeg && selectedPeg.row === row && selectedPeg.col === col;
                const isTarget = board[row][col] === 0 && canMoveTo(row, col);

                // Draw hole (concave circle) for every cell
                drawHole(cx, cy, holeRadius, isTarget);

                if (board[row][col] === 1) {
                    if (isSelected) {
                        drawSelectedPeg(cx, cy, pegRadius);
                    } else {
                        drawPeg(cx, cy, pegRadius);
                    }
                }
            }
        }
    }

    function drawHole(cx, cy, radius, isTarget) {
        // Outer ring
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        if (isTarget) {
            context.fillStyle = 'rgba(0, 230, 118, 0.18)';
        } else {
            context.fillStyle = 'rgba(0, 0, 0, 0.55)';
        }
        context.fill();

        // Inner shadow for depth
        const innerGrad = context.createRadialGradient(cx, cy + radius * 0.15, 0, cx, cy, radius);
        if (isTarget) {
            innerGrad.addColorStop(0, 'rgba(0, 230, 118, 0.3)');
            innerGrad.addColorStop(0.6, 'rgba(0, 180, 80, 0.1)');
            innerGrad.addColorStop(1, 'rgba(0, 230, 118, 0.4)');
        } else {
            innerGrad.addColorStop(0, 'rgba(20, 10, 60, 0.6)');
            innerGrad.addColorStop(1, 'rgba(5, 5, 20, 0.9)');
        }
        context.beginPath();
        context.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
        context.fillStyle = innerGrad;
        context.fill();

        // Target pulse ring
        if (isTarget) {
            context.beginPath();
            context.arc(cx, cy, radius, 0, Math.PI * 2);
            context.strokeStyle = 'rgba(0, 230, 118, 0.7)';
            context.lineWidth = 2;
            context.stroke();

            // Small inner dot to show it's a target
            context.beginPath();
            context.arc(cx, cy, radius * 0.28, 0, Math.PI * 2);
            context.fillStyle = 'rgba(0, 230, 118, 0.6)';
            context.fill();
        }
    }

    function drawPeg(cx, cy, radius) {
        // Outer glow
        const glowGrad = context.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.2);
        glowGrad.addColorStop(0, 'rgba(255, 107, 107, 0.0)');
        glowGrad.addColorStop(1, 'rgba(255, 60, 60, 0.15)');
        context.beginPath();
        context.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
        context.fillStyle = glowGrad;
        context.fill();

        // Base sphere gradient (coral → crimson)
        const sphereGrad = context.createRadialGradient(
            cx - radius * 0.3, cy - radius * 0.3, radius * 0.05,
            cx, cy, radius
        );
        sphereGrad.addColorStop(0, '#FF9A9A');
        sphereGrad.addColorStop(0.4, '#FF6B6B');
        sphereGrad.addColorStop(1, '#C0392B');

        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fillStyle = sphereGrad;
        context.fill();

        // Specular shine
        addShine(cx, cy, radius);
    }

    function drawSelectedPeg(cx, cy, radius) {
        // Pulsing outer glow ring
        context.beginPath();
        context.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(255, 220, 0, 0.55)';
        context.lineWidth = 3;
        context.stroke();

        context.beginPath();
        context.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
        const outerGlow = context.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.15);
        outerGlow.addColorStop(0, 'rgba(255, 220, 0, 0)');
        outerGlow.addColorStop(1, 'rgba(255, 220, 0, 0.3)');
        context.fillStyle = outerGlow;
        context.fill();

        // Gold sphere
        const sphereGrad = context.createRadialGradient(
            cx - radius * 0.3, cy - radius * 0.35, radius * 0.05,
            cx, cy, radius
        );
        sphereGrad.addColorStop(0, '#FFFACD');
        sphereGrad.addColorStop(0.35, '#FFD700');
        sphereGrad.addColorStop(1, '#B8860B');

        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fillStyle = sphereGrad;
        context.fill();

        // Specular shine
        addShine(cx, cy, radius);
    }

    function addShine(cx, cy, radius) {
        const shineGrad = context.createRadialGradient(
            cx - radius * 0.3, cy - radius * 0.38, 0,
            cx - radius * 0.1, cy - radius * 0.2, radius * 0.65
        );
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.fillStyle = shineGrad;
        context.fill();
    }

    // Helper: draw a rounded rectangle path
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function canMoveTo(row, col) {
        if (!selectedPeg) return false;
        return isValidMove(selectedPeg.row, selectedPeg.col, row, col);
    }

    // ── Canvas resize ──────────────────────────────────────────────────────────
    function resizeCanvas() {
        const maxSize = Math.min(
            window.innerWidth * 0.92,
            window.innerHeight * 0.52,
            420
        );
        canvas.width = maxSize;
        canvas.height = maxSize;
        canvas.style.width = maxSize + 'px';
        canvas.style.height = maxSize + 'px';
        drawBoard();
    }

    // ── Modal ──────────────────────────────────────────────────────────────────
    rulesButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ── Init ───────────────────────────────────────────────────────────────────
    resizeCanvas();
    initializeBoard();
    drawBoard();

    window.addEventListener('resize', resizeCanvas);
});
