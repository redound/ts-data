import {ModelInterface} from "ts-core/lib/Data/Model";
import Transformer from "./Transformer";

export interface ResourceInterface {

    getModel():ModelInterface;
    getTransformer():Transformer;
    getSingleKey():string;
    getMultipleKey():string;
}
