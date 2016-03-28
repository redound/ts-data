import Query from "./Query";
export interface QueryExecutorInterface {
    execute(query: Query<any>): ng.IPromise<any>;
}
