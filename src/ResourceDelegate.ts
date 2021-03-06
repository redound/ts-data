import Model from "ts-core/lib/Data/Model";
import DataService, {DataServiceResponseInterface} from "./DataService";
import ModelList from "ts-core/lib/Data/ModelList";
import Query from "./Query/Query";

export default class ResourceDelegate<T extends Model> {

    protected _dataService:DataService;
    protected _resourceName:string;

    public constructor(dataService:DataService, resourceName:string) {

        this._dataService = dataService;
        this._resourceName = resourceName;
    }

    public query():Query<ModelList<T>> {
        return this._dataService.query(this._resourceName);
    }

    public all():ng.IPromise<DataServiceResponseInterface<ModelList<T>>> {
        return this._dataService.all(this._resourceName);
    }

    public find(resourceId:any):ng.IPromise<DataServiceResponseInterface<T>> {
        return this._dataService.find(this._resourceName, resourceId);
    }

    public create(data:any):ng.IPromise<DataServiceResponseInterface<T>> {
        return this._dataService.create(this._resourceName, data);
    }

    public createModel(model:T, data?:any):ng.IPromise<DataServiceResponseInterface<T>> {
        return this._dataService.createModel(this._resourceName, model, data);
    }

    public update(resourceId:any, data:any):ng.IPromise<DataServiceResponseInterface<T>> {
        return this._dataService.update(this._resourceName, resourceId, data);
    }

    public updateModel(model:T, data?:any):ng.IPromise<void> {
        return this._dataService.updateModel(this._resourceName, model, data);
    }

    public remove(resourceId:any):ng.IPromise<void> {
        return this._dataService.remove(this._resourceName, resourceId);
    }

    public removeModel(model:Model):ng.IPromise<void> {
        return this._dataService.removeModel(this._resourceName, model);
    }
}
