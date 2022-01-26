'use strict'

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gGame;
var gLevel;
var gMineLocations;
var gActionLocationStack;


function initGame() {
    resetAllVars();
    gBoard = createBoard();
    addMines(gLevel.mines);
    updateMinesAroundCounts(gBoard);
    renderBoard(gBoard, '.board-container');
}

function resetAllVars() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    }
    gLevel = {
        size: 4,
        mines: 2
    }
    gMineLocations = [];
    gActionLocationStack = [];
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
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var elCellContant;
            if (!currCell.isShown) {
                elCellContant = '';
            } else {
                elCellContant = (board[i][j].isMine) ? MINE : board[i][j].minesAroundCount;
            }
            var className = `cell cell-${i}-${j}`;
            strHTML += `<td class="${className}" onclick="CellClicked(this, ${i}, ${j})">${elCellContant}</td>`;
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
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) emptyCellLocations.push({ i, j });
        }
    }
    return emptyCellLocations;
}

function updateMinesAroundCounts(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine /* || currCell.isShown */) continue;
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
    if (cell.isMarked || cell.isShown) return; // This line may be deleted.
    if (cell.isMine){
        revealMines();
        endGame();
    } else revealCells({i, j});
    
}

function revealMines() {
    for (var location of gMineLocations) {
        gBoard[location.i][location.j].isShown = true;
        renderCell(location);
    }
}

function revealCells(location){
    var currCell = gBoard[location.i][location.j];
    if (currCell.isShown || currCell.isMarked) return;
    currCell.isShown = true;
    renderCell(location);

    if (currCell.minesAroundCount === 0){
        for (var i = location.i - 1; i <= location.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = location.j - 1; j <= location.j + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                if (i === location.i && j === location.j) continue;
                revealCells({i, j});
            }
        }
    }
}

// location such as: {i: 2, j: 7}
function renderCell(location) {
    var cell = gBoard[location.i][location.j];
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var elCellContent;

    if (!cell.isShown) {
        elCellContent = '';
    } else {
        elCellContent = (cell.isMine) ? MINE : cell.minesAroundCount;
    }
    elCell.innerHTML = (cell.isMine) ? MINE : cell.minesAroundCount;
}
