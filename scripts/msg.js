var errors = {
    "TOO_MANY_REQUESTS": [ 100, "Too many requests" ],
    "POS_RADIUS_INVALID": [ 101, "Position or radius is invalid" ],
    "RADIUS_SIZE": [ 102, "Radius must be between 0 and $0" ],
    "MESSAGE_LENGTH": [ 103, "Message must have between $0 and $1 characters" ],
    "MESSAGE_REPEATED": [ 104, "Repeated message" ],
    "STORY_EXISTS": [ 105, "A story already exists at [$0,$1]" ],
    "STORY_ALONE": [ 106, "Cannot create story without a neighbour" ]
};

var infos = {
    "STORY_CREATED": [ 200, "Story created at [$0,$1]: $2" ]
};

module.exports = {
    ERROR: errors,
    INFO: infos,

    getMessage: function( type, tag ) {
        var message = null;

        for( var p in this[ type ] ) {
            if ( p === tag ) {
                message = this[ type ][ p ][ 0 ] + " " + this[ type ][ p ][ 1 ];
                break;
            }
        }

        if ( message === null ) {
            throw "Message not found";
        }

        for( var i = 2; i < arguments.length; i++ ) {
            message = message.replace( "$" + ( i - 2 ), arguments[ i ] );
        }

        return message;
    },

    printMessage: function( type, tag ) {
        var message = this.getMessage.apply( this, arguments );
        console.log( message );
    }
};
