import type { Config } from '@app/config';

export async function get(
  path: string,
  params: Record<string, any>,
  config: Config
): Promise<any> {
  if (! config.seed.host) {
    throw new Error("Seed host unavailable");
  }

  const query: Record<string, string> = {};
  for (const [key, val] of Object.entries(params)) {
    query[key] = val.toString();
  }

  const base = config.seed.host;
  const port = config.seed.api.port;
  const search = new URLSearchParams(query).toString();
  const baseUrl = `https://${base}:${port}/v1/${path}`;
  const url = search ? `${baseUrl}?${search}` : baseUrl;

  let response = null;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
  } catch (err) {
    throw new ApiError(url, "API request failed");
  }

  if (! response.ok) {
    throw new ApiError(url, "Not found");
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
