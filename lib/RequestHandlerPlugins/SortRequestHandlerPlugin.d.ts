import { RequestHandlerPluginInterface } from "../Api/RequestHandlerPluginInterface";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import { RequestHandlerFeatures } from "../Api/RequestHandler";
export default class SortRequestHandlerPlugin implements RequestHandlerPluginInterface {
    execute(requestOptions: RequestOptions, query: Query<any>): RequestHandlerFeatures[];
}
