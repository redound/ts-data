import Model from "ts-core/lib/Data/Model";
import DataService, { DataServiceResponseInterface } from "./DataService";
import ModelList from "ts-core/lib/Data/ModelList";
import Query from "./Query/Query";
export default class ResourceDelegate<T extends Model> {
    protected _dataService: DataService;
    protected _resourceName: string;
    constructor(dataService: DataService, resourceName: string);
    query(): Query<ModelList<T>>;
    all(): ng.IPromise<DataServiceResponseInterface<ModelList<T>>>;
    find(resourceId: any): ng.IPromise<DataServiceResponseInterface<T>>;
    create(data: any): ng.IPromise<DataServiceResponseInterface<T>>;
    createModel(model: T, data?: any): ng.IPromise<DataServiceResponseInterface<T>>;
    update(resourceId: any, data: any): ng.IPromise<DataServiceResponseInterface<T>>;
    updateModel(model: T, data?: any): ng.IPromise<void>;
    remove(resourceId: any): ng.IPromise<void>;
    removeModel(model: Model): ng.IPromise<void>;
}
