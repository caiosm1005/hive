/// <reference path="Story.ts" />

class StoryBank {
    protected _x:number;
    protected _y:number;
    protected _mainStory:Story;
    protected _neighbours:Array<Story>;

    public getMainStory():Story {
        return this._mainStory;
    }

    public getAllStories():Array<Story> {
        if ( this._mainStory === null ) {
            return this._neighbours;
        }

        return this._neighbours.concat( this._mainStory );
    }

    public getNeighbourStories():Array<Story> {
        return this._neighbours;
    }

    constructor( x:number, y:number, stories:Array<Story> ) {
        this._mainStory = null;
        this._neighbours = new Array<Story>();

        for( var i:number = 0; i < stories.length; i++ ) {
            if ( this._mainStory === null &&
                stories[ i ].x == x && stories[ i ].y == y ) {
                this._mainStory = stories[ i ];
            }
            else {
                this._neighbours.push( stories[ i ] );
            }
        }
    }
}
