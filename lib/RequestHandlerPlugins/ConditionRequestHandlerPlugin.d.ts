import { ConditionOperator } from "../Query/Condition";
import RequestOptions from "../Http/RequestOptions";
import { RequestHandlerPluginInterface } from "../Api/RequestHandlerPluginInterface";
import { RequestHandlerFeatures } from "../Api/RequestHandler";
import Query from "../Query/Query";
export default class ConditionRequestHandlerPlugin implements RequestHandlerPluginInterface {
    queryOperators: {
        "e": ConditionOperator;
        "gt": ConditionOperator;
        "gte": ConditionOperator;
        "lt": ConditionOperator;
        "lte": ConditionOperator;
        "l": ConditionOperator;
        "ne": ConditionOperator;
        "c": ConditionOperator;
        "nc": ConditionOperator;
    };
    execute(requestOptions: RequestOptions, query: Query<any>): RequestHandlerFeatures[];
    protected _getQueryOperator(operator: any): any;
}
