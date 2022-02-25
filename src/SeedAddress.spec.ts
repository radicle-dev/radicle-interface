import SeedAddress from "./SeedAddress.svelte";
import { mount } from "radicle-svelte-unit-test";
import { styles } from "@test/support/index";

describe('SeedAddress', function () {
  it("Renders correctly", () => {
    mount(SeedAddress, {
      props: {
        seed: {
          id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
          host: "seed.cloudhead.io",
        },
        port: 8776
      }
    }, styles);
    cy.findByText("seed.cloudhead.io").should("exist").should("have.attr", "href", "/seeds/seed.cloudhead.io");
  });
});
