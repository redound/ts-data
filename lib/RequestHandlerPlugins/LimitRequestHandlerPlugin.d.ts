import { RequestHandlerPluginInterface } from "../RequestHandlerPluginInterface";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import { RequestHandlerFeatures } from "../RequestHandler";
export default class LimitRequestHandlerPlugin implements RequestHandlerPluginInterface {
    execute(requestOptions: RequestOptions, query: Query<any>): RequestHandlerFeatures[];
}
