/// <reference types="cypress" />

describe('Landing Page', () => {
  it('Checks if orgs and user get loaded', () => {
    cy.visit("/");

    // Checking that cloudhead shows up as user
    cy.contains('cloudhead');
    cy.contains('641e – 97fF');

    // Checking that the alt-clients shows up as safe with 3 members
    cy.contains("alt-clients");
    cy.contains("3 members");

    // Check that the blurp shows up correctly
    cy.contains("Radicle 🌱 is a Web3 network for software collaboration. Radicle provides truly 👌 decentralized infrastructure for developer communities 🧙, enabling anyone to fund 💸 and manage software using NFTs 🍬 and multi-sigs 🖊️.");

    // Check that Connect button is in Idle/Disconnected state
    cy.get(".connect").contains("Connect");

    cy.screenshot();
  });
  it("Search Query", () => {
    // Search for a user with his ENS name and assert pathname
    cy.get(".search input").type("cloudhead{enter}").location().should((loc) => {
      expect(loc.pathname).to.eq("/users/0x641eDB587867a703E132a4210d63e93C52AA97fF");
    });

    // Search for a user with his ENS name and assert pathname
    cy.get(".search input").clear().type("0x641eDB587867a703E132a4210d63e93C52AA97fF{enter}").location().should((loc) => {
      expect(loc.pathname).to.eq("/users/0x641eDB587867a703E132a4210d63e93C52AA97fF");
    });

    // Search for non existant user and assert registration prompt window
    cy.get(".search input").clear().type("ghandi{enter}");
    cy.contains("ghandi.radicle.eth");
    cy.contains("The name ghandi is not registered.");

    // Search for org with ENS name and assert pathname
    cy.get(".search input").clear().type("alt-clients{enter}").location().should((loc) => {
      expect(loc.pathname).to.eq("/orgs/0x8152237402E0f194176154c3a6eA1eB99b611482");
    });
    cy.get(".search input").clear().type("0x8152237402E0f194176154c3a6eA1eB99b611482{enter}").location().should((loc) => {
      expect(loc.pathname).to.eq("/orgs/0x8152237402E0f194176154c3a6eA1eB99b611482");
    });
  });
});
