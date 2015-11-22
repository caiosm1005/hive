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
    }

}

Core.init();
