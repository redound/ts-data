import { DataSourceResponseInterface } from "../DataService/DataSourceResponseInterface";
export interface SerializerInterface {
    deserialize(resourceName: string, response: any): DataSourceResponseInterface;
}
