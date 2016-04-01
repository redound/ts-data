"use strict";
var HttpMethods_1 = require("./HttpMethods");
var _ = require("underscore");
var RequestOptions = (function () {
    function RequestOptions() {
    }
    RequestOptions.prototype.header = function (name, value) {
        this._headers = this._headers || {};
        this._headers[name] = value;
        return this;
    };
    RequestOptions.prototype.removeHeader = function (name) {
        delete this._headers[name];
        return this;
    };
    RequestOptions.prototype.getHeaders = function () {
        return this._headers;
    };
    RequestOptions.prototype.method = function (method) {
        this._method = method;
        return this;
    };
    RequestOptions.prototype.getMethod = function () {
        return this._method;
    };
    RequestOptions.prototype.url = function (url, params) {
        this._url = this._interpolateUrl(url, params);
        return this;
    };
    RequestOptions.prototype._interpolateUrl = function (url, params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        params = (params || {});
        url = url.replace(/(\(\s*|\s*\)|\s*\|\s*)/g, "");
        url = url.replace(/:([a-z]\w*)/gi, function ($0, label) {
            return (_this._popFirstKey(params, label) || "");
        });
        url = url.replace(/(^|[^:])[\/]{2,}/g, "$1/");
        url = url.replace(/\/+$/i, "");
        return url;
    };
    RequestOptions.prototype._popFirstKey = function (source, key) {
        if (source.hasOwnProperty(key)) {
            return this._popKey(source, key);
        }
    };
    RequestOptions.prototype._popKey = function (object, key) {
        var value = object[key];
        delete (object[key]);
        return (value);
    };
    RequestOptions.prototype.getUrl = function () {
        return this._url;
    };
    RequestOptions.prototype.data = function (data) {
        this._data = data;
        return this;
    };
    RequestOptions.prototype.getData = function () {
        return this._data;
    };
    RequestOptions.prototype.option = function (name, value) {
        this._options = this._options || {};
        this._options[name] = value;
        return this;
    };
    RequestOptions.prototype.getOptions = function () {
        return this._options;
    };
    RequestOptions.prototype.param = function (name, value) {
        this._params = this._params || {};
        this._params[name] = value;
        return this;
    };
    RequestOptions.prototype.getParams = function () {
        return this._params;
    };
    RequestOptions.prototype.getRequestConfig = function () {
        return _.extend({
            headers: this.getHeaders(),
            method: this.getMethod(),
            url: this.getUrl(),
            data: this.getData(),
            params: this.getParams()
        }, this.getOptions());
    };
    RequestOptions.factory = function () {
        return new RequestOptions;
    };
    RequestOptions.get = function (url, urlParams) {
        var request = new RequestOptions;
        request.method(HttpMethods_1.default.GET);
        request.url(url, urlParams);
        return request;
    };
    RequestOptions.post = function (url, urlParams, data) {
        var request = new RequestOptions;
        request.method(HttpMethods_1.default.POST);
        request.url(url, urlParams);
        request.data(data);
        return request;
    };
    RequestOptions.put = function (url, urlParams, data) {
        var request = new RequestOptions;
        request.method(HttpMethods_1.default.PUT);
        request.url(url, urlParams);
        request.data(data);
        return request;
    };
    RequestOptions.delete = function (url, urlParams) {
        var request = new RequestOptions;
        request.method(HttpMethods_1.default.DELETE);
        request.url(url, urlParams);
        return request;
    };
    return RequestOptions;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RequestOptions;
