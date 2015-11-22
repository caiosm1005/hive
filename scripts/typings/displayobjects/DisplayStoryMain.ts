/// <reference path="../definitions/createjs/createjs.d.ts" />
/// <reference path="../Story.ts" />
/// <reference path="DisplayStory.ts" />
/// <reference path="DisplayStoryBlobs.ts" />

class DisplayStoryMain extends DisplayStory {
    protected _blobs:DisplayStoryBlobs;
    protected _message:createjs.Text;
    public story:Story;

    public animMouseOver():void {
        
    }

    public animMouseOut():void {

    }

    public animAppear():void {
        this.alpha = 0;
        this._blobs.scaleX = 0.2;
        this._blobs.scaleY = 0.2;

        createjs.Tween.get( this )
            .to( { alpha: 1.0 }, 100,
                createjs.Ease.getPowIn( 3.0 ) );

        createjs.Tween.get( this._blobs )
            .to( { scaleX: 1.0, scaleY: 1.0 }, 320,
                createjs.Ease.getPowOut( 1.8 ) );
    }

    public animVanish():void {
        createjs.Tween.get( this )
            .wait(300)
            .to( { alpha: 0 }, 100,
                createjs.Ease.getPowOut( 3.0 ) )
            .call( function():void { this.parent.removeChild( this ); } );

        createjs.Tween.get( this._blobs )
            .to( { scaleX: 0.2, scaleY: 0.2 }, 320,
                createjs.Ease.getPowIn( 1.8 ) );
        
        createjs.Tween.get( this._message )
            .to( { scaleX: 0.15, scaleY: 0.15 }, 380,
                createjs.Ease.getBackIn( 1.1 ) );
    }

    constructor( story:Story ) {
        super( story );

        this._blobs = new DisplayStoryBlobs( 3, 0.65, 170 );

        var message = story.message;
        var baseline:string = "middle";
        var size:string = "140px";

        if ( message.length > 15 ) {
            message = this._wrapMessage( message, 15 );
            baseline = "bottom";
        }

        // Resize font
        if ( message.length > 15 ) {
            size = "100px";
        }
        else if ( message.length > 12 ) {
            size = "120px";
        }

        this._message=new createjs.Text(message,size+" 'Open Sans'", "#FFFFFF");
        this._message.textBaseline = baseline;
        this._message.textAlign = "center";
        this._message.maxWidth = 612;
        this._message.scaleX = 0.5;
        this._message.scaleY = 0.5;
        this._message.cache( -320, -160, 640, 320 );
        this._message.snapToPixel = true;

        this.addChild( this._blobs );
        this.addChild( this._message );

        this.addEventListener( "tick", ( e:createjs.Event ):void => {
            this._message.x = this._blobs.centerDeltaX * 6.2;
            this._message.y = this._blobs.centerDeltaY * 6.2;
        } );

        // TODO: Remove scale down
        this.scaleX = 0.5;
        this.scaleY = 0.5;
    }
}
