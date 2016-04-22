"use strict";
var RequestHandler_1 = require("../Api/RequestHandler");
var LimitRequestHandlerPlugin = (function () {
    function LimitRequestHandlerPlugin() {
    }
    LimitRequestHandlerPlugin.prototype.execute = function (requestOptions, query) {
        if (query.hasLimit()) {
            requestOptions.param('limit', query.getLimit());
        }
        return [RequestHandler_1.RequestHandlerFeatures.LIMIT];
    };
    return LimitRequestHandlerPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LimitRequestHandlerPlugin;
