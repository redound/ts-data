import {RequestHandlerPluginInterface} from "../RequestHandlerPluginInterface";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import {RequestHandlerFeatures} from "../RequestHandler";

export default class LimitRequestHandlerPlugin implements RequestHandlerPluginInterface {

    public execute(requestOptions:RequestOptions, query:Query<any>):RequestHandlerFeatures[] {

        if (query.hasLimit()) {
            requestOptions.param('limit', query.getLimit());
        }

        return [RequestHandlerFeatures.LIMIT];
    }
}
