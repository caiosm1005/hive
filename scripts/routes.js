module.exports = function( app, model ) {
    app.get( "/api/story/:language_id/:x/:y", function( req, res ) {
        var languageId = req.params.language_id;
        var x = req.params.x;
        var y = req.params.y;

        model.getStory( languageId, x, y, function( err, result ) {
            if ( err ) {
                res.json( { error: true, response: err } );
                return;
            }

            res.json( result );
        } );
    } );

    app.post( "/api/story/:language_id/:x/:y", function( req, res ) {
        var remoteAddress = req.connection.remoteAddress;
        var languageId = req.params.language_id;
        var message = req.body;
        var x = req.params.x;
        var y = req.params.y;

        model.createStory( languageId, message, x, y, remoteAddress, function( err ){
            if ( err ) {
                res.json( { error: true, response: err } );
                return;
            }

            model.getStory( languageId, x, y, function( err, result ) {
                if ( err ) {
                    res.json( { error: true, response: err } );
                    return;
                }

                res.json( result );
            } );
        } );
    } );
};
