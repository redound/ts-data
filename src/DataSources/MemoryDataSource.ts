import Query from "../Query/Query";
import DynamicList from "ts-core/Data/DynamicList";
import Reference from "../Graph/Reference";
import {DataSourceInterface} from "../DataService/DataSourceInterface";
import DataService from "../DataService/DataService";
import Graph from "../Graph/Graph";
import Dictionary, {DictionaryDataInterface} from "ts-core/Data/Dictionary";
import Logger from "ts-core/Logger/Logger";
import {DataSourceResponseInterface} from "../DataService/DataSourceResponseInterface";
import * as _ from "underscore";
import Collection from "ts-core/Data/Collection";
import {lang} from "moment";
import {SortDirections} from "ts-data/Query/Sorter";
import {ConditionOperator} from "../ts-data";
import {ConditionType} from "ts-data/Query/Condition";

export interface QueryResultInterface {
    query:Query<any>,
    references:DynamicList<Reference>,
    meta:{}
}

export enum ResourceFlag {
    DATA_COMPLETE = 1
}

declare var NativeStorage;

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

    public setPersist(persist: boolean){

        this.persist = persist;

        if(!persist){

            if(typeof NativeStorage !== 'undefined'){
                NativeStorage.remove(MemoryDataSource.PERSISTENCE_KEY);
            }
            else {
                window.localStorage.removeItem(MemoryDataSource.PERSISTENCE_KEY);
            }
        }
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

        if(typeof NativeStorage !== 'undefined'){

            NativeStorage.setItem(MemoryDataSource.PERSISTENCE_KEY, payload, () => {
                this.logger.info('Saved to persistence');
            }, e => {
                this.logger.error('Error loading data from persistence', e);
            });
        }
        else {
            window.localStorage.setItem(MemoryDataSource.PERSISTENCE_KEY, JSON.stringify(payload));
        }
    }

    public loadFromPersistence(){

        const loadData = (payload) => {

            if (!payload) {
                return;
            }

            this.logger.log('Loading from persistence');

            this._graph.setData(payload.data);

            this._queryResultMap = new Dictionary<string, Dictionary<string, QueryResultInterface>>(<DictionaryDataInterface>_.mapObject(payload.queryResultMap, item => _.mapObject(item, (val, key) => {

                if (key == 'value') {

                    return new Dictionary(<DictionaryDataInterface>_.mapObject(val, valueItem => _.mapObject(valueItem, (val2, key2) => {

                        if (key2 == 'value') {

                            return _.mapObject(val2, (val3, key3) => {

                                if (key3 == 'query') {
                                    return Query.fromObject(val3);
                                }
                                else if (key3 == 'references') {
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

            this._resourceFlags = new Dictionary<string, Collection<ResourceFlag>>(<DictionaryDataInterface>_.mapObject(payload.resourceFlags, item => _.mapObject(item, (val, key) => {

                if (key == 'value') {
                    return new Collection(val);
                }

                return val;
            })));
        }

        if(typeof NativeStorage !== 'undefined'){

            NativeStorage.getItem(MemoryDataSource.PERSISTENCE_KEY, loadData, e => {
                this.logger.error('Error loading data from persistence', e);
            });
        }
        else {

            const payloadJSON = window.localStorage.getItem(MemoryDataSource.PERSISTENCE_KEY);
            const payload = payloadJSON ? JSON.parse(payloadJSON) : null;

            loadData(payload);
        }
    }

    public execute(query:Query<any>):ng.IPromise<DataSourceResponseInterface> {

        this.logger.log('Executing query', query, this._graph);

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

                this.logger.log('Got all data in memory, trying executing in local graph');

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

            var includesValid = true;

            _.each(includeParts, (include) => {

                if(!includesValid){
                    return;
                }

                if(!this._validateAndFixInclude(response.graph, response.references, include)){

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

        const resourceName = query.getFrom();
        const resource = this._dataService.getResource(resourceName);
        const primaryKey = resource.getModel().primaryKey();

        var data = this._graph.get([query.getFrom()]);
        if(!data){
            return null;
        }

        const offset = query.getOffset();
        const limit = query.getLimit();
        const sorters = query.getSorters();
        const conditions = query.getConditions();

        // Conditions
        var orConditionResults = [];
        var andConditionResults = [];

        for(const condition of conditions){

            const operator = condition.getOperator();
            const value = condition.getValue();
            const field = condition.getField();

            var filteredData = [];

            if(operator == ConditionOperator.IS_EQUAL) {

                filteredData = data.filter(item => {

                    var fieldValue = item[field];
                    if (fieldValue === null) {
                        return false;
                    }

                    return fieldValue == value;
                });
            }
            else if(operator == ConditionOperator.CONTAINS || operator == ConditionOperator.NOT_CONTAINS) {

                filteredData = data.filter(item => {

                    var fieldValue = item[field];
                    if (fieldValue === null) {
                        return false;
                    }

                    const contains = fieldValue.indexOf(value) !== -1;

                    return operator == ConditionOperator.CONTAINS ? contains : !contains;
                });
            }
            else if(operator == ConditionOperator.IS_LIKE) {

                const query = value.replace(/%/g, '').toLowerCase();
                const startWith = value.slice(-1) == '%';
                const endWith = value.substring(0, 1) == '%';

                filteredData = data.filter(item => {

                    var fieldValue = item[field];
                    if(fieldValue === null){
                        return false;
                    }

                    fieldValue = fieldValue.toLowerCase();

                    var result = false;

                    if(startWith && endWith){

                        // Middle
                        result = fieldValue.indexOf(query) !== -1;
                    }
                    else if(startWith){

                        result = fieldValue.indexOf(query) === 0;
                    }
                    else if(endWith){

                        result = fieldValue.indexOf(query) === fieldValue.length-2;
                    }

                    return result;
                });
            }

            // TODO: Add other condition operators

            if(condition.getType() == ConditionType.AND){
                andConditionResults.push(filteredData);
            }
            else if(condition.getType() == ConditionType.OR){
                orConditionResults.push(filteredData);
            }
        }

        if(andConditionResults.length > 0){

            data = _.intersection(...andConditionResults);
        }

        if(orConditionResults.length > 0){

            data = _.intersection(_.union(...orConditionResults), data);
        }


        // Sorters
        for(const sorter of sorters) {

            data = _.sortBy(data, sorter.getField());

            if (sorter.getDirection() == SortDirections.DESCENDING) {
                data.reverse();
            }
        }


        // Create response
        const referenceList = new DynamicList<Reference>(_.map(data, (itemData:any) => {

            return new Reference(resourceName, itemData[primaryKey]);
        }));

        const references = referenceList.getRange(offset, limit);

        return {
            meta: {
                total: data.length
            },
            graph: this._graph.getGraphForReferences(references),
            references: _.clone(references)
        };
    }

    protected _validateAndFixInclude(graph: Graph, references: Reference[], includeParts: string[]): boolean {

        var valid = true;

        for(const reference of references){

            const resourceName = reference.value[0];

            const item = graph.getValue(reference.value);

            var part = includeParts[0];
            var nextParts = includeParts.length > 1 ? includeParts.slice(1) : [];

            var val = item[part];
            var includeValid = false;

            if(val === undefined){

                // Missing include, trying to fix
                const resource = this._dataService.getResource(resourceName);
                const resourceModel = resource.getModel();

                const referencesInfo = resourceModel.references ? resourceModel.references() : null;
                const currentReferenceInfo = referencesInfo ? referencesInfo[part] : null;

                if(currentReferenceInfo && item[currentReferenceInfo.field]) {

                    const foreignId = item[currentReferenceInfo.field];
                    const foreignResourceName = currentReferenceInfo.resource;

                    this.logger.log(`Missing include ${part}, trying to fix with key ${currentReferenceInfo.field} ${foreignId} in resource ${foreignResourceName}`);

                    if(this._graph.hasItem(foreignResourceName, foreignId)){

                        this.logger.log(`Found include ${part} ${foreignId} in graph`);

                        const foreignGraph = this._graph.getGraphForPath([foreignResourceName, foreignId]);
                        graph.merge(foreignGraph);

                        item[part] = new Reference(foreignResourceName, foreignId);

                        includeValid = true;
                    }
                    else {

                        this.logger.log(`Include ${part} ${foreignId} not found in graph`);
                    }
                }
            }
            else {

                includeValid = true;
            }

            if(!includeValid){

                this.logger.log('Missing include', part);
                valid = false;
            }
            else if(nextParts.length > 0){

                var nextItems = _.isArray(val) ? val : [val];

                if(!this._validateAndFixInclude(graph, nextItems, nextParts)){
                    valid = false;
                }
            }

            if(!valid){
                break;
            }
        }

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

        this.logger.log(`Setting flag ${flag} for resource ${resourceName}`);

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

    protected _syncRelations(references: Reference[]){

        // Create (inverse) relationships
        for(const ref of references){

            const resourceName = ref.value[0];
            const resourceId = ref.value[1];

            const referencesInfo = this._getResourceReferencesInfo(resourceName);
            if(!referencesInfo){
                continue;
            }

            const item = this._graph.getValue([resourceName, resourceId]);

            for(const relationName of Object.keys(referencesInfo)){

                const relationData = referencesInfo[relationName];
                const referenceValue = item[relationData.field];
                const hasValue = referenceValue !== undefined && referenceValue !== null;

                if(relationData.many){

                    const refs = _.map(referenceValue || [], redId => new Reference(relationData.resource, redId));
                    this._graph.set([resourceName, resourceId, relationName], refs);
                }
                else {

                    const refValue = hasValue ? new Reference(relationData.resource, referenceValue) : null;
                    this._graph.set([resourceName, resourceId, relationName], refValue);
                }

                if(hasValue && relationData.inverse){

                    const inversePath = [relationData.resource, referenceValue, relationData.inverse];
                    const currentInverseValue = this._graph.getValue(inversePath);

                    const relationReferencesInfo = this._getResourceReferencesInfo(relationData.resource);
                    const inverseRelationInfo = relationReferencesInfo ? relationReferencesInfo[relationData.inverse] : null;

                    if(inverseRelationInfo) {

                        const inverseFieldPath = [relationData.resource, referenceValue, inverseRelationInfo.field];

                        if (inverseRelationInfo.many) {

                            const newInverseValue = currentInverseValue || [];
                            const currentInverseValueItem = _.find(_.map(newInverseValue, 'value'), inverseRef => inverseRef[0] == resourceName && inverseRef[1].toString() == resourceId.toString());

                            if (!currentInverseValueItem) {

                                currentInverseValue.push(new Reference(resourceName, resourceId));
                                this._graph.set(inversePath, currentInverseValue);

                                const newInverseFieldValue = _.map(_.map(currentInverseValue, 'value'), item => item[1]);

                                this._graph.set(inverseFieldPath, newInverseFieldValue);
                            }
                        }
                        else {

                            this._graph.set(inversePath, new Reference(resourceName, resourceId));
                            this._graph.set(inverseFieldPath, resourceId);
                        }
                    }
                    else {

                        this.logger.error(`Invalid inverse ${relationData.inverse} for resource '${resourceName}' relation '${relationName}'`);
                    }
                }
            }
        }
    }

    protected _getResourceReferencesInfo(resourceName: string): any {

        const resource = this._dataService.getResource(resourceName);
        const resourceModel = resource.getModel();
        return resourceModel.references ? resourceModel.references() : null;
    }

    public notifyCreate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyCreate - response', response);

        this._graph.merge(response.graph);
        this._clearCachesForIncomingResponse(response);

        this._syncRelations(response.references);

        if(this.persist) {
            this.saveToPersistence();
        }

        return this.$q.when();
    }

    public notifyUpdate(response:DataSourceResponseInterface):ng.IPromise<void> {

        this.logger.info('notifyUpdate - response', response);

        this._graph.merge(response.graph);
        this._clearCachesForIncomingResponse(response);

        this._syncRelations(response.references);

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
                this.logger.info('Cleared item', resourceName, resourceId);
            }
            else {

                // Clear all from resource
                this._graph.removeItems(resourceName);
                this.logger.info('Cleared resource', resourceName);
            }

            this._queryResultMap.remove(resourceName);
            this._resourceFlags.remove(resourceName);
        }
        else {

            // Clear all
            this._graph.clear();
            this._resourceFlags.clear();
            this._queryResultMap.clear();

            this.logger.info('Cleared all');
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

    public markComplete(resourceName?: string):ng.IPromise<void> {

        if(resourceName) {

            this._setResourceFlag(resourceName, ResourceFlag.DATA_COMPLETE);
        }
        else {

            for(const resourceItemName of this._dataService.getResources().keys()){

                this._setResourceFlag(resourceItemName, ResourceFlag.DATA_COMPLETE);
            }
        }

        return this.$q.when();
    }
}
