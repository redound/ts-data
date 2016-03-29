export default class RequestOptions {
    protected _headers: ng.IHttpRequestConfigHeaders;
    protected _method: string;
    protected _url: string;
    protected _data: {};
    protected _options: {};
    protected _params: {};
    header(name: any, value: any): this;
    removeHeader(name: any): this;
    getHeaders(): ng.IHttpRequestConfigHeaders;
    method(method: string): this;
    getMethod(): string;
    url(url: string, params?: {}): this;
    private _interpolateUrl(url, params?);
    private _popFirstKey(source, key);
    private _popKey(object, key);
    getUrl(): string;
    data(data: {}): this;
    getData(): {};
    option(name: string, value?: any): this;
    getOptions(): {};
    param(name: string, value?: any): this;
    getParams(): any;
    getRequestConfig(): ng.IRequestConfig;
    static factory(): RequestOptions;
    static get(url?: string, urlParams?: {}): RequestOptions;
    static post(url?: string, urlParams?: {}, data?: {}): RequestOptions;
    static put(url?: string, urlParams?: {}, data?: {}): RequestOptions;
    static delete(url?: string, urlParams?: {}): RequestOptions;
}