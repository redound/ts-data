import { DataSourceResponseInterface } from "./DataSourceResponseInterface";
export interface SerializerInterface {
    deserialize(resourceName: string, response: any): DataSourceResponseInterface;
}
