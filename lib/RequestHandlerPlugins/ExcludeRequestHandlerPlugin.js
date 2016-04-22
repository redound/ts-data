"use strict";
var RequestHandler_1 = require("../Api/RequestHandler");
var ExcludeRequestHandlerPlugin = (function () {
    function ExcludeRequestHandlerPlugin() {
    }
    ExcludeRequestHandlerPlugin.prototype.execute = function (requestOptions, query) {
        if (query.hasExcludes()) {
            var excludes = query.getExcludes();
            var exclude = excludes.join(',');
            requestOptions.param('exclude', exclude);
        }
        return [RequestHandler_1.RequestHandlerFeatures.EXCLUDES];
    };
    return ExcludeRequestHandlerPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExcludeRequestHandlerPlugin;
