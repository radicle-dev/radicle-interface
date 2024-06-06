import type { BaseUrl } from "@http-client";

import storedWritable from "@efstajas/svelte-stored-writable";
import unionBy from "lodash/unionBy";
import { array, number, string, object } from "zod";
import { derived } from "svelte/store";

import config from "virtual:config";

const preferredSeedSchema = object({
  hostname: string(),
  port: number(),
  scheme: string(),
});

export const configuredPreferredSeeds = storedWritable<BaseUrl[]>(
  "configuredPreferredSeeds",
  array(preferredSeedSchema),
  [],
);
const storedPreferredSeed = storedWritable<BaseUrl | undefined>(
  "preferredSeed",
  preferredSeedSchema,
  undefined,
);

export function addSeedsToConfiguredSeeds(newSeeds: BaseUrl[]) {
  configuredPreferredSeeds.update(seeds =>
    unionBy(seeds, newSeeds, "hostname"),
  );
}

export function selectPreferredSeed(seed: BaseUrl) {
  storedPreferredSeed.set(seed);
}

export function removeSeedFromConfiguredSeeds(seedHostname: string) {
  configuredPreferredSeeds.update(
    seeds => seeds.filter(s => s.hostname !== seedHostname) ?? seeds,
  );
}

export const preferredSeeds = derived(
  [configuredPreferredSeeds, storedPreferredSeed],
  ([configuredPreferredSeeds, storedPreferredSeed]) => {
    // No configured preferred seeds
    if (configuredPreferredSeeds.length === 0)
      return {
        selected: config.fallbackPreferredSeed,
        seeds: [config.fallbackPreferredSeed],
      };

    // No stored preferred seed
    if (!storedPreferredSeed)
      return {
        selected: configuredPreferredSeeds[0],
        seeds: configuredPreferredSeeds,
      };

    // Stored preferred seed not configured
    if (
      !configuredPreferredSeeds.some(
        seed => seed.hostname === storedPreferredSeed.hostname,
      )
    )
      return {
        selected: configuredPreferredSeeds[0],
        seeds: configuredPreferredSeeds,
      };

    return {
      selected: storedPreferredSeed,
      seeds: configuredPreferredSeeds,
    };
  },
);
