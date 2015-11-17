/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Story.ts" />
/// <reference path="DisplayStory.ts" />
/// <reference path="DisplayStoryMain.ts" />
/// <reference path="DisplayNeighbour.ts" />
/// <reference path="DisplayNeighbourPlus.ts" />

class DisplayStoryScreen extends createjs.Container {
    protected _background:DisplayBackground;
    protected _displayStory:DisplayStoryMain;
    protected _displayNeighbours:DisplayStory[];
    public story:Story;

    public moveTo( x:number, y:number, noTransition?:boolean ):void {
        if ( ! ( this.story.x == x && this.story.y == y ) ) {
            Model.getStory( this.story.languageId, x, y, (story:Story):void => {
                this.story = story;
                this.moveTo( x, y, noTransition );
            } );
            return;
        }

        if ( this._displayStory === null ) {
            this._displayStory = new DisplayStoryMain( this.story );
            this.addChild( this._displayStory );
        }

        for( var i:number = 0; i < this.story.neighbours.length; i++ ) {
            var neighbour = this.story.neighbours[ i ];

            // Remove old nodes (make them vanish)
            if ( this._displayNeighbours[ i ] !== null ) {
                if ( this._displayNeighbours[ i ].story.x != neighbour.x ||
                    this._displayNeighbours[ i ].story.y != neighbour.y ) {
                    this._displayNeighbours[ i ].animVanish();
                    this._displayNeighbours[ i ] = null;
                }
            }

            // Create new nodes, position them and add click callback
            if ( this._displayNeighbours[ i ] === null ) {
                if ( neighbour === null ) {
                    this._displayNeighbours[i]=new DisplayNeighbourPlus();
                }
                else {
                    this._displayNeighbours[i]=new DisplayNeighbour(neighbour);
                }
                if ( ! noTransition ) {
                    this._displayNeighbours[ i ].animAppear();
                }

                this.addChild( this._displayNeighbours[ i ] );

                var angle:number = -Math.PI * 2 * ( (i + 1) / 6 ) + Math.PI / 6;
                this._displayNeighbours[ i ].x = Math.cos( angle ) * 250;
                this._displayNeighbours[ i ].y = Math.sin( angle ) * 250;

                this._displayNeighbours[ i ].on( "click", ():void => {
                    this.moveTo( this._displayNeighbours[ i ].story.x,
                        this._displayNeighbours[ i ].story.y );
                } );
            }
        }
    }

    constructor( story:Story ) {
        super();

        this.story = story;
        this._background = new DisplayBackground();
        this.addChild( this._background );

        this._displayStory = null;
        this._displayNeighbours = [ null, null, null, null, null, null, null ];

        this.moveTo( story.x, story.y, true );




/*


        var displayStory:DisplayStory = new DisplayStory( story );
        var displayStoryUnderneath:DisplayNeighbour=new DisplayNeighbour(story);

        this.addChild( displayStoryUnderneath );
        this.addChild( displayStory );

        for ( var i:number = 0; i < story.neighbours.length; i++ ) {
            var neighbour:Story = story.neighbours[ i ];
            var displayNeighbour:createjs.Container;

            if ( neighbour === null ) {
                displayNeighbour = new DisplayNeighbourPlus();
            }
            else {
                displayNeighbour = new DisplayNeighbour( neighbour );
            }

            var angle:number = -Math.PI * 2 * ( (i + 1) / 6 ) + Math.PI / 6;
            displayNeighbour.x = Math.cos( angle ) * 250;
            displayNeighbour.y = Math.sin( angle ) * 250;
            // displayNeighbour.on("click", neighbourClickCallback);

            this.addChild( displayNeighbour );
        }

        /*
var container = new createjs.Container();
    var displayStory = new DisplayStory(story.message);

    function neighbourClickCallback(event) {
        getStory(languageId, event.target.storyX, event.target.storyY,
            function(err, result) {
                if (err) {
                    throw err;
                }

                container.moveToNeighbour(event.target);
                setTimeout(function() { window.location.reload() }, 500);
            });
    }

    for (var i = 0; i < neighbours.length; i++) {
        var neighbour = neighbours[i];
        var displayNeighbour;

        if (neighbour === null) {
            displayNeighbour = new DisplayNeighbourPlus();
        }
        else {
            displayNeighbour = new DisplayNeighbour(neighbour.message);
            displayNeighbour.storyX = neighbour.x;
            displayNeighbour.storyY = neighbour.y;
            displayNeighbour.message = neighbour.message;
        }

        var angle = -Math.PI * 2 * ((i + 1) / 6) + Math.PI / 6;
        displayNeighbour.x = Math.cos(angle) * 250;
        displayNeighbour.y = Math.sin(angle) * 250;
        displayNeighbour.on("click", neighbourClickCallback);

        container.addChild(displayNeighbour);
    }

    var displayStoryUnderneath = new DisplayNeighbour(story.message);
    displayStoryUnderneath.storyX = story.x;
    displayStoryUnderneath.storyY = story.y;
    displayStoryUnderneath.message = story.message;
    displayStoryUnderneath.on("click", neighbourClickCallback);

    container.addChild(displayStoryUnderneath);
    container.addChild(displayStory);

    container.moveToNeighbour = function(displayNeighbour) {
        displayStory.animateVanish();
        displayStory = new DisplayStory(displayNeighbour.message);
        displayStory.x = displayNeighbour.x;
        displayStory.y = displayNeighbour.y;
        displayStory.animateAppear();

        container.addChild(displayStory);

        changePosition(displayNeighbour.storyX, displayNeighbour.storyY);
    };

    return container;
        */
    }
}
