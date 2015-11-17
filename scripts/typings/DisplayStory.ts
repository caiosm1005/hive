/// <reference path="definitions/createjs/createjs.d.ts" />
/// <reference path="Story.ts" />

abstract class DisplayStory extends createjs.Container {
    public story:Story;

    public abstract animMouseOver():void;
    public abstract animMouseOut():void;
    public abstract animAppear():void;
    public abstract animVanish():void;
}
