document.addEventListener('click', jump);

var character = document.getElementById('character');
var block = document.getElementById('block');

function jump() {
    if (character.classList == 'animate') {return;}
    character.classList.add('animate');
    setTimeout(removeJump, 300);
}

function removeJump() {
    character.classList.remove('animate');
}

function checkDead() {
    let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    let blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
    if (blockLeft < 20 && blockLeft > -20 && characterTop >= 130) {
        alert("Gameover!");
    }
}

setInterval(checkDead, 10);