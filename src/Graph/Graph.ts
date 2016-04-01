import Reference from "./Reference";
import * as _ from "underscore";


export default class Graph {

    protected _data:any;

    public constructor(data?) {
        this._data = data || {};
    }

    public clear() {
        this._data = {};
    }

    public setData(data:any) {
        this._data = data;
    }

    public getData():any {
        return this._data;
    }

    public get(path?:any[], callback?:any) {

        path = this._optimizePath(path);

        var value = this._getValueForPath(path);

        function getAtEndIndex(path, index) {
            path = _.clone(path) || [];
            path.reverse();
            return path[index] || null;
        }

        var parentKey = getAtEndIndex(path, 1);
        var key = getAtEndIndex(path, 0);

        return this._resolveValueRecursive(parentKey, key, value, callback);
    }

    public setValue() {

    }

    public getValue(path?:any[]) {

        path = this._optimizePath(path);

        return this._getValueForPath(path);
    }

    public getGraphForPath(path:any[]):Graph {

        var graph = new Graph();
        var value = this.getValue(path);

        this._extractReferences(value, reference => {

            var referencePath = reference.value;
            var referenceValue = this.getValue(referencePath);

            if (referenceValue) {
                graph.set(referencePath, referenceValue);
            }
        });

        if (value) {
            graph.set(path, value);
        }

        return graph;
    }

    public getGraphForReferences(references:Reference[]):Graph {

        var graph = new Graph;

        _.each(references, reference => {

            var pathGraph = this.getGraphForPath(reference.value);
            graph.merge(pathGraph);
        });

        return graph;
    }

    public _getValueForPath(path) {

        var root = path ? this._data : null;
        var pathLength = path && path.length ? path.length : 0;

        for (var i = 0; i < pathLength; i++) {

            var part = path[i];

            if (root[part] !== void 0) {
                root = root[part];
            } else {
                root = null;
                break;
            }
        }

        return root;
    }

    protected _optimizePath(path?:any[]):any[] {

        if (!path) {
            return null;
        }

        var root = this._data;

        for (var i = 0; i < path.length; i++) {

            var part = path[i];
            var end = path.slice(i + 1, path.length);

            if (root[part] === void 0) {
                root = null;
                break;
            }

            root = root[part];

            if (this._isReference(root)) {
                var optimizedPath = root.value.concat(end);
                return this._optimizePath(optimizedPath);
            }
        }

        return root ? path : null;
    }

    public set(path:any[], value:any) {

        var originalPath = path;

        path = this._optimizePath(path);

        if (!path) {
            path = originalPath;
        }

        if (path && path.length) {

            var root = this._data;

            for (var i = 0; i < path.length; i++) {

                var part = path[i];

                if (root[part] === void 0 && i !== path.length - 1) {
                    root[part] = {};
                }

                if (i === path.length - 1) {
                    root[part] = value;
                }

                root = root[part];
            }

            return this;
        }

        this._data = value;

        return this;
    }

    public unset(path:any[]) {

        path = this._optimizePath(path);

        if (path && path.length) {

            var root = this._data;

            for (var i = 0; i < path.length; i++) {

                var part = path[i];

                if (i === path.length - 1) {
                    delete root[part];
                }

                root = root[part];
            }
        }

        return this;
    }

    public hasItem(resourceName:string, resourceId:any):boolean {
        return !!this._optimizePath([resourceName, resourceId]);
    }

    public setItem(resourceName:string, resourceId:any, resource:any) {
        this.set([resourceName, resourceId], resource);
    }

    public getItem(resourceName:string, resourceId:any) {
        return this.get([resourceName, resourceId]);
    }

    public setItems(resourceName:string, items:any) {
        this.set([resourceName], items);
    }

    public getItems(resourceName:string) {
        return this.get([resourceName]);
    }

    public countItems(resourceName:string):number {
        return this.getItems(resourceName).length;
    }

    public removeItems(resourceName:string) {
        this.unset([resourceName]);
    }

    public removeItem(resourceName:string, resourceId:number) {
        this.unset([resourceName, resourceId]);
    }

    public getReferences(resourceName:string):Reference[] {

        return _.map(this._data[resourceName], (item:any, resourceId:any) => {

            return new Reference(resourceName, resourceId);
        });
    }

    public merge(graph:Graph) {
        this.mergeData(graph.getData());
    }

    public mergeData(data:any) {

        _.each(data, (resources:any, resourceName:string) => {

            _.each(resources, (item, resourceId) => {

                var currentItem = this.getItem(resourceName, resourceId);

                if (!currentItem) {
                    this.setItem(resourceName, resourceId, item);
                }
                else {
                    this.setItem(resourceName, resourceId, _.extend(currentItem, item));
                }
            });
        });
    }

    protected _isReference(value:any):boolean {
        return (value && value.$type && value.$type == "ref");
    }

    protected _extractReferences(data, callback) {

        if (!_.isObject(data)) {
            return;
        }

        _.each(data, value => {

            if (this._isReference(value)) {

                var reference = <Reference>value;

                value = this.getValue(reference.value);

                this._extractReferences(value, callback);

                callback(reference);

            } else {

                this._extractReferences(value, callback);
            }
        });
    }

    protected _resolveValueRecursive(parentKey, key, value, callback?:any) {

        if (this._isReference(value)) {
            return this.get(value.value, callback);
        }

        if (_.isArray(value)) {

            value = _.map(value, (subValue, subKey) => {
                return this._resolveValueRecursive(key, subKey, subValue, callback);
            });
        }
        else if (_.isObject(value)) {

            value = _.mapObject(value, (subValue, subKey) => {
                return this._resolveValueRecursive(key, subKey, subValue, callback);
            });

            if (this._isResourceName(key)) {
                value = _.values(value);
            }
        }

        if (_.isObject(value) && !_.isArray(value) && callback) {

            if (this._isResourceName(key)) {
                value = callback(key, value);
            } else if (this._isResourceName(parentKey)) {
                value = callback(parentKey, value);
            }
        }

        return value;
    }

    protected _isResourceName(resourceName:string):boolean {
        return (this._data[resourceName] !== void 0);
    }
}
