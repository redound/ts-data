"use strict";
var Reference = (function () {
    function Reference(resourceName, resourceId) {
        this.$type = "ref";
        this.value = [resourceName, resourceId];
    }
    return Reference;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Reference;
