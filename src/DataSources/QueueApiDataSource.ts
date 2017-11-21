import ApiDataSource from "./ApiDataSource";
import List from "ts-core/Data/List";
import {DataSourceResponseInterface} from "../DataService/DataSourceResponseInterface";
import Graph from "../Graph/Graph";
import Random from "ts-core/Utils/Random";
import Reference from "../Graph/Reference";
import * as _ from "underscore";

interface MutationOperation {

    type: MutationOperationType,
    resourceName: string,
    resourceId?: any,
    data?: any
}

export enum MutationOperationType {
    CREATE = 1,
    UPDATE,
    REMOVE
}

export default class QueueApiDataSource extends ApiDataSource {

    public static IDENTIFIER = "queueApi";

    protected _queue: List<MutationOperation> = new List<MutationOperation>();

    public create(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface> {

        const tempId = Random.uuid();

        var completeData = _.clone(data);
        completeData.id = tempId;

        this.queue({
            type: MutationOperationType.CREATE,
            resourceName,
            data: completeData
        });

        const graph = new Graph();
        graph.setItem(resourceName, tempId, completeData);

        const response = {
            meta: {},
            graph,
            references: [new Reference(resourceName, tempId)]
        };

        console.log('RESPONSE', response);

        return this.$q.resolve(response);
    }

    protected queue(operation: MutationOperation) {

        this.logger.info('Added to queue', operation);

        this._queue.add(operation);
    }
}
