export declare enum ConditionType {
    AND = 0,
    OR = 1,
}
export declare enum ConditionOperator {
    IS_EQUAL = 0,
    IS_GREATER_THAN = 1,
    IS_GREATER_THAN_OR_EQUAL = 2,
    IS_IN = 3,
    IS_LESS_THAN = 4,
    IS_LESS_THAN_OR_EQUAL = 5,
    IS_LIKE = 6,
    IS_NOT_EQUAL = 7,
}
export default class Condition {
    type: ConditionType;
    field: string;
    operator: ConditionOperator;
    value: any;
    constructor(type?: ConditionType, field?: string, operator?: ConditionOperator, value?: any);
    getType(): ConditionType;
    getField(): string;
    getOperator(): ConditionOperator;
    getValue(): any;
}
