"use strict";
var Collection_1 = require("ts-core/lib/Data/Collection");
var Resource = (function () {
    function Resource() {
        this._itemKeys = new Collection_1.default();
        this._collectionKeys = new Collection_1.default();
    }
    Resource.prototype.prefix = function (prefix) {
        this._prefix = prefix;
        return this;
    };
    Resource.prototype.getPrefix = function () {
        return this._prefix;
    };
    Resource.prototype.itemKey = function () {
        var itemKeys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            itemKeys[_i - 0] = arguments[_i];
        }
        this._itemKeys.addMany(itemKeys);
        return this;
    };
    Resource.prototype.getItemKeys = function () {
        return this._itemKeys;
    };
    Resource.prototype.collectionKey = function () {
        var collectionKeys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            collectionKeys[_i - 0] = arguments[_i];
        }
        this._collectionKeys.addMany(collectionKeys);
        return this;
    };
    Resource.prototype.getCollectionKeys = function () {
        return this._collectionKeys;
    };
    Resource.prototype.requestHandler = function (handler) {
        this._requestHandler = handler;
        return this;
    };
    Resource.prototype.getRequestHandler = function () {
        return this._requestHandler;
    };
    Resource.prototype.model = function (model) {
        this._model = model;
        return this;
    };
    Resource.prototype.getModel = function () {
        return this._model;
    };
    Resource.prototype.transformer = function (transformer) {
        this._transformer = transformer;
        return this;
    };
    Resource.prototype.getTransformer = function () {
        return this._transformer;
    };
    return Resource;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Resource;
