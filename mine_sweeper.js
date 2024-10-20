window.onload = function() {
    setGame();
}

const tiles = 256;
const tilesValues = Array.from({ length: 16 }, () => Array(16).fill(0));
const mines = 40;
let flags = mines;
const minesPositions = new Array(mines);
const flagsPositions = new Array(mines);
const mineIcon = '💣';
const flagIcon = '🚩';
let alive = true;
const colors = {1: 'blue',2: 'green',3: 'red',4: 'purple',5: 'maroon',6: 'turquoise',7: 'black',8: 'grey'};
let revealedTiles = 0;

function setGame() {
    //Game grid
    for (let i = 0; i < tiles; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener('click', selectTile);
        tile.addEventListener('contextmenu', toggleFlag);            
        document.getElementById("board").appendChild(tile);
    }

    assignMines();
}

function placeMine() {
    let num;
    do {
        num = Math.floor(Math.random() * tiles);
    } while (minesPositions.includes(num));
    minesPositions.push(num);
    row = Math.floor(num/16);
    col = num%16;
    tilesValues[row][col] = -1;
}

function assignMines() {
    for (let i = 0; i < mines; i++) {
        placeMine();
    }
}

function checkForMines(row, col) {
    let mineCount = 0;
    const adjacentTiles = [];

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;

        if (newRow >= 0 && newRow < 16 && newCol >= 0 && newCol < 16) {
            adjacentTiles.push([newRow, newCol]);
            if (tilesValues[newRow][newCol] == -1) {
                mineCount++;
            }
        }
    }

    return { mineCount, adjacentTiles };
}

function revealSafeTiles(row, col) {
    const { mineCount, adjacentTiles } = checkForMines(row, col);

    const tileId = row * 16 + col;
    const tile = document.getElementById(tileId);
    if (tile.classList.contains('pressed')) {
        return;
    }

    tile.classList.add('pressed');
    tile.removeEventListener('click', selectTile);
    tile.removeEventListener('contextmenu', toggleFlag);
    revealedTiles++;

    if (mineCount > 0) {
        tile.innerText = mineCount;
        tile.style.color = colors[mineCount];
    } else {
        tile.innerText = '';

        for (const [adjRow, adjCol] of adjacentTiles) {
            revealSafeTiles(adjRow, adjCol);
        }
    }

    checkWinCondition();
}

function checkWinCondition() {
    const allSafeTilesRevealed = (revealedTiles + mines === tiles);

    const allFlagsCorrect = minesPositions.every(mine => {
        return flagsPositions.includes(mine.toString()); 
    });

    if (allSafeTilesRevealed && allFlagsCorrect) {
        document.getElementById("score").innerText = "¡Victoria!";
        alive = false;
        placeRemainingFlags();
    }
}

function placeRemainingFlags() {
    minesPositions.forEach(mine => {
        let tile = document.getElementById(mine.toString());
        if (!tile.classList.contains('flagged')) {
            tile.classList.add('flagged');
            tile.innerText = flagIcon;
        }
    });
}

function revealMines() {
    minesPositions.forEach(mine => {
        let id = mine.toString();
        let tile = document.getElementById(id);
        tile.classList.add('pressed');
        tile.innerText = mineIcon;
    });
}

function selectTile() {
    if (!alive) {
        return;
    }

    let id = parseInt(this.id);
    let row = Math.floor(id / 16);
    let col = id % 16;

    if (minesPositions.includes(id)) {
        document.getElementById("score").innerText = "BOOM";
        this.classList.toggle('pressed');
        this.innerText = mineIcon;
        this.style.background = 'red';
        revealMines();
        alive = false;
    } else {
        document.getElementById("score").innerText = "Safe";
        revealSafeTiles(row, col);
    }

    this.removeEventListener('click', selectTile);
}

function toggleFlag(event) {
    event.preventDefault();
    this.classList.toggle('flagged');
    
    if (this.classList.contains('flagged')) {
        flags--;
        flagsPositions.push(this.id);
        this.innerText = flagIcon;
    } else {
        this.innerText = '';
        flags++;
        const idx = flagsPositions.findIndex(flag => flag === this.id);
        if (idx !== -1) {
            flagsPositions.splice(idx, 1);
        }
    }
}