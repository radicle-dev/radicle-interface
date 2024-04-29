// This module provides low-level capabilities to interact with a typed
// JSON HTTP API.

import type { ZodIssue, ZodType, TypeOf } from "zod";

export interface BaseUrl {
  hostname: string;
  port: number;
  scheme: string;
}

// Error that is thrown by `Fetcher` methods.
export class ResponseError extends Error {
  public method: string;
  public url: string;
  public status: number;
  public body: unknown;

  public constructor(method: string, response: Response, body_: unknown) {
    const body: any = body_;
    if (
      typeof body === "object" &&
      body !== null &&
      typeof body.message === "string"
    ) {
      super(body.message);
    } else {
      super("Response error");
    }

    this.method = method;
    this.body = body_;
    this.status = response.status;
    this.url = response.url;
  }
}

// Error that is thrown by `Fetcher` methods when parsing the response
// body fails.
export class ResponseParseError extends Error {
  public method: string;
  public body: unknown;
  public zodIssues: ZodIssue[];
  public path?: string;

  public constructor(
    method: string,
    body: unknown,
    zodIssues: ZodIssue[],
    path?: string,
  ) {
    super("Failed to parse response body");
    this.method = method;
    this.path = path;
    this.body = body;
    this.zodIssues = zodIssues;
  }
}

export interface RequestOptions {
  abort?: AbortSignal;
}

export interface FetchParams {
  method: Method;
  // Path to append to the `Fetcher`s base URL to get the final URL.
  path?: string;
  // Object that is serialized into JSON and sent as the data.
  body?: unknown;
  // Query parameters to be serialized with URLSearchParams.
  query?: Record<string, string | number | boolean>;
  options?: RequestOptions;
  headers?: Record<string, string>;
}

type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export class Fetcher {
  #baseUrl: BaseUrl;

  public constructor(baseUrl: BaseUrl) {
    this.#baseUrl = baseUrl;
  }

  // Execute a fetch and parse the result with the provided schema.
  // Return the parsed payload.
  //
  // Throws `ResponseError` if the response status code is not `200`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async fetchOk<T extends ZodType<any>>(
    params: FetchParams,
    schema: T,
  ): Promise<TypeOf<T>> {
    const response = await this.fetch({
      ...params,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      query: { ...params.query, bust_cache: "1" },
    });

    if (!response.ok) {
      let responseBody = await response.text();
      try {
        responseBody = JSON.parse(responseBody);
      } catch (_e: unknown) {
        // We keep the original text response body.
      }
      throw new ResponseError(params.method, response, responseBody);
    }

    const responseBody = await response.json();
    const result = schema.safeParse(responseBody);
    if (result.success) {
      return result.data;
    } else {
      throw new ResponseParseError(
        params.method,
        responseBody,
        result.error.errors,
        params.path,
      );
    }
  }

  private async fetch({
    method,
    path,
    body,
    options = {},
    query,
    headers = {},
  }: FetchParams): Promise<Response> {
    if (body !== undefined && headers["content-type"] === undefined) {
      headers["content-type"] = "application/json";
    }

    const pathSegment = path === undefined ? "" : `/${path}`;

    let url = `${this.#baseUrl.scheme}://${this.#baseUrl.hostname}:${this.#baseUrl.port}/api/v1${pathSegment}`;

    if (query) {
      const searchparams = new URLSearchParams(query as Record<string, string>);
      url = `${url}?${searchparams.toString()}`;
    }
    return globalThis.fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.abort,
    });
  }
}
