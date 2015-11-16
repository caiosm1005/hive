class Story {
    public x:number;
    public y:number;
    public message:string;
    public languageId:number;
    public neighbours:Story[];

    constructor() {
        this.x = 0;
        this.y = 0;
        this.message = "";
        this.languageId = 0;
        this.neighbours = [ null, null, null, null, null, null ];
    }
}
