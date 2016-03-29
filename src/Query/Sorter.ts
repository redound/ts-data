export enum SortDirections {
    ASCENDING,
    DESCENDING
}

export default class Sorter {

    public field:string;
    public direction:SortDirections;

    public constructor(field:string, direction:SortDirections) {

        this.field = field;
        this.direction = direction;
    }

    public getField():string {

        return this.field;
    }

    public getDirection():SortDirections {

        return this.direction;
    }
}
