import type { BaseUrl } from "@httpd-client";

import configJson from "@app/config.json";

export interface Config {
  nodes: {
    fallbackPublicExplorer: string;
    defaultHttpdPort: number;
    defaultHttpdHostname: string;
    defaultLocalHttpdPort: number;
    defaultNodePort: number;
    defaultHttpdScheme: string;
    pinned: { baseUrl: BaseUrl }[];
  };
  fallbackPreferredSeed: BaseUrl;
}

function getConfig(): Config {
  if (window.VITEST) {
    return {
      nodes: {
        fallbackPublicExplorer: "https://app.radicle.xyz/nodes/$host/$rid$path",
        defaultHttpdHostname: "127.0.0.1",
        defaultHttpdPort: 8081,
        defaultLocalHttpdPort: 8081,
        defaultHttpdScheme: "http",
        defaultNodePort: 8776,
        pinned: [],
      },
      fallbackPreferredSeed: {
        hostname: "seed.radicle.garden",
        port: 443,
        scheme: "https",
      },
    };
  } else if (window.PLAYWRIGHT) {
    return window.APP_CONFIG;
  } else {
    // In dev and production environments we use data from config.json.
    return configJson;
  }
}

export const config = getConfig();
