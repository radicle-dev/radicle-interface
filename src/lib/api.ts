import { defaultSeedPort } from "@app/lib/seed";

export interface Host {
  host: string;
  port: number | null;
}

export class Request {
  path: string;
  base: string;
  protocol: string;
  port: number;

  constructor(path: string, api: Host) {
    this.port = api.port || defaultSeedPort;
    this.base = api.host + "/api";
    this.path = path.startsWith("/") ? path.slice(1) : path;
    this.protocol = api.host === "0.0.0.0" ? "http://" : "https://";
  }

  async get(
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const query = this.formatParams(params);
    const search = new URLSearchParams(query).toString();
    const urlString = this.createUrl(search);

    return await Request.exec(urlString, {
      method: "GET",
      headers: { ...headers, Accept: "application/json" },
    });
  }

  async post(
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const body = this.formatParams(params);
    const urlString = this.createUrl();

    return await Request.exec(urlString, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  async put(
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
  ): Promise<any> {
    const body = this.formatParams(params);
    const urlString = this.createUrl();

    return await Request.exec(urlString, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // Executes a request and returns the response.
  static async exec(
    urlString: string,
    props: Record<string, any>,
  ): Promise<any> {
    let response = null;
    try {
      response = await fetch(urlString, props);
    } catch (err) {
      throw new ApiError("API request failed", urlString);
    }

    if (!response.ok) {
      throw new ApiError(response.statusText, urlString);
    }
    return response.json();
  }

  // Filters out undefined and null values.
  private formatParams(params: Record<string, any>): Record<string, string> {
    const query: Record<string, string> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        query[key] = val.toString();
      }
    }

    return query;
  }

  // Creates a URL with an eventual query string and port.
  private createUrl(search?: string): string {
    const baseUrl = this.path
      ? `${this.protocol}${this.base}/v1/${this.path}`
      : `${this.protocol}${this.base}`;

    const url = new URL(search ? `${baseUrl}?${search}` : baseUrl);
    url.port = String(this.port);
    return String(url);
  }
}

export class ApiError extends Error {
  url?: string;

  constructor(message: string, url?: string) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = "ApiError";
    this.url = url;
  }
}
