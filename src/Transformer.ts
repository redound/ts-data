import BaseObject from "ts-core/lib/BaseObject";
import Text from "ts-core/lib/Utils/Text";

export interface TransformerInterface {
    new():Transformer;
    item(data);
    collection(data);
}

export default class Transformer extends BaseObject {

    public availableIncludes = [];

    public transformRequest(data) {
        return data;
    }

    public transform(item) {
        return item;
    }

    public collection(data) {

        if (!data) {
            return null;
        }

        return _.map(data, item => this.item(item));
    }

    public item(data) {

        if (!data) {
            return null;
        }

        var result = this.transform(data);

        _.each(this.availableIncludes, (include:any) => {

            var includeMethod = 'include' + Text.ucFirst(include);

            if (result[include] && this[includeMethod]) {
                result[include] = this[includeMethod](result);
            }
        });

        return result;
    }

    public static collection(data) {
        var transformer = new this;
        return transformer.collection(data);
    }

    public static item(data) {
        var transformer = new this;
        return transformer.item(data);
    }

    public static transformRequest(data) {
        var transformer = new this;
        return transformer.transformRequest(data);
    }
}
