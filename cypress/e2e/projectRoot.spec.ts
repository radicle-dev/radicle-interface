/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
import { MockProvider } from "@rsksmart/mock-web3-provider";

describe("project meta", () => {
  it("displays the correct project information", () => {
    cy.intercept("https://willow.radicle.garden:8777/", {
      fixture: "projectHome.json",
    }).as("projectHome");
    cy.intercept("https://willow.radicle.garden:8777/v1/peer", {
      fixture: "projectPeer.json",
    }).as("projectPeer");
    cy.intercept(
      "https://willow.radicle.garden:8777/v1/projects/bright-forest-protocol",
      { fixture: "projectInfo.json" },
    ).as("projectInfo");
    cy.intercept(
      "https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes",
      { fixture: "projectRemotes.json" },
    ).as("projectRemotes");
    cy.intercept(
      "https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/56e4e029c294b08546386e1fb706b772c7433c49",
      { fixture: "projectTree56e4e02.json" },
    ).as("projectTree56e4e02");
    cy.intercept(
      "https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/56e4e029c294b08546386e1fb706b772c7433c49",
      { fixture: "projectReadme.json" },
    ).as("projectReadme");
    cy.visit("/seeds/willow.radicle.garden:8777/bright-forest-protocol", {
      onBeforeLoad(win) {
        const address = "0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D";
        const privateKey =
          "de926db3012af759b4f24b5a51ef6afa397f04670f634aa4f48d4480417007f3";
        win.ethereum = new MockProvider({
          address,
          privateKey,
          networkVersion: 1,
        });
      },
    });
    cy.wait([
      "@projectHome",
      "@projectPeer",
      "@projectInfo",
      "@projectRemotes",
      "@projectTree56e4e02",
    ]);
    cy.get("div.title").contains("bright-forest-protocol");
    cy.get("div.urn").contains("rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy");
    cy.get("div.description").contains("bfc-sc");
    cy.get("div.column-right article div.markdown h1").should(
      "have.text",
      "Basic Sample Hardhat Project",
    );
  });
});
