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

// Util functions
// -----------------------------------------------------------------------------
function wrapMessage( msg, breakingPoint ) {
    // Try to break message into two lines if it's large enough
    if ( msg.length <= breakingPoint ) {
        return msg;
    }

    var textSplit = false;

    for( var i = breakingPoint; i < msg.length && i < breakingPoint+10; i++ ) {
        if ( msg[ i ] == " " ) {
            msg = msg.substr( 0, i ) + "\n" + msg.substr( i + 1 );
            textSplit = true;
            break;
        }
    }

    if ( ! textSplit ) {
        for( var i = breakingPoint - 1; i >= 0 && i >= breakingPoint-10; i-- ) {
            if ( msg[ i ] == " " ) {
                msg = msg.substr( 0, i ) + "\n" + msg.substr( i + 1 );
                textSplit = true;
                break;
            }
        }
    }

    if ( ! textSplit ) {
        msg = msg.substr( 0, breakingPoint )+"\n"+msg.substr( breakingPoint );
    }

    return msg;
}

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

var DisplayStoryBlobs = function( numBlobs, speed, radius ) {
    var container = new createjs.Container();

    var circleTimes1 = [];
    var circleTimes2 = [];
    var circleOffsets = [];
    var circles = [];

    container.centerDeltaX = 0.0;
    container.centerDeltaY = 0.0;

    for( var i = 0; i < numBlobs; i++ ) {
        var circle = new createjs.Shape();
        circle.graphics.beginFill( "DeepSkyBlue" );
        circle.graphics.drawCircle( 0, 0, radius );

        var offsetX = Math.random() * radius / 10 + 10;
        var offsetY = Math.random() * radius / 10 + 10;

        circleTimes1.push( Math.random() * 10 );
        circleTimes2.push( Math.random() * 10 );
        circleOffsets.push( [ offsetX, offsetY ] );
        circles.push( circle );
        container.addChild( circle );
    }

    container.addEventListener( "tick", function() {
        container.centerDeltaX = 1.0;
        container.centerDeltaY = 1.0;

        for( var i = 0; i < circles.length; i++ ) {
            var deltaX = Math.cos( circleTimes1[i] );
            var deltaY = Math.sin( circleTimes1[i] );

            circles[ i ].x = deltaX * circleOffsets[i][0];
            circles[ i ].y = deltaY * circleOffsets[i][1];
            circles[ i ].scaleX = 1.0 + Math.cos( circleTimes2[ i ] ) * 0.07;
            circles[ i ].scaleY = 1.0 + Math.sin( circleTimes2[ i ] ) * 0.07;

            circleTimes1[ i ] += speed;
            circleTimes2[ i ] += speed;

            container.centerDeltaX *= deltaX;
            container.centerDeltaY *= deltaY;
        }
    } );

    return container;
}

var DisplayStory = function( message ) {
    var container = new createjs.Container();
    var displayBlobs = new DisplayStoryBlobs( 3, 0.0065, 170 );

    var baseline = "middle";
    var size = "140px";

    if ( message.length > 15 ) {
        message = wrapMessage( message, 15 );
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
        text.x = displayBlobs.centerDeltaX * 6.2 - 4;
        text.y = displayBlobs.centerDeltaY * 6.2;
    } );

    container.addChild( displayBlobs );
    container.addChild( text );

    return container;
};

var DisplayNeighbour = function( message ) {
    var container = new createjs.Container();
    var displayBlobs = new DisplayStoryBlobs( 8, 0.015, 25 );

    var baseline = "middle";

    if ( message.length > 15 ) {
        message = wrapMessage( message, 15 );
        baseline = "bottom";
    }

    var text = new createjs.Text( message, "bold 24px 'Open Sans'", "#FFFFFF" );
    text.textBaseline = baseline;
    text.textAlign = "center";
    text.maxWidth = 170;
    text.scaleX = 0.5;
    text.scaleY = 0.5;
    text.cache( -90, -48, 180, 75 );
    text.snapToPixel = true;

    container.addEventListener( "tick", function() {
        text.x = displayBlobs.centerDeltaX * 6.2;
        text.y = displayBlobs.centerDeltaY * 6.2;
    } );

    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill( "#FFF" );
    hitArea.graphics.drawRect( -38, -38, 76, 76 );

    container.addChild( displayBlobs );
    container.addChild( text );

    container.hitArea = hitArea;
    container.cursor = "pointer";

    container.on( "mouseover", function( event ) {
        createjs.Tween.get( displayBlobs )
            .to( { scaleX: 1.1, scaleY: 1.1 }, 350,
                createjs.Ease.getPowOut( 2.8 ) );
        createjs.Tween.get( text )
            .to( { scaleX: 0.7, scaleY: 0.7 }, 280,
                createjs.Ease.getBackOut( 4.0 ) );
    } );

    container.on( "mouseout", function( event ) {
        createjs.Tween.get( displayBlobs )
            .to( { scaleX: 1.0, scaleY: 1.0 }, 300, createjs.Ease.cubicOut );
        createjs.Tween.get( text )
            .to( { scaleX: 0.5, scaleY: 0.5 }, 300, createjs.Ease.cubicOut );
    } );

    return container;
};

var DisplayNeighbourPlus = function() {
    var container = new createjs.Container();

    var circle = new createjs.Shape();
    circle.graphics.beginFill( "DeepSkyBlue" );
    circle.graphics.drawCircle( 0, 0, 28 );
    circle.alpha = 0.3;

    var plus = new createjs.Shape();
    plus.graphics.beginFill( "#FFF" );
    plus.graphics.drawRoundRect( -15, -2, 30, 4, 2, 2, 2, 2 );
    plus.graphics.drawRoundRect( -2, -15, 4, 30, 2, 2, 2, 2 );
    plus.scaleX = 0.9;
    plus.scaleY = 0.9;

    var hitArea = new createjs.Shape();
    hitArea.graphics.beginFill( "#FFF" );
    hitArea.graphics.drawRect( -38, -38, 76, 76 );

    container.addChild( circle );
    container.addChild( plus );

    container.hitArea = hitArea;
    container.cursor = "pointer";
    container.alpha = 0.8;

    container.on( "mouseover", function( event ) {
        createjs.Tween.get( container )
            .to( { alpha: 1.0 }, 90, createjs.Ease.cubicInOut() );
        createjs.Tween.get( circle )
            .to( { scaleX: 1.1, scaleY: 1.1 }, 350,
                createjs.Ease.getPowOut( 2.8 ) );
        createjs.Tween.get( plus )
            .to( { scaleX: 1.34, scaleY: 1.34 }, 280,
                createjs.Ease.getBackOut( 4.0 ) );
    } );

    container.on( "mouseout", function( event ) {
        createjs.Tween.get( container )
            .to( { alpha: 0.8 }, 300, createjs.Ease.cubicOut );
        createjs.Tween.get( circle )
            .to( { scaleX: 1.0, scaleY: 1.0 }, 300, createjs.Ease.cubicOut );
        createjs.Tween.get( plus )
            .to( { scaleX: 0.9, scaleY: 0.9 }, 300, createjs.Ease.cubicOut );
    } );

    return container;
};

// Build stage
// -----------------------------------------------------------------------------
var stage = new createjs.Stage( "stage" );
createjs.Ticker.setFPS( 60 );
createjs.Ticker.addEventListener( "tick", stage );
stage.enableMouseOver();

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

var displayNeighbour3 = new DisplayNeighbour( "Do you like pancakes?" );
displayNeighbour3.x = 640;
displayNeighbour3.y = 220;

var displayNeighbour4 = new DisplayNeighbour( "I am not a stalker, I swear!!" );
displayNeighbour4.x = 640;
displayNeighbour4.y = 380;

stage.addChild( displayBackground );
stage.addChild( displayStory );
stage.addChild( displayNeighbourPlus1 );
stage.addChild( displayNeighbourPlus2 );
stage.addChild( displayNeighbour3 );
stage.addChild( displayNeighbour4 );
