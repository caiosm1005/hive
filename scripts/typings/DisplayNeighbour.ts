/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Story.ts" />
/// <reference path="DisplayStory.ts" />
/// <reference path="DisplayStoryBlobs.ts" />

class DisplayNeighbour extends DisplayStory {
    protected _blobs:DisplayStoryBlobs;
    protected _message:createjs.Text;
    public story:Story;

    public animMouseOver():void {
        createjs.Tween.get( this._blobs )
            .to( { scaleX: 1.1, scaleY: 1.1 }, 350,
                createjs.Ease.getPowOut( 2.8 ) );

        createjs.Tween.get( this._message )
            .to( { scaleX: 0.7, scaleY: 0.7 }, 280,
                createjs.Ease.getBackOut( 4.0 ) );
    }

    public animMouseOut():void {
        createjs.Tween.get( this._blobs )
            .to( { scaleX: 1.0, scaleY: 1.0 }, 300,
                createjs.Ease.cubicOut );

        createjs.Tween.get( this._message )
            .to( { scaleX: 0.5, scaleY: 0.5 }, 300,
                createjs.Ease.cubicOut );
    }

    public animAppear():void {

    }

    public animVanish():void {

    }

    constructor( story:Story ) {
        super();

        this.story = story;
        this._blobs = new DisplayStoryBlobs( 8, 1.5, 25 );

        var message = story.message;
        var baseline:string = "middle";

        if ( message.length > 15 ) {
            message = wrapMessage( message, 15 );
            baseline = "bottom";
        }

        this._message = new createjs.Text( message, "bold 24px 'Open Sans'",
            "#FFFFFF" );
        this._message.textBaseline = baseline;
        this._message.textAlign = "center";
        this._message.maxWidth = 170;
        this._message.scaleX = 0.5;
        this._message.scaleY = 0.5;
        this._message.cache( -90, -48, 180, 75 );
        this._message.snapToPixel = true;

        this.addChild( this._blobs );
        this.addChild( this._message );

        this.addEventListener( "tick", ( e:createjs.Event ) => {
            this._message.x = this._blobs.centerDeltaX * 6.2;
            this._message.y = this._blobs.centerDeltaY * 6.2;
        });

        var hitArea:createjs.Shape = new createjs.Shape();
        hitArea.graphics.beginFill( "#FFF" );
        hitArea.graphics.drawRect( -38, -38, 76, 76 );

        this.hitArea = hitArea;
        this.cursor = "pointer";

        this.on( "mouseover", this.animMouseOver );
        this.on( "mouseout", this.animMouseOut );
    }
}
