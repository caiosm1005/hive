/// <reference path="Model.ts" />
/// <reference path="DisplayBackground.ts" />
/// <reference path="DisplayStoryScreen.ts" />

console.log(
  "%c#########################\n" +
    "#   _     _             #\n" +
    "#  | |   (_)            #\n" +
    "#  | |__  ___   _____   #\n" +
    "#  | '_ \\| \\ \\ / / _ \\  #\n" +
    "#  | | | | |\\ V /  __/  #\n" +
    "#  |_| |_|_| \\_/ \\___|  #\n" +
    "#                       #\n" +
    "#########################",
    "color: #CF10FF; font-size: 1.2em;" );


// Read coordinates
// -----------------------------------------------------------------------------
var languageId = 1;
var x = 0;
var y = 0;

if (/^#-?\d+,-?\d+$/.test(window.location.hash)) {
    var splitHash = window.location.hash.split(",");
    x = parseInt(splitHash[0].substr(1));
    y = parseInt(splitHash[1]);
}
else if (window.location.hash.length) {
    console.log(window.location.hash.length);
    window.location.hash = "#0,0";
}

console.log("Starting at coordinates " + x + ", " + y);

// Util functions
// -----------------------------------------------------------------------------
function changePosition(_x, _y) {
    x = _x;
    y = _y;
    window.location.hash = "#" + x + "," + y;
    console.log("Heading to coordinates " + x + ", " + y);
}

function wrapMessage(msg, breakingPoint:number) {
    // Try to break message into two lines if it's large enough
    if (msg.length <= breakingPoint) {
        return msg;
    }

    var textSplit = false;

    for (var i = breakingPoint; i < msg.length && i < breakingPoint + 10; i++) {
        if (msg[i] == " ") {
            msg = msg.substr(0, i) + "\n" + msg.substr(i + 1);
            textSplit = true;
            break;
        }
    }

    if (!textSplit) {
        for (var i = breakingPoint - 1; i >= 0 && i >= breakingPoint - 10; i--) {
            if (msg[i] == " ") {
                msg = msg.substr(0, i) + "\n" + msg.substr(i + 1);
                textSplit = true;
                break;
            }
        }
    }

    if (!textSplit) {
        msg = msg.substr(0, breakingPoint) + "\n" + msg.substr(breakingPoint);
    }

    return msg;
}

/*

// Display classes
// -----------------------------------------------------------------------------

var DisplayStoryScreen = function(story, neighbours) {
    var container = new createjs.Container();
    var displayStory = new DisplayStory(story.message);

    function neighbourClickCallback(event) {
        getStory(languageId, event.target.storyX, event.target.storyY,
            function(err, result) {
                if (err) {
                    throw err;
                }

                container.moveToNeighbour(event.target);
                setTimeout(function() { window.location.reload() }, 500);
            });
    }

    for (var i = 0; i < neighbours.length; i++) {
        var neighbour = neighbours[i];
        var displayNeighbour;

        if (neighbour === null) {
            displayNeighbour = new DisplayNeighbourPlus();
        }
        else {
            displayNeighbour = new DisplayNeighbour(neighbour.message);
            displayNeighbour.storyX = neighbour.x;
            displayNeighbour.storyY = neighbour.y;
            displayNeighbour.message = neighbour.message;
        }

        var angle = -Math.PI * 2 * ((i + 1) / 6) + Math.PI / 6;
        displayNeighbour.x = Math.cos(angle) * 250;
        displayNeighbour.y = Math.sin(angle) * 250;
        displayNeighbour.on("click", neighbourClickCallback);

        container.addChild(displayNeighbour);
    }

    var displayStoryUnderneath = new DisplayNeighbour(story.message);
    displayStoryUnderneath.storyX = story.x;
    displayStoryUnderneath.storyY = story.y;
    displayStoryUnderneath.message = story.message;
    displayStoryUnderneath.on("click", neighbourClickCallback);

    container.addChild(displayStoryUnderneath);
    container.addChild(displayStory);

    container.moveToNeighbour = function(displayNeighbour) {
        displayStory.animateVanish();
        displayStory = new DisplayStory(displayNeighbour.message);
        displayStory.x = displayNeighbour.x;
        displayStory.y = displayNeighbour.y;
        displayStory.animateAppear();

        container.addChild(displayStory);

        changePosition(displayNeighbour.storyX, displayNeighbour.storyY);
    };

    return container;
}

// Build stage
// -----------------------------------------------------------------------------
var stage = new createjs.Stage("stage");
createjs.Ticker.setFPS(60);
createjs.Ticker.addEventListener("tick", stage);
stage.enableMouseOver();

var displayBackground = new DisplayBackground();
stage.addChild(displayBackground);

getStory(languageId, x, y, function(err, result) {
    if (err) {
        throw err;
    }

    function createScreen(err, result) {
        if (err) {
            throw err;
        }

        if (result.story === null) {
            throw "Story not found!";
        }

        var displayStoryScreen = new DisplayStoryScreen(result.story,
            result.neighbours);
        stage.addChild(displayStoryScreen);
        displayStoryScreen.x = 400;
        displayStoryScreen.y = 300;
    }

    // Maybe coords are out of bounds; in that case, head back to origin
    if (result.story === null) {
        changePosition(0, 0);
        getStory(languageId, x, y, createScreen);
    }
    else {
        createScreen(null, result);
    }
});
*/


// Build stage
// -----------------------------------------------------------------------------
var stage = new createjs.Stage("stage");
createjs.Ticker.setFPS(60);
createjs.Ticker.addEventListener("tick", stage);
stage.enableMouseOver();

Model.getStory( languageId, x, y, function( story ) {
    function createScreen( story ) {
        if ( story === null ) {
            throw "Story not found!";
        }

        var displayStoryScreen = new DisplayStoryScreen( story );
        stage.addChild( displayStoryScreen );
        displayStoryScreen.x = 400;
        displayStoryScreen.y = 300;
    }

    // Maybe coords are out of bounds; in that case, head back to origin
    if ( story === null ) {
        changePosition( 0, 0 );
        Model.getStory( languageId, x, y, createScreen);
    }
    else {
        createScreen( story );
    }
} );
