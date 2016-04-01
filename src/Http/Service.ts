import RequestOptions from "./RequestOptions";
import * as _ from "underscore";

export default class Service {

    public protocol:string;
    public hostname:string;
    public defaultHeaders:any = {};

    public constructor(protected $http:ng.IHttpService) {

    }

    public setProtocol(protocol:string) {
        this.protocol = protocol;
    }

    public setHostname(hostname:string) {
        this.hostname = hostname;
    }

    public setDefaultHeader(name, value) {
        this.defaultHeaders[name] = value;
    }

    public unsetDefaultHeader(name) {
        delete this.defaultHeaders[name];
    }

    public request(requestOptions:RequestOptions):ng.IHttpPromise<any> {

        requestOptions = this._applyDefaults(requestOptions);
        var requestConfig = requestOptions.getRequestConfig();
        return this.$http(requestConfig);
    }

    private _applyDefaults(requestOptions:RequestOptions) {

        _.each(this.defaultHeaders, (value, name) => {
            requestOptions.header(name, value);
        });

        var relativeUrl = requestOptions.getUrl();
        requestOptions.url(this.protocol + this.hostname + relativeUrl);

        return requestOptions;
    }
}
