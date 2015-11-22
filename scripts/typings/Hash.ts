class Hash {
    public static getVariables():Array<string> {
        var hash:string = window.location.hash;
        // Remove leading hash character
        hash = hash.replace( /^#/, "" );
        return hash.split( ";" );
    }

    public static getLanguageId():number {
        var vars:string[] = this.getVariables();

        for( var i:number = 0; i < vars.length; i++ ) {
            if ( /^\d+$/.test( vars[ i ] ) ) {
                return parseInt( vars[ i ] );
            }
        }

        return 1;
    }

    public static getPosition():Array<number> {
        var vars:string[] = this.getVariables();

        for( var i:number = 0; i < vars.length; i++ ) {
            if ( /^-?\d+,-?\d+$/.test( vars[ i ] ) ) {
                var position:Array<string> = vars[ i ].split( "," );
                var x:number = parseInt( position[ 0 ] );
                var y:number = parseInt( position[ 1 ] );
                return [ x, y ];
            }
        }

        return [ 0, 0 ];
    }

    public static getDebugMode():boolean {
        var vars:Array<string> = this.getVariables();

        for( var i:number = 0; i < vars.length; i++ ) {
            if ( vars[ i ].toLowerCase() == "debug" ) {
                return true;
            }
        }

        return false;
    }

    public static setVariables( vars:Array<string> ):void {
        window.location.hash = "#" + vars.join( ";" );
    }

    public static setPosition( x:number, y:number ):void {
        var vars:Array<string> = this.getVariables();

        for( var i:number = 0; i < vars.length; i++ ) {
            if ( /^-?\d+,-?\d+$/.test( vars[ i ] ) ) {
                vars.splice( i, 1 );
                i--;
            }
        }
        
        vars.push( x + "," + y );
        this.setVariables( vars );
    }
}
