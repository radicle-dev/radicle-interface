export interface Host {
  host: string;
  port: number | null;
}

export async function get(
  path: string,
  params: Record<string, any>,
  api: Host
): Promise<any> {
  const query: Record<string, string> = {};
  for (const [key, val] of Object.entries(params)) {
    query[key] = val.toString();
  }

  const base = api.host;
  const port = api.port;
  const search = new URLSearchParams(query).toString();
  // Allow using the functionality with local runned http-api
  const isLocalhost = /^0.0.0.0$/.test(base);
  const protocol = isLocalhost ? "http://" : "https://";

  path = path.startsWith("/") ? path.slice(1) : path;

  const baseUrl = path
    ? `${protocol}${base}/v1/${path}`
    : `${protocol}${base}`;
  const url = new URL(search ? `${baseUrl}?${search}` : baseUrl);
  url.port = String(port);

  const urlString = String(url);
  let response = null;
  try {
    response = await fetch(urlString, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
  } catch (err) {
    throw new ApiError(urlString, "API request failed");
  }

  if (! response.ok) {
    throw new ApiError(urlString, "Not found");
  }
  return response.json();
}

class ApiError extends Error {
  url: string;

  constructor(url: string, message: string) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = "ApiError";
    this.url = url;
  }
}
