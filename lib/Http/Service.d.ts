import RequestOptions from "./RequestOptions";
export default class Service {
    protected $http: ng.IHttpService;
    protocol: string;
    hostname: string;
    defaultHeaders: any;
    constructor($http: ng.IHttpService);
    setProtocol(protocol: string): void;
    setHostname(hostname: string): void;
    setDefaultHeader(name: any, value: any): void;
    unsetDefaultHeader(name: any): void;
    request(requestOptions: RequestOptions): ng.IHttpPromise<any>;
    private _applyDefaults(requestOptions);
}
