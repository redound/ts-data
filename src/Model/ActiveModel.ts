import Model from "ts-core/lib/Data/Model";
import Collection from "ts-core/lib/Data/Collection";
import DataService, {DataServiceResponseInterface} from "../DataService";
import Exception from "ts-core/lib/Exceptions/Exception";

export enum ActiveModelFlag {
    ACTIVATED,
    CREATED,
    REMOVED
}

export default class ActiveModel extends Model {

    protected _flags:Collection<ActiveModelFlag> = new Collection<ActiveModelFlag>();

    protected _dataService:DataService;

    protected _resourceName:string;

    protected _savedData:any;

    // TODO Update TSValidate
    // protected _errorMessages:Collection<TSValidate.MessageInterface> = new TSCore.Data.Collection<TSValidate.MessageInterface>();
    //
    // protected validate(validation:TSValidate.Validation):TSCore.Data.Collection<TSValidate.MessageInterface> {
    //
    //     return this._errorMessages = validation.validate(null, this);
    // }
    //
    // public validationHasFailed():boolean {
    //
    //     if (_.isArray(this._errorMessages)) {
    //         return this._errorMessages.count() > 0;
    //     }
    //
    //     return false;
    // }
    //
    // public getMessages() {
    //
    //     return this._errorMessages;
    // }

    public activate(dataService:DataService, resourceName:string) {
        this._dataService = dataService;
        this._resourceName = resourceName;

        this._flags.addMany([ActiveModelFlag.ACTIVATED, ActiveModelFlag.CREATED]);
    }

    public deactivate() {
        this._dataService = null;
        this._resourceName = null;

        this._flags.removeMany([ActiveModelFlag.ACTIVATED]);
    }

    public setSavedData(data:any) {
        this._savedData = data;
    }

    public markRemoved() {
        this._flags.add(ActiveModelFlag.REMOVED);
    }

    public update(data?:any):ng.IPromise<void> {
        if (!this.isActivated()) {
            throw new Exception('Unable to update ' + this.getResourceIdentifier() + ', model is not alive');
        }

        return this._dataService.updateModel(this._resourceName, this, data);
    }

    public create(dataService:DataService, resourceName:string, data?:any):ng.IPromise<any> {
        return dataService.createModel(resourceName, this, data);
    }

    public remove():ng.IPromise<void> {
        if (!this.isActivated()) {
            throw new Exception('Unable to remove ' + this.getResourceIdentifier() + ', model is not alive');
        }

        return this._dataService.removeModel(this._resourceName, this);
    }

    public refresh():ng.IPromise<boolean> {
        if (!this.isActivated()) {
            throw new Exception('Unable to refresh ' + this.getResourceIdentifier() + ', model is not alive');
        }

        return this._dataService.find(this._resourceName, this.getId()).then((response:DataServiceResponseInterface<Model>) => {

            var model = response.data;

            if (model instanceof Model && !this.equals(model)) {

                this.merge(model);
                return true;
            }

            return false;

            //TODO: When the query fails because of a 404, remove the model
        });
    }

    // Flag helpers
    public isActivated():boolean {
        return this._flags.contains(ActiveModelFlag.ACTIVATED);
    }

    public isCreated():boolean {
        return this._flags.contains(ActiveModelFlag.CREATED);
    }

    public isRemoved():boolean {
        return this._flags.contains(ActiveModelFlag.REMOVED);
    }

    public isDirty(field?: string):boolean {
        if (!this._savedData) {
            return false;
        }

        if (field) {
            return this[field] != this._savedData[field];
        }

        return !this.equals(this._savedData);
    }

    public isValid() {
        return true;
    }

    // public isValid(field?:string) {
    //
    //     if (this['validation']) {
    //         var messages:TSCore.Data.Collection<TSValidate.Message> = this['validation']();
    //
    //         var valid = true;
    //
    //         if (field) {
    //
    //             messages.each(message => {
    //
    //                 if (message.getField() === field) {
    //                     valid = false;
    //                 }
    //             });
    //
    //             return valid;
    //
    //         } else {
    //
    //             return !!messages.count();
    //         }
    //     }
    //
    //     return true;
    // }

    public getResourceIdentifier():string {
        if (!this._resourceName && !this.getId()) {
            return 'unknown model';
        }

        var identifier = '';

        if (this._resourceName) {
            identifier += this._resourceName;
        }

        if (this.getId()) {
            identifier += '(' + this.getId() + ')';
        }

        return identifier;
    }
}
