import Query from "../Query/Query";
import DynamicList from "ts-core/lib/Data/DynamicList";
import Reference from "../Graph/Reference";
import {DataSourceInterface} from "../DataService/DataSourceInterface";
import DataService from "../DataService/DataService";
import Graph from "../Graph/Graph";
import Dictionary from "ts-core/lib/Data/Dictionary";
import Logger from "ts-core/lib/Logger/Logger";
import {DataSourceResponseInterface} from "../DataService/DataSourceResponseInterface";
import * as _ from "underscore";
import Collection from "ts-core/lib/Data/Collection";
import {lang} from "moment";

export interface QueryResultInterface {
    query:Query<any>,
    references:DynamicList<Reference>,
    meta:{}
}

export enum ResourceFlag {
    DATA_COMPLETE
}

export default class MemoryDataSource implements DataSourceInterface {

    public static PERSISTENCE_KEY = "MemoryDataSourceData";

    public static QUERY_SERIALIZE_FIELDS = ["from", "conditions", "sorters"];
    public static IDENTIFIER = "memory";

    protected _dataService:DataService;
    protected _graph:Graph = new Graph();
    protected _queryResultMap:Dictionary<string, Dictionary<string, QueryResultInterface>> = new Dictionary<string, Dictionary<string, QueryResultInterface>>();
    protected _resourceFlags:Dictionary<string, Collection<ResourceFlag>> = new Dictionary<string, Collection<ResourceFlag>>();

    public constructor(protected $q:ng.IQService,
                       protected logger?,
                        protected persist = false) {

        this.logger = (this.logger || new Logger()).child('MemoryDataSource');

        if(this.persist){
            this.loadFromPersistence();
        }
    }

    public getIdentifier():string {
        return MemoryDataSource.IDENTIFIER;
    }

    public setDataService(service:DataService) {
        this._dataService = service;
    }

    public getDataService():DataService {
        return this._dataService;
    }

    public saveToPersistence(){

        this.logger.log('Saving tot persistence');

        const queryResultMap = _.mapObject(this._queryResultMap.data, item => _.mapObject(item, (val, key) => {

            if(key == 'value'){

                return _.mapObject(val.data, valueItem => _.mapObject(valueItem, (val2, key2) => {

                    if(key2 == 'value'){

                        return _.mapObject(val2, (val3, key3) => {

                            if(key3 == 'query'){
                                return val3.toObject();
                            }
                            else if(key3 == 'references'){
                                return val3.data;
                            }

                            return val3;
                        });
                    }

                    return val2;
                }));
            }

            return val;
        }));

        const resourceFlags = _.mapObject(this._resourceFlags.data, item => _.mapObject(item, (val, key) => {

            if(key == 'value'){
                return val.data;
            }

            return val;
        }));

        const payload = {
            data: this._graph.getData(),
            queryResultMap: queryResultMap,
            resourceFlags: resourceFlags
        };

        console.log('PAYLOAD', payload);

        window.localStorage.setItem(MemoryDataSource.PERSISTENCE_KEY, JSON.stringify(payload));
    }

    public loadFromPersistence(){

        const payloadJSON = window.localStorage.getItem(MemoryDataSource.PERSISTENCE_KEY);
        const payload = payloadJSON ? JSON.parse(payloadJSON) : null;

        if(!payload){
            return;
        }

        this.logger.log('Loading from persistence', payload);

        this._graph.setData(payload.data);

        this._queryResultMap = new Dictionary(_.mapObject(payload.queryResultMap, item => _.mapObject(item, (val, key) => {

            if(key == 'value'){

                return new Dictionary(_.mapObject(val, valueItem => _.mapObject(valueItem, (val2, key2) => {

                    if(key2 == 'value'){

                        return _.mapObject(val2, (val3, key3) => {

                            if(key3 == 'query'){
                                return Query.fromObject(val3);
                            }
                            else if(key3 == 'references'){
                                return new DynamicList(val3);
                            }

                            return val3;
                        });
                    }

                    return val2;
                })));
            }

            return val;
        })));

        this._resourceFlags = _.mapObject(this._resourceFlags.data, item => _.mapObject(item, (val, key) => {

            if(key == 'value'){
                return val.data;
            }

            return val;
        }));
    }

    public execute(query:Query<any>):ng.IPromise<DataSourceResponseInterface> {

        this.logger.log('Executing query', query);

        var response:DataSourceResponseInterface = null;

        if (query.hasFind()) {

            response = this.find(query.getFrom(), query.getFind());
            if(response){
                this.logger.log('Found item ' + query.getFind());
            }
        }
        else {

            // Try from query cache
            var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
            var resultMap = this._queryResultMap.get(query.getFrom());
            var queryResult = resultMap ? resultMap.get(serializedQuery) : null;

            this.logger.info('Trying query cache with key', serializedQuery);

            if (queryResult) {

                var referenceList = queryResult.references;
                var offset = query.getOffset();
                var limit = query.getLimit();

                if (limit != null && referenceList.containsRange(offset, limit)) {

                    var references = referenceList.getRange(offset, limit);

                    response = {
                        meta: queryResult.meta,
                        graph: this._graph.getGraphForReferences(references),
                        references: _.clone(references)
                    };

                    this.logger.log('Found in query cache (' + references.length + ' records)');
                }
            }

            // Resolve from Graph when data is complete
            if (!response && this._resourceHasFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE)) {

                this.logger.info('Got all data in memory, trying executing in local graph');

                response = this._executeInGraph(query);
                if(response){
                    this.logger.log('Executed query in graph');
                }
            }
        }

        if(response){

            // Validate includes
            var includeParts = _.map(query.getIncludes(), (include) => {
                return include.split('.');
            });

            var resourceData = [];

            _.each(response.references, (ref: Reference) => {
                resourceData.push(response.graph.get(ref.value));
            });

            var includesValid = true;

            _.each(includeParts, (include) => {

                if(!includesValid){
                    return;
                }

                if(!this._validateInclude(resourceData, include)){

                    includesValid = false;
                }
            });

            if(includesValid){

                this.logger.log('Response valid', response);
                return this.$q.when(response);
            }
            else {
                this.logger.log('Found data invalid, includes are not present');
            }
        }
        else {

            this.logger.log('No data found');
        }

        return this.$q.reject();
    }

    public find(resourceName: string, resourceId: any): DataSourceResponseInterface {

        if (!this._graph.hasItem(resourceName, resourceId)) {
            return null;
        }

        var references = [new Reference(resourceName, resourceId)];

        return {
            meta: {},
            graph: this._graph.getGraphForReferences(references),
            references: references
        };
    }

    protected _executeInGraph(query:Query<any>): DataSourceResponseInterface {

        // TODO
        return null;
    }

    protected _validateInclude(items: any[], includeParts: string[]): boolean {

        var valid = true;

        _.each(items, (item) => {

            if(!valid){
                return;
            }

            var part = includeParts[0];
            var nextParts = includeParts.length > 1 ? includeParts.slice(1) : [];

            var val = item[part];
            if(val == null || val == undefined || (!_.isObject(val) && !_.isArray(val))){

                this.logger.log('Missing include', part);
                valid = false;
            }
            else {

                if(nextParts.length > 0){

                    var nextItems = _.isArray(val) ? val : [val];

                    if(!this._validateInclude(nextItems, nextParts)){
                        valid = false;
                    }
                }
            }
        });

        return valid;
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

        if(this.persist) {
            this.saveToPersistence();
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

        if(this.persist) {
            this.saveToPersistence();
        }
    }

    protected _getResponseResources(response:DataSourceResponseInterface):Collection<string> {

        var resources = new Collection<string>();

        _.each(response.references, (reference) => {
            resources.add(reference.$type);
        });

        return resources;
    }

    protected _clearCachesForIncomingResponse(response:DataSourceResponseInterface) {

        this._getResponseResources(response).each((resourceName) => {

            if (!this._resourceHasFlag(resourceName, ResourceFlag.DATA_COMPLETE)) {

                // Clear query result map
                this._queryResultMap.remove(resourceName);
            }
        });

        if(this.persist) {
            this.saveToPersistence();
        }
    }

    public notifyCreate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyCreate - response', response);

        this._graph.merge(response.graph);
        this._clearCachesForIncomingResponse(response);

        if(this.persist) {
            this.saveToPersistence();
        }

        return this.$q.when();
    }

    public notifyUpdate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyUpdate - response', response);

        this._graph.merge(response.graph);
        this._clearCachesForIncomingResponse(response);

        if(this.persist) {
            this.saveToPersistence();
        }

        return this.$q.when();
    }

    public notifyRemove(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyRemove - response', response);

        _.each(response.references, (reference) => {

            this._graph.unset(reference.value);
        });

        this._clearCachesForIncomingResponse(response);

        if(this.persist) {
            this.saveToPersistence();
        }

        return this.$q.when();
    }

    public invalidate(resourceName?: string, resourceId?: any):ng.IPromise<void> {

        if(resourceName) {

            if (resourceId) {

                // Clear one item
                this._graph.removeItem(resourceName, resourceId);
                // this.logger.info('Cleared item', resourceName, resourceId);
            }
            else {

                // Clear all from resource
                this._graph.removeItems(resourceName);
                // this.logger.info('Cleared resource', resourceName);
            }

            this._queryResultMap.remove(resourceName);
            this._resourceFlags.remove(resourceName);
        }
        else {

            // Clear all
            this._graph.clear();
            this._resourceFlags.clear();
            this._queryResultMap.clear();

            // this.logger.info('Cleared all');
        }

        if(this.persist) {
            this.saveToPersistence();
        }

        return this.$q.when();
    }

    public invalidateQuery(query: Query<any>):ng.IPromise<void> {

        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        var resultMap = this._queryResultMap.get(query.getFrom());

        if(resultMap){
            resultMap.remove(serializedQuery);
        }

        this.logger.log('Cleared query', query);

        if(this.persist) {
            this.saveToPersistence();
        }

        return this.$q.when();
    }
}
