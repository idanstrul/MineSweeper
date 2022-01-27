'use strict'

const MINE = '💣';
const FLAG = '🚩';
const LIVE = '🧡'
const CONCERNED_SMILEY = ['🤔','😮','😯','😫','😕','😲','😖','😟','😭','😨','😰','😱','🥵','🥺'];

var gBoard;
var gGame;
var gLevels = [{ size: 4, mines: 2 }, { size: 8, mines: 12 }, { size: 12, mines: 30 }];
var gLevel = gLevels[0];
var gMineLocations;
var gActionLocationStack;


function initGame() {
    resetAllVars();
    resetTimer();
    resetMsg()
    gBoard = createBoard();
    renderBoard(gBoard, '.board-container');
    renderLives();
}

function startGame() {
    gGame.isOn = true;
    startTimer()
    addMines(gLevel.mines);
    updateMinesAroundCounts(gBoard);
    revealCells(gActionLocationStack[gActionLocationStack.length - 1]);
}

function endGame(isWinner) {
    gGame.isOn = false;
    gGame.isOver = true;
    stopTimer();
    var elSmiley = document.querySelector('.smiley');
    var elmsg = document.querySelector('.msg');
    if (isWinner) {
        elmsg.innerHTML = 'You Are a Winner!';
        elSmiley.innerHTML = '😎'
    } else {
        elmsg.innerHTML = 'GAME OVER!';
        elSmiley.innerHTML = '🤯'
    }
}

function changeLevel(levelIdx) {
    gLevel = gLevels[levelIdx];
    initGame()
}

function resetAllVars() {
    gGame = {
        isOn: false,
        isOver: false,
        lives: 3, //EXTRA FETURE
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    }
    gMineLocations = [];
    gActionLocationStack = [];
}

function resetMsg(){
    var elMsg = document.querySelector('.msg');
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = '😁';
    elMsg.innerHTML = '';
}

function createBoard() {
    var Board = []
    for (var i = 0; i < gLevel.size; i++) {
        var row = []
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            row.push(cell)
        }
        Board.push(row)
    }
    return Board
}


function renderBoard(board, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var className = `cell cell-${i}-${j}`;
            strHTML += `<td class="${className}" onclick="CellClicked(this, ${i}, ${j})" oncontextmenu="markCell(event, ${i}, ${j})"></td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function addMines(numOfMines) {
    var rndEmptyCellLocations = shuffle(getEmptyCellLocations(gBoard));
    for (var i = 0; i < numOfMines; i++) {
        var currLocation = rndEmptyCellLocations.pop();
        gMineLocations.push(currLocation);
        gBoard[currLocation.i][currLocation.j].isMine = true;
    }
}

function getEmptyCellLocations(board) {
    var emptyCellLocations = [];
    var firstRevealedLocation = gActionLocationStack[gActionLocationStack.length - 1];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            // d -> distance between first click location to current location:
            var d = Math.sqrt((firstRevealedLocation.i - i) ** 2 + (firstRevealedLocation.j - j) ** 2);

            // Exclode all cells around first clicked cell:
            if (d > Math.SQRT2) emptyCellLocations.push({ i, j });
        }
    }
    return emptyCellLocations;
}

function updateMinesAroundCounts(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine) continue;
            currCell.minesAroundCount = countMinesAround({ i, j }, board)
        }
    }
}

function countMinesAround(location, board) {
    var minesAroundCount = 0;
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === location.i && j === location.j) continue;
            if (board[i][j].isMine) minesAroundCount++;
        }
    }
    return minesAroundCount;
}


function CellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.isMarked || cell.isShown || gGame.isOver) return;

    gActionLocationStack.push({ i, j, event: 'leftClick' });
    if (!gGame.isOn) return startGame();
    if (cell.isMine) {
        gGame.lives--;
        renderLives();
        if (gGame.lives === 0) {
            revealMines();
            endGame(false);
        }
    }
    revealCells({ i, j });
}

function revealMines() {
    for (var location of gMineLocations) {
        gBoard[location.i][location.j].isShown = true;
        renderCell(location);
    }
}

function revealCells(location) {
    var currCell = gBoard[location.i][location.j];
    if (currCell.isShown || currCell.isMarked) return;
    currCell.isShown = true;
    renderCell(location);
    gGame.shownCount++;
    checkIfGameOver();

    if (currCell.minesAroundCount === 0 && !currCell.isMine) {
        for (var i = location.i - 1; i <= location.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = location.j - 1; j <= location.j + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                if (i === location.i && j === location.j) continue;
                revealCells({ i, j });
            }
        }
    }
}

function checkIfGameOver() {
    var livesLost = 3 - gGame.lives; // 3 is the initial lives count - if there will be any need to change initial lives count, 3 should be changed to a dinamic variable.
    var totalSafecells = gLevel.size ** 2 - gLevel.mines + livesLost;
    if (gGame.shownCount === totalSafecells &&
        gGame.markedCount + livesLost === gLevel.mines) endGame(true);
}

// location such as: {i: 2, j: 7}
function renderCell(location) {
    var cell = gBoard[location.i][location.j];
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var elCellContent;

    if (!cell.isShown) {
        if (cell.isMarked) elCellContent = FLAG;
        else elCellContent = '';
    } else {
        if (cell.isMine) elCellContent = MINE;
        else if (cell.minesAroundCount === 0) elCellContent = cell.minesAroundCount; // This maybe should be changed later to be an empty cell, only with different style.
        else elCellContent = cell.minesAroundCount;
    }
    elCell.innerHTML = elCellContent;
}


function markCell(event, i, j) {
    event.preventDefault();
    var cell = gBoard[i][j]
    if (cell.isShown || gGame.isOver) return;


    gActionLocationStack.push({ i, j, event: 'rightClick' })
    startTimer();       // if !gGame.isOn is not necessary here becuase of startTimer's implementation.
    if (!cell.isMarked) {
        cell.isMarked = true;
        gGame.markedCount++;
    } else {
        cell.isMarked = false;
        gGame.markedCount--;
    }
    renderCell({ i, j });
    checkIfGameOver();
}
