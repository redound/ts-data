import Dictionary from "ts-core/lib/Data/Dictionary";
import Resource from "../Resource";
import {SerializerInterface} from "../SerializerInterface";
import {DataSourceResponseInterface} from "../DataSourceResponseInterface";
import Collection from "ts-core/lib/Data/Collection";
import Exception from "ts-core/lib/Exceptions/Exception";
import Reference from "../Graph/Reference";
import Graph from "../Graph/Graph";

export default class DefaultSerializer implements SerializerInterface {

    protected resources:Dictionary<string, Resource>;

    protected resourceAliasMap:Dictionary<string, string>;

    public constructor(resources:Dictionary<string, Resource>) {

        this.setResources(resources);
    }

    public setResources(resources:Dictionary<string, Resource>) {

        this.resources = resources;

        this.resourceAliasMap = new Dictionary<string, string>();

        this.resources.each((resourceName, resource) => {

            var itemKeys = resource.getItemKeys();
            var collectionKeys = resource.getCollectionKeys();

            itemKeys.each(key => {
                this.resourceAliasMap.set(key, resourceName);
            });

            collectionKeys.each(key => {
                this.resourceAliasMap.set(key, resourceName);
            });
        });
    }

    public deserialize(resourceName:string, response:any):DataSourceResponseInterface {

        var data = response.data;
        var total = response.data.total;

        var resource = this.resources.get(resourceName);
        var primaryKey = resource.getModel().primaryKey();
        var itemKeys = resource.getItemKeys();
        var collectionKeys = resource.getCollectionKeys();

        var keys = new Collection<string>();

        itemKeys.each(key => {
            keys.add(key);
        });

        collectionKeys.each(key => {
            keys.add(key);
        });

        var result;

        _.each(response.data, (value, key:string) => {

            if (!result && keys.contains(key)) {
                result = value;
            }
        });

        if (!result) {
            throw new Exception('No result under existing keys found');
        }

        var references;

        if (_.isArray(result)) {

            references = _.map(result, (itemData) => {
                return new Reference(resourceName, itemData[primaryKey]);
            });
        }
        else {
            references = [new Reference(resourceName, result[primaryKey])];
        }

        var meta:any = {};

        if (total) {
            meta.total = total;
        }

        return {
            meta: meta,
            graph: this.createGraph(data),
            references: references
        };
    }

    protected createGraph(data:any):Graph {

        var graph = new Graph();

        this.extractResources(null, data, (resourceName, data:any) => {

            var resource = this.resources.get(resourceName);
            var primaryKey = resource.getModel().primaryKey();
            var resourceId = data[primaryKey];

            graph.setItem(resourceName, resourceId, data);

        }, (parentResourceName, parentData, key, resourceName, data) => {

            var parentResource = this.resources.get(parentResourceName);
            var parentPrimaryKey = parentResource.getModel().primaryKey();
            var parentResourceId = parentData[parentPrimaryKey];

            var parentItem = graph.getValue([parentResourceName, parentResourceId]);

            var resource = this.resources.get(resourceName);
            var primaryKey = resource.getModel().primaryKey();

            if (_.isArray(data)) {

                parentItem[key] = _.map(data, itemData => {

                    return new Reference(resourceName, itemData[primaryKey]);
                });
            }
            else if (_.isObject(data)) {

                parentItem[key] = new Reference(resourceName, data[primaryKey]);
            }
        });

        return graph;
    }

    protected extractResources(parentResourceName:string, data:any, resourceCallback:any, referenceCallback:any) {

        _.each(data, (value:any, key:string) => {

            var resourceName = this.resourceAliasMap.get(key);

            if (!_.isArray(data) && resourceName) {

                if (_.isArray(value)) {
                    _.each(value, itemData => resourceCallback(resourceName, _.clone(itemData)));
                }
                else if (_.isObject(value)) {
                    resourceCallback(resourceName, _.clone(value));
                }

                if (parentResourceName) {
                    referenceCallback(parentResourceName, _.clone(data), key, resourceName, _.clone(value));
                }

                this.extractResources(resourceName, value, resourceCallback, referenceCallback);
            }
            else if (_.isObject(data)) {
                this.extractResources(parentResourceName, value, resourceCallback, referenceCallback);
            }
        });
    }
}
