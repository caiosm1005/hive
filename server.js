var express  = require( "express" );
var morgan = require( "morgan" ); 
var mysql = require( "mysql" );
var bodyParser = require( "body-parser" );

// Server configurations
// -----------------------------------------------------------------------------
var port = 3014;
var app = express();
app.use( express.static( __dirname + "/public" ) );
app.use( bodyParser.text() );
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

// Hive functions
// -----------------------------------------------------------------------------
var hive = {
    getStory: function( languageId, x, y, callback ) {
        var oldX = x;
        var oldY = y;
        x = parseInt( x );
        y = parseInt( y );

        if ( oldX != x || oldY != y || isNaN( x ) || isNaN( y ) ) {
            callback( "Requested position is invalid" );
            return;
        }

        var sql, esc;

        sql = "SELECT message, x, y FROM story " +
            "WHERE story.language_id = ? AND (" +
            "story.x = ? AND story.y = ? OR " +
            "story.x = ? + 1 AND story.y = ? + 1 OR " +  // NE   index: 0
            "story.x = ?     AND story.y = ? + 1 OR " +  // N    index: 1
            "story.x = ? - 1 AND story.y = ?     OR " +  // NW   index: 2
            "story.x = ? - 1 AND story.y = ? - 1 OR " +  // SW   index: 3
            "story.x = ?     AND story.y = ? - 1 OR " +  // S    index: 4
            "story.x = ? + 1 AND story.y = ?)";          // SE   index: 5
        esc = [ languageId, x, y, x, y, x, y, x, y, x, y, x, y, x, y ];
        
        pool.query( sql, esc, function( err, rows, fields ) {
            if ( err ) {
                callback( err );
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

            callback( null, { story: story, neighbours: storyNeighbours } );
        } );
    },
    createStory: function( languageId, message, x, y, callback ) {
        var oldX = x;
        var oldY = y;
        x = parseInt( x );
        y = parseInt( y );

        if ( oldX != x || oldY != y || isNaN( x ) || isNaN( y ) ) {
            callback( "Requested position is invalid" );
            return;
        }

        if ( message.length > 35 ) {
            callback( "Message exceeds character count limit of 35" );
            return;
        }

        if ( message.length < 3 ) {
            callback( "Message is too short" );
            return;
        }

        hive.getStory( languageId, x, y, function( err, result ) {
            if ( err ) {
                callback( err );
                return;
            }

            var story = result.story;
            var neighbours = result.neighbours;
            var hasNeighbours = false;

            if ( story !== null ) {
                callback( "A story already exists at the requested position" );
                return;
            }

            for( var i = 0; i < neighbours.length; i++ ) {
                if ( neighbours[ i ] !== null ) {
                    hasNeighbours = true;
                    break;
                }
            }

            if ( ! hasNeighbours ) {
                callback( "Cannot create a story without a neighbour: " +
                    "it must be adjacent to another story" );
                return;
            }

            // Insert the new story: start transaction for this and rollback if
            // something goes wrong
            pool.getConnection( function( err, con ) {
                if ( err ) {
                    con.release();
                    callback( err );
                    return;
                }

                con.beginTransaction( function( err ) {
                    if ( err ) {
                        con.release();
                        callback( err );
                        return;
                    }

                    var sql, esc;

                    sql = "INSERT INTO story (language_id, message, x, y) " +
                        "VALUES (?, ?, ?, ?)";
                    esc = [ languageId, message, x, y ];

                    con.query( sql, esc, function( err, result ) {
                        if ( err ) {
                            return con.rollback( function() {
                                con.release();
                                callback( err );
                            } );
                        }

                        sql = "INSERT INTO log_story " +
                            "(story_id, remote_addr, created_on) " +
                            "VALUES (?, ?, NOW())";
                        esc = [ result.insertId, '127.0.0.1' ];
                        con.query( sql, esc, function( err, result ) {
                            if ( err ) {
                                return con.rollback( function() {
                                    con.release();
                                    callback( err );
                                } );
                            }

                            con.commit( function( err ) {
                                if ( err ) {
                                    return con.rollback( function() {
                                        con.release();
                                        callback( err );
                                    } );
                                }

                                con.release();

                                console.log( "New story: " + message );
                                callback( null );
                            } );
                        } );
                    } );
                } );
            } );
        } );
    }
};

// API routes
// -----------------------------------------------------------------------------
app.get( "/api/story/:language_id/:x/:y", function( req, res ) {
    var languageId = req.params.language_id;
    var x = req.params.x;
    var y = req.params.y;

    hive.getStory( languageId, x, y, function( err, result ) {
        if ( err ) {
            res.json( { error: true, response: err } );
            return;
        }

        res.json( result );
    } );
} );

app.post( "/api/story/:language_id/:x/:y", function( req, res ) {
    var languageId = req.params.language_id;
    var message = req.body;
    var x = req.params.x;
    var y = req.params.y;

    hive.createStory( languageId, message, x, y, function( err ) {
        if ( err ) {
            res.json( { error: true, response: err } );
            return;
        }

        hive.getStory( languageId, x, y, function( err, result ) {
            if ( err ) {
                res.json( { error: true, response: err } );
                return;
            }

            res.json( result );
        } );
    } );
} );

app.get( "*", function( req, res ) {
    res.sendFile( __dirname + "/public/index.html" );
} );

// Start server
// -----------------------------------------------------------------------------
app.listen( port );
console.log( "hive server listening on port " + port );
