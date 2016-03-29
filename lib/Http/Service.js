"use strict";
var Service = (function () {
    function Service($http) {
        this.$http = $http;
        this.defaultHeaders = {};
    }
    Service.prototype.setProtocol = function (protocol) {
        this.protocol = protocol;
    };
    Service.prototype.setHostname = function (hostname) {
        this.hostname = hostname;
    };
    Service.prototype.setDefaultHeader = function (name, value) {
        this.defaultHeaders[name] = value;
    };
    Service.prototype.unsetDefaultHeader = function (name) {
        delete this.defaultHeaders[name];
    };
    Service.prototype.request = function (requestOptions) {
        requestOptions = this._applyDefaults(requestOptions);
        var requestConfig = requestOptions.getRequestConfig();
        return this.$http(requestConfig);
    };
    Service.prototype._applyDefaults = function (requestOptions) {
        _.each(this.defaultHeaders, function (value, name) {
            requestOptions.header(name, value);
        });
        var relativeUrl = requestOptions.getUrl();
        requestOptions.url(this.protocol + this.hostname + relativeUrl);
        return requestOptions;
    };
    return Service;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Service;
