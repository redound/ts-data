"use strict";
var Reference_1 = require("./Reference");
var _ = require("underscore");
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var Graph = (function () {
    function Graph(data) {
        this._createdEntitiesCache = new Dictionary_1.default();
        this._data = data || {};
    }
    Graph.prototype.clear = function () {
        this._data = {};
    };
    Graph.prototype.setData = function (data) {
        this._data = data;
    };
    Graph.prototype.getData = function () {
        return this._data;
    };
    Graph.prototype.get = function (path, callback) {
        path = this._optimizePath(path);
        var value = this._getValueForPath(path);
        function getAtEndIndex(path, index) {
            path = _.clone(path) || [];
            path.reverse();
            return path[index] || null;
        }
        var parentKey = getAtEndIndex(path, 1);
        var key = getAtEndIndex(path, 0);
        var useCache = parentKey != null && key != null;
        var cacheKey = parentKey + ':' + key;
        if (useCache && this._createdEntitiesCache.contains(cacheKey)) {
            console.log('FORM CACHE', cacheKey);
            return this._createdEntitiesCache.get(cacheKey);
        }
        console.log('Resolving', parentKey, key);
        var result = this._resolveValueRecursive(parentKey, key, value, callback);
        if (useCache) {
            this._createdEntitiesCache.set(cacheKey, result);
        }
        return result;
    };
    Graph.prototype.setValue = function () {
    };
    Graph.prototype.getValue = function (path) {
        path = this._optimizePath(path);
        return this._getValueForPath(path);
    };
    Graph.prototype.getGraphForPath = function (path) {
        var _this = this;
        var graph = new Graph();
        var value = this.getValue(path);
        var donePaths = [];
        var callback = function (reference) {
            var referencePath = reference.value;
            var pathString = referencePath.join(':');
            if (!_.contains(donePaths, pathString)) {
                console.log('Doing', referencePath, graph.getData());
                donePaths.push(pathString);
                var referenceValue = _this.getValue(referencePath);
                _this._extractReferences(referenceValue, callback);
                if (referenceValue) {
                    graph.set(referencePath, referenceValue);
                }
            }
            else {
                console.log('Already has', referencePath, graph.getData());
            }
        };
        this._extractReferences(value, callback);
        if (value) {
            graph.set(path, value);
        }
        return graph;
    };
    Graph.prototype.getGraphForReferences = function (references) {
        var _this = this;
        var graph = new Graph;
        _.each(references, function (reference) {
            var pathGraph = _this.getGraphForPath(reference.value);
            graph.merge(pathGraph);
        });
        return graph;
    };
    Graph.prototype._getValueForPath = function (path) {
        var root = path ? this._data : null;
        var pathLength = path && path.length ? path.length : 0;
        for (var i = 0; i < pathLength; i++) {
            var part = path[i];
            if (root[part] !== void 0) {
                root = root[part];
            }
            else {
                root = null;
                break;
            }
        }
        return root;
    };
    Graph.prototype._optimizePath = function (path) {
        if (!path) {
            return null;
        }
        var root = this._data;
        for (var i = 0; i < path.length; i++) {
            var part = path[i];
            var end = path.slice(i + 1, path.length);
            if (root[part] === void 0) {
                root = null;
                break;
            }
            root = root[part];
            if (this._isReference(root)) {
                var optimizedPath = root.value.concat(end);
                return this._optimizePath(optimizedPath);
            }
        }
        return root ? path : null;
    };
    Graph.prototype.set = function (path, value) {
        var originalPath = path;
        path = this._optimizePath(path);
        if (!path) {
            path = originalPath;
        }
        if (path && path.length) {
            var root = this._data;
            for (var i = 0; i < path.length; i++) {
                var part = path[i];
                if (root[part] === void 0 && i !== path.length - 1) {
                    root[part] = {};
                }
                if (i === path.length - 1) {
                    root[part] = value;
                }
                root = root[part];
            }
            return this;
        }
        this._data = value;
        this._createdEntitiesCache.clear();
        return this;
    };
    Graph.prototype.has = function (path) {
        return !!this._optimizePath(path);
    };
    Graph.prototype.unset = function (path) {
        path = this._optimizePath(path);
        if (path && path.length) {
            var root = this._data;
            for (var i = 0; i < path.length; i++) {
                var part = path[i];
                if (i === path.length - 1) {
                    delete root[part];
                }
                root = root[part];
            }
        }
        return this;
    };
    Graph.prototype.hasItem = function (resourceName, resourceId) {
        return this.has([resourceName, resourceId]);
    };
    Graph.prototype.setItem = function (resourceName, resourceId, resource) {
        this.set([resourceName, resourceId], resource);
    };
    Graph.prototype.getItem = function (resourceName, resourceId) {
        return this.get([resourceName, resourceId]);
    };
    Graph.prototype.setItems = function (resourceName, items) {
        this.set([resourceName], items);
    };
    Graph.prototype.getItems = function (resourceName) {
        return this.get([resourceName]);
    };
    Graph.prototype.countItems = function (resourceName) {
        return this.getItems(resourceName).length;
    };
    Graph.prototype.removeItems = function (resourceName) {
        this.unset([resourceName]);
    };
    Graph.prototype.removeItem = function (resourceName, resourceId) {
        this.unset([resourceName, resourceId]);
    };
    Graph.prototype.getReferences = function (resourceName) {
        return _.map(this._data[resourceName], function (item, resourceId) {
            return new Reference_1.default(resourceName, resourceId);
        });
    };
    Graph.prototype.merge = function (graph) {
        this.mergeData(graph.getData());
    };
    Graph.prototype.mergeData = function (data) {
        var _this = this;
        _.each(data, function (resources, resourceName) {
            _.each(resources, function (item, resourceId) {
                var currentItem = _this.getItem(resourceName, resourceId);
                if (!currentItem) {
                    _this.setItem(resourceName, resourceId, item);
                }
                else {
                    _this.setItem(resourceName, resourceId, _.extend(currentItem, item));
                }
            });
        });
    };
    Graph.prototype._isReference = function (value) {
        return (value && value.$type && value.$type == "ref");
    };
    Graph.prototype._extractReferences = function (data, callback) {
        var _this = this;
        if (!_.isObject(data)) {
            return;
        }
        _.each(data, function (value) {
            if (_this._isReference(value)) {
                callback(value);
            }
            else {
                _this._extractReferences(value, callback);
            }
        });
    };
    Graph.prototype._resolveValueRecursive = function (parentKey, key, value, callback) {
        var _this = this;
        if (this._isReference(value)) {
            return this.get(value.value, callback);
        }
        if (_.isArray(value)) {
            value = _.map(value, function (subValue, subKey) {
                return _this._resolveValueRecursive(key, subKey, subValue, callback);
            });
        }
        else if (_.isObject(value)) {
            value = _.mapObject(value, function (subValue, subKey) {
                return _this._resolveValueRecursive(key, subKey, subValue, callback);
            });
            if (this._isResourceName(key)) {
                value = _.values(value);
            }
        }
        if (_.isObject(value) && !_.isArray(value) && callback) {
            if (this._isResourceName(key)) {
                value = callback(key, value);
            }
            else if (this._isResourceName(parentKey)) {
                value = callback(parentKey, value);
            }
        }
        return value;
    };
    Graph.prototype._isResourceName = function (resourceName) {
        return (this._data[resourceName] !== void 0);
    };
    return Graph;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Graph;
