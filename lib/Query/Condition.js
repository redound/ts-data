"use strict";
(function (ConditionType) {
    ConditionType[ConditionType["AND"] = 0] = "AND";
    ConditionType[ConditionType["OR"] = 1] = "OR";
})(exports.ConditionType || (exports.ConditionType = {}));
var ConditionType = exports.ConditionType;
(function (ConditionOperator) {
    ConditionOperator[ConditionOperator["IS_EQUAL"] = 0] = "IS_EQUAL";
    ConditionOperator[ConditionOperator["IS_GREATER_THAN"] = 1] = "IS_GREATER_THAN";
    ConditionOperator[ConditionOperator["IS_GREATER_THAN_OR_EQUAL"] = 2] = "IS_GREATER_THAN_OR_EQUAL";
    ConditionOperator[ConditionOperator["IS_IN"] = 3] = "IS_IN";
    ConditionOperator[ConditionOperator["IS_LESS_THAN"] = 4] = "IS_LESS_THAN";
    ConditionOperator[ConditionOperator["IS_LESS_THAN_OR_EQUAL"] = 5] = "IS_LESS_THAN_OR_EQUAL";
    ConditionOperator[ConditionOperator["IS_LIKE"] = 6] = "IS_LIKE";
    ConditionOperator[ConditionOperator["IS_NOT_EQUAL"] = 7] = "IS_NOT_EQUAL";
})(exports.ConditionOperator || (exports.ConditionOperator = {}));
var ConditionOperator = exports.ConditionOperator;
var Condition = (function () {
    function Condition(type, field, operator, value) {
        this.type = type;
        this.field = field;
        this.operator = operator;
        this.value = value;
    }
    Condition.prototype.getType = function () {
        return this.type;
    };
    Condition.prototype.getField = function () {
        return this.field;
    };
    Condition.prototype.getOperator = function () {
        return this.operator;
    };
    Condition.prototype.getValue = function () {
        return this.value;
    };
    return Condition;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Condition;
