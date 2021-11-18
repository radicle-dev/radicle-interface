/// <reference types="cypress" />

describe('Users', () => {
  it('Checks if user page gets loaded', () => {
    cy.visit("/users/cloudhead.radicle.eth");

    cy.contains("cloudhead");
    cy.contains("https://cloudhead.io");

    cy.contains("0x641eDB587867a703E132a4210d63e93C52AA97fF");
    cy.contains("0xceAa01bd5A428d2910C82BBEfE1Bc7a8Cc6207D9");
    cy.contains("cloudhead.radicle.eth");

    cy.contains("alt-clients");
    cy.contains("ceAa – 07D9");

    cy.contains("cloudhead.io");
    cy.contains("My personal homepage");
    cy.contains("commit af38d41c8758959329891cc3b7b0e16a5654b626");
    cy.contains("rad:git:hnrkehankrg4owmaohjxr5gug3u3fpdnd3hxo");

    cy.screenshot();
  });
});
