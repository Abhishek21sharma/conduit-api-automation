import { APIRequestContext } from "playwright";
import { expect } from "playwright/test";
import { APILogger } from "./logger";

export class RequestHandler {
  private request: APIRequestContext;
  private baseURL?: string;
  private defaultBaseURL: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiHeaders: Record<string, string> = {};
  private apiBody: object = {};
  private logger: APILogger;

  constructor(
    request: APIRequestContext,
    apiBaseUrl: string,
    logger: APILogger,
  ) {
    this.request = request;
    this.defaultBaseURL = apiBaseUrl;
    this.logger = logger;
  }

  url(url: string) {
    this.baseURL = url;
    return this;
  }
  path(path: string) {
    this.apiPath = path;
    return this;
  }
  params(params: object) {
    this.queryParams = params;
    return this;
  }
  headers(headers: Record<string, string>) {
    this.apiHeaders = headers;
    return this;
  }
  body(body: object) {
    this.apiBody = body;
    return this;
  }

  /**
   * @description: A private method to build the compelte URL with path and query params
   * URL() - using this in-built node method to construct params...
   */
  private getUrl() {
    const url = new URL(
      `${this.baseURL ?? this.defaultBaseURL}${this.apiPath}`,
    );
    for (const [k, v] of Object.entries(this.queryParams)) {
      url.searchParams.append(k, v);
    }
    return url.toString();
  }

  /**
   * @author - Abhishek S.
   * @description - to send a get request
   * @param - statusCode: number
   * @useage - it will build the url, add headers if any, and send the request
   */
  async getRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("GET", url, this.apiHeaders);
    const response = await this.request.get(url, {
      headers: this.apiHeaders,
    });
    const actualStatus = response.status();
    const responseJSON = await response.json();
    this.logger.logResponse(actualStatus, responseJSON);
    expect(actualStatus).toEqual(statusCode);
    return responseJSON;
  }

  async postRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.post(url, {
      headers: this.apiHeaders,
      data: this.apiBody,
    });
    expect(response.status()).toEqual(statusCode);
    const responseJSON = await response.json();
    return responseJSON;
  }

  async putRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.put(url, {
      headers: this.apiHeaders,
      data: this.apiBody,
    });
    expect(response.status()).toEqual(statusCode);
    const responseJSON = await response.json();
    return responseJSON;
  }

  async delRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.delete(url, {
      headers: this.apiHeaders,
    });
    expect(response.status()).toEqual(statusCode);
  }
}
