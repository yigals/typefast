var board = [];
var empty = [];
var populated = [];
var score;
var lives;
var TIMEOUT = 10;
var CELLS_IN_ROW = 2;

function cellString(i, j) {
    return ".grid-cell" + "[x=" + i + "]" + "[y=" + j + "]";
}

// ugly workaround to retrigger animation...
// jId should be a jquery selector
function rebootAnimation(jId, className) {
    var old = $(jId);
    old.removeClass(className);
    old.replaceWith(old.clone(true));

    return $(jId).addClass(className);
}

function incrementScore(points) {
    points = points || 1;
    var best;

    $("#plus").html(points);

    rebootAnimation("#plus-container", "plus-container-animation");

    score += points;
    $(".score").html(score);

    best = $("#best");
    if (best.html() < score) {
        best.html(score);
        localStorage.setItem("best", score);
    }
}

//handles char success and returns whether there was any
function charSuccess(where, charCode) {
    var target = board[where.x][where.y];

    if (charCode !== target.word.charCodeAt(target.lenSuccess) &&
        charCode !== target.word.charCodeAt(target.lenSuccess)-32) // in case CAPSLOCK is on
        return false;

    incrementScore();
    target.lenSuccess++;
    var puzzle = $(cellString(where.x, where.y));
    var text = puzzle.text();
    var firstPart = text.slice(0, target.lenSuccess);
    var rest = text.slice(target.lenSuccess);

    var h = "<span style=\"color:#6699FF\">" + firstPart + "</span>";
    puzzle.html(h + rest);

    return true;
}

function wordSuccess(where) {
    var target = board[where.x][where.y];

    if (target.lenSuccess == target.word.length) {
        incrementScore(10); // bonus
        return true;
    }
    return false;
}

function removeItem(arr, item) {
    var index = arr.indexOf(item);
    if (index != -1)
        return arr.splice(index, 1)[0];
}

function checkSuccess(key) {
    var succeeded = [];
    var target;
    var where;

    for (var i = 0; i < populated.length; i++) {
        where = populated[i];
        target = board[where.x][where.y];
        if (!target.lost)
            if (charSuccess(where, key.which))
                if (wordSuccess(where))
                    succeeded.push(where);
    }

    return succeeded;
}

function removePuzzle(where) {
        removeItem(populated, where);
        board[where.x][where.y] = undefined;
        empty.push(where);
        $(cellString(where.x, where.y)).html("").removeClass("grid-cell-populated");
}

function removeSucceeded(succeeded) {
    var where;

    for (var i = 0; i < succeeded.length; i++) {
        where = succeeded[i];
        removePuzzle(where);
    }
}

function keypress(key) {

    var succeeded; // list of indexes of completed puzzles

    succeeded = checkSuccess(key);

    // removing succeeded targets here so `populated`'s length wouldn't change
    // during the previous loop
    removeSucceeded(succeeded);

    if (succeeded.length)
        createAndPopulate(succeeded.length);
}

function gameOver() {
    $(document).off("keypress");
    var populatedCells = $(".grid-cell-populated");
    populatedCells.off();
    populatedCells.addClass("paused");
    $("#game-over").show();
}

function puzzleFailedHandler(e) {
    if (lives == 0) // in case 2 timeouts occured at about the same time
        return false;

    lives--;
    $("#lives").text(lives);

    if (lives == 0) {
        gameOver();
    } else {
        var puzzle = e.target;
        removePuzzle({x: puzzle.attributes.x.value, y: puzzle.attributes.y.value});
        createAndPopulate();
    }

    return false;
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
    var where = randFromArray(empty, true);

    board[where.x][where.y] = target;
    populated.push(where);

    rebootAnimation(cellString(where.x, where.y), "grid-cell-populated")
        .one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", puzzleFailedHandler)
        .text(target.word);
}

function doCreateAndPopulate(word) {
    var target = createPuzzle(word);
    populate(target);
}

//if arg is a string, use it as a word.
//if it's a number, create several random words.
function createAndPopulate(arg) {
    var word, num, i;

    if (typeof arg == "string") {
        doCreateAndPopulate(arg);
        return;
    }

    num = arg || 1;
    for (i = 0; i < num; i++) {
        word = randFromArray(words);
        doCreateAndPopulate(word);
    }
}

function createBoard(rows) {
    rows = rows || 2;
    var row, cell;
    var i, j;

    for (i = 0; i < rows; i++) {
        board.push([]);
        row = $("<div/>").attr("class", "grid-row");
        for (j = 0; j < CELLS_IN_ROW; j++) {
            empty.push({x: i, y: j});
            cell = $("<div/>").attr("class", "grid-cell").attr("x", i).attr("y", j);
            row.append(cell);
        }
        $("#board-container").append(row);
    }
}

function newGame() {
    board = [];
    empty = [];
    populated = [];
    score = 0;
    lives = 3;
    $("#board-container").html("");
    $(".score").html(score);
    $("#lives").text(lives);
    $("#game-over").hide();
    createBoard(2);
    createAndPopulate("blat");
    createAndPopulate("nahui");
    createAndPopulate("blip");
    $(document).keypress(keypress);
}

$(document).ready(function () {
    $("#best").text(localStorage.getItem("best") || 0);
    $(".new-game").click(newGame);
    newGame();
});



/* TODO:
    levels according to statistics
*/

