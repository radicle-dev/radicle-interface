import type { Config } from '@app/config';

export async function get(path: string, config: Config): Promise<any | null> {
  if (! config.seed.api) return null;

  const url = `${config.seed.api}/v1/${path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (! response.ok) {
      return null;
    }
    return response.json();
  } catch {
    throw new ApiError(url, "API request failed");
  }
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
