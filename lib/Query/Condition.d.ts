export declare enum ConditionType {
    AND = 0,
    OR = 1,
}
export declare enum ConditionOperator {
    IS_EQUAL = 0,
    IS_GREATER_THAN = 1,
    IS_GREATER_THAN_OR_EQUAL = 2,
    IS_IN = 3,
    IS_NOT_IN = 4,
    IS_LESS_THAN = 5,
    IS_LESS_THAN_OR_EQUAL = 6,
    IS_LIKE = 7,
    IS_NOT_EQUAL = 8,
    CONTAINS = 9,
    NOT_CONTAINS = 10,
}
export default class Condition {
    private static VALUE_REGEX;
    type: ConditionType;
    field: string;
    operator: ConditionOperator;
    value: any;
    constructor(type?: ConditionType, field?: string, operator?: ConditionOperator, value?: any);
    getType(): ConditionType;
    getField(): string;
    getOperator(): ConditionOperator;
    getValue(): any;
    static parse(type: ConditionType, conditionString: string): Condition;
}
