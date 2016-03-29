"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseObject_1 = require("ts-core/lib/BaseObject");
var Text_1 = require("ts-core/lib/Utils/Text");
var Transformer = (function (_super) {
    __extends(Transformer, _super);
    function Transformer() {
        _super.apply(this, arguments);
        this.availableIncludes = [];
    }
    Transformer.prototype.transformRequest = function (data) {
        return data;
    };
    Transformer.prototype.transform = function (item) {
        return item;
    };
    Transformer.prototype.collection = function (data) {
        var _this = this;
        if (!data) {
            return null;
        }
        return _.map(data, function (item) { return _this.item(item); });
    };
    Transformer.prototype.item = function (data) {
        var _this = this;
        if (!data) {
            return null;
        }
        var result = this.transform(data);
        _.each(this.availableIncludes, function (include) {
            var includeMethod = 'include' + Text_1.default.ucFirst(include);
            if (result[include] && _this[includeMethod]) {
                result[include] = _this[includeMethod](result);
            }
        });
        return result;
    };
    Transformer.collection = function (data) {
        var transformer = new this;
        return transformer.collection(data);
    };
    Transformer.item = function (data) {
        var transformer = new this;
        return transformer.item(data);
    };
    Transformer.transformRequest = function (data) {
        var transformer = new this;
        return transformer.transformRequest(data);
    };
    return Transformer;
}(BaseObject_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transformer;
