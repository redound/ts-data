import {RequestHandlerPluginInterface} from "../Api/RequestHandlerPluginInterface";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import {RequestHandlerFeatures} from "../Api/RequestHandler";

export default class IncludeRequestHandlerPlugin implements RequestHandlerPluginInterface {

    public execute(requestOptions:RequestOptions, query:Query<any>):RequestHandlerFeatures[] {

        if (query.hasIncludes()) {

            var includes = query.getIncludes();

            var include = includes.join(',');

            requestOptions.param('include', include);
        }

        return [RequestHandlerFeatures.INCLUDES];
    }
}
