import Model from "ts-core/lib/Data/Model";
import Collection from "ts-core/lib/Data/Collection";
import DataService from "../DataService/DataService";
import { MessageInterface } from "ts-validate/lib/MessageInterface";
import Validation from "ts-validate/lib/Validation";
export declare enum ActiveModelFlag {
    ACTIVATED = 0,
    CREATED = 1,
    REMOVED = 2,
}
export default class ActiveModel extends Model {
    protected _flags: Collection<ActiveModelFlag>;
    protected _dataService: DataService;
    protected _resourceName: string;
    protected _savedData: any;
    protected _errorMessages: Collection<MessageInterface>;
    protected validate(validation: Validation): Collection<MessageInterface>;
    validationHasFailed(): boolean;
    getMessages(): Collection<MessageInterface>;
    activate(dataService: DataService, resourceName: string): void;
    deactivate(): void;
    setSavedData(data: any): void;
    makeSnapshot(): void;
    markRemoved(): void;
    update(data?: any): ng.IPromise<void>;
    create(dataService: DataService, resourceName: string, data?: any): ng.IPromise<any>;
    remove(): ng.IPromise<void>;
    refresh(): ng.IPromise<boolean>;
    isActivated(): boolean;
    isCreated(): boolean;
    isRemoved(): boolean;
    isDirty(field?: string): boolean;
    isValid(field?: string): boolean;
    getResourceIdentifier(): string;
}
