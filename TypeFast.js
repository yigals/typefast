
var targets = [];
var score = 0;
var lives = 3;
var TIMEOUT = 10;
var interval;

function incrementScore(points) {
    points = points !== undefined ? points : 1;
    score += points;
    $("#score").html(score);
}

function replacePuzzle(puzzle, target) {
    target.lenSuccess = 0;
    target.timeout = TIMEOUT;
    target.word = words[Math.floor(Math.random() * words.length)];
    puzzle.innerHTML = target.word;
}

function charSuccess(puzzle, target) {
    incrementScore();
    target.lenSuccess++;
    var text = puzzle.textContent;
    var firstPart = text.slice(0, target.lenSuccess);
    var rest = text.slice(target.lenSuccess);

    var h = "<span style=\"font-weight:bold\">" + firstPart + "</span>";
    puzzle.innerHTML = h + rest;

    if (target.lenSuccess == text.length) { // puzzle finished
        incrementScore(10); // bonus
        replacePuzzle(puzzle, target);
    }
}

function keypress(key) {
    var puzzles = $("#puzzles .puzzle");
    var target;
    var puzzle;
    var i;

    for (i = 0; i < puzzles.length; i++) {
        target = targets[i];
        puzzle = puzzles[i];
        if (!target.lost && key.which == target.word.charCodeAt(target.lenSuccess)) {
            charSuccess(puzzle, target);
        }
    }
}

function gameOver() {
    clearInterval(interval);
    $(document).off("keypress");
}

var INTERVAL = 100;

function doTimeouts() {
    var puzzles = $("#puzzles");
    var i;

    for (i = 0; i < targets.length; i++) {
        var target = targets[i];
        if (!target.lost) {
            if (target.timeout > INTERVAL / 1000 / 2) { // "checking for non-zero"...
                target.timeout -= INTERVAL / 1000;
            } else {
                target.lost = true;
                puzzles.children("#puzzle_" + i).css("text-decoration", "line-through");
                lives--;
                if (lives == 0)
                    gameOver();
            }
        }
        puzzles.children("#timeout_" + i)[0].innerHTML = " " + target.timeout.toFixed(2);
    }
}

function createPuzzle(word) {
    var target = {word: word, lenSuccess: 0, timeout: TIMEOUT, lost: false};
    targets.push(target);
    var puzzleId = targets.length - 1;
    $("<div/>")
        .html(word)
        .attr("id", "puzzle_" + puzzleId)
        .attr("class", "puzzle")
        .css("text-align", "center")
        .appendTo("#puzzles");

    $("<span/>")
        .html(" " + target.timeout.toFixed(2))
        .attr("id", "timeout_" + puzzleId)
        .attr("class", "timeout")
        .appendTo("#puzzles");
}


$(document).ready(function () {
    createPuzzle("blat");
    createPuzzle("nahui");
    createPuzzle("blip");
    createPuzzle("blop");
    $(document).keypress(keypress);
    interval = setInterval(doTimeouts, INTERVAL);
});

