/// <reference types="cypress" />

describe('Projects', () => {
  it('Checks if a project linked to a org loads', () => {
    cy.visit("/orgs/0x8152237402e0f194176154c3a6ea1eb99b611482/projects/rad:git:hnrkyghsrokxzxpy9pww69xr11dr9q7edbxfo/f3002a8a8125c8a70584f7612bd437ac1081c454");

    // Check that metadata of project checks out.
    cy.contains("radicle-client-tools");
    cy.contains("rad:git:hnrkyghsrokxzxpy9pww69xr11dr9q7edbxfo");
    cy.contains("Radicle CLI tools");
    cy.contains("✨ Command-line client tooling for Radicle.");

    // Check that a not anchored state commit can be toggled to the latest anchor by clicking on "not anchored".
    cy.contains("not anchored").click();
    cy.contains("anchored");

    // Do some path navigation and file content checking.
    cy.contains("Cargo.toml").click();
    cy.contains(`name = "radicle-tools"`);
    cy.contains("abis").click();
    cy.contains("account").click();
    cy.contains("Cargo.toml").click();
    cy.contains(`name = "rad-account"`);
  });
});
