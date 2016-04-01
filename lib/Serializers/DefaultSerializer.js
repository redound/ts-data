"use strict";
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var Collection_1 = require("ts-core/lib/Data/Collection");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var Reference_1 = require("../Graph/Reference");
var Graph_1 = require("../Graph/Graph");
var _ = require("underscore");
var DefaultSerializer = (function () {
    function DefaultSerializer(resources) {
        this.setResources(resources);
    }
    DefaultSerializer.prototype.setResources = function (resources) {
        var _this = this;
        this.resources = resources;
        this.resourceAliasMap = new Dictionary_1.default();
        this.resources.each(function (resourceName, resource) {
            var itemKeys = resource.getItemKeys();
            var collectionKeys = resource.getCollectionKeys();
            itemKeys.each(function (key) {
                _this.resourceAliasMap.set(key, resourceName);
            });
            collectionKeys.each(function (key) {
                _this.resourceAliasMap.set(key, resourceName);
            });
        });
    };
    DefaultSerializer.prototype.deserialize = function (resourceName, response) {
        var data = response.data;
        var total = response.data.total;
        var resource = this.resources.get(resourceName);
        var primaryKey = resource.getModel().primaryKey();
        var itemKeys = resource.getItemKeys();
        var collectionKeys = resource.getCollectionKeys();
        var keys = new Collection_1.default();
        itemKeys.each(function (key) {
            keys.add(key);
        });
        collectionKeys.each(function (key) {
            keys.add(key);
        });
        var result;
        _.each(response.data, function (value, key) {
            if (!result && keys.contains(key)) {
                result = value;
            }
        });
        if (!result) {
            throw new Exception_1.default('No result under existing keys found');
        }
        var references;
        if (_.isArray(result)) {
            references = _.map(result, function (itemData) {
                return new Reference_1.default(resourceName, itemData[primaryKey]);
            });
        }
        else {
            references = [new Reference_1.default(resourceName, result[primaryKey])];
        }
        var meta = {};
        if (total) {
            meta.total = total;
        }
        return {
            meta: meta,
            graph: this.createGraph(data),
            references: references
        };
    };
    DefaultSerializer.prototype.createGraph = function (data) {
        var _this = this;
        var graph = new Graph_1.default();
        this.extractResources(null, data, function (resourceName, data) {
            var resource = _this.resources.get(resourceName);
            var primaryKey = resource.getModel().primaryKey();
            var resourceId = data[primaryKey];
            graph.setItem(resourceName, resourceId, data);
        }, function (parentResourceName, parentData, key, resourceName, data) {
            var parentResource = _this.resources.get(parentResourceName);
            var parentPrimaryKey = parentResource.getModel().primaryKey();
            var parentResourceId = parentData[parentPrimaryKey];
            var parentItem = graph.getValue([parentResourceName, parentResourceId]);
            var resource = _this.resources.get(resourceName);
            var primaryKey = resource.getModel().primaryKey();
            if (_.isArray(data)) {
                parentItem[key] = _.map(data, function (itemData) {
                    return new Reference_1.default(resourceName, itemData[primaryKey]);
                });
            }
            else if (_.isObject(data)) {
                parentItem[key] = new Reference_1.default(resourceName, data[primaryKey]);
            }
        });
        return graph;
    };
    DefaultSerializer.prototype.extractResources = function (parentResourceName, data, resourceCallback, referenceCallback) {
        var _this = this;
        _.each(data, function (value, key) {
            var resourceName = _this.resourceAliasMap.get(key);
            if (!_.isArray(data) && resourceName) {
                if (_.isArray(value)) {
                    _.each(value, function (itemData) { return resourceCallback(resourceName, _.clone(itemData)); });
                }
                else if (_.isObject(value)) {
                    resourceCallback(resourceName, _.clone(value));
                }
                if (parentResourceName) {
                    referenceCallback(parentResourceName, _.clone(data), key, resourceName, _.clone(value));
                }
                _this.extractResources(resourceName, value, resourceCallback, referenceCallback);
            }
            else if (_.isObject(data)) {
                _this.extractResources(parentResourceName, value, resourceCallback, referenceCallback);
            }
        });
    };
    return DefaultSerializer;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DefaultSerializer;
