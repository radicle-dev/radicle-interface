import { Seed } from "@app/base/seeds/Seed";

import SeedAddress from "./SeedAddress.svelte";

describe("SeedAddress", () => {
  it("shows the seed emoji and seed host", () => {
    const seed = new Seed({
      host: "seed.cloudhead.io",
      id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
    });

    cy.mount(SeedAddress, {
      props: {
        seed,
        port: 8776,
      },
    });
    cy.get("span.seed-icon").should("have.text", "🌱");
    cy.contains("seed.cloudhead.io")
      .should("have.attr", "href", "/seeds/seed.cloudhead.io")
      .should("be.visible");
  });

  it("shows the full seed id", () => {
    const seed = new Seed({
      host: "seed.cloudhead.io",
      id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
    });
    cy.mount(SeedAddress, {
      props: {
        seed,
        port: 8776,
        full: true,
      },
    });
    cy.get("span.seed-icon").should("have.text", "🌱");
    cy.get("body")
      .contains("hydkkk…coygh1@seed.cloudhead.io")
      .should("be.visible");
    cy.get("body").contains(":8776").should("be.visible");
  });
});
