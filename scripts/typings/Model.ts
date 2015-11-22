/// <reference path="definitions/reqwest/reqwest.d.ts" />
/// <reference path="Story.ts" />
/// <reference path="StoryBank.ts" />

class Model {
    static getStories( languageId:number, x:number, y:number, r:number,
        callback:( storyBank:StoryBank ) => void ):void {
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
                var storyBank:StoryBank = new StoryBank( x, y, r, stories );
                callback( storyBank );
            }
        } );
    }
}
