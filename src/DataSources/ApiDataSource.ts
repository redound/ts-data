import {QueryExecutorInterface} from "../Query/QueryExecutorInterface";
import {DataSourceInterface} from "../DataSourceInterface";
import DataService from "../DataService";
import Query from "../Query/Query";
import ApiService from "../ApiService";
import {SerializerInterface} from "../SerializerInterface";
import Logger from "ts-core/lib/Logger/Logger";
import {DataSourceResponseInterface} from "../DataSourceResponseInterface";
import Exception from "ts-core/lib/Exceptions/Exception";

export default class ApiDataSource implements DataSourceInterface, QueryExecutorInterface {

    protected _dataService:DataService;

    public constructor(protected $q:ng.IQService,
                       protected apiService:ApiService,
                       protected serializer:SerializerInterface,
                       protected logger?:Logger) {
        this.logger = (this.logger || new Logger()).child('ApiDataSource');
    }

    public setDataService(service:DataService) {

        this._dataService = service;
    }

    public getDataService():DataService {

        return this._dataService;
    }

    public execute(query:Query<any>):ng.IPromise<DataSourceResponseInterface> {

        this.logger.info('execute', query);

        var resourceName = query.getFrom();

        return this.apiService
            .execute(query)
            .then(response => this._transformResponse(resourceName, response));
    }

    public create(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface> {

        this.logger.info('create');

        data = this._transformRequest(resourceName, data);

        return this.apiService
            .create(resourceName, data)
            .then(response => this._transformResponse(resourceName, response));
    }

    public update(resourceName:string, resourceId:any, data:any):ng.IPromise<DataSourceResponseInterface> {

        this.logger.info('update');

        data = this._transformRequest(resourceName, data);

        return this.apiService
            .update(resourceName, resourceId, data)
            .then(response => this._transformResponse(resourceName, response));
    }

    public remove(resourceName:string, resourceId:any):ng.IPromise<DataSourceResponseInterface> {

        this.logger.info('remove');

        return this.apiService
            .remove(resourceName, resourceId)
            .then(response => this._transformResponse(resourceName, response));
    }

    public notifyExecute(query:Query<any>, response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyExecute - query ', query, ' - response', response);

        return this.$q.when();
    }

    public notifyCreate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyCreate - response', response);

        return this.$q.when();
    }

    public notifyUpdate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyUpdate - response', response);

        return this.$q.when();
    }

    public notifyRemove(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyRemove - response', response);

        return this.$q.when();
    }

    public clear():ng.IPromise<any> {
        // Do nothing
        return this.$q.when();
    }

    protected _transformRequest(resourceName:string, data:any) {

        var resource = this.getDataService().getResource(resourceName);

        if (!resource) {
            throw new Exception('Resource `' + resourceName + '` could not be found!');
        }

        var transformer = resource.getTransformer();

        return transformer.transformRequest(data);
    }

    protected _transformResponse(resourceName:string, response:any) {

        return this.serializer.deserialize(resourceName, response);
    }
}
