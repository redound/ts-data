import Graph from "../Graph/Graph";
import Reference from "../Graph/Reference";
export interface DataSourceResponseMetaInterface {
    total?: number;
}
export interface DataSourceResponseInterface {
    meta: DataSourceResponseMetaInterface;
    graph: Graph;
    references: Reference[];
}
