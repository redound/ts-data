"use strict";
var Logger_1 = require("ts-core/lib/Logger/Logger");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var ApiDataSource = (function () {
    function ApiDataSource($q, apiService, serializer, logger) {
        this.$q = $q;
        this.apiService = apiService;
        this.serializer = serializer;
        this.logger = logger;
        this.logger = (this.logger || new Logger_1.default()).child('ApiDataSource');
    }
    ApiDataSource.prototype.getIdentifier = function () {
        return ApiDataSource.IDENTIFIER;
    };
    ApiDataSource.prototype.setDataService = function (service) {
        this._dataService = service;
    };
    ApiDataSource.prototype.getDataService = function () {
        return this._dataService;
    };
    ApiDataSource.prototype.execute = function (query) {
        var _this = this;
        this.logger.info('execute', query);
        var resourceName = query.getFrom();
        return this.apiService
            .execute(query)
            .then(function (response) { return _this._transformResponse(resourceName, response); });
    };
    ApiDataSource.prototype.create = function (resourceName, data) {
        var _this = this;
        this.logger.info('create');
        data = this._transformRequest(resourceName, data);
        return this.apiService
            .create(resourceName, data)
            .then(function (response) { return _this._transformResponse(resourceName, response); });
    };
    ApiDataSource.prototype.update = function (resourceName, resourceId, data) {
        var _this = this;
        this.logger.info('update');
        data = this._transformRequest(resourceName, data);
        return this.apiService
            .update(resourceName, resourceId, data)
            .then(function (response) { return _this._transformResponse(resourceName, response); });
    };
    ApiDataSource.prototype.remove = function (resourceName, resourceId) {
        this.logger.info('remove');
        return this.apiService.remove(resourceName, resourceId);
    };
    ApiDataSource.prototype.notifyExecute = function (query, response) {
        this.logger.info('notifyExecute - query ', query, ' - response', response);
        return this.$q.when();
    };
    ApiDataSource.prototype.notifyCreate = function (response) {
        this.logger.info('notifyCreate - response', response);
        return this.$q.when();
    };
    ApiDataSource.prototype.notifyUpdate = function (response) {
        this.logger.info('notifyUpdate - response', response);
        return this.$q.when();
    };
    ApiDataSource.prototype.notifyRemove = function (response) {
        this.logger.info('notifyRemove - response', response);
        return this.$q.when();
    };
    ApiDataSource.prototype.clear = function () {
        return this.$q.when();
    };
    ApiDataSource.prototype._transformRequest = function (resourceName, data) {
        var resource = this.getDataService().getResource(resourceName);
        if (!resource) {
            throw new Exception_1.default('Resource `' + resourceName + '` could not be found!');
        }
        var transformer = resource.getTransformer();
        return transformer ? transformer.transformRequest(data) : data;
    };
    ApiDataSource.prototype._transformResponse = function (resourceName, response) {
        return this.serializer.deserialize(resourceName, response);
    };
    ApiDataSource.IDENTIFIER = "api";
    return ApiDataSource;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApiDataSource;
