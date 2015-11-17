/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="DisplayStory.ts" />

class DisplayNeighbourPlus extends DisplayStory {
    protected circle:createjs.Shape;
    protected plus:createjs.Shape;

    public animMouseOver():void {
        createjs.Tween.get( this )
            .to( { alpha: 1.0 }, 90,
                createjs.Ease.cubicInOut );

        createjs.Tween.get( this.circle )
            .to( { scaleX: 1.1, scaleY: 1.1 }, 350,
                createjs.Ease.getPowOut( 2.8 ) );

        createjs.Tween.get( this.plus )
            .to( { scaleX: 1.34, scaleY: 1.34 }, 280,
                createjs.Ease.getBackOut( 4.0 ) );
    }

    public animMouseOut():void {
        createjs.Tween.get( this )
            .to( { alpha: 0.8 }, 300,
                createjs.Ease.cubicOut);

        createjs.Tween.get( this.circle )
            .to( { scaleX: 1.0, scaleY: 1.0 }, 300,
                createjs.Ease.cubicOut);

        createjs.Tween.get( this.plus )
            .to( { scaleX: 0.9, scaleY: 0.9 }, 300,
                createjs.Ease.cubicOut);
    }

    public animAppear():void {

    }

    public animVanish():void {

    }

    constructor() {
        super();

        this.circle = new createjs.Shape();
        this.circle.graphics.beginFill( "DeepSkyBlue" );
        this.circle.graphics.drawCircle( 0, 0, 28 );
        this.circle.alpha = 0.3;

        this.plus = new createjs.Shape();
        this.plus.graphics.beginFill("#FFF");
        this.plus.graphics.drawRoundRect( -15, -2, 30, 4, 2 );
        this.plus.graphics.drawRoundRect( -2, -15, 4, 30, 2 );
        this.plus.scaleX = 0.9;
        this.plus.scaleY = 0.9;

        this.addChild( this.circle );
        this.addChild( this.plus );

        var hitArea:createjs.Shape = new createjs.Shape();
        hitArea.graphics.beginFill( "#FFF" );
        hitArea.graphics.drawRect( -38, -38, 76, 76 );

        this.hitArea = hitArea;
        this.cursor = "pointer";
        this.alpha = 0.5;

        this.on( "mouseover", this.animMouseOver );
        this.on( "mouseout", this.animMouseOut );
    }
}
