/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Story.ts" />
/// <reference path="DisplayStory.ts" />
/// <reference path="DisplayNeighbour.ts" />
/// <reference path="DisplayNeighbourPlus.ts" />

class DisplayStoryScreen extends createjs.Container {
    protected _background:DisplayBackground;
    protected _displayStory:DisplayStory;
    protected _displayNeighbours:createjs.Container[];
    public story:Story;

    public moveTo( x:number, y:number, noTransition?:boolean ):void {
        if ( ! ( this.story.x == x && this.story.y == y ) ) {
            Model.getStory( this.story.languageId, x, y, (story:Story):void => {
                this.story = story;
                this.moveTo( x, y, noTransition );
            } );
            return;
        }

        this._displayStory = new DisplayStory( this.story );
        this.addChild( this._displayStory );
    }

    constructor( story:Story ) {
        super();

        this.story = story;
        this._background = new DisplayBackground();
        this.addChild( this._background );

        this.moveTo( story.x, story.y, true );
    }
}
