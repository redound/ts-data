import Query from "../Query/Query";
import DynamicList from "ts-core/lib/Data/DynamicList";
import Reference from "../Graph/Reference";
import { DataSourceInterface } from "../DataSourceInterface";
import DataService from "../DataService";
import Graph from "../Graph/Graph";
import Dictionary from "ts-core/lib/Data/Dictionary";
import { DataSourceResponseInterface } from "../DataSourceResponseInterface";
import Collection from "ts-core/lib/Data/Collection";
export interface QueryResultInterface {
    query: Query<any>;
    references: DynamicList<Reference>;
    meta: {};
}
export declare enum ResourceFlag {
    DATA_COMPLETE = 0,
}
export declare class MemoryDataSource implements DataSourceInterface {
    protected $q: ng.IQService;
    protected logger: any;
    static QUERY_SERIALIZE_FIELDS: string[];
    protected _dataService: DataService;
    protected _graph: Graph;
    protected _queryResultMap: Dictionary<string, QueryResultInterface>;
    protected _resourceFlags: Dictionary<string, Collection<ResourceFlag>>;
    constructor($q: ng.IQService, logger?: any);
    setDataService(service: DataService): void;
    getDataService(): DataService;
    execute(query: Query<any>): ng.IPromise<DataSourceResponseInterface>;
    create(resourceName: string, data: any): ng.IPromise<DataSourceResponseInterface>;
    update(resourceName: string, resourceId: any, data: any): ng.IPromise<DataSourceResponseInterface>;
    remove(resourceName: string, resourceId: any): ng.IPromise<DataSourceResponseInterface>;
    notifyExecute(query: Query<any>, response: DataSourceResponseInterface): ng.IPromise<void>;
    protected _resourceHasFlag(resourceName: string, flag: ResourceFlag): boolean;
    protected _setResourceFlag(resourceName: string, flag: ResourceFlag): void;
    notifyCreate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyUpdate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyRemove(response: DataSourceResponseInterface): ng.IPromise<void>;
    clear(): ng.IPromise<any>;
}
