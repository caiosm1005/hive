/// <reference path="definitions/reqwest/reqwest.d.ts" />
/// <reference path="Story.ts" />
/// <reference path="StoryBank.ts" />

class Model {
    protected static _requestCooldown:number = 450;
    protected static _lastRequest:number = 0;

    static getStories( languageId:number, x:number, y:number, r:number,
        callback:( storyBank:StoryBank ) => void ):void {

        var currentTime = new Date().getTime();

        if ( currentTime - this._lastRequest <= this._requestCooldown ) {
            setTimeout( ():void => {
                this.getStories( languageId, x, y, r, callback );
            }, this._requestCooldown );
        }
        else {
            reqwest( {
                url: "api/story/" + languageId + "/" + x + "/" + y + "/" + r,
                method: "get",
                error: function( err:string ): void {
                    throw err;
                },
                success: function( stories:Array<Story> ): void {
                    for( var i:number = 0; i < stories.length; i++ ) {
                        stories[ i ].languageId = languageId;
                    }
                    var storyBank:StoryBank = new StoryBank( x, y, stories );
                    callback( storyBank );
                }
            } );
        }
    }
}
