import Search from "./Search.svelte";
import { mount } from "radicle-svelte-unit-test";
import { styles } from "@test/support/index";

describe('Search', function () {
  it("Renders correctly", () => {
    mount(Search, {}, styles);
    cy.get("input").should("exist");
    cy.get("input").should("have.attr", "placeholder", "Search a name or address...");
  });

  it("Search input displays and navigates correctly", () => {
    mount(Search, {}, styles);
    cy.get("input").type("cloudhead{enter}");
    cy.get("input").should("have.value", "cloudhead");
    cy.url().should("contain", "/resolver/query?q=cloudhead");
  });
});
