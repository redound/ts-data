import Dictionary from "ts-core/lib/Data/Dictionary";
import Resource from "../Resource";
import { SerializerInterface } from "../SerializerInterface";
import { DataSourceResponseInterface } from "../DataSourceResponseInterface";
import Graph from "../Graph/Graph";
export default class DefaultSerializer implements SerializerInterface {
    protected resources: Dictionary<string, Resource>;
    protected resourceAliasMap: Dictionary<string, string>;
    constructor(resources: Dictionary<string, Resource>);
    setResources(resources: Dictionary<string, Resource>): void;
    deserialize(resourceName: string, response: any): DataSourceResponseInterface;
    protected createGraph(data: any): Graph;
    protected extractResources(parentResourceName: string, data: any, resourceCallback: any, referenceCallback: any): void;
}
