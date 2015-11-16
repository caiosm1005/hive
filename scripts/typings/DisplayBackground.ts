/// <reference path="definitions/createjs/createjs.d.ts" />

class DisplayBackground extends createjs.Container {
    constructor() {
        super();

        var rect = new createjs.Shape();
        rect.graphics.clear();
        rect.graphics.beginFill("#ccc");
        // rect.graphics.drawRect( 0, 0, stage.canvas.width, stage.canvas.height );
        rect.graphics.drawRect(0, 0, 800, 600);

        this.addChild(rect);
    }
}
