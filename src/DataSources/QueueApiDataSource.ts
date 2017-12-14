import ApiDataSource from "./ApiDataSource";
import List from "ts-core/Data/List";
import {DataSourceResponseInterface} from "../DataService/DataSourceResponseInterface";
import Graph from "../Graph/Graph";
import Random from "ts-core/Utils/Random";
import Reference from "../Graph/Reference";
import * as _ from "underscore";
import ApiService from "../Api/ApiService";
import {SerializerInterface} from "../Api/SerializerInterface";
import Logger from "ts-core/Logger/Logger";

export interface MutationOperation {

    type: MutationOperationType,
    resourceName?: string,
    resourceId?: any,
    data?: any
}

export enum MutationOperationType {
    CREATE = 1,
    UPDATE,
    REMOVE,
    CUSTOM
}

export default class QueueApiDataSource extends ApiDataSource {

    public static IDENTIFIER = "queueApi";
    public static PERSISTENCE_KEY = 'QueueApiDataSourceQueue'

    protected _queue: List<MutationOperation> = new List<MutationOperation>();
    protected _customProcessor: (operation: MutationOperation) => ng.IPromise<any>;

    public constructor(protected $q:ng.IQService,
                       protected apiService:ApiService,
                       protected serializer:SerializerInterface,
                       protected logger?:Logger,
                       protected queueEnabled: boolean = true) {

        super($q, apiService, serializer, logger);
        this.logger = (this.logger || new Logger()).child('QueueApiDataSource');

        this.loadFromPersistence();
    }

    public setQueueEnabled(enabled: boolean){

        this.queueEnabled = enabled;
    }

    public setCustomProcessor(processor: (operation: MutationOperation) => ng.IPromise<any>){

        this._customProcessor = processor;
    }

    public create(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface> {

        if(!this.queueEnabled){
            return super.create(resourceName, data);
        }

        const tempId = Random.uuid();

        var completeData = _.deepClone(data);
        completeData.id = tempId;

        this.queue({
            type: MutationOperationType.CREATE,
            resourceName,
            data: completeData
        });

        const graph = new Graph();
        graph.setItem(resourceName, tempId, _.deepClone(completeData));

        const response = {
            meta: {},
            graph,
            references: [new Reference(resourceName, tempId)]
        };

        return this.$q.resolve(response);
    }

    public update(resourceName:string, resourceId:any, data:any):ng.IPromise<DataSourceResponseInterface> {

        if(!this.queueEnabled){
            return super.update(resourceName, resourceId, data);
        }

        this.queue({
            type: MutationOperationType.UPDATE,
            resourceName,
            resourceId,
            data: _.deepClone(data)
        });

        const graph = new Graph();
        graph.setItem(resourceName, resourceId, _.deepClone(data));

        const response = {
            meta: {},
            graph,
            references: [new Reference(resourceName, resourceId)]
        };

        return this.$q.resolve(response);
    }

    public remove(resourceName:string, resourceId:any):ng.IPromise<DataSourceResponseInterface> {

        if(!this.queueEnabled){
            return super.remove(resourceName, resourceId);
        }

        this.queue({
            type: MutationOperationType.REMOVE,
            resourceName,
            resourceId
        });

        return this.$q.resolve({
            meta: {},
            graph: null,
            references: [new Reference(resourceName, resourceId)]
        });
    }

    public flush(): ng.IPromise<any>{

        if(this._queue.count() == 0){
            return this.$q.resolve();
        }

        const deferred = this.$q.defer();

        this.processNextQueueItem(deferred);

        return deferred.promise;
    }

    public processNextQueueItem(completeDeferred: ng.IDeferred<any>, errors = []){

        const queueItem = this._queue.first();

        this.logger.log('Processing queue item', queueItem);

        var promise: ng.IPromise<DataSourceResponseInterface> = null;

        if(queueItem.type === MutationOperationType.CREATE){

            promise = super.create(queueItem.resourceName, queueItem.data);
        }
        else if(queueItem.type === MutationOperationType.UPDATE){

            promise = super.update(queueItem.resourceName, queueItem.resourceId, queueItem.data);
        }
        else if(queueItem.type === MutationOperationType.REMOVE){

            promise = super.remove(queueItem.resourceName, queueItem.resourceId);
        }
        else if(queueItem.type === MutationOperationType.CUSTOM && this._customProcessor) {

            promise = this._customProcessor(queueItem);
        }

        if(promise){

            const next = () =>{

                this._queue.remove(queueItem);
                if(this._queue.count() > 0){
                    this.processNextQueueItem(completeDeferred, errors);
                }
                else {

                    this.saveToPersistence();

                    if(errors.length === 0) {
                        completeDeferred.resolve();
                    }
                    else {
                        completeDeferred.reject(errors);
                    }
                }
            };

            promise.then(next).catch(e => {

                this.logger.error('Error processing queue item', e);

                errors.push(e);
                next();
            });
        }
    }

    public queue(operation: MutationOperation) {

        this.logger.info('Added to queue', operation);

        this._queue.add(operation);
        this.saveToPersistence();
    }

    protected loadFromPersistence(){

        const payloadJSON = window.localStorage.getItem(QueueApiDataSource.PERSISTENCE_KEY);
        const payload = payloadJSON ? JSON.parse(payloadJSON) : null;

        if(payload) {

            this.logger.log('Loading queue from persistence');
            this._queue = new List<MutationOperation>(payload);
        }
    }

    protected saveToPersistence(){

        this.logger.log('Saving queue to persistence', this._queue.toArray());

        window.localStorage.setItem(QueueApiDataSource.PERSISTENCE_KEY, JSON.stringify(this._queue.toArray()));
    }
}
