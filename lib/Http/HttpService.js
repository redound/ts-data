"use strict";
var _ = require("underscore");
var HttpService = (function () {
    function HttpService($http) {
        this.$http = $http;
        this.defaultHeaders = {};
    }
    HttpService.prototype.setProtocol = function (protocol) {
        this.protocol = protocol;
    };
    HttpService.prototype.setHostname = function (hostname) {
        this.hostname = hostname;
    };
    HttpService.prototype.setDefaultHeader = function (name, value) {
        this.defaultHeaders[name] = value;
    };
    HttpService.prototype.unsetDefaultHeader = function (name) {
        delete this.defaultHeaders[name];
    };
    HttpService.prototype.buildUrl = function (path, params) {
        var url = this.protocol + this.hostname + path;
        if (params) {
            url += this._encodeQueryData(params);
        }
        return url;
    };
    HttpService.prototype.request = function (requestOptions) {
        requestOptions = this._applyDefaults(requestOptions);
        var requestConfig = requestOptions.getRequestConfig();
        return this.$http(requestConfig);
    };
    HttpService.prototype._applyDefaults = function (requestOptions) {
        _.each(this.defaultHeaders, function (value, name) {
            requestOptions.header(name, value);
        });
        var relativeUrl = requestOptions.getUrl();
        requestOptions.url(this.buildUrl(relativeUrl));
        return requestOptions;
    };
    HttpService.prototype._encodeQueryData = function (data) {
        var ret = [];
        for (var d in data)
            ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        return ret.join("&");
    };
    return HttpService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HttpService;
