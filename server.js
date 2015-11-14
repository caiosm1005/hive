var express  = require( "express" );
var morgan = require( "morgan" ); 

// Server configurations
var port = 3014;
var app = express();
app.use( express.static( __dirname + "/public" ) );
app.use( morgan( "dev" ) ); 
app.get( "*", function( req, res ) { res.sendFile( __dirname + "/public/index.html" ); } );

// Start server
app.listen( port );
console.log( "hive server listening on port " + port );
