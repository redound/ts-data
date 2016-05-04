"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var DataServiceException = (function (_super) {
    __extends(DataServiceException, _super);
    function DataServiceException(message, sources) {
        _super.call(this, message, DataServiceException.CODE);
        this.sources = new Dictionary_1.default();
        if (sources) {
            this.sources = sources;
        }
    }
    DataServiceException.CODE = 1;
    return DataServiceException;
}(Exception_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DataServiceException;
