var express = require( "express" );
var bodyParser = require( "body-parser" );

// Server configurations
// -----------------------------------------------------------------------------
var port = 3014;
var socketTimeout = 20 * 1000;
var app = express();
app.use( express.static( __dirname + "/public" ) );
app.use( bodyParser.text() );

var model = require( "./scripts/model.js" );
var routes = require( "./scripts/routes.js" )( app, model );

// Start server
// -----------------------------------------------------------------------------
var server = app.listen( port );
server.on( "connection", function(socket){ socket.setTimeout(socketTimeout); });

console.log( "hive server listening on port " + port );
