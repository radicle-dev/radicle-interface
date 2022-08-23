/// <reference types="cypress" />
import { MockExtensionProvider } from "../support/e2e";

describe("Landing page", () => {
  it("Loads projects", () => {
    cy.intercept("https://willow.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://pine.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://pine.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://maple.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://maple.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://maple.radicle.garden:8777/v1/projects/*", { fixture: "projectInfo.json" });
    cy.intercept({ pathname: "/v1/projects/*" }, { fixture: "projectInfo.json" });
    cy.visit("/", {
      onBeforeLoad(win) {
        win.ethereum = new MockExtensionProvider("homestead", "0x3256a804085C24f3451cAb2C98a37e16DEEc5721");
      },
    });
    cy.get(".project .name")
      .first()
      .should("have.text", "bright-forest-protocol");
  });
});
