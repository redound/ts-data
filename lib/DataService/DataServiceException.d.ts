import Dictionary from "ts-core/lib/Data/Dictionary";
import Exception from "ts-core/lib/Exceptions/Exception";
export default class DataServiceException extends Exception {
    static CODE: number;
    sources: Dictionary<string, any>;
    constructor(message: string, sources?: Dictionary<string, any>);
}
