"use strict";
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var _ = require("underscore");
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
    ConditionOperator[ConditionOperator["IS_NOT_IN"] = 4] = "IS_NOT_IN";
    ConditionOperator[ConditionOperator["IS_LESS_THAN"] = 5] = "IS_LESS_THAN";
    ConditionOperator[ConditionOperator["IS_LESS_THAN_OR_EQUAL"] = 6] = "IS_LESS_THAN_OR_EQUAL";
    ConditionOperator[ConditionOperator["IS_LIKE"] = 7] = "IS_LIKE";
    ConditionOperator[ConditionOperator["IS_NOT_EQUAL"] = 8] = "IS_NOT_EQUAL";
    ConditionOperator[ConditionOperator["CONTAINS"] = 9] = "CONTAINS";
    ConditionOperator[ConditionOperator["NOT_CONTAINS"] = 10] = "NOT_CONTAINS";
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
    Condition.parse = function (type, conditionString) {
        var conditionParts = conditionString.split(' ');
        if (conditionParts.length != 3) {
            throw new Exception_1.default('Condition "' + conditionString + '" invalid');
        }
        var property = conditionParts.shift().trim();
        var operatorRaw = conditionParts.shift().trim().toUpperCase();
        var valueRaw = conditionParts.join(' ').trim();
        var operator = null;
        switch (operatorRaw) {
            case '===':
            case '==':
            case '=':
                operator = ConditionOperator.IS_EQUAL;
                break;
            case '<>':
            case '!==':
            case '!=':
                operator = ConditionOperator.IS_NOT_EQUAL;
                break;
            case '>':
                operator = ConditionOperator.IS_GREATER_THAN;
                break;
            case '>=':
                operator = ConditionOperator.IS_GREATER_THAN_OR_EQUAL;
                break;
            case '<':
                operator = ConditionOperator.IS_LESS_THAN;
                break;
            case '<=':
                operator = ConditionOperator.IS_LESS_THAN_OR_EQUAL;
                break;
            case 'LIKE':
                operator = ConditionOperator.IS_LIKE;
                break;
            case 'CONTAINS':
                operator = ConditionOperator.CONTAINS;
                break;
            case '!CONTAINS':
                operator = ConditionOperator.NOT_CONTAINS;
                break;
        }
        if (operator === null) {
            throw new Exception_1.default('Condition "' + conditionString + '" contains invalid operator: "' + operatorRaw + '"');
        }
        var value = null;
        var stringValue = this.VALUE_REGEX.test(valueRaw) ? valueRaw.substring(1, valueRaw.length - 1) : null;
        var numberValue = parseInt(valueRaw);
        if (valueRaw.toUpperCase() == 'NULL') {
            value = null;
        }
        else if (stringValue) {
            value = stringValue;
        }
        else if (!_.isNaN(numberValue)) {
            value = numberValue;
        }
        else {
            throw new Exception_1.default('Condition "' + conditionString + '" contains invalid formatted value: "' + valueRaw + '"');
        }
        return new Condition(type, property, operator, value);
    };
    Condition.VALUE_REGEX = /^["|'](?:[^("|')\\]|\\.)*["|']$/;
    return Condition;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Condition;
