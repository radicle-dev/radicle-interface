import configJson from "@app/config.json";

export interface Config {
  walletConnect: { bridge: string };
  reactions: string[];
  seeds: {
    pinned: { host: string; emoji: string }[];
  };
  projects: {
    pinned: {
      name: string;
      urn: string;
      seed: string;
    }[];
  };
}

function getConfig(): Config {
  if (window.VITEST) {
    return {
      walletConnect: { bridge: "" },
      reactions: [],
      seeds: {
        pinned: [],
      },
      projects: { pinned: [] },
    };
  } else if (window.PLAYWRIGHT) {
    return window.APP_CONFIG;
  } else {
    // In dev and production environments we use data from config.json.
    return configJson;
  }
}

export const config = getConfig();
