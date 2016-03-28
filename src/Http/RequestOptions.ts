import {default as HttpMethods} from "./HttpMethods";

export default class RequestOptions {

    protected _headers:ng.IHttpRequestConfigHeaders;
    protected _method:string;
    protected _url:string;
    protected _data:{};
    protected _options:{};
    protected _params:{};

    public header(name, value) {
        this._headers = this._headers || {};
        this._headers[name] = value;
        return this;
    }

    public removeHeader(name) {
        delete this._headers[name];
        return this;
    }

    public getHeaders() {
        return this._headers;
    }

    public method(method:string) {
        this._method = method;
        return this;
    }

    public getMethod() {
        return this._method;
    }

    public url(url:string, params?:{}) {
        this._url = this._interpolateUrl(url, params);
        return this;
    }

    private _interpolateUrl(url:string, params:{} = {}) {

        params = (params || {});

        // Strip out the delimiter fluff that is only there for readability
        // of the optional label paths.
        url = url.replace(/(\(\s*|\s*\)|\s*\|\s*)/g, "");

        // Replace each label in the URL (ex, :userID).
        url = url.replace(/:([a-z]\w*)/gi, ($0, label) => {
            return (this._popFirstKey(params, label) || "");
        });

        // Strip out any repeating slashes (but NOT the http:// version).
        url = url.replace(/(^|[^:])[\/]{2,}/g, "$1/");

        // Strip out any trailing slash.
        url = url.replace(/\/+$/i, "");

        return url;
    }

    /**
     * Perform a popKey() action on source that contains the given key.
     * @param source
     * @param key
     * @returns {*}
     * @private
     */
    private _popFirstKey(source, key) {

        if (source.hasOwnProperty(key)) {

            return this._popKey(source, key);
        }
    }

    /**
     * Delete the key from the given object and return the value.
     * @param object
     * @param key
     * @returns {*}
     * @private
     */
    private _popKey(object, key) {

        var value = object[key];
        delete(object[key]);
        return (value);
    }

    public getUrl() {
        return this._url;
    }

    public data(data:{}) {
        this._data = data;
        return this;
    }

    public getData() {
        return this._data;
    }

    public option(name:string, value?:any) {
        this._options = this._options || {};
        this._options[name] = value;
        return this;
    }

    public getOptions() {
        return this._options;
    }

    public param(name:string, value?:any) {
        this._params = this._params || {};
        this._params[name] = value;
        return this;
    }

    public getParams():any {
        return this._params;
    }

    public getRequestConfig():ng.IRequestConfig {

        return _.extend({
            headers: this.getHeaders(),
            method: this.getMethod(),
            url: this.getUrl(),
            data: this.getData(),
            params: this.getParams()
        }, this.getOptions());
    }

    public static factory() {
        return new RequestOptions;
    }

    public static get(url?:string, urlParams?:{}) {
        var request = new RequestOptions;
        request.method(HttpMethods.GET);
        request.url(url, urlParams);
        return request;
    }

    public static post(url?:string, urlParams?:{}, data?:{}) {
        var request = new RequestOptions;
        request.method(HttpMethods.POST);
        request.url(url, urlParams);
        request.data(data);
        return request;
    }

    public static put(url?:string, urlParams?:{}, data?:{}) {
        var request = new RequestOptions;
        request.method(HttpMethods.PUT);
        request.url(url, urlParams);
        request.data(data);
        return request;
    }

    public static delete(url?:string, urlParams?:{}) {
        var request = new RequestOptions;
        request.method(HttpMethods.DELETE);
        request.url(url, urlParams);
        return request;
    }
}
