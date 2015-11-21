class Hash {
    public static getVariables():string[] {
        var hash:string = window.location.hash;
        // Remove leading hash character
        hash = hash.replace( /^#/, "" );
        return hash.split( "&" );
    }

    public static getPosition():number[] {
        var vars:string[] = this.getVariables();

        for( var i:number = 0; i < vars.length; i++ ) {
            if ( /^-?\d+,-?\d+$/.test( vars[ i ] ) ) {
                var position:string[] = vars[ i ].split( "," );
                var x:number = parseInt( position[ 0 ] );
                var y:number = parseInt( position[ 1 ] );
                return [ x, y ];
            }
        }

        return [ 0, 0 ];
    }

    public static getDebugMode():boolean {
        var vars:string[] = this.getVariables();

        for( var i:number = 0; i < vars.length; i++ ) {
            if ( vars[ i ].toLowerCase() == "debug" ) {
                return true;
            }
        }

        return false;
    }
}
