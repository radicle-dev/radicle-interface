/// <reference types="cypress" />

describe('Orgs', () => {
  it('Checks if orgs get loaded', () => {
    cy.visit("/orgs");

    cy.contains("upstream");
    cy.contains("4 members");

    cy.contains("eth");
    cy.contains("7C78 – e33b");

    cy.screenshot();
  });
  it('Checks that the org view page is shown correctly', () => {
    cy.visit("/orgs/alt-clients.radicle.eth");

    // Check that the profile of a org is shown correctly
    cy.contains("alt-clients");
    cy.contains("https://app.radicle.network");
    cy.contains("0x8152237402E0f194176154c3a6eA1eB99b611482");
    cy.contains("0xCEaB094641905C209CC796FC8037dd9ECc87ca2f");
    cy.contains("hyyqpn…uofmeo@seed.alt-clients.radicle.xyz:8776");
    cy.contains("1 of 3");
    cy.contains("alt-clients.radicle.eth");

    // Show the org members with their resolved profiles
    cy.contains("cloudhead");
    cy.contains("cloudhead.eth");
    cy.contains("sebastinez");

    // Show projects with their corresponding metadata
    cy.contains("radicle-client-tools");
    cy.contains("Radicle CLI tools");
    cy.contains("commit 45ea57d0ac7f21166ed8344568db584232987317");
    cy.contains("rad:git:hnrkyghsrokxzxpy9pww69xr11dr9q7edbxfo");

    cy.screenshot();
  });
});
