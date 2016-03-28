import Query from "../Query/Query";
import DynamicList from "ts-core/lib/Data/DynamicList";
import Reference from "../Graph/Reference";
import {DataSourceInterface} from "../DataSourceInterface";
import DataService from "../DataService";
import Graph from "../Graph/Graph";
import Dictionary from "ts-core/lib/Data/Dictionary";
import Logger from "ts-core/lib/Logger/Logger";
import {DataSourceResponseInterface} from "../DataSourceResponseInterface";
import Collection from "ts-core/lib/Data/Collection";

export interface QueryResultInterface {
    query:Query<any>,
    references:DynamicList<Reference>,
    meta:{}
}

export enum ResourceFlag {
    DATA_COMPLETE
}

export class MemoryDataSource implements DataSourceInterface {

    public static QUERY_SERIALIZE_FIELDS = ["from", "conditions", "sorters"];

    protected _dataService:DataService;
    protected _graph:Graph = new Graph();
    protected _queryResultMap:Dictionary<string, QueryResultInterface> = new Dictionary<string, QueryResultInterface>();
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
        this.logger.info('execute');

        // TODO Needs to be implemented, for now reject
        return this.$q.reject();
        //
        // if (query.hasFind()) {
        //
        //     var resourceName = query.getFrom();
        //     var resourceId = query.getFind();
        //
        //     if (this._graph.hasItem(resourceName, resourceId)) {
        //
        //         var references = [new Reference(resourceName, resourceId)];
        //
        //         var response = {
        //             meta: {},
        //             graph: this._graph.getGraphForReferences(references),
        //             references: references
        //         };
        //
        //         this.logger.info('resolve', response);
        //
        //         return this.$q.when(response);
        //
        //     } else {
        //         return this.$q.reject();
        //     }
        // }
        //
        // var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        //
        // var queryResult = this._queryResultMap.get(serializedQuery);
        //
        // if (queryResult) {
        //
        //     // TODO: Implement
        //     //if (this._resourceHasFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE)) {
        //     //
        //     //}
        //
        //     var referenceList = queryResult.references;
        //     var offset = query.getOffset();
        //     var limit = query.getLimit();
        //
        //     if (!referenceList.containsRange(offset, limit)) {
        //
        //         return this.$q.reject();
        //     }
        //
        //     var references = referenceList.getRange(offset, limit);
        //
        //     this.logger.info('resolve cached results');
        //
        //     var response = {
        //         meta: queryResult.meta,
        //         graph: this._graph.getGraphForReferences(references),
        //         references: _.clone(references)
        //     };
        //
        //     this.logger.info('resolve', response);
        //
        //     return this.$q.when(response);
        // }
    }

    public create(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface> {
        this.logger.info('create');

        // TODO
        return this.$q.reject();
    }

    public update(resourceName:string, resourceId:any, data:any):ng.IPromise<DataSourceResponseInterface> {
        this.logger.info('update');

        // TODO
        return this.$q.reject();
    }

    public remove(resourceName:string, resourceId:any):ng.IPromise<DataSourceResponseInterface> {
        this.logger.info('remove');

        // TODO
        return this.$q.reject();
    }

    public notifyExecute(query:Query<any>, response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyExecute - query ', query, ' - response', response);

        this._graph.merge(response.graph);

        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);

        var references = _.clone(response.references);

        var offset = query.getOffset() || 0;

        if ((response.meta.total && this._graph.countItems(query.getFrom()) === response.meta.total) || (!query.hasOffset() && !query.hasLimit())) {

            //this._setResourceFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE);
        }

        var queryResult = this._queryResultMap.get(serializedQuery);

        if (!queryResult) {

            queryResult = {
                meta: response.meta,
                query: _.clone(query),
                references: new DynamicList<Reference>()
            };
        }

        queryResult.references.setRange(offset, references);

        this._queryResultMap.set(serializedQuery, queryResult);

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
        // TODO
        return null;
    }
}
