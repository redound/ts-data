export declare enum SortDirections {
    ASCENDING = 0,
    DESCENDING = 1,
}
export default class Sorter {
    field: string;
    direction: SortDirections;
    constructor(field: string, direction: SortDirections);
    getField(): string;
    getDirection(): SortDirections;
}
