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
var DisplayStory = function( message ) {
    var container = new createjs.Container();

    var circleTimeIncrement = 0.01;
    var circle1Time = Math.random() * 10;
    var circle2Time = Math.random() * 10;
    var circle3Time = Math.random() * 10;
    var circle1MaxOffset = [ Math.random() * 5 + 3, Math.random() * 5 + 3 ];
    var circle2MaxOffset = [ Math.random() * 5 + 3, Math.random() * 5 + 3 ];
    var circle3MaxOffset = [ Math.random() * 5 + 3, Math.random() * 5 + 3 ];

    var circle1 = new createjs.Shape();
    var circle2 = new createjs.Shape();
    var circle3 = new createjs.Shape();

    circle1.graphics.beginFill( "DeepSkyBlue" );
    circle2.graphics.beginFill( "DeepSkyBlue" );
    circle3.graphics.beginFill( "DeepSkyBlue" );

    circle1.graphics.drawCircle( 0, 0, 50 );
    circle2.graphics.drawCircle( 0, 0, 50 );
    circle3.graphics.drawCircle( 0, 0, 50 );

    var text = new createjs.Text( message, "20px Arial", "#FFF" );
    text.textBaseline = "middle";
    text.textAlign = "center";
    //text.cache( -100, -100, 200, 200 );
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

        text.x = cosCircle1Time * cosCircle2Time * cosCircle3Time * 1.8;
        text.y = sinCircle1Time * sinCircle2Time * sinCircle3Time * 1.8;

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

// Build stage
// -----------------------------------------------------------------------------
var stage = new createjs.Stage( "stage" );
createjs.Ticker.setFPS( 60 );
createjs.Ticker.addEventListener( "tick", stage );

var stgStory = new DisplayStory( "Hello!" );
stgStory.x = 300;
stgStory.y = 300;

stgStory.scaleX = 4.0;
stgStory.scaleY = 4.0;

stage.addChild( stgStory );
