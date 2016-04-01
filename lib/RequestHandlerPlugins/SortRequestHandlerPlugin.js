"use strict";
var RequestHandler_1 = require("../RequestHandler");
var Sorter_1 = require("../Query/Sorter");
var _ = require("underscore");
var SortRequestHandlerPlugin = (function () {
    function SortRequestHandlerPlugin() {
    }
    SortRequestHandlerPlugin.prototype.execute = function (requestOptions, query) {
        if (query.hasSorters()) {
            var sorters = query.getSorters();
            var sort = {};
            _.each(sorters, function (sorter) {
                var field = sorter.getField();
                var direction = sorter.getDirection();
                sort[field] = direction === Sorter_1.SortDirections.DESCENDING ? -1 : 1;
            });
            requestOptions.param('sort', JSON.stringify(sort));
        }
        return [RequestHandler_1.RequestHandlerFeatures.SORTERS];
    };
    return SortRequestHandlerPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SortRequestHandlerPlugin;
