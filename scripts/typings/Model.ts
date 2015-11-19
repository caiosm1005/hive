/// <reference path="definitions/reqwest/reqwest.d.ts" />
/// <reference path="Story.ts" />

class Model {
    static getStory( languageId:number, x:number, y:number,
        successCallback:( story:Story ) => void ):void {
        reqwest( {
            url: "api/story/" + languageId + "/" + x + "/" + y,
            method: "get",
            error: function( err:any ): void {
                throw err;
            },
            success: function( result:JSON ): void {

                console.log( result );

                var story:Story = new Story();
                story.x = result[ "story" ].x;
                story.y = result[ "story" ].y;
                story.message = result[ "story" ].message;
                story.languageId = languageId;

                for( var i:number = 0; i < result["neighbours"].length; i++ ) {
                    var neighbour:Story = new Story();
                    neighbour.x = result[ "neighbours" ][ i ].x;
                    neighbour.y = result[ "neighbours" ][ i ].y;
                    neighbour.message = result[ "neighbours" ][ i ].message;
                    neighbour.languageId = languageId;
                    story.neighbours[ i ] = neighbour;
                }

                successCallback( story );
            }
        } );
    }
}
