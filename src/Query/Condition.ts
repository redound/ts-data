import Exception from "ts-core/Exceptions/Exception";
import * as _ from "underscore";

export enum ConditionType {
    AND,
    OR
}

export enum ConditionOperator {
    IS_EQUAL,
    IS_GREATER_THAN,
    IS_GREATER_THAN_OR_EQUAL,
    IS_IN,
    IS_NOT_IN,
    IS_LESS_THAN,
    IS_LESS_THAN_OR_EQUAL,
    IS_LIKE,
    IS_NOT_EQUAL,
    CONTAINS,
    NOT_CONTAINS
}

export default class Condition {

    private static VALUE_REGEX = /^["|'](?:[^("|')\\]|\\.)*["|']$/;

    public type:ConditionType;
    public field:string;
    public operator:ConditionOperator;
    public value:any;

    public constructor(type?:ConditionType, field?:string, operator?:ConditionOperator, value?:any) {

        this.type = type;
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    public getType():ConditionType {

        return this.type;
    }

    public getField() {

        return this.field;
    }

    public getOperator():ConditionOperator {

        return this.operator;
    }

    public getValue() {

        return this.value;
    }

    public static parse(type: ConditionType, conditionString: string): Condition {

        var conditionParts: string[] = conditionString.split(' ');

        if(conditionParts.length != 3){
            throw new Exception('Condition "' + conditionString + '" invalid');
        }

        var property = conditionParts.shift().trim();
        var operatorRaw = conditionParts.shift().trim().toUpperCase();
        var valueRaw = conditionParts.join(' ').trim();

        // Resolve operator
        var operator: ConditionOperator = null;

        switch(operatorRaw){

            case '===':
            case '==':
            case '=': operator = ConditionOperator.IS_EQUAL; break;
            case '<>':
            case '!==':
            case '!=': operator = ConditionOperator.IS_NOT_EQUAL; break;
            case '>': operator = ConditionOperator.IS_GREATER_THAN; break;
            case '>=': operator = ConditionOperator.IS_GREATER_THAN_OR_EQUAL; break;
            case '<': operator = ConditionOperator.IS_LESS_THAN; break;
            case '<=': operator = ConditionOperator.IS_LESS_THAN_OR_EQUAL; break;
            case 'LIKE': operator = ConditionOperator.IS_LIKE; break;
            case 'CONTAINS': operator = ConditionOperator.CONTAINS; break;
            case '!CONTAINS': operator = ConditionOperator.NOT_CONTAINS; break;
        }

        if(operator === null){
            throw new Exception('Condition "' + conditionString + '" contains invalid operator: "' + operatorRaw + '"');
        }

        // Resolve value
        var value = null;

        var stringValue: string = this.VALUE_REGEX.test(valueRaw) ? valueRaw.substring(1, valueRaw.length-1) : null;
        var numberValue: number = parseInt(valueRaw);

        if(valueRaw.toUpperCase() == 'NULL'){
            value = null;
        }
        else if(stringValue){
            value = stringValue;
        }
        else if(!_.isNaN(numberValue)){
            value = numberValue;
        }
        else {
            throw new Exception('Condition "' + conditionString + '" contains invalid formatted value: "' + valueRaw + '"');
        }

        return new Condition(type, property, operator, value);
    }
}
