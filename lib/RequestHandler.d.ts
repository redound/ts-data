import { QueryExecutorInterface } from "./Query/QueryExecutorInterface";
import ApiService from "./ApiService";
import { RequestHandlerPluginInterface } from "./RequestHandlerPluginInterface";
import List from "ts-core/lib/Data/List";
import { default as HttpService } from "./Http/Service";
import RequestOptions from "./Http/RequestOptions";
import Query from "./Query/Query";
import { ApiResourceInterface } from "./ApiResourceInterface";
export declare enum RequestHandlerFeatures {
    OFFSET = 0,
    LIMIT = 1,
    FIELDS = 2,
    CONDITIONS = 3,
    SORTERS = 4,
    INCLUDES = 5,
}
export declare class RequestHandler implements QueryExecutorInterface {
    protected $q: ng.IQService;
    protected httpService: HttpService;
    _apiService: ApiService;
    _resourceName: string;
    _resource: ApiResourceInterface;
    _plugins: List<RequestHandlerPluginInterface>;
    constructor($q: ng.IQService, httpService: HttpService);
    setApiService(apiService: ApiService): void;
    getApiService(): ApiService;
    setResourceName(name: string): void;
    getResourceName(): string;
    setResource(resource: ApiResourceInterface): void;
    getResource(): ApiResourceInterface;
    plugin(plugin: RequestHandlerPluginInterface): RequestHandler;
    request(requestOptions: RequestOptions): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
    execute(query: Query<any>): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
    protected _getUsedFeatures(query: Query<any>): RequestHandlerFeatures[];
    all(): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
    find(id: number): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
    create(data: {}): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
    update(id: number, data: {}): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
    remove(id: number): ng.IPromise<ng.IHttpPromiseCallbackArg<{}>>;
}
