function copyArguments( args ) {
    var argsArray = new Array( args.length );
    for( i = 0; i < args.length; i++ ) {
        argsArray[ i ] = args[ i ];
    }
    return argsArray;
}

module.exports = {
    ERROR: {
        "TOO_MANY_REQUESTS":[100,"Too many requests: wait $0ms"],
        "POS_RADIUS_INVALID":[101,"Position or radius is invalid"],
        "RADIUS_SIZE":[102,"Radius must be between 0 and $0"],
        "MESSAGE_LENGTH":[103,"Message must have between $0 and $1 characters"],
        "MESSAGE_REPEATED":[104,"Repeated message"],
        "STORY_EXISTS":[105,"A story already exists at [$0,$1]"],
        "STORY_ALONE":[106,"Cannot create story without a neighbour"],
        "DATABASE_ERROR":[107,"A database error ocurred: $0"]
    },
    INFO: {
        "STORY_CREATED":[201,"Story created at [$0,$1]: $2"],
    },

    // JSON functions
    // -------------------------------------------------------------------------
    getMessageJSON: function( type, tag ) {
        var message = null;

        for( var p in this[ type ] ) {
            if ( p === tag ) {
                message = {
                    type: type,
                    tag: tag,
                    code: this[ type ][ p ][ 0 ],
                    message: this[ type ][ p ][ 1 ],
                    values: Array.prototype.slice.call( arguments, 2 )
                };
                break;
            }
        }

        if ( message === null ) {
            throw "Message [" + type + "," + tag + "] not found";
        }

        for( var i = 0; i < message.values.length; i++ ) {
            message.message=message.message.replace( "$"+i, message.values[i] );
        }

        return message;
    },

    getErrorJSON: function( tag ) {
        var args = [ "ERROR" ].concat( copyArguments( arguments ) );
        return this.getMessageJSON.apply( this, args );
    },

    getInfoJSON: function( tag ) {
        var args = [ "INFO" ].concat( copyArguments( arguments ) );
        return this.getMessageJSON.apply( this, args );
    },

    // String functions
    // -------------------------------------------------------------------------
    getMessage: function( type, tag ) {
        var message = this.getMessageJSON.apply(this, copyArguments(arguments));
        return message.code + " " + message.message;
    },

    getError: function( tag ) {
        var args = [ "ERROR" ].concat( copyArguments( arguments ) );
        return this.getMessage.apply( this, args );
    },

    getInfo: function( tag ) {
        var args = [ "INFO" ].concat( copyArguments( arguments ) );
        return this.getMessage.apply( this, args );
    },

    // Printing functions
    // -------------------------------------------------------------------------
    printMessage: function( type, tag ) {
        var message = this.getMessageJSON.apply(this, copyArguments(arguments));

        if ( type == "ERROR" ) {
            console.error( message );
        }
        else {
            console.log( message );
        }
    },

    printError: function( tag ) {
        var args = [ "ERROR" ].concat( copyArguments( arguments ) );
        this.printMessage.apply( this, args );
    },

    printInfo: function( tag ) {
        var args = [ "INFO" ].concat( copyArguments( arguments ) );
        this.printMessage.apply( this, args );
    }
};
