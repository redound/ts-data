import BaseObject from "ts-core/lib/BaseObject";
export interface TransformerInterface {
    new (): Transformer;
    item(data: any): any;
    collection(data: any): any;
}
export default class Transformer extends BaseObject {
    availableIncludes: any[];
    transformRequest(data: any): any;
    transform(item: any): any;
    collection(data: any): any[];
    item(data: any): any;
    static collection(data: any): any[];
    static item(data: any): any;
    static transformRequest(data: any): any;
}
