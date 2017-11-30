import {DataSourceResponseInterface} from "../DataService/DataSourceResponseInterface";
import Resource from "../Resource";
import {SerializerInterface} from "../Api/SerializerInterface";
import Dictionary from "ts-core/Data/Dictionary";
import Reference from "../Graph/Reference";
import Graph from "../Graph/Graph";
import Exception from "ts-core/Exceptions/Exception";
import * as _ from "underscore";

export default class JsonApiSerializer implements SerializerInterface {

    public constructor(protected resources:Dictionary<string, Resource>) {

    }

    public deserialize(resourceName:string, response:any):DataSourceResponseInterface {

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
            references: _.map(_.isArray(data) ? data : [data], (itemData:any) => {

                return new Reference(resourceName, itemData[primaryKey]);
            })
        }
    }

    protected createGraph(data):Graph {

        var graph = new Graph();

        this.extractResource(data, (resourceName:string, resourceId:any, attributes:any, relationships:any) => {

            var resource = this.resources.get(resourceName);

            if (!resource) {
                throw new Exception('Resource `' + resourceName + '` could not be found!');
            }

            var transformer = resource.getTransformer();
            var model = resource.getModel();
            var primaryKey = model.primaryKey();

            attributes[primaryKey] = resourceId;

            var item = attributes;

            if(transformer) {
                item = transformer.item(attributes);
            }

            _.each(relationships, (relationship:any, propertyName:string) => {

                if (_.isArray(relationship.data)) {

                    item[propertyName] = _.map(relationship.data, (ref:any) => {

                        var resourceName = ref.type;
                        var resourceId = ref.id;

                        return new Reference(resourceName, resourceId);
                    });

                    return;
                }

                if (_.isObject(relationship.data)) {

                    var ref = relationship.data;
                    var resourceName = ref.type;
                    var resourceId = ref.id;

                    item[propertyName] = new Reference(resourceName, resourceId);

                    return;
                }

                item[propertyName] = relationship.data;
            });

            graph.setItem(resourceName, resourceId, item);
        });

        return graph;
    }

    protected extractResource(results, callback) {

        if (_.isArray(results)) {

            _.each(results, (result:any) => callback(result.type, result.id, result.attributes, result.relationships));

        } else if (_.isObject(results)) {

            callback(results.type, results.id, results.attributes, results.relationships);
        }
    }
}
