module.exports = function( app, model ) {
    app.get( "/api/story/:language_id/:x/:y/:r", function( req, res ) {
        var remoteAddress = req.connection.remoteAddress;
        var languageId = req.params.language_id;
        var x = req.params.x;
        var y = req.params.y;
        var r = req.params.r;

        model.getStories(languageId,x,y,r,remoteAddress,function(err,result) {
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

        model.createStory( languageId, message, x, y, remoteAddress,
            function( err ) {
                if ( err ) {
                    res.json( { error: true, response: err } );
                    return;
                }

                model.getStories(languageId,x,y,1,null,function( err, result ) {
                    if ( err ) {
                        res.json( { error: true, response: err } );
                        return;
                    }
                    res.json( result );
                } );
            } );
    } );
};
