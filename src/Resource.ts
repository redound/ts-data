import Collection from "ts-core/lib/Data/Collection";
import {ModelInterface} from "ts-core/lib/Data/Model";
import RequestHandler from "./Api/RequestHandler";
import {TransformerInterface} from "./Api/Transformer";

export default class Resource {

    protected _prefix:string;
    protected _itemKeys:Collection<string> = new Collection<string>();
    protected _collectionKeys:Collection<string> = new Collection<string>();
    protected _model:ModelInterface;
    protected _requestHandler:RequestHandler;
    protected _transformer:TransformerInterface;
    protected _queryTransformer:any;

    public prefix(prefix:string):this {
        this._prefix = prefix;
        return this;
    }

    public getPrefix():string {
        return this._prefix;
    }

    public itemKey(...itemKeys:string[]):this {
        this._itemKeys.addMany(itemKeys);
        return this;
    }

    public getItemKeys():Collection<string> {
        return this._itemKeys;
    }

    public collectionKey(...collectionKeys:string[]):this {
        this._collectionKeys.addMany(collectionKeys);
        return this;
    }

    public getCollectionKeys():Collection<string> {
        return this._collectionKeys;
    }

    public requestHandler(handler:RequestHandler):this {
        this._requestHandler = handler;
        return this;
    }

    public getRequestHandler():RequestHandler {
        return this._requestHandler;
    }

    public model(model:ModelInterface):this {
        this._model = model;
        return this;
    }

    public getModel():ModelInterface {
        return this._model;
    }

    public transformer(transformer:TransformerInterface):this {
        this._transformer = transformer;
        return this;
    }

    public getTransformer():TransformerInterface {
        return this._transformer;
    }
}
