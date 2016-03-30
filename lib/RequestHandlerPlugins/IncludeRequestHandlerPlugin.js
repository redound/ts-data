"use strict";
var RequestHandler_1 = require("../RequestHandler");
var IncludeRequestHandlerPlugin = (function () {
    function IncludeRequestHandlerPlugin() {
    }
    IncludeRequestHandlerPlugin.prototype.execute = function (requestOptions, query) {
        if (query.hasIncludes()) {
            var includes = query.getIncludes();
            var include = includes.join(',');
            requestOptions.param('include', include);
        }
        return [RequestHandler_1.RequestHandlerFeatures.INCLUDES];
    };
    return IncludeRequestHandlerPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IncludeRequestHandlerPlugin;
