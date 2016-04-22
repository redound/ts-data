import Collection from "ts-core/lib/Data/Collection";
import { ModelInterface } from "ts-core/lib/Data/Model";
import RequestHandler from "./Api/RequestHandler";
import { TransformerInterface } from "./Api/Transformer";
export default class Resource {
    protected _prefix: string;
    protected _itemKeys: Collection<string>;
    protected _collectionKeys: Collection<string>;
    protected _model: ModelInterface;
    protected _requestHandler: RequestHandler;
    protected _transformer: TransformerInterface;
    protected _queryTransformer: any;
    prefix(prefix: string): this;
    getPrefix(): string;
    itemKey(...itemKeys: string[]): this;
    getItemKeys(): Collection<string>;
    collectionKey(...collectionKeys: string[]): this;
    getCollectionKeys(): Collection<string>;
    requestHandler(handler: RequestHandler): this;
    getRequestHandler(): RequestHandler;
    model(model: ModelInterface): this;
    getModel(): ModelInterface;
    transformer(transformer: TransformerInterface): this;
    getTransformer(): TransformerInterface;
}
