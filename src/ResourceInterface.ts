import {ModelInterface} from "ts-core/Data/Model";
import Transformer from "./Api/Transformer";

export interface ResourceInterface {

    getModel():ModelInterface;
    getTransformer():Transformer;
    getSingleKey():string;
    getMultipleKey():string;
}
