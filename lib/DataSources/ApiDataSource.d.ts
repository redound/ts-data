import { QueryExecutorInterface } from "../Query/QueryExecutorInterface";
import { DataSourceInterface } from "../DataSourceInterface";
import DataService from "../DataService";
import Query from "../Query/Query";
import ApiService from "../ApiService";
import { SerializerInterface } from "../SerializerInterface";
import Logger from "ts-core/lib/Logger/Logger";
import { DataSourceResponseInterface } from "../DataSourceResponseInterface";
export default class ApiDataSource implements DataSourceInterface, QueryExecutorInterface {
    protected $q: ng.IQService;
    protected apiService: ApiService;
    protected serializer: SerializerInterface;
    protected logger: Logger;
    protected _dataService: DataService;
    constructor($q: ng.IQService, apiService: ApiService, serializer: SerializerInterface, logger?: Logger);
    setDataService(service: DataService): void;
    getDataService(): DataService;
    execute(query: Query<any>): ng.IPromise<DataSourceResponseInterface>;
    create(resourceName: string, data: any): ng.IPromise<DataSourceResponseInterface>;
    update(resourceName: string, resourceId: any, data: any): ng.IPromise<DataSourceResponseInterface>;
    remove(resourceName: string, resourceId: any): ng.IPromise<DataSourceResponseInterface>;
    notifyExecute(query: Query<any>, response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyCreate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyUpdate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyRemove(response: DataSourceResponseInterface): ng.IPromise<void>;
    clear(): ng.IPromise<any>;
    protected _transformRequest(resourceName: string, data: any): any;
    protected _transformResponse(resourceName: string, response: any): DataSourceResponseInterface;
}
