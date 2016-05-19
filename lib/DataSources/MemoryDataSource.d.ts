import Query from "../Query/Query";
import DynamicList from "ts-core/lib/Data/DynamicList";
import Reference from "../Graph/Reference";
import { DataSourceInterface } from "../DataService/DataSourceInterface";
import DataService from "../DataService/DataService";
import Graph from "../Graph/Graph";
import Dictionary from "ts-core/lib/Data/Dictionary";
import { DataSourceResponseInterface } from "../DataService/DataSourceResponseInterface";
import Collection from "ts-core/lib/Data/Collection";
export interface QueryResultInterface {
    query: Query<any>;
    references: DynamicList<Reference>;
    meta: {};
}
export declare enum ResourceFlag {
    DATA_COMPLETE = 0,
}
export default class MemoryDataSource implements DataSourceInterface {
    protected $q: ng.IQService;
    protected logger: any;
    static QUERY_SERIALIZE_FIELDS: string[];
    static IDENTIFIER: string;
    protected _dataService: DataService;
    protected _graph: Graph;
    protected _queryResultMap: Dictionary<string, Dictionary<string, QueryResultInterface>>;
    protected _resourceFlags: Dictionary<string, Collection<ResourceFlag>>;
    constructor($q: ng.IQService, logger?: any);
    getIdentifier(): string;
    setDataService(service: DataService): void;
    getDataService(): DataService;
    execute(query: Query<any>): ng.IPromise<DataSourceResponseInterface>;
    find(resourceName: string, resourceId: any): DataSourceResponseInterface;
    protected _executeInGraph(query: Query<any>): DataSourceResponseInterface;
    protected _validateInclude(items: any[], includeParts: string[]): boolean;
    create(resourceName: string, data: any): ng.IPromise<DataSourceResponseInterface>;
    update(resourceName: string, resourceId: any, data: any): ng.IPromise<DataSourceResponseInterface>;
    remove(resourceName: string, resourceId: any): ng.IPromise<DataSourceResponseInterface>;
    notifyExecute(query: Query<any>, response: DataSourceResponseInterface): ng.IPromise<void>;
    protected _resourceHasFlag(resourceName: string, flag: ResourceFlag): boolean;
    protected _setResourceFlag(resourceName: string, flag: ResourceFlag): void;
    protected _getResponseResources(response: DataSourceResponseInterface): Collection<string>;
    protected _clearCachesForIncomingResponse(response: DataSourceResponseInterface): void;
    notifyCreate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyUpdate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyRemove(response: DataSourceResponseInterface): ng.IPromise<void>;
    invalidate(resourceName?: string, resourceId?: any): ng.IPromise<void>;
    invalidateQuery(query: Query<any>): ng.IPromise<void>;
}
