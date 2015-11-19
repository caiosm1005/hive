/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Story.ts" />

abstract class DisplayStory extends createjs.Container {
    public story:Story;

    public abstract animMouseOver():void;
    public abstract animMouseOut():void;
    public abstract animAppear():void;
    public abstract animVanish():void;

    constructor( story:Story ) {
        super();

        this.story = story;
        this.on( "mouseover", this.animMouseOver );
        this.on( "mouseout", this.animMouseOut );
    }
}
