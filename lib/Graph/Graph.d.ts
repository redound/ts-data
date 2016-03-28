import Reference from "./Reference";
export default class Graph {
    protected _data: any;
    constructor(data?: any);
    clear(): void;
    setData(data: any): void;
    getData(): any;
    get(path?: any[], callback?: any): any;
    setValue(): void;
    getValue(path?: any[]): any;
    getGraphForPath(path: any[]): Graph;
    getGraphForReferences(references: Reference[]): Graph;
    _getValueForPath(path: any): any;
    protected _optimizePath(path?: any[]): any[];
    set(path: any[], value: any): this;
    unset(path: any[]): this;
    hasItem(resourceName: string, resourceId: any): boolean;
    setItem(resourceName: string, resourceId: any, resource: any): void;
    getItem(resourceName: string, resourceId: any): any;
    setItems(resourceName: string, items: any): void;
    getItems(resourceName: string): any;
    countItems(resourceName: string): number;
    removeItems(resourceName: string): void;
    removeItem(resourceName: string, resourceId: number): void;
    getReferences(resourceName: string): Reference[];
    merge(graph: Graph): void;
    mergeData(data: any): void;
    protected _isReference(value: any): boolean;
    protected _extractReferences(data: any, callback: any): void;
    protected _resolveValueRecursive(parentKey: any, key: any, value: any, callback?: any): any;
    protected _isResourceName(resourceName: string): boolean;
}
