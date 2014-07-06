var board = [];
var empty = [];
var populated = [];
var score;
var solved;
var level;
var lives;
var puzzleTimeout;
var ROWS = 2;
var COLS = 2;

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

function setAnimationDuration(sel, timeout_ms) {
    t = timeout_ms + 'ms';
    $(sel).css({'-webkit-animation-duration': t, '-moz-animation-duration': t, '-o-animation-duration': t, 'animation-duration': t});
}

function incrementScore(points) {
    points = points || 1;
    points *= level;
    var best;

    $("#plus").html(points);

    rebootAnimation("#plus-container", "fade-up-animation");

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

function levelUp() {
    if (solved >= level * (level + 1)) { // in each level solve 2*level puzzles. calculation is left for the lazy reader
        level++;
        $("#level").text(level);
        puzzleTimeout *= 0.9;
        rebootAnimation("#levelup", "fade-up-animation");
    }
}

function wordSuccess(where) {
    var target = board[where.x][where.y];

    if (target.lenSuccess == target.word.length) {
        incrementScore(10); // bonus
        return true;
    }
    return false;
}

function removeItem(arr, item) { // works with simple JSONable objects. 
    var jsonItem = JSON.stringify(item);
    
    for (var i = 0; i < arr.length; i++) {
        if (JSON.stringify(arr[i]) == jsonItem) {
            arr = arr.splice(i, 1)[0];
            break;
        }
    }

    return arr;
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
                if (wordSuccess(where)) {
                    succeeded.push(where);
                    $("#solved").text(++solved);
                    rebootAnimation("#solvedup", "fade-up-animation");
                    levelUp();
                }
    }

    return succeeded;
}

function removePuzzle(where) {
        removeItem(populated, where);
        board[where.x][where.y] = undefined;
        empty.push(where);
        $(cellString(where.x, where.y)).html("").off().removeClass("grid-cell-populated");
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
    rebootAnimation("#lifedown", "fade-up-animation");
    $("#lives").text(lives);

    if (lives == 0) {
        gameOver();
    } else {
        var puzzle = e.target;
        removePuzzle({x: Number(puzzle.attributes.x.value), y: Number(puzzle.attributes.y.value)});
        createAndPopulate();
    }

    return false;
}

function createPuzzle(word) {
    var target = {word: word, lenSuccess: 0, timeout: puzzleTimeout, lost: false};
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
    } else {
        num = arg || 1;
        for (i = 0; i < num; i++) {
            word = randFromArray(words);
            doCreateAndPopulate(word);
        }
    }
    setAnimationDuration(".grid-cell-populated", puzzleTimeout);
}

function createBoard(rows) {
    rows = rows || ROWS;
    var row, cell;
    var i, j;

    for (i = 0; i < rows; i++) {
        board.push([]);
        row = $("<div/>").attr("class", "grid-row");
        for (j = 0; j < COLS; j++) {
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
    level = 1;
    solved = 0;
    puzzleTimeout = 10000;
    $("#board-container").html("");
    $(".score").html(score);
    $("#lives").text(lives);
    $("#solved").text(solved);
    $("#level").text(level);
    $("#game-over").hide();
    createBoard();
    createAndPopulate("wow");
    createAndPopulate("great");
    createAndPopulate("game");
    $(document).keypress(keypress);
}

function checkCompat() {
    return Modernizr.localstorage &&
           Modernizr.opacity &&
           Modernizr.cssanimations;
}

$(document).ready(function () {
    if (!checkCompat()) {
        $("body > :not(#compat)").hide();
        $("#compat").css({display: "block"});
        return;
    }
    $("#best").text(localStorage.getItem("best") || 0);
    $(".new-game").click(newGame);
    newGame();
});
