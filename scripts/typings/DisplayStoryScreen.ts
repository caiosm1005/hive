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
    protected _foreground:createjs.Container;
    protected _displayStories:Array<DisplayStory>;
    protected _cachedStories:Array<Story>;
    protected _languageId:number;
    protected _storyX:number;
    protected _storyY:number;

    protected _getCachedStoryAt( x:number, y:number ):Story {
        for( var i:number = 0; i < this._cachedStories.length; i++ ) {
            if ( this._cachedStories[ i ].message !== null &&
                this._cachedStories[ i ].x == x && 
                this._cachedStories[ i ].y == y ){
                return this._cachedStories[ i ];
            }
        }
        return null;
    }

    protected _setCachedStoryAt( x:number, y:number, story:Story ):void {
        for( var i:number = 0; i < this._cachedStories.length; i++ ) {
            if ( this._cachedStories[ i ].x == x && 
                this._cachedStories[ i ].y == y ){
                this._cachedStories[ i ] = story;
                return;
            }
        }
        this._cachedStories.push( story );
    }

    protected _removeCachedStoryAt( x:number, y:number ):void {
        for( var i:number = 0; i < this._cachedStories.length; i++ ) {
            if ( this._cachedStories[ i ].x == x && 
                this._cachedStories[ i ].y == y ){
                this._cachedStories.splice( i, 1 );
                return;
            }
        }
    }

    protected _getCachedStoryNeighboursAt( x:number, y:number ):Array<Story> {
        var neighbours:Array<Story> = new Array<Story>();

        var neighbour1:Story = this._getCachedStoryAt( x + 1, y + 1 );
        var neighbour2:Story = this._getCachedStoryAt( x,     y + 1 );
        var neighbour3:Story = this._getCachedStoryAt( x - 1, y );
        var neighbour4:Story = this._getCachedStoryAt( x - 1, y - 1 );
        var neighbour5:Story = this._getCachedStoryAt( x,     y - 1 );
        var neighbour6:Story = this._getCachedStoryAt( x + 1, y );

        if ( neighbour1 !== null ) { neighbours.push( neighbour1 ); }
        if ( neighbour2 !== null ) { neighbours.push( neighbour2 ); }
        if ( neighbour3 !== null ) { neighbours.push( neighbour3 ); }
        if ( neighbour4 !== null ) { neighbours.push( neighbour4 ); }
        if ( neighbour5 !== null ) { neighbours.push( neighbour5 ); }
        if ( neighbour6 !== null ) { neighbours.push( neighbour6 ); }

        return neighbours;
    }

    protected _cacheStories( storyBank:StoryBank ):void {
        var x = storyBank.x;
        var y = storyBank.y;
        var r = storyBank.r;

        for( var dx:number = x - r; dx <= x + r; dx++ ) {
            for( var dy:number = y - r; dy <= y + r; dy++ ) {
                var dz = -( dx - x ) + ( dy - y );

                if ( dz < -r || dz > r ) {
                    continue;
                }

                var oldStory:Story = this._getCachedStoryAt( dx, dy );
                var currentStory:Story = storyBank.getStoryAt( dx, dy );

                if ( currentStory !== null ) {
                    if ( oldStory === null ||
                        oldStory.message !== currentStory.message ) {
                        this._setCachedStoryAt( dx, dy, currentStory );
                    }
                }
                else {
                    if ( oldStory !== null ) {
                        this._removeCachedStoryAt( dx, dy );
                    }

                    var neighbours = this._getCachedStoryNeighboursAt( dx, dy );

                    // Add story with null message -- this will be used for
                    // placing plusses
                    if ( neighbours.length > 0 ) {
                        var story:Story = new Story();
                        story.languageId = this._languageId;
                        story.message = null;
                        story.x = dx;
                        story.y = dy;
                        this._setCachedStoryAt( dx, dy, story );
                    }
                }
            }
        }

        this._refreshDisplayStories();
    }

    protected _storyToPosition(storyX:number,storyY:number):Array<number> {
        var s:number = 70;
        var h:number = s * Math.sqrt( 3 ) / 2;
        var tx:number = storyX * s * 1.5;
        var ty:number = -storyY * h * 2 + storyX * h;
        return [ tx, ty ];
    }

    protected _positionToStory( x:number, y:number ):Array<number> {
        return null;
    }

    protected _explore( storyX:number, storyY:number, r:number,
        callback?:( storyBank:StoryBank ) => void ):void {
        Model.getStories( this._languageId, storyX, storyY, r,
            (storyBank:StoryBank) => {
                this._cacheStories( storyBank );
                if ( callback != null ) {
                    callback( storyBank );
            }
        } );
    }

    protected _refreshDisplayStories():void {
        // First, remove outdated and far away display stories
        for( var i:number = 0; i < this._displayStories.length; i++ ) {
            var oldStory:Story = this._displayStories[ i ].story;
            var story:Story = this._getCachedStoryAt( oldStory.x, oldStory.y );
            
            var isDifferent:boolean;

            isDifferent = story !== null && ( story.message!=oldStory.message ||
                oldStory.x != story.x || oldStory.y != story.y ) ||
                story === null && oldStory.message !== null;

            if ( isDifferent ) {
                this._displayStories[ i ].animVanish();
                this._displayStories.splice( i, 1 );
                i--;
            }
        }

        // Then, add new display stories
        for( var i:number = 0; i < this._cachedStories.length; i++ ) {
            var story:Story = this._cachedStories[ i ];
            var hasDisplayStory:boolean = false;

            for( var j:number = 0; j < this._displayStories.length; j++ ) {
                var oldStory:Story = this._displayStories[ j ].story;

                if ( story.x == oldStory.x && story.y == oldStory.y ) {
                    hasDisplayStory = true;
                    break;
                }
            }

            if ( ! hasDisplayStory ) {
                var displayStory:DisplayStory;

                if ( story.message !== null ) {
                    displayStory = new DisplayNeighbour( story );
                }
                else {
                    displayStory = new DisplayNeighbourPlus( story );
                }

                var coords:Array<number> = this._storyToPosition( story.x,
                    story.y );
                displayStory.x = coords[ 0 ];
                displayStory.y = coords[ 1 ];
                displayStory.animAppear();

                displayStory.on( "click", ( e:createjs.Event ):void => {
                    this.moveTo( e.target.story.x, e.target.story.y );
                } );

                this._displayStories.push( displayStory );
                this._foreground.addChild( displayStory );
            }
        }
    }

    public panTo( x:number, y:number ):void {
        createjs.Tween.get( this._foreground )
            .to( { x: -x, y: -y }, 420,
                createjs.Ease.sineInOut );
    }

    public moveTo( x:number, y:number ):void {
        // Is there a story at this position that we already know of?
        var hasStory:boolean = this._getCachedStoryAt( x, y ) !== null;

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
                    var coords:Array<number> = this._storyToPosition( x, y );
                    this.panTo( coords[ 0 ], coords[ 1 ] );
                    this._explore( x, y, 4 );
                    this._storyX = x;
                    this._storyY = y;
                    Hash.setPosition( x, y );
                }
            } );
        }
        else {
            var coords:Array<number> = this._storyToPosition( x, y );
            this.panTo( coords[ 0 ], coords[ 1 ] );
            this._explore( x, y, 4 );
            this._storyX = x;
            this._storyY = y;
            Hash.setPosition( x, y );
        }
    }

    constructor() {
        super();

        var hashPosition = Hash.getPosition();

        this._foreground = new createjs.Container();
        this._displayStories = new Array<DisplayStory>();
        this._cachedStories = new Array<Story>();
        this._languageId = Hash.getLanguageId();
        this._storyX = hashPosition[ 0 ];
        this._storyY = hashPosition[ 1 ];

        // TODO: remove scaling
        var scalingContainer:createjs.Container = new createjs.Container();
        scalingContainer.scaleX = 0.68;
        scalingContainer.scaleY = 0.68;
        scalingContainer.addChild( this._foreground );

        this.addChild( scalingContainer );
        this.moveTo( this._storyX, this._storyY );

        // Explore every 5 seconds
        setInterval( ():void => {
            this._explore( this._storyX, this._storyY, 4 );
        }, 5000 );
    }
}
