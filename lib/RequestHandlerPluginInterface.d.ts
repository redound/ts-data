import RequestOptions from "./Http/RequestOptions";
import { RequestHandlerFeatures } from "./RequestHandler";
import Query from "./Query/Query";
export interface RequestHandlerPluginInterface {
    execute(requestOptions: RequestOptions, query: Query<any>): RequestHandlerFeatures[];
}
