import Model from "ts-core/Data/Model";
import Collection from "ts-core/Data/Collection";
import DataService, {DataServiceResponseInterface} from "../DataService/DataService";
import Exception from "ts-core/Exceptions/Exception";
import * as _ from "underscore";

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
        this._savedData = _.clone(data);
    }

    public hasSavedData(): boolean {
        return !!this._savedData;
    }

    public makeSnapshot() {
        this.setSavedData(this.toObject());
    }

    public getChanges(recursive: boolean = false): any {

        if(!this.hasSavedData()){
            return this.toObject(recursive);
        }

        var newData = this.toObject(recursive);
        var changes = {};

        _.each(newData, (val, key) => {

            var oldVal = this._savedData[key];

            var equal = _.isObject(oldVal) && _.isObject(val) ? _.isEqual(oldVal, val) : oldVal == val;

            if(!equal){
                changes[key] = recursive ? Model.recursiveToObject(val, [this]) : val;
            }
        });

        return changes;
    }

    public markRemoved() {
        this._flags.add(ActiveModelFlag.REMOVED);
    }

    public update(data?:any):ng.IPromise<Model> {

        if (!this.isActivated()) {
            throw new Exception('Unable to update ' + this.getResourceIdentifier() + ', model is not alive');
        }

        return this._dataService.updateModel(this._resourceName, this, data).then(() => {
            return this;
        });
    }

    public create(dataService:DataService, resourceName:string, data?:any):ng.IPromise<Model> {

        return dataService.createModel(resourceName, this, data).then(() => {
            return this;
        });
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

    public invalidate():ng.IPromise<void> {

        if (!this.isActivated()) {
            throw new Exception('Unable to invalidate ' + this.getResourceIdentifier() + ', model is not alive');
        }

        return this._dataService.invalidate(this._resourceName, this.getId());
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

    public isDirty(field?:string):boolean {
        if (!this._savedData) {
            return false;
        }

        if (field) {
            return this[field] != this._savedData[field];
        }

        return !this.equals(this._savedData);
    }

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
