/// <reference path="../definitions/createjs/createjs.d.ts" />
/// <reference path="../Hash.ts" />
/// <reference path="../Story.ts" />

abstract class DisplayStory extends createjs.Container {
    public story:Story;

    public abstract animMouseOver():void;
    public abstract animMouseOut():void;
    public abstract animAppear():void;
    public abstract animVanish():void;

    protected _wrapMessage( msg:string, breakingPoint:number ):string {
        if ( msg.length <= breakingPoint ) {
            return msg;
        }

        var textSplit = false;

        for( var i:number = breakingPoint; i < msg.length &&
            i < breakingPoint + 10; i++ ) {
            if ( msg[i] == " " ) {
                msg = msg.substr( 0, i ) + "\n" + msg.substr( i + 1 );
                textSplit = true;
                break;
            }
        }

        if ( ! textSplit ) {
            for( var i = breakingPoint - 1; i >= 0 &&
                i >= breakingPoint - 10; i-- ) {
                if ( msg[ i ] == " " ) {
                    msg = msg.substr( 0, i ) + "\n" + msg.substr( i + 1 );
                    textSplit = true;
                    break;
                }
            }
        }

        if ( ! textSplit ) {
            msg = msg.substr(0,breakingPoint)+"\n"+msg.substr(breakingPoint);
        }

        return msg;
    }

    constructor( story:Story ) {
        super();

        this.story = story;
        this.on( "mouseover", this.animMouseOver );
        this.on( "mouseout", this.animMouseOut );

        // Show story coordinates as text when in debug mode
        if ( Hash.getDebugMode() ) {
            var message = "[" + story.x + "," + story.y + "]";
            var font = "10px Arial";
            var label:createjs.Text=new createjs.Text( message, font, "#AAA" );
            label.textAlign = "center";
            label.y = 38;
            this.addChild( label );
        }
    }
}
