"use strict";
(function (SortDirections) {
    SortDirections[SortDirections["ASCENDING"] = 0] = "ASCENDING";
    SortDirections[SortDirections["DESCENDING"] = 1] = "DESCENDING";
})(exports.SortDirections || (exports.SortDirections = {}));
var SortDirections = exports.SortDirections;
var Sorter = (function () {
    function Sorter(field, direction) {
        this.field = field;
        this.direction = direction;
    }
    Sorter.prototype.getField = function () {
        return this.field;
    };
    Sorter.prototype.getDirection = function () {
        return this.direction;
    };
    return Sorter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Sorter;
