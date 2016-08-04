"use strict";
var List_1 = require("ts-core/lib/Data/List");
var ResourceDelegate_1 = require("../ResourceDelegate");
var Model_1 = require("ts-core/lib/Data/Model");
var DataServiceException_1 = require("./DataServiceException");
var Exception_1 = require("ts-core/lib/Exceptions/Exception");
var Query_1 = require("../Query/Query");
var ModelList_1 = require("ts-core/lib/Data/ModelList");
var ActiveModel_1 = require("../Model/ActiveModel");
var _ = require("underscore");
var Dictionary_1 = require("ts-core/lib/Data/Dictionary");
var DataService = (function () {
    function DataService($q) {
        this.$q = $q;
        this.updateFullModel = false;
        this.updateRelations = false;
        this._sources = new List_1.default();
        this._resources = new Dictionary_1.default();
        this._resourceDelegateCache = new Dictionary_1.default();
    }
    DataService.prototype.source = function (source) {
        this._sources.add(source);
        source.setDataService(this);
        return this;
    };
    DataService.prototype.getSources = function () {
        return this._sources.clone();
    };
    DataService.prototype.setResources = function (resources) {
        this._resources = resources.clone();
        return this;
    };
    DataService.prototype.resource = function (name, resource) {
        this._resources.set(name, resource);
        return this;
    };
    DataService.prototype.getResources = function () {
        return this._resources.clone();
    };
    DataService.prototype.getResource = function (name) {
        return this._resources.get(name);
    };
    DataService.prototype.getResourceAsync = function (name) {
        var deferred = this.$q.defer();
        var resource = this._resources.get(name);
        if (!resource) {
            throw new Exception_1.default('Resource `' + name + '` cannot be found');
        }
        deferred.resolve(resource);
        return deferred.promise;
    };
    DataService.prototype.getResourceDelegate = function (resourceName) {
        if (this._resourceDelegateCache.contains(resourceName)) {
            return this._resourceDelegateCache.get(resourceName);
        }
        var delegate = new ResourceDelegate_1.default(this, resourceName);
        this._resourceDelegateCache.set(resourceName, delegate);
        return delegate;
    };
    DataService.prototype.query = function (resourceName) {
        return new Query_1.default(this).from(resourceName);
    };
    DataService.prototype.all = function (resourceName, includes) {
        if (includes === void 0) { includes = null; }
        var query = this.query(resourceName);
        if (includes) {
            query.multipleIncludes(includes);
        }
        return this.execute(query).then(function (response) {
            return response.data;
        });
    };
    DataService.prototype.find = function (resourceName, resourceId, includes) {
        if (includes === void 0) { includes = null; }
        var query = this.query(resourceName).find(resourceId);
        if (includes) {
            query.multipleIncludes(includes);
        }
        return this.execute(query).then(function (response) {
            return response.data.first();
        });
    };
    DataService.prototype.execute = function (query) {
        var _this = this;
        var response;
        return this._executeSources(function (source) {
            return source.execute(query);
        })
            .then(function (result) {
            response = result.response;
            var sourceIndex = _this._sources.indexOf(result.source);
            if (sourceIndex === 0) {
                return _this.$q.when();
            }
            return _this._notifySources(sourceIndex - 1, function (source) {
                return source.notifyExecute(query, response);
            });
        })
            .then(function () {
            return {
                response: response,
                data: _this._createModels(response)
            };
        });
    };
    DataService.prototype.invalidate = function (resourceName, resourceId) {
        return this._callInSources(function (source) {
            return source.invalidate(resourceName, resourceId);
        });
    };
    DataService.prototype.invalidateQuery = function (query) {
        return this._callInSources(function (source) {
            return source.invalidateQuery(query);
        });
    };
    DataService.prototype._createModels = function (response) {
        var _this = this;
        var graph = response.graph;
        var references = response.references;
        var models = new ModelList_1.default();
        _.each(references, function (reference) {
            var resolveModel = graph.get(reference.value, function (resourceName, item) {
                var resource = _this.getResource(resourceName);
                var modelClass = resource.getModel();
                var model = new modelClass(item);
                if (model instanceof ActiveModel_1.default) {
                    model.activate(_this, resourceName);
                    model.setSavedData(item);
                }
                return model;
            });
            if (resolveModel) {
                models.add(resolveModel);
            }
        });
        return models;
    };
    DataService.prototype.create = function (resourceName, data) {
        var _this = this;
        return this._executeCreate(resourceName, data).then(function (response) {
            return {
                response: response,
                data: _this._createModels(response).get(0) || null
            };
        });
    };
    DataService.prototype.createModel = function (resourceName, model, data) {
        var _this = this;
        var sendData = data || model.toObject(true);
        return this._executeCreate(resourceName, sendData).then(function (response) {
            var responseData = sendData;
            if (response.references.length == 1) {
                var reference = response.references[0];
                responseData = response.graph.get(reference.value);
            }
            model = DataService._updateModel(model, responseData);
            if (model instanceof ActiveModel_1.default) {
                model.activate(_this, resourceName);
            }
            return {
                response: response,
                data: model
            };
        });
    };
    DataService.prototype._executeCreate = function (resourceName, data) {
        var _this = this;
        var response;
        return this
            ._executeSources(function (source) {
            return source.create(resourceName, data);
        })
            .then(function (result) {
            response = result.response;
            var sourceIndex = _this._sources.indexOf(result.source);
            if (sourceIndex === 0) {
                return _this.$q.when();
            }
            return _this._notifySources(sourceIndex - 1, function (source) {
                return source.notifyCreate(response);
            });
        })
            .then(function () {
            return response;
        });
    };
    DataService.prototype.update = function (resourceName, resourceId, data) {
        var _this = this;
        return this._executeUpdate(resourceName, resourceId, data).then(function (response) {
            return {
                response: response,
                data: _this._createModels(response)[0] || null
            };
        });
    };
    DataService.prototype.updateModel = function (resourceName, model, data) {
        var recursive = this.updateRelations;
        if (!this.updateFullModel && model instanceof ActiveModel_1.default) {
            if (!data && model.hasSavedData()) {
                data = model.getChanges(recursive);
            }
        }
        if (!data) {
            data = model.toObject(recursive);
        }
        if (!this.updateRelations) {
            _.each(_.clone(data), function (val, key) {
                _.each(_.isArray(val) ? val : [val], function (valItem) {
                    if (valItem instanceof Model_1.default) {
                        delete data[key];
                    }
                });
            });
        }
        if (_.keys(data).length == 0) {
            return this.$q.when();
        }
        return this._executeUpdate(resourceName, model.getId(), data).then(function (results) {
            var data = null;
            if (results.references.length == 1) {
                var reference = results.references[0];
                data = results.graph.get(reference.value);
            }
            if (data) {
                DataService._updateModel(model, data);
            }
            return null;
        });
    };
    DataService.prototype.setUpdateSendsFullModel = function (fullModel) {
        this.updateFullModel = fullModel;
        return this;
    };
    DataService.prototype.setUpdateSendsRelations = function (relations) {
        this.updateRelations = relations;
        return this;
    };
    DataService.prototype._executeUpdate = function (resourceName, resourceId, data) {
        var _this = this;
        var response;
        return this
            ._executeSources(function (source) {
            return source.update(resourceName, resourceId, data);
        })
            .then(function (result) {
            response = result.response;
            var sourceIndex = _this._sources.indexOf(result.source);
            if (sourceIndex === 0) {
                return _this.$q.when();
            }
            return _this._notifySources(sourceIndex - 1, function (source) {
                return source.notifyUpdate(response);
            });
        })
            .then(function () {
            return response;
        });
    };
    DataService.prototype.remove = function (resourceName, resourceId) {
        return this._executeRemove(resourceName, resourceId).then(function () {
            return null;
        });
    };
    DataService.prototype.removeModel = function (resourceName, model) {
        return this._executeRemove(resourceName, model.getId()).then(function () {
            DataService._removeModel(model);
            return null;
        });
    };
    DataService.prototype._executeRemove = function (resourceName, resourceId) {
        var _this = this;
        var response;
        return this
            ._executeSources(function (source) {
            return source.remove(resourceName, resourceId);
        })
            .then(function (result) {
            response = result.response;
            var sourceIndex = _this._sources.indexOf(result.source);
            if (sourceIndex === 0) {
                return _this.$q.when();
            }
            return _this._notifySources(sourceIndex - 1, function (source) {
                return source.notifyRemove(response);
            });
        })
            .then(function () {
            return response;
        });
    };
    DataService.prototype._callInSources = function (executor) {
        var promises = [];
        this._sources.each(function (source) {
            promises.push(executor(source));
        });
        return this.$q.all(promises);
    };
    DataService.prototype._notifySources = function (startIndex, executor) {
        var promises = [];
        for (var sourceIndex = startIndex; sourceIndex >= 0; sourceIndex--) {
            var source = this._sources.get(sourceIndex);
            promises.push(executor(source));
        }
        return this.$q.all(promises);
    };
    DataService.prototype._executeSources = function (executor) {
        var _this = this;
        var sourceIndex = 0;
        var sourceErrors = new Dictionary_1.default();
        var deferred = this.$q.defer();
        var nextSource = function () {
            if (sourceIndex >= _this._sources.count()) {
                deferred.reject(new DataServiceException_1.default('No datasources are able to fulfill the request', sourceErrors));
                return;
            }
            var source = _this._sources.get(sourceIndex);
            executor(source)
                .then(function (response) { return deferred.resolve({
                response: response,
                source: source
            }); })
                .catch(function (error) {
                sourceErrors.set(source.getIdentifier(), error);
                nextSource();
            });
            sourceIndex++;
        };
        nextSource();
        return deferred.promise;
    };
    DataService._updateModel = function (model, data) {
        model.assignAll(data);
        if (model instanceof ActiveModel_1.default) {
            model.makeSnapshot();
        }
        return model;
    };
    DataService._removeModel = function (model) {
        if (model instanceof ActiveModel_1.default) {
            model.setSavedData(null);
            model.markRemoved();
            model.deactivate();
        }
        return model;
    };
    return DataService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DataService;
