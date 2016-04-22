import Query from "../Query/Query";
import DynamicList from "ts-core/lib/Data/DynamicList";
import Reference from "../Graph/Reference";
import {DataSourceInterface} from "../DataService/DataSourceInterface";
import DataService from "../DataService/DataService";
import Graph from "../Graph/Graph";
import Dictionary from "ts-core/lib/Data/Dictionary";
import Logger from "ts-core/lib/Logger/Logger";
import {DataSourceResponseInterface} from "../DataService/DataSourceResponseInterface";
import Collection from "ts-core/lib/Data/Collection";
import * as _ from "underscore";

export interface QueryResultInterface {
    query:Query<any>,
    references:DynamicList<Reference>,
    meta:{}
}

export enum ResourceFlag {
    DATA_COMPLETE
}

export default class MemoryDataSource implements DataSourceInterface {

    public static QUERY_SERIALIZE_FIELDS = ["from", "conditions", "sorters"];

    protected _dataService:DataService;
    protected _graph:Graph = new Graph();
    protected _queryResultMap:Dictionary<string, Dictionary<string, QueryResultInterface>> = new Dictionary<string, Dictionary<string, QueryResultInterface>>();
    protected _resourceFlags:Dictionary<string, Collection<ResourceFlag>> = new Dictionary<string, Collection<ResourceFlag>>();

    public constructor(protected $q:ng.IQService,
                       protected logger?) {
        this.logger = (this.logger || new Logger()).child('MemoryDataSource');
    }

    public setDataService(service:DataService) {
        this._dataService = service;
    }

    public getDataService():DataService {
        return this._dataService;
    }

    public execute(query:Query<any>):ng.IPromise<DataSourceResponseInterface> {

        this.logger.info('execute', this._queryResultMap);

        // Try straight from Graph
        if (query.hasFind()) {

            var resourceName = query.getFrom();
            var resourceId = query.getFind();

            if (this._graph.hasItem(resourceName, resourceId)) {

                var references = [new Reference(resourceName, resourceId)];

                var response = {
                    meta: {},
                    graph: this._graph.getGraphForReferences(references),
                    references: references
                };

                return this.$q.when(response);
            }
            else {
                return this.$q.reject();
            }
        }

        // Try from query cache
        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        var resultMap = this._queryResultMap.get(query.getFrom());
        var queryResult = resultMap ? resultMap.get(serializedQuery) : null;

        if (queryResult) {

            var referenceList = queryResult.references;
            var offset = query.getOffset();
            var limit = query.getLimit();

            if (referenceList.containsRange(offset, limit)) {

                var references = referenceList.getRange(offset, limit);

                var response = {
                    meta: queryResult.meta,
                    graph: this._graph.getGraphForReferences(references),
                    references: _.clone(references)
                };

                return this.$q.when(response);
            }
        }

        // Resolve from Graph when data is complete
        if (this._resourceHasFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE)) {

            return this._executeInGraph(query);
        }

        // TODO Check includes

        return this.$q.reject();
    }

    protected _executeInGraph(query:Query<any>):ng.IPromise<DataSourceResponseInterface> {

        // TODO
        return this.$q.reject();
    }

    public create(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface> {

        return this.$q.reject();
    }

    public update(resourceName:string, resourceId:any, data:any):ng.IPromise<DataSourceResponseInterface> {

        return this.$q.reject();
    }

    public remove(resourceName:string, resourceId:any):ng.IPromise<DataSourceResponseInterface> {

        return this.$q.reject();
    }

    public notifyExecute(query:Query<any>, response:DataSourceResponseInterface):ng.IPromise<void> {

        this._graph.merge(response.graph);

        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        var references = _.clone(response.references);
        var offset = query.getOffset() || 0;

        if ((response.meta.total && this._graph.countItems(query.getFrom()) === response.meta.total)
            || (!query.hasOffset() && !query.hasLimit() && !query.hasFind() && !query.hasConditions())) {

            this._setResourceFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE);
        }

        if(!query.hasFind()) {

            var resultMap = this._queryResultMap.get(query.getFrom()) || new Dictionary<string, QueryResultInterface>();
            var queryResult = resultMap.get(serializedQuery);

            if (!queryResult) {

                queryResult = {
                    meta: response.meta,
                    query: _.clone(query),
                    references: new DynamicList<Reference>()
                };
            }

            queryResult.references.setRange(offset, references);

            resultMap.set(serializedQuery, queryResult);
            this._queryResultMap.set(query.getFrom(), resultMap);
        }

        return this.$q.when();
    }

    protected _resourceHasFlag(resourceName:string, flag:ResourceFlag):boolean {

        var flags = this._resourceFlags.get(resourceName);

        if (!flags) {
            return false;
        }

        return flags.contains(flag);
    }

    protected _setResourceFlag(resourceName:string, flag:ResourceFlag) {

        console.log('resourceName', resourceName, 'flag', flag);

        var flags = this._resourceFlags.get(resourceName);

        if (!flags) {
            flags = new Collection<ResourceFlag>();
            this._resourceFlags.set(resourceName, flags);
        }

        flags.add(flag);
    }

    public notifyCreate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyCreate - response', response);

        this._graph.merge(response.graph);

        // TODO: Invalidate query caches when not complete

        return this.$q.when();
    }

    public notifyUpdate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyUpdate - response', response);

        this._graph.merge(response.graph);

        // TODO: Invalidate query caches when not complete

        return this.$q.when();
    }

    public notifyRemove(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyRemove - response', response);

        // TODO

        return this.$q.when();
    }

    public clear():ng.IPromise<any> {
        // TODO
        return null;
    }
}
