import { Seed } from "./base/seeds/Seed";
import SeedAddress from "./SeedAddress.svelte";
import { test } from "vitest";
import { render } from "@testing-library/svelte";

const seed = new Seed({ host: "seed.mock.io", id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1" }, {
  seed: {
    api: { port: 8777 },
    git: { port: 8777 },
    link: { port: 8777 }
  },
  seeds: {
    pinned: {
      "willow.radicle.garden": { emoji: "🌳" }
    }
  }
} as any); // We cast Config here to any because we only need a partial config, but Partial does not work well.

test("mount component", async () => {
  render(SeedAddress, { props: {
    seed,
    port: 8776,
    full: true
  } });
});
