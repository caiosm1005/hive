/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Model.ts" />
/// <reference path="Story.ts" />
/// <reference path="DisplayBackground.ts" />
/// <reference path="DisplayStory.ts" />
/// <reference path="DisplayStoryMain.ts" />
/// <reference path="DisplayNeighbour.ts" />
/// <reference path="DisplayNeighbourPlus.ts" />

class DisplayStoryScreen extends createjs.Container {
    protected _background:DisplayBackground;
    protected _foreground:createjs.Container;
    protected _displayStory:DisplayNeighbour;
    protected _displayNeighbours:DisplayStory[];
    public story:Story;

    public storyCoordToPosition( x:number, y:number ):number[] {
        var s:number = 70;
        var h:number = s * Math.sqrt( 3 ) / 2;
        var tx:number = x * s * 1.5;
        var ty:number = -y * h * 2 + x * h;
        return [ tx, ty ];
    }

    public panTo( x:number, y:number, noTransition?:boolean ):void {
        if ( ! noTransition ) {
            createjs.Tween.get( this._foreground )
                .to( { x: x, y: y }, 420,
                    createjs.Ease.sineInOut );

           createjs.Tween.get( this._background )
                .to( { x: x / 3, y: y / 3 }, 420,
                    createjs.Ease.sineInOut );
        }
        else {
            this._background.x = x / 3;
            this._background.y = y / 3;
            this._foreground.x = x;
            this._foreground.y = y;
        }
    }

    public moveTo( x:number, y:number, noTransition?:boolean ):void {

        // If new coordinates were given, load the new story and move to that
        // new position
        if ( ! ( this.story.x == x && this.story.y == y ) ) {
            Model.getStory( this.story.languageId, x, y, (story:Story):void => {
                this.story = story;
                this.moveTo( x, y, noTransition );
            } );
            return;
        }

        if ( this._displayStory !== null ) {
            if ( this._displayStory.story.x != x ||
                this._displayStory.story.y != y ) {

                if ( ! noTransition ) {
                    this._displayStory.animVanish();
                }
                else {
                    this._foreground.removeChild( this._displayStory );
                }

                this._displayStory = null;
            }
        }

        if ( this._displayStory === null ) {
            var coords:number[] = this.storyCoordToPosition( x, y );

            this._displayStory = new DisplayNeighbour( this.story );
            this._displayStory.x = coords[ 0 ];
            this._displayStory.y = coords[ 1 ];

            if ( ! noTransition ) {
                this._displayStory.animAppear();
            }

            this.panTo( -this._displayStory.x, -this._displayStory.y,
                noTransition );

            this._foreground.addChild( this._displayStory );
        }

        // Re-order array items and remove off-screen neighbours
        var sDisplayNeighbours:DisplayStory[] = [null,null,null,null,null,null];
        
        for( var i:number = 0; i < this._displayNeighbours.length; i++ ) {
            var displayNeighbour = this._displayNeighbours[ i ];

            if ( displayNeighbour === null ) {
                continue;
            }

            var isNeighbour:boolean = false;

            if (displayNeighbour.story.x == x && displayNeighbour.story.y == y){
                isNeighbour = true;
            }
            else {
                for( var j:number = 0; j < this.story.neighbours.length; j++ ) {
                    var neighbour = this.story.neighbours[ j ];
                    if ( displayNeighbour.story.x == neighbour.x &&
                        displayNeighbour.story.y == neighbour.y ) {
                        sDisplayNeighbours[ j ] = displayNeighbour;
                        isNeighbour = true;
                        break;
                    }
                }
            }

            if ( ! isNeighbour ) {
                if ( ! noTransition ) {
                    displayNeighbour.animVanish();
                }
                else {
                    this._foreground.removeChild( displayNeighbour );
                }
            }
        }

        this._displayNeighbours = sDisplayNeighbours;

        // Create new nodes, position them and add click callback
        for( var i:number = 0; i < this.story.neighbours.length; i++ ) {
            if ( this._displayNeighbours[ i ] !== null ) {
                continue;
            }

            var neighbour = this.story.neighbours[ i ];

            if ( neighbour.message === null ) {
                this._displayNeighbours[i]=new DisplayNeighbourPlus(neighbour);
            }
            else {
                this._displayNeighbours[i]=new DisplayNeighbour(neighbour);
            }

            var coords:number[] = this.storyCoordToPosition( neighbour.x,
                neighbour.y );
            this._displayNeighbours[ i ].x = coords[ 0 ];
            this._displayNeighbours[ i ].y = coords[ 1 ];

            if ( ! noTransition ) {
                this._displayNeighbours[ i ].animAppear();
            }

            this._foreground.addChild( this._displayNeighbours[ i ] );

            this._displayNeighbours[ i ].on("click", (e:createjs.Event):void =>{
                this.moveTo( e.target.story.x, e.target.story.y );
            });
        }
    }

    constructor( story:Story ) {
        super();

        this.story = story;
        this._background = new DisplayBackground();
        this._foreground = new createjs.Container();

        this.addChild( this._background );
        this.addChild( this._foreground );

        this._displayStory = null;
        this._displayNeighbours = [ null, null, null, null, null, null ];

        this.moveTo( story.x, story.y, true );
    }
}
