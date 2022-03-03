import SeedAddress from "./SeedAddress.svelte";
import { render } from "@testing-library/svelte";
import "@public/index.css";

describe('SeedAddress', function () {
  it("shows the seed emoji and seed host", () => {
    render(SeedAddress, {
      props: {
        seed: {
          id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
          emoji: "🐱",
          host: "seed.cloudhead.io",
        },
        port: 8776
      }
    });
    cy.get("span.seed-icon").should("have.text", "🐱");
    cy.findByText("seed.cloudhead.io").should("have.attr", "href", "/seeds/seed.cloudhead.io").should("be.visible");
  });

  it("shows the full seed id", () => {
    render(SeedAddress, {
      props: {
        seed: {
          id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
          emoji: "🐱",
          host: "seed.cloudhead.io",
        },
        port: 8776,
        full: true
      }
    });
    cy.get("span.seed-icon").should("have.text", "🐱");
    cy.findByText("hydkkk…coygh1@seed.cloudhead.io").should("be.visible");
    cy.findByText(":8776").should("be.visible");
  });
});
