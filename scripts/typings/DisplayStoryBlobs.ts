/// <reference path="definitions/createjs/createjs.d.ts" />

class DisplayStoryBlobs extends createjs.Container {
    public centerDeltaX:number;
    public centerDeltaY:number;

    constructor( numBlobs:number, speed:number, radius:number ) {
        super();

        this.centerDeltaX = 0.0;
        this.centerDeltaY = 0.0;

        speed /= 100;

        var circleTimes1:number[] = [];
        var circleTimes2:number[] = [];
        var circleOffsets:number[][] = [];
        var circles:createjs.Shape[] = [];

        for( var i:number = 0; i < numBlobs; i++ ) {
            var circle:createjs.Shape = new createjs.Shape();
            circle.graphics.beginFill( "DeepSkyBlue" );
            circle.graphics.drawCircle( 0, 0, radius );

            var offsetX:number = Math.random() * radius / 10 + 10;
            var offsetY:number = Math.random() * radius / 10 + 10;

            circleTimes1.push( Math.random() * 10 );
            circleTimes2.push( Math.random() * 10 );
            circleOffsets.push( [ offsetX, offsetY ] );
            circles.push( circle );
            
            this.addChild( circle );
        }

        this.addEventListener( "tick", ( e:createjs.Event ):void => {
            this.centerDeltaX = 1.0;
            this.centerDeltaY = 1.0;

            for( var i:number = 0; i < circles.length; i++ ) {
                var deltaX:number = Math.cos( circleTimes1[ i ] );
                var deltaY:number = Math.sin( circleTimes1[ i ] );

                circles[ i ].x = deltaX * circleOffsets[ i ][ 0 ];
                circles[ i ].y = deltaY * circleOffsets[ i ][ 1 ];
                circles[ i ].scaleX = 1.0 + Math.cos( circleTimes2[i] ) * 0.07;
                circles[ i ].scaleY = 1.0 + Math.sin( circleTimes2[i] ) * 0.07;

                circleTimes1[ i ] += speed;
                circleTimes2[ i ] += speed;

                this.centerDeltaX *= deltaX;
                this.centerDeltaY *= deltaY;
            }
        } );
    }
}
