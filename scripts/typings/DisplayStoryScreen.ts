/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Model.ts" />
/// <reference path="Hash.ts" />
/// <reference path="Story.ts" />
/// <reference path="DisplayBackground.ts" />
/// <reference path="DisplayStory.ts" />
/// <reference path="DisplayStoryMain.ts" />
/// <reference path="DisplayNeighbour.ts" />
/// <reference path="DisplayNeighbourPlus.ts" />

class DisplayStoryScreen extends createjs.Container {
    protected _background:DisplayBackground;
    protected _foreground:createjs.Container;
    protected _displayStories:Array<DisplayStory>;
    
    protected _languageId:number;

    protected _addDisplayStory( story:Story ) {
        var displayStory = new DisplayNeighbour( story );
        var coords:Array<number> = this._storyCoordToPosition( story.x,story.y );

        displayStory.x = coords[ 0 ];
        displayStory.y = coords[ 1 ];
        displayStory.animAppear();

        displayStory.on( "click", ( e:createjs.Event ):void => {
            this.moveTo( e.target.story.x, e.target.story.y );
        } );

        this._displayStories.push( displayStory );
        this._foreground.addChild( displayStory );
    }

    protected _explore( x:number, y:number, r:number,
        callback?:( storyBank:StoryBank ) => void ):void {
        Model.getStories( this._languageId, x, y, r, (storyBank:StoryBank) => {
            var stories:Array<Story> = storyBank.getAllStories();

            for( var i:number = 0; i < stories.length; i++ ) {
                var newStory:boolean = true;

                for( var j:number = 0; j < this._displayStories.length; j++ ) {
                    if ( stories[ i ].x == this._displayStories[ j ].story.x &&
                        stories[ i ].y == this._displayStories[ j ].story.y ) {
                        newStory = false;
                        break;
                    }
                }

                if ( newStory ) {
                    this._addDisplayStory( stories[ i ] );
                }
            }

            if ( callback != null ) {
                callback( storyBank );
            }
        } );
    }

    protected _storyExplored( x:number, y:number ):boolean {
        for( var i:number = 0; i < this._displayStories.length; i++ ) {
            if ( this._displayStories[ i ].story.x == x &&
                this._displayStories[ i ].story.y == y ){
                return true;
            }
        }
        return false;
    }

    protected _storyCoordToPosition( x:number, y:number ):Array<number> {
        var s:number = 70;
        var h:number = s * Math.sqrt( 3 ) / 2;
        var tx:number = x * s * 1.5;
        var ty:number = -y * h * 2 + x * h;
        return [ tx, ty ];
    }

    public panTo( x:number, y:number ):void {
        createjs.Tween.get( this._foreground )
            .to( { x: -x, y: -y }, 420,
                createjs.Ease.sineInOut );

        createjs.Tween.get( this._background )
            .to( { x: -x / 3, y: -y / 3 }, 420,
                createjs.Ease.sineInOut );
    }

    public moveTo( x:number, y:number ):void {
        // Is there a story at this position that we already know of?
        var hasStory:boolean = this._storyExplored( x, y );

        // Try to get stories at the given position and range. If that fails,
        // search at the origin [0,0]. If that also fails, throw an error!
        if ( ! hasStory ) {
            this._explore( x, y, 1, ( storyBank:StoryBank ):void => {
                if ( storyBank.getMainStory() === null ) {
                    if ( x == 0 && y == 0 ) {
                        throw "Story not found at origin!";
                    }

                    this.moveTo( 0, 0 );
                }
                else {
                    var coords:Array<number> = this._storyCoordToPosition(x, y);
                    this.panTo( coords[ 0 ], coords[ 1 ] );
                    this._explore( x, y, 4 );
                }
            } );
        }
        else {
            var coords:Array<number> = this._storyCoordToPosition( x, y );
            this.panTo( coords[ 0 ], coords[ 1 ] );
            this._explore( x, y, 4 );
        }
    }

    constructor() {
        super();

        var hashPosition = Hash.getPosition();
        this._languageId = Hash.getLanguageId();

        this._background = new DisplayBackground();
        this._foreground = new createjs.Container();

        this.addChild( this._background );
        this.addChild( this._foreground );

        this._displayStories = new Array<DisplayStory>();

        this.moveTo( hashPosition[ 0 ], hashPosition[ 1 ] );

        // Explore every 5 seconds
        setInterval( ():void => {
            hashPosition = Hash.getPosition();
            this._explore( hashPosition[ 0 ], hashPosition[ 1 ], 4 );
        }, 5000 );
    }
}
