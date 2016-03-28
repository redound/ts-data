"use strict";
var List_1 = require("ts-core/lib/Data/List");
var RequestOptions_1 = require("./Http/RequestOptions");
(function (RequestHandlerFeatures) {
    RequestHandlerFeatures[RequestHandlerFeatures["OFFSET"] = 0] = "OFFSET";
    RequestHandlerFeatures[RequestHandlerFeatures["LIMIT"] = 1] = "LIMIT";
    RequestHandlerFeatures[RequestHandlerFeatures["FIELDS"] = 2] = "FIELDS";
    RequestHandlerFeatures[RequestHandlerFeatures["CONDITIONS"] = 3] = "CONDITIONS";
    RequestHandlerFeatures[RequestHandlerFeatures["SORTERS"] = 4] = "SORTERS";
    RequestHandlerFeatures[RequestHandlerFeatures["INCLUDES"] = 5] = "INCLUDES";
})(exports.RequestHandlerFeatures || (exports.RequestHandlerFeatures = {}));
var RequestHandlerFeatures = exports.RequestHandlerFeatures;
var RequestHandler = (function () {
    function RequestHandler($q, httpService) {
        this.$q = $q;
        this.httpService = httpService;
        this._plugins = new List_1.default();
    }
    RequestHandler.prototype.setApiService = function (apiService) {
        this._apiService = apiService;
    };
    RequestHandler.prototype.getApiService = function () {
        return this._apiService;
    };
    RequestHandler.prototype.setResourceName = function (name) {
        this._resourceName = name;
    };
    RequestHandler.prototype.getResourceName = function () {
        return this._resourceName;
    };
    RequestHandler.prototype.setResource = function (resource) {
        this._resource = resource;
    };
    RequestHandler.prototype.getResource = function () {
        return this._resource;
    };
    RequestHandler.prototype.plugin = function (plugin) {
        this._plugins.add(plugin);
        return this;
    };
    RequestHandler.prototype.request = function (requestOptions) {
        var prefix = this.getResource().getPrefix();
        var relativeUrl = requestOptions.getUrl();
        requestOptions.url(prefix + relativeUrl);
        return this.httpService.request(requestOptions);
    };
    RequestHandler.prototype.execute = function (query) {
        var requestOptions = RequestOptions_1.default.get('/');
        if (query.hasFind()) {
            var id = query.getFind();
            requestOptions = RequestOptions_1.default.get('/:id', { id: id });
        }
        var allowedFeatures = [];
        this._plugins.each(function (plugin) {
            allowedFeatures.push(plugin.execute(requestOptions, query));
        });
        allowedFeatures = _.flatten(allowedFeatures);
        var usedFeatures = this._getUsedFeatures(query);
        var forbiddenFeatures = _.difference(usedFeatures, allowedFeatures);
        if (forbiddenFeatures.length > 0) {
            return this.$q.reject();
        }
        return this.request(requestOptions);
    };
    RequestHandler.prototype._getUsedFeatures = function (query) {
        var features = [];
        if (query.hasOffset()) {
            features.push(RequestHandlerFeatures.OFFSET);
        }
        if (query.hasLimit()) {
            features.push(RequestHandlerFeatures.LIMIT);
        }
        if (query.hasFields()) {
            features.push(RequestHandlerFeatures.FIELDS);
        }
        if (query.hasConditions()) {
            features.push(RequestHandlerFeatures.CONDITIONS);
        }
        if (query.hasSorters()) {
            features.push(RequestHandlerFeatures.SORTERS);
        }
        if (query.hasIncludes()) {
            features.push(RequestHandlerFeatures.INCLUDES);
        }
        return features;
    };
    RequestHandler.prototype.all = function () {
        return this.request(RequestOptions_1.default
            .get('/'));
    };
    RequestHandler.prototype.find = function (id) {
        return this.request(RequestOptions_1.default
            .get('/:id', { id: id }));
    };
    RequestHandler.prototype.create = function (data) {
        return this.request(RequestOptions_1.default
            .post('/')
            .data(data));
    };
    RequestHandler.prototype.update = function (id, data) {
        return this.request(RequestOptions_1.default
            .put('/:id', { id: id })
            .data(data));
    };
    RequestHandler.prototype.remove = function (id) {
        return this.request(RequestOptions_1.default
            .delete('/:id', { id: id }));
    };
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;
