import Dictionary from "ts-core/lib/Data/Dictionary";
import Exception from "ts-core/lib/Exceptions/Exception";

export default class DataServiceException extends Exception
{
    static CODE = 1;
    public sources: Dictionary<string, any> = new Dictionary<string, any>();

    public constructor(message: string, sources?: Dictionary<string, any>)
    {
        super(message, DataServiceException.CODE);

        if(sources){
            this.sources = sources;
        }
    }
}