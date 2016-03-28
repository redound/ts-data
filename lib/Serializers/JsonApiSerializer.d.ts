import { DataSourceResponseInterface } from "../DataSourceResponseInterface";
import Resource from "../Resource";
import { SerializerInterface } from "../SerializerInterface";
import Dictionary from "ts-core/lib/Data/Dictionary";
import Graph from "../Graph/Graph";
export default class JsonApiSerializer implements SerializerInterface {
    protected resources: Dictionary<string, Resource>;
    constructor(resources: Dictionary<string, Resource>);
    deserialize(resourceName: string, response: any): DataSourceResponseInterface;
    protected createGraph(data: any): Graph;
    protected extractResource(results: any, callback: any): void;
}
