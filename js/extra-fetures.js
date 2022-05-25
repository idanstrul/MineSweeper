'use strict'

function renderLives() {
    var elLives = document.querySelector('.lives');
    var livesStr = LIVE.repeat(gGame.lives);
    elLives.innerHTML = livesStr;
}


function getHint(elBulb) {
    if (gGame.hints <= 0 || !gGame.isOn || gGame.isOver) return;
    gGame.isHint = !gGame.isHint;
    renderHints();
}

function showHint(location) {
    var locationsToShow = [];
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShown) continue;
            locationsToShow.push({ i, j });
            gBoard[i][j].isShown = true;
            renderCell({ i, j });
        }
    }
    gGame.isHint = false;
    gGame.hints--;
    renderHints()
    setTimeout(hideHint, 2000, locationsToShow)
}

function hideHint(locationsToHide) {
    for (var k = 0; k < locationsToHide.length; k++) {
        gBoard[locationsToHide[k].i][locationsToHide[k].j].isShown = false;
        renderCell(locationsToHide[k]);
    }
}

function renderHints() {
    var elBulbOn = document.querySelector('.hint-container img:nth-child(2)');
    var elHintsCount = document.querySelector('.hints h3');
    var elHintContainer = document.querySelector('.hint-container');
    var strHTML;

    if (gGame.hints <= 0) {
        elHintContainer.classList.add('disabled');
        elBulbOn.classList.remove('bulb-on');
        strHTML = 'Get a hint:<br> <span style="color: red;">No hints left</span>';
    } else {
        elHintContainer.classList.remove('disabled')
        if (gGame.isHint) elBulbOn.classList.add('bulb-on');
        else elBulbOn.classList.remove('bulb-on');
        strHTML = 'Get a hint:<br>' + '💡'.repeat(gGame.hints);
    }

    elHintsCount.innerHTML = strHTML;
}

function getSafeClick() {
    if (gGame.safeClicks <= 0 || !gGame.isOn || gGame.isOver) return;
    var safeClickLocation = getRndEmptyCellLocation();
    if (!safeClickLocation) return;
    var elSafeCell = document.querySelector('.' + getClassName(safeClickLocation));
    elSafeCell.classList.add('safe-cell');
    gGame.safeClicks--;
    renderSafeClicks();
    setTimeout((elSafeCell) => (elSafeCell.classList.remove('safe-cell')), 1000, elSafeCell);
}

function renderSafeClicks() {
    var elSafeClickCount = document.querySelector('.safe-click h3');
    var safeClickButton = document.querySelector('.safe-click button')
    elSafeClickCount.innerHTML = '✅'.repeat(gGame.safeClicks);
    if (gGame.safeClicks <= 0) safeClickButton.classList.add('disabled');
    else safeClickButton.classList.remove('disabled');
}


function getRndEmptyCellLocation() {
    var emptyCellLocations = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                emptyCellLocations.push({ i, j });
            }
        }
    }

    if (emptyCellLocations.length > 0) {
        var rndIdx = getRandomIntExclusive(0, emptyCellLocations.length);
        return emptyCellLocations[rndIdx];
    }

    return null;
}

function setRecord() {
    var currRecord = window.localStorage[`mineSweeperScoreRecords-level${gLevel.levelIdx}`];
    if (!currRecord || parseInt(currRecord) > parseInt(gSec)) {
        window.localStorage[`mineSweeperScoreRecords-level${gLevel.levelIdx}`] = gSec;
        renderRecords();
        congratNewRecord();
    }
}

// function setRecord(record){
//     var records = window.localStorage.mineSweeperScoreRecords;
//     var leveldx = record.findIndex((level) =>
//     (level.size === gLevel.size && level.mines === gLevel.mines));
//     if (gSec < records[leveldx].score) {
//         records[leveldx].score = gSec;
//         renderNewRecord();
//         congratNewRecord();
//     }
// }

function congratNewRecord() {
    return;
}

function renderRecords() {
    var strHTML;
    for (var i = 0; i < gLevels.length; i++) {
        var elCurrRecord = document.querySelector(`span.level${i}`);
        var memoryCurrRecord = window.localStorage[`mineSweeperScoreRecords-level${i}`];
        if (!memoryCurrRecord) strHTML = '--:--';
        else strHTML = formatSecToTime(memoryCurrRecord);

        elCurrRecord.innerText = strHTML;
    }
}

function formatSecToTime(secStr) {
    var sec = parseInt(secStr);
    min = Math.floor(sec / 60);
    sec = sec % 60;

    if (sec < 10 || sec == 0) {
        sec = '0' + sec;
    }
    if (min < 10 || min == 0) {
        min = '0' + min;
    }

    var timeStr = min + ':' + sec;
    return timeStr;
}


function turnTo7Boom() {
    initGame()
    gGame.is7Boom = true;
}

function addMinesBy7Boom() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if ((i * gBoard[i].length + j + 1) % 7 === 0){
                gBoard[i][j].isMine = true;
                gMineLocations.push({i, j});
            }
        }
    }
}



function undo(){
    if (gGame.isOver || gActionLocationStack.length === 0) return;
    var lastMove = gActionLocationStack.pop();
    if (lastMove.isRightClick) undoMarkCell(lastMove);
    else undoCellClicked(lastMove);
    gGame.wasUndo = true;
}

function undoMarkCell(location){
    var cell = gBoard[location.i][location.j]

    if (!cell.isMarked) {
        cell.isMarked = true;
        gGame.markedCount++;
    } else {
        cell.isMarked = false;
        gGame.markedCount--;
    }
    renderCell(location);
}

function undoCellClicked(location){
    var cell = gBoard[location.i][location.j];

    if (cell.isMine) {
        gGame.lives++;
        renderLives();
    }

    undoRevealCells(location);
}

function undoRevealCells(location){
    var CurrCellStacked = gActionLocationStack.find((element) => (element.i === location.i && element.j === location.j))
    var currCell = gBoard[location.i][location.j];
    if (!currCell.isShown || currCell.isMarked || CurrCellStacked) return;
    currCell.isShown = false;
    renderCell(location);
    gGame.shownCount--;

    if (currCell.minesAroundCount === 0 && !currCell.isMine) {
        for (var i = location.i - 1; i <= location.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = location.j - 1; j <= location.j + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                if (i === location.i && j === location.j) continue;
                undoRevealCells({ i, j });
            }
        }
    }
}

