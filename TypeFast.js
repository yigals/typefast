
var targets = [];
var board = [];
var empty = [];
var populated = [];
var score = 0;
var lives = 3;
var TIMEOUT = 10;
var interval;

function cellString(i, j) {
    return "cell_" + i + "_" + j;
}

function incrementScore(points) {
    points = points || 1;
    var plus_container;
    var best;
    
    $("#plus").html(points);
    
    plus_container = $("#plus-container");
    plus_container.removeClass("plus-container-animation");
    // ugly workaround to retrigger animation...
    plus_container.replaceWith(plus_container.clone(true));
    $("#plus-container").addClass("plus-container-animation");

    score += points;
    
    best = $("#best");
    if (best.html() < score)
        best.html(score);
    
    $("#score").html(score);
}

//handles char success and returns whether there was any
function charSuccess(where, charCode) {
    var target = board[where.x][where.y];
    
    if (charCode != target.word.charCodeAt(target.lenSuccess))
        return false;

    incrementScore();
    target.lenSuccess++;
    var puzzle = $("#" + cellString(where.x, where.y));
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

    for (i = 0; i < populated.length; i++) {
        where = populated[i];
        target = board[where.x][where.y];
        // TODO: allow also uppercase
        if (!target.lost)
            if (charSuccess(where, key.which))
                if (wordSuccess(where))
                    succeeded.push(where);
    }

    return succeeded;
}

function removeSucceeded(succeeded) {
    for (var i = 0; i < succeeded.length; i++) {
        where = succeeded[i];
        removeItem(populated, where);
        board[where.x][where.y] = undefined;
        empty.push(where);
        $("#" + cellString(where.x, where.y)).html("").removeClass("grid-cell-populated");
    }
}

function keypress(key) {
    
    var target;
    var i;
    var succeeded; // list of indexes of completed puzzles
    var where;
    
    succeeded = checkSuccess(key);

    // removing succeeded targets here so `populated`'s length wouldn't change
    // during the previous loop
    removeSucceeded(succeeded);

    if (succeeded.length)
        createAndPopulate(succeeded.length);
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
    var where = randFromArray(empty, true);
    
    board[where.x][where.y] = target;
    populated.push(where);
    
    var cell = $("#" + cellString(where.x, where.y));

    cell.text(target.word).addClass("grid-cell-populated");
    

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

CELLS_IN_ROW = 2;

function createBoard(rows) {
    rows = rows || 2;
    var row, cell;
    var i, j;
    
    for (i = 0; i < rows; i++) {
        board.push([]);
        row = $("<div/>").attr("class", "grid-row");
        for (j = 0; j < CELLS_IN_ROW; j++) {
            empty.push({x: i, y: j});
            cell = $("<div/>").attr("class", "grid-cell").attr("id", cellString(i,j));
            row.append(cell);
        }
        $("#game-container").append(row);
    }
}

function newGame() {
    clearInterval(interval);
    targets = [];
    board = [];
    empty = [];
    populated = [];
    score = 0;
    lives = 3;
    $("#game-container").html("");
    $("#score").html(score);
    createBoard(2);
    createAndPopulate("blat");
    createAndPopulate("nahui");
    createAndPopulate("blip");
    $(document).keypress(keypress);
    // interval = setInterval(doTimeouts, INTERVAL);
}

$(document).ready(function () {
    $("#new-game").click(newGame);
    newGame();
});



/* TODO:
    calc cell width wrt CELLS_IN_ROW
    levels according to statistics
*/

