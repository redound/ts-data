import Dictionary from "ts-core/lib/Data/Dictionary";
import { QueryExecutorInterface } from "./Query/QueryExecutorInterface";
import { ApiResourceInterface } from "./ApiResourceInterface";
import RequestHandler from "./RequestHandler";
import Query from "./Query/Query";
export default class ApiService implements QueryExecutorInterface {
    protected $q: any;
    constructor($q: any);
    protected _resources: Dictionary<string, ApiResourceInterface>;
    setResources(resources: Dictionary<string, ApiResourceInterface>): this;
    resource(name: string, resource: ApiResourceInterface): this;
    getResource(name: string): ApiResourceInterface;
    getResourceAsync(name: string): ng.IPromise<ApiResourceInterface>;
    getRequestHandler(resourceName: string): RequestHandler;
    getRequestHandlerAsync(resourceName: string): ng.IPromise<RequestHandler>;
    execute(query: Query<any>): ng.IPromise<any>;
    all(resourceName: string): ng.IPromise<any>;
    find(resourceName: string, resourceId: number): ng.IPromise<any>;
    create(resourceName: string, data: any): ng.IPromise<any>;
    update(resourceName: string, resourceId: any, data: any): ng.IPromise<any>;
    remove(resourceName: string, resourceId: any): ng.IPromise<any>;
}
