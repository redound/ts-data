import {RequestHandlerPluginInterface} from "../Api/RequestHandlerPluginInterface";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import {RequestHandlerFeatures} from "../Api/RequestHandler";

export default class ExcludeRequestHandlerPlugin implements RequestHandlerPluginInterface {

    public execute(requestOptions:RequestOptions, query:Query<any>):RequestHandlerFeatures[] {

        if (query.hasExcludes()) {

            var excludes = query.getExcludes();

            var exclude = excludes.join(',');

            requestOptions.param('exclude', exclude);
        }

        return [RequestHandlerFeatures.EXCLUDES];
    }
}
