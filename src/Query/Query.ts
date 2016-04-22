import Condition from "./Condition";
import Sorter from "./Sorter";
import {QueryExecutorInterface} from "./QueryExecutorInterface";
import {DataServiceResponseInterface} from "../DataService/DataService";
import * as _ from "underscore";

export default class Query<T> {

    protected _from:string;
    protected _offset:number = null;
    protected _limit:number = null;
    protected _fields:string[] = [];
    protected _conditions:Condition[] = [];
    protected _sorters:Sorter[] = [];
    protected _includes:string[] = [];
    protected _find:any;

    protected _executor:QueryExecutorInterface;

    public constructor(executor?:QueryExecutorInterface) {
        this._executor = executor;
    }

    public executor(executor:QueryExecutorInterface):Query<T> {

        this._executor = executor;
        return this;
    }

    public getExecutor():QueryExecutorInterface {
        return this._executor;
    }

    public hasExecutor():boolean {
        return !!this._executor;
    }

    public from(from:string):Query<T> {

        this._from = from;
        return this;
    }

    public getFrom():string {
        return this._from;
    }

    public hasFrom():boolean {

        return !!this._from;
    }

    public field(field:string):Query<T> {

        this._fields.push(field);
        return this;
    }

    public addManyFields(fields:string[]):Query<T> {

        this._fields = this._fields.concat(fields);
        return this;
    }

    public getFields():string[] {

        return this._fields;
    }

    public hasFields():boolean {

        return (this._fields.length > 0);
    }

    public offset(offset:number):Query<T> {

        this._offset = offset;
        return this;
    }

    public getOffset():number {

        return this._offset;
    }

    public hasOffset():boolean {

        return _.isNumber(this._offset);
    }

    public limit(limit:number):Query<T> {

        this._limit = limit;
        return this;
    }

    public getLimit():number {

        return this._limit;
    }

    public hasLimit():boolean {

        return _.isNumber(this._limit);
    }

    public condition(condition:Condition):Query<T> {

        this._conditions.push(condition);
        return this;
    }

    public multipleConditions(conditions:Condition[]):Query<T> {

        this._conditions = this._conditions.concat(conditions);
        return this;
    }

    public getConditions():Condition[] {

        return this._conditions;
    }

    public hasConditions():boolean {

        return !!(this._conditions.length > 0);
    }

    public sorter(sorter:Sorter):Query<T> {

        this._sorters.push(sorter);
        return this;
    }

    public multipleSorters(sorters:Sorter[]):Query<T> {

        this._sorters = this._sorters.concat(sorters);
        return this;
    }

    public getSorters():Sorter[] {

        return this._sorters;
    }

    public hasSorters():boolean {

        return (this._sorters.length > 0);
    }

    public include(include:string):Query<T> {

        this._includes.push(include);
        return this;
    }

    public multipleIncludes(includes:string[]):Query<T> {

        this._includes = this._includes.concat(includes);
        return this;
    }

    public getIncludes():string[] {

        return this._includes;
    }

    public hasIncludes():boolean {

        return (this._includes.length > 0);
    }

    public find(id:any):Query<T> {

        this._find = id;
        return this;
    }

    public getFind():any {

        return this._find;
    }

    public hasFind():boolean {

        return !!this._find;
    }

    public execute():ng.IPromise<DataServiceResponseInterface<T>> {

        if (!this.hasExecutor()) {
            throw 'Unable to execute query, no executor set';
        }

        return this._executor.execute(this);
    }

    public merge(query:Query<T>):Query<T> {

        if (query.hasFrom()) {
            this.from(query.getFrom());
        }

        if (query.hasFields()) {
            this.addManyFields(query.getFields());
        }

        if (query.hasOffset()) {
            this.offset(query.getOffset());
        }

        if (query.hasLimit()) {
            this.limit(query.getLimit());
        }

        if (query.hasConditions()) {
            this.multipleConditions(query.getConditions());
        }

        if (query.hasSorters()) {
            this.multipleSorters(query.getSorters());
        }

        if (query.hasIncludes()) {
            this.multipleIncludes(query.getIncludes());
        }

        if (query.hasFind()) {
            this.find(query.getFind());
        }

        return this;
    }

    public serialize(opts:string []) {

        var obj:any = {};

        if (_.contains(opts, "from")) {
            obj.from = this._from;
        }

        if (_.contains(opts, "conditions")) {
            obj.conditions = this.getConditions();
        }

        if (_.contains(opts, "sorters")) {
            obj.sorters = this.getSorters();
        }

        if (_.contains(opts, "find")) {
            obj.find = this.getFind();
        }

        return JSON.stringify(obj);
    }

    public static from(from) {

        return (new this).from(from);
    }

    public toObject():any {

        var obj:any = {};

        if (this.hasConditions()) {
            obj.conditions = this.getConditions();
        }

        if (this.hasSorters()) {
            obj.sorters = this.getSorters();
        }

        if (this.hasOffset()) {
            obj.offset = this.getOffset();
        }

        if (this.hasLimit()) {
            obj.limit = this.getLimit();
        }

        return obj;
    }

    public static fromObject<T>(obj:any):Query<T> {

        var query = new Query;

        if (obj.offset) {

            query.offset(obj.offset);
        }

        if (obj.limit) {

            query.limit(obj.limit);
        }

        if (obj.conditions) {

            query.multipleConditions(_.map(obj.conditions, (data:any) => new Condition(data.type, data.field, data.operator, data.value)));
        }

        if (obj.sorters) {

            query.multipleSorters(_.map(obj.sorters, (data:any) => new Sorter(data.field, data.direction)));
        }

        return query;
    }
}
