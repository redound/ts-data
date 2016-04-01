import {RequestHandlerPluginInterface} from "../RequestHandlerPluginInterface";
import RequestOptions from "../Http/RequestOptions";
import Query from "../Query/Query";
import {RequestHandlerFeatures} from "../RequestHandler";
import {SortDirections} from "../Query/Sorter";
import * as _ from "underscore";

export default class SortRequestHandlerPlugin implements RequestHandlerPluginInterface {

    public execute(requestOptions:RequestOptions, query:Query<any>):RequestHandlerFeatures[] {


        if (query.hasSorters()) {

            var sorters = query.getSorters();

            var sort = {};

            _.each(sorters, sorter => {

                var field = sorter.getField();
                var direction = sorter.getDirection();

                sort[field] = direction === SortDirections.DESCENDING ? -1 : 1;
            });

            requestOptions.param('sort', JSON.stringify(sort));
        }

        return [RequestHandlerFeatures.SORTERS];
    }
}
