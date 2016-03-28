"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Model_1 = require("ts-core/lib/Data/Model");
var Collection_1 = require("ts-core/lib/Data/Collection");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
(function (ActiveModelFlag) {
    ActiveModelFlag[ActiveModelFlag["ACTIVATED"] = 0] = "ACTIVATED";
    ActiveModelFlag[ActiveModelFlag["CREATED"] = 1] = "CREATED";
    ActiveModelFlag[ActiveModelFlag["REMOVED"] = 2] = "REMOVED";
})(exports.ActiveModelFlag || (exports.ActiveModelFlag = {}));
var ActiveModelFlag = exports.ActiveModelFlag;
var ActiveModel = (function (_super) {
    __extends(ActiveModel, _super);
    function ActiveModel() {
        _super.apply(this, arguments);
        this._flags = new Collection_1.default();
    }
    ActiveModel.prototype.activate = function (dataService, resourceName) {
        this._dataService = dataService;
        this._resourceName = resourceName;
        this._flags.addMany([ActiveModelFlag.ACTIVATED, ActiveModelFlag.CREATED]);
    };
    ActiveModel.prototype.deactivate = function () {
        this._dataService = null;
        this._resourceName = null;
        this._flags.removeMany([ActiveModelFlag.ACTIVATED]);
    };
    ActiveModel.prototype.setSavedData = function (data) {
        this._savedData = data;
    };
    ActiveModel.prototype.markRemoved = function () {
        this._flags.add(ActiveModelFlag.REMOVED);
    };
    ActiveModel.prototype.update = function (data) {
        if (!this.isActivated()) {
            throw new Exception_1.default('Unable to update ' + this.getResourceIdentifier() + ', model is not alive');
        }
        return this._dataService.updateModel(this._resourceName, this, data);
    };
    ActiveModel.prototype.create = function (dataService, resourceName, data) {
        return dataService.createModel(resourceName, this, data);
    };
    ActiveModel.prototype.remove = function () {
        if (!this.isActivated()) {
            throw new Exception_1.default('Unable to remove ' + this.getResourceIdentifier() + ', model is not alive');
        }
        return this._dataService.removeModel(this._resourceName, this);
    };
    ActiveModel.prototype.refresh = function () {
        var _this = this;
        if (!this.isActivated()) {
            throw new Exception_1.default('Unable to refresh ' + this.getResourceIdentifier() + ', model is not alive');
        }
        return this._dataService.find(this._resourceName, this.getId()).then(function (response) {
            var model = response.data;
            if (model instanceof Model_1.default && !_this.equals(model)) {
                _this.merge(model);
                return true;
            }
            return false;
        });
    };
    ActiveModel.prototype.isActivated = function () {
        return this._flags.contains(ActiveModelFlag.ACTIVATED);
    };
    ActiveModel.prototype.isCreated = function () {
        return this._flags.contains(ActiveModelFlag.CREATED);
    };
    ActiveModel.prototype.isRemoved = function () {
        return this._flags.contains(ActiveModelFlag.REMOVED);
    };
    ActiveModel.prototype.isDirty = function () {
        return !this._savedData || !this.equals(this._savedData);
    };
    ActiveModel.prototype.getResourceIdentifier = function () {
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
    };
    return ActiveModel;
}(Model_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ActiveModel;
