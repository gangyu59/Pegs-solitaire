document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    const rulesButton = document.getElementById('rules-button');
    const modal = document.getElementById('rules-modal');
    const closeButton = document.querySelector('.close-button');

    let board = [];
    let moveCount = 0;
    let isGameActive = false;
    let selectedPeg = null;
    const boardSizes = [5, 7, 9, 11, 13];
    let boardSize = boardSizes[2];

    const difficulties = ['超易', '较易', '中等', '较难', '超难'];
    const pegIcon = '♟️'; // 使用棋子的图标

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
        boardSize = boardSizes[event.target.value - 1];
        initializeBoard();
        drawBoard();
    });

    startButton.addEventListener('click', () => {
        messageDiv.textContent = '';
        moveCount = 0;
        isGameActive = true;
        moveCounter.textContent = `步数 = ${moveCount}`;
        initializeBoard();
        drawBoard();
    });

    canvas.addEventListener('click', (event) => {
        if (!isGameActive) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / (rect.width / boardSize));
        const row = Math.floor(y / (rect.height / boardSize));

        if (selectedPeg) {
            if (isValidMove(selectedPeg.row, selectedPeg.col, row, col)) {
                movePeg(selectedPeg.row, selectedPeg.col, row, col);
                moveCount++;
                moveCounter.textContent = `步数 = ${moveCount}`;
                selectedPeg = null;
                drawBoard();

                if (isGameWon()) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = `恭喜成功！一共用了${moveCount}步。`;
                    isGameActive = false;
                } else if (!hasValidMoves()) {
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = `失败了，再来一次，加油！`;
                    isGameActive = false;
                }
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

        if (!isGameActive) {
            checkNoValidMoves();
        }
    });

    function initializeBoard() {
        board = Array.from({ length: boardSize }, () => Array(boardSize).fill(1));
        const center = Math.floor(boardSize / 2);
        board[center][center] = 0; // Empty center
    }

    function isValidMove(fromRow, fromCol, toRow, toCol) {
        if (board[toRow][toCol] !== 0) return false;
        const dRow = Math.abs(toRow - fromRow);
        const dCol = Math.abs(toCol - fromCol);
        if (dRow === 2 && dCol === 0 && board[(fromRow + toRow) / 2][fromCol] === 1) return true;
        if (dRow === 0 && dCol === 2 && board[fromRow][(fromCol + toCol) / 2] === 1) return true;
        return false;
    }

    function movePeg(fromRow, fromCol, toRow, toCol) {
        board[toRow][toCol] = 1;
        board[fromRow][fromCol] = 0;
        board[(fromRow + toRow) / 2][(fromCol + toCol) / 2] = 0;
    }

    function isGameWon() {
        let pegCount = 0;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 1) pegCount++;
            }
        }
        return pegCount === 1;
    }

    function hasValidMoves() {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 1) {
                    if (isValidMove(row, col, row - 2, col) ||
                        isValidMove(row, col, row + 2, col) ||
                        isValidMove(row, col, row, col - 2) ||
                        isValidMove(row, col, row, col + 2)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function drawBoard() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const cellSize = Math.min(canvas.width / boardSize, canvas.height / boardSize);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `${cellSize / 2}px Arial`;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (selectedPeg && selectedPeg.row === row && selectedPeg.col === col) {
                    context.fillStyle = 'yellow';
                } else if (board[row][col] === 0 && canMoveTo(row, col)) {
                    context.fillStyle = 'green';
                } else {
                    context.fillStyle = 'lightgray';
                }
                context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                context.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

                if (board[row][col] === 1) {
                    context.fillStyle = 'blue';
                    context.fillText(pegIcon, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
                }
            }
        }
    }

    function canMoveTo(row, col) {
        if (selectedPeg === null) return false;
        return isValidMove(selectedPeg.row, selectedPeg.col, row, col);
    }

    function checkNoValidMoves() {
        if (!hasValidMoves()) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = `失败了，再来一次，加油！`;
            isGameActive = false;
        }
    }

    function resizeCanvas() {
        const minDimension = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        canvas.width = minDimension;
        canvas.height = minDimension;
        drawBoard();
    }

    // Initialize game
    resizeCanvas();
    initializeBoard();
    drawBoard();

    // Rules modal
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

    window.addEventListener('resize', resizeCanvas);
});