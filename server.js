var express = require( "express" );
var bodyParser = require( "body-parser" );

// Server configurations
// -----------------------------------------------------------------------------
var port = 3014;
var app = express();
app.use( express.static( __dirname + "/public" ) );
app.use( bodyParser.text() );

var model = require( "./scripts/model.js" );
var routes = require( "./scripts/routes.js" )( app, model );

// Start server
// -----------------------------------------------------------------------------
app.listen( port );
console.log( "hive server listening on port " + port );
