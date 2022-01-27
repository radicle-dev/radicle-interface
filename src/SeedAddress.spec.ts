import SeedAddress from "./SeedAddress.svelte";
import { mount } from "cypress-svelte-unit-test";
import { cssFile } from "@test/support/styles";

describe('Search', function () {
  it("Renders correctly", () => {
    mount(SeedAddress, {
      props: {
        id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
        host: "seed.cloudhead.io",
        port: 8776
      }
    },
    {
      ...cssFile,
      html: `
        <div class="fields">
          <div class="label">Seed</div>
          <div id="here"></div>
        </div>
      `,
      style: `
        .fields {
          display: grid;
          grid-template-columns: 5rem 4fr;
          grid-gap: 1rem 2rem;
        }
        #here {
          display: flex;
          flex-direction: row;
        }
        button {
          margin-left: 4rem;
        }
      `
    });
    cy.get("[data-cy=seed-address]").should("have.text", "hydkkk…coygh1@seed.cloudhead.io");
    cy.get("[data-cy=seed-port]").should("have.text", ":8776");
    cy.get("[data-cy=seed-btn]").should("have.text", "Copy");
    cy.get("a").should("have.attr", "href", "/seeds/seed.cloudhead.io");
  });
  it("Copies seed address correctly", () => {
    // We query the cy.window here since doing the clipboard action in the runner window, would throw an error
    cy.get("[data-cy=seed-btn]").click().should("have.text", "Copy ✓");
    cy.get("[data-cy=seed-btn]").should("have.attr", "disabled");
    cy.window().its("navigator.clipboard").invoke("readText").should("equal", "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1@seed.cloudhead.io:8776");
    cy.wait(4000);
    cy.get("[data-cy=seed-btn]").click().should("have.text", "Copy");
    cy.get("[data-cy=seed-btn]").should("not.have.attr", "disabled");
  });
});
