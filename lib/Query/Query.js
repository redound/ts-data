"use strict";
var Condition_1 = require("./Condition");
var Sorter_1 = require("./Sorter");
var _ = require("underscore");
var Query = (function () {
    function Query(executor) {
        this._offset = null;
        this._limit = null;
        this._fields = [];
        this._conditions = [];
        this._sorters = [];
        this._includes = [];
        this._executor = executor;
    }
    Query.prototype.executor = function (executor) {
        this._executor = executor;
        return this;
    };
    Query.prototype.getExecutor = function () {
        return this._executor;
    };
    Query.prototype.hasExecutor = function () {
        return !!this._executor;
    };
    Query.prototype.from = function (from) {
        this._from = from;
        return this;
    };
    Query.prototype.getFrom = function () {
        return this._from;
    };
    Query.prototype.hasFrom = function () {
        return !!this._from;
    };
    Query.prototype.field = function (field) {
        this._fields.push(field);
        return this;
    };
    Query.prototype.addManyFields = function (fields) {
        this._fields = this._fields.concat(fields);
        return this;
    };
    Query.prototype.getFields = function () {
        return this._fields;
    };
    Query.prototype.hasFields = function () {
        return (this._fields.length > 0);
    };
    Query.prototype.offset = function (offset) {
        this._offset = offset;
        return this;
    };
    Query.prototype.getOffset = function () {
        return this._offset;
    };
    Query.prototype.hasOffset = function () {
        return _.isNumber(this._offset);
    };
    Query.prototype.limit = function (limit) {
        this._limit = limit;
        return this;
    };
    Query.prototype.getLimit = function () {
        return this._limit;
    };
    Query.prototype.hasLimit = function () {
        return _.isNumber(this._limit);
    };
    Query.prototype.condition = function (condition) {
        this._conditions.push(condition);
        return this;
    };
    Query.prototype.multipleConditions = function (conditions) {
        this._conditions = this._conditions.concat(conditions);
        return this;
    };
    Query.prototype.getConditions = function () {
        return this._conditions;
    };
    Query.prototype.hasConditions = function () {
        return !!(this._conditions.length > 0);
    };
    Query.prototype.sorter = function (sorter) {
        this._sorters.push(sorter);
        return this;
    };
    Query.prototype.multipleSorters = function (sorters) {
        this._sorters = this._sorters.concat(sorters);
        return this;
    };
    Query.prototype.getSorters = function () {
        return this._sorters;
    };
    Query.prototype.hasSorters = function () {
        return (this._sorters.length > 0);
    };
    Query.prototype.include = function (include) {
        this._includes.push(include);
        return this;
    };
    Query.prototype.multipleIncludes = function (includes) {
        this._includes = this._includes.concat(includes);
        return this;
    };
    Query.prototype.getIncludes = function () {
        return this._includes;
    };
    Query.prototype.hasIncludes = function () {
        return (this._includes.length > 0);
    };
    Query.prototype.find = function (id) {
        this._find = id;
        return this;
    };
    Query.prototype.getFind = function () {
        return this._find;
    };
    Query.prototype.hasFind = function () {
        return !!this._find;
    };
    Query.prototype.execute = function () {
        if (!this.hasExecutor()) {
            throw 'Unable to execute query, no executor set';
        }
        return this._executor.execute(this);
    };
    Query.prototype.merge = function (query) {
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
    };
    Query.prototype.serialize = function (opts) {
        var obj = {};
        if (_.contains(opts, "from")) {
            obj.from = this._from;
        }
        if (_.contains(opts, "conditions")) {
            obj.conditions = this.getConditions();
        }
        if (_.contains(opts, "sorters")) {
            obj.sorters = this.getSorters();
        }
        return JSON.stringify(obj);
    };
    Query.from = function (from) {
        return (new this).from(from);
    };
    Query.prototype.toObject = function () {
        var obj = {};
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
    };
    Query.fromObject = function (obj) {
        var query = new Query;
        if (obj.offset) {
            query.offset(obj.offset);
        }
        if (obj.limit) {
            query.limit(obj.limit);
        }
        if (obj.conditions) {
            query.multipleConditions(_.map(obj.conditions, function (data) { return new Condition_1.default(data.type, data.field, data.operator, data.value); }));
        }
        if (obj.sorters) {
            query.multipleSorters(_.map(obj.sorters, function (data) { return new Sorter_1.default(data.field, data.direction); }));
        }
        return query;
    };
    return Query;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Query;
