const shogiBoard = document.getElementById('shogiBoard');
let gridRows = 9; // Initial grid rows
let gridCols = 9; // Initial grid columns
let snake = [{x: 4, y: 4}]; // Initial snake position
let direction = {x: 1, y: 0}; // Start moving right
let onigiri = getRandomPosition();
let specialOnigiri = getRandomPosition();
let snakeSpeed = 200; // Initial speed
let isSpecialOnigiriActive = false;

window.addEventListener("keydown", function(event) {
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault(); // Prevent the default scrolling behavior
    }
}, false);

function getRandomPosition() {
    return {x: Math.floor(Math.random() * gridCols), y: Math.floor(Math.random() * gridRows)};
}

function createShogiBoard() {
    shogiBoard.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    shogiBoard.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            const square = document.createElement('div');
            square.classList.add('board-square');
            // Apply a checkered pattern based on row and column indices
            if ((i + j) % 2 === 0) {
                square.style.backgroundColor = '#d9a866'; // Darker wood color
            } else {
                square.style.backgroundColor = '#e6c288'; // Lighter wood color
            }
            square.style.border = '1px solid #8b4513'; // Grid lines
            square.setAttribute('data-x', i);
            square.setAttribute('data-y', j);
            shogiBoard.appendChild(square);
        }
    }
}

function clearElements() {
    document.querySelectorAll('.snake, .onigiri, .specialOnigiri').forEach(element => {
        element.classList.remove('snake', 'onigiri', 'specialOnigiri'); // Remove previous classes
    });
}

function drawSnake() {
    snake.forEach(segment => {
        const square = document.querySelector(`div[data-x="${segment.y}"][data-y="${segment.x}"]`);
        if (square) square.classList.add('snake');
    });
}

function drawOnigiri() {
    const square = document.querySelector(`div[data-x="${onigiri.y}"][data-y="${onigiri.x}"]`);
    if (square) square.classList.add('onigiri');
}

function drawSpecialOnigiri() {
    if (isSpecialOnigiriActive) {
        const square = document.querySelector(`div[data-x="${specialOnigiri.y}"][data-y="${specialOnigiri.x}"]`);
        if (square) square.classList.add('specialOnigiri');
    }
}

function expandBoard() {
    // Increment the grid size
    gridRows += 1;
    gridCols += 1;

    // Clear the board and create a new one with updated size
    shogiBoard.innerHTML = '';
    createShogiBoard();

    // Adjust the snake's position if needed
    snake = snake.map(segment => {
        return {
            x: Math.min(segment.x, gridCols - 1),
            y: Math.min(segment.y, gridRows - 1)
        };
    });

    // Redraw the snake, onigiri, and special onigiri
    clearElements();
    drawSnake();
    drawOnigiri();
    drawSpecialOnigiri();
}

function shrinkBoard() {
    if (gridRows > 1 && gridCols > 1) { // Ensure the board doesn't shrink below 1x1
        // Decrement the grid size
        gridRows -= 1;
        gridCols -= 1;

        // Ensure the onigiri is within the new grid
        if (onigiri.x >= gridCols) onigiri.x = gridCols - 1;
        if (onigiri.y >= gridRows) onigiri.y = gridRows - 1;

        // Ensure the special onigiri is within the new grid (if active)
        if (isSpecialOnigiriActive) {
            if (specialOnigiri.x >= gridCols) specialOnigiri.x = gridCols - 1;
            if (specialOnigiri.y >= gridRows) specialOnigiri.y = gridRows - 1;
        }

        // Adjust the snake's position if needed
        snake = snake.filter(segment => segment.x < gridCols && segment.y < gridRows);

        // Clear the board and create a new one with updated size
        shogiBoard.innerHTML = '';
        createShogiBoard();

        // Redraw the snake, onigiri, and special onigiri
        clearElements();
        drawSnake();
        drawOnigiri();
        drawSpecialOnigiri();
    }
}


function answerQuestion(answer) {
    if (answer === 'で') { // Correct answer
        alert('Correct!');
        expandBoard(); // Expand the board as a reward
    } else {
        alert('Wrong!');
        shrinkBoard(); // Shrink the board as a penalty
    }
    hideQuestion();
}

function moveSnake() {
    const newHead = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Check for wall collision
    if (newHead.x < 0 || newHead.x >= gridCols || newHead.y < 0 || newHead.y >= gridRows || snakeCollision(newHead)) {
        alert('Game Over!');
        resetGame();
        return;
    }

    snake.unshift(newHead);

    // Check if snake eats onigiri
    if (newHead.x === onigiri.x && newHead.y === onigiri.y) {
        onigiri = getRandomPosition();
        if (Math.random() < 0.3) { // 30% chance to spawn special onigiri
            isSpecialOnigiriActive = true;
            specialOnigiri = getRandomPosition();
        }
    } else {
        snake.pop();
    }

    // Check if snake eats special onigiri
    if (isSpecialOnigiriActive && newHead.x === specialOnigiri.x && newHead.y === specialOnigiri.y) {
        isSpecialOnigiriActive = false;
        showGrammarQuestion();
        return; // Pause the game to display the question
    }

    clearElements();
    drawSnake();
    drawOnigiri();
    drawSpecialOnigiri();
}

function snakeCollision(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function changeDirection(event) {
    switch(event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = {x: 1, y: 0};
            break;
    }
}

function showGrammarQuestion() {
    questionBox.classList.remove('hidden');
    clearInterval(gameInterval); // Pause the game
}

function hideQuestion() {
    questionBox.classList.add('hidden');
    gameInterval = setInterval(moveSnake, snakeSpeed); // Resume game
}

function resetGame() {
    snake = [{x: 4, y: 4}];
    direction = {x: 1, y: 0};
    onigiri = getRandomPosition();
    specialOnigiri = getRandomPosition();
    snakeSpeed = 200;
    isSpecialOnigiriActive = false;
    gridRows = 9; // Reset grid size
    gridCols = 9; // Reset grid size
    drawBoard();
}

function drawBoard() {
    shogiBoard.innerHTML = ''; // Clear the board
    createShogiBoard(); // Create the checkered pattern board
    drawSnake(); // Draw the snake on the board
    drawOnigiri(); // Draw the onigiri
    drawSpecialOnigiri(); // Draw the special onigiri (if any)
}

let gameInterval = setInterval(moveSnake, snakeSpeed);
window.addEventListener('keydown', changeDirection);
drawBoard();
