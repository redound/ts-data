import { DataSourceResponseInterface } from "./DataSourceResponseInterface";
import { DataSourceInterface } from "./DataSourceInterface";
import { QueryExecutorInterface } from "../Query/QueryExecutorInterface";
import List from "ts-core/lib/Data/List";
import { ResourceInterface } from "../ResourceInterface";
import ResourceDelegate from "../ResourceDelegate";
import Model from "ts-core/lib/Data/Model";
import Resource from "../Resource";
import Query from "../Query/Query";
import ModelList from "ts-core/lib/Data/ModelList";
import Dictionary from "ts-core/lib/Data/Dictionary";
export interface DataSourceExecutionResultInterface {
    response: DataSourceResponseInterface;
    source: DataSourceInterface;
}
export interface DataServiceResponseInterface<T> {
    response: DataSourceResponseInterface;
    data: T;
}
export default class DataService implements QueryExecutorInterface {
    protected $q: ng.IQService;
    protected _sources: List<DataSourceInterface>;
    protected _resources: Dictionary<string, ResourceInterface>;
    protected _resourceDelegateCache: Dictionary<string, ResourceDelegate<Model>>;
    constructor($q: ng.IQService);
    source(source: DataSourceInterface): this;
    getSources(): List<DataSourceInterface>;
    setResources(resources: Dictionary<string, ResourceInterface>): this;
    resource(name: string, resource: ResourceInterface): this;
    getResources(): Dictionary<string, ResourceInterface>;
    getResource(name: string): ResourceInterface;
    getResourceAsync(name: string): ng.IPromise<Resource>;
    getResourceDelegate<T extends Model>(resourceName: string): ResourceDelegate<T>;
    query(resourceName: string): Query<ModelList<any>>;
    all(resourceName: string): ng.IPromise<ModelList<any>>;
    find(resourceName: string, resourceId: any, includes?: string[]): ng.IPromise<any>;
    execute(query: Query<ModelList<any>>): ng.IPromise<DataServiceResponseInterface<ModelList<any>>>;
    invalidate(resourceName?: string, resourceId?: any): ng.IPromise<void>;
    protected _createModels(response: DataSourceResponseInterface): ModelList<any>;
    create(resourceName: string, data: any): ng.IPromise<DataServiceResponseInterface<any>>;
    createModel(resourceName: string, model: any, data?: any): ng.IPromise<DataServiceResponseInterface<any>>;
    protected _executeCreate(resourceName: string, data: any): ng.IPromise<DataSourceResponseInterface>;
    update(resourceName: string, resourceId: any, data: any): ng.IPromise<DataServiceResponseInterface<Model>>;
    updateModel(resourceName: string, model: any, data?: any, onlyChanges?: boolean, includeRelations?: boolean): ng.IPromise<void>;
    protected _executeUpdate(resourceName: string, resourceId: any, data: any): ng.IPromise<DataSourceResponseInterface>;
    remove(resourceName: string, resourceId: any): ng.IPromise<void>;
    removeModel(resourceName: string, model: Model): ng.IPromise<void>;
    protected _executeRemove(resourceName: string, resourceId: any): ng.IPromise<DataSourceResponseInterface>;
    protected _callInSources(executor: (source: DataSourceInterface) => ng.IPromise<any>): ng.IPromise<any>;
    protected _notifySources(startIndex: number, executor: (source: DataSourceInterface) => ng.IPromise<any>): ng.IPromise<any>;
    protected _executeSources(executor: (source: DataSourceInterface) => ng.IPromise<any>): ng.IPromise<DataSourceExecutionResultInterface>;
    protected static _updateModel(model: any, data: any): any;
    protected static _removeModel(model: any): any;
}
