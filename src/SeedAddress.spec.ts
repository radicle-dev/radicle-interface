import { Seed } from "@app/base/seeds/Seed";
import { getConfig } from "@app/config";

import SeedAddress from "./SeedAddress.svelte";

describe("SeedAddress", () => {
  it("shows the seed emoji and seed host", () => {
    getConfig().then(cfg => {
      const seed = new Seed(
        {
          host: "seed.cloudhead.io",
          id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
        },
        cfg,
      );

      cy.mount(SeedAddress, {
        props: {
          seed,
        },
      });
      cy.get("span.seed-icon").should("have.text", "🐱");
      cy.contains("seed.cloudhead.io")
        .should("have.attr", "href", "/seeds/seed.cloudhead.io")
        .should("be.visible");
    });
  });
});
