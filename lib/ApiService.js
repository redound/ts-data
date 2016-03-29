"use strict";
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var ApiService = (function () {
    function ApiService($q) {
        this.$q = $q;
        this._resources = new Dictionary_1.default();
    }
    ApiService.prototype.setResources = function (resources) {
        var _this = this;
        this._resources = resources.clone();
        this._resources.each(function (resourceName, resource) {
            var requestHandler = resource.getRequestHandler();
            if (requestHandler) {
                requestHandler.setApiService(_this);
                requestHandler.setResourceName(resourceName);
                requestHandler.setResource(resource);
            }
        });
        return this;
    };
    ApiService.prototype.resource = function (name, resource) {
        this._resources.set(name, resource);
        return this;
    };
    ApiService.prototype.getResource = function (name) {
        return this._resources.get(name);
    };
    ApiService.prototype.getResourceAsync = function (name) {
        var deferred = this.$q.defer();
        var resource = this._resources.get(name);
        if (!resource) {
            throw new Exception_1.default('Resource `' + name + '` cannot be found');
        }
        deferred.resolve(resource);
        return deferred.promise;
    };
    ApiService.prototype.getRequestHandler = function (resourceName) {
        var resource = this._resources.get(resourceName);
        if (!resource) {
            return null;
        }
        return resource.getRequestHandler();
    };
    ApiService.prototype.getRequestHandlerAsync = function (resourceName) {
        return this.getResourceAsync(resourceName).then(function (resource) {
            return resource.getRequestHandler();
        });
    };
    ApiService.prototype.execute = function (query) {
        var resourceName = query.getFrom();
        return this.getRequestHandlerAsync(resourceName).then(function (requestHandler) {
            return requestHandler.execute(query);
        });
    };
    ApiService.prototype.all = function (resourceName) {
        return this.getRequestHandlerAsync(resourceName).then(function (requestHandler) {
            return requestHandler.all();
        });
    };
    ApiService.prototype.find = function (resourceName, resourceId) {
        return this.getRequestHandlerAsync(resourceName).then(function (requestHandler) {
            return requestHandler.find(resourceId);
        });
    };
    ApiService.prototype.create = function (resourceName, data) {
        return this.getRequestHandlerAsync(resourceName).then(function (requestHandler) {
            return requestHandler.create(data);
        });
    };
    ApiService.prototype.update = function (resourceName, resourceId, data) {
        return this.getRequestHandlerAsync(resourceName).then(function (requestHandler) {
            return requestHandler.update(resourceId, data);
        });
    };
    ApiService.prototype.remove = function (resourceName, resourceId) {
        return this.getRequestHandlerAsync(resourceName).then(function (requestHandler) {
            return requestHandler.remove(resourceId);
        });
    };
    return ApiService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApiService;
