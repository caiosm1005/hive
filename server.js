var express  = require( "express" );
var morgan = require( "morgan" ); 
var mysql = require( "mysql" );

// Server configurations
// -----------------------------------------------------------------------------
var port = 3014;
var app = express();
app.use( express.static( __dirname + "/public" ) );
app.use( morgan( "dev" ) );

// Database connection
// -----------------------------------------------------------------------------
var connectionLimit = 4;
var connectionHost = "";     //
var connectionUser = "";     // TODO: Replace with production values
var connectionPassword = ""; //
var connectionDatabase = ""; //

if ( process.env[ "NODE_ENV" ] == "development" ) {
    connectionHost = "localhost";
    connectionUser = "root";
    connectionPassword = "";
    connectionDatabase = "hive";
}

var pool = mysql.createPool( {
    connectionLimit: connectionLimit,
    host: connectionHost,
    user: connectionUser,
    password: connectionPassword,
    database: connectionDatabase
} );

// API routes
// -----------------------------------------------------------------------------
app.get( "/api/story/:language_id/:x/:y", function( req, res ) {
    var sql, esq;

    var x = parseInt( req.params.x );
    var y = parseInt( req.params.y );

    if ( isNaN( x ) || isNaN( y ) ) {
        res.send( "Requested position is invalid" );
        return;
    }

    sql = "SELECT message, x, y FROM story WHERE story.language_id = ? AND (";
    sql += "story.x = ? AND story.y = ? OR ";
    sql += "story.x = ? + 1 AND story.y = ? + 1 OR ";   // NE   index: 0
    sql += "story.x = ?     AND story.y = ? + 1 OR ";   // N    index: 1
    sql += "story.x = ? - 1 AND story.y = ?     OR ";   // NW   index: 2
    sql += "story.x = ? - 1 AND story.y = ? - 1 OR ";   // SW   index: 3
    sql += "story.x = ?     AND story.y = ? - 1 OR ";   // S    index: 4
    sql += "story.x = ? + 1 AND story.y = ?)";          // SE   index: 5
    esc = [ req.params.language_id, x, y, x, y, x, y, x, y, x, y, x, y, x, y ];

    pool.query( sql, esc, function( err, rows, fields ) {
        if ( err ) {
            res.send( err );
            return;
        }

        var story = null;
        var storyNeighbours = [ null, null, null, null, null, null ];

        for( var i = 0; i < rows.length; i++ ) {
            var currentStory = rows[ i ];

            if ( currentStory.x == x && currentStory.y == y ) {
                story = currentStory;
            }
            else if ( currentStory.x == x + 1 && currentStory.y == y + 1 ) {
                storyNeighbours[ 0 ] = currentStory;
            }
            else if ( currentStory.x == x && currentStory.y == y + 1 ) {
                storyNeighbours[ 1 ] = currentStory;
            }
            else if ( currentStory.x == x - 1 && currentStory.y == y ) {
                storyNeighbours[ 2 ] = currentStory;
            }
            else if ( currentStory.x == x - 1 && currentStory.y == y - 1 ) {
                storyNeighbours[ 3 ] = currentStory;
            }
            else if ( currentStory.x == x && currentStory.y == y - 1 ) {
                storyNeighbours[ 4 ] = currentStory;
            }
            else if ( currentStory.x == x + 1 && currentStory.y == y ) {
                storyNeighbours[ 5 ] = currentStory;
            }
        }

        res.json( { s: story, n: storyNeighbours } );
    } );
} );

app.post( "/api/story/:language_id/:x/:y", function( req, res ) {

} );

app.get( "*", function( req, res ) {
    res.sendFile( __dirname + "/public/index.html" );
} );

// Start server
// -----------------------------------------------------------------------------
app.listen( port );
console.log( "hive server listening on port " + port );
