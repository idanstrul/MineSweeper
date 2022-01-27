'use strict'

function renderLives(){
    var elLives = document.querySelector('.lives');
    var livesStr = LIVE.repeat(gGame.lives);
    elLives.innerHTML = livesStr;
}