document.addEventListener('DOMContentLoaded', ()=>{
    const grid = createGrid();
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const width = 10; // Also a reference to the 10th row of the tetromino grid
    let nextRandom = 0;
    let score = 0;
    let timerId;
    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
    ]

    // Creating the grid
    function createGrid() {
        // The main grid
        let grid = document.querySelector('.grid');
        for (let i = 0; i < 200; i++) {
            let gridElement = document.createElement('div');
            grid.appendChild(gridElement);
        }
        // Base of the main grid
        for (let i = 0; i < 10; i++) {
            let gridElement = document.createElement('div');
            gridElement.setAttribute('class', 'taken');
            grid.appendChild(gridElement);
        }
        return grid;
    }

    // The Tetrominoes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2,width*2+1,width*2+2]
    ]

    const zTetromino = [
        [width*2, width+1, width*2+1, width+2],
        [0, width, width+1, width*2+1],
        [width, width+1, width*2+1, width*2+2],
        [width*2, width, width+1, 1]
    ]

    const tTetromino = [
        [width, 1, width+1, width+2],
        [1, width+1, width*2+1,width+2],
        [width, width+1, width*2+1, width+2],
        [width, 1, width+1, width*2+1]
    ]

    const sqrTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
    ]

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, sqrTetromino, iTetromino];
    let currentPosition = 4;
    let currentRotation = 0;

    // Select a random tetromino
    let random = Math.floor(Math.random()*theTetrominoes.length);    
    let current = theTetrominoes[random][currentRotation];

    // Draw the Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
    }

    // Undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    // Assign functions to keyCodes
    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) { // Up key
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }
    document.addEventListener('keyup', control);
    // Move down function
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // Start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // Move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -=1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();
    }

    // Move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1);

        if (!isAtRightEdge) currentPosition +=1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();
    }

    // Rotate the tetromino
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) { // If the current rotation gets to 4, make it go back to 0
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        draw();
    }

    // Show up next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    // the Tetrominoes without rotations
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2], // lTetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2], // tTetromino
        [0, 1, displayWidth, displayWidth+1], // sqrTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
    ]

    // Display the shape in the mini-grid display
    function displayShape() {
        // Remove any trace of a tetromino for the entire grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        });
    }

    // Add functionality to the button
    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 500);
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
        }
    });

    // Add score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if (row.every (index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                })
                const squaresRemoved = squares.splice(i, width); // Take out the row
                squares = squaresRemoved.concat(squares);
                squares.forEach (cell => grid.appendChild(cell));
            }
        }
    }

    // Game over
    function gameOver(){
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
        }
    }
});