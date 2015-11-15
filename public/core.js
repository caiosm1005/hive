console.log( "%c##########\n## hive ##\n##########",
    "color: #FFF; font-weight: bold; text-shadow: 0 1px 8px #000;" );

// Hive functions
// -----------------------------------------------------------------------------
function getDefaultLanguageId() {
    return 1;
}

function getStory( languageId, x, y, callback ) {
    reqwest( {
        url: "api/story/" + languageId + "/" + x + "/" + y,
        method: "get",
        error: function( err ) {
            callback( err );
        },
        success: function( result ) {
            callback( null, result );
        }
    } );
}

// Read coordinates
// -----------------------------------------------------------------------------
var languageId = getDefaultLanguageId();
var x = 0;
var y = 0;

if ( /^#\d+,\d+$/.test( window.location.hash ) ) {
    var splitHash = window.location.hash.split( "," );
    x = parseInt( splitHash[ 0 ].substr( 1 ) );
    y = parseInt( splitHash[ 1 ] );
}

console.log( "Starting at coordinates " + x + ", " + y );

getStory( languageId, x, y, function( err, result ) {
    console.log( result );
} );

// Display classes
// -----------------------------------------------------------------------------
var DisplayBackground = function() {
    var rect = new createjs.Shape();

    rect.graphics.clear();

    rect.graphics.beginFill( "#ccc" );
    // rect.graphics.drawRect( 0, 0, stage.canvas.width, stage.canvas.height );
    rect.graphics.drawRect( 0, 0, 800, 600 );

    return rect;
};

var DisplayStory = function( message ) {
    var container = new createjs.Container();

    var circleTimeIncrement = 0.01;
    var circle1Time = Math.random() * 10;
    var circle2Time = Math.random() * 10;
    var circle3Time = Math.random() * 10;
    var circle1MaxOffset = [ Math.random() * 17 + 10, Math.random() * 17 + 10 ];
    var circle2MaxOffset = [ Math.random() * 17 + 10, Math.random() * 17 + 10 ];
    var circle3MaxOffset = [ Math.random() * 17 + 10, Math.random() * 17 + 10 ];

    var circle1 = new createjs.Shape();
    var circle2 = new createjs.Shape();
    var circle3 = new createjs.Shape();

    circle1.graphics.beginFill( "DeepSkyBlue" );
    circle2.graphics.beginFill( "DeepSkyBlue" );
    circle3.graphics.beginFill( "DeepSkyBlue" );

    circle1.graphics.drawCircle( 0, 0, 170 );
    circle2.graphics.drawCircle( 0, 0, 170 );
    circle3.graphics.drawCircle( 0, 0, 170 );

    var baseline = "middle";
    var size = "140px";

    // Try to break message into two lines if it's large enough
    if ( message.length > 15 ) {
        var textSplit = false;

        for( var i = 15; i < message.length && i < 30; i++ ) {
            if ( message[ i ] == " " ) {
                message = message.substr( 0, i ) + "\n" + message.substr( i+1 );
                textSplit = true;
                break;
            }
        }

        if ( ! textSplit ) {
            for( var i = 14; i >= 5; i-- ) {
                if ( message[ i ] == " " ) {
                    message = message.substr( 0, i )+"\n"+message.substr( i+1 );
                    textSplit = true;
                    break;
                }
            }
        }

        if ( ! textSplit ) {
            message = message.substr( 0, 15 ) + "\n" + message.substr( 16 );
        }

        baseline = "bottom";
    }

    // Resize font
    if ( message.length > 15 ) {
        size = "100px";
    }
    else if ( message.length > 12 ) {
        size = "120px";
    }

    var text = new createjs.Text( message, size + " 'Open Sans'", "#FFFFFF" );
    text.textBaseline = baseline;
    text.textAlign = "center";
    text.maxWidth = 612;
    text.scaleX = 0.5;
    text.scaleY = 0.5;
    text.cache( -320, -160, 640, 320 );
    text.snapToPixel = true;

    container.addEventListener( "tick", function() {
        var cosCircle1Time = Math.cos( circle1Time );
        var cosCircle2Time = Math.cos( circle2Time );
        var cosCircle3Time = Math.cos( circle3Time );
        var sinCircle1Time = Math.sin( circle1Time );
        var sinCircle2Time = Math.sin( circle2Time );
        var sinCircle3Time = Math.sin( circle3Time );

        circle1.x = cosCircle1Time * circle1MaxOffset[ 0 ];
        circle1.y = sinCircle1Time * circle1MaxOffset[ 1 ];
        circle1.scaleX = 1.0 + cosCircle3Time * 0.07;
        circle1.scaleY = 1.0 + sinCircle3Time * 0.07;

        circle2.x = cosCircle2Time * circle2MaxOffset[ 0 ];
        circle2.y = sinCircle2Time * circle2MaxOffset[ 1 ];
        circle2.scaleX = 1.0 + cosCircle1Time * 0.07;
        circle2.scaleY = 1.0 + sinCircle1Time * 0.07;

        circle3.x = cosCircle3Time * circle3MaxOffset[ 0 ];
        circle3.y = sinCircle3Time * circle3MaxOffset[ 1 ];
        circle3.scaleX = 1.0 + cosCircle2Time * 0.07;
        circle3.scaleY = 1.0 + sinCircle2Time * 0.07;

        text.x = cosCircle1Time * cosCircle2Time * cosCircle3Time * 6.2 - 5;
        text.y = sinCircle1Time * sinCircle2Time * sinCircle3Time * 6.2;

        circle1Time += circleTimeIncrement;
        circle2Time += circleTimeIncrement;
        circle3Time += circleTimeIncrement;
    } );

    container.addChild( circle1 );
    container.addChild( circle2 );
    container.addChild( circle3 );
    container.addChild( text );

    return container;
};

var DisplayNeighbourPlus = function() {
    var container = new createjs.Container();

    var circle = new createjs.Shape();
    circle.graphics.beginFill( "DeepSkyBlue" );
    circle.graphics.drawCircle( 0, 0, 35 );
    circle.alpha = 0.4;

    var plusH = new createjs.Shape();
    plusH.graphics.beginFill( "#FFF" );
    plusH.graphics.drawRoundRect( -16, -3, 32, 6, 3, 3, 3, 3 );

    var plusV = new createjs.Shape();
    plusV.graphics.beginFill( "#FFF" );
    plusV.graphics.drawRoundRect( -3, -16, 6, 32, 3, 3, 3, 3 );

    container.addChild( circle );
    container.addChild( plusH );
    container.addChild( plusV );

    return container;
}

// Build stage
// -----------------------------------------------------------------------------
var stage = new createjs.Stage( "stage" );
createjs.Ticker.setFPS( 60 );
createjs.Ticker.addEventListener( "tick", stage );

var displayBackground = new DisplayBackground();

var displayStory = new DisplayStory( "Hello!" );
displayStory.x = 400;
displayStory.y = 300;


var displayNeighbourPlus1 = new DisplayNeighbourPlus();

displayNeighbourPlus1.x = 400;
displayNeighbourPlus1.y = 60;

var displayNeighbourPlus2 = new DisplayNeighbourPlus();

displayNeighbourPlus2.x = 400;
displayNeighbourPlus2.y = 600 - 60;

/* createjs.Tween.get( displayStory, { loop: true } )
    .to( { scaleX: 4.0, scaleY: 4.0 }, 1000, createjs.Ease.cubicOut() )
    .to( { scaleX: 1.0, scaleY: 1.0 }, 1000, createjs.Ease.cubicIn() ); */

stage.addChild( displayBackground );
stage.addChild( displayStory );
stage.addChild( displayNeighbourPlus1 );
stage.addChild( displayNeighbourPlus2 );
