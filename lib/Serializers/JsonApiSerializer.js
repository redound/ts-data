"use strict";
var Reference_1 = require("../Graph/Reference");
var Graph_1 = require("../Graph/Graph");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var _ = require("underscore");
var JsonApiSerializer = (function () {
    function JsonApiSerializer(resources) {
        this.resources = resources;
    }
    JsonApiSerializer.prototype.deserialize = function (resourceName, response) {
        var total = response.data.total;
        var data = response.data.data;
        var included = response.data.included;
        var resource = this.resources.get(resourceName);
        var primaryKey = resource.getModel().primaryKey();
        var dataGraph = this.createGraph(data);
        var includedGraph = this.createGraph(included);
        dataGraph.merge(includedGraph);
        var meta = {
            total: total
        };
        return {
            meta: meta,
            graph: dataGraph,
            references: _.map(data, function (itemData) {
                return new Reference_1.default(resourceName, itemData[primaryKey]);
            })
        };
    };
    JsonApiSerializer.prototype.createGraph = function (data) {
        var _this = this;
        var graph = new Graph_1.default();
        this.extractResource(data, function (resourceName, resourceId, attributes, relationships) {
            var resource = _this.resources.get(resourceName);
            if (!resource) {
                throw new Exception_1.default('Resource `' + resourceName + '` could not be found!');
            }
            var transformer = resource.getTransformer();
            var model = resource.getModel();
            var primaryKey = model.primaryKey();
            attributes[primaryKey] = parseInt(resourceId);
            var item = attributes;
            item = transformer.item(attributes);
            _.each(relationships, function (relationship, propertyName) {
                if (_.isArray(relationship.data)) {
                    item[propertyName] = _.map(relationship.data, function (ref) {
                        var resourceName = ref.type;
                        var resourceId = ref.id;
                        return new Reference_1.default(resourceName, resourceId);
                    });
                    return;
                }
                if (_.isObject(relationship.data)) {
                    var ref = relationship.data;
                    var resourceName = ref.type;
                    var resourceId = ref.id;
                    item[propertyName] = new Reference_1.default(resourceName, resourceId);
                    return;
                }
                item[propertyName] = relationship.data;
            });
            graph.setItem(resourceName, resourceId, item);
        });
        return graph;
    };
    JsonApiSerializer.prototype.extractResource = function (results, callback) {
        if (_.isArray(results)) {
            _.each(results, function (result) { return callback(result.type, result.id, result.attributes, result.relationships); });
        }
        else if (_.isObject(results)) {
            callback(results.type, results.id, results.attributes, results.relationships);
        }
    };
    return JsonApiSerializer;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JsonApiSerializer;
