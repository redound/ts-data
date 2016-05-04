import Reference from "./Reference";
import * as _ from "underscore";
import Dictionary from "ts-core/lib/Data/Dictionary";

export default class Graph {

    protected _data:any;
    protected _createdEntitiesCache: Dictionary<string, any> = new Dictionary<string, any>();

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

    public get(path?:any[], creationCallback?:any) {

        this._createdEntitiesCache.clear();

        path = this._optimizePath(path);

        if(path == null || path.length == 0){
            return null;
        }

        var value = this._getValueForPath(path);

        // 1. Determine required references
        var references = this._getUniqueReferences(value);
        var rootReferences = [];

        if(path.length == 1){

            _.each(value, (item, key) => {
                rootReferences.push(new Reference(path[0], key));
            });
        }
        else if (path.length == 2){

            rootReferences.push(new Reference(path[0], path[1]));
        }

        references = references.concat(rootReferences);


        // 2. Create entities
        _.each(references, (reference: Reference) => {

            var referenceKey = reference.value.join(':');

            if(this._createdEntitiesCache.contains(referenceKey)){
                return;
            }

            var referenceValue = this._getValueForPath(reference.value);

            if(!referenceValue){

                this._createdEntitiesCache.set(referenceKey, null);
                return;
            }

            // Remove references
            var parsedValue = _.clone(referenceValue);
            _.each(referenceValue, (val, key) => {

                var isReference = this._isReference(val);
                if(!isReference && _.isArray(val)){

                    _.each(val, (valItem) => {

                        if(!isReference && this._isReference(valItem)){
                            isReference = true;
                        }
                    })
                }

                if(isReference){
                    delete parsedValue[key];
                }
            });

            var entity = creationCallback ? creationCallback(reference.value[0], parsedValue) : parsedValue;
            this._createdEntitiesCache.set(referenceKey, entity);
        });


        // 3. Connect entities
        this._resolveValueRecursive(null, rootReferences, (refPathKey) => {

            return this._createdEntitiesCache.get(refPathKey);
        });

        return path.length == 1 ? rootReferences : _.first(rootReferences);
    }

    protected _resolveValueRecursive(subject, rootValue, callback?:any) {

        var resolvedPaths = [];

        var resolve = (subject, value, key) => {

            if (this._isReference(value) && key !== null) {

                var pathKey = value.value.join(':');

                var resolvedItem = callback(pathKey, value.value);
                subject[key] = resolvedItem;

                if(!_.contains(resolvedPaths, pathKey)) {

                    resolvedPaths.push(pathKey);
                    resolve(resolvedItem, _.clone(this._getValueForPath(value.value)), null);
                }
            }
            else if (_.isArray(value)) {

                _.each(value, (itemVal, itemIndex) => {

                    resolve(value, _.clone(itemVal), itemIndex);
                });

                if(key !== null && subject[key] == undefined){
                    subject[key] = value;
                }
            }
            else if (_.isObject(value)) {

                _.each(value, (itemVal, itemKey) => {

                    resolve(subject, _.clone(itemVal), itemKey);
                });
            }
        };

        resolve(subject, rootValue, null);
    }

    public getValue(path?:any[]) {

        path = this._optimizePath(path);

        return this._getValueForPath(path);
    }

    public getGraphForPath(path:any[]):Graph {

        var graph = new Graph();
        var value = this.getValue(path);

        var donePaths = [];

        var callback = reference => {

            var referencePath = reference.value;
            var pathString = referencePath.join(':');

            if(!_.contains(donePaths, pathString)) {

                donePaths.push(pathString);

                var referenceValue = this.getValue(referencePath);
                this._extractReferences(referenceValue, callback);

                if (referenceValue) {
                    graph.set(referencePath, referenceValue);
                }
            }
        };

        this._extractReferences(value, callback);

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
        this._createdEntitiesCache.clear();

        return this;
    }

    public has(path: any[]){
        return !!this._optimizePath(path);
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
        return this.has([resourceName, resourceId]);
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
        
                var currentItem = this._getValueForPath([resourceName, resourceId]);
        
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

                callback(<Reference>value);

            } else {

                this._extractReferences(value, callback);
            }
        });
    }

    protected _getUniqueReferences(data): Reference[] {

        var donePaths = [];
        var references = [];

        var callback = reference => {

            var referencePath = reference.value;
            var pathString = referencePath.join(':');

            if(!_.contains(donePaths, pathString)) {

                donePaths.push(pathString);
                references.push(reference);

                var referenceValue = this.getValue(referencePath);
                this._extractReferences(referenceValue, callback);
            }
        };

        this._extractReferences(data, callback);

        return references;
    }

    protected _isResourceName(resourceName:string):boolean {
        return (this._data[resourceName] !== void 0);
    }
}
