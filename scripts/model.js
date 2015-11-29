var mysql = require( "mysql" );
var config = require( "./config" );
var response = require( "./response" );

var pool = mysql.createPool( {
    connectionLimit: config.connLimit,
    host: config.connHost,
    user: config.connUser,
    password: config.connPassword,
    database: config.connDatabase
} );

// This object holds the remote address under cooldown time. This is used to
// mitigate brute force attacks and avoid bottlenecking the MySQL database
var connectedClients = {
    list: {},

    renew: function() {
        var clients = {};
        var currentTime = new Date().getTime();
        for( var client in this.list ) {
            if ( currentTime < this.list[ client ] ) {
                clients[ client ] = this.list[ client ];
            }
        }
        this.list = clients;
    },

    check: function( remoteAddr, errorCallback ) {
        if ( remoteAddr === null ) {
            return true;
        }
        this.renew();
        for( var client in this.list ) {
            if ( client == remoteAddr ) {
                var cooldown = this.list[ client ] - new Date().getTime();
                var resp = response.getErrorJSON("TOO_MANY_REQUESTS", cooldown);
                errorCallback( resp );
                return false;
            }
        }
        return true;
    },

    add: function( remoteAddr ) {
        if ( remoteAddr === null ) {
            return;
        }
        this.list[ remoteAddr ] = new Date().getTime() + config.connCooldown;
    }
};

module.exports = {
    getStories: function( languageId, x, y, r, remoteAddr, callback ) {

        // Check if this client is in cooldown
        if ( ! connectedClients.check( remoteAddr, callback ) ) {
            return;
        }
        connectedClients.add( remoteAddr );

        var _x = x;
        var _y = y;
        var _r = r;
        x = parseInt( x );
        y = parseInt( y );
        r = parseInt( r );

        if ( _x!=x || _y!=y || _r!=r || isNaN(x) || isNaN(y) || isNaN(r) ) {
            var resp = response.getErrorJSON( "POS_RADIUS_INVALID" );
            callback( resp );
            return;
        }

        if ( r > config.storyMaxRadius || r < 0 ) {
            var resp=response.getErrorJSON("RADIUS_SIZE",config.storyMaxRadius);
            callback( resp );
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
                var resp = response.getErrorJSON( "DATABASE_ERROR", err );
                callback( resp );
                return;
            }
            callback( rows );
        } );
    },

    createStory: function( languageId, message, x, y, remoteAddr, callback ){

        // Check if this client is in cooldown
        if ( ! connectedClients.check( remoteAddr, callback ) ) {
            return;
        }
        connectedClients.add( remoteAddr );

        var _x = x;
        var _y = y;
        x = parseInt( x );
        y = parseInt( y );

        if ( _x != x || _y != y || isNaN( x ) || isNaN( y ) ) {
            var resp = response.getErrorJSON( "POS_RADIUS_INVALID" );
            callback( resp );
            return;
        }

        if ( message.length > config.storyMaxChars ||
            message.length < config.storyMinChars ){
            var resp = response.getErrorJSON( "MESSAGE_LENGTH",
                config.storyMinChars, config.storyMaxChars );
            callback( resp );
            return;
        }

        this.getStories( languageId, x, y, 1, null, function( stories ) {

            // Check for error response
            if ( stories.code ) {
                callback( stories );
                return;
            }

            var hasNeighbour = false;

            // Check if the given position is occupied
            for( var i = 0; i < stories.length; i++ ) {
                if ( stories[ i ].x == x && stories[ i ].y == y ) {
                    var resp = response.getErrorJSON( "STORY_EXISTS", x, y );
                    callback( resp );
                    return;
                }

                hasNeighbour = true;
            }

            if ( ! hasNeighbour ) {
                var resp = response.getErrorJSON( "STORY_ALONE" );
                callback( resp );
                return;
            }

            // Insert the new story: start transaction for this and rollback if
            // something goes wrong
            pool.getConnection( function( err, con ) {
                if ( err ) {
                    con.release();
                    var resp = response.getErrorJSON( "DATABASE_ERROR", err );
                    callback( resp );
                    return;
                }

                con.beginTransaction( function( err ) {
                    if ( err ) {
                        con.release();
                        var resp = response.getErrorJSON("DATABASE_ERROR", err);
                        callback( resp );
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
                                var resp = response.getErrorJSON(
                                    "DATABASE_ERROR", err );
                                callback( resp );
                                return;
                            } );
                        }

                        sql = "INSERT INTO log_story " +
                            "(story_id, remote_addr, created_on) " +
                            "VALUES (?, ?, NOW())";
                        esc = [ result.insertId, remoteAddr ];
                        con.query( sql, esc, function( err, result ) {
                            if ( err ) {
                                return con.rollback( function() {
                                    con.release();
                                    var resp = response.getErrorJSON(
                                        "DATABASE_ERROR", err );
                                    callback( resp );
                                } );
                            }

                            con.commit( function( err ) {
                                if ( err ) {
                                    return con.rollback( function() {
                                        con.release();
                                        var resp = response.getErrorJSON(
                                            "DATABASE_ERROR", err );
                                        callback( resp );
                                    } );
                                }

                                con.release();

                                response.printInfo("STORY_CREATED",x,y,message);
                                callback();
                            } );
                        } );
                    } );
                } );
            } );
        } );
    }
};
