import { RequestHandler } from "./RequestHandler";
import Transformer from "./Transformer";
export interface ApiResourceInterface {
    getPrefix(): string;
    getTransformer(): Transformer;
    getSingleKey(): string;
    getMultipleKey(): string;
    getRequestHandler(): RequestHandler;
}
