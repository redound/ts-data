import {ConditionOperator, ConditionType} from "../Query/Condition";
import RequestOptions from "../Http/RequestOptions";
import {RequestHandlerPluginInterface} from "../RequestHandlerPluginInterface";
import {RequestHandlerFeatures} from "../RequestHandler";
import Query from "../Query/Query";

export class ConditionRequestHandlerPlugin implements RequestHandlerPluginInterface {

    public queryOperators = {
        "e": ConditionOperator.IS_EQUAL,
        "gt": ConditionOperator.IS_GREATER_THAN,
        "gte": ConditionOperator.IS_GREATER_THAN_OR_EQUAL,
        "lt": ConditionOperator.IS_LESS_THAN,
        "lte": ConditionOperator.IS_LESS_THAN_OR_EQUAL,
        "l": ConditionOperator.IS_LIKE,
        "ne": ConditionOperator.IS_NOT_EQUAL
    };

    public execute(requestOptions:RequestOptions, query:Query<any>):RequestHandlerFeatures[] {

        var conditions = query.getConditions();

        var whereConditions = null;
        var orConditions:any[] = null;
        var inConditions = null;

        _.each(conditions, condition => {

            var type = condition.getType();
            var field = condition.getField();
            var operator = condition.getOperator();
            var queryOperator = this._getQueryOperator(operator);
            var value = condition.getValue();

            if (operator === ConditionOperator.IS_IN) {
                inConditions = inConditions || {};
                inConditions[field] = value;
            } else if (type === ConditionType.AND) {
                whereConditions = whereConditions || {};
                whereConditions[field] = whereConditions[field] || {};
                whereConditions[field][queryOperator] = value;
            } else if (type === ConditionType.OR) {
                orConditions = orConditions || [];
                var orCondition = {};
                orCondition[field] = {};
                orCondition[field][queryOperator] = value;
                orConditions.push(orCondition);
            }
        });

        if (inConditions) {
            requestOptions.param('in', JSON.stringify(inConditions));
        }

        if (whereConditions) {
            requestOptions.param('where', JSON.stringify(whereConditions));
        }

        if (orConditions) {
            requestOptions.param('or', JSON.stringify(orConditions));
        }

        return [RequestHandlerFeatures.CONDITIONS];
    }

    protected _getQueryOperator(operator) {

        var map = _.invert(this.queryOperators);

        return map[operator] || null;
    }
}
