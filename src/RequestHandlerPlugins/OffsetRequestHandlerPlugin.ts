import {RequestHandlerPluginInterface} from "../RequestHandlerPluginInterface";
import {RequestHandlerFeatures} from "../RequestHandler";
import Query from "../Query/Query";
import RequestOptions from "../Http/RequestOptions";

export default class OffsetRequestHandlerPlugin implements RequestHandlerPluginInterface {

    public execute(requestOptions:RequestOptions, query:Query<any>):RequestHandlerFeatures[] {

        if (query.hasOffset()) {
            requestOptions.param('offset', query.getOffset());
        }

        return [RequestHandlerFeatures.OFFSET];
    }
}
