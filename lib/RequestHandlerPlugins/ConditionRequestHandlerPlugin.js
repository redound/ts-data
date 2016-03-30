"use strict";
var Condition_1 = require("../Query/Condition");
var RequestHandler_1 = require("../RequestHandler");
var ConditionRequestHandlerPlugin = (function () {
    function ConditionRequestHandlerPlugin() {
        this.queryOperators = {
            "e": Condition_1.ConditionOperator.IS_EQUAL,
            "gt": Condition_1.ConditionOperator.IS_GREATER_THAN,
            "gte": Condition_1.ConditionOperator.IS_GREATER_THAN_OR_EQUAL,
            "lt": Condition_1.ConditionOperator.IS_LESS_THAN,
            "lte": Condition_1.ConditionOperator.IS_LESS_THAN_OR_EQUAL,
            "l": Condition_1.ConditionOperator.IS_LIKE,
            "ne": Condition_1.ConditionOperator.IS_NOT_EQUAL
        };
    }
    ConditionRequestHandlerPlugin.prototype.execute = function (requestOptions, query) {
        var _this = this;
        var conditions = query.getConditions();
        var whereConditions = null;
        var orConditions = null;
        var inConditions = null;
        _.each(conditions, function (condition) {
            var type = condition.getType();
            var field = condition.getField();
            var operator = condition.getOperator();
            var queryOperator = _this._getQueryOperator(operator);
            var value = condition.getValue();
            if (operator === Condition_1.ConditionOperator.IS_IN) {
                inConditions = inConditions || {};
                inConditions[field] = value;
            }
            else if (type === Condition_1.ConditionType.AND) {
                whereConditions = whereConditions || {};
                whereConditions[field] = whereConditions[field] || {};
                whereConditions[field][queryOperator] = value;
            }
            else if (type === Condition_1.ConditionType.OR) {
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
        return [RequestHandler_1.RequestHandlerFeatures.CONDITIONS];
    };
    ConditionRequestHandlerPlugin.prototype._getQueryOperator = function (operator) {
        var map = _.invert(this.queryOperators);
        return map[operator] || null;
    };
    return ConditionRequestHandlerPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConditionRequestHandlerPlugin;
