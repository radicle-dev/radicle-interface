import SeedAddress from "./SeedAddress.svelte";
import { mount } from "cypress-svelte-unit-test";
import { styles } from "@test/support/index";

describe('SeedAddress', function () {
  it("Renders correctly", () => {
    mount(SeedAddress, {
      props: {
        id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
        host: "seed.cloudhead.io",
        port: 8776
      }
    }, styles);
    cy.findByText("hydkkk…coygh1@seed.cloudhead.io").should("exist").should("have.attr", "href", "/seeds/seed.cloudhead.io");
    cy.findByText(":8776").should("exist");
    cy.findByText("Copy").should("exist");
  });

  it("Copies seed address correctly", () => {
    cy.findByText("Copy").click().should("exist");
    cy.findByText("Copy ✓").should("have.attr", "disabled");
    // We invoke the cy.window here since doing the clipboard action in the runner window, would throw an error
    cy.window().its("navigator.clipboard").invoke("readText").should("equal", "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1@seed.cloudhead.io:8776");
    cy.wait(4000);
    cy.findByText("Copy").click().should("exist").should("not.have.attr", "disabled");
  });
});
