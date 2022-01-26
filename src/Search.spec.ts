import Search from "./Search.svelte";
import { mount } from "cypress-svelte-unit-test";
import { cssFile } from "@test/support/styles";

describe('Search', function () {
  it("Renders correctly", () => {
    mount(Search, {}, cssFile);
    cy.get("input").should("exist");
    cy.get("input").should("have.attr", "placeholder", "Search a name or address...");
    cy.get("input").type("cloudhead{enter}");
    cy.url().should("contain", "/resolver/query?q=cloudhead");
  });
  it("Search input displays and navigates correctly", () => {
    mount(Search, {}, cssFile);
    cy.get("input").type("cloudhead{enter}");
    cy.get("input").should("have.value", "cloudhead");
    cy.url().should("contain", "/resolver/query?q=cloudhead");
  });
});
