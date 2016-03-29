"use strict";
var RequestHandler_1 = require("../RequestHandler");
var OffsetRequestHandlerPlugin = (function () {
    function OffsetRequestHandlerPlugin() {
    }
    OffsetRequestHandlerPlugin.prototype.execute = function (requestOptions, query) {
        if (query.hasOffset()) {
            requestOptions.param('offset', query.getOffset());
        }
        return [RequestHandler_1.RequestHandlerFeatures.OFFSET];
    };
    return OffsetRequestHandlerPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OffsetRequestHandlerPlugin;
