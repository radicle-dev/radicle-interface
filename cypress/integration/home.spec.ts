/// <reference types="cypress" />
import { MockExtensionProvider } from "../support";

describe("Landing page", () => {
  it("Loads user, orgs and seeds", () => {
    cy.intercept("https://willow.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://pine.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://pine.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://maple.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://maple.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://gateway.thegraph.com/api/1758a78ae257ad4906f9c638e4a68c19/subgraphs/id/0x2f0963e77ca6ac0c2dad1bf4147b6b40e0dd8728-0", {
      "data": { "safe": null }
    });
    cy.intercept("https://maple.radicle.garden:8777/v1/projects", { fixture: "projectList.json" });
    cy.intercept("https://pine.radicle.garden:8777/v1/projects", { fixture: "projectList.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects", { fixture: "projectList.json" });
    cy.visit("/", {
      onBeforeLoad(win) {
        win.ethereum = new MockExtensionProvider();
      },
    });
    cy.get("div.card-label")
      .first()
      .should("have.text", "willow.radicle.garden")
      .next()
      .should("have.text", "1 project(s)");
  });
});
