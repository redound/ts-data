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
    Graph.prototype.get = function (path, creationCallback) {
        var _this = this;
        this._createdEntitiesCache.clear();
        path = this._optimizePath(path);
        if (path == null || path.length == 0) {
            return null;
        }
        var value = this._getValueForPath(path);
        var references = this._getUniqueReferences(value);
        var rootReferences = [];
        if (path.length == 1) {
            _.each(value, function (item, key) {
                rootReferences.push(new Reference_1.default(path[0], key));
            });
        }
        else if (path.length == 2) {
            rootReferences.push(new Reference_1.default(path[0], path[1]));
        }
        references = references.concat(rootReferences);
        _.each(references, function (reference) {
            var referenceKey = reference.value.join(':');
            if (_this._createdEntitiesCache.contains(referenceKey)) {
                return;
            }
            var referenceValue = _this._getValueForPath(reference.value);
            if (!referenceValue) {
                _this._createdEntitiesCache.set(referenceKey, null);
                return;
            }
            var parsedValue = _.clone(referenceValue);
            _.each(referenceValue, function (val, key) {
                var isReference = _this._isReference(val);
                if (!isReference && _.isArray(val)) {
                    _.each(val, function (valItem) {
                        if (!isReference && _this._isReference(valItem)) {
                            isReference = true;
                        }
                    });
                }
                if (isReference) {
                    delete parsedValue[key];
                }
            });
            var entity = creationCallback ? creationCallback(reference.value[0], parsedValue) : parsedValue;
            _this._createdEntitiesCache.set(referenceKey, entity);
        });
        this._resolveValueRecursive(null, rootReferences, function (refPathKey) {
            return _this._createdEntitiesCache.get(refPathKey);
        });
        return path.length == 1 ? rootReferences : _.first(rootReferences);
    };
    Graph.prototype._resolveValueRecursive = function (subject, rootValue, callback) {
        var _this = this;
        var resolvedPaths = [];
        var resolve = function (subject, value, key) {
            if (_this._isReference(value) && key !== null) {
                var pathKey = value.value.join(':');
                var resolvedItem = callback(pathKey, value.value);
                subject[key] = resolvedItem;
                if (!_.contains(resolvedPaths, pathKey)) {
                    resolvedPaths.push(pathKey);
                    resolve(resolvedItem, _.clone(_this._getValueForPath(value.value)), null);
                }
            }
            else if (_.isArray(value)) {
                _.each(value, function (itemVal, itemIndex) {
                    resolve(value, _.clone(itemVal), itemIndex);
                });
                if (key !== null && subject[key] == undefined) {
                    subject[key] = value;
                }
            }
            else if (_.isObject(value)) {
                _.each(value, function (itemVal, itemKey) {
                    resolve(subject, _.clone(itemVal), itemKey);
                });
            }
        };
        resolve(subject, rootValue, null);
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
                donePaths.push(pathString);
                var referenceValue = _this.getValue(referencePath);
                _this._extractReferences(referenceValue, callback);
                if (referenceValue) {
                    graph.set(referencePath, referenceValue);
                }
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
                var currentItem = _this._getValueForPath([resourceName, resourceId]);
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
    Graph.prototype._getUniqueReferences = function (data) {
        var _this = this;
        var donePaths = [];
        var references = [];
        var callback = function (reference) {
            var referencePath = reference.value;
            var pathString = referencePath.join(':');
            if (!_.contains(donePaths, pathString)) {
                donePaths.push(pathString);
                references.push(reference);
                var referenceValue = _this.getValue(referencePath);
                _this._extractReferences(referenceValue, callback);
            }
        };
        this._extractReferences(data, callback);
        return references;
    };
    Graph.prototype._isResourceName = function (resourceName) {
        return (this._data[resourceName] !== void 0);
    };
    return Graph;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Graph;
