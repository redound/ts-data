import {DataSourceResponseInterface} from "./DataSourceResponseInterface";
import {DataSourceInterface} from "./DataSourceInterface";
import {QueryExecutorInterface} from "../Query/QueryExecutorInterface";
import List from "ts-core/lib/Data/List";
import {ResourceInterface} from "../ResourceInterface";
import Dictionary from "ts-core/lib/Data/Dictionary";
import ResourceDelegate from "../ResourceDelegate";
import Model from "ts-core/lib/Data/Model";
import Resource from "../Resource";
import Exception from "ts-core/lib/Exceptions/Exception";
import Query from "../Query/Query";
import ModelList from "ts-core/lib/Data/ModelList";
import ActiveModel from "../Model/ActiveModel";
import * as _ from "underscore";

export interface DataSourceExecutionResultInterface {
    response:DataSourceResponseInterface,
    source:DataSourceInterface
}

export interface DataServiceResponseInterface<T> {
    response:DataSourceResponseInterface,
    data:T
}

export default class DataService implements QueryExecutorInterface {
    protected _sources:List<DataSourceInterface> = new List<DataSourceInterface>();
    protected _resources:Dictionary<string, ResourceInterface> = new Dictionary<string, ResourceInterface>();

    protected _resourceDelegateCache:Dictionary<string, ResourceDelegate<Model>> = new Dictionary<string, ResourceDelegate<Model>>();

    public constructor(protected $q:ng.IQService) {

    }

    /** Data Sources **/

    public source(source:DataSourceInterface) {

        this._sources.add(source);
        source.setDataService(this);

        return this;
    }

    public getSources():List<DataSourceInterface> {
        return this._sources.clone();
    }

    /** Resources **/

    public setResources(resources:Dictionary<string, ResourceInterface>):this {

        this._resources = resources.clone();
        return this;
    }

    public resource(name:string, resource:ResourceInterface) {

        this._resources.set(name, resource);
        return this;
    }

    public getResources():Dictionary<string, ResourceInterface> {
        return this._resources.clone();
    }

    public getResource(name:string):ResourceInterface {
        return this._resources.get(name);
    }

    public getResourceAsync(name:string):ng.IPromise<Resource> {

        var deferred = this.$q.defer();
        var resource = this._resources.get(name);

        if (!resource) {
            throw new Exception('Resource `' + name + '` cannot be found');
        }

        deferred.resolve(resource);

        return deferred.promise;
    }

    public getResourceDelegate<T extends Model>(resourceName:string):ResourceDelegate<T> {

        if (this._resourceDelegateCache.contains(resourceName)) {
            return this._resourceDelegateCache.get(resourceName)
        }

        var delegate = new ResourceDelegate<T>(this, resourceName);
        this._resourceDelegateCache.set(resourceName, delegate);

        return delegate;
    }

    /** Query **/

    public query(resourceName:string):Query<ModelList<any>> {

        return new Query<ModelList<any>>(this).from(resourceName);
    }

    public all(resourceName:string):ng.IPromise<DataServiceResponseInterface<ModelList<any>>> {

        return this.execute(this.query(resourceName));
    }

    public find(resourceName:string, resourceId:any):ng.IPromise<DataServiceResponseInterface<any>> {

        return this.execute(
            this.query(resourceName)
                .find(resourceId)
        ).then(response => {

            return {
                response: response.response,
                data: response.data.first()
            }
        });
    }

    public execute(query:Query<ModelList<any>>):ng.IPromise<DataServiceResponseInterface<ModelList<any>>> {

        var response;

        return this._executeSources((source:DataSourceInterface) => {
                return source.execute(query);
            })
            .then(result => {

                response = result.response;

                var sourceIndex = this._sources.indexOf(result.source);

                if (sourceIndex === 0) {
                    return this.$q.when();
                }

                return this._notifySources(sourceIndex - 1, source => {
                    return source.notifyExecute(query, response);
                });
            })
            .then(() => {

                return {
                    response: response,
                    data: this._createModels(response)
                };
            });
    }

    protected _createModels(response:DataSourceResponseInterface):ModelList<any> {

        var graph = response.graph;
        var references = response.references;

        var models = new ModelList();

        _.each(references, reference => {

            var resolveModel = graph.get(reference.value, (resourceName:string, item:any) => {

                var resource = this.getResource(resourceName);
                var modelClass = resource.getModel();

                var model = new modelClass(item);

                if (model instanceof ActiveModel) {

                    model.activate(this, resourceName);
                    model.setSavedData(graph);
                }

                return model;
            });

            if (resolveModel) {

                models.add(resolveModel);
            }
        });

        return models;
    }

    /** Create **/

    public create(resourceName:string, data:any):ng.IPromise<DataServiceResponseInterface<any>> {

        return this._executeCreate(resourceName, data).then(response => {

            return {
                response: response,
                data: this._createModels(response)[0] || null
            };
        });
    }

    public createModel(resourceName:string, model:any, data?:any):ng.IPromise<DataServiceResponseInterface<any>> {

        if (data) {
            model.assignAll(data);
        }

        return this._executeCreate(resourceName, model.toObject(true)).then(response => {

            model = DataService._updateModel(model, response.references);

            if (model instanceof ActiveModel) {
                model.activate(this, resourceName);
            }

            return {
                response: response,
                data: model
            };
        });
    }

    protected _executeCreate(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface> {

        var response;

        return this
            ._executeSources((source:DataSourceInterface) => {
                return source.create(resourceName, data);
            })
            .then(result => {

                response = result.response;

                var sourceIndex = this._sources.indexOf(result.source);

                if (sourceIndex === 0) {
                    return this.$q.when();
                }

                return this._notifySources(sourceIndex - 1, source => {
                    return source.notifyCreate(response);
                });
            })
            .then(() => {

                return response;
            });
    }

    /** Update **/

    public update(resourceName:string, resourceId:any, data:any):ng.IPromise<DataServiceResponseInterface<Model>> {

        return this._executeUpdate(resourceName, resourceId, data).then(response => {

            return {
                response: response,
                data: this._createModels(response)[0] || null
            };
        });
    }

    public updateModel(resourceName:string, model:any, data?:any):ng.IPromise<void> {

        return this._executeUpdate(resourceName, model.getId(), data || model.toObject(true)).then(results => {

            DataService._updateModel(model, results);
            return null;
        });
    }

    protected _executeUpdate(resourceName:string, resourceId:any, data:any):ng.IPromise<DataSourceResponseInterface> {

        var response;

        return this
            ._executeSources((source:DataSourceInterface) => {
                return source.update(resourceName, resourceId, data);
            })
            .then(result => {

                response = result.response;

                var sourceIndex = this._sources.indexOf(result.source);

                if (sourceIndex === 0) {
                    return this.$q.when();
                }

                return this._notifySources(sourceIndex - 1, source => {
                    return source.notifyUpdate(response);
                });
            })
            .then(() => {
                return response;
            });
    }

    /** Remove **/

    public remove(resourceName:string, resourceId:any):ng.IPromise<void> {

        return this._executeRemove(resourceName, resourceId).then(() => {
            return null;
        });
    }

    public removeModel(resourceName:string, model:Model):ng.IPromise<void> {

        return this._executeRemove(resourceName, model.getId()).then(() => {

            DataService._removeModel(model);
            return null;
        });
    }

    protected _executeRemove(resourceName:string, resourceId:any):ng.IPromise<DataSourceResponseInterface> {

        var response;

        return this
            ._executeSources((source:DataSourceInterface) => {
                return source.remove(resourceName, resourceId);
            })
            .then(result => {

                response = result.response;

                var sourceIndex = this._sources.indexOf(result.source);

                if (sourceIndex === 0) {
                    return this.$q.when();
                }

                return this._notifySources(sourceIndex - 1, source => {
                    return source.notifyRemove(response);
                });
            })
            .then(() => {
                return response;
            });
    }

    /** Source **/

    protected _notifySources(startIndex:number, executor:(source:DataSourceInterface) => ng.IPromise<any>):ng.IPromise<any> {

        var promises = [];

        for (var sourceIndex = startIndex; sourceIndex >= 0; sourceIndex--) {

            var source = this._sources.get(sourceIndex);
            promises.push(executor(source));
        }

        return this.$q.all(promises);
    }

    protected _executeSources(executor:(source:DataSourceInterface) => ng.IPromise<any>):ng.IPromise<DataSourceExecutionResultInterface> {

        var sourceIndex = 0;
        var deferred:ng.IDeferred<any> = this.$q.defer();

        var nextSource = () => {

            if (sourceIndex >= this._sources.count()) {
                deferred.reject('No dataSources left');
                return;
            }

            var source:DataSourceInterface = this._sources.get(sourceIndex);

            executor(source)
                .then(response => deferred.resolve({
                    response: response,
                    source: source
                }))
                .catch(() => nextSource());

            sourceIndex++;
        };

        nextSource();

        return deferred.promise;
    }

    /** Model Helpers **/

    protected static _updateModel(model, data):any {

        model.assignAll(data);

        if (model instanceof ActiveModel) {
            model.setSavedData(data);
        }

        return model;
    }

    protected static _removeModel(model):any {

        if (model instanceof ActiveModel) {

            model.setSavedData(null);
            model.markRemoved();
            model.deactivate();
        }

        return model;
    }
}
