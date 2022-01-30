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

function renderSafeClicks(){
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