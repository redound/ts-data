export enum ConditionType {
    AND,
    OR
}

export enum ConditionOperator {
    IS_EQUAL,
    IS_GREATER_THAN,
    IS_GREATER_THAN_OR_EQUAL,
    IS_IN,
    IS_LESS_THAN,
    IS_LESS_THAN_OR_EQUAL,
    IS_LIKE,
    IS_NOT_EQUAL,
}

export default class Condition {

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
}
