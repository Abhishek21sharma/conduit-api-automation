import { APIRequestContext } from "playwright";
import { test } from "playwright/test";
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
  private defaultAuthToken: string;
  private clearAuthFlag: boolean = false;

  /**
   *
   * @param request
   * @param apiBaseUrl
   * @param logger
   * @param authTOken : additional token param (Non mandatory) added later to compensate passing
   * token directly to different API methods
   */
  constructor(
    request: APIRequestContext,
    apiBaseUrl: string,
    logger: APILogger,
    authTOken: string = "",
  ) {
    this.request = request;
    this.defaultBaseURL = apiBaseUrl;
    this.logger = logger;
    this.defaultAuthToken = authTOken;
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
  clearAuth() {
    this.clearAuthFlag = true;
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
    let responseJSON: any;

    //BEST PRACTICE FOR BETTER REPORTING
    await test.step(`Get Request call ${url}`, async () => {
      this.logger.logRequest("GET", url, this.getHeaders());
      const response = await this.request.get(url, {
        headers: this.getHeaders(),
      });
      this.cleanupFields();
      const actualStatus = response.status();
      responseJSON = await response.json();
      this.logger.logResponse(actualStatus, responseJSON);
      this.statusCodeValidator(actualStatus, statusCode, this.getRequest);
    });

    return responseJSON;
  }

  async postRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("POST", url, this.getHeaders(), this.apiBody);
    const response = await this.request.post(url, {
      headers: this.getHeaders(),
      data: this.apiBody,
    });
    this.cleanupFields();
    const actualStatus = response.status();
    const responseJSON = await response.json();
    this.logger.logResponse(actualStatus, responseJSON);
    this.statusCodeValidator(actualStatus, statusCode, this.postRequest);
    return responseJSON;
  }

  async putRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("PUT", url, this.apiHeaders, this.apiBody);
    const response = await this.request.put(url, {
      headers: this.apiHeaders,
      data: this.apiBody,
    });
    this.cleanupFields();

    const actualStatus = response.status();
    const responseJSON = await response.json();
    this.logger.logResponse(actualStatus, responseJSON);
    this.statusCodeValidator(actualStatus, statusCode, this.putRequest);
    return responseJSON;
  }

  async delRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("DEL", url, this.apiHeaders);
    const response = await this.request.delete(url, {
      headers: this.apiHeaders,
    });
    this.cleanupFields();
    this.logger.logResponse(response.status());
    const actualStatus = response.status();
    this.statusCodeValidator(actualStatus, statusCode, this.delRequest);
  }

  /**
   * @description custome method for validations
   * @param actualStatus
   * @param expectedStatus
   * @param callingMethod
   */
  private statusCodeValidator(
    actualStatus: number,
    expectedStatus: number,
    callingMethod: Function,
  ) {
    if (actualStatus !== expectedStatus) {
      const logs = this.logger.getRecentLogs();
      //this will be used to upload to playwright report automatically..
      const error = new Error(
        `Expected status ${expectedStatus} but got ${actualStatus}\n\nRecent API logs: \n ${logs}`,
      );
      //this line will point to the calling methods..
      Error.captureStackTrace(error, callingMethod);
      //we have to throw the error
      throw error;
    }
  }

  private getHeaders() {
    if (!this.clearAuthFlag) {
      this.apiHeaders["Authorization"] =
        this.apiHeaders["Authorization"] || this.defaultAuthToken;
    }
    return this.apiHeaders;
  }

  private cleanupFields() {
    this.apiBody = {};
    this.apiHeaders = {};
    this.baseURL = undefined;
    this.apiPath = "";
    this.queryParams = {};
    this.clearAuthFlag = false;
  }
}
