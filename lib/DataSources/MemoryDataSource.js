"use strict";
var DynamicList_1 = require("ts-core/lib/Data/DynamicList");
var Graph_1 = require("../Graph/Graph");
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var Logger_1 = require("ts-core/lib/Logger/Logger");
var Collection_1 = require("ts-core/lib/Data/Collection");
(function (ResourceFlag) {
    ResourceFlag[ResourceFlag["DATA_COMPLETE"] = 0] = "DATA_COMPLETE";
})(exports.ResourceFlag || (exports.ResourceFlag = {}));
var ResourceFlag = exports.ResourceFlag;
var MemoryDataSource = (function () {
    function MemoryDataSource($q, logger) {
        this.$q = $q;
        this.logger = logger;
        this._graph = new Graph_1.default();
        this._queryResultMap = new Dictionary_1.default();
        this._resourceFlags = new Dictionary_1.default();
        this.logger = (this.logger || new Logger_1.default()).child('MemoryDataSource');
    }
    MemoryDataSource.prototype.setDataService = function (service) {
        this._dataService = service;
    };
    MemoryDataSource.prototype.getDataService = function () {
        return this._dataService;
    };
    MemoryDataSource.prototype.execute = function (query) {
        this.logger.info('execute');
        return this.$q.reject();
    };
    MemoryDataSource.prototype.create = function (resourceName, data) {
        this.logger.info('create');
        return this.$q.reject();
    };
    MemoryDataSource.prototype.update = function (resourceName, resourceId, data) {
        this.logger.info('update');
        return this.$q.reject();
    };
    MemoryDataSource.prototype.remove = function (resourceName, resourceId) {
        this.logger.info('remove');
        return this.$q.reject();
    };
    MemoryDataSource.prototype.notifyExecute = function (query, response) {
        this.logger.info('notifyExecute - query ', query, ' - response', response);
        this._graph.merge(response.graph);
        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        var references = _.clone(response.references);
        var offset = query.getOffset() || 0;
        if ((response.meta.total && this._graph.countItems(query.getFrom()) === response.meta.total) || (!query.hasOffset() && !query.hasLimit())) {
        }
        var queryResult = this._queryResultMap.get(serializedQuery);
        if (!queryResult) {
            queryResult = {
                meta: response.meta,
                query: _.clone(query),
                references: new DynamicList_1.default()
            };
        }
        queryResult.references.setRange(offset, references);
        this._queryResultMap.set(serializedQuery, queryResult);
        return this.$q.when();
    };
    MemoryDataSource.prototype._resourceHasFlag = function (resourceName, flag) {
        var flags = this._resourceFlags.get(resourceName);
        if (!flags) {
            return false;
        }
        return flags.contains(flag);
    };
    MemoryDataSource.prototype._setResourceFlag = function (resourceName, flag) {
        console.log('resourceName', resourceName, 'flag', flag);
        var flags = this._resourceFlags.get(resourceName);
        if (!flags) {
            flags = new Collection_1.default();
            this._resourceFlags.set(resourceName, flags);
        }
        flags.add(flag);
    };
    MemoryDataSource.prototype.notifyCreate = function (response) {
        this.logger.info('notifyCreate - response', response);
        return this.$q.when();
    };
    MemoryDataSource.prototype.notifyUpdate = function (response) {
        this.logger.info('notifyUpdate - response', response);
        return this.$q.when();
    };
    MemoryDataSource.prototype.notifyRemove = function (response) {
        this.logger.info('notifyRemove - response', response);
        return this.$q.when();
    };
    MemoryDataSource.prototype.clear = function () {
        return null;
    };
    MemoryDataSource.QUERY_SERIALIZE_FIELDS = ["from", "conditions", "sorters"];
    return MemoryDataSource;
}());
exports.MemoryDataSource = MemoryDataSource;
