/// <reference path="Model.ts" />
/// <reference path="Hash.ts" />
/// <reference path="DisplayBackground.ts" />
/// <reference path="DisplayStoryScreen.ts" />

class Core {
    static init():void {
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
        // ---------------------------------------------------------------------
        var languageId = 2;
        var x = 0;
        var y = 0;

        var hashPos = Hash.getPosition();
        x = hashPos[ 0 ];
        y = hashPos[ 1 ];

        console.log("Hash variables: ", Hash.getVariables());
        console.log("Starting at coordinates " + x + ", " + y);

        // Util functions
        // ---------------------------------------------------------------------
        function changePosition(_x, _y) {
            x = _x;
            y = _y;
            window.location.hash = "#" + x + "," + y;
            console.log("Heading to coordinates " + x + ", " + y);
        }

        // Build stage
        // ---------------------------------------------------------------------
        var stage = new createjs.Stage( "stage" );
        createjs.Ticker.setFPS( 60 );
        createjs.Ticker.addEventListener( "tick", stage );
        stage.enableMouseOver();

        var displayStoryScreen:DisplayStoryScreen = new DisplayStoryScreen();
        stage.addChild( displayStoryScreen );
        displayStoryScreen.x = 400;
        displayStoryScreen.y = 300;

/*Model.getStory( languageId, x, y, 4, function( story ) {
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
        Model.getStory( languageId, x, y, 4, createScreen);
    }
    else {
        createScreen( story );
    }
} );*/

    }

}

Core.init();
