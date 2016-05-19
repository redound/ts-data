"use strict";
var DynamicList_1 = require("ts-core/lib/Data/DynamicList");
var Reference_1 = require("../Graph/Reference");
var Graph_1 = require("../Graph/Graph");
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var Logger_1 = require("ts-core/lib/Logger/Logger");
var _ = require("underscore");
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
    MemoryDataSource.prototype.getIdentifier = function () {
        return MemoryDataSource.IDENTIFIER;
    };
    MemoryDataSource.prototype.setDataService = function (service) {
        this._dataService = service;
    };
    MemoryDataSource.prototype.getDataService = function () {
        return this._dataService;
    };
    MemoryDataSource.prototype.execute = function (query) {
        var _this = this;
        this.logger.log('Executing query', query);
        var response = null;
        if (query.hasFind()) {
            response = this.find(query.getFrom(), query.getFind());
            if (response) {
                this.logger.log('Found item ' + query.getFind());
            }
        }
        else {
            var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
            var resultMap = this._queryResultMap.get(query.getFrom());
            var queryResult = resultMap ? resultMap.get(serializedQuery) : null;
            this.logger.info('Trying query cache with key', serializedQuery);
            if (queryResult) {
                var referenceList = queryResult.references;
                var offset = query.getOffset();
                var limit = query.getLimit();
                if (limit != null && referenceList.containsRange(offset, limit)) {
                    var references = referenceList.getRange(offset, limit);
                    response = {
                        meta: queryResult.meta,
                        graph: this._graph.getGraphForReferences(references),
                        references: _.clone(references)
                    };
                    this.logger.log('Found in query cache (' + references.length + ' records)');
                }
            }
            if (!response && this._resourceHasFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE)) {
                this.logger.info('Got all data in memory, trying executing in local graph');
                response = this._executeInGraph(query);
                if (response) {
                    this.logger.log('Executed query in graph');
                }
            }
        }
        if (response) {
            var includeParts = _.map(query.getIncludes(), function (include) {
                return include.split('.');
            });
            var resourceData = [];
            _.each(response.references, function (ref) {
                resourceData.push(response.graph.get(ref.value));
            });
            var includesValid = true;
            _.each(includeParts, function (include) {
                if (!includesValid) {
                    return;
                }
                if (!_this._validateInclude(resourceData, include)) {
                    includesValid = false;
                }
            });
            if (includesValid) {
                this.logger.log('Response valid', response);
                return this.$q.when(response);
            }
            else {
                this.logger.log('Found data invalid, includes are not present');
            }
        }
        else {
            this.logger.log('No data found');
        }
        return this.$q.reject();
    };
    MemoryDataSource.prototype.find = function (resourceName, resourceId) {
        if (!this._graph.hasItem(resourceName, resourceId)) {
            return null;
        }
        var references = [new Reference_1.default(resourceName, resourceId)];
        return {
            meta: {},
            graph: this._graph.getGraphForReferences(references),
            references: references
        };
    };
    MemoryDataSource.prototype._executeInGraph = function (query) {
        return null;
    };
    MemoryDataSource.prototype._validateInclude = function (items, includeParts) {
        var _this = this;
        var valid = true;
        _.each(items, function (item) {
            if (!valid) {
                return;
            }
            var part = includeParts[0];
            var nextParts = includeParts.length > 1 ? includeParts.slice(1) : [];
            var val = item[part];
            if (val == null || val == undefined || (!_.isObject(val) && !_.isArray(val))) {
                _this.logger.log('Missing include', part);
                valid = false;
            }
            else {
                if (nextParts.length > 0) {
                    var nextItems = _.isArray(val) ? val : [val];
                    if (!_this._validateInclude(nextItems, nextParts)) {
                        valid = false;
                    }
                }
            }
        });
        return valid;
    };
    MemoryDataSource.prototype.create = function (resourceName, data) {
        return this.$q.reject();
    };
    MemoryDataSource.prototype.update = function (resourceName, resourceId, data) {
        return this.$q.reject();
    };
    MemoryDataSource.prototype.remove = function (resourceName, resourceId) {
        return this.$q.reject();
    };
    MemoryDataSource.prototype.notifyExecute = function (query, response) {
        this._graph.merge(response.graph);
        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        var references = _.clone(response.references);
        var offset = query.getOffset() || 0;
        if ((response.meta.total && this._graph.countItems(query.getFrom()) === response.meta.total)
            || (!query.hasOffset() && !query.hasLimit() && !query.hasFind() && !query.hasConditions())) {
            this._setResourceFlag(query.getFrom(), ResourceFlag.DATA_COMPLETE);
        }
        if (!query.hasFind()) {
            var resultMap = this._queryResultMap.get(query.getFrom()) || new Dictionary_1.default();
            var queryResult = resultMap.get(serializedQuery);
            if (!queryResult) {
                queryResult = {
                    meta: response.meta,
                    query: _.clone(query),
                    references: new DynamicList_1.default()
                };
            }
            queryResult.references.setRange(offset, references);
            resultMap.set(serializedQuery, queryResult);
            this._queryResultMap.set(query.getFrom(), resultMap);
        }
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
    MemoryDataSource.prototype._getResponseResources = function (response) {
        var resources = new Collection_1.default();
        _.each(response.references, function (reference) {
            resources.add(reference.$type);
        });
        return resources;
    };
    MemoryDataSource.prototype._clearCachesForIncomingResponse = function (response) {
        var _this = this;
        this._getResponseResources(response).each(function (resourceName) {
            if (!_this._resourceHasFlag(resourceName, ResourceFlag.DATA_COMPLETE)) {
                _this._queryResultMap.remove(resourceName);
            }
        });
    };
    MemoryDataSource.prototype.notifyCreate = function (response) {
        this.logger.info('notifyCreate - response', response);
        this._graph.merge(response.graph);
        this._clearCachesForIncomingResponse(response);
        return this.$q.when();
    };
    MemoryDataSource.prototype.notifyUpdate = function (response) {
        this.logger.info('notifyUpdate - response', response);
        this._graph.merge(response.graph);
        this._clearCachesForIncomingResponse(response);
        return this.$q.when();
    };
    MemoryDataSource.prototype.notifyRemove = function (response) {
        var _this = this;
        this.logger.info('notifyRemove - response', response);
        _.each(response.references, function (reference) {
            _this._graph.unset(reference.value);
        });
        this._clearCachesForIncomingResponse(response);
        return this.$q.when();
    };
    MemoryDataSource.prototype.invalidate = function (resourceName, resourceId) {
        if (resourceName) {
            if (resourceId) {
                this._graph.removeItem(resourceName, resourceId);
                this.logger.log('Cleared item', resourceName, resourceId);
            }
            else {
                this._graph.removeItems(resourceName);
                this.logger.log('Cleared resource', resourceName);
            }
            this._queryResultMap.remove(resourceName);
            this._resourceFlags.remove(resourceName);
        }
        else {
            this._graph.clear();
            this._resourceFlags.clear();
            this._queryResultMap.clear();
            this.logger.log('Cleared all');
        }
        return this.$q.when();
    };
    MemoryDataSource.prototype.invalidateQuery = function (query) {
        var serializedQuery = query.serialize(MemoryDataSource.QUERY_SERIALIZE_FIELDS);
        var resultMap = this._queryResultMap.get(query.getFrom());
        if (resultMap) {
            resultMap.remove(serializedQuery);
        }
        this.logger.log('Cleared query', query);
        return this.$q.when();
    };
    MemoryDataSource.QUERY_SERIALIZE_FIELDS = ["from", "conditions", "sorters"];
    MemoryDataSource.IDENTIFIER = "memory";
    return MemoryDataSource;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MemoryDataSource;
