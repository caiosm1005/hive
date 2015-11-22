/// <reference path="Story.ts" />

class StoryBank {
    protected _mainStory:Story;
    protected _neighbours:Array<Story>;
    public x:number;
    public y:number;
    public r:number;

    public getMainStory():Story {
        return this._mainStory;
    }

    public getStoryAt( x:number, y:number ):Story {
        if ( this._mainStory.x == x && this._mainStory.y == y ) {
            return this._mainStory;
        }

        for( var i:number = 0; i < this._neighbours.length; i++ ) {
            if ( this._neighbours[ i ].x == x && this._neighbours[ i ].y == y ){
                return this._neighbours[ i ];
            }
        }

        return null;
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

    constructor( x:number, y:number, r:number, stories:Array<Story> ) {
        this.x = x;
        this.y = y;
        this.r = r;
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
