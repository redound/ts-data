import {QueryExecutorInterface} from "../Query/QueryExecutorInterface";
import ApiService from "./ApiService";
import {RequestHandlerPluginInterface} from "./RequestHandlerPluginInterface";
import List from "ts-core/lib/Data/List";
import {default as HttpService} from "../Http/HttpService";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import {ApiResourceInterface} from "./ApiResourceInterface";
import * as _ from "underscore";

export enum RequestHandlerFeatures {
    OFFSET,
    LIMIT,
    FIELDS,
    CONDITIONS,
    SORTERS,
    INCLUDES
}

export default class RequestHandler implements QueryExecutorInterface {

    public _apiService:ApiService;
    public _resourceName:string;
    public _resource:ApiResourceInterface;
    public _plugins:List<RequestHandlerPluginInterface> = new List<RequestHandlerPluginInterface>();

    public constructor(protected $q:ng.IQService,
                       protected httpService:HttpService) {
    }

    public setApiService(apiService:ApiService) {
        this._apiService = apiService;
    }

    public getApiService():ApiService {
        return this._apiService;
    }

    public setResourceName(name:string) {
        this._resourceName = name;
    }

    public getResourceName():string {
        return this._resourceName;
    }

    public setResource(resource:ApiResourceInterface) {
        this._resource = resource;
    }

    public getResource():ApiResourceInterface {
        return this._resource;
    }

    public plugin(plugin:RequestHandlerPluginInterface):RequestHandler {
        this._plugins.add(plugin);
        return this;
    }

    public request(requestOptions:RequestOptions):ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        var prefix = this.getResource().getPrefix();
        var relativeUrl = requestOptions.getUrl();

        requestOptions.url(prefix + relativeUrl);

        return this.httpService.request(requestOptions);
    }

    public execute(query:Query<any>):ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        var requestOptions = RequestOptions.get('/');

        if (query.hasFind()) {

            var id = query.getFind();

            requestOptions = RequestOptions.get('/:id', {id: id});
        }

        var allowedFeatures = [];

        this._plugins.each(plugin => {

            allowedFeatures.push(
                plugin.execute(requestOptions, query)
            );
        });

        allowedFeatures = _.flatten(allowedFeatures);

        var usedFeatures = this._getUsedFeatures(query);

        var forbiddenFeatures = _.difference(usedFeatures, allowedFeatures);

        if (forbiddenFeatures.length > 0) {
            return this.$q.reject();
        }

        return this.request(requestOptions);
    }

    protected _getUsedFeatures(query:Query<any>):RequestHandlerFeatures[] {

        var features = [];

        if (query.hasOffset()) {
            features.push(RequestHandlerFeatures.OFFSET);
        }

        if (query.hasLimit()) {
            features.push(RequestHandlerFeatures.LIMIT);
        }

        if (query.hasFields()) {
            features.push(RequestHandlerFeatures.FIELDS);
        }

        if (query.hasConditions()) {
            features.push(RequestHandlerFeatures.CONDITIONS);
        }

        if (query.hasSorters()) {
            features.push(RequestHandlerFeatures.SORTERS);
        }

        if (query.hasIncludes()) {
            features.push(RequestHandlerFeatures.INCLUDES);
        }

        return features;
    }

    public all():ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        return this.request(
            RequestOptions
                .get('/')
        );
    }

    public find(id:number):ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        return this.request(
            RequestOptions
                .get('/:id', {id: id})
        );
    }

    public create(data:{}):ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        return this.request(
            RequestOptions
                .post('/')
                .data(data)
        );
    }

    public update(id:number, data:{}):ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        return this.request(
            RequestOptions
                .put('/:id', {id: id})
                .data(data)
        );
    }

    public remove(id:number):ng.IPromise<ng.IHttpPromiseCallbackArg<{}>> {

        return this.request(
            RequestOptions
                .delete('/:id', {id: id})
        );
    }
}
