import type { BaseUrl } from "@http-client";
import type { ErrorRoute } from "@app/lib/router/definitions";

import * as seeds from "@app/lib/seeds";
import config from "virtual:config";
import { api, httpdStore } from "@app/lib/httpd";
import { get } from "svelte/store";

export interface HomeRoute {
  resource: "home";
}

export interface HomeLoadedRoute {
  resource: "home";
  params: { configPreferredSeeds: BaseUrl[] };
}

export async function loadHomeRoute(): Promise<HomeLoadedRoute | ErrorRoute> {
  if (get(httpdStore).state !== "stopped") {
    const profile = await api.profile.getProfile();
    const newValue = profile.config.preferredSeeds.map(seed => {
      const preferredSeedValue = seed?.split("@")[1];
      const preferredSeedOrigin = preferredSeedValue?.split(":")[0];

      return {
        hostname: preferredSeedOrigin,
        port: config.nodes.defaultHttpdPort,
        scheme: config.nodes.defaultHttpdScheme,
      };
    });
    if (get(seeds.configuredPreferredSeeds).length === 0) {
      seeds.addSeedsToConfiguredSeeds(newValue);
    }

    return {
      resource: "home",
      params: { configPreferredSeeds: newValue },
    };
  }

  return {
    resource: "home",
    params: { configPreferredSeeds: [] },
  };
}
