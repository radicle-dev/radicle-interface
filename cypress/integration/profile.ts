/// <reference types="cypress" />

describe('Registrations', () => {
  it("Check if able to register name", () => {
    cy.visit("/registrations");

    cy.get("main input").type("sebastinez");
    cy.get("button.register").click();

    cy.contains("sebastinez.radicle.eth");
    cy.contains("This name is not available for registration.");

    cy.contains("Back").click();

    cy.get("main input").type("ghandi");
    cy.get(".register").click();

    cy.contains("ghandi.radicle.eth");
    cy.contains("The name ghandi is available for 10.0 RAD.");
  });
  it('Checks if user profile page gets loaded', () => {
    cy.visit("registrations/cloudhead");

    cy.contains("cloudhead.radicle.eth");
    cy.contains("0x641eDB587867a703E132a4210d63e93C52AA97fF");
    cy.contains("0xeeE2DF7abdaDe3340954b1bcbE33800190af1fC2");
    cy.contains("https://cloudhead.io");
    cy.contains("https://cloudhead.io/avatar.png");
    cy.contains("seed.cloudhead.io");
    cy.contains("hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1");
    cy.contains("eip155:1:0xceaa01bd5a428d2910c82bbefe1bc7a8cc6207d9");

    cy.screenshot();
  });
});
