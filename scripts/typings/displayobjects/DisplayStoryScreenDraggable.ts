/// <reference path="../definitions/createjs/createjs.d.ts" />

class DisplayStoryScreenDraggable extends createjs.Container {
    protected _dragStartX:number;
    protected _dragStartY:number;
    protected _monX:number;
    protected _monY:number;

    protected _onTick( e:createjs.Event ):void {
        if ( this._monX == 0 && this._monY == 0 || this._dragStartX !== null ) {
            return;
        }

        var drag = 0.86;

        this._monX *= drag;
        this._monY *= drag;

        this.x += this._monX;
        this.y += this._monY;

        if ( ~~( this._monX * 100 ) == 0 ) { this._monX = 0; }
        if ( ~~( this._monY * 100 ) == 0 ) { this._monY = 0; }
    }

    protected _onDrag( e:createjs.Event ):void {
        var pt:createjs.Point = this.parent.globalToLocal( e.stageX, e.stageY );

        if ( this._dragStartX === null ) {
            this._dragStartX = pt.x - this.x;
            this._dragStartY = pt.y - this.y;
        }

        var prevX:number = this.x;
        var prevY:number = this.y;

        this.x = pt.x - this._dragStartX;
        this.y = pt.y - this._dragStartY;

        this._monX = this.x - prevX;
        this._monY = this.y - prevY;
    }

    protected _onDragEnd( e:createjs.Event ):void {
        this._dragStartX = null;
        this._dragStartY = null;
    }

    constructor() {
        super();

        this._dragStartX = null;
        this._dragStartY = null;
        this._monX = 0;
        this._monY = 0;

        this.on( "tick", this._onTick );
        this.on( "pressmove", this._onDrag );
        this.on( "pressup", this._onDragEnd );
    }
}
