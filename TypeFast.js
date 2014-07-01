
var targets = [];
var board = [];
var empty_cells = [];
var score = 0;
var lives = 3;
var TIMEOUT = 10;
var interval;

function incrementScore(points) {
    points = points || 1;
    score += points;
    $("#score").html(score);
}

function replacePuzzle(puzzle, target) { // TODO: remove?
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
        if (!target.lost && key.which == target.word.charCodeAt(target.lenSuccess))
            charSuccess(puzzle, target);
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
    return target;
}

function randFromArray(arr, remove) {
    var index = Math.floor(Math.random() * arr.length);
    var element = arr[index];
    if (remove)
        arr.splice(index, 1);
    return element;
}

function populate(target) {
    // console.log("FUNCTION:   " + arguments.callee.name);
    var where = randFromArray(empty_cells, true);
    
    board[where.x][where.y] = target;
    $("<div/>")
        .attr("class", "target-on-board")
        .text(target.word)
        .appendTo($("#cell_" + where.x + "_" + where.y));
    

    // $("<div/>")
        // .html(word)
        // .attr("id", "puzzle_" + puzzleId)
        // .attr("class", "puzzle")
        // .css("text-align", "center")
        // .appendTo("#puzzles");

    // $("<span/>")
        // .html(" " + target.timeout.toFixed(2))
        // .attr("id", "timeout_" + puzzleId)
        // .attr("class", "timeout")
        // .css("text-align", "center")
        // .appendTo("#puzzles");
}


function createAndPopulate(word) {
    word = word || randFromArray(words);
    var target = createPuzzle(word);
    populate(target);
}

CELLS_IN_ROW = 2;

function createBoard(rows) {
    rows = rows || 2;
    var row, cell;
    var i, j;
    
    for (i = 0; i < rows; i++) {
        board.push([]);
        row = $("<div/>").attr("class", "grid-row");
        for (j = 0; j < CELLS_IN_ROW; j++) {
            empty_cells.push({x: i, y: j});
            cell = $("<div/>").attr("class", "grid-cell").attr("id", "cell_" + i + "_" + j);
            row.append(cell);
        }
        $("#game-container").append(row);
    }
}

$(document).ready(function () {
    createBoard(2);
    createAndPopulate("blat");
    createAndPopulate("nahui");
    createAndPopulate("blip");
    createAndPopulate("blop");
    $(document).keypress(keypress);
    interval = setInterval(doTimeouts, INTERVAL);
});



/* TODO:
    calc cell width wrt CELLS_IN_ROW
*/

