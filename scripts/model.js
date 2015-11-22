var mysql = require( "mysql" );

var connectionLimit = 4;
var connectionHost = "";     //
var connectionUser = "";     // TODO: Replace with production values
var connectionPassword = ""; //
var connectionDatabase = ""; //

// List of clients by remote address and the timestamp of their last request
// This is used to initiate a cooldown each time a client sends a model request
// to avoid server overload
var connectionClients = {};
var connectionCooldown = 200;

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

function renewConnectionClients() {
    var clients = {};
    var currentTime = new Date().getTime();

    for( var client in connectionClients ) {
        if ( currentTime - connectionClients[ client ] <= connectionCooldown ) {
            clients[ client ] = connectionClients[ client ];
        }
    }

    connectionClients = clients;
}

function checkConnectionClient( remoteAddress ) {
    // TODO: Find a better way of bottlenecking request spam
    return false;

    if ( remoteAddress === null ) {
        return false;
    }

    renewConnectionClients();

    for( var client in connectionClients ) {
        if ( client == remoteAddress ) {
            return true;
        }
    }

    return false;
}

function addConnectionClient( remoteAddress ) {
    if ( remoteAddress === null ) {
        return;
    }

    var currentTime = new Date().getTime();
    connectionClients[ remoteAddress ] = currentTime;
}

// Story variables
var storyMaxRadius = 4;
var storyMinChars = 3;
var storyMaxChars = 35;

module.exports = {
    getStories: function( languageId, x, y, r, remoteAddress, callback ) {
        if ( checkConnectionClient( remoteAddress ) ) {
            callback( "100 Too many requests" );
            return;
        }

        addConnectionClient( remoteAddress );

        var _x = x;
        var _y = y;
        var _r = r;
        x = parseInt( x );
        y = parseInt( y );
        r = parseInt( r );

        if ( _x!=x || _y!=y || _r!=r || isNaN(x) || isNaN(y) || isNaN(r) ) {
            callback( "101 Requested position or radius is invalid" );
            return;
        }

        if ( r > storyMaxRadius ) {
            callback( "102 Requested radius is too large" );
            return;
        }

        if ( r < 0 ) {
            callback( "103 Requested radius must be greater than zero" );
            return;
        }

        var sql = "SELECT message, x, y FROM story " +
            "WHERE story.language_id = ? AND " +
            "story.x - ? BETWEEN -? AND ? AND " +
            "story.y - ? BETWEEN -? AND ? AND " +
            "-(story.x - ?) + (story.y - ?) BETWEEN -? AND ?";
        esc = [ languageId, x, r, r, y, r, r, x, y, r, r ];
        
        pool.query( sql, esc, function( err, rows, fields ) {
            if ( err ) {
                callback( err );
                return;
            }
            callback( null, rows );
        } );
    },

    createStory: function( languageId, message, x, y, remoteAddress, callback ){
        if ( checkConnectionClient( remoteAddress ) ) {
            callback( "100 Too many requests" );
            return;
        }

        addConnectionClient( remoteAddress );

        var _x = x;
        var _y = y;
        x = parseInt( x );
        y = parseInt( y );

        if ( _x != x || _y != y || isNaN( x ) || isNaN( y ) ) {
            callback( "101 Requested position or radius is invalid" );
            return;
        }

        if ( message.length > storyMaxChars ) {
            callback( "104 Message exceeds character count limit" );
            return;
        }

        if ( message.length < storyMinChars ) {
            callback( "105 Message is too short" );
            return;
        }

        this.getStories( languageId, x, y, 1, null, function( err, stories ) {
            if ( err ) {
                callback( err );
                return;
            }

            var hasNeighbour = false;
            var repeatedMessage = false;

            // Check if the given position is occupied
            for( var i = 0; i < stories.length; i++ ) {
                if ( stories[ i ].x == x && stories[ i ].y == y ) {
                    callback( "106 A story already exists " +
                        "at the given position" );
                    return;
                }

                hasNeighbour = true;

                if ( stories[ i ].message == message ) {
                    repeatedMessage = true;
                }
            }

            if ( ! hasNeighbour ) {
                callback( "107 Cannot create story without a neighbour" );
                return;
            }

            if ( repeatedMessage ) {
                callback( "108 Repeated message" );
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
                        esc = [ result.insertId, remoteAddress ];
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
