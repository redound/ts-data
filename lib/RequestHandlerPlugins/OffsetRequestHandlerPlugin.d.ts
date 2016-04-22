import { RequestHandlerPluginInterface } from "../Api/RequestHandlerPluginInterface";
import { RequestHandlerFeatures } from "../Api/RequestHandler";
import Query from "../Query/Query";
import RequestOptions from "../Http/RequestOptions";
export default class OffsetRequestHandlerPlugin implements RequestHandlerPluginInterface {
    execute(requestOptions: RequestOptions, query: Query<any>): RequestHandlerFeatures[];
}
