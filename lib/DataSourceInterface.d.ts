import DataService from "./DataService";
import { DataSourceResponseInterface } from "./DataSourceResponseInterface";
import Query from "./Query/Query";
export interface DataSourceInterface {
    setDataService(dataService: DataService): any;
    getDataService(): DataService;
    execute(query: Query<any>): ng.IPromise<DataSourceResponseInterface>;
    create(resourceName: string, data: any): ng.IPromise<DataSourceResponseInterface>;
    update(resourceName: string, resourceId: any, data: any): ng.IPromise<DataSourceResponseInterface>;
    remove(resourceName: string, resourceId: any): ng.IPromise<DataSourceResponseInterface>;
    notifyExecute(query: Query<any>, response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyCreate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyUpdate(response: DataSourceResponseInterface): ng.IPromise<void>;
    notifyRemove(response: DataSourceResponseInterface): ng.IPromise<void>;
    clear(): ng.IPromise<any>;
}
