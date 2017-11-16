import DataService from "./DataService";
import {DataSourceResponseInterface} from "./DataSourceResponseInterface";
import Query from "../Query/Query";

export interface DataSourceInterface {

    setDataService(dataService:DataService);
    getDataService():DataService;

    getIdentifier():string;

    execute(query:Query<any>):ng.IPromise<DataSourceResponseInterface>;
    create(resourceName:string, data:any):ng.IPromise<DataSourceResponseInterface>;
    update(resourceName:string, resourceId:any, data:any):ng.IPromise<DataSourceResponseInterface>;
    remove(resourceName:string, resourceId:any):ng.IPromise<DataSourceResponseInterface>;

    notifyExecute(query:Query<any>, response:DataSourceResponseInterface):ng.IPromise<void>;
    notifyCreate(response:DataSourceResponseInterface):ng.IPromise<void>;
    notifyUpdate(response:DataSourceResponseInterface):ng.IPromise<void>;
    notifyRemove(response:DataSourceResponseInterface):ng.IPromise<void>;

    invalidate(resourceName?:string, resourceId?: any):ng.IPromise<void>;
    invalidateQuery(query:Query<any>):ng.IPromise<void>;

    markComplete(resourceName?: string):ng.IPromise<void>;
}
