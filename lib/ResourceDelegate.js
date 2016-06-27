"use strict";
var ResourceDelegate = (function () {
    function ResourceDelegate(dataService, resourceName) {
        this._dataService = dataService;
        this._resourceName = resourceName;
    }
    ResourceDelegate.prototype.query = function () {
        return this._dataService.query(this._resourceName);
    };
    ResourceDelegate.prototype.all = function (includes) {
        if (includes === void 0) { includes = null; }
        return this._dataService.all(this._resourceName, includes);
    };
    ResourceDelegate.prototype.find = function (resourceId, includes) {
        if (includes === void 0) { includes = null; }
        return this._dataService.find(this._resourceName, resourceId, includes);
    };
    ResourceDelegate.prototype.create = function (data) {
        return this._dataService.create(this._resourceName, data);
    };
    ResourceDelegate.prototype.createModel = function (model, data) {
        return this._dataService.createModel(this._resourceName, model, data);
    };
    ResourceDelegate.prototype.update = function (resourceId, data) {
        return this._dataService.update(this._resourceName, resourceId, data);
    };
    ResourceDelegate.prototype.updateModel = function (model, data) {
        return this._dataService.updateModel(this._resourceName, model, data);
    };
    ResourceDelegate.prototype.remove = function (resourceId) {
        return this._dataService.remove(this._resourceName, resourceId);
    };
    ResourceDelegate.prototype.removeModel = function (model) {
        return this._dataService.removeModel(this._resourceName, model);
    };
    return ResourceDelegate;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResourceDelegate;
