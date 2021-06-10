import type { Config } from '@app/config';

export async function get(path: string, config: Config): Promise<any | null> {
  if (! config.seed.api) return null;

  const response = await fetch(`${config.seed.api}/v1/${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (! response.ok) {
    return null;
  }
  return response.json();
}
