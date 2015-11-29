var express = require( "express" );
var bodyParser = require( "body-parser" );
var config = require( "./scripts/config" );

// Server configurations
// -----------------------------------------------------------------------------
var app = express();
app.use( express.static( __dirname + "/public" ) );
app.use( bodyParser.text() );

var model = require( "./scripts/model.js" );
var routes = require( "./scripts/routes.js" )( app, model );

// Start server
// -----------------------------------------------------------------------------
var server = app.listen( config.port );

server.on( "connection", function( socket ) {
    socket.setTimeout( config.socketTimeout );
} );

console.log( "hive server listening on port " + config.port );
